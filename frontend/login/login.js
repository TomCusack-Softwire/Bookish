function submit_form(event) {
    event.preventDefault();

    var form = document.querySelector("form");
    var buttons = [
        document.getElementById("loginButton"),
        document.getElementById("registerButton"),
    ];

    function wait(isWaiting) {
        document.body.style.cursor = isWaiting ? "wait" : "default";
        buttons.map(button => button.disabled = isWaiting);
    }

    wait(true);

    var username = form.username.value;
    var password = form.password.value;
    var buttonIndex = buttons.map(button => button.value).indexOf(form.button);

    if (buttonIndex === -1) {
        document.getElementById("textbox").innerHTML = "Invalid submit - please click one of the buttons!";
        wait(false);
        return;
    }

    var destination = ["/login", "/login/new"][buttonIndex];

    var XHR = new XMLHttpRequest();
    XHR.open('POST', destination, true);
    XHR.setRequestHeader('Content-Type', 'application/json');

    XHR.onreadystatechange = function () {
        // Handle response here using e.g. XHR.status, XHR.response, XHR.responseText
        wait(false);

        if (XHR.readyState === XMLHttpRequest.DONE) {
            if (XHR.status === 200) {
                window.location.href = XHR.responseText.startsWith("REDIRECT: ") ? XHR.responseText.slice(10) : "/";
            } else {
                document.getElementById("textbox").innerHTML = XHR.responseText;
            }
        }
    };

    XHR.send(JSON.stringify({
        username: username,
        password: password,
    }));
}
