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


app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
