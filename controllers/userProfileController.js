const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")


const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user
        // console.log(userId);
        const userData = await User.findById({_id : userId});
        // console.log(userData);
        const addressData = await Address.findOne({userId : userId})
        console.log(addressData);
        console.log("wrking");
        res.render("profile", { user: userData , userAddress : addressData})
    } catch (error) {
        console.log(error.message);
    }
}

const getAddressAddPage = async (req, res) => {
    try {
        const user = req.session.user
        res.render("add-address", { user: user })
    } catch (error) {
        console.log(error.message);
    }
}


const postAddress = async (req, res) => {
    try {
        const user = req.session.user
        console.log(user);
        const userData = await User.findOne({ _id : user })
        const {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone,
        } = req.body;
        const userAddress = await Address.findOne({ userId: userData._id })
        console.log(userAddress);
        if (!userAddress) {
            console.log("fst");
            console.log(userData._id);
            const newAddress = new Address({
                userId: userData._id,
                address: [
                    {
                        addressType,
                        name,
                        city,
                        landMark,
                        state,
                        pincode,
                        phone,
                        altPhone,
                    },
                ]
            })
            await newAddress.save()
        } else {
            console.log("scnd");
            userAddress.address.push({
                addressType,
                name,
                city,
                landMark,
                state,
                pincode,
                phone,
                altPhone,
            })
            await userAddress.save()
        }
        
        res.redirect("/profile")

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getUserProfile,
    getAddressAddPage,
    postAddress
}