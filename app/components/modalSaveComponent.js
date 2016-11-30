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
            var $modal = this;

            Object.defineProperty($modal, 'reportNameCss', {
                get: function() {
                    return ($modal.data.reportName || '').trim().length === 0 ? 'required' : '';
                }
            });

            $modal.$onInit = function () {
                //console.log('modalSaveComponent onInit');
                $modal.data = $modal.resolve.data;
            };

            $modal.ok = function () {
                //console.log('modalSaveComponent ok', $modal.data);

                $modal.data.reportName = ($modal.data.reportName || '').trim();
                if ($modal.data.reportName.length === 0) {
                    alert('Report Name is required');
                } else {
                    $modal.close({
                        $value: $modal.data
                    });
                }
            };

            $modal.cancel = function () {
                //console.log('modalSaveComponent cancel');
                $modal.dismiss({
                    $value: 'cancel'
                });
            };
        }
    };

}());
