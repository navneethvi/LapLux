const User = require("../models/userSchema");
const Coupon = require("../models/couponSchema")

const bcrypt = require("bcrypt");
const Order = require("../models/orderSchema");

const PDFDocument=require('pdfkit')



const getDashboard = async (req, res) => {
    try {
        res.render("index")
    } catch (error) {
        console.log(error.message);
    }
}

const getLoginPage = async (req, res) => {
    try {
        res.render("admin-login")
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email)

        const findAdmin = await User.findOne({ email, isAdmin: "1" })
        // console.log("admin data : ", findAdmin);

        if (findAdmin) {
            const passwordMatch = await bcrypt.compare(password, findAdmin.password)
            if (passwordMatch) {
                req.session.admin = true
                console.log("Admin Logged In");
                res.redirect("/admin")
            } else {
                console.log("Password is not correct");
                res.redirect("/admin/login")
            }
        } else {
            console.log("He's not an admin");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getCouponPageAdmin = async (req, res) => {
    try {
        const findCoupons = await Coupon.find({})
        res.render("coupon", { coupons: findCoupons })
    } catch (error) {
        console.log(error.message);
    }
}

const createCoupon = async (req, res) => {
    try {

        const data = {
            couponName: req.body.couponName,
            startDate: new Date(req.body.startDate + 'T00:00:00'),
            endDate: new Date(req.body.endDate + 'T00:00:00'),
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice)
        };

        const newCoupon = new Coupon({
            name: data.couponName,
            createdOn: data.startDate,
            expireOn: data.endDate,
            offerPrice: data.offerPrice,
            minimumPrice: data.minimumPrice
        })

        await newCoupon.save()
            .then(data => console.log(data))

        res.redirect("/admin/coupon")

        console.log(data);

    } catch (error) {
        console.log(error.message);
    }
}





const getLogout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message);
    }
}


const getSalesReportPage = async (req, res) => {
    try {
        // const orders = await Order.find({ status: "Delivered" }).sort({ createdOn: -1 })
        // // console.log(orders);

        // res.render("salesReport", { data: currentOrder, totalPages, currentPage })

        // console.log(req.query.day);
        let filterBy = req.query.day
        if (filterBy) {
            res.redirect(`/admin/${req.query.day}`)
        } else {
            res.redirect(`/admin/salesMonthly`)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const salesToday = async (req, res) => {
    try {
        let today = new Date()
        const startOfTheDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0,
            0,
            0,
            0
        )

        const endOfTheDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
            999
        )

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfTheDay,
                        $lt: endOfTheDay
                    },
                    status: "Delivered"
                }
            }
        ]).sort({ createdOn: -1 })

        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("salesReport", { data: currentOrder, totalPages, currentPage, salesToday: true })

    } catch (error) {
        console.log(error.message);
    }
}


const salesWeekly = async (req, res) => {
    try {
        let currentDate = new Date()
        const startOfTheWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - currentDate.getDay()
        )

        const endOfTheWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + (6 - currentDate.getDay()),
            23,
            59,
            59,
            999
        )

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfTheWeek,
                        $lt: endOfTheWeek
                    },
                    status: "Delivered"
                }
            }
        ]).sort({ createdOn: -1 })

        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("salesReport", { data: currentOrder, totalPages, currentPage, salesWeekly: true })

    } catch (error) {
        console.log(error.message);
    }
}


const salesMonthly = async (req, res) => {
    try {
        let currentMonth = new Date().getMonth() + 1
        const startOfTheMonth = new Date(
            new Date().getFullYear(),
            currentMonth - 1,
            1, 0, 0, 0, 0
        )
        const endOfTheMonth = new Date(
            new Date().getFullYear(),
            currentMonth,
            0, 23, 59, 59, 999
        )
        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfTheMonth,
                        $lt: endOfTheMonth
                    },
                    status: "Delivered"
                }
            }
        ]).sort({ createdOn: -1 })
        // .then(data=>console.log(data))
        // console.log("ethi");

        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("salesReport", { data: currentOrder, totalPages, currentPage, salesMonthly: true })


    } catch (error) {
        console.log(error.message);
    }
}


const salesYearly = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear()
        const startofYear = new Date(currentYear, 0, 1, 0, 0, 0, 0)
        const endofYear = new Date(currentYear, 11, 31, 23, 59, 59, 999)

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startofYear,
                        $lt: endofYear
                    },
                    status: "Delivered"
                }
            }
        ])


        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("salesReport", { data: currentOrder, totalPages, currentPage, salesYearly: true })

    } catch (error) {
        console.log(error.message);
    }
}



const generatePdf = async (req, res) => {
    try {
        const doc = new PDFDocument();
      const filename = 'sales-report.pdf';
      const orders = req.body;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      doc.pipe(res);
      doc.fontSize(12);
      doc.text('Sales Report', { align: 'center', fontSize: 16 });
      const margin = 5;
      doc
        .moveTo(margin, margin) // Top-left corner (x, y)
        .lineTo(600 - margin, margin) // Top-right corner (x, y)
        .lineTo(600 - margin, 842 - margin) // Bottom-right corner (x, y)
        .lineTo(margin, 842 - margin) // Bottom-left corner (x, y)
        .lineTo(margin, margin) // Back to top-left to close the rectangle
        .lineTo(600 - margin, margin) // Draw line across the bottom edge
        .lineWidth(3)
        .strokeColor('#000000')
        .stroke();
      
      doc.moveDown();
      
      // Define table headers with 4 columns
      const headers = ['Order ID', 'Name', 'Date', 'Total']; // Add the new column header
      
      // Calculate position for headers
      let headerX = 20;
      const headerY = doc.y + 10;
      
      // Adjust the spacing for the "Order ID" column to give it more space
      doc.text(headers[0], headerX, headerY); // Adjusted position for "Order ID" header
      headerX += 200; // Adjust spacing for the remaining headers
      
      // Draw headers for the other columns
      headers.slice(1).forEach(header => {
        doc.text(header, headerX, headerY);
        headerX += 130; // Adjust spacing as needed for the remaining headers
      });
      
      // Calculate position for data
      let dataY = headerY + 25;
      
      // Loop through your data and add rows to the table with the new column values
      orders.forEach(order => {
        doc.text(order.dataId, 20, dataY); // Adjusted position for "Order ID" data
        doc.text(order.name, 210, dataY);
        doc.text(order.date, 350, dataY);
        doc.text(order.totalAmount, 480, dataY);
        dataY += 30; // Adjust vertical spacing as needed

      });
      
      doc.end();
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    getDashboard,
    getLoginPage,
    verifyLogin,
    getCouponPageAdmin,
    createCoupon,
    getLogout,
    getSalesReportPage,
    salesToday,
    salesWeekly,
    salesMonthly,
    salesYearly,
    generatePdf
}