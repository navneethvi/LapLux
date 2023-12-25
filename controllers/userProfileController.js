const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")
const nodemailer = require("nodemailer")

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

const editUserDetails = async (req, res) => {
    try {
        const userId = req.query.id
        const data = req.body
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    name: data.name,
                    phone: data.phone
                    // email: data.email,
                }
            }
        )
            .then((data) => console.log(data))
        res.redirect("/profile")

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
        res.render("edit-address", { address: addressData, user: user })
    } catch (error) {
        console.log(error.message);
    }
}


const postEditAddress = async (req, res) => {
    try {
        const data = req.body
        const addressId = req.query.id
        console.log(addressId, "address id")
        const user = req.session.user
        const findAddress = await Address.findOne({ "address._id": addressId });
        const matchedAddress = findAddress.address.find(item => item._id == addressId)
        console.log(matchedAddress);
        await Address.updateOne(
            {
                "address._id": addressId,
                "_id": findAddress._id,
            },
            {
                $set: {
                    "address.$": {
                        _id: addressId,
                        addressType: data.addressType,
                        name: data.name,
                        city: data.city,
                        landMark: data.landMark,
                        state: data.state,
                        pincode: data.pincode,
                        phone: data.phone,
                        altPhone: data.altPhone,
                    },
                }
            }
        ).then((result) => {
            console.log(result)
            res.redirect("/profile")
        })
    } catch (error) {
        console.log(error.message);
    }
}


const getDeleteAddress = async (req, res) => {
    try {

        const addressId = req.query.id
        const findAddress = await Address.findOne({ "address._id": addressId })
        await Address.updateOne(
            { "address._id": addressId },
            {
                $pull: {
                    address: {
                        _id: addressId
                    }
                }
            }
        )
            .then((data) => console.log(data)
            )
    } catch (error) {
        console.log(error.message);
    }
}


const getForgotPassPage = async (req, res) => {
    try {
        res.render("forgot-password")
    } catch (error) {
        console.log(error.message);
    }
}


function generateOtp() {
    const digits = "1234567890"
    var otp = ""
    for (i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}






const forgotEmailValid = async (req, res) => {
    try {
        const { email } = req.body

        const findUser = await User.findOne({ email: email })

        if (findUser) {
            const otp = generateOtp()
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
                res.redirect("/verifyEmail")
                console.log("Email sented", info.messageId);
            } else {
                res.json("email-error")
            }
        } else {
            res.render("forgot-password", { message: "User with this email already exists" })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const verifyForgotPassOtp = async (req, res) => {
    try {
        const enteredOtp = req.body.otp
        if (enteredOtp === req.session.userOtp) {
            res.render("reset-password")
        } else {
            res.render("forgotPass-otp", { message: "Otp not matching" })
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getUserProfile,
    getAddressAddPage,
    postAddress,
    getEditAddress,
    postEditAddress,
    getDeleteAddress,
    editUserDetails,
    getForgotPassPage,
    forgotEmailValid,
    verifyForgotPassOtp

}