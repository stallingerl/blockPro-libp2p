const { listenForMessages } = require('./listenForMessages.js');
const { publishRandomNumber } = require('./publishRandomNumber.js');
const { startSleepThread } = require('./startSleepThread.js');


// This function is for the Quizmaster who sets the hidden number
var receivedNumbers = [];
var winnerPeerId
var receivedWinnerPeerId


async function quiz(node, id, signer, iteration) {

    let topic = "Quiz"

    console.log('I am SEED now ' + id)

    // subscribe to topic Quiz
    await node.pubsub.subscribe(topic)

    // listen for messages
    await node.pubsub.on(topic, async (msg) => {
        let data = await msg.data
        let message = uint8ArrayToString(data)

        console.log('received message: ' + message)

        if (!receivedNumbers.includes(`${message}`)) {
            receivedNumbers.push(message)
        }
    })

    if (signer = true) {
        await startSleepThread(node, id, iteration, topic)
    } else {
        // generate a random number 
        let randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)

        await publishRandomNumber(node, randomNumber, id, topic)

        // receive other peers' numbers and save to Array receivedNumbers
        node.pubsub.on(topic, async (msg) => {
            let data = await msg.data
            let message = uint8ArrayToString(data)

            if (message.includes('Solution')) {

                // auch die eigene Nummer muss mit gegeben werden
                if (!receivedNumbers.includes(`${id}, ${randomNumber}`)) {
                    receivedNumbers.push(`${id}, ${randomNumber}`)
                }

                solutionNumber = message.split('Solution ')[1];
                //solutionNumber = 40
                winnerPeerId = await determineWinner(receivedNumbers, solutionNumber, id)


                if (winnerPeerId !== undefined) {
                    console.log("Winner PeerId and Solution number: " + winnerPeerId + solutionNumber)

                    await writeWinnerToLog(iteration, winnerPeerId, solutionNumber)

                    if (winnerPeerId == id) {
                        winnerPeerId = await startSleepThread(node, id, ++iteration, topic)
                    } else {
                        receivedNumbers = []
                        randomNumber = Math.floor(Math.random() * 100).toString();
                        await publishRandomNumber(node, randomNumber, id, topic)
                    }
                }
            }else if(message.includes('winnerPeerId')) {
                receivedWinnerPeerId =  message.split('winnerPeerId, ')[1];

                // wenn die selbst ermittelte winnerPeerId fehlt oder nicht mit der empfangenen übereinstimmt,
                // dann hat die Empfangene vorrang
                // TO DO: Block rejection einbauen

                if (winnerPeerId == undefined || winnerPeerId !== receivedWinnerPeerId ){
                    winnerPeerId = receivedWinnerPeerId
                }

                await writeWinnerToLog(iteration, winnerPeerId, solutionNumber)

                if (winnerPeerId == id) {
                    receivedNumbers = []
                    winnerPeerId = await startSleepThread()
                } else {
                    receivedNumbers = []
                    randomNumber = Math.floor(Math.random() * 100).toString();
                    await publishRandomNumber(node, randomNumber, id, topic)
                }
                
            }    
        })
        }


}

    module.exports.quiz =  quiz;