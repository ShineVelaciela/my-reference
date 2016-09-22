'use strict';
angular.module('app.pages').factory('authInterceptorService', ['$q', '$injector', '$location', '$localStorage','$cookies', function ($q, $injector, $location, $localStorage,$cookies) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        if(checkEmpty($cookies.get('kuid'))) $location.path('/page/login'); //如果cookie不存在，重新登录
        // if(!$localStorage.loginUserInfo) $location.path('/page/login'); //如果localstorage用户不存在，重新登录

        config.headers = config.headers || {};
        var authData = $localStorage.token;
        if (authData) {
            config.headers.Authorization = authData;
        }
        return config;
    };

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            //var authService = $injector.get('authService');
            var authData = $localStorage.token;

            if (authData) {
                if (authData.useRefreshTokens) {
                    $location.path('/refresh');
                    return $q.reject(rejection);
                }
            }
            //authService.logOut();
            $location.path('/page/login');
        }
        return $q.reject(rejection);
    };

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);