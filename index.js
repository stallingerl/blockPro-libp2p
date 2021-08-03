const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const { createNode } = require('./src/createNode.js')
const { peerDiscovery } = require('./src/peerDiscovery.js')
const { topicQuiz } = require('./src/topicQuiz.js')
const { seedQuiz } = require('./src/seedQuiz.js')

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

  await getWinnerPeerId()

  await startNextQuiz(winnerPeerId)
  

  async function getWinnerPeerId() {
    if (peerIdConf.includes('id-1')) {
      winnerPeerId = await seedQuiz(node, id, iteration)
      console.log("Gewinner ist ", winnerPeerId)
    } else {
      winnerPeerId = await topicQuiz(node, id, iteration)
    }
    console.log("Hallo aus getWinnerid  ", winnerPeerId)
  }

  async function startNextQuiz(winnerPeerId){
  while (winnerPeerId !== undefined) {
    console.log('inside  start next quiz ', winnerPeerId)
    if (winnerPeerId == id) {
      console.log('Ende von Runde. Nächste Runde ausgelöst')
      winnerPeerId = await seedQuiz(node, id, ++iteration)
    } else {
      console.log('Ende von Runde. Nächste Runde ausgelöst')
      winnerPeerId = await topicQuiz(node, id, ++iteration)
    }
  }

}

}

main()