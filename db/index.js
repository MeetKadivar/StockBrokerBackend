const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/stockBroker`);
        console.log(`\n MongoDB connected DB Host: ${connectionInstance.connection.host}`);
    }catch(err){
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}

module.exports = connectDB;