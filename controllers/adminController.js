const User = require("../models/userSchema");
const Coupon = require("../models/couponSchema")

const bcrypt = require("bcrypt");
const Order = require("../models/orderSchema");



const getDashboard = async (req, res) => {
    try {
        res.render("index")
    } catch (error) {
        console.log(error.message);
    }
}

const getLoginPage = async (req, res) => {
    try {
        res.render("admin-login")
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email)

        const findAdmin = await User.findOne({ email, isAdmin: "1" })
        // console.log("admin data : ", findAdmin);

        if (findAdmin) {
            const passwordMatch = await bcrypt.compare(password, findAdmin.password)
            if (passwordMatch) {
                req.session.admin = true
                console.log("Admin Logged In");
                res.redirect("/admin")
            } else {
                console.log("Password is not correct");
                res.redirect("/admin/login")
            }
        } else {
            console.log("He's not an admin");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getCouponPageAdmin = async (req, res) => {
    try {
        const findCoupons = await Coupon.find({})
        res.render("coupon", {coupons : findCoupons})
    } catch (error) {
        console.log(error.message);
    }
}

const createCoupon = async (req, res) => {
    try {

        const data = {
            couponName: req.body.couponName,
            startDate: new Date(req.body.startDate + 'T00:00:00'),
            endDate: new Date(req.body.endDate + 'T00:00:00'),
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice)
        };

        const newCoupon = new Coupon({
            name : data.couponName,
            createdOn : data.startDate,
            expireOn : data.endDate,
            offerPrice : data.offerPrice,
            minimumPrice : data.minimumPrice
        })

        await newCoupon.save()
        .then(data=>console.log(data))

        res.redirect("/admin/coupon")
        
console.log(data);
        
    } catch (error) {
        console.log(error.message);
    }
}





const getLogout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message);
    }
}


const getSalesReportPage = async (req, res)=>{
    try {
        const orders = await Order.find({status : "Delivered"}).sort({createdOn : -1})
        console.log(orders);

        
        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("salesReport", {data : currentOrder, totalPages, currentPage})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getDashboard,
    getLoginPage,
    verifyLogin,
    getCouponPageAdmin,
    createCoupon,
    getLogout,
    getSalesReportPage
}