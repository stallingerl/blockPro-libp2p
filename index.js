const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const { createNode } = require('./src/createNode.js')
const { peerDiscovery } = require('./src/peerDiscovery.js')
const { quiz } = require('./src/quiz.js')

var peerIdConf
var id
var node
var iteration
var winnerPeerId
var signer

async function main() {

  peerIdConf = process.env.PEER;

  id = await createOrReadPeerId(peerIdConf)

  node = await createNode(id)

  await peerDiscovery(node)

  id = id.toB58String()

  iteration = 0;

  async function getWinnerPeerId() {
    if (peerIdConf.includes('id-1')) {
      signer = true
      await quiz(node, id, signer, iteration)
    } else {
      signer = false
      await quiz(node, id, signer, iteration)
    }
  }

  await getWinnerPeerId()
}

main()