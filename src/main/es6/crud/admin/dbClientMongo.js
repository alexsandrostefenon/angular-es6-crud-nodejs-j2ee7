import {MongoClient} from "mongodb";

class DbClientMongo {

	constructor(dbName) {
		this.url = "mongodb://localhost:27017/" + dbName;
	}

	connect() {
		return MongoClient.connect().then((clent) => {this.db = client.db(dbname)}.bind(this));
	}

	find(table, matchExact, matchIn, callback) {
		var query = Object.assign({}, matchExact);
		
		for (var fieldName in matchIn) {
			var array = matchIn[fieldName];
			query[fieldName] = {$in: array}; 
		}
		
		var collection = this.db.collection(table);
		var cursor = collection.find(query);
		var array = cursor.toArray(function (error, array) {
			var response = {};
			response.rows = array;
			callback(error, response);
		});
	}
	
	update(table, searchObj, updateObj, callback) {
		var collection = this.db.collection(table);
		collection.update(searchObj, {$set:{updateObj}}, {multi:true}, function (err, result) {
		      if (err) {
		    	  throw err;
		      } else {
		    	  callback(result);
		      }
		});
	}
	
	deleteOne(table, searchObj, callback) {
		req.collection.deleteOne(searchObj, {}, function(e, result){
			if (e) return callback(e)

			if (result===1) {
				callback({msg:'success'});
			} else {
				callback({msg:'error'});
			}
		});
	}
}

exports {DbClientMongo}
