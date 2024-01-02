const express = require("express")
const Router = express.Router()

const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController,")
const userProfileController = require("../controllers/userProfileController")
const orderController = require("../controllers/orderContoller")

const { isLogged } = require("../Authentication/auth")

Router.get("/pageNotFound", userController.pageNotFound)

//user actions
Router.get("/", userController.getHomePage)
Router.get("/login", userController.getLoginPage)
Router.post("/login", userController.userLogin)
Router.get("/signup", userController.getSignupPage)
Router.post("/verify-otp", userController.verifyOtp)
Router.post("/signup", userController.signupUser)
Router.get("/logout", isLogged, userController.getLogoutUser)
Router.get("/forgotPassword", userProfileController.getForgotPassPage)
Router.post("/forgotEmailValid", userProfileController.forgotEmailValid)
Router.post("/verifyPassOtp", userProfileController.verifyForgotPassOtp)
Router.get("/resetPassword", userProfileController.getResetPassPage)
Router.post("/changePassword", userProfileController.postNewPassword)

//user profile
Router.get("/profile", isLogged, userProfileController.getUserProfile)
Router.get("/addAddress", isLogged, userProfileController.getAddressAddPage)
Router.post("/addAddress", isLogged, userProfileController.postAddress)
Router.get("/editAddress", isLogged, userProfileController.getEditAddress),
Router.post("/editAddress", isLogged, userProfileController.postEditAddress)
Router.get("/deleteAddress", isLogged, userProfileController.getDeleteAddress)
Router.post("/editUserDetails", isLogged, userProfileController.editUserDetails)

//Products based routes
Router.get("/productDetails", userController.getProductDetailsPage)
Router.get("/shop", isLogged, userController.getShopPage)

//User cart
Router.get("/cart", isLogged, cartController.getCartPage)
Router.post("/addToCart", isLogged, cartController.addToCart)
Router.post("/changeQuantity", isLogged, cartController.changeQuantity)
Router.get("/deleteItem", isLogged, cartController.deleteProduct)

//Orders
Router.get("/checkout",isLogged, orderController.getCheckoutPage)
Router.post("/orderPlaced", isLogged, orderController.orderPlaced)
Router.get("/orderDetails", isLogged, orderController.getOrderDetailsPage)



module.exports = Router