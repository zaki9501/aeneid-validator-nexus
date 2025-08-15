#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Aeneid Validator Nexus - Setup Script');
console.log('==========================================\n');

// Function to get user input
function askQuestion(question, defaultValue = '') {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question}${defaultValue ? ` (default: ${defaultValue})` : ''}: `, (answer) => {
      rl.close();
      resolve(answer || defaultValue);
    });
  });
}

async function setupValidator() {
  console.log('This script will help you configure your validator node for real-time data collection.\n');

  // Get validator address
  const validatorAddress = await askQuestion(
    'Enter your validator address (e.g., storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv)',
    'storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv'
  );

  // Get node endpoints
  console.log('\n📡 Node Endpoints Configuration:');
  console.log('Enter the endpoints for your validator node. If running locally, use localhost.');
  console.log('If running on a remote server, use the server IP address.\n');

  const rpcEndpoint = await askQuestion(
    'RPC endpoint (for node status and IP detection)',
    'http://localhost:26657'
  );

  const apiEndpoint = await askQuestion(
    'API endpoint (for validator info and signing data)',
    'http://localhost:1317'
  );

  const p2pEndpoint = await askQuestion(
    'P2P endpoint (for network info)',
    'http://localhost:26656'
  );

  // Get external IP (optional)
  console.log('\n🌐 External IP Configuration:');
  console.log('If you know your validator\'s external IP address, enter it for more accurate geolocation.\n');

  const externalIP = await askQuestion(
    'External IP address (optional, press Enter to skip)',
    ''
  );

  // Get custom location (optional)
  console.log('\n📍 Custom Location Configuration:');
  console.log('If you want to override IP geolocation with custom location data, fill in the details below.');
  console.log('Press Enter to skip and use IP geolocation instead.\n');

  const useCustomLocation = await askQuestion(
    'Use custom location instead of IP geolocation? (y/n)',
    'n'
  );

  let customLocation = null;
  if (useCustomLocation.toLowerCase() === 'y') {
    const country = await askQuestion('Country', 'Germany');
    const region = await askQuestion('Region/State', 'Hesse');
    const city = await askQuestion('City', 'Frankfurt');
    const latitude = await askQuestion('Latitude', '50.1109');
    const longitude = await askQuestion('Longitude', '8.6821');
    const timezone = await askQuestion('Timezone', 'Europe/Berlin');
    const providerName = await askQuestion('Provider name', 'Hetzner Online GmbH');
    const providerType = await askQuestion('Provider type', 'Data Center');
    const asn = await askQuestion('ASN number', '24940');
    const isp = await askQuestion('ISP name', 'Hetzner Online GmbH');

    customLocation = {
      country,
      region,
      city,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone,
      provider: {
        name: providerName,
        type: providerType,
        asn: parseInt(asn),
        isp
      }
    };
  }

  // Configuration options
  console.log('\n⚙️  Configuration Options:');
  
  const enableGeolocation = await askQuestion(
    'Enable IP geolocation? (y/n)',
    'y'
  );

  const cacheDuration = await askQuestion(
    'Cache duration in minutes (for location data)',
    '5'
  );

  const checkInterval = await askQuestion(
    'Node status check interval in seconds',
    '30'
  );

  const requestTimeout = await askQuestion(
    'Request timeout in milliseconds',
    '5000'
  );

  const verboseLogging = await askQuestion(
    'Enable verbose logging? (y/n)',
    'y'
  );

  // Generate configuration
  const config = {
    VALIDATOR_NODES: {
      [validatorAddress]: {
        rpcEndpoint,
        apiEndpoint,
        p2pEndpoint,
        externalIP: externalIP || null,
        customLocation
      }
    },
    GEOLOCATION: {
      enabled: enableGeolocation.toLowerCase() === 'y',
      services: [
        'ipapi.co',
        'ipinfo.io',
        'ipgeolocation.io'
      ],
      cacheDuration: parseInt(cacheDuration) * 60 * 1000
    },
    MONITORING: {
      enabled: true,
      checkInterval: parseInt(checkInterval) * 1000,
      requestTimeout: parseInt(requestTimeout),
      verboseLogging: verboseLogging.toLowerCase() === 'y'
    },
    NETWORK: {
      chainId: 'story-testnet-1',
      rpcEndpoint: 'https://api-aeneid.storyscan.app',
      apiEndpoint: 'https://api-aeneid.storyscan.app',
      itrocketEndpoint: 'https://api-story-testnet.itrocket.net'
    }
  };

  // Write configuration file
  const configPath = path.join(__dirname, 'validator-config.js');
  const configContent = `// Validator Node Configuration
// Generated by setup script on ${new Date().toISOString()}

module.exports = ${JSON.stringify(config, null, 2)};

// Instructions:
// 1. This configuration will be used by the proxy server to fetch real-time data from your validator
// 2. Make sure your validator node is running and accessible at the specified endpoints
// 3. Restart the proxy server after making changes to this file
// 4. The proxy server will automatically detect your validator's IP and location
`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log('\n✅ Configuration saved successfully!');
    console.log(`📁 File: ${configPath}`);
    
    console.log('\n📋 Configuration Summary:');
    console.log(`   Validator Address: ${validatorAddress}`);
    console.log(`   RPC Endpoint: ${rpcEndpoint}`);
    console.log(`   API Endpoint: ${apiEndpoint}`);
    console.log(`   P2P Endpoint: ${p2pEndpoint}`);
    console.log(`   External IP: ${externalIP || 'Auto-detect'}`);
    console.log(`   Custom Location: ${customLocation ? 'Enabled' : 'IP Geolocation'}`);
    console.log(`   IP Geolocation: ${enableGeolocation.toLowerCase() === 'y' ? 'Enabled' : 'Disabled'}`);
    console.log(`   Cache Duration: ${cacheDuration} minutes`);
    console.log(`   Check Interval: ${checkInterval} seconds`);
    console.log(`   Request Timeout: ${requestTimeout}ms`);
    console.log(`   Verbose Logging: ${verboseLogging.toLowerCase() === 'y' ? 'Enabled' : 'Disabled'}`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Make sure your validator node is running');
    console.log('2. Verify the endpoints are accessible');
    console.log('3. Start the proxy server: npm start');
    console.log('4. Check the network visualization for real-time data');
    
    console.log('\n🔧 Testing Your Configuration:');
    console.log(`   Test RPC endpoint: curl ${rpcEndpoint}/status`);
    console.log(`   Test API endpoint: curl ${apiEndpoint}/cosmos/staking/v1beta1/validators/${validatorAddress}`);
    
  } catch (error) {
    console.error('\n❌ Error saving configuration:', error.message);
    process.exit(1);
  }
}

// Run setup
setupValidator().catch(console.error); 