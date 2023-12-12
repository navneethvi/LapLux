const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const Brand = require("../models/brandSchema")
const Product = require("../models/productSchema")




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
        const brandData = await Brand.find({isBlocked : false})
        const productData = await Product.find({isBlocked : false})
        if(user){
            res.render("home", {user : userData, data : brandData, products : productData})
        }else{
            res.render("home", {data : brandData, products : productData})
        }
       
    } catch (error) {
        console.log(error.message)
    }
}

//Loading the Login Page

const getLoginPage = async (req, res) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error.message);
    }
}

//Load signup page

const getSignupPage = async (req, res) => {
    try {
        res.render("signup")
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
                    html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="/api/user/emailOTP/">Click here</a></b>`,
                })
                if (info) {
                    req.session.userOtp = otp
                    req.session.userData = req.body
                    res.render("verify-otp")
                    console.log("Email sented", info.messageId);
                } else {
                    res.json("email-error")
                }
            } else {
                console.log("User already Exist");
            }
        } else {
            console.log("the confirm pass is not matching");
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
            res.json("Otp not matching")
        }

    } catch (error) {
        console.log(error.message);
    }
}



const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const findUser = await User.findOne({ email })
        console.log("wrking");
        const isUserBlocked =  findUser.isBlocked === false
        if(isUserBlocked){
            if (findUser) {
                const passwordMatch = await bcrypt.compare(password, findUser.password)
                if (passwordMatch) {
                    req.session.user = findUser._id
                    console.log("Logged in");
                    res.redirect("/")
                } else {
                    console.log("Login details are incorrect");
    
                }
            } else {
                console.log("Login details are incorrect");
            }
        }else{
            console.log("User is blocked by admin");
        }
    } catch (error) {
        console.log(error.message);
        res.json("error in user login")
    }
}


const getUserProfile = async (req, res)=>{
    try {
        const user = req.session.user
        const userData = await User.findOne({})
        console.log("wrking");
        res.render("profile", {user : userData})
    } catch (error) {
        console.log(error.message);
    }
}


const getLogoutUser = async (req, res)=>{
    try {
        req.session.destroy((err)=>{
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


const getProductDetailsPage = async (req, res)=>{
    try {
        console.log("wrking");
        const id = req.query.id
        console.log(id);
        const findProduct = await Product.find({id : id});
        res.render("product-details", {data : findProduct})
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
    userLogin,
    getUserProfile,
    getLogoutUser,
    getProductDetailsPage
}