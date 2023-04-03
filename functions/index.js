const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.database();
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

function generateLetters(length) {
    var chars = []; 
    for (let i = 0; i<length; i++) {
        let letterIndex = Math.floor(Math.random()*alphabet.length);
        chars.push(alphabet[letterIndex]);
    }
    return chars;
}

function shuffle(arr) {
    let currentIndex = arr.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
  
    return arr;
}

exports.getQuestion = functions.https.onCall((data) => {
    const questionNumber = parseInt(data.num);
    const answerRef = db.ref('answers/'+questionNumber);
    return answerRef.once('value').then(snapshot => { 
            let answer = snapshot.val();
            let answerChars = [];
            for (var i = 0; i<answer.length; i++) {
                answerChars.push(answer.slice(i,i+1));
            }
            let letters = answerChars.concat(generateLetters(12-answerChars.length));
            let shuffled = shuffle(letters);
            return {'question': questionNumber,'length': answerChars.length, 'letters': shuffled};
    }); 
});

exports.verifyAnswer = functions.https.onCall((data) => {
    const questionNumber = parseInt(data.question);
    const guess = data.answer;
    const answerRef = db.ref('answers/'+questionNumber);

    return answerRef.once('value').then(snapshot => {
            return guess == snapshot.val();
    }); 
});

exports.getNumOfAnswers = functions.https.onCall((data) => {
    const answerRef = db.ref('answers/');
    return answerRef.once('value').then(snapshot => {
        return snapshot.val().length;
    });
});