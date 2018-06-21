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
    if (error) $("#score").text("Database access failed.  Error code: " + error.code)
}

// Gather players
rpsDb.ref("/players").on("value", (snapshot) => {
    let playersArea = $("#players-area")
    playersArea.empty()
    $("#player-1").text("Waiting for player 1 to join...")
    $("#player-2").text("Waiting for player 2 to join...")
    let currNumPlayers = snapshot ? snapshot.numChildren() : 0

    console.log("currNumPlayers: " + currNumPlayers)
    if (currNumPlayers > 0) {
        snapshot.forEach((childSnapshot) => {
            let playerNum = childSnapshot.key
            player1taken = (playerNum == 1)
            console.log("player1taken: " + player1taken)
            if (playerNum == myPlayerID) {
                playersArea.append($("<h5>").text(childSnapshot.val().name + ", you are player " + playerNum))
            }
            $("#player-" + playerNum).text("Player " + playerNum + ": " + childSnapshot.val().name)

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
            .attr("class", "form-control")
            .attr("id", "new-player")
        let submitButton = $("<button>")
            .attr("class", "p-2 my-2 bg-primary")
            .text("Submit")
        form.append(label)
        form.append(inputName)
        form.append(submitButton)
        playersArea.append(form)
        // ...clear the turn tracker...
        rpsDb.ref("/turn").set({
            player: 0
        })
        // ...and add the new player to the database
        submitButton.click((evt) => {
            evt.preventDefault();
            let newName = $("#new-player").val();
            myPlayerID = player1taken ? 2 : 1

            console.log("myPlayerID: " + myPlayerID)
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

rpsDb.ref("/turn").on("value", (turnSS) => {
    let currTurn = turnSS.val().player

    if (currTurn === 0) {
        return
    } else if (currTurn === 3) {
        // Display result
    } else if (currTurn === myPlayerID) {
        // If it's my turn, let me pick rock, paper, or scissors
        let myPlayerDiv = $("#player-" + currTurn)
        myPlayerDiv.append($("<p>").text("Your turn"))
        myPlayerDiv.append($("<button>").text("Rock")
            .attr("class", "btn btn-secondary m-1")
            .attr("id", "rock"))
        myPlayerDiv.append($("<button>").text("Paper")
            .attr("class", "btn btn-info m-1")
            .attr("id", "paper"))
        myPlayerDiv.append($("<button>").text("Scissors")
            .attr("class", "btn btn-primary m-1")
            .attr("id", "scissors"))
        $(".btn").click( (rpsClick) => {
            myPlayerData.lastPick = rpsClick.target.getAttribute("id")
            rpsDb.ref("/players").child(myPlayerID).update(myPlayerData)
            rpsDb.ref("/turn").update({
                player: ++currTurn
            })
        })


    } else {
        // It is my opponents turn, so I'm waiting...
        let myPlayerDiv = $("#player-" + currTurn)
        myPlayerDiv.append($("<p>").text("Waiting for my opponent to play..."))
    }
}, dbError)