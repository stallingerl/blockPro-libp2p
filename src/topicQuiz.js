const { determineWinner } =  require('./determineWinner.js');
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { topicZaehlerstand } = require('./topicZaehlerstand.js')
const uint8ArrayToString = require('uint8arrays/to-string')

async function topicQuiz(node, id, iteration) {

    let topic = "Quiz"

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    let receivedNumbers = [];
    let solutionNumber 
    let winnerPeerId

    // receive other peers' numbers and save to Array receivedNumbers
    node.pubsub.on(topic, async (msg) => {
        let data = await msg.data
        let message = uint8ArrayToString(data)

        if(message.includes('Solution')){
            solutionNumber = message.split(' ')[1];;
            winnerPeerId = await determineWinner(receivedNumbers, solutionNumber)
            console.log("Winner PeerId: " + winnerPeerId)

            await writeWinnerToLog(iteration, winnerPeerId, solutionNumber)
        }

        console.log('received message: ' + message)

        receivedNumbers.push(message)
        console.log('array: ' + receivedNumbers.toString())
    })

        // generate a random number 
        let randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)

        await publishRandomNumber(node, randomNumber, id, topic)

        let arrayZaehler = await topicZaehlerstand(node)

}

module.exports.topicQuiz = topicQuiz;