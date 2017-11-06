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
			var lvPath = "/MisActivosCreaSolSet";
			if (this.validateNotification()){
				var oModel = this.getOwnerComponent().getModel("masterData");
				var oData = oModel.getData();
				var oModelH = this.getView().getModel("detailView");
				var oDataH = oModelH.getData();
				var oNotif = {};
				oNotif.SolNotif = [];
				if(oData.showSingleNotif === true){
					var oItems = {};
					oItems.Znotifica			= "";
					oItems.Znotiftxt			= "";
					oItems.Zfenvio				= "";
					oItems.Zperiodo				= "";
					oItems.Zperitxt				= "";
					oItems.Zanio				= "";
					oItems.ZnroSolic			= "";
					oItems.Zmotivo				= "";
					oItems.Zmottxt				= "";
					oItems.Anln1				= oData.Anln1;
					oItems.Txt50				= oData.Txt50;
					oItems.Zzserieampliado		= oData.Zzserieampliado;
					oItems.Zzrut				= oData.identity;
					oItems.ZzasignaUsu			= oData.ZzasignaUsu;
					oItems.Fecasig				= oData.Fecasig;
					oItems.ZzubicTecn			= oData.ZzubicTecn;
					oItems.Pltxt				= oData.Pltxt;
					oItems.Zzestado				= oData.Zestadotxt;
					oItems.Zzestadotxt			= "";
					oItems.Zzdependencia		= "";
					oItems.Zestado				= "";
					oItems.Zestadotxt			= "";
					oItems.Zsolucion			= "";
					oItems.Tabsalida			= "";
					oItems.Activo				= "";
					oItems.Selec				= "";
					oNotif.SolNotif.push(oItems);
				}else if(oData .showMultiNotif === true){
					oNotif.SolNotif = JSON.parse(JSON.stringify(oData.myAssetsSelected));
				}
				//Data
				oNotif.Zdescripcion			= oDataH.notifText;
				oNotif.IvRut				= oData.identity;
				oNotif.Znotifica			= oDataH.notifTypeSelected;
				oNotif.Zmotivo				= oDataH.notifCauseSelected;
				oNotif.Zdescripbien			= "";
				oNotif.Znrobien				= "";	
				oNotif.Znroserie			= "";
				oNotif.Zusuario				= "";
				//Posteamos
				this.executePostModel(lvPath,oNotif,this.doPostSuccessCallback,this.doPostErrorCallback);
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
		resetViewModel: function(){
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
			this.resetViewModel();
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