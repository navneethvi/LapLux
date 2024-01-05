const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")
const Order = require("../models/orderSchema")

const getCheckoutPage = async (req, res) => {
    try {
        console.log("queryyyyyyyy",req.query);
        if (req.query.isSingle == "true") {
            const id = req.query.id
            const findProduct = await Product.find({ id: id }).lean()
            const userId = req.session.user
            const findUser = await User.findOne({ _id: userId })
            const addressData = await Address.findOne({ userId: userId })
            // console.log(addressData)
            console.log("THis is find product =>",findProduct);
            res.render("checkout", { product: findProduct, user: userId, findUser: findUser, userAddress: addressData, isSingle: true })
        } else {
            const user = req.query.userId
            const findUser = await User.findOne({ _id: user })
            // console.log(findUser);
            const productIds = findUser.cart.map(item => item.productId)
            // console.log(productIds)
            const findProducts = await Product.find({ _id: { $in: productIds } })
            // console.log(findProducts);
            const addressData = await Address.findOne({ userId: user })
            // console.log("THis is find product =>",findProducts);
            res.render("checkout", { product: findProducts, user: findUser, userAddress: addressData, isCart: true , isSingle : false})
        }

    } catch (error) {
        console.log(error.message);
    }
}


const orderPlaced = async (req, res) => {
    try {
        console.log("req.body================>",req.body);
        if(req.body.isSingle === "true"){
            const { totalPrice, addressId, payment, productId } = req.body
            // console.log(req.body)
            //console.log(totalPrice, date, addressId, payment, productId);
            const userId = req.session.user
            const findUser = await User.findOne({ _id: userId })
            console.log("Find user ===>",findUser);
            const address = await Address.findOne({ userId: userId })
            // console.log(address);
            // const findAddress = address.find(item => item._id.toString() === addressId);
            const findAddress = address.address.find(item => item._id.toString() === addressId);
            // console.log(findAddress);
            console.log("Before product search")
            const findProduct = await Product.findOne({ _id: productId })
            // console.log(findProduct);
    
            const productDetails = {
                ProductId: findProduct._id,
                price: findProduct.salePrice,
                title: findProduct.productName,
                image: findProduct.productImage[0],
                quantity: 1
            }
            console.log("Before order placed")
            const newOrder = new Order(({
                product: productDetails,
                totalPrice: totalPrice,
                address: findAddress,
                payment: payment,
                userId: userId,
                createdOn:Date.now(),
                status: "Confirmed",
            }))
    
            const orderDone = await newOrder.save()
            console.log("Order placed")
            findProduct.quantity = findProduct.quantity - 1
            
            await findProduct.save()
    
    
            if (newOrder.payment == 'cod') {
                console.log('Order Placed with COD');
                res.json({ payment: true, method: "cod", order: orderDone, quantity: 1, orderId: userId });
            }
        }else{
            
            console.log("from cart");

            const { totalPrice, addressId, payment } = req.body
            // console.log(totalPrice, addressId, payment);
            const userId = req.session.user
            const findUser = await User.findOne({ _id: userId })
            const productIds = findUser.cart.map(item => item.productId)
            // console.log(productIds);
            const findAddress = await Address.find({ _id: addressId })
            const findProducts = await Product.find({ _id: { $in: productIds } })
            console.log("helloooo");
            const cartItemQuantities = findUser.cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity
            }))
            console.log("cartItemQuantity",cartItemQuantities);
            const orderedProducts = findProducts.map((item) => ({
                _id: item._id,
                price: item.salePrice,
                name: item.productName,
                image: item.productImage[0],
                quantity: cartItemQuantities.find(item => item.productId.toString() === item._id.toString()).quantity
            }))
            console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
            
            console.log(orderedProducts);
    
            const newOrder = new Order({
                product: orderedProducts,
                totalPrice: totalPrice,
                address: findAddress,
                payment: payment,
                userId: userId,
                status: "Confirmed",
                
                
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
    
            if (newOrderorder.payment == 'cod') {
                console.log('order placed by cod');
                res.json({ payment: true, method: "cod", order: orderDone, quantity: cartItemQuantities, orderId: user });
    
            }


        }
        

    } catch (error) {
        console.log(error.message);
    }
}






// const orderPlaceFromCart = async (req, res) => {
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
        res.render("orderDetails", { orders: findOrder, user: findUser, orderId })
    } catch (error) {
        console.log(error.message);
    }
}


const getOrderListPageAdmin = async (Req, res) => {
    try {
        const orders = await Order.find({})
        res.render("orders-list", { orders : orders })
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



const changeOrderStatus = async(req, res)=>{
    try {
        console.log(req.query);
       

        const orderId = req.query.orderId
        console.log(orderId);
        
        await Order.updateOne({_id: orderId}, 
            {status: req.query.status}
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
      
          res.redirect('/admin/orderList');

    } catch (error) {
        console.log(error.message);
    }
}


const getCartCheckoutPage = async (req, res)=>{
    try {
        res.render("checkoutCart")
    } catch (error) {
        console.log(error.message);
    }
}



const getOrderDetailsPageAdmin = async (req, res)=>{
    try {
        const orderId = req.query.id
        // console.log(orderId);
        const findOrder = await Order.findOne({_id : orderId})
        // console.log(findOrder);


        res.render("order-details-admin", {orders : findOrder, orderId})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCheckoutPage,
    orderPlaced,
    changeOrderStatus,
    getOrderDetailsPage,
    getOrderListPageAdmin,
    cancelOrder,
    getCartCheckoutPage,
    getOrderDetailsPageAdmin
}