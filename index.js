const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require ('body-parser');
require("dotenv").config();
const PORT = process.env.PORT || 4000;

//cookie parser 
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
require("./config/database").connect();


const adminRoutes = require('./routes/adminRoutes');
const companyRoutes = require('./routes/companyRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/admin',adminRoutes);
app.use('/company',companyRoutes);
app.use('/student',studentRoutes);



app.listen(PORT,() =>{
    console.log('App is listening at ${PORT} ');
})
