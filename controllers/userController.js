const User=require('../model/user');
const bcrypt=require('bcrypt');
const jwt =require('jsonwebtoken');
const { Op } = require('sequelize');

exports.main = (req, res) => {
    res.sendFile('main.html', { root: './public/html' });
};


exports.signup = async (req, res,) => {
    try {
        const saltRounds = 10;
        const { email, password } = req.body;

        const hash = await bcrypt.hash(password, saltRounds);
        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(201).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            username: req.body.username,
            email: email,
            phoneNumber: req.body.phoneNumber,
            password: hash
        });
        console.log(user);
        return res.status(200).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error('Error in user signup:', error);
        res.status(500).json({ success: false, message: 'Error signing up user' });
    }
};

function generateTokenAuthorization(user) {
    const payload = { userId: user.id };
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(payload, secretKey);
    return token;
}

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userData = await User.findAll({
            where: {
                [Op.or]: [{ email: username}, { username: username }],
            },
        });
        
        if (userData.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = userData[0].dataValues;
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Password wrong' });
        }

        const token = generateTokenAuthorization(user);
        res.status(200).json({ success: true, message: 'Login successful', token ,encryptedId:token,});
    } catch (error) {
        console.error('Error in user login:', error);
        res.status(500).json({ success: false, message: 'Error logging in user' });
    }
};