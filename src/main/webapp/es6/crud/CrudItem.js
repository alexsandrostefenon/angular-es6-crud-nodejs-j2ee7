import {CrudCommom} from "./CrudCommom.js";

class CrudItem extends CrudCommom {
	// CrudItem usage 
	// primaryKeyForeign = {crudGroupOwner: 2, id: 1}, fieldName = "request"
	// field.foreignKeysImport: {table: "request", field: "crudGroupOwner"}
	// foreignKey = {crudGroupOwner: 2, request: 1}
	getForeignKeyFromPrimaryKeyForeign(primaryKeyForeign, fieldName) {
		const field = this.fields[fieldName];
		const foreignKey = {};
		
		for (let fieldNameOfPrimaryKeyForeign in primaryKeyForeign) {
			if (fieldNameOfPrimaryKeyForeign != "id" && this.primaryKeys.indexOf(fieldNameOfPrimaryKeyForeign) >= 0) {
				foreignKey[fieldNameOfPrimaryKeyForeign] = primaryKeyForeign[fieldNameOfPrimaryKeyForeign];
			}
		}
		
		if (field.foreignKeysImport != undefined) {
			foreignKey[fieldName] = primaryKeyForeign[field.foreignKeysImport.field];
		} else if (primaryKeyForeign[fieldName] != undefined) {
			foreignKey[fieldName] = primaryKeyForeign[fieldName];
		} else if (primaryKeyForeign.id != undefined) {
			foreignKey[fieldName] = primaryKeyForeign.id;
		}

		return foreignKey;
	}

	constructor(serverConnection, serviceName, fieldName, primaryKeyForeign, title, numMaxItems, queryCallback, selectCallback) {
    	super(serverConnection, serverConnection.services[serviceName], {}, 1);
		this.fieldName = fieldName;
		const field = this.fields[fieldName];
		this.title = (title != undefined && title != null) ? title : field.title;
		this.isClonable = field.isClonable == undefined ? false : field.isClonable;
		this.numMaxItems = (numMaxItems != undefined && numMaxItems != null) ? numMaxItems : 999;
		this.queryCallback = queryCallback;
		this.selectCallback = selectCallback;
		this.foreignKey = this.getForeignKeyFromPrimaryKeyForeign(primaryKeyForeign, this.fieldName);
		
		for (let [_fieldName, value] of Object.entries(this.foreignKey)) {
			this.fields[_fieldName].hiden = true;
			this.fields[_fieldName].tableVisible = false;
			this.fields[_fieldName].defaultValue = value;
		}

		this.query();
	}

	query() {
		this.process("search", {filter: this.foreignKey});

		if (this.queryCallback != undefined && this.queryCallback != null) {
			this.queryCallback(this.filterResults);
		}
	}

	clone(primaryKeyForeign) {
		this.foreignKey = this.getForeignKeyFromPrimaryKeyForeign(primaryKeyForeign, this.fieldName);

		if (this.isClonable == true) {
			let count = 0;

			for (var item of this.filterResults) {
				let newItem = angular.copy(item);
				
				for (let fieldName in this.foreignKey) {
					this.newItem[fieldName] = this.foreignKey[fieldName];
				}
				
				this.crudService.save(newItem).then(response => {
					count++;

					if (count == this.filterResults.length) {
						this.query();
					}
				});
			}
		} else {
			this.query();
		}
	}
	
	remove(primaryKey) {
        // data may be null
		return super.remove(primaryKey).then(data => this.query());
	}

	save() {
		return super.save().then(response => this.query()).then(() => {
			for (let fieldName in this.fields) {
				let field = this.fields[fieldName];
				
				if (field.hiden != true) {
					document.getElementById(this.formId + "-" + fieldName).focus();
					break;
				}
			}
		});
	}

	update() {
		return super.update().then(response => this.query());
	}
}

export {CrudItem}
