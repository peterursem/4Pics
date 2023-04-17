let overlayCanvas = document.getElementById('overlay');
export class Overlay {
    constructor(titleText, contentText, options){
        this.elem = document.createElement('div');
            this.elem.id = 'overlayContent';
        
        let title = document.createElement('h1');
            title.innerText = titleText;
        
        let content = document.createElement('p');
            content.innerText = contentText;

        let buttonHolder = document.createElement('div');
            buttonHolder.id = 'buttonHolder';
        for(let option in options){
            let newButtton = document.createElement('button');
                newButtton.id = option;
                newButtton.innerText = option;
                newButtton.onclick = function() {options[option]()};
            buttonHolder.appendChild(newButtton);
        }

        this.appendChildren([title, content, buttonHolder]);
        overlayCanvas.appendChild(this.elem);
        overlayCanvas.classList.replace('hidden', 'visible');
    }

    static clearAll() {
        overlayCanvas.classList.replace('visible', 'hidden');
        overlayCanvas.innerText = '';
    }

    appendChildren(children) {
        for(let child of children){
            this.elem.appendChild(child);
        }
    }
}