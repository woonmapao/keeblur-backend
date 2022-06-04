const express = require("express");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

const routerAccount = express.Router();

router.get("/account", (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, process.env.KEEBLUR_APP_TOO_GOOD);

        if (claims) {
            Customer.findOne({ _id: claims._id }, (err, foundUser) => {
                if (foundUser) {
                    res.send(foundUser.fName);
                    //tell who login
                }
            });
        }
    } catch (error) {
        //not authenticated
        res.redirect("/login");
    }
});

module.exports = routerAccount;
