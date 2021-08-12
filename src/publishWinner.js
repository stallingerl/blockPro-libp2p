const uint8ArrayFromString = require('uint8arrays/from-string')

var winnerPeerId
async function publishWinner(node, ẃinnerPeerId, topic) {
        let publishWinner = ('winnerPeerId' + ', ' + winnerPeerId)
        console.log('published winnerPeerId = ' + publishWinner)
        node.pubsub.publish(topic, uint8ArrayFromString(publishWinner))

}
module.exports.publishWinner = this.publishWinner;