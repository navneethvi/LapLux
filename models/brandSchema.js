const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    brandName: {
        type: String,
        required: true
    },
    brandImage: {
        type : Array,
        required : true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
})

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand