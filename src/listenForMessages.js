const uint8ArrayToString = require('uint8arrays/to-string')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { startSleepThread } = require('./startSleepThread.js')


var receivedNumbers = []
var solution
var winnerPeerId
var solution
var afterSleep

async function listenForMessages(node, id, topic, iteration) {

    await startSleepThread()



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