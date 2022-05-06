import database from "../postgresql.js";
import {readFileSync} from "fs";
import * as jsonwebtoken from "jsonwebtoken";
import express, {Router} from "express";
const jwt = jsonwebtoken.default;

// Read in 'username:password' in 'postgresql_details' file
let secret_key;
try {
    secret_key = readFileSync("./src/jwt_secret_key", "utf-8");
} catch (e) {
    console.error(e);
    throw new Error("Please create a valid 'jwt_secret_key' file containing just the secret key");
}

class LoginController {
    constructor() {
        this.router = Router();
        this.router.use(express.static("frontend/login"));
        this.router.post("/", this.tryToLogIn.bind(this));
    }

    async tryToLogIn(request, response) {
        const {username, password} = request.body;
        if (username && password) {
            const testPassword = await database.oneOrNone("SELECT Username, Password FROM Users WHERE Username = $1", [username]);
            if (testPassword && testPassword.password === password) {
                const token = jwt.sign({
                    user: username,
                }, secret_key, {
                    expiresIn: "1h",
                });

                response.cookie("token", token, {
                    httpOnly: true,
                    sameSite: "lax",
                }).redirect("/");
            } else {
                response.status(401).send("Invalid username or password.");
            }
        } else {
            response.status(401).send("Please enter a username and password.");
        }
    }
}
export const LoginRouter = new LoginController().router;

export function verifyTokenHandler(request, response, next) {
    try {
        const token = request.cookies.token;
        if (token && jwt.verify(token, secret_key)) {
            next();
            return;
        }
    } catch (error) {}
    response.redirect("/login");
}
