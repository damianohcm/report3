(function() {

	// create controller
	window.components = window.components || {};
  
    window.components.modalSaveComponent = {
        templateUrl: 'modalSave.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller: function () {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                console.log('modalSaveComponent onInit');
                // $ctrl.items = $ctrl.resolve.items;
                // $ctrl.selected = {
                //     item: $ctrl.items[0]
                // };

                $ctrl.modalData = $ctrl.resolve.data;
            };

            $ctrl.ok = function () {
                console.log('modalSaveComponent ok');
                //$ctrl.close({$value: $ctrl.selected.item});
                $ctrl.close({$value: $ctrl.modalData});
            };

            $ctrl.cancel = function () {
                console.log('modalSaveComponent cancel');
                $ctrl.dismiss({$value: 'cancel'});
            };
        }
    };

}());
