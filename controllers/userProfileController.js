const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")
const Order = require("../models/orderSchema")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")


const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user
        // console.log(userId);
        const userData = await User.findById({ _id: userId });
        // console.log(userData);
        const addressData = await Address.findOne({ userId: userId })
        // console.log(addressData);
        const orderData = await Order.find({ userId: userId }).sort({ createdOn: -1 })
        // console.log(orderData);
        res.render("profile", { user: userData, userAddress: addressData, order: orderData })
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
        console.log(req.body);
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
            .then((data) => res.redirect("/profile")
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


// const getForgotPassOtpPage = async (req, res)=>{
//     try {
//         res.render("forgotPass-otp")
//     } catch (error) {
//         console.log(error.message);
//     }
// }



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
                req.session.email = email
                res.render("forgotPass-otp")
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


const getResetPassPage = async (req, res) => {
    try {
        res.render("reset-password")
    } catch (error) {
        console.log(error.message);
    }
}

const verifyForgotPassOtp = async (req, res) => {
    try {
        const enteredOtp = req.body.otp
        if (enteredOtp === req.session.userOtp) {

            res.json({ status: true })
        } else {
            console.log('jijijijij');
            res.json({ status: false })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const postNewPassword = async (req, res) => {
    try {
        const { newPass1, newPass2 } = req.body
        const email = req.session.email
        if (newPass1 === newPass2) {
            const passwordHash = await securePassword(newPass1)
            await User.updateOne(
                { email: email },
                {
                    $set: {
                        password: passwordHash
                    }
                }
            )
                .then((data) => console.log(data))
            res.redirect("/login")
        } else {
            console.log("Password not match");
            res.render("reset-password", { message: "Password not matching" })
        }


    } catch (error) {
        console.log(error.message);
    }
}


const verifyReferalCode = async (req, res) => {
    try {
        const referalCode = req.body.referalCode
        const currentUser = await User.findOne({ _id: req.session.user })
        // console.log("currentUser=>>>", currentUser);
        const codeOwner = await User.findOne({ referalCode: referalCode })
        // console.log("codeOwner=>>>", codeOwner);

        if (currentUser.redeemed === true) {
            console.log("You have already redeemed a referral code before!");
            res.json({ message: "You have already redeemed a referral code before!" })
            return
        }

        if (!codeOwner || codeOwner._id.equals(currentUser._id)) {
            console.log("Invalid referral code!");
            res.json({ message: "Invalid referral code!" })
            return
        }

        const alreadyRedeemed = codeOwner.redeemedUsers.includes(currentUser._id)

        if (alreadyRedeemed) {
            console.log("You have already used this referral code!");
            res.json({ message: "You have already used this referral code!" })
            return
        } else {

            await User.updateOne(
                { _id: req.session.user },
                {
                    $inc: { wallet: 100 },
                    $push: {
                        history: {
                            amount: 100,
                            status: "credit",
                            date: Date.now()
                        }
                    }
                }
            )
                .then(data => console.log("currentUser Wallet = > ", data))



            await User.updateOne(
                { _id: codeOwner._id },
                {
                    $inc: { wallet: 200 },
                    $push: {
                        history: {
                            amount: 200,
                            status: "credit",
                            date: Date.now()
                        }
                    }
                }
            )
                .then(data => console.log("codeOwner Wallet = > ", data))

            await User.updateOne(
                { _id: codeOwner._id },
                { $unset: { referalCode: "" } }
            )

            await User.updateOne(
                { _id: req.session.user },
                { $set: { redeemed: true } }
            )

            await User.updateOne(
                { _id: codeOwner._id },
                { $push: { redeemedUsers: currentUser._id } }
            )

            console.log("Referral code redeemed successfully!");

            res.json({ message: "Referral code verified successfully!" })
            return

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
    verifyForgotPassOtp,
    getResetPassPage,
    postNewPassword,
    verifyReferalCode
}