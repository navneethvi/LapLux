const User = require("../models/userSchema")

const getCustomersInfo = async (req, res) => {
    try {
        let search = ""
        if (req.query.search) {
            search = req.query.search
        }
        let page = 1
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 3
        const userData = await User.find({
            isAdmin: "0",
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } },
            ]
        }).limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()

        const count = await User.find({
            isAdmin: "0",
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } },
            ]
        }).countDocuments()

        res.render("customers", {
            data: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        })
    } catch (error) {
        console.log(error.message);
    }
}

const getCustomerBlocked = async (req, res) => {
    try {
        let id = req.query.id
        await User.updateOne({ _id: id }, { $set: { isBlocked: true } })
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error.message);
    }
}

const getCustomerUnblocked = async (req, res) => {
    try {
        let id = req.query.id
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } })
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