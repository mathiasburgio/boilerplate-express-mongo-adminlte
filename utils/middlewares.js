const rateLimit = require("express-rate-limit");
/*
	levels= 
	0 visitante - no inicio sesion
	1 usuario normal -inicio sesion
	2 usuario administrador - inicio sesion y es administrador de su suscripcion
	3 super usuario - administrador del cloud (mathias)
*/
const checkPermissions = ({level=0, permission=null}) => {
	return (req, res, next)=>{
		if(typeof level === "number"){//verifico q este completado el parametro nivel
			if(level === 3){//super-admin (mathias)
				if(req?.session?.email != process.env.EMAIL_SUPER_ADMIN) return res.status(401).send("Usted no es el super-admin.");
			}else if(level === 2){//usuario-admin
				if( req.session?.data?.isAdmin !== true ) return res.status(401).send("El usuario no tiene el NIVEL necesario para realizar esta acción.");
			}else if(level === 1){//usuario-logueado
				if( !(req.session?.data) ) return res.status(401).send("El usuario no tiene el NIVEL necesario para realizar esta acción.");
			}else{
				//level 0 no valida nada
			}
		}
		
		if(permission){
			if(Array.isArray(req?.session?.permissions) == false) return res.status(401).send("El usuario no tiene los PERMISOS necesarios para realizar esta acción."); 
			if(req.session.permission.includes("*") == false && req.session.permission.includes(permission) == false) return res.status(401).send("El usuario no tiene los PERMISOS necesarios para realizar esta acción."); 
		}
		next();
	}
}


const loginRateLimit = rateLimit({
	windowMs: 5 * 60 * 1000, // 10 minutes
	limit: 5, 
    message: 'Demaciados intentos. Intenta nuevamente en unos minutos.',
	standardHeaders: 'draft-7', 
	legacyHeaders: false,
	// store: ... , // Redis, Memcached, etc. See below.
})

const createUserRateLimit = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 100,
    message: 'Demaciados intentos. Intenta nuevamente en unos minutos.',
	standardHeaders: 'draft-7', 
	legacyHeaders: false,
	// store: ... , // Redis, Memcached, etc. See below.
})

const sendEmailRateLimit = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 1,
    message: 'Demaciados intentos. Intenta nuevamente en unos minutos.',
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
	// store: ... , // Redis, Memcached, etc. See below.
})

const uploadFileRateLimit = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	limit: 5,
    message: 'Demaciados archivos subidos en un corto plazo. Intenta nuevamente en unos minutos.',
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	// store: ... , // Redis, Memcached, etc. See below.
})

module.exports = {
	checkPermissions,
    loginRateLimit,
    createUserRateLimit,
    sendEmailRateLimit,
    uploadFileRateLimit,
}