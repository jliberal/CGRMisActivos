sap.ui.define([
	"cl/cgr/everis/developmentsCRGMisActivos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, JSONModel,MessageToast,MessageBox) {
	"use strict";

	return BaseController.extend("cl.cgr.everis.developmentsCRGMisActivos.controller.Solicit", {
		onInit: function(){
			//Creamos el modelo de la vista
			this.createModel();
			//Buscamos modelo de combo notificación
			this.setBusyComponent(true,"cbNotif");
			this.readService("/MisActivosTipSolSet",this.doNotifCBoxModelCallback,[]);
			
			this.getOwnerComponent().getRouter().getRoute("solicit").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched : function (oEvent) {
		},
		setBusyComponent: function(vStatus,vComponent){
			var oComponent = this.getView().byId(vComponent);
			if(oComponent !== undefined){
				if(oComponent.isBusy() !== undefined){
					oComponent.setBusy(vStatus);	
				}
			}
		},
		onNavBackFromSolicit: function(oEvt){
			var oModel = this.getView().getModel();
			this.clearView(oModel);
			//Navegamos de regreso
			this.onNavBack();
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
		setValueToModel: function(oModel,vField,oValue){
			var oData = oModel.getData();
			oData[vField] = oValue;
			oModel.setData(oData);
		},
		setValueToViewModel: function(vModel,vField,oValue){
				var oModel = this.getView().getModel(vModel);
				if (!oModel){
					oModel = new JSONModel();
					this.setValueToModel(oModel,vField,oValue);	
					this.getView().setModel(oModel, vModel);
				}else{
					this.setValueToModel(oModel,vField,oValue);
					this.getView().setModel(oModel, vModel);
				}
		},
		setValueToCompModel: function(vModel,vField,oValue){
			var oModel = this.getOwnerComponent().getModel(vModel);
			if (!oModel){
				oModel = new JSONModel();
				this.setValueToModel(oModel,vField,oValue);	
				this.getOwnerComponent().setModel(oModel,vModel);
			}else{
				this.setValueToModel(oModel,vField,oValue);	
				this.getOwnerComponent().setModel(oModel,vModel);
			}
		},
		showServiceError: function(vError){
			var vText = this.getResourceBundle().getText("errorText");
			MessageBox.error(vText,{
				id : "metadataErrorMessageBox",
				details: vError,
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				actions: [MessageBox.Action.CLOSE],
				onClose: function (sAction) {
				}.bind(this)
			});
		},
		showError: function(vMesg){
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				vMesg,
				{
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},
		showSuccess: function(vMessage){
			MessageToast.show(vMessage);
		},
		readService: function(ivPath, callBack, filters){
			var that = this;
			//var sServiceUrl = "/destinations/Contraloria/sap/opu/odata/SAP/ZFI_AF_INST_ASSETS_ALL_SRV/";
			//var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var oModel = this.getOwnerComponent().getModel();
			oModel.setHeaders({
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0",
				"Accept": "application/json; charset=utf-8"
			});
			oModel.read(ivPath,{
				filters: filters,
				success: function (oData, response){
					callBack(oData, that);
				},
				error: function (oError){
					that.showServiceError(oError.response);
				}
			});
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
						if (oData.assetnum.length === 0) {
							this.showError(this.getResourceBundle().getText("notifError4"));
							return false;
						}else{
							if (oData.assetname.length === 0) {
								this.showError(this.getResourceBundle().getText("notifError5"));
								return false;
							}else{
							if (oData.assetSerial.length === 0) {
									this.showError(this.getResourceBundle().getText("notifError6"));
									return false;
								}else{
									return true;
								}
							}
						}
					}	
				}	
			}
		},		
		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		onSolButton: function(oEvt){
			if( this.validateNotification() === true){
				this.doNotification(oEvt);
			}
		},
		onClearButton: function(oEvt){
			this.clearView(this.getView().getModel("detailView"));
		},
		createModel: function(){
			var sData = {};
			sData.notifText = "";
			sData.notifTypeSelected = "";
			sData.notifCauseSelected = "";
			sData.assetnum = "";
			sData.assetname = "";
			sData.assetSerial = "";
			//Buscamos RUT
			//oData.identity = this.getIdentity();
			var oModel = new JSONModel(sData);
			this.clearView(oModel);
		},
		clearView: function(oModel){
			var sData = oModel.getData();
			if (sData){
				sData.notifText = "";
				sData.notifTypeSelected = "";
				sData.notifCauseSelected = "";
				sData.assetnum = "";
				sData.assetname = "";
				sData.assetSerial = "";
				oModel.setData(sData);
				this.getView().setModel(oModel,"detailView");
			}
			//Borramos combos
			var cb1 = this.getView().byId("cbNotif");
			cb1.setSelectedKey("");
			var cb2 = this.getView().byId("cbCause");
			cb2.setSelectedKey("");			
		},
		doNotification: function(oEvent){
		var lvPath = "/MisActivosCreaSolSet";
			var oModelI = this.getOwnerComponent().getModel("identityModel");
			var oDataI = oModelI.getData();		
			var oModelH = this.getView().getModel("detailView");
			var oDataH = oModelH.getData();
			var oNotif = {};
			//oNotif.SolNotif = [];
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
				oItems.Anln1				= "";
				oItems.Txt50				= "";
				oItems.Zzserieampliado		= "";
				oItems.Zzrut				= oDataI.Rut;
				oItems.ZzasignaUsu			= "";
				oItems.Fecasig				= "";
				oItems.ZzubicTecn			= "";
				oItems.Pltxt				= "";
				oItems.Zzestado				= "";
				oItems.Zzestadotxt			= "";
				oItems.Zzdependencia		= "";
				oItems.Zestado				= "";
				oItems.Zestadotxt			= "";
				oItems.Zsolucion			= "";
				oItems.Tabsalida			= "";
				oItems.Activo				= "";
				oItems.Selec				= "";
				//oNotif.SolNotif.push(oItems);
			//Data
			oNotif.Zdescripcion			= oDataH.notifText;
			oNotif.IvRut				= oDataI.Rut;
			oNotif.Znotifica			= oDataH.notifTypeSelected;
			oNotif.Zmotivo				= oDataH.notifCauseSelected;
			oNotif.Zdescripbien			= oDataH.assetname;
			oNotif.Znrobien				= oDataH.assetnum;	
			oNotif.Znroserie			= oDataH.assetSerial;
			oNotif.Zusuario				= oDataI.uname;
			//Posteamos
			this.executePostModel(lvPath,oNotif,this.doPostSuccessCallback,this.doPostErrorCallback);
		},
		executePostModel: function(lvPath,vData,CallBackS,CallBackE){
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oModel.setHeaders({
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0",
				"Accept": "application/json; charset=utf-8",
				
			});	
			oModel.create(lvPath, vData, null, 
				function(oData,oResponse){
					that.setBusy(false);
					CallBackS(oData, that);
				},
				function(oError){
					that.setBusy(false);
					CallBackE(oError, that);
				}
			);				
		},
		doPostSuccessCallback: function(oData,controller){
			var vMessage = controller.getView().getModel("i18n").getResourceBundle().getText("NotifCreated");
			vMessage = vMessage + " " + oData.IssueId;
			//Reseteamos modelo
			controller.clearView(controller.getView().getModel("detailView"));
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
		}
	});
});