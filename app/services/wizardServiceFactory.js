(function() {

    // service to be exported to angular
	window.services = window.services || {};

    /**
     * @class WizardStep
     * Blueprint representing a single wizard step.
     */
    var WizardStep = function(args) {
        this.id = args.id;
        this.title = args.title;
        this.path = args.path;

        this.isFirst = args.isFirst;
        this.isLast = args.isLast;
        this.isCurrent = args.isCurrent;
        this.isDone = args.isDone;
        this.hasError = args.hasError;

        this.validateAction = args.validateAction;
        this.errorMsg = undefined;
    };

    WizardStep.prototype = {
        get liClass() {
            var css  = this.isFirst ? 'first ' : this.isLast ? 'last ' : '';

            if (this.isCurrent) {
                css += 'current';
            } else if (this.isDone) {
                css += 'done';
            } else {
                css += 'disabled';
            }

            if (this.hasError) {
                css += ' error';
            }

            return css.trim();
        }
    };

    /**
     * @class NavigationItem
     * Blueprint representing a navigation item.
     */
    var NavigationItem = function(args) {
        this.id = args.id;
        this.key = args.key;
        this.title = args.title;
        this.isActive = args.isActive;
        this.additionalCss = args.additionalCss;
        this.action = args.action;
    };

    NavigationItem.prototype = {
        get cssClass() {
            return ((!this.isActive ? 'disabled' : '').trim() + (this.additionalCss ? ' ' + this.additionalCss : '')).trim();
        }
    };

    /**
     * @class WizardModel
     * Blueprint used to create instances of Wizard.
     */
    var WizardModel = function() {
        this.steps = [];
        this.navigationItems = [];
        this.activeStep = undefined;
    };

    WizardModel.prototype = {
        addStep (args) {
            this.steps.push(new WizardStep(args));
        },

        addSteps (argsItems) {
            for (var i = argsItems.length; --i >= 0;) {
				this.addStep(argsItems[argsItems.length - i - 1]);
			}
        },

        addNavigationItem (args) {
            this.navigationItems.push(new NavigationItem(args));
        },

        addNavigationItems (argsItems) {
            for (var i = argsItems.length; --i >= 0;) {
				this.addNavigationItem(argsItems[argsItems.length - i - 1]);
			}
        },

        setActiveStep(step) {
            this.activeStep = step;
            this.steps.forEach((s) => {
                s.isCurrent = s.id === step.id;
                s.isDone = s.id < step.id;
            });

            this.navigationItems.forEach((n) => {
                if (n.key === 'cancel') {
                    n.isActive = true;
                } else if (n.key === 'prev') {
                    n.isActive = !step.isFirst;
                } else if (n.key === 'next') {
                    n.isActive = !step.isLast;
                } else if (n.key === 'finish') {
                    n.isActive = step.isLast;
                } else {
                    n.isActive = false;
                }
            });
        },

        start() {
            this.isComplete = false;
            this.setActiveStep(this.steps[0]);
        },

        restart() {
            this.isComplete = false;
            this.setActiveStep(this.steps[0]);
        },

        finishStep() {
            this.nextStep();
            // TODO: might have to navigate somewhere else
        },

        cancel() {
            console.log('cancel');
            this.close();
        },

        close() {
            // TODO: figure out how to correctly close wizard
        },

        get isLastPage() {
            return this.activeStep.id === this.steps[this.steps.length - 1].id;
        }
    };


    //var _instances = {};
  
    /**
     * @method getService
     * @description 
     * Returns a service instance associated with a controller (using a controll key)
     */
    var getService = function(controllerKey) {
        // // singleton, do not recreate instance ifit already exists
        // if (!_instances[controllerKey]) {

        //     // create service instance
        //     var instance = new WizardModel();
            
        //     // save instance
        //     _instances[controllerKey] = instance;

        //     return instance;
        // } else {
        //     return _instances[controllerKey];
        // }

        return new WizardModel();
    };
  
    window.services.wizardServiceFactory = function() {
        return {
            getService: getService
            //destroyService: destroyService
        };
    };

}());
