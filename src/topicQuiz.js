import { determineWinner } from './determineWinner.js';
import { publishRandomNumber } from './publishRandomNumber.js';
import { writeWinnerToLog } from './writeWinnerToLog.js';
const uint8ArrayToString = require('uint8arrays/to-string')

const topicZaehlerstand = require('./topicZaehlerstand.js')

export async function topicQuiz(node, id) {

    let topic = "Quiz"

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    let receivedNumbers = [];
    let solutionNumber 
    let winnerPeerId
    let iteration
    id = id.toJSON().id

    // receive other peers' numbers and save to Array receivedNumbers
    node.pubsub.on(topic, async (msg) => {
        let data = await msg.data
        let message = uint8ArrayToString(data)

        if(message.includes('Solution')){
            solutionNumber = message.substr(1,message.indexOf('Solution '));
            winnerPeerId = await determineWinner(receivedNumbers, solutionNumber)
            console.log("Winner PeerId: " + winnerPeerId)
            if (iteration !== undefined){
                iteration = ++iteration
            }else if(iteration == undefined) {
                iteration = 0
            }
            await writeWinnerToLog(id, winnerPeerId, solutionNumber)
        }

        console.log('received message: ' + message)

        receivedNumbers.push(message)
        console.log('array: ' + receivedNumbers.toString())
    })

        // generate a random number 
        let randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)

        await publishRandomNumber(node, randomNumber, id)

        let arrayZaehler = await topicZaehlerstand(node)

}