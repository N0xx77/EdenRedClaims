const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_DB_URI;

const connection = async () => {
    try{
        await mongoose.connect(uri);
        console.log('Database Connected SUccessfully');
    }
    catch(err){
        console.error(err);
    }
}

module.exports = {connection};
