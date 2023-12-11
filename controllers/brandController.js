const Brand = require("../models/brandSchema")

const getBrandPage = async (req, res)=>{
    try {
        const brandData = await Brand.find({})
        res.render("brands", {data : brandData})
    } catch (error) {
        console.log(error.message);
    }
}

const addBrand = async (req, res)=>{
    try {
        const brand = req.body.name
        console.log(brand);
        const findBrand = await Brand.findOne({brand})
        if(!findBrand){
            const image = req.file
            const newBrand = new Brand({
                brandName : brand,
                brandImage : image
            })

            await newBrand.save()
            res.redirect("/admin/brands")
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getAllBrands = async (req, res)=>{
    try {
        const brands = await Brand.find({})
        console.log(brands);
        
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getBrandPage,
    addBrand,
    getAllBrands
}