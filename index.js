const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const  { createNode } = require('./src/createNode.js')
const { peerDiscovery } = require('./src/peerDiscovery.js')
const { topicQuiz } = require('./src/topicQuiz.js')

async function main () {

  let peerIdConf

  peerIdConf = process.env.PEER;

  const id = await createOrReadPeerId(peerIdConf)

  var node = await createNode(id)

  node = await peerDiscovery(node)

  await topicQuiz(node, id)

}

main()