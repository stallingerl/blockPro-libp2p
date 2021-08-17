const { publishRandomNumber } = require('./publishRandomNumber.js');
const uint8ArrayToString = require('uint8arrays/to-string');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { Worker, isMainThread, parentPort, workerData, MessageChannel } = require('worker_threads')


// This function is for the Quizmaster who sets the hidden number
var receivedNumbers = [];
var winnerPeerId
var solution
var randomNumber
var solutionNumber



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

        console.log("NEUES RÄTSEL")
        // generate a random number 
        randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)

        await publishRandomNumber(node, randomNumber, id, topic)

        // receive other peers' numbers and save to Array receivedNumbers
        node.pubsub.on(topic, async (msg) => {

            let data = await msg.data
            let message = uint8ArrayToString(data)


            if (message.includes('Solution')) {

                solutionNumber = message.split('Solution ')[1];
                //console.log("reveived von ratsler ", JSON.stringify(receivedNumbers))


                // auch die eigene Nummer muss mit gegeben werden
                receivedNumbers.push(`${id}, ${randomNumber}`)
                winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)

                if (winnerPeerId !== undefined) {
                    console.log("Winner PeerId and Solution number: " + winnerPeerId + solutionNumber)

                    if (winnerPeerId == id) {
                        console.log('Ende von Runde. Nächste Runde ausgelöst')

                        writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
                        console.log("Was Rätsler now last Signer")

                        receivedNumbers = []
                        winnerPeerId = undefined
                        randomNumber = undefined

                        console.log("written Block ")
                        await startSleepThread(++iteration)
                    } else {
                        writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
                        ++iteration
                        console.log("written Block ")
                        console.log("NEUES RÄTSEL")
                        receivedNumbers = []
                        winnerPeerId = undefined

                        // generate a random number 
                        let randomNumber = Math.floor(Math.random() * 100).toString();
                        console.log('Random number: ' + randomNumber)
                        await publishRandomNumber(node, randomNumber, id, topic)
                    }
                } else if (winnerPeerId == undefined) {

                    writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
                    console.log("written Block ")
                    ++iteration
                    receivedNumbers = []
                    winnerPeerId = undefined
                    console.log("NEUES RÄTSEL")
                    // generate a random number 
                    let randomNumber = Math.floor(Math.random() * 100).toString();
                    console.log('Random number: ' + randomNumber)

                    await publishRandomNumber(node, randomNumber, id, topic)

                }

            }

            console.log('received message: ' + message)
            if (!receivedNumbers.includes(`${message}`)) {
                receivedNumbers.push(message)
            }

            console.log("Array is ", JSON.stringify(receivedNumbers))

        })

    }

    async function startSleepThread(iteration) {

        // sleep for 15 Minutes until Solution is revealed
        console.log("neuer SLEEP Thread gestartet")
        const worker = new Worker('./src/sleep15Minutes.js');

        // listen for messages
        node.pubsub.on(topic, async (msg) => {

            let data = await msg.data
            let message = uint8ArrayToString(data)

            console.log('received message: ' + message)

            if (!receivedNumbers.includes(`${message}`)) {
                receivedNumbers.push(message)
            }

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

            await publishRandomNumber(node, solution, id, topic)
            console.log("Published Solution ", solution)

            if (receivedNumbers.length > 1) {
                let solutionNumber = solution.split(' ')[1]
                winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)
            }


            if (winnerPeerId == undefined && receivedNumbers.length < 2) {
                console.log('KEINE MITSPIELER GEFUNDEN')
                winnerPeerId = id
            }

            console.log("Executed in the worker thread");
            console.log('Ende von Runde. Nächste Runde ausgelöst')

            randomNumber = undefined
            receivedNumbers = []

            if (winnerPeerId == id) {
                await writeWinnerToLog(iteration, winnerPeerId, solution)
                solution = undefined
                winnerPeerId = undefined
                await startSleepThread(++iteration)
            } else {
                await writeWinnerToLog(iteration, winnerPeerId, solution)
                solution = undefined
                winnerPeerId = undefined
                setTimeout(async () => { await raetsler(++iteration) }, 3000)
            }

        })

    }
}

module.exports.quiz = quiz;