const { User } = require("../model/user");

let auth = (req, res, next) => {
    let token = req.cookies.x_auth;
    User.findByToken(token, (err, user) => {
        if (err) {
            throw err;
        }
        if (!user) {
            return res.json({
                success: false,
                message: "Authentication failed",
            });
        }
        req.token = token;
        req.user = user;
        next();
    });
};

module.exports = { auth };