import express from "express";
import cookieParser from "cookie-parser";
import BookRouter from "./controllers/BookController.js";
import UserRouter from "./controllers/UserController.js";
import {LoginRouter, verifyTokenHandler} from "./controllers/LoginController.js"
import bodyParser from "body-parser";
import path from "path";

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

// app.use("/", express.static("frontend"));
app.set("view engine", "pug")

app.get("/", (req, res) => {
    res.render("homepage");
})
app.get("/specification", (req, res) => res.render("specification"));

app.use(express.static("C:\\Work\\Training\\Bookish\\public"));

app.use("/api", verifyTokenHandler);
app.use("/api/books", BookRouter);
app.use("/login", LoginRouter);
app.use("/api/users", UserRouter);

const port = 3001;
app.listen(port, () => {
    console.log(`Bookish app started on port ${port}.`);
});
