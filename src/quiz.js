const { publishRandomNumber } = require('./publishRandomNumber.js');
const uint8ArrayToString = require('uint8arrays/to-string');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { Worker, isMainThread, parentPort, workerData, MessageChannel } = require('worker_threads')


// This function is for the Quizmaster who sets the hidden number
var receivedNumbers = [];
var winnerPeerId
var solution
var winnerPeerId



async function quiz(node, id, signer, iteration) {

    let topic = "Quiz"

    if (signer == true)
        console.log('I am SEED now ' + id)

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    if (signer == true) {
        await startSleepThread(iteration)
    } else {
        await raetsler(iteration)
    }

    async function raetsler(iteration) {

        // listen for messages
        node.pubsub.on(topic, async (msg) => {
            console.log("HELLO from Listener")

            let data = await msg.data
            let message = uint8ArrayToString(data)

            console.log('received message: ' + message)
            receivedNumbers.push(message)

            console.log("Array is ", JSON.stringify(receivedNumbers))
        })

        console.log("NEUES RÄTSEL")
        // generate a random number 
        let randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)

        await publishRandomNumber(node, randomNumber, id, topic)

        // receive other peers' numbers and save to Array receivedNumbers
        node.pubsub.on(topic, async (msg) => {

            let data = await msg.data
            let message = uint8ArrayToString(data)


            if (message.includes('Solution')) {
                //receivedNumbers = ["QmdaiadqcBDCoJ43A5gaomqzUR7dH1NgrGK1xUkUPPkjUi,50", "QmUkf9pfefP2F55GJ7G9WjqQwpJR5rZTKqSthCMcmxNF1m, Solution 12"]
                // auch die eigene Nummer muss mit gegeben werden
                if (!receivedNumbers.includes(`${id}, ${randomNumber}`)) {
                    receivedNumbers.push(`${id}, ${randomNumber}`)
                }

                solutionNumber = message.split('Solution ')[1];
                //solutionNumber = 32
                //console.log("reveived von ratsler ", JSON.stringify(receivedNumbers))

                if (receivedNumbers.length > 2) {
                    winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)
                }

                if (winnerPeerId !== undefined) {
                    console.log("Winner PeerId and Solution number: " + winnerPeerId + solutionNumber)

                    await writeWinnerToLog(iteration, winnerPeerId, solutionNumber)

                    if (winnerPeerId == id) {
                        console.log('Ende von Runde. Nächste Runde ausgelöst')

                        writeWinnerToLog(iteration, winnerPeerId, solutionNumber)

                        receivedNumbers = []
                        console.log("written Block ")
                        await startSleepThread(++iteration)
                    } else {
                        writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
                        ++iteration
                        console.log("written Block ")
                        console.log("NEUES RÄTSEL")
                        receivedNumbers = []
                        // generate a random number 
                        let randomNumber = Math.floor(Math.random() * 100).toString();
                        console.log('Random number: ' + randomNumber)
                        await publishRandomNumber(node, randomNumber, id, topic)
                    }
                }

                if (winnerPeerId == undefined) {

                    writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
                    console.log("written Block ")
                    ++iteration
                    receivedNumbers = []
                    console.log("NEUES RÄTSEL")
                    // generate a random number 
                    let randomNumber = Math.floor(Math.random() * 100).toString();
                    console.log('Random number: ' + randomNumber)
                    
                    await publishRandomNumber(node, randomNumber, id, topic)

                }

            }

        })

    }

    async function startSleepThread(iteration) {

        // sleep for 15 Minutes until Solution is revealed
        const worker = new Worker('./src/sleep15Minutes.js');

        // listen for messages
        node.pubsub.on(topic, async (msg) => {
            console.log("HELLO from Listener")

            let data = await msg.data
            let message = uint8ArrayToString(data)

            console.log('received message: ' + message)
            receivedNumbers.push(message)

            console.log("Array is ", JSON.stringify(receivedNumbers))
        })

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

            console.log("MESSAGES ", JSON.stringify(receivedNumbers))

            if (receivedNumbers.length > 1) {
                winnerPeerId = await determineWinner(receivedNumbers, solution, id)
            }


            if (winnerPeerId == undefined && receivedNumbers.length < 2) {
                console.log('KEINE MITSPIELER GEFUNDEN')
                winnerPeerId = id
            }

            await writeWinnerToLog(iteration, winnerPeerId, solution)

            await publishRandomNumber(node, solution, id, topic)
            console.log("Published Solution ", solution)

            //await publishWinner(node, winnerPeerId, topic)

            solution = undefined

            console.log("Executed in the worker thread");

            if (winnerPeerId == id) {
                console.log('Ende von Runde. Nächste Runde ausgelöst')
                receivedNumbers = []
                await startSleepThread(++iteration)
            } else {
                receivedNumbers = []
                winnerPeerId = ''
                await raetsler(++iteration)
            }

        })

    }
}

module.exports.quiz = quiz;