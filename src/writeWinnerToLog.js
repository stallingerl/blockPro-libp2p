const fs = require('fs');

export async function writeWinnerToLog(){

fs.writeFileSync('winnerLog.txt', JSON.stringify(peerId));


}

