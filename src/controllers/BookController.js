import database from "../postgresql.js";
import {Router} from "express";
import {verifyTokenHandler} from "./LoginController.js";
import {generate_barcode, validate} from "isbn_toolbelt";
import {decode} from "jsonwebtoken";

class BookController {
    constructor() {
        this.router = Router();
        this.router.get("/isbn/:isbn", verifyTokenHandler, this.getBookByISBN.bind(this));
        this.router.get("/title/:title", verifyTokenHandler, this.getBookByTitle.bind(this));
        this.router.get("/author/:author", verifyTokenHandler, this.getBookByAuthor.bind(this));
        this.router.get("/", verifyTokenHandler, this.getAllBooks.bind(this));
        this.router.get("/copies/:isbn", verifyTokenHandler, this.getCopiesOfBook.bind(this));
        this.router.get("/add", verifyTokenHandler, this.addBook.bind(this));
        this.router.get("/getBarcode/:isbn", verifyTokenHandler, this.getBarcode.bind(this));
    }

    async getBookByISBN(request, response) {
        await this.getBookByFeature("ISBN", decodeURIComponent(request.params.isbn), request, response);
    }

    async getBookByTitle(request, response) {
        await this.getBookByFeature("Title", decodeURIComponent(request.params.title), request, response);
    }

    async getBookByAuthor(request, response) {
        await this.getBookByFeature("Author", decodeURIComponent(request.params.author), request, response);
    }

    async getBookByFeature(key, value, request, response) {
        if (["ISBN", "Title", "Author"].includes(key) && value) {
            const result = await database.any("SELECT * FROM Books WHERE " + key + " = $1", [value]);
            response.send(result ?? {});
        } else {
            response.status(400).send({});
        }
    }

    async getAllBooks(request, response) {
        const result = await database.any("SELECT * FROM Books ORDER BY Title");
        response.send(result);
    }

    async getCopiesOfBook(request, response) {
        const {isbn} = request.params;
        const bookInformation = await database.oneOrNone("SELECT Copies FROM Books WHERE ISBN=$1", [isbn]);
        const checkingInformation = await database.any("SELECT CheckedOut.UserID, Users.Username, CheckedOut.DueDate FROM CheckedOut LEFT JOIN Users ON Users.ID = CheckedOut.UserID WHERE CheckedOut.BookId=$1", [isbn]);
        response.send({
            "totalCopies": bookInformation.copies,
            "availableCopies": bookInformation.copies - checkingInformation.length,
            "checkedOut": checkingInformation,
        });
    }

    async addBook(request, response) {
        let {isbn, title, author, copies} = request.query;
        [isbn, title, author, copies] = [isbn, title, author, copies].map(value => decodeURIComponent(value));
        const checkISBN = await database.one("SELECT COUNT(*) FROM Books WHERE ISBN=$1", [isbn])

        if (isbn && checkISBN.count === "0" && copies) {
            try {
                await database.none("INSERT INTO Books(ISBN, Title, Author, Copies) VALUES ($1, $2, $3, $4)", [isbn, title, author, copies]);
                response.redirect("/books/getBarcode/" + isbn);
            } catch (error) {
                console.error(error);
                response.status(400).send(error);
            }
        } else {
            response.status(404).send(checkISBN.count === "0" ? "Please supply correct ISBN and Copies." : "ISBN already in use.");
        }
    }

    async getBarcode(request, response) {
        const {isbn} = request.params;
        if (validate(isbn)) {
            const xml = generate_barcode(isbn);
            response.send(xml);
        } else {
            response.status(400).send("Invalid ISBN.");
        }
    }
}

export default new BookController().router;
