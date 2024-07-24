const User = require('../models/userModel');
const bcrypt = require('bcrypt')

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}
const loadRegister = async (req, res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            age: req.body.age,
            place: req.body.place,
            phone: req.body.phone,
            is_admin: 0
        })
        const { name, email, phone, password, age, place } = req.body;
        const existingUser = await User.findOne({ email });

        const isValidEmail = email => {
            const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(String(email).toLowerCase());
        }
        const isValidName = fname => {
            const regex = /^[a-zA-Z]{2,30}$/;
            return regex.test(fname); 
        }
        const isValidPlace = fplace => {
            const regex1 = /^[a-zA-Z]{2,30}$/;
            return regex1.test(fplace);
        }
        if (!name || !age || !place || !phone || !email || !password) {
            res.render('registration', { validate: "Fill all the fields!", formData: { password, age, phone, email, place, name } });

        } else if (!isValidName(name)) {
            res.render('registration', { vname: "Enter a valid name!", formData: { password, age, phone, email, place, name } });

        } else if (!isValidPlace(place)) {
            res.render('registration', { vplace: "Enter a valid place!", formData: { name, age, phone, email, password, place } });

        } else if (existingUser) {
            res.status(400)
            res.render('registration', { validate: "User already exists!", formData: { name, password, phone, email, place, age } });

        } else if (age >= 100 || age <= 10) {
            res.render('registration', { vage: "Enter your correct age!", formData: { name, password, phone, email, place, age } });

        } else if (phone.length !== 10) {
            res.render('registration', { vphone: "Phone number must be 10 digits!", formData: { name, age, password, email, place, phone } });

        } else if (!isValidEmail(email)) {
            res.render('registration', { vemail: "Invalid Email!", formData: { name, age, phone, password, place, email } });

        } else if (password.length <= 5) {
            res.render('registration', { vpassword: "Password minimum 5 letters", formData: { name, age, phone, email, place } });
        } else {
            const userData = await user.save();
            if (userData) {
                res.render('registration', { message: "Successfully Registered.." })
            } else {
                res.render('registration', { failed: "Registration Failed.." })
            }
        }
    } catch (error) {
        console.log(error.message);
        
    }
}
//login part
const loginLoad = async (req, res) => {
    try {
        
            let logoutMsg = '';
        logoutMsg = req.query.logout
        res.render('login', { logout: logoutMsg })

        

    } catch (error) {
        console.log(error.message);
    }
}
// //login part
// const loginLoad1 = async (req, res) => {
//     try {
        
//         res.redirect('/login')

//     } catch (error) {
//         console.log(error.message);
//     }
// }
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })

        const isValidEmail = email => {
            const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(String(email).toLowerCase());
        }
        if (!isValidEmail(email)) {
            res.render('login', { message: "Invalid Email!", });
        } else if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch && userData.is_admin ==0) {
                req.session.user_id = userData._id;

                res.redirect('/home');

            } else {

                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    res.render('login', { message: "Password Is Incorret!", logData: { email } });
                }
                else {
                    res.render('login', { message: "Email Or Password Is Incorret!" });
                }
            }
        } else {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.render('login', { message: "Password Is Incorret!", logData: { email } });
            }
            else {
                res.render('login', { message: "Email Or Password Is Incorret!" });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}
const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        
        res.render('home', { user: userData })
    } catch (error) {
        console.log(error.message);
    }
}
const userLogout = async (req, res) => {
    try {
        delete req.session.user_id;
        res.redirect('/login?logout=Logout Successfully...')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout

}