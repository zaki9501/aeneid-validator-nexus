   // server.js
   const express = require('express');
   const fetch = require('node-fetch');
   const app = express();
   const PORT = 3001;

   // Add CORS headers for all routes
   app.use((req, res, next) => {
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
     res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
     // Handle preflight requests
     if (req.method === 'OPTIONS') {
       return res.status(204).end();
     }
     next();
   });

   // Base API URLs
   const STORYSCAN_API = 'https://api-aeneid.storyscan.app';
   const ITROCKET_API = 'https://api-story-testnet.itrocket.net';
   
   // Load validator configuration
   let VALIDATOR_NODES = {};
   let GEOLOCATION_CONFIG = {};
   let MONITORING_CONFIG = {};
   
   try {
     const config = require('./validator-config.js');
     VALIDATOR_NODES = config.VALIDATOR_NODES || {};
     GEOLOCATION_CONFIG = config.GEOLOCATION || {};
     MONITORING_CONFIG = config.MONITORING || {};
     console.log('Loaded validator configuration:', Object.keys(VALIDATOR_NODES));
   } catch (error) {
     console.log('No validator configuration found, using default settings');
     // Default configuration
     VALIDATOR_NODES = {
       'storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv': {
         rpcEndpoint: 'http://localhost:26657',
         apiEndpoint: 'http://localhost:1317',
         p2pEndpoint: 'http://localhost:26656',
         externalIP: null,
         customLocation: null
       }
     };
     GEOLOCATION_CONFIG = {
       enabled: true,
       services: ['ipapi.co', 'ipinfo.io', 'ipgeolocation.io'],
       cacheDuration: 5 * 60 * 1000
     };
     MONITORING_CONFIG = {
       enabled: true,
       checkInterval: 30 * 1000,
       requestTimeout: 5000,
       verboseLogging: true
     };
   }

   // Cache for validator data to avoid excessive API calls
   const validatorDataCache = new Map();
   const CACHE_DURATION = GEOLOCATION_CONFIG.cacheDuration || 5 * 60 * 1000; // 5 minutes default

   // Function to get IP address from validator node
   async function getValidatorIPAddress(validatorAddress) {
     try {
       const nodeConfig = VALIDATOR_NODES[validatorAddress];
       if (!nodeConfig) {
         console.log(`No node configuration found for ${validatorAddress}`);
         return null;
       }

       // Try to get IP from RPC endpoint
       try {
         const response = await fetch(`${nodeConfig.rpcEndpoint}/status`, {
           timeout: 5000,
           headers: {
             'Accept': 'application/json',
           }
         });
         
         if (response.ok) {
           const data = await response.json();
           // Extract IP from node info or connection details
           if (data.result?.node_info?.listen_addr) {
             const listenAddr = data.result.node_info.listen_addr;
             const ipMatch = listenAddr.match(/(\d+\.\d+\.\d+\.\d+)/);
             if (ipMatch) {
               return ipMatch[1];
             }
           }
         }
       } catch (error) {
         console.log(`RPC endpoint not accessible for ${validatorAddress}:`, error.message);
       }

       // Try to get IP from P2P endpoint
       try {
         const response = await fetch(`${nodeConfig.p2pEndpoint}/net_info`, {
           timeout: 5000,
           headers: {
             'Accept': 'application/json',
           }
         });
         
         if (response.ok) {
           const data = await response.json();
           if (data.result?.listeners && data.result.listeners.length > 0) {
             const listener = data.result.listeners[0];
             const ipMatch = listener.match(/(\d+\.\d+\.\d+\.\d+)/);
             if (ipMatch) {
               return ipMatch[1];
             }
           }
         }
       } catch (error) {
         console.log(`P2P endpoint not accessible for ${validatorAddress}:`, error.message);
       }

       return null;
     } catch (error) {
       console.error(`Error getting IP for ${validatorAddress}:`, error);
       return null;
     }
   }

   // Function to get real-time location data from IP
   async function getLocationFromIP(ipAddress) {
     try {
       if (!ipAddress) return null;

       // Use configured geolocation services or fallback to defaults
       const defaultServices = [
         `https://ipapi.co/${ipAddress}/json/`,
         `https://ipinfo.io/${ipAddress}/json`,
         `https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ipAddress}`,
       ];
       
       const services = GEOLOCATION_CONFIG.services || defaultServices;

       for (const service of services) {
         try {
           const response = await fetch(service, {
             timeout: 5000,
             headers: {
               'Accept': 'application/json',
               'User-Agent': 'Aeneid-Validator-Nexus/1.0'
             }
           });

           if (response.ok) {
             const data = await response.json();
             
             // Parse response based on service
             if (service.includes('ipapi.co')) {
               return {
                 country: data.country_name || 'Unknown',
                 region: data.region || 'Unknown',
                 city: data.city || 'Unknown',
                 latitude: parseFloat(data.latitude) || null,
                 longitude: parseFloat(data.longitude) || null,
                 timezone: data.timezone || 'Unknown',
                 provider: {
                   name: data.org || 'Unknown',
                   type: 'ISP',
                   asn: data.asn ? parseInt(data.asn) : null,
                   isp: data.org || 'Unknown'
                 }
               };
             } else if (service.includes('ipinfo.io')) {
               return {
                 country: data.country || 'Unknown',
                 region: data.region || 'Unknown',
                 city: data.city || 'Unknown',
                 latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : null,
                 longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : null,
                 timezone: data.timezone || 'Unknown',
                 provider: {
                   name: data.org || 'Unknown',
                   type: 'ISP',
                   asn: data.asn ? parseInt(data.asn) : null,
                   isp: data.org || 'Unknown'
                 }
               };
             } else if (service.includes('ipgeolocation.io')) {
               return {
                 country: data.country_name || 'Unknown',
                 region: data.state_prov || 'Unknown',
                 city: data.city || 'Unknown',
                 latitude: parseFloat(data.latitude) || null,
                 longitude: parseFloat(data.longitude) || null,
                 timezone: data.time_zone?.name || 'Unknown',
                 provider: {
                   name: data.isp || 'Unknown',
                   type: 'ISP',
                   asn: data.asn ? parseInt(data.asn) : null,
                   isp: data.isp || 'Unknown'
                 }
               };
             }
           }
         } catch (error) {
           console.log(`Service ${service} failed:`, error.message);
           continue;
         }
       }

       return null;
     } catch (error) {
       console.error('Error getting location from IP:', error);
       return null;
     }
   }

   // Function to get validator node status and performance data
   async function getValidatorNodeStatus(validatorAddress) {
     try {
       const nodeConfig = VALIDATOR_NODES[validatorAddress];
       if (!nodeConfig) return null;

       const statusData = {};

       // Get node status from RPC
       try {
         const response = await fetch(`${nodeConfig.rpcEndpoint}/status`, {
           timeout: 5000,
           headers: {
             'Accept': 'application/json',
           }
         });

         if (response.ok) {
           const data = await response.json();
           statusData.rpcStatus = data.result;
         }
       } catch (error) {
         console.log(`RPC status check failed for ${validatorAddress}:`, error.message);
       }

       // Get validator info from API
       try {
         const response = await fetch(`${nodeConfig.apiEndpoint}/cosmos/staking/v1beta1/validators/${validatorAddress}`, {
           timeout: 5000,
           headers: {
             'Accept': 'application/json',
           }
         });

         if (response.ok) {
           const data = await response.json();
           statusData.validatorInfo = data.validator;
         }
       } catch (error) {
         console.log(`API validator info check failed for ${validatorAddress}:`, error.message);
       }

       // Get signing info
       try {
         const response = await fetch(`${nodeConfig.apiEndpoint}/cosmos/slashing/v1beta1/signing_infos/${validatorAddress}`, {
           timeout: 5000,
           headers: {
             'Accept': 'application/json',
           }
         });

         if (response.ok) {
           const data = await response.json();
           statusData.signingInfo = data.val_signing_info;
         }
       } catch (error) {
         console.log(`Signing info check failed for ${validatorAddress}:`, error.message);
       }

       return statusData;
     } catch (error) {
       console.error(`Error getting node status for ${validatorAddress}:`, error);
       return null;
     }
   }

   app.get('/api/blocks', async (req, res) => {
     try {
       console.log('Fetching blocks from upstream API...');
       const response = await fetch(`${STORYSCAN_API}/blocks`, {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch blocks',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched blocks. Count:', Array.isArray(data) ? data.length : 'N/A');
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch blocks',
         details: error.message 
       });
     }
   });

   // Fetch all validators with detailed information
   app.get('/api/validators', async (req, res) => {
     try {
       console.log('Fetching validators from upstream API...');
       const { offset = 0, limit = 100, isActive } = req.query;
       
       let url = `${STORYSCAN_API}/validators?offset=${offset}&limit=${limit}`;
       if (isActive !== undefined) {
         url += `&isActive=${isActive}`;
       }

       const response = await fetch(url, {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch validators',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched validators. Count:', data.items?.length || 0);
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch validators',
         details: error.message 
       });
     }
   });

   // Fetch single validator by address
   app.get('/api/validators/:address', async (req, res) => {
     try {
       const { address } = req.params;
       console.log('Fetching validator details for:', address);
       
       const response = await fetch(`${STORYSCAN_API}/validators/${address}`, {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch validator',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched validator details');
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch validator',
         details: error.message 
       });
     }
   });

   // Fetch validator location and provider information
   app.get('/api/validators/:address/location', async (req, res) => {
     try {
       const { address } = req.params;
       console.log('Fetching validator location for:', address);
       
       // Try to get location data from multiple sources
       const locationData = await getValidatorLocation(address);
       res.json(locationData);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch validator location',
         details: error.message 
       });
     }
   });

   // Fetch real-time validator node status and performance data
   app.get('/api/validators/:address/node-status', async (req, res) => {
     try {
       const { address } = req.params;
       console.log('Fetching validator node status for:', address);
       
       const nodeStatus = await getValidatorNodeStatus(address);
       if (nodeStatus) {
         res.json({
           validatorAddress: address,
           nodeStatus,
           lastUpdated: new Date().toISOString(),
           source: 'real-time-node-data'
         });
       } else {
         res.status(404).json({ 
           error: 'Validator node not found or not accessible',
           validatorAddress: address
         });
       }
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch validator node status',
         details: error.message 
       });
     }
   });

   // Fetch comprehensive validator data including real-time location and node status
   app.get('/api/validators/:address/comprehensive', async (req, res) => {
     try {
       const { address } = req.params;
       console.log('Fetching comprehensive validator data for:', address);
       
       // Get location data
       const locationData = await getValidatorLocation(address);
       
       // Get node status data
       const nodeStatus = await getValidatorNodeStatus(address);
       
       // Get validator info from upstream API
       let validatorInfo = null;
       try {
         const validatorResponse = await fetch(`${STORYSCAN_API}/validators/${address}`, {
           headers: {
             'Accept': 'application/json',
             'User-Agent': 'Node.js Proxy Server'
           }
         });
         
         if (validatorResponse.ok) {
           validatorInfo = await validatorResponse.json();
         }
       } catch (error) {
         console.log('Failed to fetch validator info from upstream API:', error.message);
       }
       
       const comprehensiveData = {
         validatorAddress: address,
         location: locationData,
         nodeStatus,
         validatorInfo,
         lastUpdated: new Date().toISOString(),
         source: 'comprehensive-validator-data'
       };
       
       res.json(comprehensiveData);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch comprehensive validator data',
         details: error.message 
       });
     }
   });

   // New endpoint for hourly performance data
   app.get('/api/validators/:address/hourly-performance', async (req, res) => {
     try {
       const { address } = req.params;
       
       // Get current UTC time
       const now = new Date();
       const currentHour = now.getUTCHours();
       const currentDay = now.getUTCDate();
       const currentMonth = now.getUTCMonth();
       const currentYear = now.getUTCFullYear();
       
       // Get validator's uptime blocks
       const uptimeResponse = await fetch(`${STORYSCAN_API}/blocks/uptime/${address}`);
       if (!uptimeResponse.ok) {
         throw new Error(`Failed to fetch uptime data: ${uptimeResponse.status}`);
       }
       const uptimeData = await uptimeResponse.json();
       
       // Initialize hourly performance data
       const hourlyPerformance = [];
       
       for (let hour = 0; hour < 24; hour++) {
         const hourStart = new Date(Date.UTC(currentYear, currentMonth, currentDay, hour, 0, 0));
         const hourEnd = new Date(Date.UTC(currentYear, currentMonth, currentDay, hour, 59, 59));
         
         // Filter blocks for this hour (if we had timestamps)
         // For now, we'll simulate hourly data based on block distribution
         const totalBlocks = uptimeData.length;
         const blocksPerHour = Math.ceil(totalBlocks / 24);
         const startIndex = hour * blocksPerHour;
         const endIndex = Math.min(startIndex + blocksPerHour, totalBlocks);
         
         const hourBlocks = uptimeData.slice(startIndex, endIndex);
         const signedBlocks = hourBlocks.filter(block => block.signed).length;
         const totalHourBlocks = hourBlocks.length;
         
         const performance = {
           hour: hour.toString().padStart(2, '0') + ':00',
           signedBlocks,
           totalBlocks: totalHourBlocks,
           percentage: totalHourBlocks > 0 ? ((signedBlocks / totalHourBlocks) * 100).toFixed(1) : 0,
           status: hour <= currentHour ? 'completed' : 'future',
           timestamp: hourStart.toISOString()
         };
         
         hourlyPerformance.push(performance);
       }
       
       res.json({
         validatorAddress: address,
         currentHour: currentHour,
         currentTime: now.toISOString(),
         hourlyPerformance
       });
       
     } catch (error) {
       console.error('Error fetching hourly performance:', error);
       res.status(500).json({ error: 'Failed to fetch hourly performance data' });
     }
   });

   // Fetch network statistics
   app.get('/api/chain/network', async (req, res) => {
     try {
       console.log('Fetching network stats...');
       const response = await fetch(`${STORYSCAN_API}/chain/network`, {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch network stats',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched network stats');
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch network stats',
         details: error.message 
       });
     }
   });

   // Fetch tokenomics data
   app.get('/api/chain/tokenomics', async (req, res) => {
     try {
       console.log('Fetching tokenomics data...');
       const response = await fetch(`${STORYSCAN_API}/chain/tokenomics`, {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch tokenomics data',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched tokenomics data');
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch tokenomics data',
         details: error.message 
       });
     }
   });

   // Fetch slashing information
   app.get('/api/slashing/infos', async (req, res) => {
     try {
       const { offset = 0, limit = 100 } = req.query;
       console.log('Fetching slashing infos...');
       
       const response = await fetch(`${ITROCKET_API}/cosmos/slashing/v1beta1/signing_infos?pagination.offset=${offset}&pagination.limit=${limit}`, {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch slashing infos',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched slashing infos');
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch slashing infos',
         details: error.message 
       });
     }
   });

   // Helper function to get validator location and provider information
   async function getValidatorLocation(validatorAddress) {
     try {
       // Check cache first
       const cacheKey = `location_${validatorAddress}`;
       const cachedData = validatorDataCache.get(cacheKey);
       if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
         console.log(`Using cached location data for ${validatorAddress}`);
         return cachedData.data;
       }

       console.log(`Fetching real-time location data for ${validatorAddress}`);

       // Try to get real-time data from validator node
       const nodeConfig = VALIDATOR_NODES[validatorAddress];
       if (nodeConfig) {
         try {
           // Get IP address from validator node
           const ipAddress = await getValidatorIPAddress(validatorAddress);
           console.log(`IP address for ${validatorAddress}: ${ipAddress}`);

           if (ipAddress) {
             // Get real-time location data from IP
             const locationData = await getLocationFromIP(ipAddress);
             
             if (locationData) {
               const result = {
                 validatorAddress,
                 location: {
                   country: locationData.country,
                   region: locationData.region,
                   city: locationData.city,
                   latitude: locationData.latitude,
                   longitude: locationData.longitude,
                   timezone: locationData.timezone
                 },
                 provider: locationData.provider,
                 lastUpdated: new Date().toISOString(),
                 source: 'real-time-ip-geolocation',
                 ipAddress: ipAddress
               };

               // Cache the result
               validatorDataCache.set(cacheKey, {
                 data: result,
                 timestamp: Date.now()
               });

               console.log(`Real-time location data for ${validatorAddress}:`, result);
               return result;
             }
           }

           // Get node status data
           const nodeStatus = await getValidatorNodeStatus(validatorAddress);
           if (nodeStatus) {
             console.log(`Node status for ${validatorAddress}:`, nodeStatus);
           }

         } catch (error) {
           console.error(`Error getting real-time data for ${validatorAddress}:`, error);
         }
       }

       // Real validator location data from decentralization map
       const realValidatorLocationMap = {
         // Germany validators
         'FourPillars': {
           country: 'Germany',
           region: 'Hesse',
           city: 'Frankfurt am Main',
           latitude: 50.1187,
           longitude: 8.6842,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'AMAZON-02',
             type: 'Cloud Provider',
             asn: 16509,
             isp: 'Amazon.com, Inc.'
           }
         },
         '[NODERS]': {
           country: 'Germany',
           region: 'Bavaria',
           city: 'Nuremberg',
           latitude: 49.4419,
           longitude: 11.0797,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         'Alchemy': {
           country: 'Germany',
           region: 'Hesse',
           city: 'Unknown',
           latitude: 51.2993,
           longitude: 9.491,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         'polkachu': {
           country: 'Germany',
           region: 'Hesse',
           city: 'Unknown',
           latitude: 51.2993,
           longitude: 9.491,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         'node-story-aeneid-1': {
           country: 'Germany',
           region: 'Hesse',
           city: 'Frankfurt am Main',
           latitude: 50.1187,
           longitude: 8.6842,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'GOOGLE-CLOUD-PLATFORM',
             type: 'Cloud Provider',
             asn: 15169,
             isp: 'Google LLC'
           }
         },
         
         // Finland validators
         'aeneid': {
           country: 'Finland',
           region: 'Uusimaa',
           city: 'Helsinki',
           latitude: 60.1719,
           longitude: 24.9347,
           timezone: 'Europe/Helsinki',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         'ITRocket': {
           country: 'Finland',
           region: 'Uusimaa',
           city: 'Helsinki',
           latitude: 60.1797,
           longitude: 24.9344,
           timezone: 'Europe/Helsinki',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         'BlockPI': {
           country: 'Finland',
           region: 'Uusimaa',
           city: 'Helsinki',
           latitude: 60.1797,
           longitude: 24.9344,
           timezone: 'Europe/Helsinki',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         
         // United States validators
         'use1-aeneid-validator1': {
           country: 'United States',
           region: 'South Carolina',
           city: 'North Charleston',
           latitude: 32.8608,
           longitude: -79.9746,
           timezone: 'America/New_York',
           provider: {
             name: 'GOOGLE',
             type: 'Cloud Provider',
             asn: 15169,
             isp: 'Google LLC'
           }
         },
         'use1-aeneid-validator2': {
           country: 'United States',
           region: 'South Carolina',
           city: 'North Charleston',
           latitude: 32.8608,
           longitude: -79.9746,
           timezone: 'America/New_York',
           provider: {
             name: 'GOOGLE',
             type: 'Cloud Provider',
             asn: 15169,
             isp: 'Google LLC'
           }
         },
         'story-validator-story-client-0': {
           country: 'United States',
           region: 'Oregon',
           city: 'Boardman',
           latitude: 45.8234,
           longitude: -119.7257,
           timezone: 'America/Los_Angeles',
           provider: {
             name: 'AMAZON-02',
             type: 'Cloud Provider',
             asn: 16509,
             isp: 'Amazon.com, Inc.'
           }
         },
         
         // Austria validators
         'Auranode - Backup': {
           country: 'Austria',
           region: 'Vienna',
           city: 'Unknown',
           latitude: 48.2048,
           longitude: 16.3801,
           timezone: 'Europe/Vienna',
           provider: {
             name: 'Unknown',
             type: 'ISP',
             asn: null,
             isp: 'Unknown'
           }
         },
         
         // United Kingdom validators
         'Pro-Nodes75_testnet_archive': {
           country: 'United Kingdom',
           region: 'England',
           city: 'London',
           latitude: 51.5074,
           longitude: -0.1196,
           timezone: 'Europe/London',
           provider: {
             name: 'OVH SAS',
             type: 'Data Center',
             asn: 16276,
             isp: 'OVH SAS'
           }
         },
         
         // France validators
         'Everstake': {
           country: 'France',
           region: 'Île-de-France',
           city: 'Unknown',
           latitude: 48.8582,
           longitude: 2.3387,
           timezone: 'Europe/Paris',
           provider: {
             name: 'OVH SAS',
             type: 'Data Center',
             asn: 16276,
             isp: 'OVH SAS'
           }
         },
         
         // Poland validators
         'Cryptomolot': {
           country: 'Poland',
           region: 'Masovian',
           city: 'Warsaw',
           latitude: 52.2296,
           longitude: 21.0067,
           timezone: 'Europe/Warsaw',
           provider: {
             name: 'MEVSPACE sp. z o.o.',
             type: 'Data Center',
             asn: null,
             isp: 'MEVSPACE sp. z o.o.'
           }
         },
         
         // Singapore validators
         'bstg-ip-1': {
           country: 'Singapore',
           region: 'Central Region',
           city: 'Singapore',
           latitude: 1.2868,
           longitude: 103.8503,
           timezone: 'Asia/Singapore',
           provider: {
             name: 'AMAZON-02',
             type: 'Cloud Provider',
             asn: 16509,
             isp: 'Amazon.com, Inc.'
           }
         },
         
         // Canada validators
         'Pro-Nodes75_testnet': {
           country: 'Canada',
           region: 'Quebec',
           city: 'Beauharnois',
           latitude: 45.3161,
           longitude: -73.8736,
           timezone: 'America/Montreal',
           provider: {
             name: 'OVH SAS',
             type: 'Data Center',
             asn: 16276,
             isp: 'OVH SAS'
           }
         }
       };

       // Fallback to predefined location data for known validators
       const validatorLocationMap = {
         'storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv': {
           country: 'Germany',
           region: 'Hesse',
           city: 'Frankfurt',
           latitude: 50.1109,
           longitude: 8.6821,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'Hetzner Online GmbH',
             type: 'Data Center',
             asn: 24940,
             isp: 'Hetzner Online GmbH'
           }
         },
         'storyvaloper1lpxwzyluacfd0r45zkgvyu6fs9tuj9fqfkuza0': {
           country: 'Finland',
           region: 'Uusimaa',
           city: 'Helsinki',
           latitude: 60.1699,
           longitude: 24.9384,
           timezone: 'Europe/Helsinki',
           provider: {
             name: 'DigitalOcean',
             type: 'Cloud Provider',
             asn: 14061,
             isp: 'DigitalOcean, LLC'
           }
         },
         'storyvaloper1abc123def456ghi789jkl012mno345pqr678stu': {
           country: 'United States',
           region: 'California',
           city: 'San Francisco',
           latitude: 37.7749,
           longitude: -122.4194,
           timezone: 'America/Los_Angeles',
           provider: {
             name: 'Google Cloud Platform',
             type: 'Cloud Provider',
             asn: 15169,
             isp: 'Google LLC'
           }
         }
       };

       // Try to get validator info to find the moniker
       let validatorMoniker = null;
       try {
         const validatorResponse = await fetch(`${STORYSCAN_API}/validators/${validatorAddress}`, {
           headers: {
             'Accept': 'application/json',
             'User-Agent': 'Node.js Proxy Server'
           }
         });
         
         if (validatorResponse.ok) {
           const validatorData = await validatorResponse.json();
           validatorMoniker = validatorData.description?.moniker;
           console.log(`Found moniker for ${validatorAddress}: ${validatorMoniker}`);
         }
       } catch (error) {
         console.log(`Failed to fetch validator info for ${validatorAddress}:`, error.message);
       }

       // Check if we have real location data for this validator by moniker
       if (validatorMoniker && realValidatorLocationMap[validatorMoniker]) {
         const locationData = realValidatorLocationMap[validatorMoniker];
         const result = {
           validatorAddress,
           location: {
             country: locationData.country,
             region: locationData.region,
             city: locationData.city,
             latitude: locationData.latitude,
             longitude: locationData.longitude,
             timezone: locationData.timezone
           },
           provider: locationData.provider,
           lastUpdated: new Date().toISOString(),
           source: 'real-validator-location-map',
           moniker: validatorMoniker
         };

         // Cache the result
         validatorDataCache.set(cacheKey, {
           data: result,
           timestamp: Date.now()
         });

         console.log(`Using real location data for ${validatorMoniker}: ${locationData.country}, ${locationData.city}`);
         return result;
       }

       // Check if we have predefined location data for this validator
       if (validatorLocationMap[validatorAddress]) {
         const locationData = validatorLocationMap[validatorAddress];
         const result = {
           validatorAddress,
           location: {
             country: locationData.country,
             region: locationData.region,
             city: locationData.city,
             latitude: locationData.latitude,
             longitude: locationData.longitude,
             timezone: locationData.timezone
           },
           provider: locationData.provider,
           lastUpdated: new Date().toISOString(),
           source: 'validator-location-map'
         };

         // Cache the result
         validatorDataCache.set(cacheKey, {
           data: result,
           timestamp: Date.now()
         });

         return result;
       }

       // For unknown validators, generate location based on validator address hash
       const addressHash = validatorAddress.split('').reduce((a, b) => {
         a = ((a << 5) - a) + b.charCodeAt(0);
         return a & a;
       }, 0);

       // Use the hash to determine a realistic location
       const locations = [
         {
           country: 'Germany',
           region: 'Bavaria',
           city: 'Munich',
           latitude: 48.1351,
           longitude: 11.5820,
           timezone: 'Europe/Berlin',
           provider: {
             name: 'OVHcloud',
             type: 'Data Center',
             asn: 16276,
             isp: 'OVH SAS'
           }
         },
         {
           country: 'United States',
           region: 'Virginia',
           city: 'Ashburn',
           latitude: 39.0438,
           longitude: -77.4875,
           timezone: 'America/New_York',
           provider: {
             name: 'Amazon Web Services',
             type: 'Cloud Provider',
             asn: 16509,
             isp: 'Amazon.com, Inc.'
           }
         },
         {
           country: 'Singapore',
           region: 'Central Region',
           city: 'Singapore',
           latitude: 1.3521,
           longitude: 103.8198,
           timezone: 'Asia/Singapore',
           provider: {
             name: 'Alibaba Cloud',
             type: 'Cloud Provider',
             asn: 45102,
             isp: 'Alibaba (Singapore) Private Limited'
           }
         },
         {
           country: 'Netherlands',
           region: 'North Holland',
           city: 'Amsterdam',
           latitude: 52.3676,
           longitude: 4.9041,
           timezone: 'Europe/Amsterdam',
           provider: {
             name: 'Leaseweb',
             type: 'Data Center',
             asn: 60781,
             isp: 'Leaseweb Netherlands B.V.'
           }
         },
         {
           country: 'Canada',
           region: 'Ontario',
           city: 'Toronto',
           latitude: 43.6532,
           longitude: -79.3832,
           timezone: 'America/Toronto',
           provider: {
             name: 'Microsoft Azure',
             type: 'Cloud Provider',
             asn: 8075,
             isp: 'Microsoft Corporation'
           }
         },
         {
           country: 'United Kingdom',
           region: 'England',
           city: 'London',
           latitude: 51.5074,
           longitude: -0.1278,
           timezone: 'Europe/London',
           provider: {
             name: 'Linode',
             type: 'Cloud Provider',
             asn: 63949,
             isp: 'Linode, LLC'
           }
         },
         {
           country: 'Japan',
           region: 'Tokyo',
           city: 'Tokyo',
           latitude: 35.6762,
           longitude: 139.6503,
           timezone: 'Asia/Tokyo',
           provider: {
             name: 'Vultr',
             type: 'Cloud Provider',
             asn: 20473,
             isp: 'The Constant Company, LLC'
           }
         },
         {
           country: 'Australia',
           region: 'New South Wales',
           city: 'Sydney',
           latitude: -33.8688,
           longitude: 151.2093,
           timezone: 'Australia/Sydney',
           provider: {
             name: 'DigitalOcean',
             type: 'Cloud Provider',
             asn: 14061,
             isp: 'DigitalOcean, LLC'
           }
         }
       ];

       const selectedLocation = locations[Math.abs(addressHash) % locations.length];
       
       // Add some randomization to avoid all validators being at the exact same coordinates
       const latOffset = (Math.sin(addressHash) + 1) / 2 - 0.5;
       const lngOffset = (Math.cos(addressHash) + 1) / 2 - 0.5;
       
       const result = {
         validatorAddress,
         location: {
           country: selectedLocation.country,
           region: selectedLocation.region,
           city: selectedLocation.city,
           latitude: selectedLocation.latitude + (latOffset * 0.1), // Small offset
           longitude: selectedLocation.longitude + (lngOffset * 0.1), // Small offset
           timezone: selectedLocation.timezone
         },
         provider: selectedLocation.provider,
         lastUpdated: new Date().toISOString(),
         source: 'hash-based-generation'
       };

       // Cache the result
       validatorDataCache.set(cacheKey, {
         data: result,
         timestamp: Date.now()
       });

       return result;
     } catch (error) {
       console.error('Error getting validator location:', error);
       throw error;
     }
   }

   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
   });
