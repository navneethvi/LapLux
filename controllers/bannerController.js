const Banner = require("../models/bannerSchema")

const bannerManagement = async (req, res) => {
    try {
        const findBanner = await Banner.find({})
        res.render("banner", { data: findBanner })
    } catch (error) {
        console.log(error.message);
    }
}



const getAddBannerPage = async (req, res) => {
    try {
        res.render("addBanner")
    } catch (error) {
        console.log(error.message);
    }
}

const postAddBanner = async (req, res) => {
    try {
        const data = req.body
        const image = req.file

        const newBanner = new Banner({
            image: image.filename,
            title: data.title,
            description: data.description,
            startDate: new Date(data.startDate + 'T00:00:00'),
            endDate: new Date(data.endDate + 'T00:00:00'),
            link: data.link
        })

        await newBanner.save()
            .then(data => console.log(data))
        res.redirect("/admin/banner")

    } catch (error) {
        console.log(error.message);
    }
}


const getEditBannerPage = async (req, res)=>{
    try {
        const id = req.query.id
        const findBanner = await Banner.findOne({_id : id})
        res.render("editBanner", {data : findBanner})
    } catch (error) {
        console.log(error.message);
    }
}

const postEditBanner = async(req, res)=>{
    try {
        console.log(req.file);
        console.log(req.body);
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getAddBannerPage,
    bannerManagement,
    postAddBanner,
    getEditBannerPage,
    postEditBanner
}