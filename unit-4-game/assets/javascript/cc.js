// cc.js
var goalNum = 0;
var myScore = 0;
var wins = 0;
var losses = 0;

function getRandomGoal() {
    return (Math.floor(Math.random() * 101) + 19);
}

function getRandomCrystalNum() {
    return (Math.floor(Math.random() * 12) + 1);
}

function initGame() {
    goalNum = getRandomGoal();
    $("#goal").text("Number to reach: " + goalNum);
    myScore = 0;
    $("#total").text("Your total so far: " + myScore);
    $("#crystals").children().each(function() {
        $(this).data("myNum", getRandomCrystalNum()); 
    })
}

initGame();

$(".gem").click( function() {
    myScore += $(this).data("myNum");
    $("#total").text("Your total so far: " + myScore);
    if (myScore === goalNum) {
        $("#msg").text("You Win!!");
        $("#wins").text("Wins: " + ++wins);
        initGame.call(window);
    }
    if (myScore > goalNum) {
        $("#msg").text("You Lose!!");
        $("#losses").text("Losses: " + ++losses);
        initGame.call(window);
    }
})