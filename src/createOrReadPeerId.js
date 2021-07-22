const fs = require('fs');
const PeerId = require('peer-id')


export function createOrReadPeerId(){ 
  async() => {
    let peerIdConf = './peerIds/.id.json'
    let peerId
    try {
      peerId = await PeerId.createFromJSON(require(peerIdConf))
      console.log('Read existing peerId = ', peerId.toJSON().id)
    } catch (error) {
      console.warn(`Couldn't read peer id from ${peerIdConf}. Create new peerId`)
      peerId = await PeerId.create({ bits: 1024, keyType: 'RSA' });
      console.log(JSON.stringify(peerId.toJSON(), null, 2))
      fs.writeFileSync('.id.json', JSON.stringify(peerId));
    }
    return peerId
  }
}

