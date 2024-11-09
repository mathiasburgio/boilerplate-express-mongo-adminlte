const utils = require("../utils/utils");

async function getHtml(req, res){
    res.status(200).render( "../views/layouts/dashboard.ejs", { page: "config-page.ejs" });
}
//sirve para ejecutar en backend la funcion
async function _saveConfig(data){
    let regex = /^[a-zA-Z0-9\.\_\-]{1,100}$/;
    for(let prop in data){
        if(regex.test(prop) == false) throw `Configuración no válida (key: ${prop.substring(0,100)})`;
        if(regex.test(data[prop]) == false || data[prop].length > 300) throw `Configuración no válida (value: ${data[prop].substring(0,100)})`;
    }

    let config = await req.privateQuery("Config").findOneAndUpdate({ },{ properties: data })
    return config;
}
//sirve para ejecutar en backend la funcion
async function _loadConfig(companyId){
    return await req.publicQuery("Config").findOne({ companyId });
}

async function saveConfig(req, res){
    try{
        let {data} = req.body;
        const config = await _saveConfig(data);
        res.status(201).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function loadConfig(req, res){
    try{
        let config = _loadConfig(req.session.data.companyId);
        res.status(200).json({ config });
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}

module.exports = {
    getHtml,
    _saveConfig,
    _loadConfig,
    saveConfig,
    loadConfig,
}