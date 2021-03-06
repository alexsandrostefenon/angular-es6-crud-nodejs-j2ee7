import {CaseConvert} from "./CaseConvert.js";
import {DataStoreItem} from "./DataStore.js";

class HttpRestRequest {

	constructor(url) {
		if (url.endsWith("/") == false) url = url + "/";
		this.url = url + "rest";
		this.messageWorking = "";
		this.messageError = "";
	}

	getToken() {
		return this.token;
	}

	setToken(token) {
		this.token = token;
	}
	// private
	request(path, method, params, objSend) {
		let url = this.url + "/" + path;
		
		if (params != undefined && params != null) {
			url = url + "?";
			
			for (let fieldName in params) {
				url = url + fieldName + "=" + params[fieldName] + "&";
			}
		}
		
		let options = {};
		options.method = method;
		options.headers = {};

		if (this.token != undefined) {
			options.headers["Authorization"] = "Token " + this.token;
		}

		if (objSend != undefined && objSend != null) {
			if (objSend instanceof Blob) {
				options.headers["content-type"] = objSend.type;
				options.body = objSend;
			} else if (typeof(objSend) === 'object') {
				options.headers["content-type"] = "application/json";
//				options.headers["Content-Encoding"] = "gzip";
				options.body = JSON.stringify(objSend);
			} else if (typeof(objSend) === 'string') {
				options.headers["content-type"] = "application/text";
//				options.headers["Content-Encoding"] = "gzip";
				options.body = objSend;
			} else {
				throw new Error("HttpRestRequest.request : unknow data type");
			}
		}
		
		let _fetch = HttpRestRequest.fetch != undefined ? HttpRestRequest.fetch : fetch;    
		let promise;
		
		if (HttpRestRequest.$q) {
			promise = HttpRestRequest.$q.when(_fetch(url, options));
		} else {
			promise = _fetch(url, options);
		}
		
		this.messageWorking = "Processing request to " + url;
		this.messageError = "";

		return promise.then(response => {
			this.messageWorking = "";
			const contentType = response.headers.get("content-type");
			
			if (response.status === 200) {
				if (contentType) {
					if (contentType.indexOf("application/json") >= 0) {
						return response.json();
					} else if (contentType.indexOf("application/text") >= 0){
						return response.text();
					} else {
						return response.blob();
					}
				} else {
					return Promise.resolve(null);
				}
			} else {
				return response.text().then(message => {
					throw new Error(response.statusText + " : " + message);
				});
			}
		}).catch(error => {
			this.messageError = error.message;
			throw error;
		});
	}

	save(path, itemSend) {
		return this.request(path, "POST", null, itemSend);
	}

	update(path, params, itemSend) {
		return this.request(path, "PUT", params, itemSend);
	}

	remove(path, params) {
		return this.request(path, "DELETE", params, null);
	}

	get(path, params) {
		return this.request(path, "GET", params, null);
	}

	query(path, params) {
		return this.request(path, "GET", params, null);
	}

}

class CrudService extends DataStoreItem {

	constructor(serverConnection, params, httpRest) {
		super(params.name, params.fields);
		this.httpRest = httpRest;
        this.serverConnection = serverConnection;
        this.params = params;
        this.path = CaseConvert.camelToUnderscore(params.name);
		this.isOnLine = params.isOnLine;
		this.remoteListeners = [];
	}

	clearRemoteListeners() {
		this.remoteListeners = [];
	}

	addRemoteListener(listenerInstance) {
		this.remoteListeners.push(listenerInstance);
	}
	// used by websocket
	getRemote(primaryKey) {
    	return this.httpRest.get(this.path + "/read", primaryKey).then(data => {
       		for (let [fieldName, field] of Object.entries(this.fields)) if (field.type.includes("date") || field.type.includes("time")) data[fieldName] = new Date(data[fieldName]);
            let pos = this.findPos(primaryKey);
            let action;
            let ret;

            if (pos < 0) {
            	action = "new";
            	ret = this.updateList(data);
            } else {
            	action = "update";
            	ret = this.updateList(data, pos, pos);
            }

            for (let listener of this.remoteListeners) listener.onNotify(primaryKey, action);
            return ret;
    	});
	}

	get(primaryKey) {
        let pos = this.findPos(primaryKey);

        if (pos < 0) {
        	return this.getRemote(primaryKey);
        } else {
        	return Promise.resolve({"data": this.list[pos]});
        }
	}

	save(itemSend) {
    	return this.httpRest.save(this.path + "/create", this.copyFields(itemSend)).then(data => this.updateList(data));
	}

	update(primaryKey, itemSend) {
        return this.httpRest.update(this.path + "/update", primaryKey, this.copyFields(itemSend)).then(data => {
            let pos = this.findPos(primaryKey);
        	return this.updateList(data, pos, pos);
        });
	}

	removeInternal(primaryKey) {
		const ret =  super.removeInternal(primaryKey);
		for (let listener of this.remoteListeners) listener.onNotify(primaryKey, "delete");
		return ret;
	}

	remove(primaryKey) {
        return this.httpRest.remove(this.path + "/delete", primaryKey);//.then(data => this.removeInternal(primaryKey));
	}

