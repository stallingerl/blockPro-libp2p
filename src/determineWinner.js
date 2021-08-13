  var winnerPeerId
  var receivedNumbers
  var solutionNumber
  var diff
  var id

async function determineWinner(receivedNumbers, solutionNumber, id) {
  return new Promise(resolve => {

  console.log('Nummern von Peers empfangen: ', JSON.stringify(receivedNumbers))

  if (receivedNumbers !== undefined && receivedNumbers.length > 1  ) {
    for (var i = 0; i < receivedNumbers.length ; i++) {
      if (!receivedNumbers[i].includes('Solution')) {
        console.log('erster Eintrag in array: ' + receivedNumbers[i])
        let number = receivedNumbers[i].split(' ')[1]

        diffNeu = Math.abs(solutionNumber - number)
        if (diff == undefined || diffNeu < diff) {
          diff = diffNeu
          winnerPeerId = receivedNumbers[i].split(',')[0]
        }
      }
    }
  }
  resolve(winnerPeerId)
  })
}

module.exports.determineWinner = determineWinner;