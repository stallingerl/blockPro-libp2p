const { determineWinner } = require('./determineWinner.js');
const { publishRandomNumber } = require('./publishRandomNumber.js');
const uint8ArrayToString = require('uint8arrays/to-string')
const { topicZaehlerstand } = require('./topicZaehlerstand.js');
const { writeWinnerToLog } = require('./writeWinnerToLog.js')

// This function is for the Quizmaster who sets the hidden number
var receivedNumbers = [];
var winnerPeerId
var node
var id
var solutionNumber
var solution

async function seedQuiz(node, id, iteration) {

    let topic = "Quiz"

    console.log('I am SEED now ' + id)

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)


    // send and receive meter data
    // let arrayZaehler = await topicZaehlerstand(node, id)

    // receive other peers' numbers and save to Array receivedNumbers
    await node.pubsub.on(topic, async (msg) => {
        let data = await msg.data
        let message = uint8ArrayToString(data)

        console.log('received message: ' + message)
        receivedNumbers.push(message)
    })

    // generate a random number 
    solutionNumber = Math.floor(Math.random() * 100).toString();
    solution = 'Solution ' + solutionNumber
    console.log('Random number: ' + solution)

    // sleep until it's time to publish Solution
    let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(30000)

    await publishSolution()

    async function publishSolution() {
        console.log('15 mins later …');

        await publishRandomNumber(node, solution, id, topic)
        console.log('Hallo dies ist im TIMEOUT ', JSON.stringify(receivedNumbers))

        winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)

        if (winnerPeerId == undefined) {
            console.log('KEINE MITSPIELER GEFUNDEN')
            winnerPeerId = id
        }

    }

    await writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
    return winnerPeerId

}

module.exports.seedQuiz = seedQuiz;