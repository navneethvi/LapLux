const Mongoose = require("mongoose")

const bannerSchema = Mongoose.Schema({
    image:{
        type:String,
        required:true,
       
    },
    title:{
        type:String,
        required:true,
        
    },
    description:{
        type:String,
        required:true,
       
    },
    link:{
        type:String,
        
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type : Date,
        required : true
    }
})

const Banner = Mongoose.model("Banner", bannerSchema)

module.exports = Banner