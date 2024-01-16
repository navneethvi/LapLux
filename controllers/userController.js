const nodemailer = require("nodemailer")

const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const Brand = require("../models/brandSchema")
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Coupon = require("../models/couponSchema")
const { application } = require("express");



const pageNotFound = async (req, res) => {
    try {
        res.render("page-404")
    } catch (error) {
        console.log(error.message);
    }
}

//Generate Hashed Password

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

//Loading the Home page

const getHomePage = async (req, res) => {
    try {
        const user = req.session.user
        const userData = await User.findOne({})
        const brandData = await Brand.find({ isBlocked: false })
        const productData = await Product.find({ isBlocked: false }).sort({ id: -1 }).limit(4)

        if (user) {
            res.render("home", { user: userData, data: brandData, products: productData })
        } else {
            res.render("home", { data: brandData, products: productData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//Loading the Login Page

const getLoginPage = async (req, res) => {
    try {
        if (!req.session.user) {
            res.render("login")
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);
    }
}


//Load signup page

const getSignupPage = async (req, res) => {
    try {
        if (!req.session.user) {
            res.render("signup")
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);
    }
}

//Generate OTP

function generateOtp() {
    const digits = "1234567890"
    var otp = ""
    for (i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}

//User Registration

const signupUser = async (req, res) => {
    try {
        const { email } = req.body
        const findUser = await User.findOne({ email })
        if (req.body.password === req.body.cPassword) {
            if (!findUser) {
                var otp = generateOtp()
                console.log(otp);
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                })
                const info = await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Verify Your Account ✔",
                    text: `Your OTP is ${otp}`,
                    html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="">Click here</a></b>`,
                })
                if (info) {
                    req.session.userOtp = otp
                    req.session.userData = req.body
                    res.render("verify-otp", {email})
                    console.log("Email sented", info.messageId);
                } else {
                    res.json("email-error")
                }
            } else {
                console.log("User already Exist");
                res.render("signup", { message: "User with this email already exists" })
            }
        } else {
            console.log("the confirm pass is not matching");
            res.render("signup", { message: "The confirm pass is not matching" })
        }


    } catch (error) {
        console.log(error.message);
    }
}


// render the OTP verification page

const getOtpPage = async (req, res) => {
    try {
        res.render("verify-otp")
    } catch (error) {
        console.log(error.message);
    }
}


// Resend Otp

const resendOtp = async (req, res) => {
    try {
        const email = req.session.userData.email;
        var newOtp = generateOtp();
        console.log(email, newOtp);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Resend OTP ✔",
            text: `Your new OTP is ${newOtp}`,
            html: `<b>  <h4 >Your new OTP is ${newOtp}</h4>    <br>  <a href="">Click here</a></b>`,
        });

        if (info) {
            req.session.userOtp = newOtp;
            res.json({ success: true, message: 'OTP resent successfully' });
            console.log("Email resent", info.messageId);
        } else {
            res.json({ success: false, message: 'Failed to resend OTP' });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'Error in resending OTP' });

    }
}


// Verify otp from email with generated otp and save the user data to db

const verifyOtp = async (req, res) => {
    try {

        //get otp from body
        const { otp } = req.body
        if (otp === req.session.userOtp) {
            const user = req.session.userData
            const passwordHash = await securePassword(user.password)

            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash
            })

            await saveUserData.save()

            req.session.user = saveUserData._id


            res.redirect("/")
        } else {
            res.render("verify-otp", { message: "Otp not matching" })
            console.log("otp not matching");
        }

    } catch (error) {
        console.log(error.message);
    }
}


    
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const findUser = await User.findOne({ isAdmin: "0", email: email })

        console.log("working");

        if (findUser) {
            const isUserNotBlocked = findUser.isBlocked === false;

            if (isUserNotBlocked) {
                const passwordMatch = await bcrypt.compare(password, findUser.password)
                if (passwordMatch) {
                    req.session.user = findUser._id
                    console.log("Logged in");
                    res.redirect("/")
                } else {
                    console.log("Password is not matching");
                    res.render("login", { message: "Password is not matching" })
                }
            } else {
                console.log("User is blocked by admin");
                res.render("login", { message: "User is blocked by admin" })
            }
        } else {
            console.log("User is not found");
            res.render("login", { message: "User is not found" })
        }

    } catch (error) {
        console.log(error.message);
        res.render("login", { message: "Login failed" })
    }
}






const getLogoutUser = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log("Logged out");
            res.redirect("/login")
        })
    } catch (error) {
        console.log(error.message);
    }
}


const getProductDetailsPage = async (req, res) => {
    try {
        const user = req.session.user
        console.log("wrking");
        const id = req.query.id
        console.log(id);
        const findProduct = await Product.findOne({ id: id });
        console.log(findProduct.id, "Hello world");
        if (user) {
            res.render("product-details", { data: findProduct, user: user })
        } else {
            res.render("product-details", { data: findProduct })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getShopPage = async (req, res) => {
    try {
        const user = req.session.id
        const products = await Product.find({ isBlocked: false })
        const count = await Product.find({ isBlocked: false }).count()
        const brands = await Brand.find({})
        const categories = await Category.find({ isListed: true })

        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(products.length/6)
        const currentProduct = products.slice(startIndex, endIndex)

        res.render("shop",
            {
                user: user,
                product: currentProduct,
                category: categories,
                brand: brands,
                count: count,
                totalPages,
                currentPage,
            })
    } catch (error) {
        console.log(error.message);
    }
}


const searchProducts = async (req, res)=>{
    try {   
        const user = req.session.user
        let search = req.query.search
        const brands = await Brand.find({})
        const categories = await Category.find({ isListed: true })

        const searchResult = await Product.find({
            $or : [
                {
                    productName : { $regex: ".*" + search + ".*", $options: "i" },
                }
            ],
            isBlocked : false,
        }).lean()

        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(searchResult.length/6)
        const currentProduct = searchResult.slice(startIndex, endIndex)


        res.render("shop",
            {
                user: user,
                product: currentProduct,
                category: categories,
                brand: brands,
                totalPages,
                currentPage
            })

    } catch (error) {
        console.log(error.message);
    }
}



const categoryWiseFilter = async (req, res)=>{
    try {
        const user = req.session.user
        const id = req.query.id
        const brands = await Brand.find({})
        const findCategory = await Category.findOne({_id : id})
        const findProducts = await Product.find({category : findCategory.name, isBlocked : false})
        const categories = await Category.find({isListed : true})

        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(findProducts.length/6)
        const currentProduct = findProducts.slice(startIndex, endIndex)

        res.render("shop",
        {
            user: user,
            product: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage
        })


    } catch (error) {
        console.log(error.message);
    }
}


const applyCoupon = async (req, res)=>{
    try {
        const userId = req.session.user
        console.log(req.body);
        const selectedCoupon = await Coupon.findOne({name : req.body.coupon})
        // console.log(selectedCoupon);
        if(!selectedCoupon){
            console.log("no coupon");
            res.json({noCoupon : true})
        }else if(selectedCoupon.userId.includes(userId)){
            console.log("already used");
            res.json({used : true})
        }else{
            console.log("coupon exists");
            await Coupon.updateOne(
                { name: req.body.coupon },
                {
                    $addToSet: {
                        userId: userId
                    }
                }
            );
            const gt = parseInt(req.body.total)-parseInt(selectedCoupon.offerPrice);
            console.log(gt,"----");
            res.json({gt : gt, offerPrice : parseInt(selectedCoupon.offerPrice)})
        }
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    getHomePage,
    getLoginPage,
    getSignupPage,
    signupUser,
    getOtpPage,
    verifyOtp,
    resendOtp,
    userLogin,
    getLogoutUser,
    getProductDetailsPage,
    getShopPage,
    pageNotFound,
    searchProducts,
    categoryWiseFilter,
    applyCoupon
}