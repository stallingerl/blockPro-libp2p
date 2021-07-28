const { determineWinner } = require('./determineWinner.js');
const { publishRandomNumber } = require('./publishRandomNumber.js');
const uint8ArrayToString = require('uint8arrays/to-string')
const sleep = require('sleep-promise')

const { topicZaehlerstand } = require('./topicZaehlerstand.js');
const { topicQuiz } = require('./topicQuiz.js');
const { writeWinnerToLog } = require('./writeWinnerToLog.js')

// This function is for the Quizmaster who sets the hidden number

async function seedQuiz(node, id) {

    let topic = "Quiz"

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    let receivedNumbers = [];
    let winnerPeerId
    let iteration

    // receive other peers' numbers and save to Array receivedNumbers
    node.pubsub.on(topic, async (msg) => {
        let data = await msg.data
        let message = uint8ArrayToString(data)
        console.log('received message: ' + message)

        receivedNumbers.push(message)
        console.log('array: ' + receivedNumbers.toString())
    })

    // generate a random number 
    let randomNumber = 'Solution ' + Math.floor(Math.random() * 100).toString();
    console.log('Random number: ' + randomNumber)

    // send and receive meter data
    let arrayZaehler = await topicZaehlerstand(node)

    sleep(5000).then(async function () {
        console.log('15 mins later …');

        await publishRandomNumber(node, randomNumber, id, topic)

        winnerPeerId = await determineWinner(receivedNumbers, randomNumber)

        // lacking other peers self is the winner
        if (winnerPeerId == undefined){
            winnerPeerId = id
        }
        console.log("Winner PeerId: " + winnerPeerId)
        if (iteration !== undefined) {
            iteration = ++iteration
        } else if (iteration == undefined) {
            iteration = 0
        }
        await writeWinnerToLog(iteration, winnerPeerId, randomNumber)

        if (winnerPeerId == id){
            await seedQuiz(node, id)
        } else {
            await topicQuiz(node, id)
        }

    });

}

module.exports.seedQuiz = seedQuiz;