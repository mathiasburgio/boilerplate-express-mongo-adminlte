const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { add } = require('node-7z');

function encryptString(str, prefix=false){
    str = str.toString().trim();
    if(str == ""){return "";}
    let cipher = crypto.createCipheriv(crypto_options.algorithm, crypto_options.ENC_KEY, crypto_options.IV);
    let encrypted = cipher.update(str, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted + (prefix ? "__ENC__" : "");
}
function decryptString(str, prefix=false){
    str = str.toString().trim();
    if(prefix && str.substring(str.length - 7) != "__ENC__") return null;
    str = str.substring(0,str.length - 7);
    if(str == ""){return "";}
    let decipher = crypto.createDecipheriv(crypto_options.algorithm, crypto_options.ENC_KEY, crypto_options.IV);
    let decrypted = decipher.update(str, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
}
async function getPasswordHash(field_password){
    let salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(field_password, salt);
}
async function comparePasswordHash(field_password, bd_password){
    return await bcrypt.compare(field_password, bd_password);
}
function getUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
        return v.toString(16);  
    });  
}
function getRandomString(length= 8, characters= true, numbers= true){
    let caracteres = ""; 
    if(characters) caracteres += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(numbers) caracteres += '0123456789';
    
    let cadenaAleatoria = '';
    for (let i = 0; i < length; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        cadenaAleatoria += caracteres.charAt(indice);
    }

    return cadenaAleatoria;
}
function simplifyString(str, noSpaces=false){
    str = str.replaceAll("á", "a");
    str = str.replaceAll("é", "e");
    str = str.replaceAll("í", "i");
    str = str.replaceAll("ó", "o");
    str = str.replaceAll("ú", "u");
    str = str.replaceAll("Á", "a");
    str = str.replaceAll("É", "e");
    str = str.replaceAll("Í", "i");
    str = str.replaceAll("Ó", "o");
    str = str.replaceAll("Ú", "u");
    str = str.replaceAll("ñ", "n");
    str = str.replaceAll("Ñ", "n");
    str = str.replace(/[^a-z0-9 -\_\.]/gi, '').toLowerCase().trim();
    if(noSpaces){
        return str.replaceAll(" ", "-")
    }else{
        return str
    }
}
function validateString(str, validator){
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

    if(validator == "email" || validator == "mail") return emailRegex.test(str);
    else if(validator == "uuid" || validator == "guid") return uuidRegex.test(str);
    else if(validator == "ip") return ipRegex.test(str);
    else return null;
}
function encryptFile(finalPath, filePath) {
    return new Promise((resolve, reject) => {
        const encryptStream = add(finalPath, filePath, { password: process.env.ENCRYPT_FILE_PASSWORD });
        encryptStream.on('progress', (progress) => {
            //console.log(`Progreso: ${progress.percent}%`);
        });

        encryptStream.on('data', (data) => {
            //console.log(`Archivo procesado: ${data.file}`);
        });

        encryptStream.on('end', () => {
            //console.log(`Archivo cifrado creado exitosamente en: ${encryptedZipPath}`);
            resolve();
        });

        encryptStream.on('error', (err) => {
            reject(err);
        });
    });
}
async function downloadFile(remoteUrl, localPathAndName){
    try{
        const response = await fetch(remoteUrl);
        const writer = fs.createWriteStream(localPathAndName);
        response.body.pipe(writer);

        writer.on('finish', () => {
            // Grabo OK
            //console.log("Descarga completada");
        });
    
        writer.on('error', (err) => {
            errores.push(err)
            //console.error("Error al descargar:", err);
        });
    }catch(err){
        console.log("downloadFile ERROR:", err);
        throw err;
    }
}
async function api(url, method='GET', body=null){
    let response = await fetch(url, {
        method: (method === 'POST' ? 'POST' : 'GET'),
        headers:{ 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    let data = await response.json();
    return data;
}
function safeString(str, remove = ["`", "´", "'", '"']){
    str = (str || "").toString();
    (remove || []).forEach(rm=>{
        str = str.replaceAll(rm, "");
    })
    return str;
}
module.exports = {
    encryptString,
    decryptString,
    getPasswordHash,
    comparePasswordHash,
    getUUID,
    getRandomString,
    simplifyString,
    validateString,
    encryptFile,
    downloadFile,
    api,
    safeString
};