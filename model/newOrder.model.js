const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newOrderSchema = new Schema({
    orderId:{
        type:String,
        unique:true,
        index:true
    },
    orderPlacedDateTime:{
        type:Date,
    },
    status:{
        type:String,
        enum:['pending','filled','canceled','rejected','Replaced'],
        default:'pending'
    },
    orderType:{
        type:String,
        default:'market'
    },
    qty:{
        type:Number,
        default:1
    },
    price:{
        type:Number,
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
    subOrders:[{
        type:Schema.Types.ObjectId,
        ref:'SubOrder'
    }],
    symbol:{
        type:String
    }


},{timestamps:true});

const Order = mongoose.model('Order', newOrderSchema);
module.exports = Order;