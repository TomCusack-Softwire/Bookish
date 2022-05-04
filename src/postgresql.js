import pgPromise from "pg-promise";
import * as fs from "fs";

// Read in 'username:password' in 'postgresql_details' file
let details;
try {
    details = fs.readFileSync("./src/postgresql_details", "utf-8");
} catch (e) {
    console.error(e);
    throw new Error("Please create a valid 'postgresql_details' file containing just username:password");
}

const postgresql = pgPromise();
const database = postgresql(`postgres://${details}@localhost:5432/bookish`);
export default database;
