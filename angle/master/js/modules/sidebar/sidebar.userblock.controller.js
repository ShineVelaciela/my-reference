(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('UserBlockController', UserBlockController);

    UserBlockController.$inject = ['$rootScope','SweetAlert','$state','$localStorage'];
    function UserBlockController($rootScope,SweetAlert,$state,$localStorage) {

        activate();

        ////////////////

        function activate() {
          /*$rootScope.user = {
            name:     'John',
            job:      'ng-developer',
            picture:  'app/img/user/02.jpg'
          };*/
            $rootScope.user = {
                id:        $localStorage.loginUserInfo.user.id,
                name:     $localStorage.loginUserInfo.user.name,
                job:      $localStorage.loginUserInfo.iss,
                picture:  $localStorage.loginUserInfo.user.avatarUrl
            };

          // Hides/show user avatar on sidebar
          $rootScope.toggleUserBlock = function(){
            $rootScope.$broadcast('toggleUserBlock');
          };

          // Hides/show user avatar on sidebar
          $rootScope.logout = function(){
              SweetAlert.swal({
                  title: '确认要退出系统？',
                  text: '在退出系统之前，请确保你的所有操作都已提交！',
                  type: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#DD6B55',
                  confirmButtonText: '确认退出',
                  cancelButtonText: '取消'
              },  function(isConfirm){
                  if(isConfirm){
                      //登陆成功记录token
                      $localStorage.token = undefined;
                      $localStorage.isAuthenticated = false;
                      $localStorage.loginUserInfo = undefined;
                      $rootScope.user = undefined;
                      $state.go('page.login');
                  }
              });

          };

          $rootScope.userBlockVisible = true;
          
          $rootScope.$on('toggleUserBlock', function(/*event, args*/) {

            $rootScope.userBlockVisible = ! $rootScope.userBlockVisible;
            
          });
        }
    }
})();
