const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    companyId: mongoose.Schema.Types.ObjectId, //para casos en los cuales el servicio se brinda a companias y no a usuarios individuales. Ej mateflix tiene la propiedad "emprendimientoId" (eid)
    name: { type: String, required: true },
    email: String,
    city: String,
    address: String,
    phone: String,
    deleted: Boolean,
}, { timestamps: true });

module.exports = clientSchema;