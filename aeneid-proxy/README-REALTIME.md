# Real-Time Validator Data Collection

This guide explains how to set up real-time data collection from your running validator node for the Aeneid Validator Nexus.

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
cd aeneid-proxy
node setup-validator.js
```

The setup script will guide you through configuring your validator node details interactively.

### 2. Manual Configuration

If you prefer to configure manually, edit `validator-config.js`:

```javascript
module.exports = {
  VALIDATOR_NODES: {
    'storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv': {
      rpcEndpoint: 'http://localhost:26657',    // Your validator's RPC endpoint
      apiEndpoint: 'http://localhost:1317',     // Your validator's API endpoint
      p2pEndpoint: 'http://localhost:26656',    // Your validator's P2P endpoint
      externalIP: null,                         // Optional: Your external IP
      customLocation: null                      // Optional: Custom location data
    }
  },
  // ... other configuration options
};
```

## 📡 Validator Node Endpoints

Your validator node typically runs these services:

| Service | Port | Purpose | Example |
|---------|------|---------|---------|
| RPC | 26657 | Node status, IP detection | `http://localhost:26657` |
| API | 1317 | Validator info, signing data | `http://localhost:1317` |
| P2P | 26656 | Network information | `http://localhost:26656` |

### Testing Endpoints

```bash
# Test RPC endpoint
curl http://localhost:26657/status

# Test API endpoint
curl http://localhost:1317/cosmos/staking/v1beta1/validators/your-validator-address

# Test P2P endpoint
curl http://localhost:26656/net_info
```

## 🌐 IP Geolocation

The system automatically detects your validator's IP address and uses multiple geolocation services:

### Supported Services
- **ipapi.co** - Free tier: 1000 requests/day
- **ipinfo.io** - Free tier: 50,000 requests/month  
- **ipgeolocation.io** - Free tier: 1000 requests/day

### Custom Location Override

If you want to override IP geolocation with custom data:

```javascript
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
```

## 🔧 Configuration Options

### Geolocation Settings
```javascript
GEOLOCATION: {
  enabled: true,                    // Enable/disable IP geolocation
  services: [                       // Preferred services (in order)
    'ipapi.co',
    'ipinfo.io', 
    'ipgeolocation.io'
  ],
  cacheDuration: 5 * 60 * 1000     // Cache duration (5 minutes)
}
```

### Monitoring Settings
```javascript
MONITORING: {
  enabled: true,                    // Enable real-time monitoring
  checkInterval: 30 * 1000,        // Check interval (30 seconds)
  requestTimeout: 5000,            // Request timeout (5 seconds)
  verboseLogging: true             // Enable detailed logging
}
```

## 📊 Real-Time Data Collection

The system collects the following real-time data:

### Location Data
- **Country, Region, City** - From IP geolocation or custom config
- **Latitude/Longitude** - Precise coordinates
- **Timezone** - Local timezone information
- **Provider Details** - ISP, ASN, provider type

### Node Status Data
- **RPC Status** - Node health and sync status
- **Validator Info** - Staking information and performance
- **Signing Info** - Block signing history and missed blocks
- **Network Info** - P2P connections and network status

### Performance Metrics
- **Uptime** - Real-time uptime percentage
- **Performance Score** - Calculated from various metrics
- **Proposed Blocks** - Number of blocks proposed
- **Missed Blocks** - Number of blocks missed
- **Commission Rate** - Current commission percentage

## 🔄 API Endpoints

### Location Data
```bash
GET /api/validators/{address}/location
```

### Node Status
```bash
GET /api/validators/{address}/node-status
```

### Comprehensive Data
```bash
GET /api/validators/{address}/comprehensive
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:26657
   ```
   **Solution**: Make sure your validator node is running and the endpoints are correct.

2. **Timeout Errors**
   ```
   Error: timeout of 5000ms exceeded
   ```
   **Solution**: Increase `requestTimeout` in configuration or check network connectivity.

3. **IP Detection Failed**
   ```
   IP address for validator: null
   ```
   **Solution**: Check if RPC/P2P endpoints are accessible and returning valid data.

4. **Geolocation Failed**
   ```
   All geolocation services failed
   ```
   **Solution**: Check internet connectivity or use custom location data.

### Debug Mode

Enable verbose logging in configuration:

```javascript
MONITORING: {
  verboseLogging: true
}
```

### Testing Commands

```bash
# Test your validator endpoints
curl http://localhost:26657/status | jq '.result.node_info'

# Test geolocation
curl https://ipapi.co/$(curl -s ifconfig.me)/json/

# Check proxy server logs
tail -f aeneid-proxy/logs/server.log
```

## 🔒 Security Considerations

1. **Firewall Configuration**
   - Only expose necessary ports (26657, 1317, 26656)
   - Use reverse proxy for external access
   - Implement rate limiting

2. **Network Security**
   - Use HTTPS for external endpoints
   - Implement authentication if needed
   - Monitor for unusual activity

3. **Data Privacy**
   - Location data is cached locally
   - No sensitive data is logged
   - IP addresses are not stored permanently

## 📈 Performance Optimization

### Caching Strategy
- Location data cached for 5 minutes (configurable)
- Node status cached for 30 seconds
- Reduces API calls and improves response time

### Rate Limiting
- Geolocation services have daily/monthly limits
- System uses multiple services for redundancy
- Failed requests fall back to cached data

### Monitoring
- Real-time status monitoring
- Automatic retry on failures
- Detailed error logging

## 🎯 Next Steps

1. **Configure your validator** using the setup script
2. **Start the proxy server**: `npm start`
3. **Verify data collection** in the network visualization
4. **Monitor logs** for any issues
5. **Adjust configuration** as needed

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Enable verbose logging for detailed error messages
3. Verify your validator node is running correctly
4. Test endpoints manually using curl commands
5. Check the proxy server logs for specific error messages

---

**Note**: This system is designed to work with Story Protocol testnet validators. Make sure your validator is properly configured and running on the testnet. 