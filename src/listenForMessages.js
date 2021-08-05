const uint8ArrayToString = require('uint8arrays/to-string')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js')

var receivedNumbers = []
var solution
var winnerPeerId
var iteration 

async function listenForMessages(node, id, topic, iteration) {

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

        winnerPeerId = await startSleepThread()

        async function startSleepThread() {

            // sleep for 15 Minutes until Solution is revealed
            const worker = new Worker('./src/sleep15Minutes.js');

            //Listen for a message from worker
            worker.once("message", async (result) => {
                console.log(`${result}`);
                solution = await result
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

                console.log("Executed in the worker thread");

                return winnerPeerId
            })

        }
    }
}

module.exports.listenForMessages = listenForMessages;