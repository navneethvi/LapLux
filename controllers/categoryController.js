const Category = require("../models/categorySchema")
const Product = require("../models/productSchema")


// Rendering the category page
const getCategoryInfo = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render("category", { cat: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body
        const categoryExists = await Category.findOne({ name })
        if (description) {
            if (!categoryExists) {
                const newCategory = new Category({
                    name: name,
                    description: description
                })
                await newCategory.save()
                console.log("New Category : ", newCategory);
                res.redirect("/admin/allCategory")
            } else {
                res.redirect("/admin/category")
                console.log("Category Already exists");
            }
        } else {
            console.log("description required");
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getAllCategories = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render("category", { cat: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}


const getListCategory = async (req, res) => {
    try {
        let id = req.query.id
        console.log("wrking");
        await Category.updateOne({ _id: id }, { $set: { isListed: false } })
        res.redirect("/admin/category")
    } catch (error) {
        console.log(error.message);
    }
}


const getUnlistCategory = async (req, res) => {
    try {
        let id = req.query.id
        await Category.updateOne({ _id: id }, { $set: { isListed: true } })
        res.redirect("/admin/category")
    } catch (error) {
        console.log(error.message);
    }
}


const getEditCategory = async (req, res) => {
    try {
        const id = req.query.id
        const category = await Category.findOne({ _id: id })
        res.render("edit-category", { category: category })
    } catch (error) {
        console.log(error.message);
    }
}


const editCategory = async (req, res) => {
    try {
        const id = req.params.id
        const { categoryName, description } = req.body
        const findCategory = await Category.find({ _id: id })
        if (findCategory) {
            await Category.updateOne(
                { _id: id },
                {
                    name: categoryName,
                    description: description
                })
            res.redirect("/admin/category")
        } else {
            console.log("Category not found");
        }

    } catch (error) {
        console.log(error.message);
    }
}


const addCategoryOffer = async (req, res)=>{
    try {
        const percentage = parseInt(req.body.percentage)
        const categoryId = req.body.categoryId  
        // console.log(percentage, categoryId);
        const findCategory = await Category.findOne({_id : categoryId})
        // console.log(findCategory);
        await Category.updateOne(
            {_id : categoryId},
            {$set : {
                categoryOffer : percentage
            }}
        )
        .then(data=>{
            console.log(data)
            console.log("categoryOffer added");
        })

        const productData = await Product.find({category : findCategory.name})
        // console.log(productData);

        for(const product of productData){
            product.salePrice = product.salePrice - Math.floor(product.regularPrice * (percentage / 100) )
            await product.save()
        }

        res.json({status : true})

    } catch (error) {
        console.log(error.message);
    }
}


const removerCategoryOffer = async (req, res)=>{
    try {
        // console.log(req.body);
        const categoryId = req.body.categoryId
        const findCategory = await Category.findOne({_id : categoryId})
        console.log(findCategory);

        const percentage = findCategory.categoryOffer
        // console.log(percentage);

        const productData = await Product.find({category : findCategory.name})

        if(productData.length > 0){
            for(const product of productData){
                product.salePrice = product.salePrice +  Math.floor(product.regularPrice * (percentage / 100))
                await product.save()
            }
        }

        findCategory.categoryOffer = 0
        await findCategory.save()

        res.json({status : true})

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCategoryInfo,
    addCategory,
    getAllCategories,
    getListCategory,
    getUnlistCategory,
    editCategory,
    getEditCategory,
    addCategoryOffer,
    removerCategoryOffer
}