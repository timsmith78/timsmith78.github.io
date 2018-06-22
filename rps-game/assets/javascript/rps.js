// Initialize Firebase
var config = {
    apiKey: "AIzaSyAHsl4o-7W27lZOi7PcsmNMpPuY2qSOAk4",
    authDomain: "rps-tds.firebaseapp.com",
    databaseURL: "https://rps-tds.firebaseio.com",
    projectId: "rps-tds",
    storageBucket: "rps-tds.appspot.com",
    messagingSenderId: "440180406378"
};
firebase.initializeApp(config);

var rpsDb = firebase.database();
var myPlayerID = 0
var myPlayerData = {
    name: "",
    wins: 0,
    losses: 0,
    lastPick: ""
}
var player1taken = false

// Handle database errors
function dbError(error) {
    if (error) $("body").html("Database access failed.  Please check your internet connection and reload the page.  Error code: " + error.code)
}

// Gather players
rpsDb.ref("/players").on("value", (snapshot) => {
    let playersArea = $("#players-area")
    playersArea.empty()
    $("#player-1").text("Waiting for player 1 to join...")
    $("#player-2").text("Waiting for player 2 to join...")
    let currNumPlayers = snapshot ? snapshot.numChildren() : 0

    if (currNumPlayers > 0) {
        snapshot.forEach((childSnapshot) => {
            let playerNum = childSnapshot.key
            player1taken = (playerNum == 1)
            $("#player-" + playerNum).empty()
            $("#player-" + playerNum).append($("<h5>").text("Player " + playerNum + ": " + childSnapshot.val().name))
            $("#player-" + playerNum).append($("<h5>").text("Wins: " + childSnapshot.val().wins))
            $("#player-" + playerNum).append($("<h5>").text("Losses: " + childSnapshot.val().losses))
            if (playerNum == myPlayerID) {
                playersArea.append($("<h5>").text(childSnapshot.val().name + ", you are Player " + playerNum))
            }
        })
    }

    // Check to see if we can accept a new player
    if (currNumPlayers < 2 && myPlayerID === 0) {
        // If so, display new player form...
        let form = $("<form>")
            .attr("class", "form-group row")
        let label = $("<label>")
            .attr("for", "new-player")
            .attr("class", "col-form-label")
            .text("Enter your name to play:")
        let inputName = $("<input>")
            .attr("class", "form-control mr-1")
            .attr("id", "new-player")
        let submitButton = $("<button>")
            .attr("class", "p-2 my-2 bg-primary")
            .text("Submit")
        form.append(label)
        form.append(inputName)
        form.append(submitButton)
        playersArea.append(form)
        // ...clear the turn tracker and chat area...
        $("#chat-msgs").empty();
        rpsDb.ref("/chat").remove()
        rpsDb.ref("/turn").set({
            player: 0
        })
        // ...and add the new player to the database
        submitButton.click((evt) => {
            evt.preventDefault();
            let newName = $("#new-player").val();
            myPlayerID = player1taken ? 2 : 1
            myPlayerData.name = newName;
            rpsDb.ref("/players").child(myPlayerID).set(myPlayerData)
            rpsDb.ref("/players").child(myPlayerID).onDisconnect().remove(dbError);
            // If we have both players present, start the game
            if (currNumPlayers === 1) {
                rpsDb.ref("/turn").set({
                    player: 1
                })
            }

        })
    }

}, dbError)

