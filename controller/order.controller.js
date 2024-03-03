const Alpaca = require('@alpacahq/alpaca-trade-api');
const Order = require('../model/newOrder.model');
const SubOrder = require('../model/secondary.model');

const alpacaClient = new Alpaca({
    keyId: process.env.API_KEY,
    secretKey: process.env.API_SECRET,
    paper: true
});


const createOrder = async(req,res) => {  
    try {
        const {symbol,signle} = req.body;
        if(!symbol){
            res.status(422).send('Symbol is required');
            return;
        }

        if(!signle){
            res.status(422).send('Single is required');
            return;
        }

        const barset = await alpacaClient.getLatestTrade(symbol);

        const takeProfitLimitPrice = Math.round(barset.Price * 1.01 * 100) / 100;

        const stopLossLimitPrice = Math.round(barset.Price * 0.99 * 100) / 100;

        const order = await alpacaClient.createOrder({
            symbol: symbol,
            qty: 1,
            side: signle,
            type: 'market',
            time_in_force: 'gtc',
            order_class: 'bracket',
            stop_loss: {
                limit_price: stopLossLimitPrice,
                stop_price: stopLossLimitPrice
            },
            take_profit: {
                limit_price: takeProfitLimitPrice
            }
        });        
    
        monitorOrderStatus(order.id);
        await saveParentOrder(order,symbol);

        const orderType1 =  checkOrderType(signle,barset.Price,order.legs[0].limit_price);
        await saveSubOrder(order.id,order.legs[0].id,orderType1,order.legs[0].limit_price,symbol)

        const orderType2 =  checkOrderType(signle,barset.Price,order.legs[1].limit_price);
        await saveSubOrder(order.id,order.legs[1].id,orderType2,order.legs[1].limit_price,symbol)

        monitorTargetOrderStatus(order.id,order.legs[0],orderType1);
    
        monitorStopLossOrderStatus(order.id,order.legs[1],orderType2);
        

        res.status(200).send('Order placed successfully');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('Error placing order');
    }
}

async function monitorOrderStatus(orderId){
    const orderStatus = await alpacaClient.getOrder(orderId);

    if (orderStatus.status === 'filled') {
        await mainOrderFilled(orderStatus);

    } else if (orderStatus.status === 'canceled') {
        await mainOrderFilled(orderStatus);

    } else if (orderStatus.status === 'rejected') {
        await mainOrderFilled(orderStatus);

    } else if(orderStatus.status === 'Replaced'){
        await mainOrderFilled(orderStatus);

    } else {
        setTimeout(() => monitorOrderStatus(orderId), 6000 );
    }
};

async function monitorTargetOrderStatus(parentOrder,order,orderType){
    const orderId = order.id
    const orderStatus = await alpacaClient.getOrder(orderId);

    if (orderStatus.status === 'filled') {
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else if (orderStatus.status === 'canceled') {
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else if (orderStatus.status === 'rejected') {
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else if(orderStatus.status === 'Replaced'){
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else {

        setTimeout(() => monitorTargetOrderStatus(parentOrder,order,orderType), 6000); // Check every 5 seconds
    }
};

async function monitorStopLossOrderStatus(parentOrder,order,orderType){
    const orderId = order.id
    const orderStatus = await alpacaClient.getOrder(orderId);

    if (orderStatus.status === 'filled') {
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else if (orderStatus.status === 'canceled') {
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else if (orderStatus.status === 'rejected') {
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else if(orderStatus.status === 'Replaced'){
        await subOrderFilled(orderStatus,parentOrder,orderType)
    } else {
        setTimeout(() => monitorStopLossOrderStatus(parentOrder,order,orderType), 6000); // Check every 5 seconds
    }
};

function checkOrderType(single,marketPrice,orderPrice){
    if(single == 'buy' && Number(marketPrice) > Number(orderPrice)){
        return 'stoploss';
    }

    if(single == 'buy' && Number(marketPrice) < Number(orderPrice)){
        return 'targetprice';
    }

    if(single == 'sell' && Number(marketPrice) < Number(orderPrice)){
        return 'stoploss';
    }

    if(single == 'sell' && Number(marketPrice) > Number(orderPrice)){
        return 'targetprice';
    }

}

async function saveParentOrder(order,symbol){
    try{
        const newOrder = await Order.create({
            orderId:order.id,
            status:'pending',
            symbol:symbol
        });
    }catch(err){
        console.error('Error placing order:', err);
    }
}

async function saveSubOrder(parentOrderId,orderId,orderType,price,symbol){
    try{
        const order = await SubOrder.create({
            parentOrderId:parentOrderId,
            subOrderId:orderId,
            status:'pending',
            orderType:orderType,
            price:price,
            symbol:symbol

        });
        const mainOrder = await Order.findOne({orderId:parentOrderId});
        let subordersArray = mainOrder.subOrders ? mainOrder.subOrders : [];
        await mainOrder.save({
            subOrders:subordersArray.push(order._id)
        })
    }catch(err){
        console.error('Error placing order:', err);
    }
}

async function subOrderFilled(order,parentOrderId,orderType){
    try{
        const filter = { 
            subOrderId:order.id,
            parentOrderId:parentOrderId,
            orderType:orderType
        }
        const update = {
            status:order.status,
            orderPlacedDateTime:new Date().toISOString(),
            filledPrice:order.filled_avg_price,
            filledQty:order.filled_qty
        }
        const subOrder = await SubOrder.findOneAndUpdate(filter,update);
    }catch(err){
        console.log(err)
    }
}

async function mainOrderFilled(order){
    try{
        const filter = {
            orderId:order.id
        }
        const update = {
            orderPlacedDateTime:new Date().toISOString(),
            status:order.status,
            filledPrice:order.filled_avg_price,
            filledQty:order.filled_qty
        }
        const mainOrder = await Order.findOneAndUpdate(filter,update)
    }catch(err){
        console.log(err)
    }
}

const getOrders = async(req,res) => {
    try{
        let mainOrders = await Order.find().populate('subOrders');
        res.status(200).send(mainOrders);
        
    }catch(err){
        res.status(500).send('Error while getting orders');
    }
}

const getAccountInfo = async(req,res) => {
    try{
        const accountInfo = await alpacaClient.getAccount();
        res.status(200).json(accountInfo);
    }catch(e){
        res.status(500).send("Something went wrong. Please try again");
    }

}

const getOpenPosition = async(req,res) => {
    try{
        const mainOrderOpenPosition = await Order.find({status:'pending'}).populate('subOrders');
        res.status(200).json(mainOrderOpenPosition);
    }catch(e){
        res.status(500).send("Something went wrong. Please try again");
    }
}

const filledPosition = async(req,res) => {
    try{
        const mainOrderList = await Order.find({status:'filled'}).select('-subOrders');
        const subOrderList = await SubOrder.find({status:'filled'});
        const result = [...mainOrderList, ...subOrderList];
        res.status(200).json(result);
    }catch(e){
        res.status(500).send("Something went wrong. Please try again");
    }
}
module.exports = {createOrder,getOrders,getAccountInfo,getOpenPosition,filledPosition}