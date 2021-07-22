
export async function topicZaehlerstand(node){

    let topic = 'Zaehlerstand'

    // subscribe to topic
    await node.pubsub.subscribe(topic)

    let receivedZaehlerdata = [];

    // receive other peers' meter data and save to Array receivedZaehlerdata
    node.pubsub.on(topic, async (msg) => {
      let data = await msg.data
      let message = uint8ArrayToString(data) 
      console.log('received message: ' + message)
  
      receivedZaehlerdata.push(message)
      console.log('array: ' + receivedZaehlerdata.toString())
    })

    // publish own meter data to other peers every 15 mins
    setInterval(() => {
        node.pubsub.publish(topic, uint8ArrayFromString('Node 1 sagt: Ich bin der Seed-Node!'))
    }, 900000)

    return receivedZaehlerdata

}