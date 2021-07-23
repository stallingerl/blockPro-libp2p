const fs = require('fs');

async function writeWinnerToLog(iteration, winnerPeerId, solutionNumber) {

    let timestamp = new Date.toUTCString()

    try {
        var data = fs.readFileSync('winnerLog.txt', 'utf8');
        data.concat(`${iteration}, ${timestamp}, ${winnerPeerId}, ${solutionNumber}, `)
        fs.writeFileSync('winnerLog.txt', data);
    } catch (e) {
        console.log('Creating new Logfile');
        let data = `${iteration}, ${timestamp}, ${winnerPeerId}, ${solutionNumber}, `
        fs.writeFileSync('winnerLog.txt', data);
    }

}
module.exports.writeWinnerToLog = writeWinnerToLog;

