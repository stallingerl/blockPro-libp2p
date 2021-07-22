const uint8ArrayFromString = require('uint8arrays/from-string')

export async function publishRandomNumber(node, randomNumber){    
        let pushMessage = (id.toJSON().id + ', ' + randomNumber)
        console.log('pushMessage = ' + pushMessage)
        node.pubsub.publish(topic, uint8ArrayFromString(pushMessage))

}