const utils = require("../utils/utils");

async function getHtml(req, res){
    res.status(200).render( "../views/layouts/dashboard.ejs", { page: "client-page.ejs" });
}
async function getList(req, res){
    let list = await req.privateQuery("Client").find({deleted: false});
    res.status(200).json({list: list});
}
async function create(req, res){//Esta funcion solo deberia utilizarse para sofwares de 1 solo usuario
    try{
        let {name, email, city, address, phone} = req.body;
    
        if(name.trim().toString().length < 3){
            res.status(400).json({error: "Nombre no válido"});
            return;
        }
        
        let client = await req.privateQuery("Client").create({
            name: utils.safeString(name),
            email: utils.safeString(email),
            city: utils.safeString(city),
            address: utils.safeString(address),
            phone: utils.safeString(phone),
            deleted: false
        });
    
        res.status(201).json({ client });
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function updateOne(req, res){//Esta funcion solo deberia utilizarse para sofwares de 1 solo usuario
    try{
        let {clientId, name, email, city, address, phone} = req.body;
    
        if(name.trim().toString().length < 3){
            res.status(400).json({error: "Nombre no válido"});
            return;
        }
        
        let client = await req.privateQuery("Client").findOneAndUpdate(
            {
                _id: clientId
            },
            {
                name: utils.safeString(name),
                email: utils.safeString(email),
                city: utils.safeString(city),
                address: utils.safeString(address),
                phone: utils.safeString(phone),
                deleted: false
            },
            {
                new: true
            }
        );
    
        res.status(201).json({ client });
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function deleteOne(req, res){//Esta funcion solo deberia utilizarse para sofwares de 1 solo usuario
    try{
        let {clientId} = req.body;
    
        let client = await req.privateQuery("Client")
        .findOneAndUpdate({ _id: clientId }, {deleted: true});

        res.status(201).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}

module.exports = {
    getHtml,
    getList,
    create,
    updateOne,
    deleteOne
};