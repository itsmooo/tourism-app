const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(colors.yellow(`MongoDB is connected: ${mongoose.connection.host}`));
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
