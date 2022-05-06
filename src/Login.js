import database from "./postgresql.js";
import {readFileSync} from "fs";
import * as jsonwebtoken from "jsonwebtoken";
const jwt = jsonwebtoken.default;

// Read in 'username:password' in 'postgresql_details' file
let secret_key;
try {
    secret_key = readFileSync("./src/jwt_secret_key", "utf-8");
} catch (e) {
    console.error(e);
    throw new Error("Please create a valid 'jwt_secret_key' file containing just the secret key");
}

export default class Login {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    validate() {
        if (!this.username || !this.password) {
            return Promise.reject("Please supply a username or password");
        }
        return database.oneOrNone("SELECT Username, Password FROM Users WHERE Username = $1", [this.username])
            .then(json => {
                if (json.password && this.password === json.password) {
                    return jwt.sign({
                        user: json.username,
                    }, secret_key, {
                        expiresIn: "1h",
                    });
                }
            });
    }

    static verify(request, response) {
        try {
            const token = request.cookies.token;
            if (token) {
                return jwt.verify(token, secret_key);
            } else {
                response.redirect("/login");
            }
        } catch (error) {
            response.status(500).send(`An error occurred: ${error}`);
        }
    }
}