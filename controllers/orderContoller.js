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
            const findUser = await User.findOne({ _id: userId })
            const addressData = await Address.findOne({ userId: userId })
            // console.log(addressData)
            res.render("checkout", { product: findProduct, user: userId, findUser: findUser, userAddress: addressData, isSingle: true })
        } else {
            const user = req.query.userId
            const findUser = await User.findOne({ _id: user })
            // console.log(findUser);
            const productIds = findUser.cart.map(item => item.productId)
            console.log(productIds)
            const findProducts = await Product.find({ _id: { $in: productIds } })
            console.log(findProducts);
            const addressData = await Address.findOne({ userId: user })
            res.render("checkout", { product: findProducts, user: findUser, userAddress: addressData, isCart: true })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const orderPlaced = async (req, res) => {
    try {
        const { totalPrice, createdOn, date, addressId, payment, productId } = req.body
        console.log(totalPrice, createdOn, date, addressId, payment, productId);
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


const orderPlaceFromCart = async (req, res) => {
    try {
        const { totalPrice, createdOn, date, addressId, payment } = req.body
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })
        const productIds = findUser.cart.map(item => item.productId)
        // console.log(productIds);
        const findAddress = await Address.find({ _id: addressId })
        const findProducts = await Product.find({ _id: { $in: productIds } })
        const cartItemQuantities = findUser.cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
        }))

        const orderedProducts = findProducts.map((item) => ({
            productId: item._id,
            price: item.salePrice,
            name: item.productName,
            image: item.productImage[0],
            quantity: cartItemQuantities.find(item => item.productId.toString() === productId.toString()).quantity
        }))

        const newOrder = new Order({
            product: orderedProducts,
            totalPrice: totalPrice,
            address: findAddress,
            payment: payment,
            userId: userId,
            status: "Confirmed",
            createdOn: createdOn,
            date: date
        })
        const orderDone = await newOrder.save()

        for (const orderProduct of orderedProducts) {
            const product = await Product.find({ _id: orderProduct.productId })
            if (product) {
                const newQuantity = product.quantity - orderProduct.quantity
                product.quantity = Math.max(newQuantity, 0)
                await product.save()
            }
        }

        if (order.payment == 'cod') {
            console.log('order placed by cod');
            res.json({ payment: true, method: "cod", order: orderDone, quantity: cartItemQuantities, orderId: user });

        }

    } catch (error) {
        console.log(error.message);
    }
}


const getOrderDetailsPage = async (req, res) => {
    try {
        const userId = req.session.user
        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId })
        const findUser = await User.findOne({ _id: userId })
        // console.log(findOrder, findUser);
        res.render("orderDetails", { orders: findOrder, user: findUser, orderId })
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


const cancelOrder = async(req, res)=>{
    try {
        console.log("im here");
        const userId = req.session.user
        const findUser = await User.findOne({_id : userId})

        if(!findUser){
            return res.status(404).json({ message: 'User not found' });
        }

        const orderId = req.query.orderId
        console.log(orderId);
        
        await Order.updateOne({_id: orderId}, 
            {status: "Canceled"}
        ).then((data)=>console.log(data))

        const findOrder = await Order.findOne({_id : orderId})

        
        
        for (const productData of findOrder.product) {
            const productId = productData.productId;
            const quantity = productData.quantity;
      
            const product = await Product.findById(productId);
      
            if (product) {
              product.quantity += quantity;
              await product.save();
            }
          }
      
          res.redirect('/profile');

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCheckoutPage,
    orderPlaced,
    orderPlaceFromCart,
    getOrderDetailsPage,
    getOrderListPageAdmin,
    cancelOrder
}