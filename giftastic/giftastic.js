var topics = [ "carrot", "asparagus", "hamburger", "pizza" ]

// Display all topic buttons in ribbon at top of screen and register listeners
function displayButtons() {
    let btnArea = $("#btn-array")
    btnArea.empty()
    topics.forEach( (topic) => {
        btnArea.append($("<button>")
            .text(topic)
            .attr("class", "topicbtn btn btn-info m-2")
            .attr("label", topic)
        )
    })
    $(".topicbtn").click(handleBtnClick);
}

// Initialize the screen upon page load
displayButtons()

// Add new topic buttons if Submit is clickee
$("#new-food-submit").click( (btnSubmit) => {
    btnSubmit.preventDefault();
    topics.push($("#new-food").val().trim())
    displayButtons()
})

// Display gifs if button in topic ribbon is clicked
function handleBtnClick(btnClick) {

    // First query the GIPHY API to retrieve 10 gifs related to the subject with rating PG or lower
    let query = btnClick.target.getAttribute("label")
    let gifReqURL = "https://api.giphy.com/v1/gifs/search?api_key=mxsGW5kZ9S9l1Z6NY3BLpgRu7VuaazHt&q=" 
        + query + "&limit=10&offset=0&rating=PG&lang=en"
    $.ajax({
        url: gifReqURL,
        method: "GET"
    }).then( (result) => {
        // Display gifs once retrieved
        let gifArea = $("#gif-area")
        gifArea.empty()
        for (let i = 0; i < result.data.length; ++i) {
            let currGif = result.data[i];
            let gifContainer = $("<span>")
            gifContainer.attr("class", "float-left m-2")
            gifContainer.append($("<p>")
                .text("Rating: " + currGif.rating)
            )
            gifContainer.append($("<img>")
                .attr("src", currGif.images.fixed_height_still.url)
                .attr("class", "gif-img")
                .attr("id", "gif-num-" + i)
                .attr("gif-still", "true")
                .attr("gif-still-src", currGif.images.fixed_height_still.url)
                .attr("gif-motion-src", currGif.images.fixed_height.url)
            )
            gifArea.append(gifContainer)
        }

        // Animate gifs if clicked; de-animate if clicked again
        $(".gif-img").click( (gifClick) => {
            let clickedImg = $(gifClick.target)
            if (gifClick.target.getAttribute("gif-still") === "true") {
                let toggledImg = clickedImg.clone(true)
                toggledImg
                    .attr("src", gifClick.target.getAttribute("gif-motion-src"))
                    .attr("gif-still", false)
                clickedImg.replaceWith(toggledImg)
            } else {
                let toggledImg = clickedImg.clone(true)
                toggledImg
                    .attr("src", gifClick.target.getAttribute("gif-still-src"))
                    .attr("gif-still", true)
                clickedImg.replaceWith(toggledImg)                
            }
        })
    })
}

