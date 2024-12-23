var cache = {};

function getItem(store, objectId){
    return cache[store][objectId];
}

function setItem(store, object, idProperty="_id"){
    if( !cache?.[store] ) cache[store] = {};
    cache[store][ object[idProperty] ] = {...object, cacheTime: new Date()};
}

function actualizarUsuario(objUsuario){
    cacheUsuarios[objUsuario._id] = { 
        email, 
        permisos, 
        esAdmin, 
        esHijo 
    };
}
function actualizarEmprendimiento(objEmprendimiento){
    cacheEmprendimientos[objEmprendimiento._id] = objEmprendimiento;
}

module.exports = {
    getItem,
    setItem
}