	queryRemote(params) {
        return this.httpRest.query(this.path + "/query", params).then(list => {
       		for (let [fieldName, field] of Object.entries(this.fields)) if (field.type.includes("date") || field.type.includes("time")) list.forEach(item => item[fieldName] = new Date(item[fieldName]));
        	this.list = list;
        	return list;
        });
	}
	
}

class ServerConnection {

	constructor() {
    	this.services = {};
	}

	clearRemoteListeners() {
		for (let [serviceName, service] of Object.entries(this.services)) service.clearRemoteListeners();
	}
	// private -- used in login()
	webSocketConnect() {
		// Open a WebSocket connection
		// 'wss://localhost:8443/xxx/websocket'
		var url = this.url;

		if (url.startsWith("https://")) {
			url = "wss://" + url.substring(8);
		} else if (url.startsWith("http://")) {
			url = "ws://" + url.substring(7);
		}

		if (url.endsWith("/") == false) {
			url = url + "/";
		}

		url = url + "websocket";
		this.webSocket = new WebSocket(url);

    	this.webSocket.onopen = event => {
    		this.webSocket.send(this.httpRest.getToken());
    	};

    	this.webSocket.onmessage = event => {
			var item = JSON.parse(event.data);
            console.log("[ServerConnection] webSocketConnect : onMessage :", item);
            var service = this.services[item.service];

            if (service != undefined) {
        		if (item.action == "delete") {
        			if (service.findOne(item.primaryKey) != null) {
            			service.removeInternal(item.primaryKey);
        			} else {
        	            console.log("[ServerConnection] webSocketConnect : onMessage : delete : alread removed", item);
        			}
        		} else {
        			service.getRemote(item.primaryKey);
        		}
            }
		};
	}
    // public
    login(server, user, password, CrudServiceClass, callbackPartial, dbUri) {
		this.url = server;
		if (CrudServiceClass == undefined) CrudServiceClass = CrudService;
		if (callbackPartial == undefined) callbackPartial = console.log;
    	this.httpRest = new HttpRestRequest(this.url);
    	return this.httpRest.request("authc", "POST", null, {"userId":user, "password":password, "dbUri":dbUri})
    	.then(loginResponse => {
    		this.title = loginResponse.title;
    		this.user = loginResponse.user;
    		this.httpRest.setToken(this.user.authctoken);
    		const listQueryRemote = [];
            // depois carrega os serviços autorizados
            for (let params of loginResponse.crudServices) {
            	if (params != null) {
					params.access = loginResponse.roles[params.name];
					if (params.access.query == undefined) params.access.query = true;
					if (params.access.read == undefined) params.access.read = true;
					if (params.access.create == undefined) params.access.create = false;
					if (params.access.update == undefined) params.access.update = false;
					if (params.access.delete == undefined) params.access.delete = false;
					params.fields = (params.fields != undefined && params.fields != null) ? JSON.parse(params.fields) : {};
					if (params.fields.crudGroupOwner != undefined && this.user.crudGroupOwner != 1) params.fields.crudGroupOwner.hiden = true;
					if (params.fields.crudGroupOwner != undefined && params.fields.crudGroupOwner.defaultValue == undefined) params.fields.crudGroupOwner.defaultValue = this.user.crudGroupOwner;
					let service = new CrudServiceClass(this, params, this.httpRest);
					this.services[service.params.name] = service;

					if (service.isOnLine != true && service.params.access.query == true) {
						listQueryRemote.push(service);
					}
            	}
            }

            return new Promise((resolve, reject) => {
            	var queryRemoteServices = () => {
            		if (listQueryRemote.length > 0) {
            			let service = listQueryRemote.shift();
                		console.log("[ServerConnection] loading", service.label, "...");
                		callbackPartial("loading... " + service.label);

                		service.queryRemote(null).then(list => {
                			console.log("[ServerConnection] ...loaded", service.label, list.length);
                			queryRemoteServices();
                		}).catch(error => reject(error));
            		} else {
            	    	this.webSocketConnect();
                    	resolve(loginResponse);
            		}
            	}

                queryRemoteServices();
        	});
    	});
    }
    // public
    logout() {
		this.webSocket.close();
    	delete this.user;
        // limpa todos os dados da sessão anterior
        for (let serviceName in this.services) {
        	delete this.services[serviceName];
        }
    }
    // devolve um mapa de crudServices e com maps de seus fields onde o parâmetro field é utilizado 
    getForeignExportCrudServicesFromService(tableName) {
    	let list = []; // [{tableName, fieldName}]
    	// monta um mapa de todos que as utilizam
        for (let table in this.services) {
        	let crudService = this.services[table];
        	
        	for (let [fieldName, field] of Object.entries(crudService.fields)) {
        		if (field.foreignKeysImport != undefined) { // foreignKeyImport : [{table, field}]
					if (field.foreignKeysImport.table == tableName) {
						list.push({table, field: fieldName});
					}
        		}
        	}
        }
        
        return list;
    }
    // devolve o crudService apontado por field
    getForeignImportCrudService(field) { // foreignKeyImport : [{table, field}]
    	let serviceName = field.foreignKeysImport.table;
        return this.services[serviceName];
    }

}

export {HttpRestRequest, CrudService, ServerConnection};
