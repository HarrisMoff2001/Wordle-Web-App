'use strict';

let targetWord = '';
let currentGuess = '';
let guessNumber = 0;
let currentRow = 0;
let wordLen = 0;

function numofQuestionMarks(wordLen) {
    let questionMarks = '';
    for (let i = 0; i < wordLen; i++) {
        questionMarks += '?';
    }
    return questionMarks;
}

function wordle() {
    fetch(`https://api.datamuse.com/words?sp=${numofQuestionMarks(wordLen)}&max=1000`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                console.error('No words found. Please try again later.');
                return;
            }
            const randomIndex = Math.floor(Math.random() * data.length);
            targetWord = data[randomIndex].word.toUpperCase();
            //console.log(targetWord);
            resetGame();
            getRows(wordLen);
        })
        .catch(error => console.error('Error:', error));
}

function getRows(length) {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${length}, 1fr)`;

    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < length; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

document.getElementById('set-word-length').addEventListener('click', () => {
    const wordLengthInput = document.getElementById('word-length');
    wordLen = parseInt(wordLengthInput.value, 10);

    // Validate input
    if (wordLen < 2 || wordLen > 8 || isNaN(wordLen)) {
        alert('Please enter a valid number between 2 and 8.');
        return;
    }
    wordle();
});

function resetGame() {
    currentGuess = '';
    guessNumber = 0;
    currentRow = 0;
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        const tiles = row.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.style.backgroundColor = '';
        });
    });
    hidePopups();
}

function handleGuess(guess) {
    guess = guess.toUpperCase();
    guessNumber++;

    if (guess.length !== wordLen) {
        return;
    }

    const result = [];
    for (let i = 0; i < wordLen; i++) {
        if (guess[i] === targetWord[i]) {
            result.push('correct');
        } else if (targetWord.includes(guess[i])) {
            result.push('present');
        } else {
            result.push('absent');
        }
    }

    updateBoard(guess, result);

    if (result.every(r => r === 'correct')) {
        showWinPopup();
    } else if (guessNumber >= 6) {
        showLossPopup();
    }
}

function updateBoard(guess, result) {
    console.log(guess, result);
    const rows = document.querySelectorAll('.row');
    const tiles = rows[currentRow].querySelectorAll('.tile');

    for (let i = 0; i < wordLen; i++) {
        tiles[i].textContent = guess[i];

        if (result[i] === 'correct') {
            tiles[i].style.backgroundColor = 'green';
        } else if (result[i] === 'present') {
            tiles[i].style.backgroundColor = 'orange';
        } else {
            tiles[i].style.backgroundColor = 'grey';
        }
    }

    currentRow++;
}

function showWinPopup() {
    const winPopup = document.getElementById('win-popup');
    const wordToGuess = document.getElementById('word-to-guess-win');
    wordToGuess.innerHTML = targetWord;
    winPopup.style.display = 'flex';
}

function showLossPopup() {
    const lossPopup = document.getElementById('loss-popup');
    const wordToGuess = document.getElementById('word-to-guess-loss');
    wordToGuess.innerHTML = targetWord;
    lossPopup.style.display = 'flex';

}

function hidePopups() {
    document.getElementById('win-popup').style.display = 'none';
    document.getElementById('loss-popup').style.display = 'none';
}

document.addEventListener('keydown', function (event) {
    if (event.key.match(/^[a-zA-Z]$/) && currentGuess.length < wordLen) {
        currentGuess += event.key.toUpperCase();
        updateCurrentRow();
    }

    if (event.key === 'Backspace' && currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateCurrentRow();
    }

    if (event.key === 'Enter' && currentGuess.length === wordLen) {
        handleGuess(currentGuess);
        currentGuess = '';
    }
});

// Update the board to reflect the current guess on the current row
function updateCurrentRow() {
    const rows = document.querySelectorAll('.row');
    const tiles = rows[currentRow].querySelectorAll('.tile');

    for (let i = 0; i < wordLen; i++) {
        tiles[i].textContent = '';
    }

    for (let i = 0; i < currentGuess.length; i++) {
        tiles[i].textContent = currentGuess[i];
    }
}

// Event listeners for play again buttons
document.getElementById("play-again").addEventListener("click", playAgain);
document.getElementById("play-again-button").addEventListener("click", playAgain);

function playAgain() {
    hidePopups();
    resetGame();
    wordle();
}