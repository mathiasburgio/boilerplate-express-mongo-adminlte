const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    companyId: mongoose.Schema.Types.ObjectId, //para casos en los cuales el servicio se brinda a companias y no a usuarios individuales. Ej mateflix tiene la propiedad "emprendimientoId" (eid)
    //userId: mongoose.Schema.Types.ObjectId, //cuando la configuracion es del usuario
    properties: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = configSchema;