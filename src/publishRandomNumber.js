const uint8ArrayFromString = require('uint8arrays/from-string')

async function publishRandomNumber(node, randomNumber, id, topic){    
        let pushMessage = (id + ', ' + randomNumber)
        console.log('pushMessage = ' + pushMessage)
        node.pubsub.publish(topic, uint8ArrayFromString(pushMessage))

}
module.exports.publishRandomNumber = publishRandomNumber;