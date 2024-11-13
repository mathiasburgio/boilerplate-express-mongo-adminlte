const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    companyId: mongoose.Schema.Types.ObjectId, //para casos en los cuales el servicio se brinda a companias y no a usuarios individuales. Ej mateflix tiene la propiedad "emprendimientoId" (eid)
    email: { type: String, required: true },
    password: { type: String, required: true },
    permissions: [String],
    child: Boolean,
    isAdmin: Boolean,
    deleted: Boolean,
    resetPassword: {
        requestAt: Date,
        token: String
    }
}, { timestamps: true });

module.exports = userSchema; 