import express from "express";
import Book from "./Book.js";
import Login from "./Login.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

app.get("/getBook", (request, response) => {
    if (Login.verify(request, response)) {
        if (request.query.isbn) {
            Book.getBook(request.query.isbn)
                .then(value => response.send(value))
                .catch(error => console.error(error));
        } else {
            response.send({});
        }
    }
});

app.get("/getAllBooks", (request, response) => {
    if (Login.verify(request, response)) {
        Book.getAllBooks()
            .then(value => response.send(value))
            .catch(error => console.error(error));
    }
});

app.use("/", express.static("frontend"));
app.use("/login", express.static("frontend/login.html"));

app.get("/tryToLogIn", (request, response) => {
    let {username, password} = request.query;
    if (username && password) {
        new Login(username, password).validate()
            .then(token => {
                if (token) {
                    response.status(200).cookie("token", token, {
                        httpOnly: true,
                        sameSite: "lax",
                    }).send("Success!");
                } else {
                    response.status(401).send("Invalid username or password.");
                }
            })
            .catch(error => {
                console.error(error);
                response.status(401).send("Invalid username or password.");
            });
    } else {
        response.send("Nope");
    }
});

app.listen(3000, () => {
    console.log("Bookish app started on port 3000.");
});
