const User = require("../models/userSchema")
const Product = require("../models/productSchema")

const getCheckoutPage = async (req, res) => {
    try {
        res.render("checkout")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getCheckoutPage
}