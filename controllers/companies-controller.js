const utils = require("../utils/utils");

async function getCompanies(req, res){
    try{
        let list = await req.privateQuery("Company").find({email: req.session.email, deleted: false});    
        res.status(201).json({list: list});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function asignCompany(req, res){
    try{
        let { companyId } = req.body;
        
        let existe = await req.privateQuery("Company").findOne({email: req.session.email, deleted: false});
        if(!existe){
            res.status(400).json({error: "Error al asignar la compañia al usuario"});
            return;
        }

        req.session.data.companyId = companyId;
        req.session.save();
    
        res.status(201).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function create(req, res){
    try{
        let {companyName} = req.body;
    
        if(!companyName || companyName.toString().trim().length < 4){
            res.status(400).json({error: "Nombre de compania no valido, debe tener mas de 3 caracteres"});
            return;
        }

        let company = await req.publicQuery("Company").create({
            name: utils.safeString(companyName),
            deleted: false
        });

        let config = await req.publicQuery("Config").create({
            companyId: company._id,
            properties: {},
            deleted: false
        });
    
        res.status(201).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function updateSelf(req, res){
    //no hace nada
    res.status(200).json({message: "ok"});
}
async function deleteSelf(req, res){
    //no hace nada
    res.status(200).json({message: "ok"});
}

module.exports = {
    getCompanies,
    asignCompany,
    create,
    updateSelf,
    deleteSelf
}