const { determineWinner } = require('./determineWinner.js');
const { publishRandomNumber } = require('./publishRandomNumber.js');
const uint8ArrayToString = require('uint8arrays/to-string')
const { topicZaehlerstand } = require('./topicZaehlerstand.js');
const { writeWinnerToLog } = require('./writeWinnerToLog.js');
const { listenForMessages } = require('./listenForMessages.js');


// This function is for the Quizmaster who sets the hidden number
var receivedNumbers = [];
var winnerPeerId
var solutionNumber
var solution

async function seedQuiz(node, id, iteration) {

    let topic = "Quiz"

    console.log('I am SEED now ' + id)

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)


    // send and receive meter data
    // let arrayZaehler = await topicZaehlerstand(node, id)

    winnerPeerId = await listenForMessages(node, id, topic, iteration)

    return winnerPeerId

}

module.exports.seedQuiz = seedQuiz;