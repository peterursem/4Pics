import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";

import { Overlay } from "./overlay.mjs";
import { hideLetter, letters, makeKeyboard, resetKeyboard } from "./keyboard.mjs";
import { makeTextBoxes, resetBoxes } from "./textbox.mjs";
import { auth, clearMenu, drawMenu } from "./main.mjs";

var questionNumber = -1;
var gameDifficulty;

const imageContainer = document.getElementById('imageContainer');
const textBoxContainer = document.getElementById('textBoxContainer');
const keyboardContainer = document.getElementById('keyboardContainer');
const score = document.getElementById('score');

var getQuestion;
var verifyAnswer;
var initGame;
var hint

export function init(difficulty, functions, authToken) {
    getQuestion = httpsCallable(functions, 'getQuestion');
    verifyAnswer = httpsCallable(functions, 'verifyAnswer');
    initGame = httpsCallable(functions, 'initGame');
    hint = httpsCallable(functions, 'dropLetterHint');


    clearMenu();
    imageContainer.style.display = 'flex';
    textBoxContainer.style.display = 'flex';
    keyboardContainer.style.display = 'flex';

    score.innerText = 'Score: \n' + 100;

    const hintButton = document.getElementById('hint');
    hintButton.onclick = getHint;
    hintButton.style.display = 'block';

    gameDifficulty = difficulty;
    initGame({'difficulty': difficulty, 'token': authToken})
    .then(res => {
        loadNewQuestion(res.data);
    });
}

export function checkAnswer(answer){
    auth.currentUser.getIdToken()
    .then((token) => {
        verifyAnswer({'id': questionNumber, 'answer': answer, 'difficulty': gameDifficulty, 'token': token})
        .then(res => {
            console.log(res.data);
            if (res.data.correct == true){
                if(res.data.nextQuestion == null){
                    return new Overlay('Congrats!', 'You guessed "' + answer + '" correctly and beat the game! \n your final score was: '+ res.data.score, {'Finish' : clearQuestion});
                }
                score.innerText = 'Score: \n' + res.data.score;
                loadNewQuestion(res.data.nextQuestion);
                return new Overlay('Congrats!', 'You guessed "' + answer + '" correctly', {'next' : Overlay.clearAll});
            }
            resetCurrentLevel();
        });
    });
}

function clearQuestion() {
    imageContainer.innerText = '';
    keyboardContainer.innerText = '';
    textBoxContainer.innerText = '';
    imageContainer.style.display = 'none';
    keyboardContainer.style.display = 'none';
    textBoxContainer.style.display = 'none';
    score.style.display = 'none';
    drawMenu();
    Overlay.clearAll();
}

function loadNewQuestion(question) { 
    questionNumber = question.id;       
    makeTextBoxes(question.length);
    makeKeyboard(question.letters);
    imageContainer.innerText = '';
    for(let i=1; i<=4; i++){
        makeImg('/pics/'+gameDifficulty+'/'+question.id+'-'+i+'.jpg');
    }   
}

function makeImg(src) {
    let newImg = document.createElement('img');
    newImg.src = src;       
    imageContainer.appendChild(newImg);
}

function resetCurrentLevel() {
    resetKeyboard();
    resetBoxes();
}

function getHint(){
    auth.currentUser.getIdToken()
    .then(token => {
        hint({'id': questionNumber, 'letters': letters, 'difficulty': gameDifficulty, 'token': token})
        .then(res => {
            score.innerText = 'Score: \n' + res.data.score;
            document.querySelector('#letter'+res.data.letter+'.visible');
            hideLetter(res.data.letter);
        });
    });
}