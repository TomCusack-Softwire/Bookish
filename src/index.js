import express from "express";
import cookieParser from "cookie-parser";
import BookRouter from "./Controllers/BookController.js";
import {LoginRouter} from "./Controllers/LoginController.js"
import bodyParser from "body-parser";

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/", express.static("frontend"));
app.use("/books", BookRouter);
app.use("/login", LoginRouter);

app.listen(3000, () => {
    console.log("Bookish app started on port 3000.");
});
