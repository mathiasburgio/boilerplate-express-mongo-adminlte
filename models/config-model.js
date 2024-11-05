const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    //companyId: mongoose.Types.ObjectId, //para casos en los cuales el servicio se brinda a companias y no a usuarios individuales. Ej mateflix tiene la propiedad "emprendimientoId" (eid)
    properties: mongoose.Types.Mixed
});

const Config = mongoose.model('Config', configSchema);
module.exports = Config;