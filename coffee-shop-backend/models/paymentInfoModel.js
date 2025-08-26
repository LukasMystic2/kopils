const mongoose = require('mongoose');

const paymentInfoSchema = new mongoose.Schema({
    // Using a fixed key to ensure there's only one document for payment info
    key: { type: String, default: 'main', unique: true },
    qrisImageUrl: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String },
});

const PaymentInfo = mongoose.model('PaymentInfo', paymentInfoSchema);
module.exports = PaymentInfo;