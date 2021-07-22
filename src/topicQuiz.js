import { determineWinner } from './determineWinner.js';
import { publishRandomNumber } from './publishRandomNumber.js';
const uint8ArrayToString = require('uint8arrays/to-string')

const topicZaehlerstand = require('./topicZaehlerstand.js')

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

    setInterval(() => {

        // generate a random number 
        let randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)

        await publishRandomNumber(node, randomNumber)

        let arrayZaehler = await topicZaehlerstand(node)

        await determineWinner(receivedNumbers)

    }, 900000)

}