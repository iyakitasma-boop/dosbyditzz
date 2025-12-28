// api/config.js
const AdvancedConfig = {
    // Timing adjustments
    connectionTimeout: 5000,
    requestDelay: 0, // 0 = maximum speed
    
    // Payload customization
    customHeaders: {
        'X-Forwarded-For': '127.0.0.1',
        'Referer': 'https://google.com',
        'Accept-Encoding': 'gzip, deflate, br'
    },
    
    // Attack vectors
    vectors: {
        'SLOWLORIS': { partialRequests: true, keepAlive: true },
        'RUDY': (Slow POST attack),
        'LOIC': (HTTP flood with random data),
        'HOIC': (High-speed HTTP flood)
    },
    
    // Stealth mode
    stealth: {
        randomDelay: true,
        maxRequestsPerIP: 100,
        rotateIPs: true
    }
};