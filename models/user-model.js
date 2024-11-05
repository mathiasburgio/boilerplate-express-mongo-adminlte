const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //companyId: mongoose.Types.ObjectId, //para casos en los cuales el servicio se brinda a companias y no a usuarios individuales. Ej mateflix tiene la propiedad "emprendimientoId" (eid)
    permissions: [String],
    isAdmin: Boolean,
    deleted: Boolean
});

const User = mongoose.model('User', userSchema);
module.exports = User;