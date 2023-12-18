const express = require("express")
const Router = express.Router()

const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController,")

const {isLogged} = require("../Authentication/auth")


//user actions
Router.get("/", userController.getHomePage)
Router.get("/login", userController.getLoginPage)
Router.post("/login", userController.userLogin)
Router.get("/signup", userController.getSignupPage)
Router.post("/verify-otp", userController.verifyOtp)
Router.post("/signup", userController.signupUser)
Router.get("/logout",isLogged, userController.getLogoutUser)

//user profile
Router.get("/profile",isLogged, userController.getUserProfile)

//Products based routes
Router.get("/productDetails",isLogged, userController.getProductDetailsPage)
Router.get("/shop", isLogged, userController.getShopPage)

//User cart
Router.get("/cart", isLogged, cartController.getCartPage),
Router.post("/addToCart", isLogged, cartController.addToCart)

module.exports = Router

