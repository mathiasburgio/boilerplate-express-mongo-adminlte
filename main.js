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

//para cache control
const emprendimientosController = require("./controllers/emprendimientos-controller.js");
const usuariosController = require("./controllers/usuarios-controller.js");

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
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI + "_sessions" })
}));

app.use( favicon(__dirname + "/public/resources/icon.ico") );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Crea las carpetas neecesarias para el sistema
let directories = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "uploads", "temp"),
    path.join(__dirname, "uploads", "images"),
];
directories.forEach(directory=>{
    if(fs.existsSync(directory) == false) fs.mkdirSync( directory )
})

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
db().then(async ret=>{ 
    conn = ret; 
    conn.model('User', require("./models/user-model.js"));
    conn.model('Client', require("./models/client-model.js"));
    conn.model('Company', require("./models/company-model.js"));
    conn.model('Config', require("./models/config-model.js"));

    await usersController.populateCache(conn, cacheControl);
    console.log("Cache load");
})

//middlewares
app.use((req, res, next)=>{
    //guarda en log para auditorias futuras
    req.writeLog = async (req, message, error=false) => {
        await fs.promises.appendFile('./log.txt', `\n${fechas.getNow(true)} [${error ? 'ERROR' : ''}] => ${(req?.session?.userId || 0)}@${req.path} => ${message}`);
    }
    //redirecciona al home
    req.goHome = (res) =>{
        res.redirect("/");
        res.end();
        return;
    }
    //completar aquí con el script que recupere la informacion primordial para el uso del sistema.
    req.getPrimordial = (req) => {
        //agregar aqui los cacheControl necesarios
        let data = {
            fx: fechas.getNow(true),
            expiration: new Date()
        };
        if(req.session?.data){
            data.email = req.session.data.email;
            data.isAdmin = req.session.data.isAdmin;
            data.child = req.session.data.child;
            data.permissions = req.session.data.permissions;
            data.companyId = req.session.data.companyId;
        }
        
        return data;
    }
    //asegura consultas a base de datos basadas con filtro por dbPrivateKey (companyId) 
    req.safeQuery = (model) => {
        const modelInstance = conn.models[model];

        if (!modelInstance) {
            throw new Error(`El modelo ${model} no existe`);
        }

        return {
            countDocuments: (query, ...args) => modelInstance.countDocuments({...query, [dbPrivateKey]: req.session.data[dbPrivateKey]}, ...args),
            find: (query, ...args) => modelInstance.find({ ...query, [dbPrivateKey]: req.session.data[dbPrivateKey] }, ...args),
            findOne: (query, ...args) => modelInstance.findOne({ ...query, [dbPrivateKey]: req.session.data[dbPrivateKey] }, ...args),
            create: (data) => modelInstance.create({...data, [dbPrivateKey]: req.session.data[dbPrivateKey]}, ...args),
            findOneAndUpdate: (query, update, ...args) => {
                delete update[dbPrivateKey];
                return modelInstance.findOneAndUpdate({ ...query, [dbPrivateKey]: req.session.data[dbPrivateKey] }, update, ...args);
            },
            updateOne: (query, update, ...args) => {
                delete update[dbPrivateKey];
                modelInstance.updateOne({ ...query, [dbPrivateKey]: req.session.data[dbPrivateKey] }, update, ...args);
            },
            deleteOne: (query, ...args) => modelInstance.deleteOne({ ...query, [dbPrivateKey]: req.session.data[dbPrivateKey] }, ...args),
        }
    };
    //conexion directa simplificada a la base de datos
    req.mongo = (model) => conn.models[model];
    //acceso al cache
    req.cacheControl = cacheControl;
    next();
})

//routes
app.use(require("./routes/clients-routes"));
app.use(require("./routes/companies-routes"));
app.use(require("./routes/config-routes"));
app.use(require("./routes/dashboard-routes"));
app.use(require("./routes/users-routes"));

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
    let resp = await req.getPrimordial(req);
    res.status(200).json(resp);
})

app.get(["/robots", "/robots.txt"], (req, res)=>{
    res.sendFile( path.join(__dirname, "public", "robots.txt") );
})

app.get(["sitemap", "/sitemap.xml"], (req, res)=>{
    res.sendFile( path.join(__dirname, "public", "sitemap.xml") );
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