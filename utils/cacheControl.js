var cache = {};

function getItem(store, objectId){
    return cache[store][objectId];
}

function setItem(store, object, idProperty="_id"){
    if( !cache?.[store] ) cache[store] = {};
    if(object?.toObject) object = object.toObject();//verifica si se intenta guardar un objeto de mongoose
    cache[store][ object[idProperty] ] = {...object, _cacheCreatedAt: new Date()};
}

function getCache(store){
    return store ? cache[store] : cache;
}

module.exports = {
    getItem,
    setItem,
    getCache
}