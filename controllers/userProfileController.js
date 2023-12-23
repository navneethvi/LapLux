const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")


const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user
        // console.log(userId);
        const userData = await User.findById({ _id: userId });
        // console.log(userData);
        const addressData = await Address.findOne({ userId: userId })
        // console.log(addressData);
       
        res.render("profile", { user: userData, userAddress: addressData })
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
        const userData = await User.findOne({ _id: user })
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

const getEditAddress = async (req, res) => {
    try {
        const addressId = req.query.id
        const user = req.session.user
        const currAddress = await Address.findOne({
            "address._id": addressId,
        });

        const addressData = currAddress.address.find((item) => {
            return item._id.toString() == addressId.toString()
        })
        // console.log(addressData);
        res.render("edit-address", { address: addressData, user : user })
    } catch (error) {
        console.log(error.message);
    }
}


const postEditAddress = async (req, res)=>{
    try {
        const data = req.body
        console.log(data);
        const addressId = req.query.id
        // console.log(addressId, "address id")
        const user = req.session.user
        const findAddress = await Address.findOne({"address._id" : addressId})
        const matchingAddress = findAddress.address.find((item)=>{
            return item._id == addressId
        })
        await Address.updateOne(
            {"address._id" : matchingAddress._id},
            {$set : {
                addressType : data.addressType,
                name : data.name,
                city : data.city,
                landMark : data.landMark,
                state : data.landMark,
                pincode : data.pincode,
                phone : data.phone,
                altPhone : data.altPhone
            }}
          
        ).then((data)=>{
            console.log(data)
        })
        
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    getUserProfile,
    getAddressAddPage,
    postAddress,
    getEditAddress,
    postEditAddress
}