require("dotenv").config();
const express = require("express");
const https = require("https");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const PORT = process.env.PORT || 3030;

mongoose.connect("mongodb://localhost:27017/keeblurDB");

const server = express();

server.use(cookieParser());
server.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));
server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));

const customerSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  email: {
    type: String,
    unique: true,
    required: String,
  },
  password: String,
});

const Customer = mongoose.model("Customer", customerSchema);

server.post("/", (req, res) => {
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  const url = "https://us13.api.mailchimp.com/3.0/lists/" + process.env.LIST_ID;
  const options = {
    method: "POST",
    auth: "woonmapao:" + process.env.API_KEY,
  };

  const request = https.request(url, options, (response) => {
    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();

  res.redirect("/");
  //do something better than redirect please
  //tell user that email is subscribed
});

server
  .route("/register")
  .get((req, res) => {
    const cookie = req.cookies["jwt"];
    if (cookie === "") {
      console.log("register or login first");
    } else {
      console.log("already logged in, redirect to index");
      res.redirect("/account/index");
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
          // finding way to tell user
        }
      }
    });
  });

server
  .route("/login")
  .get((req, res) => {
    const cookie = req.cookies["jwt"];
    if (cookie === "") {
      console.log("register or login first");
    } else {
      console.log("already logged in, redirect to index");
      res.redirect("/account/index");
    }
  })

  .post((req, res) => {
    const { email, password } = req.body;

    Customer.findOne({ email: email }, (err, foundCustomer) => {
      if (foundCustomer) {
        bcrypt.compare(password, foundCustomer.password, (err, result) => {
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
            console.log("got 1H cookie");
            //obtain 1H cookie
            res.redirect("/account/index");
          } else {
            console.log("wrong password");
            //wrong password
            res.redirect("/account/login");
          }
        });
      } else {
        //not registered
        console.log("not registered");
        res.redirect("/account/register");
      }
    });
  });

server.get("/account", (req, res) => {
  const cookie = req.cookies["jwt"];
  const claims = jwt.verify(cookie, process.env.KEEBLUR_APP_TOO_GOOD);

  console.log(claims);
  if (claims) {
    console.log("got in with cookie");
  } else if (!claims) {
    console.log("don't have cookie, redirecting to /login");
    res.redirect("/account/login");
  } else {
    //not possible to be here
    console.log("got in with BUG \n[OH SHIT PLS FIX]");
  }
});

server.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  console.log("cookie NOMNOM");
});

// server.all("*", (req, res) => {
//   return handle(req, res);
// });

server.listen(PORT, () => {
  console.log(`> Ready on http://localhost:${PORT}`);
});
