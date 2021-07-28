
async function determineWinner(receivedNumbers, solutionNumber) {

  let winnerPeerId
  let diff
  for (var i = 1; i < receivedNumbers.length; i++) {
    console.log('erster Eintrag in array: ' + receivedNumbers[i])
    let number = receivedNumbers[i].split(', ')[1]

    diffNeu = Math.abs(solutionNumber - number)
    if (diff == undefined || diffNeu < diff){
      diff = diffNeu
      winnerPeerId = receivedNumbers[i].split(', ')[1]
    } 
    
  }
  return winnerPeerId

}

module.exports.determineWinner = determineWinner;