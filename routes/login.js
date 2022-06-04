const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

const routerLogin = express.Router();

routerLogin
    .route("/login")
    .get((req, res) => {
        try {
            const cookie = req.cookies["jwt"];
            const claims = jwt.verify(cookie, process.env.KEEBLUR_APP_TOO_GOOD);

            if (claims) {
                //no need to login, still have cookie
                res.redirect("/account/index");
            }
        } catch (error) {
            //go to register form
            console.log("Process to register form");
        }
    })

    .post((req, res) => {
        const { email, password } = req.body;

        Customer.findOne({ email: email }, (err, foundCustomer) => {
            if (foundCustomer) {
                bcrypt.compare(
                    password,
                    foundCustomer.password,
                    (err, result) => {
                        if (result) {
                            // correct password
                            console.log("logged in");
                            const token = jwt.sign(
                                { _id: foundCustomer._id },
                                process.env.KEEBLUR_APP_TOO_GOOD
                            );

                            res.cookie("jwt", token, {
                                httpOnly: true,
                                maxAge: 1 * 60 * 60 * 1000,
                            });
                            //obtain 1H cookie
                            res.redirect("/account/index");
                        } else {
                            //wrong password
                            res.redirect("/account/login");
                        }
                    }
                );
            } else {
                //not registered
                res.redirect("/account/register");
            }
        });
    });

module.exports = routerLogin;
