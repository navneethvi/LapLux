const express = require("express")
const Router = express.Router()

const adminController = require("../controllers/adminController")

const {isAdmin} = require("../Authentication/auth")


Router.get("/login", adminController.getLoginPage)
Router.post("/login", adminController.verifyLogin)
Router.get("/logout", adminController.getLogout)

//Admin actions

Router.get("/",isAdmin, adminController.getDashboard)
Router.get("/users",isAdmin, adminController.getCustomersInfo)
Router.get("/category",isAdmin, adminController.getCategoryInfo)
Router.post("/addCategory",isAdmin, adminController.addCategory)
Router.get("/allCategory",isAdmin, adminController.getAllCategories)
Router.get("/blockCustomer",isAdmin, adminController.getCustomerBlocked)
Router.get("/unblockCustomer",isAdmin, adminController.getCustomerUnblocked)
Router.get("/listCategory", adminController.getListCategory)
Router.get("/unListCategory", adminController.getUnlistCategory)
Router.get("/editCategory", adminController.getEditCategory)
Router.post("/editCategory/:id", adminController.editCategory)


//Product Management

const multer = require("multer")
const storage = require("../helpers/multer")
const upload = multer({storage : storage})
Router.use(express.static("public"))
Router.use("/uploads", express.static("uploads"))


Router.get("/addProducts", adminController.getProductAddPage)
Router.post("/addProducts", upload.array("images"))

module.exports = Router
