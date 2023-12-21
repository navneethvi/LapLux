const Product = require("../models/productSchema")
const Category = require("../models/categorySchema")
const Brand = require("../models/brandSchema")
const fs = require("fs")
const path = require("path")


const getProductAddPage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true })
        const brand = await Brand.find({ isBlocked: false })
        res.render("product-add", { cat: category, brand: brand })
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
                id: Date.now(),
                productName: products.productName,
                description: products.description,
                brand: products.brand,
                category: products.category,
                regularPrice: products.regularPrice,
                salePrice: products.salePrice,
                createdOn: new Date(),
                quantity: products.quantity,
                size: products.size,
                color: products.color,
                processor: products.processor,
                productImage: images
            })
            await newProduct.save()
            res.redirect("/admin/products")
            // res.json("success")
        } else {
           
            res.json("failed");
        }

    } catch (error) {
        console.log(error.message);
    }
}

const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id
        const findProduct = await Product.findOne({ _id: id })
        
        const category = await Category.find({})
        const findBrand = await Brand.find({})
        res.render("edit-product", { product: findProduct, cat: category, brand: findBrand })
    } catch (error) {
        console.log(error.message);
    }
}


const deleteSingleImage = async (req, res)=>{
    try {
        const id = req.query.id
        const image = req.params.image
        const product = await Product.findByIdAndUpdate(id,{
            $pull : {productImage : image}
        })
        console.log(image);
        const imagePath = path.join('public', 'uploads', 'product-images', image);
        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`Image ${image} deleted successfully`);
        } else {
            console.log(`Image ${image} not found`);
        }

        res.redirect(`/admin/editProduct?id=${product._id}`)

    } catch (error) {
        console.log(error.message);
    }
}


const editProduct = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        const images = []
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }
        const updatedProduct = await Product.findByIdAndUpdate(id,{
            id: Date.now(),
            productName: data.productName,
            description: data.description,
            brand: data.brand,
            category: data.category,
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
            size: data.size,
            color: data.color,
            processor: data.processor,
            createdOn: new Date(),
            productImage : images
        }  , {new:true})
        console.log("product updated");
        res.redirect("/admin/products")
       

    } catch (error) {
        console.log(error.message);
    }
}


const getAllProducts = async (req, res) => {
    try {
        const search = req.query.search || ""
        const page = req.query.page || 1
        const limit = 4
        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { brand: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ],
        }).limit(limit * 1)
          .skip((page - 1) * limit)
          .exec()

          const count = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { brand: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ],
        }).countDocuments()

        
        
        res.render("products", { 
            data: productData,
            currentPage : page,
            totalPages : Math.ceil(count/limit)
        
        });
        
    } catch (error) {
        console.log(error.message);
    }
}


const getBlockProduct = async (req, res) => {
    try {
        let id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } })
        console.log("product blocked")
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message);
    }
}


const getUnblockProduct = async (req, res) => {
    try {
        let id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { isBlocked: false } })
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
    editProduct,
    deleteSingleImage
}