const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: String,
    deleted: Boolean
}, { timestamps: true });

module.exports = companySchema;