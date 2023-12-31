const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cryptoJs = require('crypto-js');

const User = require('../models/User');

dotenv.config();

exports.signup = (req, res) => {

    const emailCryptoJs = cryptoJs.HmacSHA256(req.body.email, process.env.EMAIL_KEY).toString();

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: emailCryptoJs,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res) => {

    const emailCryptoJs = cryptoJs.HmacSHA256(req.body.email, process.env.EMAIL_KEY).toString();

    User.findOne({ email: emailCryptoJs })
        .then(user => {
            if (!user) {
                res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.TOKEN,
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};