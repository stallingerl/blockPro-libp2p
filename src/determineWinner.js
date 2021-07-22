export async function determineWinner(){

   let diffs = []
   for(var i=1;i<receivedMessages.length;i++){
     console.log('erster Eintrag in array: '+ receivedMessages[i])
     diffs.push(receivedMessages[i])
     console.log('difffs: ' + diffs.toString)
   }

}