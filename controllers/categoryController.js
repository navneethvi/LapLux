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





module.exports = {
    getCategoryInfo,
    addCategory,
    getAllCategories,
    getListCategory,
    getUnlistCategory,
    editCategory,
    getEditCategory
}