const uint8ArrayFromString = require('uint8arrays/from-string')

export async function publishRandomNumber(node){
        // generate a random number 

        let randomNumber = Math.floor(Math.random() * 100).toString();
        console.log('Random number: ' + randomNumber)
    
        let pushMessage = (id.toJSON().id + ', ' + randomNumber)
        console.log('pushMessage = ' + pushMessage)
        node.pubsub.publish(topic, uint8ArrayFromString(pushMessage))

}