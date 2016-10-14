(function() {

    var serviceInstances = {};

    /* private */
    var undoItemProperty = function(item, propertyName, oldValue) {
        item[propertyName] = oldValue;
    };

    /* private */
    var undoAction = function(action, isDetailView) {
        var item = action.item;

        _.each(action.properties, function(prop) {
            if (action.type === 'column') {
                // in detail view, undo all properties
                if (isDetailView) {
                    undoItemProperty(action.item, prop.name, prop.oldValue);
                } else {
                    // in top level view, undo only show when isGroup, and only calculate when isChild
                    if (item.isGroup) {
                        undoItemProperty(action.item, prop.name, prop.oldValue);
                    } else if (item.isChild && prop.name === 'calculate') {
                        undoItemProperty(action.item, prop.name, prop.oldValue);
                    }
                }
                
            } else {
                undoItemProperty(action.item, prop.name, prop.oldValue);
            }
        });
    };

    /**
     * @class ServiceModel
     * Blueprint used to create instances of undo service.
     */
    var ServiceModel = function() {

        this.undoState = []; /* this is to keep track of the changes */

        /**
         * @method addState
         * @dscription
         * Add a state item to the undo history state
         */
        this.addState = function(stateItem) {
            this.undoState.push(stateItem);
        }.bind(this);
        
        /**
         * @method undoLastAction
         * @dscription
         * Revert the last action
         */
        this.undoLastAction = function(isDetailView) {
            var action = this.undoState.pop();
            undoAction(action, isDetailView);
            return action;
        }.bind(this);

        /**
         * @method undoAllActions
         * @dscription
         * Revert all actions
         */
        this.undoAllActions = function(isDetailView) {
            while (this.undoState.length > 0) {
                this.undoLastAction(isDetailView);
            }
        }.bind(this);

        // /**
        //  * @method purgeColumnsFromHistory
        //  * @dscription
        //  * Removes columns from undo history
        //  */
        // this.purgeColumnsFromHistory = function() {
        //     var purgedState = [];
        //     _.each(this.undoState, function(action) {
        //         // only purge columns for which property changed is not 'calculate'
        //         if (action.type === 'column') {
        //             var hasCalculate = _.some(action.properties, function(p) {
        //                 return p.name === 'calculate';
        //             });

        //             if (hasCalculate) {
        //                 action.properties = _.filter(action.properties, function(p) {
        //                     return p.name !== 'calculate';
        //                 });
                        
        //                 _.each(action.properties, function(prop) {
        //                     undoItemProperty(action.item, prop.name, prop.oldValue);
        //                     action.msg = 'Hide column ' + action.item.name;
        //                 });

        //                 purgedState.push(action);
        //             } else {
        //                 undoAction(action);
        //             }
        //         } else {
        //             purgedState.push(action);
        //         }
        //     });

        //     this.undoState = purgedState;
        // }.bind(this);

        /**
         * @method stateExists
         * @dscription
         * Checks if undoState contains a state item by item and action property
         */
        this.stateExists = function(item, prop) {
            var action = _.find(this.undoState, function(state) {
                return state.item === item;
            });

            if (action) {
                var hasProp = _.find(action.properties, function(p) {
                    return p.name === prop;
                });

                return hasProp !== undefined;
            } else {
                return false;
            }
        }.bind(this);


		/**
         * @method purgeAction
         * @dscription
         * Purges a specific aciton property from the undoState
         */
        this.purgeAction = function(item, prop) {
            var action = _.find(this.undoState, function(state) {
                return state.item === item;
            });

            if (action) {
                var purgedState = [];
                _.each(this.undoState, function(state) {
                    if (state.item === item) {
                        var hasProp = _.find(state.properties, function(p) {
                            return p.name === prop;
                        });

                        // if has more than one property, keep in the undoState bu tpurge only the property
                        if (hasProp && state.properties.length > 1) {

                            state.properties = _.filter(state.properties, function(p) {
                                return p.name !== prop;
                            });

                            purgedState.push(state);
                        };
                    }
                });
                this.undoState = purgedState;
            }
        }.bind(this);

        /**
         * @method getLastActionMessage
         * @dscription
         * Get the last action message
         */
        this.getLastActionMessage = function() {
            if (this.undoState && this.undoState.length > 0) {
                var lastAction = this.undoState[this.undoState.length - 1];
                if (lastAction.msg) {
                    return lastAction.msg;
                } else {
                    return lastAction.properties[0] + ' ' + lastAction.type + ' ' + lastAction.item.name;
                }
            } else {
                return 'Nothing do undo';
            }
        }.bind(this);
    };

    /**
     * @method getService
     * @description 
     * Returns a service instance associated with a controller (using a controll key)
     */
    var getService = function(controllerKey) {
        // singleton, do not recreate instance ifit already exists
        if (!serviceInstances[controllerKey]) {

            // create service instance
            var serviceInstance = new ServiceModel();
            
            // save instance
            serviceInstances[controllerKey] = serviceInstance;

            return serviceInstance;
        } else {
            return serviceInstances[controllerKey];
        }
    };
  
    // service to be exported to angular
	window.services = window.services || {};
  
    window.services.serviceFactory = function() {
        return {
            getService: getService
        };
    };

}());
