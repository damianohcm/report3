(function() {

    var utilsService;

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

        this.resetError = function() {
            this.errorMsg = undefined;
            this.hasError = false;
        };
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
        addStep: function addStep(args) {
            this.steps.push(new WizardStep(args));
        },

        addSteps: function addSteps(argsItems) {
            for (var i = argsItems.length; --i >= 0;) {
				this.addStep(argsItems[argsItems.length - i - 1]);
			}
        },

        addNavigationItem: function addNavigationItem(args) {
            this.navigationItems.push(new NavigationItem(args));
        },

        addNavigationItems: function addNavigationItems(argsItems) {
            for (var i = argsItems.length; --i >= 0;) {
				this.addNavigationItem(argsItems[argsItems.length - i - 1]);
			}
        },

        setActiveStep: function setActiveStep(step) {
            this.activeStep = step;
            //this.steps.forEach((s) => {
            for (var i = this.steps.length; --i >= 0;) {
                var s = this.steps[i];
                s.isCurrent = s.id === step.id;
                s.isDone = s.id < step.id;
            };

            //this.navigationItems.forEach((n) => {
            for (var i = this.navigationItems.length; --i >= 0;) {
                var n = this.navigationItems[i];
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
            };
        },

        start: function start() {
            this.isComplete = false;
            this.setActiveStep(this.steps[0]);
        },

        restart: function restart() {
            this.isComplete = false;
            this.setActiveStep(this.steps[0]);
        },

        finishStep: function finishStep() {
            this.nextStep();
            // TODO: might have to navigate somewhere else
        },

        cancel: function cancel() {
            utilsService.safeLog('cancel');
            this.close();
        },

        close: function close() {
            // TODO: figure out how to correctly close wizard
        }
    };

    Object.defineProperty(WizardModel.prototype, 'isLastPage', {
        get: function() {
            return this.activeStep.id === this.steps[this.steps.length - 1].id;
        }
    });


    //var _instances = {};
  
    /**
     * @method getService
     * @description 
     * Returns a new service instance
     */
    var getService = function() {
        return new WizardModel();
    };
  
    
    var wizardServiceFactory = function(utils) {
        utilsService = utils;
        return {
            getService: getService
            //destroyService: destroyService
        };
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = wizardServiceFactory;
        }
        exports = wizardServiceFactory;
    } else {
        window.services = window.services || {};
        window.services.wizardServiceFactory = wizardServiceFactory;
    }

}());
