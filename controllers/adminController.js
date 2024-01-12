const User = require("../models/userSchema");
const Coupon = require("../models/couponSchema")

const bcrypt = require("bcrypt")



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
        res.render("coupon")
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

module.exports = {
    getDashboard,
    getLoginPage,
    verifyLogin,
    getCouponPageAdmin,
    createCoupon,
    getLogout
}