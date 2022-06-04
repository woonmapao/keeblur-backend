require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/keeblurDB");

const account = require("./routes/account");
const home = require("./routes/home");
const login = require("./routes/login");
const logout = require("./routes/logout");
const register = require("./routes/register");

const server = express();

server.use(cookieParser());
server.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));
// server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use("/", account);
server.use("/", home);
server.use("/", login);
server.use("/", logout);
server.use("/", register);

server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
});
