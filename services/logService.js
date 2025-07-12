// services/logService.js

function saveLog(data) {
    // For now, just print the parsed log
    console.log('📝 Parsed Data:', JSON.stringify(data, null, 2));

    // In real usage, save to DB or file
    // Example:
    // fs.appendFile('logs.txt', JSON.stringify(data) + '\n', err => { ... })
}

module.exports = { saveLog };
