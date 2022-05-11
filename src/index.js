import express from "express";
import cookieParser from "cookie-parser";
import BookRouter from "./controllers/BookController.js";
import UserRouter from "./controllers/UserController.js";
import {LoginRouter} from "./controllers/LoginController.js"
import bodyParser from "body-parser";

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/", express.static("frontend"));
app.use("/books", BookRouter);
app.use("/login", LoginRouter);
app.use("/users", UserRouter);

const port = 3001;
app.listen(port, () => {
    console.log(`Bookish app started on port ${port}.`);
});
