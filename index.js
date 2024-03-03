const express = require('express');
const dotenv = require('dotenv');
const Alpaca = require('@alpacahq/alpaca-trade-api');
const cors = require('cors');
const connectDB = require('./db/index');
const orderRoutes = require('./route/order.route');

const app = express();
dotenv.config({ path: '.env' });

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

connectDB();

app.use("/api/v1/stockbroker",orderRoutes)
const alpacaClient = new Alpaca({
    keyId: process.env.API_KEY,
    secretKey: process.env.API_SECRET,
    paper: true
});

// Define a route to retrieve orders
app.get('/get-orders', async (req, res) => {
    try {
        const orders = await alpacaClient.getOrders({
            status: 'all',
            direction: 'asc'
        });
        console.log('Orders:', orders);
        res.send(orders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).send('Error retrieving orders');
    }
});

// Define a route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
