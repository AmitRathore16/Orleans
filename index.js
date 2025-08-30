//Imports from packages
const express = require("express"); // Importing express module
const mongoose = require("mongoose"); // Importing mongoose for MongoDB interactions

//Imports from other files
const authRouter = require("./routes/auth"); // Importing the auth router from routes/auth.js
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

//Initializing
const PORT = 3000; // Defining the port number
const app = express(); //initializing express
const DB =
  "mongodb+srv://amitrathore12a:16012005@cluster0.bbgmuc4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // MongoDB connection string

//Middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);
//Connections
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((e) => {
    console.error("Error connecting to MongoDB:", e);
  });

//GET, PUT, POST, DELETE -> CRUD operations => Create, Read, Update, Delete
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Connected at port ${3000}`);
}); // Starting the server and listening on the defined port
