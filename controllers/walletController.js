    const User = require("../models/userSchema")
    const Product = require("../models/productSchema")
    const razorpay = require("razorpay")




    let instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })


    const addMoneyToWallet = async (req, res) => {
        // console.log("im hereeee");
        console.log(req.body,"helloooooooooooo");
        try {
            var options = {
                amount: req.body.total * 100,
                currency: "INR",
                receipt: "" + Date.now(),
            };
            console.log("Creating Razorpay order with options:", options);

            instance.orders.create(options, async function (err, order) {
                if (err) {
                    console.log("Error while creating order : ", err);
                } else {
                    var amount = order.amount / 100;
                    console.log(amount);
                    await User.updateOne(
                        {
                            _id: req.session.user
                        },{
                            $push : {
                                history : {
                                    amount : amount, status : "credit", date : Date.now()
                                }
                            }
                        }
                    )
                }
                res.json({order : order, razorpay : true})
            })
        } catch (error) {
            console.log("Error in addMoneyToWallet:", error.message);
            // console.log(error.message);n
            
        }
    }


    const verify_payment = async (req, res)=>{
        try {
            let details = req.body
            let amount = parseInt(details.order.order.amount) / 100
            // console.log(amount);
            await User.updateOne(
                {_id : req.session.user},
                {$inc : {wallet : amount}}
            )
            res.json({success : true})
        } catch (error) {
            console.log(error.message);
        }
    }







    module.exports = {
        addMoneyToWallet,
        verify_payment,

    }