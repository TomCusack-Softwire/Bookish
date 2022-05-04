import express from "express";
import Book from "./Book.js";

const app = express();

app.get("/getBook", (request, response) => {
    if (request.query.isbn) {
        Book.getBook(request.query.isbn)
            .then(value => response.send(value))
            .catch(error => console.error(error));
    } else {
        response.send({});
    }
});

app.get("/getAllBooks", (request, response) => {
    Book.getAllBooks()
        .then(value => response.send(value))
        .catch(error => console.error(error));
});

app.get("/", (request, response) => {
    response.send("Hello, world!");
})

app.listen(3000, () => {
    console.log("Bookish app started on port 3000.");
});
