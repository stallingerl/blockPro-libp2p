const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const { createNode } = require('./src/createNode.js')
const { peerDiscovery } = require('./src/peerDiscovery.js')
const { topicQuiz } = require('./src/topicQuiz.js')
const { signer } = require('./src/signer.js')

var peerIdConf
var id
var node
var iteration
var winnerPeerId

async function main() {

  peerIdConf = process.env.PEER;

  id = await createOrReadPeerId(peerIdConf)

  node = await createNode(id)

  await peerDiscovery(node)

  id = id.toB58String()

  iteration = 0;

  async function getWinnerPeerId() {
    if (peerIdConf.includes('id-1')) {
      winnerPeerId = await signer(node, id, iteration)
    } else {
      winnerPeerId = await topicQuiz(node, id, iteration)
    }
  }

  await getWinnerPeerId()
}

main()