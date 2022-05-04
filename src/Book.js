import database from "./postgresql.js";

export default class Book {
    constructor(ISBN, Title, Author, Copies) {
        this.ISBN = ISBN;
        this.Title = Title;
        this.Author = Author;
        this.Copies = Copies;
    }

    static getBook(ISBN) {
        return database.oneOrNone("SELECT * FROM Books WHERE ISBN=$1", [ISBN]);
    }

    static getAllBooks() {
        return database.any("SELECT * FROM Books");
    }
}
