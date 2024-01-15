const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_LOCAL_URI, {}).then((con) => {
      console.log(
        `MongoDB Database connected with HOST: ${con.connection.host}`
      );
    });
  } catch (err) {
    console.error(err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
