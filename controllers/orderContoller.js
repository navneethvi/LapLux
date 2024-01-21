const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Address = require("../models/addressSchema")
const Order = require("../models/orderSchema")
const Coupon = require("../models/couponSchema")
const invoice = require("../helpers/invoice")
const mongodb = require("mongodb")
const razorpay = require("razorpay")
const crypto = require("crypto");

let instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


const getCheckoutPage = async (req, res) => {
    try {
        console.log("queryyyyyyyy", req.query);
        if (req.query.isSingle == "true") {
            const id = req.query.id
            const findProduct = await Product.find({ id: id }).lean()
            const userId = req.session.user
            const findUser = await User.findOne({ _id: userId })
            const addressData = await Address.findOne({ userId: userId })
            // console.log(addressData)
            console.log("THis is find product =>", findProduct);

            const today = new Date().toISOString(); // Get today's date in ISO format

            const findCoupons = await Coupon.find({
                isList: true,
                createdOn: { $lt: new Date(today) },
                expireOn: { $gt: new Date(today) },
                minimumPrice: { $lt: findProduct[0].salePrice },
            });


            console.log(findCoupons, 'this is coupon ');

            res.render("checkout", { product: findProduct, user: userId, findUser: findUser, userAddress: addressData, isSingle: true, coupons: findCoupons })
        } else {
            const user = req.query.userId
            const findUser = await User.findOne({ _id: user })
            // console.log(findUser);
            // const productIds = findUser.cart.map(item => item.productId)
            // console.log(productIds)
            // const findProducts = await Product.find({ _id: { $in: productIds } })
            // console.log(findProducts);
            const addressData = await Address.findOne({ userId: user })
            // console.log("THis is find product =>",findProducts);
            const oid = new mongodb.ObjectId(user);
            const data = await User.aggregate([
                { $match: { _id: oid } },
                { $unwind: "$cart" },
                {
                    $project: {
                        proId: { '$toObjectId': '$cart.productId' },
                        quantity: "$cart.quantity"
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'proId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
            ])

            // console.log("Data  =>>", data)
            // console.log("Data  =>>" , data[0].productDetails[0])
            const grandTotal = req.session.grandTotal
            // console.log(grandTotal);
            const today = new Date().toISOString(); // Get today's date in ISO format

            const findCoupons = await Coupon.find({
                isList: true,
                createdOn: { $lt: new Date(today) },
                expireOn: { $gt: new Date(today) },
                minimumPrice: { $lt: grandTotal },
            });

            res.render("checkout", { data: data, user: findUser, isCart: true, userAddress: addressData, isSingle: false, grandTotal, coupons: findCoupons })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const orderPlaced = async (req, res) => {
    try {
        console.log("req.body================>", req.body);
        if (req.body.isSingle === "true") {
            const { totalPrice, addressId, payment, productId } = req.body
            const userId = req.session.user
            // console.log(req.body)
            //console.log(totalPrice, date, addressId, payment, productId);
            const findUser = await User.findOne({ _id: userId })
            console.log("Find user ===>", findUser);
            const address = await Address.findOne({ userId: userId })
            // console.log(address);
            // const findAddress = address.find(item => item._id.toString() === addressId);
            const findAddress = address.address.find(item => item._id.toString() === addressId);
            console.log(findAddress);
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
                createdOn: Date.now(),
                status: "Confirmed",
            }))

          
            console.log("Order placed")
            findProduct.quantity = findProduct.quantity - 1

            await findProduct.save()


            let orderDone; 

            if (newOrder.payment == 'cod') {
                console.log('Order Placed with COD');
                orderDone = await newOrder.save();
                res.json({ payment: true, method: "cod", order: orderDone, quantity: 1, orderId: userId });
            } else if (newOrder.payment == 'online') {
                console.log('order placed by Razorpay');
                orderDone = await newOrder.save();
                const generatedOrder = await generateOrderRazorpay(orderDone._id, orderDone.totalPrice);
                console.log(generatedOrder, "order generated");
                res.json({ payment: false, method: "online", razorpayOrder: generatedOrder, order: orderDone, orderId: orderDone._id, quantity: 1 });
            } else if (newOrder.payment == "wallet") {
                if (newOrder.totalPrice <= findUser.wallet) {
                    console.log("order placed with Wallet");
                    const data = findUser.wallet -= newOrder.totalPrice;
                    const newHistory = {
                        amount: data,
                        status: "debit",
                        date: Date.now()
                    };
                    findUser.history.push(newHistory);
                    await findUser.save();
            
                    orderDone = await newOrder.save();
            
                    res.json({ payment: true, method: "wallet", order: orderDone, orderId: orderDone._id, quantity: 1, success: true });
                    return;
                } else {
                    console.log("wallet amount is lesser than total amount");
                    res.json({ payment: false, method: "wallet", success: false });
                    return;
                }
            }

        } else {

            console.log("from cart");

            const { totalPrice, addressId, payment } = req.body
            // console.log(totalPrice, addressId, payment);
            const userId = req.session.user
            const findUser = await User.findOne({ _id: userId })
            const productIds = findUser.cart.map(item => item.productId)

            //  const addres= await Address.find({userId:userId})

            const findAddress = await Address.findOne({ 'address._id': addressId });

            if (findAddress) {
                const desiredAddress = findAddress.address.find(item => item._id.toString() === addressId.toString());
                // console.log(desiredAddress);


                const findProducts = await Product.find({ _id: { $in: productIds } })


                const cartItemQuantities = findUser.cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))

                const orderedProducts = findProducts.map((item) => ({
                    _id: item._id,
                    price: item.salePrice,
                    name: item.productName,

                    image: item.productImage[0],
                    quantity: cartItemQuantities.find(cartItem => cartItem.productId.toString() === item._id.toString()).quantity
                }))




                const newOrder = new Order({
                    product: orderedProducts,
                    totalPrice: totalPrice,
                    address: desiredAddress,
                    payment: payment,
                    userId: userId,
                    status: "Confirmed",
                    createdOn: Date.now()

                })
                

                await User.updateOne(
                    { _id: userId },
                    { $set: { cart: [] } }
                );


                // console.log('thsi is new order',newOrder);

                for (let i = 0; i < orderedProducts.length; i++) {

                    const product = await Product.findOne({ _id: orderedProducts[i]._id });
                    if (product) {
                        const newQuantity = product.quantity - orderedProducts[i].quantity;
                        product.quantity = Math.max(newQuantity, 0);
                        await product.save();
                    }
                }
                
                let orderDone
                if (newOrder.payment == 'cod') {
                    console.log('order placed by cod');
                    orderDone = await newOrder.save();
                    res.json({ payment: true, method: "cod", order: orderDone, quantity: cartItemQuantities, orderId: findUser });
                } else if (newOrder.payment == 'online') {
                    console.log('order placed by Razorpay');
                    orderDone = await newOrder.save();
                    const generatedOrder = await generateOrderRazorpay(orderDone._id, orderDone.totalPrice);
                    console.log(generatedOrder, "order generated");
                    res.json({ payment: false, method: "online", razorpayOrder: generatedOrder, order: orderDone, orderId: orderDone._id, quantity: cartItemQuantities });
                } else if (newOrder.payment == "wallet") {
                    if (newOrder.totalPrice <= findUser.wallet) {
                        console.log("order placed with Wallet");
                        const data = findUser.wallet -= newOrder.totalPrice
                        const newHistory = {
                            amount: data,
                            status: "debit",
                            date: Date.now()
                        }
                        findUser.history.push(newHistory)
                        await findUser.save()

                        orderDone = await newOrder.save();

                        res.json({ payment: true, method: "wallet", order: orderDone, orderId: orderDone._id, quantity: cartItemQuantities, success: true })
                        return;
                    } else {
                        console.log("wallet amount is lesser than total amount");
                        res.json({ payment: false, method: "wallet", success: false });
                        return
                    }
                }

            } else {
                console.log('Address not found');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}



const generateOrderRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
}




const getOrderDetailsPage = async (req, res) => {
    try {
        const userId = req.session.user
        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId })
        const findUser = await User.findOne({ _id: userId })
        console.log(findOrder, findUser);
        res.render("orderDetails", { orders: findOrder, user: findUser, orderId })
    } catch (error) {
        console.log(error.message);
    }
}


