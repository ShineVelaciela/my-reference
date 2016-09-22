/**=========================================================
 * Module: access-register.js
 * Demo for register account api
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('RegisterFormController', RegisterFormController);

    RegisterFormController.$inject = ['$http', '$state'];
    function RegisterFormController($http, $state) {
        var vm = this;

        activate();

        ////////////////

        function activate() {
          // bind here all data from the form
          vm.account = {};
          // place the message if something goes wrong
          vm.authMsg = '';
            
          vm.register = function() {
            vm.authMsg = '';

            if(vm.registerForm.$valid) {

              var dataParameter = {"username":vm.account.email,"password":vm.account.password};

              $http
                .jsonp(uc_url + 'user/register.json?callback=JSON_CALLBACK&data='+JSON.stringify(dataParameter))
                .then(function(response) {
                      console.log(response.data.status);
                  // assumes if ok, response is an object with some data, if not, a string with error
                  // customize according to your api
                  if ( response.account != 1 ) {
                      vm.authMsg = response.data.msg;
                  }else{
                    //$state.go('app.dashboard');
                  }
                }, function() {
                  vm.authMsg = 'Server Request Error';
                });
            }
            else {
              // set as dirty if the user click directly to login so we show the validation messages
              /*jshint -W106*/
              vm.registerForm.account_email.$dirty = true;
              vm.registerForm.account_password.$dirty = true;
              vm.registerForm.account_agreed.$dirty = true;
              
            }
          };
        }
    }
})();
