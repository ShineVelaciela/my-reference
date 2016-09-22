/**
 * Created by YuChunzhuo-Dev on 2016/8/22.
 */
(function(){
    'use strict';
    angular.module('app.routes').config(RegularConfig);
    RegularConfig.$inject = ['$stateProvider','RouteHelpersProvider'];
    function RegularConfig($stateProvider, helper){
        $stateProvider
            .state('app.regular', {
                url:'/regular',
                templateUrl: helper.basepath('uc/regular/regular.html')
            })
            .state('app.regular.list', {
                url:'/list?:triggerName&:pageSize&:pageNo',
                title: '后台任务-定时任务',
                views:{
                    'page':{
                        templateUrl: helper.basepath('uc/regular/regular-list.html')
                    }
                }
            })
            .state('app.regular.edit', {
                url:'/edit?:taskId&:readonly',
                views:{
                    'page':{
                        templateUrl: helper.basepath('uc/regular/regular-edit.html')
                    }
                }
            })
    }

    angular.module('app.routes').controller('RegularListController', ['$scope', '$stateParams', 'RegularService', 'SweetAlert',function($scope, $stateParams, RegularService, SweetAlert){
        $scope.form = inherit($stateParams);
        RegularService.method.getDatas($scope, $stateParams);
        $scope.deleteData = function(data){
            if(!!data.taskId){
                sweetAlertConfirm(SweetAlert, function () {
                    RegularService.method.deleteData(data.taskId);
                }, "", "是否确定删除该条数据");
            }
        };
        $scope.enableOrDisable = function(data){
            if(!!data && !!data.taskId){
                var option = {0: "启用", 1: "禁用"}[data.state];
                sweetAlertConfirm(SweetAlert, function () {
                    RegularService.method.enableOrDisable(data.state ^ 1, data.taskId);
                }, "", "是否确定" + option + "此后台任务")
            }
        }
    }]);

    angular.module('app.routes').controller('RegularEditController', ['$scope', '$state', '$stateParams', 'RegularService', 'SweetAlert',function($scope, $state, $stateParams, RegularService, SweetAlert){
        $scope.readonly = $stateParams.readonly;
        $scope.dataSources = [{key: "1", value: "统一CMS"},{key: "2", value: "媒资库运营"},{key: "3", value: "产品库"}];
        if($stateParams.taskId){
            RegularService.method.detailData($scope, $stateParams.taskId);
        }
        $scope.submit = function(data){
            sweetAlertConfirm(SweetAlert, function() {
                RegularService.method.saveData(data, $state);
            });
        };
    }]);
})();