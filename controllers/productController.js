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

const getEditProduct = async (req, res)=>{
    try {
        const id = req.query.id
        const findProduct = await Product.findOne({_id : id})
        // console.log(findProduct);
        const category = await Category.find({})
        const findBrand = await Brand.find({})
        res.render("edit-product", {product : findProduct, cat : category, brand : findBrand})
    } catch (error) {
        console.log(error.message);
    }
}


// const editProduct = async (req, res)=>{
//     try {
//         const id = req.params.id
//         const {productName} = req.body
//         console.log(id);
//         console.log(productName);
//         const findProduct = await Product.findOne({_id : id})
//         await findProduct.updateOne({
            
//         })
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const editProduct = async (req, res) => {
    try {
        const id = req.params.id
        console.log(id);
        console.log(req.body);
        
    } catch (error) {
        console.log(error.message);
    }
}


const getAllProducts = async (req, res)=>{
    try {
        const productData = await Product.find({})
        res.render("products", {data : productData})
    } catch (error) {
        console.log(error.message);
    }
}


const getBlockProduct = async (req, res)=>{
    try {
        let id = req.query.id
        await Product.updateOne({_id : id}, {$set : {isBlocked : true}})
        console.log("product blocked")
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message);
    }
}


const getUnblockProduct = async (req, res)=>{
    try {
        let id = req.query.id
        await Product.updateOne({_id : id}, {$set : {isBlocked : false}})
        console.log("product unblocked")
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getProductAddPage,
    addProducts,
    getAllProducts,
    getBlockProduct,
    getUnblockProduct,
    getEditProduct,
    editProduct
}