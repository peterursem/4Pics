import { checkAnswer } from "./game.mjs";
import { hideLetter, showLetter, letters } from "./keyboard.mjs";

const textBoxContainer = document.getElementById('textBoxContainer');

export function makeTextBoxes(count) {
    textBoxContainer.innerText = '';
    for(let i = 0; i<count; i++){
        let input = document.createElement('input');
        input.type = 'text';
        input.maxLength = '1';
        input.classList.add('regColor')
        input.style.width = 80 / count + 'vw';
        textBoxContainer.appendChild(input);
    }
    setFocus(textBoxContainer.firstElementChild);
}

export function resetBoxes() {
    textBoxContainer.childNodes.forEach(textBox => {
        textBox.value = '';
    });
    setFocus(textBoxContainer.firstElementChild);
}

export var currentFocus;
function setFocus(target) {
    currentFocus = target;
    target.focus();
}

function getFieldValues() {
    let values = [];
    textBoxContainer.childNodes.forEach(textBox => {
        values.push(textBox.value);
    });
    return values.join('');
}

function handleKeypress(evt){
    let key = evt.key.toUpperCase();
    let match = new RegExp('[^'+letters.join('|')+']', 'g');

    if(evt.key.length == 1) {
        evt.target.value = key.replace(match,'');
    }

    if(evt.target.value == '') {
        return;
    }

    hideLetter(key);

    if (hasNextNeighbour(evt.target)) {
        setFocus(evt.target.nextElementSibling);
        return;
    }
    checkAnswer(getFieldValues());
}

function hasNextNeighbour(target){
    return target.nextElementSibling && target.nextElementSibling.nodeName == 'INPUT';
}

function hasLastNeighbour(target){
    return target.previousElementSibling && target.previousElementSibling.nodeName == 'INPUT';
}

textBoxContainer.addEventListener('keydown', evt => {
    if(evt.key.length == 1) {
        if(evt.target.value != '') {
            showLetter(evt.target.value);
            evt.target.value = '';
        }
        return;
    }

    if(evt.key == 'Backspace' || evt.key == 'ArrowLeft') {
        if (evt.target.value != '') {
            evt.target.value = '';
            showLetter(evt.target.value);
            return;
        }
        if (hasLastNeighbour(evt.target)) {
            showLetter(evt.target.previousElementSibling.value);
            evt.target.previousElementSibling.value = '';
            setFocus(evt.target.previousElementSibling);
        }
        return;
    }
});

textBoxContainer.addEventListener('keyup', evt => {
    handleKeypress(evt);
});

textBoxContainer.addEventListener('click', evt => {
    if(evt.target.tagName.toLowerCase() == 'input') {
        setFocus(evt.target);
    }
});

textBoxContainer.addEventListener('focusout', () => {
    setFocus(currentFocus);
});