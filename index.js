require('dotenv').config();

const express = require("express");

const app = express();

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const { User } = require("./model/user");

const { auth } = require("./middleware/auth");

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
}).then(() => {
    console.log("Db connected")
}).catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cookieParser());

app.get("/api/users/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req._id,
        isAuth: true,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        role: req.user.role,
    })
});

app.post('/api/users/register', (req, res) => {

    console.log(req.body);
    const user = new User(req.body);
    user.save((err, userData) => {
        if (err) {
            return res.json({
                success: false,
                err,
            });
        }

        return res.status(200).json({
            success: true,
        });
    });

});

app.post('/api/users/login', (req, res) => {
    User.findOne({
        email: req.body.email,
    }, (err, user) => {
        if (!user) {
            return res.json({
                success: false,
                message: "Wrong Email",
            });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({success: false, message: "Wrong password"})
            }    
        });
            
        user.generateToken((err, user) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.cookie("x_auth", user.token).status(200).json({
                success: true,
                message: "Successfully logged in",
            });

        })
    });
});

app.get("/api/users/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
        if (err) {
            return res.json({success: false, err})
        }
        return res.status(200).json({
            success: true,
            message: "Successfully logged out",
        });
    })
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});