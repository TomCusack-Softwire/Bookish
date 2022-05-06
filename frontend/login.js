function submit_form(event) {
    event.preventDefault();
    document.body.style.cursor = "wait";
    document.getElementById("submit_button").disabled = true;

    var username = encodeURI(document.getElementById("username").value);
    var password = encodeURI(document.getElementById("password").value);

    var form = new FormData(event.target);
    var XHR = new XMLHttpRequest();
    XHR.open('GET', `http://localhost:3000/tryToLogIn?username=${username}&password=${password}`, true);
    XHR.setRequestHeader('Content-Type', 'application/json');

    XHR.onload = function () {
        // Handle response here using e.g. XHR.status, XHR.response, XHR.responseText
        document.body.style.cursor = "default";
        document.getElementById("submit_button").disabled = false;

        if (XHR.status === 200) {
            window.location = "/";
        } else {
            document.getElementById("textbox").innerHTML = XHR.responseText;
        }
    };

    XHR.send();
}

window.onload = () => {
    console.log("HELLO");
}