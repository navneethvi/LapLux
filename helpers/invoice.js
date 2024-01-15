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
            
            const order = {
                id: id,
                total: result.totalPrice,
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
        

            // console.log(order, "=========================");

          
            const products = order.items.map((product) => ({
                description : product.name,
                quantity: parseInt(product.quantity),
                price: parseInt(product.price),
                total: order.total,
                "tax-rate": 0,

            }));

            console.log("products=>>", products);
            const isoDateString = order.date;
            const isoDate = new Date(isoDateString);
            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedDate = isoDate.toLocaleDateString("en-US", options);
            const data = {
                customize: {
                    //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
                },
                images: {
                    
                    // The invoice background
                    background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
                },
                // Your own data
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
                    // Invoice number
                    number: order.id,
                    // ordered date
                    date: formattedDate,
                },
                products: products,
                data: "This is dataaaa",
                "bottom-notice": "Happy shopping and visit LapLux again",
            };
            const pdfResult = await easyinvoice.createInvoice(data);
            // console.log("PDF Result:", pdfResult);
            // console.log("imhere");
            const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

            // Set HTTP headers for the PDF response
            res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
            res.setHeader("Content-Type", "application/pdf");

            // Create a readable stream from the PDF buffer and pipe it to the response
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