import {Utils} from "./Utils.js";
import {DataStoreItem, Filter} from "./DataStore.js";
// differ of DataStoreItem by UI features, serverConnection and field.foreignKeysImport dependencies
class CrudUiSkeleton extends DataStoreItem {
	
	static calcPageSize() {
		let pageSize;
		let avaiableHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		const style = window.getComputedStyle(document.getElementById("header"));
		avaiableHeight -= parseFloat(style.height);
		const rowHeight = parseFloat(style.fontSize) * 2.642857143;
    	pageSize = Math.trunc(avaiableHeight / rowHeight);
    	pageSize -= 4;
    	return pageSize;
	}

	updateFields() {
		// type: "i", service: "serviceName", defaultValue: null, hiden: false, required: false, flags: ["a", "b"], readOnly: false
		for (let fieldName in this.fields) {
			let field = this.fields[fieldName];
			field.filter = {};
			field.htmlType = "text";
			field.htmlStep = "any";

			if (field.type == "b") {
				field.htmlType = "checkbox";
			} else if (field.type == "i") {
				field.htmlType = "number";
				field.htmlStep = "1";
			} else if (field.type == "n") {
				field.htmlType = "number";
				
				if (field.precision == 1) {
					field.htmlStep = "0.1";
				} else if (field.precision == 2) {
					field.htmlStep = "0.01";
				} else {
					field.htmlStep = "0.001";
				}
			} else if (field.type == "date") {
				field.htmlType = "date";
			} else if (field.type == "time") {
				field.htmlType = "time";
			} else if (field.type == "datetime-local") {
				field.htmlType = "datetime-local";
			}

			if (field.options == undefined && field.optionsLabels == undefined && field.type == "s" && field.length == 1 && (field.defaultValue == "S" || field.defaultValue == "N")) {
				field.filterResults = field.options = ["S", "N"];
				field.filterResultsStr = field.optionsLabels = ["Sim", "Não"];
			}

			if (field.htmlType == "number" || field.htmlType.includes("date") || field.htmlType.includes("time")) {
				field.htmlTypeIsRangeable = true;
			} else {
				field.htmlTypeIsRangeable = false;
			}
			
			if (field.label == undefined) {
				if (field.comment != undefined && field.comment.length <= 30) {
					field.label = field.comment;
				} else {
					let label = this.serverConnection.convertCaseAnyToLabel(fieldName);
					field.label = label;
				}
			}

			if (field.flags != undefined) {
				field.flags = field.flags.split(",");
				field.htmlTypeIsRangeable = false;
			}

			if (field.options != undefined) {
				if (Array.isArray(field.options) == false) field.options = field.options.split(",");
				field.htmlTypeIsRangeable = false;
			}

			if (field.optionsLabels != undefined) {
				if (Array.isArray(field.optionsLabels) == false) field.optionsLabels = field.optionsLabels.split(",");
				field.htmlTypeIsRangeable = false;
			}
			
			if (field.foreignKeysImport != undefined) {
				field.htmlTypeIsRangeable = false;
			}
		}
	}

	constructor(serverConnection, name, fields, selectCallback) {
		super(name, fields);
		this.serverConnection = serverConnection;
		this.translation = serverConnection.translation;
		this.formId = name + "Form";
		this.selectCallback = selectCallback;
		this.updateFields();
	}

	buildFieldFilterResults() {
		// faz uma referencia local a field.filterResultsStr, para permitir opção filtrada, sem alterar a referencia global
		for (let [fieldName, field] of Object.entries(this.fields)) {
			if (field.foreignKeysImport != undefined) {
				const crudService = this.serverConnection.getForeignImportCrudService(field);

				if (crudService != undefined) {
					let fieldFilter = Object.entries(field.filter);

					if (fieldFilter.length > 0) {
						field.filterResults = [];
						field.filterResultsStr = [];
						
						for (let i = 0; i < crudService.list.length; i++) {
							let candidate = crudService.list[i];

							if (Filter.matchObject(field.filter, candidate, (a,b,fieldName) => a == b, false)) {
								field.filterResults.push(candidate);
								field.filterResultsStr.push(crudService.listStr[i]);
							}
						}
					} else {
						field.filterResults = crudService.list;
						field.filterResultsStr = crudService.listStr;
					}
				} else {
					console.warn("don't have acess to service ", field.foreignKeysImport);
					field.filterResults = [];
					field.filterResultsStr = [];
				}
			} else if (field.options != undefined) {
				field.filterResults = field.options;
				
				if (field.optionsLabels != undefined) {
					field.filterResultsStr = field.optionsLabels;
				} else {
					field.filterResultsStr = field.options;
				}
			}
			
			if (field.htmlType.includes("date")) {
				field.filterRangeOptions = [
					" hora corrente ", " hora anterior ", " uma hora ",
					" dia corrente ", " dia anterior ", " um dia ",
					" semana corrente ", " semana anterior ", " uma semana ", 
					" quinzena corrente ", " quinzena anterior ", " uma quinzena ",
					" mês corrente ", " mês anterior ", " um mês ",
					" ano corrente ", " ano anterior ", " um ano "
				];
				
				field.aggregateRangeOptions = ["", "hora", "dia", "mês", "ano"];
			}
		}
	}

	process(action, params) {
		for (let [fieldName, field] of Object.entries(this.fields)) field.filter = {};
		this.buildFieldFilterResults();
		super.process(action, params);
	}
	
	setValues(obj) {
		super.setValues(obj);
		// fieldFirst is used in form_body html template
		this.fieldFirst = undefined;
		const list = Object.entries(this.fields);
		let filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true && field.required == true && this.instance[fieldName] == undefined);
		if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true && field.required == true);
		if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true);
		if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true);
		if (filter.length > 0) this.fieldFirst = filter[0][0];
	}

	paginate(params) {
		if (params == undefined) params = {};
		if (params.pageSize == undefined) params.pageSize = CrudUiSkeleton.calcPageSize();
		if (params.pageSize < 10) params.pageSize = 10;
		this.pagination.paginate(this.filterResults, params.pageSize, params.page);
	}
	
    validateFieldChange(fieldName, newValue, oldValue) {
    	return true;
    }

	parseValue(fieldName, instance) {
		if (instance == undefined) instance = this.instance;
		const field = this.fields[fieldName];

		if (field.flags != undefined && field.flags != null) {
			// field.flags : String[], vm.instanceFlags[fieldName] : Boolean[]
			instance[fieldName] = Number.parseInt(Utils.flagsToStrAsciiHex(this.instanceFlags[fieldName]), 16);
		} else {
			let pos = field.filterResultsStr.indexOf(field.externalReferencesStr);
			
			if (pos >= 0) {
				const oldValue = instance[fieldName];
				let newValue;

				if (field.foreignKeysImport != undefined) {
					const foreignData = field.filterResults[pos];
					newValue = foreignData[field.foreignKeysImport.field];
				} else if (field.options != undefined) {
					newValue = field.filterResults[pos];
				}

				if (this.validateFieldChange(fieldName, newValue, oldValue) == true) {
					instance[fieldName] = newValue;
				}
			}
		}
	}

}

export {CrudUiSkeleton}
