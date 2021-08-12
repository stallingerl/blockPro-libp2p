const uint8ArrayToString = require('uint8arrays/to-string')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { topicQuiz } = require('./topicQuiz.js');


var receivedNumbers = []
var solution
var winnerPeerId
var solution
var afterSleep

async function listenForMessages(node, id, topic, iteration) {

    await startSleepThread()

    async function startSleepThread() {

        // sleep for 15 Minutes until Solution is revealed
        const worker = new Worker('./src/sleep15Minutes.js');
        afterSleep = Date.now() + 29900

        //Listen for a message from worker
        worker.once("message", async (result) => {
            solution = await result
            console.log(`${result}`);
        });

        worker.on("error", error => {
            console.log(error);
        });

        worker.on("exit", async (exitCode) => {
            console.log(exitCode);

            await publishRandomNumber(node, solution, id, topic)
            console.log("Published Solution ", solution)

            winnerPeerId = await determineWinner(receivedNumbers, solution, id)

            if (winnerPeerId == undefined) {
                console.log('KEINE MITSPIELER GEFUNDEN')
                winnerPeerId = id
            }

            await writeWinnerToLog(iteration, winnerPeerId, solution)

            await publishWinner(winnerPeerId)

            console.log("Executed in the worker thread");

            if (winnerPeerId == id) {
                console.log('Ende von Runde. Nächste Runde ausgelöst')
                winnerPeerId = await startSleepThread()
              } else {
                console.log('Ende von Runde. Nächste Runde ausgelöst')
                winnerPeerId = await topicQuiz(node, id, ++iteration)
              }
        })

    }

    if (isMainThread) {
        // receive other peers' numbers and save to Array receivedNumbers
        await node.pubsub.on(topic, async (msg) => {
            let data = await msg.data
            let message = uint8ArrayToString(data)

            console.log('received message: ' + message)

            if (!receivedNumbers.includes(`${message}`)) {
                receivedNumbers.push(message)
            }
        })
    }
}

module.exports.listenForMessages = listenForMessages;