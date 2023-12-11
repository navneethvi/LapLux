const User = require("../models/userSchema");
const bcrypt = require("bcrypt")



const getDashboard = async(req, res)=>{
    try {
        res.render("index")
    } catch (error) {
        console.log(error.message);
    }
}

const getLoginPage = async(req, res)=>{
    try {
        res.render("admin-login")
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res)=>{
    try {
        const {email, password} = req.body
        console.log(email)

        const findAdmin = await User.findOne({email, isAdmin : "1"})
        // console.log("admin data : ", findAdmin);

        if(findAdmin){
            const passwordMatch = await bcrypt.compare(password, findAdmin.password)
            if(passwordMatch){
                req.session.admin = true
                console.log("Admin Logged In");
                res.redirect("/admin")
            }else{
                console.log("Password is not correct");
                res.redirect("/admin/login")
            }
        }else{
            console.log("He's not an admin");
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getLogout = async (req, res)=>{
    try {
        req.session.admin = null
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message);
    }
}

const getCustomersInfo = async (req, res)=>{
    try {
        const userData = await User.find({isAdmin : "0"})
        // res.json(userData)
        res.render("customers", {data : userData})
    } catch (error) {
        console.log(error.message);
    }
}

const getCustomerBlocked = async (req, res)=>{
    try {
        let id = req.query.id
        await User.updateOne({_id : id}, {$set : {isBlocked : true}})
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error.message);
    }
}

const getCustomerUnblocked = async (req, res)=>{
    try {
        let id = req.query.id
        await User.updateOne({_id : id}, {$set : {isBlocked : false}})
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error.message);
    }
}


// CATEGORY SIDE


const Category = require("../models/categorySchema")


// Rendering the category page
const getCategoryInfo = async (req, res)=>{
    try {
        const categoryData = await Category.find({})
        res.render("category", {cat : categoryData})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res)=>{
    try {
        const {name, description} = req.body
        const categoryExists = await Category.findOne({name})
        if(description){
            if(!categoryExists){
                const newCategory = new Category({
                    name : name,
                    description : description
                })
                await newCategory.save()
                console.log("New Category : ", newCategory);
                res.redirect("/admin/allCategory")
            }else{
                res.redirect("/admin/category")
                console.log("Category Already exists");
            }
        }else{
            console.log("description required");
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getAllCategories = async (req, res)=>{
    try {
        const categoryData = await Category.find({})
        res.render("category", {cat : categoryData})
    } catch (error) {
        console.log(error.message);
    }
}


const getListCategory = async (req, res)=>{
    try {
        let id = req.query.id
        console.log("wrking");
        await Category.updateOne({_id : id}, {$set : {isListed : false}})
        res.redirect("/admin/category")
    } catch (error) {
        console.log(error.message);
    }
}


const getUnlistCategory = async (req, res)=>{
    try {
        let id = req.query.id
        await Category.updateOne({_id : id}, {$set : {isListed : true}})
        res.redirect("/admin/category")
    } catch (error) {
        console.log(error.message);
    }
}


const getEditCategory = async (req, res)=>{
    try{
        const id = req.query.id
        const category = await Category.findOne({_id : id})
        res.render("edit-category", {category : category})
    } catch (error) {
        console.log(error.message);
    }
}


const editCategory = async (req, res)=>{
    try {
        const id = req.params.id
        const {categoryName, description} = req.body
        const findCategory = await Category.find({_id : id})
        if(findCategory){
            await Category.updateOne(
                {_id : id},
                {
                name : categoryName,
                description : description
                })
            res.redirect("/admin/category")
        }else{
            console.log("Category not found");
        }
      
    } catch (error) {
        console.log(error.message);
    }
}





// PRODUCTS SIDE



const Product = require("../models/productSchema")

// Rendering the product addpage

const getProductAddPage = async (req, res)=>{
    try {
        res.render("product-add")
    } catch (error) {
        console.log(error.message);
    }
}


const addProducts = async (req, res)=>{
    try {
        const {productName, brand, description, category, regularPrice, salePrice, quantity} = req.body
        const {size, color, processor} = req.body
        console.log(productName);
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    getDashboard,
    getLoginPage,
    verifyLogin,
    getLogout,
    getCustomersInfo,
    getCustomerBlocked,
    getCustomerUnblocked,
    getEditCategory,
  

    //category
    getCategoryInfo,
    addCategory,
    getAllCategories,
    getListCategory,
    getUnlistCategory,
    editCategory,


    //product
    getProductAddPage,
    addProducts
}