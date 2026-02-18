// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try{
//         console.log("mongo_uri:", process.env.ALVO_MONGO_URL);
//         const conn = await mongoose.connect(process.env.ALVO_MONGO_URL)
//         console.log(`MongoDB Connected: ${conn.connection.host}`)
//     }catch (error) {
//         console.log("Error connecting to MongoDB:", error.message)
//         process.exit(1)
//     }
// }

// module.exports = {connectDB}
////////////////////////////////////////////////////////////////////////
const mongoose = require("mongoose"); // ✅ FIX: was missing — caused server crash on startup

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.ALVO_MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };