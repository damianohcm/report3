(function() {

	// create controller
	window.components = window.components || {};
  
    window.components.modalConfirmComponent = {
        templateUrl: 'modalConfirm.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller: function () {
            var $modal = this;

            $modal.$onInit = function () {
                //console.log('modalConfirmComponent onInit');
                $modal.data = $modal.resolve.data;
            };

            $modal.ok = function () {
                //console.log('modalConfirmComponent ok');

                $modal.close({
                    $value: 'ok'
                });
            };

            $modal.cancel = function () {
                //console.log('modalConfirmComponent cancel');
                $modal.dismiss({
                    $value: 'cancel'
                });
            };
        }
    };

}());