const getOrderListPageAdmin = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdOn: -1 });

        // console.log(req.query);

        let itemsPerPage = 3
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("orders-list", { orders: currentOrder, totalPages, currentPage })
    } catch (error) {
        console.log(error.message);
    }
}


const cancelOrder = async (req, res) => {
    try {
        console.log("im here");
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const orderId = req.query.orderId
        // console.log(orderId);

        await Order.updateOne({ _id: orderId },
            { status: "Canceled" }
        ).then((data) => console.log(data))

        const findOrder = await Order.findOne({ _id: orderId })

        if (findOrder.payment === "wallet" || findOrder.payment === "online") {
            findUser.wallet += findOrder.totalPrice;

            const newHistory = {
                amount: findOrder.totalPrice,
                status: "credit",
                date: Date.now()
            }
            findUser.history.push(newHistory)
            await findUser.save();
        }

        // console.log(findOrder);

        for (const productData of findOrder.product) {
            const productId = productData.ProductId;
            const quantity = productData.quantity;

            const product = await Product.findById(productId);

            console.log(product, "=>>>>>>>>>");

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



const returnOrder = async (req, res) => {
    try {

        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const id = req.query.id
        await Order.updateOne({ _id: id },
            { status: "Returned" }
        ).then((data) => console.log(data))

        const findOrder = await Order.findOne({ _id: id })


        if (findOrder.payment === "wallet" || findOrder.payment === "online") {
            findUser.wallet += findOrder.totalPrice;

            const newHistory = {
                amount: findOrder.totalPrice,
                status: "credit",
                date: Date.now()
            }
            findUser.history.push(newHistory)
            await findUser.save();
        }

        for (const productData of findOrder.product) {
            const productId = productData.ProductId;
            const quantity = productData.quantity;

            const product = await Product.findById(productId);

            // console.log(product,"=>>>>>>>>>");

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



const changeOrderStatus = async (req, res) => {
    try {
        console.log(req.query);


        const orderId = req.query.orderId
        console.log(orderId);

        await Order.updateOne({ _id: orderId },
            { status: req.query.status }
        ).then((data) => console.log(data))

        // const findOrder = await Order.findOne({ _id: orderId })

        // console.log(findOrder,"order......................");

        res.redirect('/admin/orderList');

    } catch (error) {
        console.log(error.message);
    }
}


const getCartCheckoutPage = async (req, res) => {
    try {
        res.render("checkoutCart")
    } catch (error) {
        console.log(error.message);
    }
}



const getOrderDetailsPageAdmin = async (req, res) => {
    try {
        const orderId = req.query.id
        // console.log(orderId);
        const findOrder = await Order.findOne({ _id: orderId }).sort({ createdOn: 1 })
        // console.log(findOrder);


        res.render("order-details-admin", { orders: findOrder, orderId })
    } catch (error) {
        console.log(error.message);
    }
}

const verify = (req, res) => {
    console.log(req.body);
    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(
        `${req.body.payment.razorpay_order_id}|${req.body.payment.razorpay_payment_id}`
    );
    hmac = hmac.digest("hex");
    // console.log(hmac,"HMAC");
    // console.log(req.body.payment.razorpay_signature,"signature");
    if (hmac === req.body.payment.razorpay_signature) {
        console.log("true");
        res.json({ status: true });
    } else {
        console.log("false");
        res.json({ status: false });
    }
};


const getInvoice = async (req, res) => {
    try {
        console.log("helloooo");
        await invoice.invoice(req, res);
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
    returnOrder,
    getCartCheckoutPage,
    getOrderDetailsPageAdmin,
    verify,
    getInvoice
}