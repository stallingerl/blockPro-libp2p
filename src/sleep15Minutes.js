const { isMainThread, parentPort } = require('worker_threads');
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { quiz } = require('./quiz.js');


(async () =>  {
        console.log(`Starting wait 15 mins`);
        setTimeout(async() => {
            console.log(`Timeout over`);

            // generate a random number 
            solutionNumber = Math.floor(Math.random() * 100).toString();
            solution = 'Solution ' + solutionNumber
            console.log('Random number: ' + solution)
            parentPort.postMessage(`${solution}`);

            process.exit();
        }, 30000);
})();

