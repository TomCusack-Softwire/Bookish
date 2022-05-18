import {Book, User} from "../postgresql.js";
import {Router} from "express";
import {verifyTokenHandler} from "./LoginController.js";
import {generate_barcode, validate} from "isbn_toolbelt";

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
        const {isbn} = request.params;
        await this.getBookByFeature("ISBN", decodeURIComponent(isbn), request, response);
    }

    async getBookByTitle(request, response) {
        const {title} = request.params;
        await this.getBookByFeature("Title", decodeURIComponent(title), request, response);
    }

    async getBookByAuthor(request, response) {
        const {author} = request.params;
        await this.getBookByFeature("Author", decodeURIComponent(author), request, response);
    }

    async getBookByFeature(key, value, request, response) {
        if (["ISBN", "Title", "Author"].includes(key) && value) {
            const result = await Book.findAll({
                where: {[key]: value}
            });
            response.send(result ?? {});
        } else {
            response.status(400).send({});
        }
    }

    async getAllBooks(request, response) {
        const result = await Book.findAll({
            order: [["Title", "ASC"]],
        });
        response.send(result);
    }

    async getCopiesOfBook(request, response) {
        const {isbn} = request.params;
        const books = await Book.findAll({
            attributes: ["Copies"],
            where: {ISBN: isbn},
        });
        if (books.length === 0) {
            response.status(400).send("ISBN not in database.");
            return;
        }
        const bookInformation = books[0];

        const checkedOut = await Book.findAll({
            attributes: [],
            include: {
                model: User,
                attributes: ["ID", "Username"],
                through: {
                    attributes: ["CheckoutDate", "DueDate"],
                },
            },
            where: {
                ISBN: isbn,
            },
        });
        const checkingInformation = checkedOut[0]['Users'];

        response.send({
            "totalCopies": bookInformation.Copies,
            "availableCopies": bookInformation.Copies - checkingInformation.length,
            "locationOfCopies": checkingInformation,
        });
    }

    async addBook(request, response) {
        let {isbn, title, author, copies} = request.query;
        if (!isbn || !copies) {
            response.status(404).send("Please supply an ISBN and a number of copies.");
            return;
        }

        [isbn, title, author, copies] = [isbn, title, author, copies].map(value => decodeURIComponent(value));
        const checkISBN = await Book.count({
            where: {
                ISBN: isbn,
            }
        });

        if (checkISBN === 0) {
            try {
                await Book.create({
                    ISBN: isbn,
                    Title: title,
                    Author: author,
                    Copies: copies,
                });
                response.redirect("/books/getBarcode/" + isbn);
            } catch (error) {
                console.error(error);
                response.status(400).send(error);
            }
        } else {
            response.status(404).send("ISBN already in use.");
        }
    }

    async getBarcode(request, response) {
        const {isbn} = request.params;
        if (validate(isbn)) {
            const xml = generate_barcode(isbn);
            response.send(xml);
        } else {
            response.status(400).send("Invalid ISBN for barcode generation.");
        }
    }
}

export default new BookController().router;
