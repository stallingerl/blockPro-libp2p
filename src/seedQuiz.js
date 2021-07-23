import { determineWinner } from './determineWinner.js';
import { publishRandomNumber } from './publishRandomNumber.js';
const uint8ArrayToString = require('uint8arrays/to-string')

const topicZaehlerstand = require('./topicZaehlerstand.js')

// This function is for the Quizmaster who sets the hidden number

export async function topicQuiz(node, id) {

    let topic = "Quiz"

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    let receivedNumbers = [];

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

    sleep(900000);

    await publishRandomNumber(node, randomNumber, id)


    winnerPeerId = await determineWinner(receivedNumbers, randomNumber)
    console.log("Winner PeerId: " + winnerPeerId)
    if (iteration !== undefined) {
        iteration = ++iteration
    } else if (iteration == undefined) {
        iteration = 0
    }
    await writeWinnerToLog(id, winnerPeerId)


    let arrayZaehler = await topicZaehlerstand(node)

    await determineWinner(receivedNumbers, randomNumber)

}