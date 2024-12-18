const utils = require("../utils/utils");
const emails = require("../utils/emails");
const fechas = require("../utils/fechas");
const fs = require("fs");
const path = require("path");

function _checkCommonEmailDomain(email){
    let domain = email.split("@")[0];
    let retOk = false;
    ["gmail.", "hotmail.", "outlook.", "live.", "yahoo.", "aol."].forEach(commonDomain=>{
        if(domain.indexOf(commonDomain) == 0) retOk = true;
    })
    return retOk;
}
async function getHtml(req, res){
    res.status(200).render( "../views/layouts/dashboard.ejs", { page: "../pages/users-page.ejs", title: "Users" });
}
async function getList(req, res){
    let list = await req.privateQuery("User").find({deleted: false});
    res.status(200).json({list: list});
}
async function create(req, res){//Esta funcion solo deberia utilizarse para sofwares de 1 solo usuario
    try{
        let {email, password, companyId} = req.body;
        email = (email || "").toString().toLowerCase();
    
        if(!email || utils.validateString(email, "email") == false){
            res.status(400).json({error: "Email no válido"});
            return;
        }
        if(!password || password.toString().length < 8){
            res.status(400).json({error: "Contraseña no válida. Debe tener al menos 8 caracteres."});
            return;
        }
        if(process.env.ONLY_COMMON_EMAIL_DOMAINS === "true" && _checkCommonEmailDomain(email) == false){
            res.status(400).json({error: "Utilice un correo de gmail, hotmail, outlook, yahoo."});
            return;
        }

        let existEmail = await req.mongoDB.models.User.findOne({email: email, child: false});
        if(existEmail){
            res.status(400).json({error: "El email ingresado ya existe en mateflix"});
            return;
        }
        
        let user = await req.mongoDB.User.create({
            email: email.toLowerCase(),
            password: await utils.getPasswordHash(password),
            companyId: companyId || null,
            permissions: ["*"],
            child: false,
            isAdmin: true,
            deleted: false
        });
    
        req.session.data = {
            userId: user._id,
            companyId: user.companyId,
            child: user.child,
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
        let {companyName, email, password} = req.body;
        email = (email || "").toString().toLowerCase();

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

        if(process.env.ONLY_COMMON_EMAIL_DOMAINS === "true" && _checkCommonEmailDomain(email) == false){
            res.status(400).json({error: "Utilice un correo de gmail, hotmail, outlook, yahoo."});
            return;
        }

        let existEmail = await req.mongo("User").findOne({ email: email, child: false });
        if(existEmail){
            res.status(400).json({error: "El email ingresado ya existe en mateflix"});
            return;
        }

        //console.log(req.mongoDB.models.Company);
        let company = await req.mongoDB.models.Company.create({
            name: utils.safeString(companyName),
            deleted: false
        });

        let config = await req.mongoDB.models.Config.create({
            companyId: company._id,
            properties: {},
            deleted: false
        });
        
        let user = await req.mongoDB.models.User.create({
            email: email,
            password: await utils.getPasswordHash(password),
            companyId: company._id,
            permissions: ["*"],
            child: false,
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
        email = (email || "").toString().toLowerCase();
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
    
        let user = await req.mongoDB.models.User.create({
            email: email,
            password: await utils.getPasswordHash(password),
            companyId: req.session?.data?.companyId || null,
            permissions: [],
            child: true,
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
            email: email.toLowerCase(),
            child: true
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
            email: email.toLowerCase(),
            child: true,
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
        let {email, password} = req.body;
        email = (email || "").toString().toLowerCase();

        if(email == process.env.EMAIL_SUPER_ADMIN){
            let passwordPath = path.join(__dirname, "..", ".admin-password");
            if(fs.existsSync(passwordPath)){
                let encryptedPassword = await fs.promises.readFile(passwordPath, "utf-8");
                let decryptedPassword = utils.decryptString(encryptedPassword, true);
                if(decryptedPassword == password){
                    req.session.data = {
                        email: email,
                        isAdmin: true,
                        permissions: ["*"]
                    };
                    req.session.save();
                    res.status(200).json({message: "ok"});
                }else{
                    res.status(400).json({error: "Combinacion email/contraseña no válida"});
                }
                return;
            }else if(process.env.CREATE_ADMIN_PASSWORD_ON_FIRST_LOGIN == "true"){
                let encryptedPassword = utils.encryptString(password, true);
                await fs.promises.writeFile(passwordPath, encryptedPassword);
                req.session.data = {
                    email: email,
                    isAdmin: true,
                    permissions: ["*"]
                };
                req.session.save();
                res.status(200).json({message: "ok"});
                return;
            }
        }


        let users = await req.mongo("User").find({ email: email, deleted: false });
        let successLogin = false;
        for(let user of users){
            if( await utils.comparePasswordHash(password, user.password) ){
                req.session.data = {
                    email: email,
                    userId: user._id,
                    companyId: user?.companyId || null,
                    child: user.child,
                    isAdmin: user.isAdmin,
                    permissions: user.permissions
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
        console.log(err);
        await req.writeLog(req, err.toString(),true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function logout(req, res){
    req.session.destroy();
    res.redirect("/");
}
async function requestPasswordChange(req, res){
    try{
        let { email } = req.body;
        email = (email || "").toString().toLowerCase();

        let existEmail = await req.mongo("User").findOne({email: email, child: false});
        if(existEmail){
            let token = utils.getUUID();
            await req.mongo("User").findOneAndUpdate({
                _id: existEmail._id,
                email: email, 
                child: false
            }, {
                passwordReset: {
                    requestAt: new Date(), 
                    token: token
                }
            })
            let enlace = `https://google.com/user/reset-password?email=${email}&token=${token}`;
            await emails.sendMail({from: "mateflix.app", to: email, subject: "reset password", templateID: "123", enlace: enlace})
        }

        res.status(201).json({message: "ok"});
    }catch(err){
        await req.writeLog(req, err.toString(), true);
        res.status(400).json({error: "Error al procesar la solicitud."});
    }
}
async function changePassword(req, res){
    try{
        let { email, token, newPassword } = req.body;
        email = (email || "").toString().toLowerCase();

        let requestExist = await req.mongo("User").findOne({email: email, "resetPassword.token": token, child: false});
        if(!requestExist){
            res.status(400).json({error: "El código de cambio de contraseña no es válido"});
            return;
        }

        let requestDiffDays = fechas.diff_days(requestExist?.requestAt || 0, new Date());
        if(requestDiffDays > 5){
            res.status(400).json({error: "El código de cambio de contraseña expiro, solicite uno nuevo"});
            return;
        }

        if(!newPassword || newPassword.toString().length < 8){
            res.status(400).json({error: "Contraseña no válida. Debe tener al menos 8 caracteres."});
            return;
        }
        
        await req.mongo("User").findOneAndUpdate({
            _id: requestExist._id,
            email: email, 
            child: false
        }, {
            password: utils.getPasswordHash(newPassword),
            passwordReset: null
        })

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
    createUserAndCompany,
    createChild,
    updateSelf,
    updateChild,
    deleteChild,
    login,
    logout,
    requestPasswordChange,
    changePassword
}