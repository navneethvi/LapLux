const User = require("../models/userSchema");


const getCustomersInfo = async (req, res)=>{
    try {
        let search = ""
        if(req.query.search){
            search = req.query.search
        }
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


module.exports = {
    getCustomersInfo,
    getCustomerBlocked,
    getCustomerUnblocked,
}