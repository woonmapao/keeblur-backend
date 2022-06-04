const mongoose = require("mongoose");

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

module.exports = mongoose.model("Customer", customerSchema);
