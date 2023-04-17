/*
TODO:

Styling
 
./game.mjs:

show red borders for wrong answer
keep hints hidden after reset
switch letters to different boxes when typing used letters

scoreboard
==> timer

*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {init} from './game.mjs';

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
const functions = getFunctions(app);
export const auth = getAuth(app);

const levels = [
    'easy',
    'hard',
    'test'
];

//USE EMULATOR
connectFunctionsEmulator(functions, "localhost", 5003);
connectAuthEmulator(auth, "http://localhost:9099");

signInAnonymously(auth)
.then(() => {
    drawMenu();
})
.catch(err => {
    console.error(err.code,':',err.message);
});

function start(difficulty) {
    auth.currentUser.getIdToken()
    .then((token) => {
        init(difficulty, functions, token);
    });
}

export function drawMenu() {
    const menuDiv = document.createElement('div');
    menuDiv.classList.add('regColor');
    menuDiv.id = 'menu';
    
    const introText = document.createElement('p');
    introText.innerText = 'This game is made after the app 4 Pics 1 Word. The object of the game is to guess the word that describes all four images, the common denominator.';
    menuDiv.appendChild(introText);

    const levelSelect = document.createElement('div');
    levelSelect.id = 'levelSelect';
    levels.forEach(level => {
        const newButtton = document.createElement('button');
        newButtton.innerText = level;
        newButtton.addEventListener('click', () => {start(level);});
        levelSelect.appendChild(newButtton);
    });
    menuDiv.appendChild(levelSelect);

    document.body.appendChild(menuDiv);
}

export function clearMenu() {
    document.getElementById('menu').remove();
}