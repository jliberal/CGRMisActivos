/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		'sap/m/MessageToast'
	], function (Controller, History, MessageBox, JSONModel, MessageToast) {
		"use strict";

		return Controller.extend("cl.cgr.everis.developmentsCRGMisActivos.controller.BaseController", {
			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

			/**
			 * Event handler for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sap.ushell.Container){
					var	oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
	
						if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
						history.go(-1);
					} else {
						this.getRouter().navTo("master", {}, true);
					}
				}else{
					history.go(-1);
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
			clearModel: function(vModel){
				var oModel = new JSONModel({});
				this.getView().setModel(oModel,vModel);
			},
			/*
			MIS Métodos compartidos
			JPL
			*/
			setBusyComponent: function(vStatus,vComponent){
				var oComponent = this.getView().byId(vComponent);
				if(oComponent !== undefined){
					if(oComponent.isBusy() !== undefined){
						oComponent.setBusy(vStatus);	
					}
				}
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
			setValueToModel: function(oModel,vField,oValue){
				var oData = oModel.getData();
				oData[vField] = oValue;
				oModel.setData(oData);
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
			}
		});
	}
);