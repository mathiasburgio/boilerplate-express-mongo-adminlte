const utils = require("../utils/utils");

async function getHtml(req, res){
    res.status(200).render( "../views/layouts/dashboard.ejs", { page: "user-page.ejs" });
}
async function getList(req, res){
    let list = await req.privateQuery("User").find({deleted: false});
    res.status(200).json({list: list});
}
async function create(req, res){//Esta funcion solo deberia utilizarse para sofwares de 1 solo usuario
    try{
        let {email, password, companyId} = req.body;
    
        if(!email || utils.validateString(email, "email") == false){
            res.status(400).json({error: "Email no válido"});
            return;
        }
        if(!password || password.toString().length < 8){
            res.status(400).json({error: "Contraseña no válida. Debe tener al menos 8 caracteres."});
            return;
        }
        
        let user = await req.publicQuery("User").create({
            email: email.toLowerCase(),
            password: await utils.getPasswordHash(password),
            companyId: companyId || null,
            permissions: ["*"],
            isAdmin: true,
            deleted: false
        });
    
        req.session.data = {
            userId: user._id,
            companyId: user.companyId,
            isAdmin: user.isAdmin,
            permissions: user.permissions
        };
        req.session.save();
    
        res.status(201).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function createUserAndCompany(req, res){
    try{
        const {companyName, email, password} = req.body;

        if(!companyName || companyName.toString().trim().length < 4){
            res.status(400).json({error: "Nombre de compania no valido, debe tener mas de 3 caracteres"});
            return;
        }
        if(!email || utils.validateString(email, "email") == false){
            res.status(400).json({error: "Email no válido"});
            return;
        }
        if(!password || password.toString().length < 8){
            res.status(400).json({error: "Contraseña no válida. Debe tener al menos 8 caracteres."});
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

        let user = await req.publicQuery("User").create({
            email: email.toLowerCase(),
            password: await utils.getPasswordHash(password),
            companyId: company._id,
            permissions: ["*"],
            isAdmin: true,
            deleted: false
        });
        await user.save();
        
        req.session.data = {
            userId: user._id,
            companyId: user.companyId,
            isAdmin: user.isAdmin,
            permissions: user.permissions
        };
        req.session.save();

        res.status(201).json({message: "ok"});
    }catch(err){
        console.log(err);
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function createChild(req, res){
    try{
        let {email, password} = req.body;
        let autoPassword = false;//asignar true para que se generen automaticamente las contraseñas
    
        if(!email || utils.validateString(email, "email") == false){
            res.status(400).send("Email no válido");
            return;
        }
    
        if(autoPassword){
            password = utils.getRandomString(8, false, true);//8 caracteres, no letras, si numeros
        }
    
        if(!password || password.toString().length < 8){
            res.status(400).send("Contraseña no válida. Debe tener al menos 8 caracteres.");
            return;
        }
    
        let user = await req.publicQuery("User").create({
            email: email.toLowerCase(),
            password: await utils.getPasswordHash(password),
            companyId: req.session?.data?.companyId || null,
            permissions: [],
            isAdmin: false,
            deleted: false
        });
        
        res.status(201).json({email, password: (autoPassword ? password : null)});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function updateSelf(req, res){
    //no hace nada
    res.status(200).send("ok");
}
async function updateChild(req, res){
    try{
        let {email, password, isAdmin, permissions} = req.body;

        if(!password || password.toString().length < 8){
            res.status(400).json({error: "Contraseña no válida. Debe tener al menos 8 caracteres."});
            return;
        }

        let updated = await req.privateQuery("User")
        .findOneAndUpdate({
            email: email.toLowerCase()
        }, {
            password: await utils.getPasswordHash(password),
            isAdmin: (isAdmin === true) || false,
            permissions: permissions
        }, {new: true});

        //no devolver el updated, ya que contiene la contraseña
        res.status(200).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(),true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function deleteChild(req, res){
    try{
        let {email} = req.body;
        let updated = await req.privateQuery("User").findOneAndUpdate({
            email: email.toLowerCase()
        }, {
            deleted: true
        }, {new: true});
        //no devolver el updated, ya que contiene la contraseña
        res.status(200).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(),true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function login(req, res){
    try{
        const {email, password} = req.body;
        let users = await req.publicQuery("User").find({ email: email.toLowerCase(), deleted: false });
        let successLogin = false;
        for(let item of users){
            let ux = users[item];
            if( await utils.comparePasswordHash(password, ux.password) ){
                req.session.data = {
                    userId: ux._id,
                    companyId: ux?.companyId || null,
                    isAdmin: ux.isAdmin,
                    permissions: ux.permissions
                }
                req.session.save();
                successLogin = true;
                break;
            }
        }
        if(successLogin){
            res.status(200).json({message: "ok"});
        }else{
            res.status(400).json({error: "Combinacion email/contraseña no válida"});
        }
    }catch(err){
        await req.writeLog(req, err.toString(),true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function logout(req, res){
    req.session.destroy();
    res.status(200).json({message:"ok"});
}

module.exports = {
    getHtml,
    getList,
    create,
    createUserAndCompany,
    createChild,
    updateSelf,
    updateChild,
    deleteChild,
    login,
    logout
}