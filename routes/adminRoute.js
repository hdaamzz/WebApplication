const express = require("express");
const admin_route = express();
const config = require("../config/config");
const bodyParser = require("body-parser");
const adminController = require("../controllers/adminController");
const session = require("express-session");
const nocache = require("nocache");
const auth = require('../middleware/adminAuth')
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));



admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');
admin_route.use(nocache());

admin_route.get('/', auth.isLogout, adminController.loadLogin);

admin_route.post('/', adminController.verifyLogin);

admin_route.get('/admin-home', auth.isLogin, adminController.loadDashboard);

admin_route.get('/logout', adminController.logout);

admin_route.get('/dashboard', auth.isLogin, adminController.adminDashboard);

admin_route.get('/new-user', auth.isLogin, adminController.newUserLoad);

admin_route.post('/new-user', adminController.addUser);

admin_route.get('/edit-user', auth.isLogin, adminController.editUser);

admin_route.post('/edit-user', adminController.updateUser);

admin_route.get('/delete-user', adminController.deleteUser);

admin_route.get('*', (req, res) => {res.redirect('/admin')});

    
module.exports = admin_route;