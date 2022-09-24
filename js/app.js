function push(id) {
    // Update Title in Window's Tab
    document.title = id;
    // Finally push state change to the address bar
    let url = null;
    switch (id) {
        case  "Visualization":
            url = "./components/data.html"
            break;
        case "SVG" :
            url = "./components/svg.html"
            break;
        case "Reference":
            url = "./components/reference.html"
            break;
        case "Home":
            url = "./components/home.html"
            break;
        case "WhiteHat":
            url = "./components/whitehat.html"
            break;
        case "BlackHat":
            url = "./components/blackhat.html"     
            break;   
        default:
            break;
    }
    fetch(url).then((response) => response.text()).then(
        (html) => {
            $("#content").html(html)
        }
    )
}
window.onload = event => {
    // Add history push() event when boxes are clicked
    fetch("./components/home.html").then((response) => response.text()).then(
        (html) => {
            $("#content").html(html)
        }
    )

    $("#data").on("click", function () {
        push("Visualization")
    })
    $("#svg").on("click", function() {
        push("SVG")
    })
    $("#reference").on("click", function() {
        push("Reference")
    })
    $("#home").on("click", function() {
        push("Home")
    })
    $("#whitehat").on("click", function() {
        push("WhiteHat")
    })
    $("#blackhat").on("click", function() {
        push("BlackHat")
    })
}