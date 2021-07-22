const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const Gossipsub = require('libp2p-gossipsub')
const Bootstrap = require('libp2p-bootstrap')
const PeerId = require('peer-id')
const bootstrapers = require('./peerIds/bootstrapers.js')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const fs = require('fs');

async function main () {

  const createNode = async (peerId) => {
    const node = await Libp2p.create({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/15000']
      },
      modules: {
        transport: [TCP],
        streamMuxer: [Mplex],
        connEncryption: [NOISE],
        pubsub: Gossipsub,
        peerDiscovery: [Bootstrap]
      },
      config: {
        peerDiscovery: {
          bootstrap: {
            interval: 60e3,
            enabled: true,
            list: bootstrapers
          }
        }
      },
      peerId: peerId
    })

    return node
  }

  const createOrReadPeerId = async (peerIdConf) => {
    let peerId
    try {
      peerId = await PeerId.createFromJSON(require(peerIdConf))
      console.log('Read existing peerId = ', peerId.toJSON().id)
    } catch (error) {
      console.warn(`Couldn't read peer id from ${peerIdConf}. Create new peerId` )
      peerId = await PeerId.create({ bits: 1024, keyType: 'RSA' });
      console.log(JSON.stringify(peerId.toJSON(), null, 2))
      fs.writeFileSync('.id-3.json', JSON.stringify(peerId));
    }
    return peerId
  } 

  let peerIdConf = './.id-3.json'

  const id = await createOrReadPeerId(peerIdConf)


  const node3 = await createNode(id)

  node3.on('peer:discovery', (peerId) => {
    console.log(`discovered peer: ${peerId.toB58String()}`)
  })

  const cache = {}
  node3.connectionManager.on('peer:connect', (connection) => {
    const connectedPeerId = connection.remotePeer.toB58String()
    if (cache[connectedPeerId]) return
    cache[connectedPeerId] = true
    console.log('connection established to:', connectedPeerId)
  })

  node3.connectionManager.on('peer:disconnect', (connection) => {
    console.log(`peer disconnected: ${connection.remotePeer.toB58String()}`)
  })

  console.log(`peer node3 started with id: ${node3.peerId.toB58String()}`)

  ;[node3].forEach((node, index) => console.log(`Node3 starting with id: ${node3.peerId.toB58String()}`))

  await node3.start()
  console.log("node3 multiaddr: " + node3.multiaddrs)
  const topic = 'news'

  node3.pubsub.on(topic, (msg) => {
    console.log(`node3 received: ${uint8ArrayToString(msg.data)}`)
  })
  await node3.pubsub.subscribe(topic)

  let topic2 = "randomNumbers"

  await node3.pubsub.subscribe(topic2)

  let receivedMessages = []
  let randomNumber
  
  node3.pubsub.on(topic2, async (msg) => {
    let data = await msg.data
    let message = uint8ArrayToString(data) 

    receivedMessages.push(message)
    console.log('received message: ' + message)
    console.log('array: ' + receivedMessages.toString())
      //receivedMessages = receivedMessages.concat(message + ', ') 
      //console.log('receivedMessages= ' + receivedMessages)
  })

    
    // // node3 publishes "news" every second
    // setInterval(() => {
    //   node3.pubsub.publish(topic, uint8ArrayFromString('Node 3 sagt: Hier könnte Ihr Zählerstand stehen!'))
    // }, 10000)

    // random number every 60 seconds
    setInterval (() => {
      randomNumber = Math.floor(Math.random() * 100).toString();
      console.log('Random number: ' + randomNumber)
      let pushMessage = (id.toJSON().id + ', ' + randomNumber)
      console.log('pushMessage = ' + pushMessage)
      node3.pubsub.publish(topic2, uint8ArrayFromString(pushMessage))
    }, 10000)

    if(receivedMessages){

    }
  
}

main()
