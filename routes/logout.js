const express = require("express");

const routerLogout = express.Router();

routerLogout.post("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    //take cookie back
});

module.exports = routerLogout;
