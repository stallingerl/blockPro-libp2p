const { Worker, isMainThread, parentPort, workerData, MessageChannel } = require('worker_threads')
const { port1 } = new MessageChannel();
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { quiz } = require('./quiz.js')
const { publishWinner } = require('./publishWinner')

var solution
var winnerPeerId

async function startSleepThread(node, id, iteration, topic) {

    // sleep for 15 Minutes until Solution is revealed
    const worker = new Worker('./src/sleep15Minutes.js');
  
    //Listen for a message from worker
    worker.once("message", (result) => {
        solution = result
        console.log(`${result}`);
    });

    worker.on("error", error => {
        console.log(error);
    });

    worker.on("exit", async (exitCode) => {
        console.log(exitCode);
        await publishRandomNumber(node, solution, id, topic)
        console.log("Published Solution ", solution)

        winnerPeerId = await determineWinner(global.receivedNumbers, solution, id)

        if (winnerPeerId == undefined) {
            console.log('KEINE MITSPIELER GEFUNDEN')
            winnerPeerId = id
        }

        await writeWinnerToLog(iteration, winnerPeerId, solution)

        await publishWinner(node, winnerPeerId, topic)

        console.log("Executed in the worker thread");

        if (winnerPeerId == id) {
            console.log('Ende von Runde. Nächste Runde ausgelöst')
            await startSleepThread(node, id, ++iteration, topic)
          } else {
            receivedNumbers = []
            signer = false
            await quiz(signer, ++iteration)
          }

    })

}

module.exports.startSleepThread = startSleepThread;