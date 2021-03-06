const { publishRandomNumber } = require('./publishRandomNumber.js');
const uint8ArrayToString = require('uint8arrays/to-string');
const { determineWinner } = require('./determineWinner.js')
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { Worker, isMainThread, parentPort, workerData, MessageChannel } = require('worker_threads')


// This function is for the Quizmaster who sets the hidden number
var iteration
var receivedNumbers = [];
var winnerPeerId
var solution
var randomNumber
var solutionNumber
var ersteRunde
var rolle


async function quiz(node, id, seed) {

    let topic = "Quiz"
    iteration = 0

    if (seed == true)
        console.log('I am SEED now ' + id)

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    // Listener
    await node.pubsub.on(topic, async (msg) => {

        let data = await msg.data
        let message = uint8ArrayToString(data)

        console.log('received message: ' + message)

        let receivedPeerId = message.split(',')[0]
        if (!receivedNumbers.includes(`${receivedPeerId}`)) {
            receivedNumbers.push(message)
        }

        if (rolle == "rätsler") {
            raetsler()
        }

    })

    if (seed == true) {
        // listen for messages
        rolle = "schläfer"
        startSleepThread(iteration)
    } else {
        rolle = "rätsler"
        console.log("NEUES RÄTSEL")
        ersteRunde = true
    }

    async function raetsler() {

        // Wenn die Soltion in den empfangenen Nachrichten ist, Zahl speichern
        for (var j = 0; j < receivedNumbers.length; j++) {
            value = receivedNumbers[j].toString();
            if (value.includes('Solution')) {
                solutionNumber = value.split('Solution ')[1]
                break
            }
        }

        if (solutionNumber !== undefined && receivedNumbers.length > 1 ) {

            // auch die eigene Nummer muss in den array
            receivedNumbers.push(`${id}, ${randomNumber}`)

            winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)

            randomNumber = undefined
            receivedNumbers = []
            
            console.log("Winner PeerId and Solution number: " + winnerPeerId + ", " + solutionNumber)

            if (winnerPeerId == id) {
                console.log('Ende von Runde. Nächste Runde ausgelöst')

                writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
                console.log("Was Rätsler now last Signer")

                solution = undefined
                console.log("written Block ")
                console.log("von Rätsel neuer sleep Thread ")
                rolle = "schläfer"
                ++iteration
                startSleepThread()
            } else {
                writeWinnerToLog(iteration, winnerPeerId, solutionNumber)

                console.log("written Block ")
                console.log("von Rätsel NEUES RÄTSEL")
                solutionNumber = undefined

                // generate a random number 
                randomNumber = Math.floor(Math.random() * 300).toString();
                console.log('Random number: ' + randomNumber)
                console.log("HALLO AUS ERSTEM ELSE ICH PUBLISHE")
                rolle = "rätsler"
                ++iteration
                publishRandomNumber(node, randomNumber, id, topic)
            }
        } else if (ersteRunde !== undefined && solutionNumber !== undefined) {
            receivedNumbers = []

            writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
            solutionNumber = undefined
            ++iteration
            console.log("written Block ")

            // generate a random number 
            randomNumber = Math.floor(Math.random() * 300).toString();
            console.log('Random number: ' + randomNumber)
            console.log("HALLO AUS ZWEITEM ELSE ICH PUBLISHE")
            rolle = "rätsler"
            publishRandomNumber(node, randomNumber, id, topic)
            ersteRunde = undefined
        }
    }

    async function startSleepThread() {

        // sleep for 15 Minutes until Solution is revealed
        console.log("neuer SLEEP Thread gestartet")
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

            console.log("MESSAGES ", JSON.stringify(receivedNumbers))

            // publish solution
            publishRandomNumber(node, solution, id, topic)
            console.log("Published Solution ", solution)

            if (receivedNumbers.length > 1) {
                solutionNumber = solution.split(' ')[1]
                winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)
                solutionNumber = undefined
            }


            if (winnerPeerId == undefined && receivedNumbers.length < 2) {
                console.log('KEINE MITSPIELER GEFUNDEN')
                winnerPeerId = id
            }

            randomNumber = undefined
            receivedNumbers = []

            console.log("Executed in the worker thread");
            console.log('Ende von Runde. Nächste Runde ausgelöst')

            if (winnerPeerId == id) {
                writeWinnerToLog(iteration, winnerPeerId, solution)
                solution = undefined
                console.log("written Block ")
                console.log("von sleep thread neuer SLEEP thread")
                rolle = "schläfer"
                ++iteration
                startSleepThread()
            } else {
                writeWinnerToLog(iteration, winnerPeerId, solution)
                solution = undefined
                console.log("written Block ")
                console.log("von sleep thread NEUES RÄTSEL ")

                console.log("NEUES RÄTSEL")
                // generate a random number 
                randomNumber = Math.floor(Math.random() * 300).toString();
                console.log('Random number: ' + randomNumber)

                rolle = "rätsler"
                ++iteration
                publishRandomNumber(node, randomNumber, id, topic)
            }

        })

    }
}

module.exports.quiz = quiz;