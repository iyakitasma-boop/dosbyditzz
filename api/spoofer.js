// api/spoofer.js
class UserAgentSpoofer {
    static agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X)',
        'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        // 500+ more agents
    ];
    
    static getRandomAgent() {
        return this.agents[Math.floor(Math.random() * this.agents.length)];
    }
}