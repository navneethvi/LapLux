const User = require("../models/userSchema")
const Product = require("../models/productSchema")

const getCheckoutPage = async (req, res) => {
    try {
        const id = req.query.id
        const findProduct = await Product.findOne({id : id})
        console.log(findProduct);
        res.render("checkout")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getCheckoutPage
}