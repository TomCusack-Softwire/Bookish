import database from "../postgresql.js";
import {Router} from "express";
import {verifyTokenHandler} from "./LoginController.js";

class BookController {
    constructor() {
        this.router = Router();
        this.router.get("/ISBN/:isbn", verifyTokenHandler, this.getBookByISBN.bind(this));
        this.router.get("/", verifyTokenHandler, this.getAllBooks.bind(this));
    }

    getBookByISBN(request, response) {
        const ISBN = request.params.isbn;
        if (ISBN) {
            database.oneOrNone("SELECT * FROM Books WHERE ISBN=$1", [ISBN])
                .then(result => response.send(result ?? {}));
        } else {
            response.send({});
        }
    }

    getAllBooks(request, response) {
        database.any("SELECT * FROM Books")
            .then(result => response.send(result));
    }
}

export default new BookController().router;
