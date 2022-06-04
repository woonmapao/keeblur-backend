const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");
const saltRounds = 10;

const routerRegister = express.Router();

routerRegister
    .route("/register")
    .get((req, res) => {
        try {
            const cookie = req.cookies["jwt"];
            const claims = jwt.verify(cookie, process.env.KEEBLUR_APP_TOO_GOOD);

            if (claims) {
                //no need to register, still have cookie
                res.redirect("/account/index");
            }
        } catch (error) {
            //go to register form
            console.log("Process to register form");
        }
    })
    .post((req, res) => {
        const { fName, lName, email, password, conPassword } = req.body;

        Customer.findOne({ email: email }, (err, foundCustomer) => {
            if (foundCustomer) {
                //email already in-use
                console.log("email in-use");
                res.redirect("/register");
            } else {
                if (password === conPassword) {
                    bcrypt.hash(password, saltRounds, (err, hash) => {
                        const newCustomer = new Customer({
                            fName: fName,
                            lName: lName,
                            email: email,
                            password: hash,
                        });
                        newCustomer.save((err) => {
                            if (err) {
                                console.log(err);
                                res.redirect("/account/register");
                            } else {
                                console.log("registered");
                                res.redirect("/account/login");
                                //success registered
                            }
                        });
                    });
                } else {
                    console.log("password mismatch");
                    res.redirect("/account/register");
                    // tell user password mismatch
                }
            }
        });
    });

module.exports = routerRegister;
