const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { getAuth } = require("firebase-admin/auth");
admin.initializeApp();
var db = admin.database();
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

function loadGame(uid, difficulty) {
    const answerRef = db.ref('answers/'+difficulty);
    return answerRef.once('value')
    .then(snapshot => {
        return generateQuestions(snapshot.val(), uid)
        .then(question => {
            return question;
        });
    });
}

function authenticate(token) {
    return new Promise((res) => {
        getAuth()
        .verifyIdToken(token)
        .then(user => {
            res(user.uid);
        });
    });
}

function generateQuestions(answers, uid) {
    let questions = {};
    let questionNumbers = [];
    for(answer in answers){
        let answerChars = answers[answer].split('');
        let letters = answerChars.concat(generateLetters(12-answerChars.length));
        questions[answer] = {'letters': shuffle(letters), 'length':answers[answer].length, 'id': answer};
        questionNumbers.push(answer);
    }
    db.ref('users/'+uid)
    .set({
        'questions': questions, 
        'questionNumbers': shuffle(questionNumbers), 
        'score': 100
    });
    return getNextQuestion(uid);
}

function generateLetters(length) {
    var chars = []; 
    for (let i = 0; i<length; i++) {
        let letterIndex = Math.floor(Math.random()*alphabet.length);
        chars.push(alphabet[letterIndex]);
    }
    return chars;
}

function shuffle(arr) {
    let currentIndex = arr.length
    let randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
    return arr;
}

function getNextQuestion(uid) {
    let questionsRef = db.ref('users/' + uid)
    return questionsRef.once('value')
    .then(snapshot => {
        let questionNumbers = [...snapshot.val().questionNumbers];
        if (questionNumbers == [-1]) {
            return;
        }
        let index = questionNumbers.pop();
        questionsRef.set({
            'questionNumbers': questionNumbers, 
            'questions': snapshot.val().questions, 
            'score': snapshot.val().score
        });
        return snapshot.val().questions[index];
    });
}

function getQuestionContext(options) {
    const answerPromise = new Promise((res, rej) => {
        let answerRef = db.ref('answers/'+options.difficulty+'/'+options.id);
        return answerRef.once('value')
        .then(answerSnapshot => {
            res(answerSnapshot.val());
        });
    });

    const userPromise = new Promise((res, rej) => {
        let userRef = db.ref('users/'+options.uid);
            return userRef.once('value')
            .then(userSnapshot => {
                res({'data': userSnapshot.val(), 'ref': userRef});
            });
    });

    const combinedPromise = new Promise((res, rej) => {
        Promise.all([answerPromise, userPromise])
        .then((results) => {
            res({'answer': results[0], 'user': results[1]});
        });
    });

    return combinedPromise;
}

function wordLetterDifference(aStr, b) {
    let a = aStr.split('');
    return [...b.reduce( (acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
        a.reduce( (acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map() ) 
    )].reduce( (acc, [v, count]) => acc.concat(Array(Math.abs(count)).fill(v)), [] );
}

exports.newUser = functions.auth.user().onCreate((user) => {
    return db.ref('users/'+user.uid).set({});
});

exports.initGame = functions.https.onCall((req) => {
    return authenticate(req.token)
    .then(uid => {
        return loadGame(uid, req.difficulty);
    });
});

exports.verifyAnswer = functions.https.onCall((req) => {
    return authenticate(req.token)
    .then(uid => {
        return getQuestionContext({'uid': uid, 'id': req.id, 'difficulty': req.difficulty})
        .then(values => {
            if(req.answer == values.answer) {
                let score = values.user.data.score + 50;
                console.log("log2",values.user.data.questionNumbers);
                values.user.ref.set({
                    'questionNumbers': values.user.data.questionNumbers || [-1], 
                    'questions': values.user.data.questions,
                    'score': score
                });
                return getNextQuestion(uid)
                .then(question => {
                    console.log(question);
                    return {'correct': true,'nextQuestion': question, 'score': score};
                });
            } else {
                return {'correct': false};
            }
        });
    });
});

exports.dropLetterHint = functions.https.onCall((req) => {
    return authenticate(req.token)
    .then(uid => {
        return getQuestionContext({'uid': uid, 'id': req.id, 'difficulty': req.difficulty})
        .then((values) => {
            let score = values.user.data.score;
            if(score < 50) return {'error': 'Score too low', 'score': score};

            let questions = values.user.data.questions;
            let falseLetters = wordLetterDifference(values.answer, questions[req.id].letters);
            let removeLetter = shuffle(falseLetters).pop()[0];

            if(!removeLetter) return {'error': 'Out of letters', 'score': score};
            
            score -= 50;
            questions[req.id].letters.splice(questions[req.id].letters.indexOf(removeLetter),1);
            console.log("log3",values.user.data.questionNumbers);
            values.user.ref.set({
                'questionNumbers': values.user.data.questionNumbers, 
                'questions': questions,
                'score': score
            });

            return {'letter': removeLetter, 'score': score};
        });
    });
});