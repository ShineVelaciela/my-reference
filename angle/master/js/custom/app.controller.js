(function() {
    'use strict';

    angular
        .module('app.routes')
        .controller('AppController', AppController);

    AppController.$inject = ['$rootScope', '$scope', '$state','$localStorage'];
    function AppController($rootScope, $scope, $state,$localStorage) {
        if(!$localStorage.loginUserInfo) $state.go('page.login');
        //$scope.app.layout.theme = 'app/css/theme-e.css';
        $rootScope.pageTitle = function () {
            return $state.current.title;
        }();
    }
})();