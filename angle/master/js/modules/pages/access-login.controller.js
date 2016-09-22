/**=========================================================
 * Module: access-login.js
 * Demo for login api
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('app.pages', ['ab-base64'])
        .controller('LoginFormController', LoginFormController);

    LoginFormController.$inject = ['$rootScope', '$scope', '$cookieStore', '$http', '$state', '$q', '$localStorage', 'base64', 'permissions'];
    function LoginFormController($rootScope, $scope, $cookieStore, $http, $state, $q, $localStorage, base64, permissions) {
        var vm = this;

        $scope.authCompletedCB = function (fragment) {

            $scope.$apply(function () {

                if (fragment.status == '1' && fragment.gitToken != '' && fragment.ucToken != '') {
                    //根据短token去查询带有权限的token
                    $localStorage.token = fragment.ucToken;
                    $http
                        .get(uc_url + 'user/getLongToken.json')
                        .then(function (response) {
                            if (response.data.status != 1) {
                                vm.authMsg = response.data.msg;
                            } else {
                                document.cookie="kpk="+fragment.gitToken+"; path=/";
                                vm.saveToken(response);
                                // if(isPropertyEmpty(localStorage.getItem('users'))){
                                getAllUser($http,function(users){
                                    localStorage.setItem('users',JSON.stringify(users));
                                });
                                // }
                            }
                        }, function () {
                            vm.authMsg = '登陆服务发生错误，请联系管理员';
                        });
                }else{
                    vm.authMsg = '三方登陆认证失败！';
                }

            });
        }

        activate();

        ////////////////

        function activate() {
            // bind here all data from the form
            vm.account = {};
            // place the message if something goes wrong
            vm.authMsg = '';

            vm.login = function () {
                vm.authMsg = '';

                if (vm.loginForm.$valid) {

                    var loginData = {"username": vm.account.email, "password": vm.account.password};

                    $http
                        .get(uc_url + 'user/login.json?data='+JSON.stringify(loginData))
                        .then(function (response) {
                            if (response.data.status != 1) {
                                vm.authMsg = response.data.msg;
                            } else {
                                vm.saveToken(response);
                                // if(isPropertyEmpty(localStorage.getItem('users'))){
                                getAllUser($http,function(users){
                                    localStorage.setItem('users',JSON.stringify(users));
                                });
                                // }
                            }
                        }, function () {
                            vm.authMsg = '登陆服务发生错误，请联系管理员';
                        });
                }
                else {
                    vm.loginForm.account_email.$dirty = true;
                    vm.loginForm.account_password.$dirty = true;
                }
            };

            vm.gitAuthProvider = function () {

                window.$windowScope = $scope;

                var oauthWindow = window.open(uc_url + 'oauth/authorization_code.json?feedback='+encodeURIComponent(window.location.href.split('#')[0]+'authcomplete.html'), "三方登陆认证", "location=0,status=0,width=600,height=750");
            };

            vm.saveToken = function(response) {
                //登陆成功记录token
                $localStorage.token = response.data.token;
                $localStorage.isAuthenticated = true;
                var tokenArray = $localStorage.token.split('.');
                $localStorage.loginUserInfo = JSON.parse(base64.urldecode(tokenArray[1]));
                $rootScope.user = {
                    id:        $localStorage.loginUserInfo.user.id,
                    name:     $localStorage.loginUserInfo.user.name,
                    job:      $localStorage.loginUserInfo.iss,
                    picture:  $localStorage.loginUserInfo.user.avatarUrl
                };
                permissions.setPermissions($localStorage.loginUserInfo.permissions);
                //记录cookies
                document.cookie="kuid="+$localStorage.loginUserInfo.uid+"; path=/";
                $state.go('app.artist');
            };
        }
    }

})();
