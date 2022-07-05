import {Router} from "express";
import {Book, User} from "../postgresql.js";

class UserController {
    constructor() {
        this.router = Router();
        this.router.get("/:userID", this.getUsername.bind(this));
        this.router.get("/:userID/books", this.getBooks.bind(this));
    }

    isInteger(number) {
        const int = parseFloat(number);
        return Number.isInteger(int) && int.toString() === number;
    }

    async getUsername(request, response) {
        const {userID} = request.params;
        if (this.isInteger(userID)) {
            const result = await User.findAll({
                attributes: ["Username"],
                where: {
                    ID: userID,
                },
            });
            response.send(result[0] ?? {});
        } else {
            response.status(401).send("Ensure that userID is an integer.");
        }
    }

    async getBooks(request, response) {
        const {userID} = request.params;
        if (this.isInteger(userID)) {
            const result = await User.findAll({
                attributes: [],
                include: {
                    model: Book,
                    attributes: ["Title", "Author", "ISBN"],
                    through: {
                        attributes: ["CheckoutDate", "DueDate"],
                    },
                },
                where: {
                    "ID": userID,
                },
            });
            response.send(result[0]?.Books ?? {});
        } else {
            response.status(401).send("Ensure that userID is an integer.");
        }
    }
}

export default new UserController().router;
