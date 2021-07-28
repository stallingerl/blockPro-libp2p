const { createOrReadPeerId } = require('./src/createOrReadPeerId')
const  { createNode } = require('./src/createNode.js')
const { peerDiscovery } = require('./src/peerDiscovery.js')
const { topicQuiz } = require('./src/topicQuiz.js')
const { seedQuiz } = require('./src/seedQuiz.js')

async function main () {

  let peerIdConf

  peerIdConf = process.env.PEER;

  var id = await createOrReadPeerId(peerIdConf)

  var node = await createNode(id)

  node = await peerDiscovery(node)

  id = id.toB58String()
  
  if(peerIdConf.includes('id-1')){
    await seedQuiz(node, id)
  }else{
    await topicQuiz(node, id)
  }

}

main()