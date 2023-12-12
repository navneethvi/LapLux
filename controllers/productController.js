const Product = require("../models/productSchema")
const Category = require("../models/categorySchema")
const Brand = require("../models/brandSchema")



const getProductAddPage = async (req, res) => {
    try {
        const category = await Category.find({isListed : true})
        const brand = await Brand.find({isBlocked : false})
        res.render("product-add", {cat : category, brand : brand})
    } catch (error) {
        console.log(error.message);
    }
}


const addProducts = async (req, res) => {
    try {
        console.log("working");

        const products = req.body
        console.log(products);
        const productExists = await Product.findOne({ productName: products.productName })
        if (!productExists) {
            const images = []
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                }
            }
            
            const newProduct = new Product({
                id : Date.now(),
                productName : products.productName,
                description : products.description,
                brand : products.brand,
                category : products.category,
                regularPrice : products.regularPrice,
                salePrice : products.salePrice,
                createdOn : new Date(),
                quantity : products.quantity,
                size : products.size,
                color : products.color,
                processor : products.processor,
                productImage : images
            })
            await newProduct.save()
            // res.redirect("/admin/products")
            res.json("product added")
        }else{
            console.log("product already exists");
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getProductAddPage,
    addProducts
}