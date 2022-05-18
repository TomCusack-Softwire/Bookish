import {DataTypes, Sequelize} from "sequelize";
import {createWriteStream, readFileSync} from "fs";

// Read in 'username:password' in 'postgresql_details' file
let details;
try {
    details = readFileSync("./src/postgresql_details", "utf-8");
} catch (e) {
    console.error(e);
    throw new Error("Please create a valid 'postgresql_details' file containing just username:password");
}

// create Sequelize instance
const logFile = createWriteStream("./sequelize.log");
const sequelize = new Sequelize(`postgres://${details}@localhost:5432/bookish`, {
    logging: message => logFile.write(`[${new Date().toISOString()}] [INFO] Sequelize: ${message}\n`),
});

await sequelize.authenticate();

// set up tables
const Book = sequelize.define("Book", {
    ISBN: {
        type: DataTypes.STRING(32),
        primaryKey: true,
    },
    Title: DataTypes.STRING,
    Author: DataTypes.STRING,
    Copies: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "Books",
    timestamps: false,
})

const User = sequelize.define("User", {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Username: {
        type: DataTypes.STRING(32),
        unique: true,
        allowNull: false,
    },
    Password: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
}, {
    tableName: "Users",
    timestamps: false,
    initialAutoIncrement: 1,
})

const CheckedOut = sequelize.define("CheckedOut", {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UserID: { // maybe is auto generated?
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "ID",
        },
    },
    BookISBN: { // maybe is auto generated?
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
            model: Book,
            key: "ISBN",
        },
    },
    CheckoutDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    DueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    tableName: "CheckedOut",
    timestamps: false,
    initialAutoIncrement: 1,
})

Book.belongsToMany(User, {through: CheckedOut});
User.belongsToMany(Book, {through: CheckedOut});

await sequelize.sync();

export {Book, User, CheckedOut};
