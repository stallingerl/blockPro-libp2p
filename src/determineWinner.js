export async function determineWinner(receivedNumbers, solutionNumber) {

  let winnerPeerId
  let diff
  for (var i = 1; i < receivedNumbers.length; i++) {
    console.log('erster Eintrag in array: ' + receivedNumbers[i])
    let number = receivedNumbers[i].substring(1, indexOf(', '))

    diffNeu = Math.abs(solutionNumber - number)
    if (diff == undefined || diffNeu < diff){
      diff = diffNeu
      winnerPeerId = receivedNumbers[i].substring(0, indexOf(','))
    } 
    
  }
  return winnerPeerId

}