const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    //companyId: mongoose.Types.ObjectId, //para casos en los cuales el servicio se brinda a companias y no a usuarios individuales. Ej mateflix tiene la propiedad "emprendimientoId" (eid)
    name: { type: String, required: true },
    email: String,
    address: String,
    phone: String,
    deleted: Boolean,
    created: Date
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;