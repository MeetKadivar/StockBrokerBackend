const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const secondarySchema = new Schema({
    parentOrderId:{
        type:String,
    },
    subOrderId:{
        type:String,
    },
    status:{
        type:String,
        enum:['pending','filled','canceled','rejected','Replaced'],
        default:'pending'
    },
    orderPlacedDateTime:{
        type:Date
    },
    orderType:{
        type:String,
        enum:['stoploss','targetprice']
    },
    price:{
        type:Number
    },
    qty:{
        type:Number,
        default:1
    },
    filledPrice:{
        type:Number,
    },
    filledQty:{
        type:Number
    },
    orderCreatedDateTime:{
        type:Date,
        default:new Date().toISOString()
    },
    symbol:{
        type:String
    }


},{timestamps:true});

const SubOrder = mongoose.model('SubOrder', secondarySchema);
module.exports = SubOrder;