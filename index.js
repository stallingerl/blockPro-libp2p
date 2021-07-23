const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const  { createNode } = require('./src/createNode.js')
const { peerDiscovery } = require('./src/peerDiscovery.js')
const { topicQuiz } = require('./src/topicQuiz.js')


async function main () {

  const id = await createOrReadPeerId()

  var node = await createNode(id)

  node = await peerDiscovery(node)

  await topicQuiz(node, id)

}

main()