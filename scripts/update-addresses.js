const fs = require('fs');
const path = require('path');

// Nouvelles adresses
const NEW_ADDRESSES = {
    token: '0x2a298Cd0c40C4E71BD6308151AA3437A0E8EC648',
    governor: '0x9C2a0562b395E09b81265C568B55D164230a0939',
    timelock: '0x4f1CB18C89A9018dC22aF6cF54F2ea6EE9A0A2DF'
};

// Anciennes adresses à remplacer
const OLD_ADDRESSES = {
    token: '0x98eDc5E454E309614Fe6C6df2095B8EeDb829181',
    governor: '0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83'
};

// Liste des fichiers à mettre à jour
const scriptsDir = path.join(__dirname);
fs.readdirSync(scriptsDir).forEach(file => {
    if (file.endsWith('.js') && file !== 'update-addresses.js') {
        const filePath = path.join(scriptsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remplacer les anciennes adresses par les nouvelles
        Object.keys(OLD_ADDRESSES).forEach(key => {
            const oldAddr = OLD_ADDRESSES[key];
            const newAddr = NEW_ADDRESSES[key];
            content = content.replace(new RegExp(oldAddr, 'g'), newAddr);
        });

        fs.writeFileSync(filePath, content);
        console.log(`Updated addresses in ${file}`);
    }
});

console.log('\nNew addresses:');
console.log('Token:', NEW_ADDRESSES.token);
console.log('Governor:', NEW_ADDRESSES.governor);
console.log('Timelock:', NEW_ADDRESSES.timelock);
