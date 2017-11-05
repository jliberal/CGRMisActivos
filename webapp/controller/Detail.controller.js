sap.ui.define([
	"cl/cgr/everis/developmentsCRGMisActivos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(BaseController, JSONModel, Device) {
	"use strict";
	return BaseController.extend("cl.cgr.everis.developmentsCRGMisActivos.controller.Detail", {
		onInit : function () {
			//Creamos el modelo de la vista
			this.createModel();
			//Buscamos modelo de combo notificación
			this.setBusyComponent(true,"cbNotif");
			this.readService("/MisActivosTipSolSet",this.doNotifCBoxModelCallback,[]);
		},
		doNotifCBoxModelCallback: function (oData,controller){
			controller.setValueToViewModel("detailView","notifType",oData.results);
			controller.setBusyComponent(false,"cbNotif");
		},
		doCauseCBoxModelCallback: function(oData,controller){
			controller.setValueToViewModel("detailView","causeType",oData.results);
			controller.setBusyComponent(false,"cbCause");
		},
		onSelectionNotif: function(oEvent){
			var oSource = oEvent.getSource();
			var vNotif = oSource.getSelectedKey();
			this.setValueToViewModel("detailView","notifTypeSelected",vNotif);
			//Buscamos Motivo
			var oFilter1 = new sap.ui.model.Filter("IvTipsol", sap.ui.model.FilterOperator.EQ, vNotif);
			this.setBusyComponent(true,"cbCause");
			this.readService("/MisActivosMotSolSet",this.doCauseCBoxModelCallback,[oFilter1]);
		},
		onSelectionCause: function(oEvent){
			var oSource = oEvent.getSource();
			var vCause = oSource.getSelectedKey();
			this.setValueToViewModel("detailView","notifCauseSelected",vCause);
		},
		doNotification: function(oEvent){
			if (this.validateNotification()){
				
			}
		},
		validateNotification: function(){
			var oData = this.getView().getModel("detailView").getData();
			if (oData.notifTypeSelected.length === 0) {
				this.showError(this.getResourceBundle().getText("notifError1"));
				return false;
			}else{
				if (oData.notifCauseSelected.length === 0) {
					this.showError(this.getResourceBundle().getText("notifError2"));
					return false;
				}else{
					if (oData.notifText.length === 0) {
						this.showError(this.getResourceBundle().getText("notifError3"));
						return false;
					}else{
						return true;
					}	
				}	
			}
		},
		onNavBackFromDetail: function(oEvt){
			//Borramos modelo
			var oModel = this.getView().getModel("detailView");
			var oData = oModel.getData();
			oData.notifText = "";
			oData.notifTypeSelected = "";
			oData.notifCauseSelected = "";
			oModel.setData(oData);
			this.getView().setModel(oModel,"detailView");
			//Borramos combos
			var cb1 = this.getView().byId("cbNotif");
			cb1.setSelectedKey("");
			var cb2 = this.getView().byId("cbCause");
			cb2.setSelectedKey("");
			//Navegamos de regreso
			this.onNavBack();
		},
		createModel: function(){
			var sData = {};
			sData.notifText = "";
			sData.notifTypeSelected = "";
			sData.notifCauseSelected = "";
			var oModel = new JSONModel();
			oModel.setData(sData);
			this.getView().setModel(oModel,"detailView");
		}
	});
});