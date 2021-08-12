const { listenForMessages } = require('./listenForMessages.js');


// This function is for the Quizmaster who sets the hidden number
var receivedNumbers = [];
var winnerPeerId


async function signer(node, id, iteration) {

    let topic = "Quiz"

    console.log('I am SEED now ' + id)

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)


    // send and receive meter data
    // let arrayZaehler = await topicZaehlerstand(node, id)

    await listenForMessages(node, id, topic, iteration)

}

module.exports.signer = signer;