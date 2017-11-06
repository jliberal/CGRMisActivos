sap.ui.define([
	"cl/cgr/everis/developmentsCRGMisActivos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	'sap/m/MessageToast'
], function(BaseController, JSONModel, Device, MessageBox, Export, ExportTypeCSV, MessageToast) {
	"use strict";
	return BaseController.extend("cl.cgr.everis.developmentsCRGMisActivos.controller.Master", {
		onInit : function () {
			//Importamos modelo
			var oData = {};
			//Buscamos RUT
			oData.identity = this.getIdentity();
			oData.currentTab = "tabFilter1";
			oData.activeTable = "idAssetsTab";
			//Subimos RUT al Modelo
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel,"masterView");
			//Construimos Path
			var vPath = "/MisActivosSolSet";
			//Construimos Filtro
			this._oFilter1 = new sap.ui.model.Filter("Tabsalida", sap.ui.model.FilterOperator.EQ, "01");
			this._oFilter2 = new sap.ui.model.Filter("Tabsalida", sap.ui.model.FilterOperator.EQ, "02");
			this._oFilter3 = new sap.ui.model.Filter("Tabsalida", sap.ui.model.FilterOperator.EQ, "03");
			this._oFilter4 = new sap.ui.model.Filter("Zzrut", sap.ui.model.FilterOperator.EQ, oData.identity);
			this._oFilter5 = new sap.ui.model.Filter("Tabsalida", sap.ui.model.FilterOperator.EQ, "05");
			//Leemos Servicio en préstamo
			//this.readService(vPath,this.doLoanModelCallback,[oFilter4,oFilter2]);
			//Leemos Servicios para el count
			var vPathCount = "/MisActivosSolSet/$count";
			this.readService(vPathCount,this.doCountAssetsModelCallback,[this._oFilter4,this._oFilter1,this._oFilter3]);
			this.readService(vPathCount,this.doCountLoansModelCallback,[this._oFilter4,this._oFilter2]);
			this.readService(vPathCount,this.doCountReqModelCallback,[this._oFilter4,this._oFilter3,this._oFilter5]);
			//Leemos servicio mis Activos
			this.setBusyComponent(true,"idAssetsTab");
			this.readService(vPath,this.doAssetsModelCallback,[this._oFilter4]);
			//Creamos modelo de filtros
			this.createFilterModel();
		},
		filterAssetsByTab: function(oFilter,vTab,vTemplate){
			this.setValueToViewModel("masterView","initialFilters",oFilter);
			var tFilter = JSON.parse(JSON.stringify(oFilter));
			var oTab = this.getView().byId(vTab);
			if (oTab !== undefined){
				var oBinding = oTab.getBinding("items");
				oBinding.filter(tFilter);
				//Busco registros para actualizar el filtro
				var oItems = oTab.getItems();
				var tFilters = this.updateDynamicFilters(oItems,vTemplate);
				this.setValueToViewModel("masterView","myCurrentFilters",tFilters);
			}
		},
		updateDynamicFilters: function(tItems,vTemplate){
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var tFilters = JSON.parse(JSON.stringify(oData[vTemplate]));
			//Para cada una de las columnas
			for (var f = 0 ; f  < tFilters.length; f++){
				//Buscamos los valores
				for (var i=0; i < tItems.length; i++){
					var value = oModel.getProperty(tFilters[f].field,tItems[i].getBindingContext("masterView"));
					tFilters[f].items.push(value);
				}
			}
			//Eliminamos repetidos
			i = 0;
			do {
				//mData[i] = this.sliceFilter(mData[i]);
				if (tFilters[i].items.length > 0){
					tFilters[i].items = this.sliceFilter(tFilters[i].items);
				}
				i++;
			}
			while (i < 7);
			//Convertimos los resultados en Json
			for (var i1 = 0; i1 < tFilters.length; i1++) {
				if (tFilters[i1].items){
					var sTab = [];
					 for (var j1 = 0; j1 < tFilters[i1].items.length; j1++) {
					 	var sDat = {};
						sDat.text = tFilters[i1].items[j1];
						sDat.value = j1;
						sTab.push(sDat);
					 }	
					 tFilters[i1].items = sTab;
				}
			}			
			//Actualizamos filtros
			return tFilters;
		},
		createFilterModel: function(){
			var tFilters = [
				{value: 0, field:"Anln1"		,text:this.getResourceBundle().getText("actCol1"), items:[]},
				{value: 1, field:"Txt50"		, text:this.getResourceBundle().getText("actCol2"), items:[]},
				{value: 2, field:"Zzserieamdo"	, text:this.getResourceBundle().getText("actCol3"), items:[]},
				{value: 3, field:"ZzasignaUsu"	, text:this.getResourceBundle().getText("actCol4"), items:[]},
				{value: 4, field:"ZzubicTecn"	, text:this.getResourceBundle().getText("actCol5"), items:[]},
				{value: 5, field:"Pltxt"		, text:this.getResourceBundle().getText("actCol6"), items:[]},
				{value: 6, field:"Zzestadotxt"	, text:this.getResourceBundle().getText("actCol7"), items:[]}
			];
			var tFilters2 = [
				{value: 0, field:"ZnroSolic"		, text:this.getResourceBundle().getText("reqCol1"), items:[]},
				{value: 1, field:"Zfenvio"			, text:this.getResourceBundle().getText("reqCol2"), items:[]},
				{value: 2, field:"Zperitxt"			, text:this.getResourceBundle().getText("reqCol3"), items:[]},
				{value: 3, field:"Zanio"			, text:this.getResourceBundle().getText("reqCol4"), items:[]},
				{value: 4, field:"Znotiftxt"		, text:this.getResourceBundle().getText("reqCol5"), items:[]},
				{value: 5, field:"Zmotivo"			, text:this.getResourceBundle().getText("reqCol6"), items:[]},
				{value: 6, field:"Zzrut"			, text:this.getResourceBundle().getText("reqCol7"), items:[]},
				{value: 7, field:"ZzasignaUsu"		, text:this.getResourceBundle().getText("reqCol8"), items:[]},
				{value: 8, field:"Zzdependencia"	, text:this.getResourceBundle().getText("reqCol9"), items:[]},
				{value: 9, field:"Zestadotxt"		, text:this.getResourceBundle().getText("reqCol10"), items:[]},
				{value: 10, field:"Zsolucion"		, text:this.getResourceBundle().getText("reqCol11"), items:[]}
			];
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			oData.myFilters = tFilters;
			oData.myFiltersSol = tFilters2;
			oModel.setData(oData);
			this.getView().setModel(oModel,"masterView");
		},
		getIdentity: function(){
			return "5824136-9";
		},
		/*onSelectedTree: function(oEvt){
			var aux = 2;	
		},*/
		/*onSearchLocation: function(oEvt){
			//Buscar tree desde SAP
			var vQuery = oEvt.getParameter("query");
			var vPath = "/hierarchy_treeSet";
			var oFilter = new sap.ui.model.Filter("Nodeid", sap.ui.model.FilterOperator.Contains, vQuery);
			this.readService(vPath,this.doTreeModelCallback,[oFilter]);
		},*/	
		/*onPressNode: function(oEvt){
			var oNode = oEvt.getSource();
			var regExp = /\(([^)]+)\)/;
			var vCtx1 = oNode.getTitle();
			var tCtx = regExp.exec(vCtx1);
			if (tCtx[1]){
				//Ya tenemos la ubicacion
				var bReplace = !Device.system.phone;
				var vLocation = tCtx[1];
				this.getRouter().navTo("object", {
					objectId : vLocation
				}, bReplace);
			}else{
				var vText = this.getResourceBundle().getText("errorPressNode");
				this.showServiceError(vText);
			}
		},*/
		doAssetsModelCallback: function(oData,controller){
			//Pasamos data para componente formateado al componente tree
			//Importamos modelo
			var oModel = controller.getView().getModel("masterView");
			var oMData = oModel.getData();
			oMData.myAssets = oData.results;
			//Actualizamos filtros
			//oMData.myAssetsFilters = controller.getAssetsFilters(oData.results,oMData.myFilters,controller);
			//oMData.myCurrentFilters = JSON.parse(JSON.stringify(oMData.myAssetsFilters));
			//Actualizamos modelo
			oModel.setData(oMData);
			controller.getView().setModel(oModel,"masterView");
			controller.setBusyComponent(false,"idAssetsTab");
			//Aplicar filtro inicial
			controller.filterAssetsByTab([controller._oFilter1,controller._oFilter3],"idAssetsTab","myFilters");
		},
		doCountAssetsModelCallback: function(oData,controller){
			controller.setValueToViewModel("masterView","myAssetsCount",oData);
		},
		doCountLoansModelCallback: function(oData,controller){
			controller.setValueToViewModel("masterView","myLoansCount",oData);
		},
		doCountReqModelCallback: function(oData,controller){
			controller.setValueToViewModel("masterView","myRequestsCount",oData);
		},
		/*doLoanModelCallback: function(oData,controller){
			//Pasamos data para componente formateado al componente tree
			//Importamos modelo
			var oModel = controller.getView().getModel("masterView");
			var oMData = oModel.getData();
			oMData.myLoan = oData.results;
			oMData.myLoanCount = oData.results.length;
			//Actualizamos filtros
			oMData.myLoanFilters = controller.getAssetsFilters(oData.results,oMData.myFilters,controller);
			//Actualizamos modelo
			oModel.setData(oMData);
			controller.getView().setModel(oModel,"masterView");
		},*/
		/*getAssetsFilters: function(tData,tabFilters,controller){
			var sData = {};
			var tFilters = JSON.parse(JSON.stringify(tabFilters));
			//var mData = [[],[],[],[],[],[],[]];
			//Iteramos
			for (var i = 0; i < tData.length; i++) {
				sData = tData[i];
				for (var j = 0; j < tFilters.length; j++) {
					if (sData[tFilters[j].field]){
						tFilters[j].items.push(sData[tFilters[j].field]);
					}
				}	
			}
			//Eliminamos repetidos
			i = 0;
			do {
				//mData[i] = this.sliceFilter(mData[i]);
				if (tFilters[i].items.length > 0){
					tFilters[i].items = this.sliceFilter(tFilters[i].items);
				}
				i++;
			}
			while (i < 7);
			//Convertimos los resultados en Json
			for (var i1 = 0; i1 < tFilters.length; i1++) {
				if (tFilters[i1].items){
					var sTab = [];
					 for (var j1 = 0; j1 < tFilters[i1].items.length; j1++) {
					 	var sDat = {};
						sDat.text = tFilters[i1].items[j1];
						sDat.value = j1;
						sTab.push(sDat);
					 }	
					 tFilters[i1].items = sTab;
				}
			}			
			//Actualizamos filtros
			return tFilters;
			//controller.updateAssetsFilters(mData,controller);
		},*/
		sliceFilter: function(oArray){
			//return oArray.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
			return oArray.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]).sort(function(a,b){return a > b;});
		},
		onExcel: sap.m.Table.prototype.exportData || function(oExport){
			var vText = this.getResourceBundle().getText("errorPressExcel");
			// download exported file
			oExport.saveFile().catch(function(oError) {
				MessageBox.error(vText + oError);
			}).then(function() {
				oExport.destroy();
			});
		},
		onPdf:  function(iPath,iRut){
			//var vPath = iPath + "('" + iRut + "')/$value";
			var vPath = iPath + "('" + iRut + "*01*03" +  "')/$value";
			var oModel = this.getOwnerComponent().getModel();
			vPath = oModel.sServiceUrl + vPath; 
			sap.m.URLHelper.redirect(vPath, true);
		},
		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		onSelect: function(vTable, vMode){
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var tData = []; 
			var sData = {};
			//Asignamos data
			tData = oData[vTable]; 
			//Iteramos
			for (var i = 0; i < tData.length; i++) {
				sData = tData[i];
				if(sData.Activo === "X"){
					sData.Selec = vMode;
				}
			}
			oModel.setData(oData);
			this.getView().setModel(oModel,"masterView");
		},
		onSelectNone: function(oEvt){
			
		},
		onSort: function(oEvt){
			
		},
		onFilter: function(oEvt){

		},
		onSelectAllAssets: function(oEvt){
			this.onSelect("myAssets",true);
		},
		onSelectNoneAssets: function(oEvt){
			this.onSelect("myAssets",false);
		},
		onSortAssets: function(oEvt){
			if (!this._oDialogSort) {
				this._oDialogSort = sap.ui.xmlfragment("cl.cgr.everis.developmentsCRGMisActivos.view.AssetsSorts", this);
			}
			this._oDialogSort.setModel(this.getView().getModel("i18n"),"i18n");
			this._oDialogSort.setModel(this.getView().getModel("masterView"),"masterView");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSort);
			this._oDialogSort.open();			
		},
		handleSortConfirm: function (oEvent) {
			var tSort = [];
			var mParams = oEvent.getParameters();
			var sPath = mParams.sortItem.getKey();
			tSort.push(new sap.ui.model.Sorter(sPath, mParams.sortDescending));
			//Buscamos tabla
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var oTable = this.getView().byId(oData.activeTable);
			var oBinding = oTable.getBinding("items");
			oBinding.sort(tSort);
		},
		handleSortCancel: function (oEvent) {

		},
		handleSortRefresh: function (oEvent) {

		},
		onFilterAssets: function(oEvt){
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("cl.cgr.everis.developmentsCRGMisActivos.view.AssetsFilters", this);
			}
			this._oDialog.setModel(this.getView().getModel("i18n"),"i18n");
			this._oDialog.setModel(this.getView().getModel("masterView"),"masterView");
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();			
		},
		handleFilterCancel: function (oEvent) {
		},
		handleFilterConfirm: function (oEvent) {
			var tFilters = [];
			if (oEvent.getParameters().filterString) {
				//Buscamos tabla
				var oModel = this.getView().getModel("masterView");
				var oData = oModel.getData();
				var oTable = this.getView().byId(oData.activeTable);
				//Buscamos filtros
				var vParams = oEvent.getParameters();
				if (vParams.filterItems){
					for (var i = 0; i < vParams.filterItems.length; i++) {
						var sData = vParams.filterItems[i];
						var oFilter = new sap.ui.model.Filter(sData.getParent().getProperty("key"), sap.ui.model.FilterOperator.Contains, sData.getProperty("key"));
						tFilters.push(oFilter);
					}	
				}
				//Guardamos filtro
				this.setValueToViewModel("masterView","dynamicFilters",tFilters);
				//Creamos filtro
				//var oFilter = new sap.ui.model.Filter("ZzubicTecn", sap.ui.model.FilterOperator.Contains, oEvt.getParameter("query"));
				//Aplicamos filtro
				var oBinding = oTable.getBinding("items");
				oBinding.filter(tFilters);	
			}
		},
		handleFilterReset: function(oEvent){
			var tFilters = [];
			//Buscamos tabla
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var oTable = this.getView().byId(oData.activeTable);
			//
			switch (oData.currentTab) {
				case "tabFilter1":
					tFilters = [this._oFilter1,this._oFilter3];
					break;
				case "tabFilter2":
					tFilters = [this._oFilter2];
					break;
				case "tabFilter3":
					tFilters = [this._oFilter5,this._oFilter3];
					break;	
				default:
				tFilters = [];
			}
			//Aplicamos filtro
			var oBinding = oTable.getBinding("items");
			oBinding.filter(tFilters);	
		},
		onSearchLocationAssets: function(oEvt){
			var tInitial = [];
			var tFilter = [];
			var tQuery = [];
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var oTab = this.getView().byId(oData.activeTable);
			var oBinding = oTab.getBinding("items");
			tInitial = JSON.parse(JSON.stringify(oData.initialFilters));
			if(oEvt.getParameter("query") !== ""){
				for (var i = 0; i < oData.myCurrentFilters.length; i++ ){
					var oFilter = new sap.ui.model.Filter(oData.myCurrentFilters[i].field, sap.ui.model.FilterOperator.Contains, oEvt.getParameter("query"));	
					tQuery.push(oFilter);
				}
				tFilter.push( new sap.ui.model.Filter( {filters: tInitial, and: true} ) );
				tQuery = new sap.ui.model.Filter(
					{filters: tQuery, and: false}
				);
				tFilter.push(tQuery);
				oBinding.filter(tFilter);
			}else{
				oBinding.filter(tInitial);
			}
		},
		onTableNavigation: function(oEvent){
			var oSource = oEvent.getSource();
			var vPath = oSource.getBindingContext("masterView").getPath();
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getProperty(vPath);
			if (oData.Activo === "X"){
				var vAnln1 = oData.Anln1;
				//Exportamos datos
				this.exportMasterModel(oData);
				//Llamada a otra vista
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("detail",{
					"objectId": vAnln1 	
				},false);
				this.setValueToCompModel("masterData","showSingleNotif",true);
				this.setValueToCompModel("masterData","showMultiNotif",false);
			}else{
				MessageToast.show(this.getResourceBundle().getText("notActive"));
			}
		},
		exportMasterModel: function(oData){
			var sData = {};
			sData = oData;
			var oCModel = this.getView().getModel("masterView");
			var oCData = oCModel.getData();
			sData.identity = oCData.identity;
			var nModel = new JSONModel();
			nModel.setData(sData);
			this.getOwnerComponent().setModel(nModel,"masterData");			
		},
		onPdfAssets: function(oEvt){
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var vPath = "/AssetsPDFSet";
			var vRut = oData.identity;
			this.onPdf(vPath,vRut);
		},
		onSelectChanged: function(oEvt){
			this.deleteDynamicFiters();
			var vKey = oEvt.getParameter("key");
			switch (vKey) {
				case "tabFilter1":
					this.filterAssetsByTab([this._oFilter1,this._oFilter3],"idAssetsTab","myFilters");
					this.setValueToViewModel("masterView","activeTable","idAssetsTab");
					break;
				case "tabFilter2":
					this.filterAssetsByTab([this._oFilter2],"idLoansTable","myFilters");
					this.setValueToViewModel("masterView","activeTable","idLoansTable");
					break;
				case "tabFilter3":
					this.filterAssetsByTab([this._oFilter5,this._oFilter3],"idRequestsTable","myFiltersSol");
					this.setValueToViewModel("masterView","activeTable","idRequestsTable");
					break;	
				default:
			}
			this.setValueToViewModel("masterView","currentTab",vKey);
		},
		deleteDynamicFiters: function(){
			if (this._oDialog !== undefined){
				var oCustomFilter = this._oDialog.getFilterItems();
				if (oCustomFilter !== undefined){
					oCustomFilter.forEach(function(items) {
						var aItems = items.getItems();
						aItems.forEach(function(item) {
							item.setSelected(false);
						});
					});
				}
			}
		},
		doPostSuccessCallback: function(oData,controller){
			var vMessage = controller.getView().getModel("i18n").getResourceBundle().getText("NotifCreated");
			vMessage = vMessage + " " + oData.IssueId;
			//Reseteamos modelo
			controller.resetViewModel();
			//Mensaje de exito
			controller.showSuccess(vMessage);
		},
		doPostErrorCallback: function(oError,controller){
			if (oError === undefined){
				var vMessage = controller.getView().getModel("i18n").getResourceBundle().getText("GenericError");
				controller.showError(vMessage);
			}else{
				if (oError.response === undefined){
					controller.showError(oError);
				}else{
					if (oError.response.body === undefined){
						controller.showError(oError.response);
					}else{
						if (oError.response.body.message === undefined){
							controller.showError(oError.response.body);
						}else{
							if (oError.response.body.message.value === undefined){
								controller.showError(oError.response.body.message);
							}else{
								controller.showError(oError.response.message.value);
							}
						}
					}	
				}
			}
		},
		OnExcelAssets: function(oEvt){
			var oExport = new Export({
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),
				models : this.getView().getModel("masterView"),
				rows : {
					path : "/myAssets"
				},
				columns : [{
					name : this.getResourceBundle().getText("actCol1"),
					template : {
						content : "{Anln1}"
					}
				}, {
					name : this.getResourceBundle().getText("actCol2"),
					template : {
						content : "{Txt50}"
					}
				},{	
					name : this.getResourceBundle().getText("actCol3"),
					template : {
						content : "{Zzserieampliado}"
					}
				},{
					name : this.getResourceBundle().getText("actCol5"),
					template : {
						content : "{ZzasignaUsu}"
					}
				},{
					name : this.getResourceBundle().getText("actCol6"),
					template : {
						content : "{ZzubicTecn}"
					}	
				},{
					name : this.getResourceBundle().getText("actCol6"),
					template : {
						content : "{Pltxt}"
					}	
				},{
					name : this.getResourceBundle().getText("actCol6"),
					template : {
						content : "{Zzestadotxt}"
					}	
				}]
			});
			this.onExcel(oExport);
		},
		onNotifMult: function(oEvent){
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			var oTab = this.getView().byId(oData.activeTable);
			var oItems = oTab.getItems();
			var tData = JSON.parse(JSON.stringify(oData.myAssets));
			if(oData.currentTab === "tabFilter1"){
				tData = tData.filter( function(item) {
					if (item.Selec === true){
						return item;
					}
				});
				if (tData.length > 0){
					this.setValueToCompModel("masterData","myAssetsSelected",tData);
					this.setValueToCompModel("masterData","showSingleNotif",false);
					this.setValueToCompModel("masterData","showMultiNotif",true);
					//Llamada a otra vista
					var oRouter = this.getOwnerComponent().getRouter();
					oRouter.navTo("notif",{},false);				
				}else{
					MessageToast.show(this.getResourceBundle().getText("notSelected"));
				}
			}	
			else{
				MessageToast.show(this.getResourceBundle().getText("notTab1"));
			}
		}
	});
});