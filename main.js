const express = require("express")
const app = express();
const session = require("express-session");
const MongoStore = require('connect-mongo');
const bodyParser = require("body-parser");
const db = require('./utils/db');
const path = require("path");
const cors = require("cors");
const favicon = require('serve-favicon');
const fechas = require("./utils/fechas.js");
const utils = require("./utils/utils")
const fs = require("fs");
require('dotenv').config();

/*
dbPrivateKey: este campo hace que los datos guardados en ciertas colecciones de documentos en la base de datos sean solo accesibles para usuarios logueados para la misma compania.
EJ los productos de "el coloso sa" solo son accesibles por "el coloso sa" ya que al iniciar sesion "req.session.companyId" asegura que las consultas a base de datos sean con dicho filtro.
para esto se debe consultar la base de datos mediante req.privateQuery(model).find (create, updateOne, delete, etc)
*/
const dbPrivateKey = "companyId";

//sessions
app.use(session({
    secret: process.env?.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge : Number(process.env?.SESSION_MAXAGE) || (1000 * 60 * 60 * 24 * 5),//5 días
        sameSite: true,
        //secure : !(process.env.NODE_ENV == 'development') // true ssl
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_SESSION_URI })
}));

app.use( favicon(__dirname + "/public/resources/icon.ico") );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//cors
if(process.env?.CORS === "true") app.use(cors());

//motor de templates
app.set("view engine", "ejs");

//archivos estaticos
app.use("/css", express.static( path.join(__dirname, "/public/css") ));
app.use("/js", express.static( path.join(__dirname + "/public/js") ));
app.use("/resources", express.static( path.join(__dirname + "/public/resources") ));

//conecta a la base de datos y cargo los modelos
let conn = null;
db().then(ret=>{ 
    conn = ret; 
    conn.model('User', require("./models/user-model.js"));
    conn.model('Client', require("./models/client-model.js"));
    conn.model('Company', require("./models/company-model.js"));
    conn.model('Config', require("./models/config-model.js"));
})

//middlewares
app.use((req, res, next)=>{
    
    //guarda en log para auditorias futuras
    req.writeLog = async (req, message, error=false) => {
        await fs.promises.appendFile('./log.txt', `${fechas.getNow(true)} [${error ? 'ERROR' : ''}] => ${(req?.session?.userId || 0)}@${req.path} => ${message}`);
    }
    //redirecciona al home
    req.goHome = (res) =>{
        res.redirect("/");
        res.end();
        return;
    }
    //completar aquí con el script que recupere la informacion primordial para el uso del sistema.
    req.getPrimordial = async (req, res) => {
        let data = {
            fx: fechas.getNow(true),
        };
        
        return data;
    }
    //asegura consultas a base de datos basadas con filtro por dbPrivateKey (companyId) 
    req.privateQuery = (model) => {
        const modelInstance = conn.models[model];

        if (!modelInstance) {
            throw new Error(`El modelo ${model} no existe`);
        }

        return {
            countDocuments: (query, ...args) => modelInstance.countDocuments({[dbPrivateKey]: req.session[dbPrivateKey],...query}, ...args),
            find: (query, ...args) => modelInstance.find({ [dbPrivateKey]: req.session[dbPrivateKey], ...query }, ...args),
            findOne: (query, ...args) => modelInstance.findOne({ [dbPrivateKey]: req.session[dbPrivateKey], ...query }, ...args),
            create: (data) => modelInstance.create({[dbPrivateKey]: req.session[dbPrivateKey], ...data}, ...args),
            findOneAndUpdate: (query, update, ...args) => {
                delete update[dbPrivateKey];
                return modelInstance.findOneAndUpdate({ [dbPrivateKey]: req.session[dbPrivateKey], ...query }, update, ...args);
            },
            updateOne: (query, update, ...args) => {
                delete update[dbPrivateKey];
                modelInstance.updateOne({ [dbPrivateKey]: req.session[dbPrivateKey], ...query }, update, ...args);
            },
            deleteOne: (query, ...args) => modelInstance.deleteOne({ [dbPrivateKey]: req.session[dbPrivateKey], ...query }, ...args),
        }
    };
    //permite conexiones sin filtro a base de datos
    req.publicQuery = (model) => {
        const modelInstance = conn.models[model];
        
        if (!modelInstance) {
            throw new Error(`El modelo ${model} no existe`);
        }

        return {
            countDocuments: (query, ...args) => modelInstance.countDocuments(...query, ...args),
            find: (query, ...args) => modelInstance.find(...query, ...args),
            findOne: (query, ...args) => modelInstance.findOne(...query, ...args),
            create: (data) => modelInstance.create(data),
            findOneAndUpdate: (query, update, ...args) => modelInstance.findOneAndUpdate(...query, update, ...args),
            updateOne: (query, update, ...args) => modelInstance.updateOne(...query, update, ...args),
            deleteOne: (query, ...args) => modelInstance.deleteOne(...query, ...args),
        }
    };
    //conexion directa a la base de datos
    req.mongoDB = conn;
    next();
})

//routes
app.use(require("./routes/user-routes"));

//ping para control
app.get("/ping", (req, res)=>{
    res.send("pong");
    res.end();
})

//manejo de index
app.get("/", (req, res)=>{
    if(Object.keys(req.query).includes("just-login")){
        const indexJustLogin = path.join(__dirname, "views", "html", "index-just-login.html");
        res.status(200).sendFile(indexJustLogin)
    }else{
        const indexLandingPage = path.join(__dirname, "views", "html", "index-landing-page.html");
        res.status(200).sendFile(indexLandingPage)
    }
})

//retorna informacion basica para el uso general. Ej fecha, permisos de usuario, configuracion general
app.get("/primordial", async (req, res)=>{
    let resp = await req.getPrimordial();
    res.status(200).json(resp);
})

//manejo de 404
app.use((req, res, next) => {
    //res.status(404).send("Error 404 - Recurso no encontrado");
    res.status(404).sendFile(__dirname + "/views/html/404.html")
})

//inicio el servidor
app.listen(Number(process.env.PORT), async ()=>{
    console.log("Escuchando en http://localhost:" + process.env.PORT)
})