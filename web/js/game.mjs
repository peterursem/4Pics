/*
TODO:

winning screen
clear + load next question
wrong answer handle

*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";
import { Overlay } from "./menu.mjs";

//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX2Vq22GojrF4h7bzhTZpR2iu6sBbmX6M",
  authDomain: "pics-1bd1c.firebaseapp.com",
  databaseURL: "https://pics-1bd1c.firebaseio.com",
  projectId: "pics-1bd1c",
  storageBucket: "pics-1bd1c.appspot.com",
  messagingSenderId: "311311584150",
  appId: "1:311311584150:web:7c5922288365dbe47eabb7"
};
const app = initializeApp(firebaseConfig);

// Initialize Firebase
const functions = getFunctions();
const getQuestion = httpsCallable(functions, 'getQuestion');
const verifyAnswer = httpsCallable(functions, 'verifyAnswer');
const getNumOfAnswers = httpsCallable(functions, 'getNumOfAnswers');

//Use emulator
connectFunctionsEmulator(functions, "localhost", 5003);

const imageContainer = document.getElementById('imageContainer');
const textBoxContainer = document.getElementById('textBoxContainer');
const keyboardContainer = document.getElementById('keyboardContainer');
var data = {};
data.questionNumbers = [];
data.hiddenLetters = [];

init();

function init() {
    getNumOfAnswers()
    .then(numQuestions => {
        for (let i=0; i<numQuestions.data; i++) {
            data.questionNumbers.push(i);
        }
    
        loadNewQuestion();
    });
}

function loadNewQuestion() {
    let nextQuestionIndex = data.questionNumbers.splice(Math.floor(Math.random()*data.questionNumbers.length), 1)[0];
    getQuestion({'num': nextQuestionIndex}).then(res => {
        data.question = res.data.question;
        data.images = [];
        data.length = res.data.length;
        data.letters = [...res.data.letters];

        for(let i=1; i<=4; i++){
            data.images.push('/pics/'+data.question+'-'+i+'.jpg');
        }     
        renderNewQuestion();
    });
}

function renderNewQuestion() {
    for (let image of data.images){
        let newImg = document.createElement('img');
            newImg.src = image;       
        imageContainer.appendChild(newImg);
    }

    for(let i = 0; i<data.length; i++){
        let newTextBox = document.createElement('input');
            newTextBox.type = 'text';
            newTextBox.maxLength = '1';
            newTextBox.style.width = 80 / data.length + 'vw';
        textBoxContainer.appendChild(newTextBox);
    }
    let firstBox = textBoxContainer.firstElementChild;
    setFocus(firstBox);

    for(let letter of data.letters){
        let newKey = document.createElement('div');
            newKey.innerText = letter;
            newKey.id = 'letter'+letter;
            newKey.classList.add('visible');
            newKey.onclick = (evt) => {buttonPressed(evt.target);};
        keyboardContainer.appendChild(newKey);
    }
}

function buttonPressed(target) {
    target.classList.add('clicked');
    currentFocus.value = target.innerText;
    currentFocus.dispatchEvent(new KeyboardEvent('keyup',{'key': target.innerText, 'bubbles': true}));
}

var currentFocus;
function setFocus(target) {
    currentFocus = target;
    target.focus();
}

function hideLetter(letter) {
    console.log(data);
    let letterIndex = data.letters.indexOf(letter);
    if (letterIndex != -1) {
        data.letters.splice(letterIndex, 1);
        console.log(data.hiddenLetters);
        data.hiddenLetters.push(letter);
    }

    let clicked = document.querySelector('.clicked');
    let letterButton = document.querySelector('#letter'+letter+'.visible');
    if(clicked){
        clicked.classList.remove('clicked');
        letterButton = clicked;
    }

    if(letterButton) letterButton.classList.replace('visible', 'hidden');
    else console.warn('No letter to remove, wrong letter / qty entered, or the button cannot be found.');
}

function showLetter(letter) {
    let letterIndex = data.hiddenLetters.indexOf(letter);
    if (letterIndex != -1) {
        data.hiddenLetters.splice(letterIndex, 1);
        data.letters.push(letter);
    }

    let letterButton = document.querySelector('#letter'+letter+'.hidden');
    if(letterButton) letterButton.classList.replace('hidden', 'visible');
    else console.warn('No letter to add, wrong letter / qty entered, or the button cannot be found.');
}

function getFieldValues() {
    let values = [];
    textBoxContainer.childNodes.forEach(textBox => {
        values.push(textBox.value);
    });
    return values.join('');
}

function checkAnswer(answer){
    verifyAnswer({'question': data.question, 'answer': answer}).then(res => {
        if (res.data == true){
            new Overlay('Congrats!', 'You guessed "' + answer + '" correctly', {'next' : nextLevel})
        }
        else{
            textBoxContainer.childNodes.forEach(textBox => {
                textBox.value = '';
            });
            Array.from(data.hiddenLetters).forEach(showLetter);
            setFocus(textBoxContainer.firstElementChild);
        }
    });
}

function nextLevel() {
    imageContainer.innerText = '';
    textBoxContainer.innerText = '';
    keyboardContainer.innerText = '';
    data = {questionNumbers: data.questionNumbers, hiddenLetters: []};

    loadNewQuestion();
    Overlay.clearAll();
}

textBoxContainer.addEventListener('keyup', e => {
    let backspace = e.key == 'Backspace';
    let match = new RegExp('[^'+data.letters.join('|')+']', 'g');
    e.target.value = e.target.value.toUpperCase().replace(match,'');
    hideLetter(e.target.value);

    if(backspace == true) {
        if (e.target.value == '') e.target.previousElementSibling.value = '';
        e.target.value = '';
        if (e.target.previousElementSibling && e.target.previousElementSibling.nodeName === "INPUT") {
            showLetter(e.target.previousElementSibling.value);
            e.target.previousElementSibling.value = '';
            setFocus(e.target.previousElementSibling);
        }
        return;
    }

    if(e.target.value != ''){
        if (e.target.nextElementSibling && e.target.nextElementSibling.nodeName === "INPUT") {
            setFocus(e.target.nextElementSibling);
        }
        else {
            checkAnswer(getFieldValues());
        }
    }
});

textBoxContainer.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() == 'input') {
        setFocus(e.target);
    }
});

textBoxContainer.addEventListener('focusout', () => {
    setFocus(currentFocus);
});