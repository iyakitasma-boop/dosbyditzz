// KILLER_VOIDS - Frontend Controller
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const targetUrlInput = document.getElementById('targetUrl');
    const durationSlider = document.getElementById('duration');
    const durationValue = document.getElementById('durationValue');
    const methodOptions = document.querySelectorAll('.method-option');
    const apiKeyInput = document.getElementById('apiKey');
    const startAttackBtn = document.getElementById('startAttack');
    const stopAttackBtn = document.getElementById('stopAttack');
    const statusPanel = document.getElementById('statusPanel');
    
    // Status elements
    const statTarget = document.getElementById('statTarget');
    const statMethod = document.getElementById('statMethod');
    const statRequests = document.getElementById('statRequests');
    const statConnections = document.getElementById('statConnections');
    const attackTimer = document.getElementById('attackTimer');
    const attackProgress = document.getElementById('attackProgress');
    const progressPercent = document.getElementById('progressPercent');
    const attackLog = document.getElementById('attackLog');
    
    // State
    let currentAttack = null;
    let selectedMethod = 'GHOST';
    let attackStartTime = null;
    let timerInterval = null;
    let progressInterval = null;
    let totalDuration = 60;
    
    // Initialize
    init();
    
    function init() {
        // Set default method
        methodOptions[0].classList.add('active');
        selectedMethod = methodOptions[0].dataset.method;
        
        // Update duration display
        durationSlider.addEventListener('input', function() {
            durationValue.textContent = this.value;
            totalDuration = parseInt(this.value);
        });
        
        // Method selection
        methodOptions.forEach(option => {
            option.addEventListener('click', function() {
                methodOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                selectedMethod = this.dataset.method;
                
                logMessage(`Method changed to ${selectedMethod}`);
            });
        });
        
        // Start attack
        startAttackBtn.addEventListener('click', startAttack);
        
        // Stop attack
        stopAttackBtn.addEventListener('click', stopAttack);
        
        // Footer buttons
        document.getElementById('viewDocs').addEventListener('click', (e) => {
            e.preventDefault();
            alert('Documentation will be available soon.');
        });
        
        document.getElementById('viewSource').addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://github.com/yourusername/dos-tool', '_blank');
        });
        
        document.getElementById('resetTool').addEventListener('click', (e) => {
            e.preventDefault();
            resetTool();
        });
        
        // Initial log
        logMessage('System initialized. Ready for attack.');
    }
    
    function startAttack() {
        const target = targetUrlInput.value.trim();
        const duration = parseInt(durationSlider.value);
        const apiKey = apiKeyInput.value.trim();
        
        // Validation
        if (!target) {
            alert('Please enter target URL');
            return;
        }
        
        if (!target.startsWith('http://') && !target.startsWith('https://')) {
            alert('URL must start with http:// or https://');
            return;
        }
        
        if (isNaN(duration) || duration < 10 || duration > 300) {
            alert('Duration must be between 10 and 300 seconds');
            return;
        }
        
        // Confirm
        if (!confirm(`Launch ${selectedMethod} attack on ${target} for ${duration} seconds?`)) {
            return;
        }
        
        // Update UI
        startAttackBtn.disabled = true;
        stopAttackBtn.disabled = false;
        statusPanel.classList.remove('hidden');
        
        // Update stats
        statTarget.textContent = target.replace('https://', '').replace('http://', '').split('/')[0];
        statMethod.textContent = selectedMethod;
        statRequests.textContent = '0';
        statConnections.textContent = '0';
        
        // Start timer
        attackStartTime = Date.now();
        startTimer(duration);
        startProgressBar(duration);
        
        // Log
        logMessage(`Starting ${selectedMethod} attack on ${target}`);
        logMessage(`Duration: ${duration} seconds`);
        logMessage('Establishing connections...');
        
        // Simulate attack (frontend simulation)
        simulateAttack(duration);
        
        // Real attack via API
        launchRealAttack(target, duration, apiKey);
    }
    
    function launchRealAttack(target, duration, apiKey) {
        const payload = {
            target: target,
            duration: duration,
            method: selectedMethod,
            apiKey: apiKey || 'default'
        };
        
        // Use relative URL for Vercel deployment
        const apiUrl = window.location.hostname.includes('localhost') 
            ? 'http://localhost:3000/api/dos'
            : '/api/dos';
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                logMessage('Attack launched successfully via API');
                logMessage(`Attack completed: ${JSON.stringify(data.attackInfo)}`);
            } else {
                logMessage(`API Error: ${data.error}`);
            }
        })
        .catch(error => {
            logMessage(`Network Error: ${error.message}`);
        });
    }
    
    function simulateAttack(duration) {
        let elapsed = 0;
        const interval = setInterval(() => {
            if (!currentAttack) {
                clearInterval(interval);
                return;
            }
            
            elapsed += 1;
            
            // Simulate stats
            if (selectedMethod === 'GHOST') {
                const connections = Math.floor(Math.random() * 100) + 50;
                statConnections.textContent = connections;
                logMessage(`Ghost connections: ${connections} active`);
            } else {
                const requests = Math.floor(Math.random() * 1000) + 500;
                statRequests.textContent = requests;
                logMessage(`XFlood requests: ${requests}/sec`);
            }
            
            if (elapsed >= duration) {
                clearInterval(interval);
            }
        }, 1000);
        
        currentAttack = {
            interval: interval,
            startTime: Date.now()
        };
    }
    
    function stopAttack() {
        if (currentAttack) {
            clearInterval(currentAttack.interval);
            
            if (timerInterval) clearInterval(timerInterval);
            if (progressInterval) clearInterval(progressInterval);
            
            startAttackBtn.disabled = false;
            stopAttackBtn.disabled = true;
            
            attackProgress.style.width = '0%';
            progressPercent.textContent = '0%';
            
            logMessage('Attack stopped by user');
            logMessage('All connections terminated');
            
            currentAttack = null;
        }
    }
    
    function startTimer(duration) {
        let remaining = duration;
        
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            remaining--;
            
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            
            attackTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (remaining <= 0) {
                clearInterval(timerInterval);
                attackComplete();
            }
        }, 1000);
    }
    
    function startProgressBar(duration) {
        let elapsed = 0;
        
        if (progressInterval) clearInterval(progressInterval);
        
        progressInterval = setInterval(() => {
            elapsed++;
            const percent = Math.min((elapsed / duration) * 100, 100);
            
            attackProgress.style.width = `${percent}%`;
            progressPercent.textContent = `${Math.round(percent)}%`;
            
            if (elapsed >= duration) {
                clearInterval(progressInterval);
            }
        }, 1000);
    }
    
    function attackComplete() {
        startAttackBtn.disabled = false;
        stopAttackBtn.disabled = true;
        
        logMessage('Attack completed successfully');
        logMessage('All resources cleaned up');
        
        // Show completion alert
        setTimeout(() => {
            alert(`Attack on ${statTarget.textContent} completed!`);
        }, 500);
    }
    
    function resetTool() {
        targetUrlInput.value = '';
        durationSlider.value = '60';
        durationValue.textContent = '60';
        apiKeyInput.value = '';
        
        methodOptions.forEach(opt => opt.classList.remove('active'));
        methodOptions[0].classList.add('active');
        selectedMethod = 'GHOST';
        
        stopAttack();
        statusPanel.classList.add('hidden');
        
        logMessage('Tool reset to initial state');
        logMessage('Ready for new attack configuration');
    }
    
    function logMessage(message) {
        const now = new Date();
        const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-message">${message}</span>
        `;
        
        attackLog.appendChild(logEntry);
        attackLog.scrollTop = attackLog.scrollHeight;
        
        // Keep only last 50 log entries
        const entries = attackLog.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }
});