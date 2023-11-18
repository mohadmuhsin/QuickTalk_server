const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const userRoute = require('./routes/user_routes');
const {intializeSocket} = require('./socket/socket');
require('dotenv').config();

const server = app.listen(3000, () => {
    console.log("App is listning on port 3000");
})


intializeSocket(server)

// <------------------mongoose connection------------------->
mongoose.connect(process.env.MONGO, {
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Error connecting to Mongoose",error);
})

app.use(express.json());    


// <------------------cors-------------------->
app.use(cors({
    credentials: true,
    origin: process.env.BASE_URL
  })
);

// <------------------routes-------------------->
app.use("/",userRoute)

module.exports = app