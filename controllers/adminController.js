const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const config = require("../config/config");


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}
const loadLogin = async (req, res) => {
    try {
        let logoutMsg = '';
        logoutMsg = req.query.logout
        res.render('adminLogin', { logout: logoutMsg })
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        const isValidEmail = email => {
            const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(String(email).toLowerCase());
        }
        if (!isValidEmail(email)) {
            res.render('adminLogin', { message: "Invalid Email!", });
        }
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch && userData.is_admin == 1) {
                req.session.admin_id = userData._id;
                res.redirect('/admin/admin-home');
            } else {
                res.render('adminLogin', { message: "Email or Password Incorrect!" });
            }
        } else {
            res.render('adminLogin', { message: "Email or Password Incorrect!" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}
const loadDashboard = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.admin_id });
        if(req.session.admin_id) {
            res.render('adminHome', { admin: userData })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}
const logout = async (req, res) => {
    try {
        delete req.session.admin_id;
        res.redirect('/admin?logout=Logout Successfully...');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}
const adminDashboard = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: 0 })
        res.render('dashboard', { users: userData });
    } catch (error) {
        console.log(error.message);
    }
}
const newUserLoad = async (req, res) => {
    try {
        res.render('new-user')
    } catch (error) {
        console.log(error.message);

    }
}
const addUser = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        // const password = req.body.password;
        const age = req.body.age;
        const place = req.body.place;
        const phone = req.body.phone;
        const isValidEmail = email => {
            const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(String(email).toLowerCase());
        }

        const spassword = await securePassword(req.body.password)
        const user = new User({
            name: name,
            email: email,
            password: spassword,
            age: age,
            place: place,
            phone: phone,
            is_admin: 0

        })

        const existingUser = await User.findOne({ email });

        const isValidName = fname => {
            const regex = /^[a-zA-Z]{2,30}$/;
            return regex.test(fname);
        }
        const isValidPlace = fplace => {
            const regex1 = /^[a-zA-Z]{2,30}$/;
            return regex1.test(fplace);
        }
        if (!name || !age || !place || !phone || !email || !spassword) {
            res.render('new-user', { filed: "Fill all the fields!", formData: { spassword, age, phone, email, place, name } });
        } else if (!isValidName(name)) {
            res.render('new-user', { vname: "Enter a valid name!", formData: { spassword, age, phone, email, place, name } });
        } else if (!isValidPlace(place)) {
            res.render('new-user', { vplace: "Enter a valid place!", formData: { name, age, phone, email, spassword, place } });
        } else if (existingUser) {
            res.status(400)
            res.render('new-user', { filed: "User already exists!", formData: { name, spassword, phone, email, place, age } });
        } else if (age >= 100 || age <= 10) {
            res.render('new-user', { vage: "Enter your correct age!", formData: { name, spassword, phone, email, place, age } });
        } else if (phone.length !== 10) {
            res.render('new-user', { vphone: "Phone number must be 10 digits!", formData: { name, age, spassword, email, place, phone } });
        } else if (!isValidEmail(email)) {
            res.render('new-user', { vemail: "Invalid Email!", formData: { name, age, phone, spassword, place, email } });
        } else {
            const userData = await user.save();

            if (userData) {
                res.render('new-user', { message: "Successfully Registered.." })
            } else {
                res.render('new-user', { filed: "Registration Failed.." })
            }
        }
    } catch (error) {
        console.log(error.message);
        return;
    }
}
const editUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id })

        if (userData) {
            res.render('edit-user', { user: userData });
        } else {
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(error.message);
        return;
    }
}
const updateUser = async (req, res) => {
    try {
 const userData = await User.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                age: req.body.age,
                place: req.body.place,
                phone: req.body.phone
            }
        });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.query.id
        await User.deleteOne({ _id: id });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);

    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUser,
    updateUser,
    deleteUser
}