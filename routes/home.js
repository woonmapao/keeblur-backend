const express = require("express");
const https = require("https");

const routerHome = express.Router();

routerHome.post("/", (req, res) => {
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

    const url =
        "https://us13.api.mailchimp.com/3.0/lists/" + process.env.LIST_ID;
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

module.exports = routerHome;
