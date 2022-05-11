import database from "../postgresql.js";
import {Router} from "express";
import {verifyTokenHandler} from "./LoginController.js";

class UserController {
    constructor() {
        this.router = Router();
        this.router.get("/:userID", verifyTokenHandler, this.getUsername.bind(this));
        this.router.get("/:userID/books", verifyTokenHandler, this.getBooks.bind(this));
    }

    isInteger(number) {
        const int = parseFloat(number);
        return Number.isInteger(int) && int.toString() === number;
    }

    async getUsername(request, response) {
        const {userID} = request.params;
        if (this.isInteger(userID)) {
            const result = await database.any("SELECT Username FROM Users WHERE ID=$1", [userID]);
            response.send(result ?? {});
        } else {
            response.status(401).send("Ensure that userID is an integer.");
        }
    }

    async getBooks(request, response) {
        const {userID} = request.params;
        if (this.isInteger(userID)) {
            const result = await database.any("SELECT Books.Title, Books.Author, CheckedOut.DueDate FROM CheckedOut LEFT JOIN Books ON Books.ISBN = CheckedOut.BookID WHERE CheckedOut.UserID=$1", [userID]);
            response.send(result ?? {});
        } else {
            response.status(401).send("Ensure that userID is an integer.");
        }
    }
}

export default new UserController().router;
