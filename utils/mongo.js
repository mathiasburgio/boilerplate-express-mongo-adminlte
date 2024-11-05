const mongoose = require("mongoose");

async function getConnection(){
	 //'mongodb://127.0.0.1/exampleDB'
	return await mongoose.createConnection(process.env.MONGO_DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
}

function safeQueryMiddleware(models, sessionProp=null){
	return (req, res, next) => {
		req.mongoQuery = {};
	
		// Itera sobre cada modelo para agregar métodos con el valor extra en la query
		Object.keys(models).forEach((modelName) => {
			let addSecurity = false;
			let _modelName = modelName;
			let model = null;
			if(modelName.charAt(0) == "*"){
				_modelName = modelName.substring(1);
				addSecurity = true;
			}
			model = models[_modelName];
	
			if(addSecurity){//agrego metodos seguros
				req.mongoQuery[_modelName] = {
					find: (query, ...args) => model.find({ [sessionProp]: req.session[sessionProp], ...query }, ...args),
					findOne: (query, ...args) => model.findOne({ [sessionProp]: req.session[sessionProp], ...query }, ...args),
					findOneAndUpdate: (query, update, ...args) => model.findOneAndUpdate({ [sessionProp]: req.session[sessionProp], ...query }, update, ...args),
					updateOne: (query, update, ...args) => model.updateOne({ [sessionProp]: req.session[sessionProp], ...query }, update, ...args),
					deleteOne: (query, ...args) => model.deleteOne({ [sessionProp]: req.session[sessionProp], ...query }, ...args),
					// Agrega otros métodos que necesites de la misma manera
				};
			}else{//agrego metodos sin filtro
				req.mongoQuery[_modelName] = {
					find: (query, ...args) => model.find(...query, ...args),
					findOne: (query, ...args) => model.findOne(...query, ...args),
					findOneAndUpdate: (query, update, ...args) => model.findOneAndUpdate(...query, update, ...args),
					updateOne: (query, update, ...args) => model.updateOne(...query, update, ...args),
					deleteOne: (query, ...args) => model.deleteOne(...query, ...args),
					// Agrega otros métodos que necesites de la misma manera
				};
			}

			//agrego metodos inseguros
			req.unsafeMongoQuery[_modelName]= {
				find: (query, ...args) => model.find(...query, ...args),
				findOne: (query, ...args) => model.findOne(...query, ...args),
				findOneAndUpdate: (query, update, ...args) => model.findOneAndUpdate(...query, update, ...args),
				updateOne: (query, update, ...args) => model.updateOne(...query, update, ...args),
				deleteOne: (query, ...args) => model.deleteOne(...query, ...args),
				// Agrega otros métodos que necesites de la misma manera
			}
		});
		next();
	}
}
module.exports={
	getConnection,
	safeQueryMiddleware
};