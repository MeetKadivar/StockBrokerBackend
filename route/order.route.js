const Router = require('express');
const {createOrder,getOrders,getAccountInfo,getOpenPosition,filledPosition} = require('../controller/order.controller');

const router = Router();

router.route("/webhook").post(createOrder);

router.route("/get-orders").get(getOrders);

router.route("/get-account-info").get(getAccountInfo);

router.route("/get-open-position").get(getOpenPosition);

router.route("/get-filled-position").get(filledPosition);

module.exports = router;