// Move the game forward each time the "turn" database object changes
rpsDb.ref("/turn").on("value", (turnSS) => {
    let currTurn = turnSS.val().player

    if (currTurn === 0) {
        // We don't have two players yet, so there is nothing to do yet
        return
    } else if (currTurn === 3) {
        // Both players have played, so compute, display, and record the result
        rpsDb.ref("/players").once("value").then((resultSS) => {
            let playersAreaDiv = $("#players-area")
            let player1Data = resultSS.val()[1]
            let player2Data = resultSS.val()[2]
            let play1 = player1Data.lastPick
            let play2 = player2Data.lastPick
            let p1win = false
            let p2win = false

            // Compute result
            if (play1 === play2) {
                // Display tie -- no further computation needed
                playersAreaDiv.append($("<h1>").text("Tie!!"))
                $("#player-1").append($("<h5>").text("Played: " + player1Data.lastPick))
                $("#player-2").append($("<h5>").text("Played: " + player2Data.lastPick))
            } 
            // If we get this far, a tie did not occur, so each remaining choice results in a distinct win or loss 
            else if (play1 === "rock") {
                if (play2 === "paper") p2win = true; else p1win = true
            } else if (play1 === "paper") {
                if (play2 === "scissors") p2win = true; else p1win = true
            } else if (play1 === "scissors") {
                if (play2 === "rock") p2win = true; else p1win = true
            }

            // Display win/loss
            if (p1win) {
                playersAreaDiv.append($("<h1>").text(player1Data.name + " wins!!"))
                $("#player-1").append($("<h5>").text("Played: " + player1Data.lastPick))
                $("#player-2").append($("<h5>").text("Played: " + player2Data.lastPick))
                player1Data.wins++
                player2Data.losses++
            }
            if (p2win) {
                playersAreaDiv.append($("<h1>").text(player2Data.name + " wins!!"))
                $("#player-1").append($("<h5>").text("Played: " + player1Data.lastPick))
                $("#player-2").append($("<h5>").text("Played: " + player2Data.lastPick))
                player2Data.wins++
                player1Data.losses++
            }
            myPlayerData = (myPlayerID === 1) ? player1Data : player2Data // update local data tracking
            player1Data.lastPick = ""
            player2Data.lastPick = ""

            // After timer, record win/loss and start a new round by resetting the turn tracker
            let resultTimer = setTimeout(() => {
                rpsDb.ref("/players").child("1").update(player1Data)
                rpsDb.ref("/players").child("2").update(player2Data)
                rpsDb.ref("/turn").update({
                    player: 1
                })
            }, 3000)

        })
    } else if (currTurn === myPlayerID) {
        // If it's my turn, let me pick rock, paper, or scissors
        let playersAreaDiv = $("#players-area")
        playersAreaDiv.append($("<h3>").text("It's your turn"))
        playersAreaDiv.append($("<button>").text("Rock")
            .attr("class", "btn btn-secondary m-1")
            .attr("id", "rock"))
        playersAreaDiv.append($("<button>").text("Paper")
            .attr("class", "btn btn-info m-1")
            .attr("id", "paper"))
        playersAreaDiv.append($("<button>").text("Scissors")
            .attr("class", "btn btn-primary m-1")
            .attr("id", "scissors"))
        $(".btn").click((rpsClick) => {
            myPlayerData.lastPick = rpsClick.target.getAttribute("id")
            rpsDb.ref("/players").child(myPlayerID).update(myPlayerData)
            rpsDb.ref("/turn").update({
                player: ++currTurn
            })
        })


    } else {
        // It is my opponents turn, so I'm waiting...
        $("#players-area").append($("<h3>").text("Waiting for Player " + ((myPlayerID === 1) ? 2 : 1) + " to play..."))
    }
}, dbError)

$("#chat-send").click( (clickEvt) => {
    clickEvt.preventDefault()
    rpsDb.ref("/chat").push({
        name: myPlayerData.name,
        msg: $("#new-chat-msg").val()
    })
})

rpsDb.ref("/chat").on("child_added", (chatSnapshot) => {
    let bgColor = ((myPlayerData.name === chatSnapshot.val().name) ? "bg-primary" : "bg-secondary")
    $("#chat-msgs").append($("<p>")
        .text(chatSnapshot.val().name + ": " + chatSnapshot.val().msg)
        .attr("class", bgColor + " text-white rounded p-1 m-1"))
})