// Validator Node Configuration
// Update this file with your actual validator node details

module.exports = {
  // Your validator node configuration
  VALIDATOR_NODES: {
    // Replace with your actual validator address
    'storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv': {
      // Your validator's RPC endpoint (usually runs on port 26657)
      rpcEndpoint: 'http://localhost:26657',
      
      // Your validator's API endpoint (usually runs on port 1317)
      apiEndpoint: 'http://localhost:1317',
      
      // Your validator's P2P endpoint (usually runs on port 26656)
      p2pEndpoint: 'http://localhost:26656',
      
      // Optional: Your validator's external IP address (if known)
      externalIP: null,
      
      // Optional: Custom location data (will override IP geolocation)
      customLocation: {
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
      }
    },
    
    // Add more validators if you're running multiple nodes
    // 'storyvaloper1yourvalidatoraddress': {
    //   rpcEndpoint: 'http://your-server-ip:26657',
    //   apiEndpoint: 'http://your-server-ip:1317',
    //   p2pEndpoint: 'http://your-server-ip:26656',
    //   externalIP: 'your-server-ip',
    //   customLocation: null
    // }
  },

  // IP Geolocation service configuration
  GEOLOCATION: {
    // Enable/disable IP geolocation
    enabled: true,
    
    // Preferred geolocation services (in order of preference)
    services: [
      'ipapi.co',      // Free tier: 1000 requests/day
      'ipinfo.io',     // Free tier: 50,000 requests/month
      'ipgeolocation.io' // Free tier: 1000 requests/day
    ],
    
    // Cache duration for location data (in milliseconds)
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },

  // Node monitoring configuration
  MONITORING: {
    // Enable/disable real-time node monitoring
    enabled: true,
    
    // How often to check node status (in milliseconds)
    checkInterval: 30 * 1000, // 30 seconds
    
    // Timeout for node requests (in milliseconds)
    requestTimeout: 5000,
    
    // Enable detailed logging
    verboseLogging: true
  },

  // Network configuration
  NETWORK: {
    // Story Protocol testnet configuration
    chainId: 'story-testnet-1',
    rpcEndpoint: 'https://api-aeneid.storyscan.app',
    apiEndpoint: 'https://api-aeneid.storyscan.app',
    
    // ITRocket API endpoint
    itrocketEndpoint: 'https://api-story-testnet.itrocket.net'
  }
};

// Instructions for setup:
//
// 1. Update the VALIDATOR_NODES object with your actual validator address
// 2. Set the correct endpoints for your validator node:
//    - RPC endpoint: Usually http://localhost:26657 (or your server IP)
//    - API endpoint: Usually http://localhost:1317 (or your server IP)
//    - P2P endpoint: Usually http://localhost:26656 (or your server IP)
//
// 3. If your validator is running on a remote server, replace 'localhost' with your server's IP address
//
// 4. If you know your validator's external IP address, add it to the externalIP field
//
// 5. If you want to override IP geolocation with custom location data, fill in the customLocation object
//
// 6. Save this file and restart the proxy server
//
// Example for remote server:
// 'storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv': {
//   rpcEndpoint: 'http://192.168.1.100:26657',
//   apiEndpoint: 'http://192.168.1.100:1317',
//   p2pEndpoint: 'http://192.168.1.100:26656',
//   externalIP: '203.0.113.1',
//   customLocation: null
// } 