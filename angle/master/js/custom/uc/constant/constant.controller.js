/**
 * Created by YuChunzhuo-Dev on 2016/8/8.
 */
(function(){
    'use strict';
    angular.module('app.routes').config(ConstantConfig);
    ConstantConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function ConstantConfig($stateProvider, helper){
        $stateProvider
            .state('app.constant',{
                url:'/constant',
                templateUrl: helper.basepath('uc/constant/constant.html')
            })
            .state('app.constant.list',{
                url:'/list?pageSize&:pageNo',
                title: '后台任务-系统常量',
                views:{
                    'page':{
                        templateUrl: helper.basepath('uc/constant/constant-list.html'),
                        controller: 'ConstantListController'
                    }
                }
            })
            .state('app.constant.edit',{
                url:'/edit?:key&:readonly',
                views:{
                    'page':{
                        templateUrl: helper.basepath('uc/constant/constant-edit.html'),
                        controller: 'ConstantEditController'
                    }
                }
            })
    };

    angular.module('app.routes').controller('ConstantListController', ['$scope', '$stateParams', 'ConstantService', 'SweetAlert',function($scope, $stateParams, ConstantService, SweetAlert){
        ConstantService.method.getDatas($scope, $stateParams);
        $scope.deleteData = function(data){
            if(data.config){
                sweetAlertConfirm(SweetAlert, function(){
                    ConstantService.method.deleteData(data.config);
                });
            }
        }
    }]);
    angular.module('app.routes').controller('ConstantEditController', ['$scope', '$stateParams', '$state', 'ConstantService', 'SweetAlert',function($scope, $stateParams, $state, ConstantService, SweetAlert){
        $scope.readonly = $stateParams.readonly;
        if($stateParams.key){
            ConstantService.method.detailData($scope, $stateParams.key);
        }
        $scope.submit = function(data){
            sweetAlertConfirm(SweetAlert, function() {
                ConstantService.method.saveData(data, $state);
            });
        };
    }]);
})();