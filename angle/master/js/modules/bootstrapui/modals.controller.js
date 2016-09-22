/**=========================================================
 * Module: modals.js
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.bootstrapui')
        .controller('ModalController', ModalController);

    ModalController.$inject = ['$modal'];
    function ModalController($modal) {
        var vm = this;

        activate();

        ////////////////

        function activate() {

          vm.open = function (size,type, id) {

            var modalInstance = $modal.open({
              templateUrl: '/myModalContent.html',
              controller: ModalInstanceCtrl,
              size: size,
                resolve: {
                    data: function(){
                        return {type: type, id: id};
                    }
                }
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
              state.text('Modal dismissed with OK status');
            }, function () {
              state.text('Modal dismissed with Cancel status');
            });
          };

          // Please note that $modalInstance represents a modal window (instance) dependency.
          // It is not the same as the $modal service used above.

          ModalInstanceCtrl.$inject = ['$scope', '$modalInstance','CatalogService','$stateParams','data'];
          function ModalInstanceCtrl($scope, $modalInstance,CatalogService,$stateParams,data) {
              if(!checkEmpty(data.type) && data.type == 'catalog'){
                  var promise = CatalogService.service.getCatalogs($stateParams.songId ? $stateParams.songId : data.id);
                  promise.then(function (res) {
                      $scope.autherComposers = res;
                     console.log(res);
                  });
              }
            $scope.ok = function () {
              $modalInstance.close('closed');
            };

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          }
        }
    }

})();
