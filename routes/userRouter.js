const express = require("express")
const Router = express.Router()

const userController = require("../controllers/userController")

const {isLogged} = require("../Authentication/auth")


//user actions
Router.get("/", userController.getHomePage)
Router.get("/login", userController.getLoginPage)
Router.post("/login", userController.userLogin)
Router.get("/signup", userController.getSignupPage)
Router.post("/verify-otp", userController.verifyOtp)
Router.post("/signup", userController.signupUser)
Router.get("/logout", userController.getLogoutUser)

//user profile
Router.get("/profile",isLogged, userController.getUserProfile)

module.exports = Router
