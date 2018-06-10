var questionDB;
var numCorrect;
var numIncorrect;
var currQuestionNum;
var timer;
const autoTimer = 3000;

function initGame() {

    numCorrect = 0;
    numIncorrect = 0;
    currQuestionNum = 0;

    // Set up start screen
    $(".playarea").empty();
    $(".playarea").html("<h2>Test your knowledge of the world around you!</h2>");
    var startBtn = $("<button>");
    //startBtn.attr("id", "start-button");
    startBtn.attr("class", "btn btn-info my-2");
    startBtn.text("Start");
    $(".playarea").append(startBtn);

    // Fetch trivia questions
    $.ajax({
        url: "https://opentdb.com/api.php?amount=10&category=22&difficulty=hard&type=multiple&encode=url3986",
        method: "GET"
    }).then(function (result) {
        questionDB = result;
        startBtn.click(displayQuestion);
    })
}

function displayQuestion() {
    var pa = $(".playarea");
    pa.empty();

    // Check if we're out of questions -- if so, display the result
    if (currQuestionNum >= questionDB.results.length) {
        pa.append($("<h2>").text("GAME OVER!!"));
        pa.append($("<h2>").text("Correct Answers: " + numCorrect));
        pa.append($("<h2>").text("Incorrect Answers: " + numIncorrect));
        pa.append($("<br>"));
        var againBtn = $("<button>").text("Play Again");
        againBtn.attr("class", "btn btn-info my-2");
        pa.append(againBtn);
        againBtn.click(initGame);
        return;
    }

    // Get the question
    let q = questionDB.results[currQuestionNum];
    var currQuestion = $("<p>");
    currQuestion.text((currQuestionNum + 1) + ". " + decodeURIComponent(q.question));
    pa.append(currQuestion);

    // Randomly choose slot for correct answer
    let correctAns = Math.floor(Math.random() * 4);
    let wrongAns = 0;

    // Display the answers
    let ansList = $("<ul>");
    ansList.attr("class", "list-group");
    pa.append(ansList);
    for (let ansIter = 0; ansIter < 4; ++ansIter) {
        let currAns = $("<li>");
        currAns.text(decodeURIComponent((ansIter === correctAns) ? q.correct_answer : q.incorrect_answers[wrongAns++]));
        currAns.attr("class", "answer list-group-item list-group-item-info list-group-item-action my-2");
        currAns.attr("ansNum", ansIter);
        pa.append(currAns);
    }
    pa.append($("</ul>"));
    pa.append($("<br>"));

    // Set timer
    let timerDiv = $("<h2>");
    let timerNum = 15;
    let timeOut = false;
    pa.append(timerDiv);
    timer = setInterval(() => {
        timerDiv.text("Time remaining: " + timerNum--);
        if (timerNum < 0) {

            // If time runs out, give correct answer...
            pa.empty();
            let timeUpDiv = $("<h2>").text("Time's up! The correct answer was: ");
            let giveAns = $("<h2>").text(decodeURIComponent(q.correct_answer));
            pa.append(timeUpDiv);
            pa.append(giveAns);
            clearInterval(timer);

            // ...and move on after short delay for user to see correct answer
            numIncorrect++;
            currQuestionNum++;
            let moveOnTimer = setTimeout(() => {
                displayQuestion();
            }, autoTimer);
        }
    }, 1000);
    
   // Check for click on answer
    $(".answer").click( (evt) => { 
        clearInterval(timer);
        let corrAns = $("<h2>")
        if (evt.target.getAttribute("ansNum") == correctAns) {
            corrAns.text("CORRECT!!!");
            pa.append(corrAns);
            numCorrect++;
        } else {
            corrAns.text("INCORRECT. The correct answer was: ");
            let giveAns = $("<h2>").text(decodeURIComponent(q.correct_answer));
            pa.append(corrAns);
            pa.append(giveAns);
            numIncorrect++;
        }

        currQuestionNum++; 
        let moveOnTimer = setTimeout(() => {
            displayQuestion();
        }, autoTimer);
        
    })
}

initGame();

