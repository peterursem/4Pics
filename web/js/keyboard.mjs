import { currentFocus } from "./textbox.mjs";

export var letters = [];
var hiddenLetters = [];

export function makeKeyboard(newLetters) {
    keyboardContainer.innerText = '';
    letters = newLetters;
    hiddenLetters = [];
    for(let letter of newLetters){
        let newKey = document.createElement('div');
        newKey.innerText = letter;
        newKey.id = 'letter'+letter;
        newKey.classList.add('visible','invColor');
        newKey.onclick = (evt) => {buttonPressed(evt.target);};
        keyboardContainer.appendChild(newKey);
    }
}

export function hideLetter(letter) {
    let clicked = document.querySelector('.clicked');
    let letterButton = document.querySelector('#letter'+letter+'.visible');

    if(clicked){
        clicked.classList.remove('clicked');
        letterButton = clicked;
    }

    let letterIndex = letters.indexOf(letter);
    if (letterIndex == -1){
        console.warn('No letter to remove, wrong letter / qty entered, or the button cannot be found.');
        return;
    } 

    letters.splice(letterIndex, 1);
    hiddenLetters.push(letter);

    letterButton.classList.replace('visible', 'hidden'); 
}

export function showLetter(letter) {
    console.log('Showletter:', letter);
    let letterIndex = hiddenLetters.indexOf(letter);
    let letterButton = document.querySelector('#letter'+letter+'.hidden');

    if (letterIndex == -1) {
        console.warn('No letter to add, wrong letter / qty entered, or the button cannot be found.');
        return;
    }

    if (letterButton.classList.contains('hinted')) {
        console.log('Letter was hidden as part of a hint')
    }

    hiddenLetters.splice(letterIndex, 1);
    letters.push(letter);
    letterButton.classList.replace('hidden', 'visible');
}

export function resetKeyboard() {
    Array.from(hiddenLetters).forEach(showLetter);
}

function buttonPressed(target) {
    target.classList.add('clicked');
    currentFocus.dispatchEvent(new KeyboardEvent('keydown',{'key': target.innerText, 'bubbles': true}));
    currentFocus.dispatchEvent(new KeyboardEvent('keyup',{'key': target.innerText, 'bubbles': true}));
}