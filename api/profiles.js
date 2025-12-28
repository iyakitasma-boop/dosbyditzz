// api/profiles.js
class AttackProfiles {
    static profiles = {
        'BRUTAL_MODE': {
            method: 'XFLOOD',
            threads: 1000,
            duration: 300,
            stealth: false
        },
        'STEALTH_MODE': {
            method: 'GHOST',
            threads: 100,
            duration: 600,
            stealth: true
        },
        'COMBO_MODE': {
            method: 'BOTH',
            threads: 500,
            duration: 180,
            rotateProxies: true
        }
    };
}