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
        this.router.post("/new", this.register.bind(this));
    }

    setTokenAndRedirect(username, response) {
        const token = jwt.sign({
            user: username,
        }, secret_key, {
            expiresIn: "1h",
        });

        response.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
            sameSite: "lax",
            secure: true,
        }).send("REDIRECT: /");
    }

    async tryToLogIn(request, response) {
        const {username, password} = request.body;
        if (username && password) {
            const testPassword = await database.any("SELECT Username, Password FROM Users WHERE Username=$1", [username]);
            if (testPassword && testPassword.length === 1 && testPassword[0].password === password) {
                this.setTokenAndRedirect(username, response);
            } else {
                response.status(401).send("Invalid username or password.");
            }
        } else {
            response.status(401).send("Please enter a username and password.");
        }
    }

    async register(request, response) {
        const {username, password} = request.body;
        const countUsers = await database.one("SELECT COUNT(*) FROM Users WHERE Username=$1", [username]);

        if (username && password && username.length <= 32 && password.length <= 32) {
            if (countUsers.count === '0') {
                await database.none("INSERT INTO Users(Username, Password) VALUES ($1, $2)", [username, password]);
                this.setTokenAndRedirect(username, response);
            } else {
                response.status(401).send("Username already exists!");
            }
        } else {
            response.status(401).send("Invalid username or password.");
        }
    }
}
export const LoginRouter = new LoginController().router;

export function verifyTokenHandler(request, response, next) {
    try {
        const {token} = request.cookies;
        if (token && jwt.verify(token, secret_key)) {
            return next();
        }
    } catch (error) {}
    response.clearCookie("token").redirect("/login");
}
