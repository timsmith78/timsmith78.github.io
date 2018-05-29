// game.js
// JS source for hangman-style word guessing game
var trainWords = ["railway", "train", "station", "locomotive", "trestle", "streetcar", "transportation", "subway", "engineer", "boxcar", "caboose", "crossties", "derailment", "depot", "trackway", "engine", "crossing", "tanker", "signal"];

var game = {
    secretWord: "",
    hiddenWord: "",
    lettersGuessed: "",
    remainingGuesses: 8,
    wins: 0,
    win: false,
    lose: false,
    getNewWord: function () {
        this.secretWord = trainWords[Math.floor(Math.random() * trainWords.length)];
        this.hiddenWord = '_'.repeat(this.secretWord.length);
    },
    updateScreen: function () {
        document.getElementById("hidden-word").innerHTML = this.hiddenWord;
        document.getElementById("remaining-num-guesses").innerHTML = this.remainingGuesses;
        document.getElementById("letters-guessed").innerHTML = this.lettersGuessed;
        document.getElementById("wins").innerHTML = this.wins;
    },
    checkGuess: function (guess) {
        let match = false;

        // first check to see if letter was already guessed
        for (let i = 0; i < this.lettersGuessed.length; i++) {
            if (this.lettersGuessed.charAt(i) === guess)
                return;
        }

        // check if guess is in the secret word, and update the hidden word if it is
        for (let i = 0; i < this.secretWord.length; i++) {
            if (this.secretWord.charAt(i) === guess) {
                match = true;
                this.hiddenWord = this.hiddenWord.substring(0, i) + guess + this.hiddenWord.substring(i + 1);
            }
        }

        // if guess was not in the secret word and we got this far, then append it to lettersGuessed
        if (match === false) {
            this.remainingGuesses--;
            if (this.lettersGuessed.length === 0) {
                this.lettersGuessed = guess;
            } else {
                this.lettersGuessed = this.lettersGuessed + ", " + guess;
            }
        } else {
            // if we got a match, check to see if the game was won
            if (this.hiddenWord === this.secretWord) {
                this.wins++;
                this.win = true;
            }
        }

        // Check if player ran out of guesses
        if (this.remainingGuesses <= 0) {
            this.lose = true;
        }

    },

    init: function () {
        this.getNewWord();
        this.lettersGuessed = "";
        this.remainingGuesses = 8;
        this.win = false;
        this.lose = false;
        this.updateScreen();
    }
}

game.init();

document.addEventListener('keypress', (event) => {
    game.checkGuess(event.key);
    game.updateScreen();
    if (game.win === true) {
        document.getElementById("win-sound").play();
        alert("You win!");
        game.init();
    }
    if (game.lose === true) {
        document.getElementById("lose-sound").play();
        alert("You lose.  The secret word was " + game.secretWord);
        game.init();
    }
})