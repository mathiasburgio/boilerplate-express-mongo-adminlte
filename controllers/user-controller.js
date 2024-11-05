const Users = require('../models/user-model');
const utils = require("../utils/utils");
async function getList(req, res){
    let list = await req.mongoQuery({});
    res.status(200).json({list: list});
}
async function create(email, password, permissions=[], subproject = null){
    let user = {
        email: email.toLowerCase(),
        password: await utils.getPasswordHash(password),
        subproject: subproject,
        permissions: permissions
    };
    this.db.Users.ad
}
async function updatePermissions(userId, permissions){
    let user = await this.db.Users.findOne({_id: userId})
    user.permissions = permissions;
    await user.save();
}
async function updatePassword(userId, newPassword){
    if(newPassword.length < 8) throw "Wrong new password";
    let user = await this.db.Users.findOne({_id: userId})
    user.password = await utils.getPasswordHash(newPassword);
    await user.save();
}
async function remove(userId){
    await this.db.Users.updateOne({_id: userId}, {deleted: true});
}
async function login(req, res){
    try{
        const {email, password} = req.body;
        let users = await Users.find({ email: email.toLowerCase(), deleted: false });
        let successLogin = false;
        for(let ux of users){
            if( await utils.comparePasswordHash(password, users[ux].password) ){
                req.session = {
                    userId: users[ux]._id,
                    companyId: users[ux].companyId,
                    isAdmin: users[ux].isAdmin,
                    permissions: users[ux].permissions
                }
                req.session.save();
                successLogin = true;
                break;
            }
        }
        if(successLogin){
            res.status(200).json({message: "OK"});
        }else{
            req.returnError(res, "Combinacion email/contraseña no válida");
        }
    }catch(err){
        await req.writeLog(req, err.toString(),true);
        req.returnError(res, "Parece que hubo un error");
    }
}
async function logout(req, res){
    req.session.destroy();
    res.status(200).end();
}

module.exports = {
    getList,
    create,
    updatePermissions,
    updatePassword,
    remove,
    login,
    logout
}