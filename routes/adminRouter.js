const express = require("express")
const Router = express.Router()

const adminController = require("../controllers/adminController")
const customerController = require("../controllers/customerController")
const categoryController = require("../controllers/categoryController")
const productController = require("../controllers/productController")
const brandController = require("../controllers/brandController")
const orderContoller = require("../controllers/orderContoller")

const { isAdmin } = require("../Authentication/auth")


//Admin Actions
Router.get("/login", adminController.getLoginPage)
Router.post("/login", adminController.verifyLogin)
Router.get("/logout", isAdmin, adminController.getLogout)
Router.get("/", isAdmin, adminController.getDashboard)


// Category Management
Router.get("/category", isAdmin, categoryController.getCategoryInfo)
Router.post("/addCategory", isAdmin, categoryController.addCategory)
Router.get("/allCategory", isAdmin, categoryController.getAllCategories)
Router.get("/listCategory", isAdmin, categoryController.getListCategory)
Router.get("/unListCategory", isAdmin, categoryController.getUnlistCategory)
Router.get("/editCategory", isAdmin, categoryController.getEditCategory)
Router.post("/editCategory/:id", isAdmin, categoryController.editCategory)


// Customer Management
Router.get("/users", isAdmin, customerController.getCustomersInfo)
Router.get("/blockCustomer", isAdmin, customerController.getCustomerBlocked)
Router.get("/unblockCustomer", isAdmin, customerController.getCustomerUnblocked)


// Multer Settings
const multer = require("multer")
const storage = require("../helpers/multer")
const upload = multer({ storage: storage })
Router.use("/public/uploads", express.static("/public/uploads"))

// Brand Management
Router.get("/brands", isAdmin, brandController.getBrandPage)
Router.post("/addBrand", isAdmin, upload.single('image'), brandController.addBrand)
Router.get("/allBrands", isAdmin, brandController.getAllBrands)
Router.get("/blockBrand", isAdmin, brandController.blockBrand)
Router.get("/unBlockBrand", isAdmin, brandController.unBlockBrand)

// Product Management
Router.get("/addProducts", isAdmin, productController.getProductAddPage)
Router.post("/addProducts", isAdmin, upload.array("images", 5), productController.addProducts)
Router.get("/products", isAdmin, productController.getAllProducts)
Router.get("/editProduct", isAdmin, productController.getEditProduct)
Router.post("/editProduct/:id", isAdmin, upload.array("images", 5), productController.editProduct)
Router.get("/deleteImage/:id", isAdmin, productController.deleteSingleImage)
Router.get("/blockProduct", isAdmin, productController.getBlockProduct)
Router.get("/unBlockProduct", isAdmin, productController.getUnblockProduct)

// Order Management
Router.get("/orderList", isAdmin, orderContoller.getOrderListPageAdmin)
Router.get("/orderDetailsAdmin", isAdmin, orderContoller.getOrderDetailsPageAdmin)
Router.get("/changeStatus", isAdmin, orderContoller.changeOrderStatus)


module.exports = Router