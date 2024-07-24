const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.mongoconnect);
const express = require("express");
const app = express();
const nocache = require('nocache')
const path = require('path')
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const port= process.env.PORT || 3003



app.use('/static', express.static(path.join(__dirname, 'public')));


app.use(nocache());
app.use('/',userRoute);
app.use('/admin', adminRoute);


app.listen(port, () => {
    console.log(`http://localhost:3000`);
})