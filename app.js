// Load config
require("dotenv").config({ path: `${__dirname}/config/config.env` });

// Modules
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');

const connectDB = require("./config/db");

const app = express();

// Load databse
connectDB();

// Flash messages
app.use(flash());

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// To parse cookies from the HTTP Request
app.use(cookieParser());

// Handlebars Helpers
const {
    checkEqual,
    randomNumber,
    setVar,
    getVar,
    isTen,
    renderItems,
    renderAdminItems,
    renderEditCategories
} = require("./helpers/hbs");

// Handlebars
app.engine(
    "hbs",
    exphbs({
        helpers: {
            //     checkAuth,
            randomNumber,
            checkEqual,
            setVar,
            getVar,
            isTen,
	    renderItems,
	    renderAdminItems,
	    renderEditCategories
        },
        defaultLayout: "main",
        extname: ".hbs",
    })
);

app.set("view engine", ".hbs");

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Sessions
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

// Set global variables
app.use((req, res, next) => {
    res.locals.request = req || null;
    next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/admin", require("./routes/admin"));

//404 handler
app.use(function (req, res) {
    res.status(404);
    res.render("error/404");
});

const PORT = process.env.PORT || 3000;

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
