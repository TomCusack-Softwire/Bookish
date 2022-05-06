function submit_form(event) {
    event.preventDefault();
    document.body.style.cursor = "wait";
    document.getElementById("submit_button").disabled = true;

    var username = encodeURI(document.getElementById("username").value);
    var password = encodeURI(document.getElementById("password").value);

    var XHR = new XMLHttpRequest();
    XHR.open('POST', "/login", true);
    XHR.setRequestHeader('Content-Type', 'application/json');

    XHR.onreadystatechange = function () {
        // Handle response here using e.g. XHR.status, XHR.response, XHR.responseText
        document.body.style.cursor = "default";
        document.getElementById("submit_button").disabled = false;

        if (XHR.readyState === XMLHttpRequest.DONE && XHR.status === 200) {
            window.location.href = "/";
        } else {
            document.getElementById("textbox").innerHTML = XHR.responseText;
        }
    };

    XHR.send(JSON.stringify({
        username: username,
        password: password,
    }));
}
