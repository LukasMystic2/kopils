// controllers/adminController.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // We need the User model to find the admin
require('dotenv').config();

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const adminCredentialsString = process.env.ADMIN_CREDENTIALS || '[]';
        const adminAccounts = JSON.parse(adminCredentialsString);

        const account = adminAccounts.find(acc => acc.email === email && acc.password === password);

        if (account) {
            // Find the corresponding user in the database to get their ID
            const adminUser = await User.findOne({ email: account.email, role: 'admin' });
            if (!adminUser) {
                return res.status(401).json({ message: 'Admin account found but not present in the database.' });
            }

            // Create a token that includes the database ID
            const token = jwt.sign({ 
                id: adminUser._id, // Use the database ID
                role: 'admin', 
                email: adminUser.email, 
                name: adminUser.name 
            }, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: 'Server error during admin login.' });
    }
};
