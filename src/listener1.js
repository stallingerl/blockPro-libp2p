const createOrReadPeerId = require('./createOrReadPeerId.js')
const createNode = require('./createNode.js')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')


async function main () {

  const id = await createOrReadPeerId()

  const node = await createNode(id)

  node.on('peer:discovery', (peerId) => {
    console.log(`discovered peer: ${peerId.toB58String()}`)
  })

  const cache = {}
  node.connectionManager.on('peer:connect', (connection) => {
    const connectedPeerId = connection.remotePeer.toB58String()
    if (cache[connectedPeerId]) return
    cache[connectedPeerId] = true
    console.log('connection established to:', connectedPeerId)
  })

  node.connectionManager.on('peer:disconnect', (connection) => {
    console.log(`peer disconnected: ${connection.remotePeer.toB58String()}`)
  })

  console.log(`peer node started with id: ${node.peerId.toB58String()}`)

  ;[node].forEach((node, index) => console.log(`Node1 starting with id: ${node.peerId.toB58String()}`))

  await node.start()
  console.log("node1 multiaddr: " + node.multiaddrs)
  const topic = 'news'

  node.pubsub.on(topic, (msg) => {
    console.log(`node1 received: ${uint8ArrayToString(msg.data)}`)
  })

  await node.pubsub.subscribe(topic)

  let topic2 = "randomNumbers"

  await node.pubsub.subscribe(topic2)
  
  let receivedMessages = [];

  node.pubsub.on(topic2, async (msg) => {
    let data = await msg.data
    let message = uint8ArrayToString(data) 
    console.log('received message: ' + message)

    receivedMessages.push(message)
    console.log('array: ' + receivedMessages.toString())
    // receivedMessages = receivedMessages.concat(message + ', ') 
    // console.log('receivedMessages= ' + receivedMessages)
  })

    // random number every 60 seconds
    setInterval (() => {
      let randomNumber = Math.floor(Math.random() * 100).toString();
      console.log('Random number: ' + randomNumber)
      let pushMessage = (id.toJSON().id + ', ' + randomNumber)
      console.log('pushMessage = ' + pushMessage)
      node.pubsub.publish(topic2, uint8ArrayFromString(pushMessage))
    }, 10000)  


    // // node1 publishes "news" every second
    // setInterval(() => {
    //   node.pubsub.publish(topic, uint8ArrayFromString('Node 1 sagt: Ich bin der Seed-Node!'))
    // }, 10000)

    let diffs = []
    for(var i=1;i<receivedMessages.length;i++){
      console.log('erster Eintrag in array: '+ receivedMessages[i])
      diffs.push(receivedMessages[i])
      console.log('difffs: ' + diffs.toString)
    }

}

main()