const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")
const Order = require("../models/orderSchema")

const getCheckoutPage = async (req, res) => {
    try { 
        if (req.query.isSingle == "true") {
            const id = req.query.id
            const findProduct = await Product.find({ id: id })
            const userId = req.session.user
            const addressData = await Address.findOne({ userId: userId })
            // console.log(addressData)
            res.render("checkout", { product: findProduct, user: userId, userAddress: addressData })
        }else{
            const user = req.query.userId
            const findUser = await User.findOne({ _id : user })
            // console.log(findUser);
            const productIds = findUser.cart.map(item=>item.productId)
            console.log(productIds)
            const findProducts = await Product.find({_id : {$in : productIds}})
            console.log(findProducts);
            const addressData = await Address.findOne({ userId: user })
            res.render("checkout", {product : findProducts, user : user, userAddress : addressData})
        }

    } catch (error) {
        console.log(error.message);
    }
}


const orderPlaced = async (req, res) => {
    try {
        const { totalPrice, createdOn, date, addressId, payment, productId } = req.body
        // console.log(totalPrice, createdOn, date, addressId, payment, productId);
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })
        // console.log(findUser);
        const address = await Address.findOne({ userId: userId })
        // console.log(address);
        // const findAddress = address.find(item => item._id.toString() === addressId);
        const findAddress = address.address.find(item => item._id.toString() === addressId);
        // console.log(findAddress);
        const findProduct = await Product.findOne({ _id: productId })
        // console.log(findProduct);

        const productDetails = {
            ProductId: findProduct._id,
            price: findProduct.salePrice,
            title: findProduct.productName,
            image: findProduct.productImage[0],
            quantity: 1
        }

        const newOrder = new Order(({
            product: productDetails,
            totalPrice: totalPrice,
            address: findAddress,
            payment: payment,
            userId: userId,
            status: "Confirmed",
            createdOn: createdOn,
            date: date
        }))

        const orderDone = await newOrder.save()

        findProduct.quantity = findProduct.quantity - 1

        await findProduct.save()


        if (newOrder.payment == 'cod') {
            console.log('Order Placed with COD');
            res.json({ payment: true, method: "cod", order: orderDone, quantity: 1, orderId: userId });
        }

    } catch (error) {
        console.log(error.message);
    }
}



// const orderPlacedFromCart = async (req, res)=>{
//     try {

//     } catch (error) {
//         console.log(error.message);
//     }
// }

const getOrderDetailsPage = async (req, res) => {
    try {
        const userId = req.session.user
        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId })
        const findUser = await User.findOne({ _id: userId })
        // console.log(findOrder, findUser);
        res.render("orderDetails", { orders: findOrder, user: findUser })
    } catch (error) {
        console.log(error.message);
    }
}


const getOrderListPageAdmin = async (Req, res) => {
    try {
        const orders = await Order.find({})
        res.render("orders-list", { orders })
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCheckoutPage,
    orderPlaced,
    getOrderDetailsPage,
    getOrderListPageAdmin
}