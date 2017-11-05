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
			//Leemos Servicio en préstamo
			//this.readService(vPath,this.doLoanModelCallback,[oFilter4,oFilter2]);
			//Leemos Servicios para el count
			var vPathCount = "/MisActivosSolSet/$count";
			this.readService(vPathCount,this.doCountAssetsModelCallback,[this._oFilter4,this._oFilter1,this._oFilter3]);
			this.readService(vPathCount,this.doCountLoansModelCallback,[this._oFilter4,this._oFilter2]);
			//Leemos servicio mis Activos
			this.setBusyComponent(true,"idAssetsTab");
			this.readService(vPath,this.doAssetsModelCallback,[this._oFilter4]);
			//Creamos modelo de filtros
			this.createFilterModel();
		},
		filterAssetsByTab: function(oFilter,vTab){
			var tFilter = JSON.parse(JSON.stringify(oFilter));
			var oTab = this.getView().byId(vTab);
			if (oTab !== undefined){
				var oBinding = oTab.getBinding("items");
				oBinding.filter(tFilter);
				//oTab.getBinding("rows").applyFilter();
				//oBinding.applyFilter();
			}
		},
		createFilterModel: function(){
			var tFilters = [
				{value: 0, field:"Anln1",text:this.getResourceBundle().getText("actCol1"), items:[]},
				{value: 1, field:"Txt50", text:this.getResourceBundle().getText("actCol2"), items:[]},
				{value: 2, field:"Zzserieamdo", text:this.getResourceBundle().getText("actCol3"), items:[]},
				{value: 3, field:"ZzasignaUsu", text:this.getResourceBundle().getText("actCol4"), items:[]},
				{value: 4, field:"ZzubicTecn", text:this.getResourceBundle().getText("actCol5"), items:[]},
				{value: 5, field:"Pltxt", text:this.getResourceBundle().getText("actCol6"), items:[]},
				{value: 6, field:"Zzestadotxt", text:this.getResourceBundle().getText("actCol7"), items:[]}
			];
			var oModel = this.getView().getModel("masterView");
			var oData = oModel.getData();
			oData.myFilters = tFilters;
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
			oMData.myAssetsFilters = controller.getAssetsFilters(oData.results,oMData.myFilters,controller);
			//Actualizamos modelo
			oModel.setData(oMData);
			controller.getView().setModel(oModel,"masterView");
			controller.setBusyComponent(false,"idAssetsTab");
			//Aplicar filtro inicial
			controller.filterAssetsByTab([controller._oFilter1,controller._oFilter3],"idAssetsTab");
		},
		doCountAssetsModelCallback: function(oData,controller){
			controller.setValueToViewModel("masterView","myAssetsCount",oData);
		},
		doCountLoansModelCallback: function(oData,controller){
			controller.setValueToViewModel("masterView","myLoansCount",oData);
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
		getAssetsFilters: function(tData,tabFilters,controller){
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
		},
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
			var oCustomFilter = this._oDialog.getFilterItems()[0];
			if (this.filterPreviousValue !== this.filterResetValue) {
				oCustomFilter.setFilterCount(1);
				oCustomFilter.setSelected(true);
			} else {
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);
			}
		},
		handleFilterConfirm: function (oEvent) {
			var tFilters = [];
			if (oEvent.getParameters().filterString) {
				//MessageToast.show(oEvent.getParameters().filterString);
				//Buscamos tabla
				var oTable = this.getView().byId("myAssetsTab");
				//Buscamos filtros
				var vParams = oEvent.getParameters();
				if (vParams.filterItems){
					for (var i = 0; i < vParams.filterItems.length; i++) {
						var sData = vParams.filterItems[i];
						var oFilter = new sap.ui.model.Filter(sData.getParent().getProperty("key"), sap.ui.model.FilterOperator.Contains, sData.getProperty("key"));
						tFilters.push(oFilter);
					}	
				}
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
			var oTable = this.getView().byId("myAssetsTab");
			//Aplicamos filtro
			var oBinding = oTable.getBinding("items");
			oBinding.filter(tFilters);	
		},
		onSearchLocationAssets: function(oEvt){
			
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
			var vKey = oEvt.getParameter("key");
			switch (vKey) {
				case "tabFilter1":
					this.filterAssetsByTab([this._oFilter1,this._oFilter3],"idAssetsTab");
					break;
				case "tabFilter2":
					this.filterAssetsByTab([this._oFilter2],"idLoansTable");
					break;
				default:
			}
			this.setValueToViewModel("masterView","currentTab",vKey);
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
		}
	});
});