const express = require("express")
const Router = express.Router()

const adminController = require("../controllers/adminController")
const customerController = require("../controllers/customerController")
const categoryController = require("../controllers/categoryController")
const productController = require("../controllers/productController")
const brandController = require("../controllers/brandController")

const {isAdmin} = require("../Authentication/auth")

//Admin Actions
Router.get("/login", adminController.getLoginPage)
Router.post("/login", adminController.verifyLogin)
Router.get("/logout", adminController.getLogout)
Router.get("/",isAdmin, adminController.getDashboard)

//Category Management
Router.get("/category",isAdmin, categoryController.getCategoryInfo)
Router.post("/addCategory",isAdmin, categoryController.addCategory)
Router.get("/allCategory",isAdmin, categoryController.getAllCategories)
Router.get("/listCategory", categoryController.getListCategory)
Router.get("/unListCategory", categoryController.getUnlistCategory)
Router.get("/editCategory", categoryController.getEditCategory)
Router.post("/editCategory/:id", categoryController.editCategory)

//Customer Management
Router.get("/users",isAdmin, customerController.getCustomersInfo)
Router.get("/blockCustomer",isAdmin, customerController.getCustomerBlocked)
Router.get("/unblockCustomer",isAdmin, customerController.getCustomerUnblocked)

// Multer Settings
const multer = require("multer")
const storage = require("../helpers/multer")
const upload = multer({storage : storage})
Router.use("/public/uploads", express.static("/public/uploads"))

//Brand Management
Router.get("/brands", brandController.getBrandPage)
Router.post("/addBrand",upload.single('image'), brandController.addBrand)
Router.get("/allBrands", brandController.getAllBrands)
Router.get("/blockBrand", brandController.blockBrand)
Router.get("/unBlockBrand", brandController.unBlockBrand)

//Product Management
Router.get("/addProducts", productController.getProductAddPage)
Router.post("/addProducts", upload.array("images",5),productController.addProducts)
Router.get("/products", productController.getAllProducts)
Router.get("/blockProduct", productController.getBlockProduct)
Router.get("/unBlockProduct", productController.getUnblockProduct)













module.exports = Router
