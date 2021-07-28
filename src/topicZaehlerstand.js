const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

async function topicZaehlerstand(node, id, iteration){

    let topic = 'Zaehlerstand'

    // subscribe to topic
    await node.pubsub.subscribe(topic)

    let receivedZaehlerdata = [];

    // publish own meter data to other peers every 15 mins
    setInterval(() => {
    node.pubsub.publish(topic, uint8ArrayFromString(`${id} sagt: Zählerstand`))
    console.log("Just published my Zählerstand")
    },60000)
  

    // receive other peers' meter data and save to Array receivedZaehlerdata
    node.pubsub.on(topic, async (msg) => {
      let data = await msg.data
      let message = uint8ArrayToString(data) 
      console.log(`${id}received message: ` + message)
  
      receivedZaehlerdata.push(message)
      console.log('array: ' + receivedZaehlerdata.toString())
    })

    return receivedZaehlerdata

}

module.exports.topicZaehlerstand = topicZaehlerstand;