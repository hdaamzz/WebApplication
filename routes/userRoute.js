const express = require('express')
const user_route = express();
const bodyparser = require('body-parser');
const session = require('express-session');
const config = require("../config/config");
const auth = require("../middleware/auth");
const nocache = require("nocache");
const userController = require("../controllers/userController");

user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({ extended: true }))
user_route.use(session({
    secret: config.sessionSecret,
    cookie:{maxAge:15000},
    resave: false,
    rolling:false,
    saveUninitialized: true
}));
user_route.use(nocache());
user_route.get('/',(req,res)=>{
    res.redirect('/login')
})

user_route.get('/register', auth.isLogout, userController.loadRegister);

user_route.post('/register', auth.isLogout, userController.insertUser);

user_route.get('/', auth.isLogout, userController.loginLoad);

user_route.get('/login', auth.isLogout, userController.loginLoad);

user_route.post('/login', userController.verifyLogin);

user_route.get('/home', auth.isLogin, userController.loadHome);

user_route.get('/logout', auth.isLogin, userController.userLogout);

// user_route.get('*', (req, res) => {res.redirect('/')});

module.exports = user_route;