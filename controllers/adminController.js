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

module.exports = {
    getDashboard,
    getLoginPage,
    verifyLogin,
    getLogout
}