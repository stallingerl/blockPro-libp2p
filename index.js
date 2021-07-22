const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const  { createNode } = require('./src/createNode.js')

async function main () {

  const id = await createOrReadPeerId()

  const node = await createNode(id)

  node = await peerDiscovery(node)

  await topicQuiz(node, id)

}

main()