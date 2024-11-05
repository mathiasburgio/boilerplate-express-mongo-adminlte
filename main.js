const express = require("express")
const app = express();
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const mongo = require("./utils/mongo");
const path = require("path");
const cors = require("cors");
const favicon = require('serve-favicon');
const fechas = require("./utils/fechas.js");
const utils = require("./utils/utils")
const fs = require("fs");
require('dotenv').config();

app.use( favicon(__dirname + "/public/resources/icon.ico") );

//cors
if(process.env?.CORS === "true") app.use(cors());

//sessions
app.use(session({
    secret: (process.env?.SESSION_SECRET || utils.getRandomString(24)),
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge : Number(process.env?.SESSION_MAXAGE) || (1000 * 60 * 60 * 24 * 5),//5 días
        //secure : !(process.env.NODE_ENV == 'development') // true ssl
        //sameSite: 'none'
    },
    store: new FileStore({logFn: function(){}})//loFn: ... es para q no joda buscando sessiones q han sido cerradas
}));

//motor de templates
app.set("view engine", "ejs");

//archivos estaticos
app.use("/css", express.static( path.join(__dirname, "/public/css") ));
app.use("/js", express.static( path.join(__dirname + "/public/js") ));
app.use("/resources", express.static( path.join(__dirname + "/public/resources") ));


//middlewares
app.use((req, res, next)=>{
    //verifica sesion y permisos (retorna true si todo esta OK)
    /*
        levels= 
        0 visitante - no inicio sesion
        1 usuario normal -inicio sesion
        2 usuario administrador - inicio sesion y es administrador de su suscripcion
        3 super usuario - administrador del cloud (mathias)
    */
    req.checkPermissions = (req, {level=0, permission=null, redirect=null}=null) => {
        try{
            if(typeof level === "number"){//verifico q este completado el parametro nivel
                if(level === 3){
                    if(req?.session?.email != "mathias.b@live.com.ar") throw "Usted no es Mathias.";
                }else if(level === 2){
                    if( Number(req?.session?.level) !== 2 ) throw "El usuario no tiene el NIVEL necesario para realizar esta acción.";
                    if(permission && req.session.permissions.includes("*") == false && req.session.permissions.includes(permission) == false) throw "El usuario no tiene los PERMISOS necesarios para realizar esta acción.";
                }else if(level === 1){
                    if( Number(req?.session?.level) !== 1 ) throw "El usuario no tiene el NIVEL necesario para realizar esta acción.";
                    if(permission && req.session.permissions.includes("*") == false && req.session.permissions.includes(permission) == false) throw "El usuario no tiene los PERMISOS necesarios para realizar esta acción.";
                }else{
                    //level 0 no valida nada
                }
            }
            return true;
        }catch(err){
            if(redirect === null){
                res.status(200).json({error: true, message: err.toString()});
                res.end();
                return false;
            }else{
                res.redirect(redirect);
                res.end();
                return false;
            }
        }
    }
    //guarda en log para auditorias futuras
    req.writeLog = async (req, message, error=false) => {
        await fs.promises.appendFile('./log.txt', `${fechas.getNow(true)} [${error ? 'ERROR' : ''}] => ${req.path} => ${message}`);
    }
    //redirecciona al home
    req.goHome = (res) =>{
        res.redirect("/");
        res.end();
        return;
    }
    //devuelve un mensaje de error al browser
    req.returnError = (res, message) => {
        res.status(200).json({error: true, message: message});
        res.end();
        return;
    }
    next();
})


//<!--CONFIGURAR ACCESO SEGURO A DATOS AQUÍ-->
/* 
    Al ejecutar una consulta en un modelo marcado con "*", el middleware añadirá automáticamente la palabra de filtro en la consulta. Comparará este valor con req.session[filtro], asegurando que solo se acceda y manipule la información asociada a la empresa actual del usuario.
    Ej.
    models={
        "ConfiguracionGlobal": ..., // Datos accesibles por todos los usuarios
        "PreciosGenerales": ...,    // Datos accesibles por todos los usuarios
        "*Productos": ...,          // Datos restringidos al cliente autenticado
        "*Clientes": ...,           // Datos restringidos al cliente autenticado
    }
*/
const models = {
    Users: require("./models/user-model"),
    "*Clients": require("./models/client-model"),
    "*Configs": require("./models/config-model"),
}
app.use(mongo.safeQueryMiddleware(models, "companyId"));

//routes
app.use(require("./routes/user-routes"));


//ping para control
app.get("/ping", (req, res)=>{
    res.send("pong");
    res.end();
})

//manejo de index
app.get("/", (req, res)=>{
    const index = path.join(__dirname, "views", "html", "index.html");
    res.status(200).sendFile(__dirname + "/views/html/index.html")
})

//manejo de 404
app.use((req, res, next) => {
    //res.status(404).send("Error 404 - Recurso no encontrado");
    res.status(404).sendFile(__dirname + "/views/html/404.html")
})

//inicio el servidor
app.listen(Number(process.env.PORT), ()=>{
    console.log("Escuchando en http://localhost:" + process.env.PORT)
})