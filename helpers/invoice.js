const Order = require('../models/orderSchema')

const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { Readable } = require("stream");
const User = require('../models/userSchema');

module.exports = {
    invoice: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await Order.findOne({ _id: id });
            console.log("Resultt", result)
            const userData = await User.findOne({ _id: result.userId });
            console.log("User:", userData);

            const address = result.address
            let total1 = 0
            for (let i = 0; i < result.product.length; i++) {
                total1 += result.product[i].price * result.product[i].quantity
            }

            console.log(total1);

            const order = {
                id: id,
                total: result.totalPrice,
                discount: total1 - result.totalPrice,
                date: result.createdOn,
                paymentMethod: result.payment,
                orderStatus: result.status,
                name: address[0].name,
                number: address[0].phone,
                pincode: address[0].pincode,
                town: address[0].landMark,
                state: address[0].state,
                items: result.product,
            };


            console.log(order.items.length,"order.dis");
            // const discountAmount = order.discount / order.totalPrice;

            const products = order.items.map((product) => ({
                description: product.name,
                quantity: parseInt(product.quantity),
            
                price: product.price,
                "tax-rate": 0,

            }));

            console.log("products=>>", products);
            const isoDateString = order.date;
            const isoDate = new Date(isoDateString);
            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedDate = isoDate.toLocaleDateString("en-US", options);
            const subtotal = products.reduce((acc, product) => acc + product.total, 0);
            const total = order.total;
            const data = {
                customize: {

                },
                images: {


                    background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
                },

                sender: {
                    company: "LapLux eCommerce",
                    address: "Kundannoor PO,Ernakulam",
                    city: "Kochi",
                    country: "India",
                },
                client: {
                    company: "Customer Address",
                    address: order.state,
                    city: order.town,
                    zip: order.pincode,
                },
                information: {

                    number: order.id,

                    date: formattedDate,
                },
                products: products,
                discount: order.discount,
                subtotal: subtotal,
                total: total,
                data: "This is dataaaa",
                "bottom-notice": "Happy shopping and visit LapLux again",
            };
            const pdfResult = await easyinvoice.createInvoice(data);


            const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
            res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
            res.setHeader("Content-Type", "application/pdf");
            const pdfStream = new Readable();
            pdfStream.push(pdfBuffer);
            pdfStream.push(null);

            pdfStream.pipe(res);
            return true;
        } catch (error) {
            res.status(500).json({ error: error.message });
            return;
        }

    },
}