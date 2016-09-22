/**
 * Created by hao.cheng on 2016/8/2.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(CatalogTaskConfig);
    CatalogTaskConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function CatalogTaskConfig($stateProvider, helper) {
        $stateProvider
            .state('app.catalogTask',{
                url: '/catalogTask',
                title: '手动编目工单',
                views: {
                    '': {
                        templateUrl: helper.basepath('uc-catalogtask/catalogtask-head.html'),
                        controller: 'CatalogTaskHeadCtrl'
                    }
                }
            })
            .state('app.catalogTask.module', {
                url: '/module?:module&:projectId&:pageNo&:pageSize&:copyrightId&:cpSongName&:cpArtistName&:cpAlbumName&:createStartTime&:createEndTime&:distributionStartTime' +
                        '&:distributionEndTime&:urgentDegree&:newSong&:degree&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:language&:karakalStatus&:tagStatus&:uid&:lastEditSearch&:taskStatus',
                title: '手动编目工单',
                views: {
                    'data-list': {
                        templateUrl: helper.basepath('uc-catalogtask/catalogtask-list.html'),
                        controller: 'CatalogTaskListCtrl'
                    }
                }
            })
    }

    /*手动编目工单系列controller*/
    angular.module('app.routes').controller('CatalogTaskHeadCtrl', ['$scope', '$state', 'TaskService', '$http', '$stateParams',function ($scope, $state, TaskService, $http, $stateParams) {
        $scope.form = new Form();
        $scope.taskSwitch = function (module,projectId) {
            $scope.datas = [];  //清空数据
            var _param = inherit($scope.form);
            for(var p in _param){
                _param[p] = '';
            }
            _param.module = module,_param.projectId = projectId,_param.pageSize = 50,_param.pageNo = 1;
            $state.go($state.current.name, _param, {inherit: false});
        };
        $scope.submit = function () {
            console.log($scope.form);
            $state.go('app.catalogTask.module', $scope.form);
        };
        $scope.reset = function () {
            for(var p in $scope.form){
                if(p != 'projectId' && p != 'pageNo' && p != 'pageSize') $scope.form[p] = '';
            }

        };
    }]);
    angular.module('app.routes').controller('CatalogTaskListCtrl', ['$scope', '$state', '$stateParams', 'TaskService', 'SweetAlert',function ($scope, $state, $stateParams, TaskService, SweetAlert) {
        if($stateParams.module == '-1,1,2') $stateParams.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
        $scope.$parent.form = excludeProperties($stateParams, ['module']); //刷新页面回显
        if($stateParams.module) $scope.$parent.module = $stateParams.module,$scope.$parent.form.taskStatusList = $stateParams.module.split(',');
        var promise = TaskService.service.taskSearch('catalog', angular.toJson($scope.$parent.form));
        if(promise) promise.then(function (res) {
            $scope.$parent.datas = res.data.list;
            console.log(res);
        });
        var form = cloneOneObject($scope.$parent.form);form.isQueryCount = 1;   //异步count
        TaskService.service.taskSearch('catalog', angular.toJson(form)).then(function (res) {
            paginationDiscreteness($scope, 5, res.data.pageSize, res.data.totalCount, res.data.pageTotal, res.data.pageNo);
        })

        if(!$scope.$parent.userRole) getTaskFlowAndAuth(TaskService, $scope); //获取工单流程和权限
        $scope.tagging = function (data, blank) { //打标签操作
            taggingAloneCheck(data.songId, blank, 'song', data.taskId, $state, SweetAlert);
        }
    }]);
    angular.module('app.routes').controller('UnAssignModal', ['datas', 'TaskService','$scope', '$uibModalInstance', 'CatalogService', 'SweetAlert',function (datas, TaskService,$scope, $uibModalInstance, CatalogService, SweetAlert) {
        $scope.cancel = function () { //取消
            $uibModalInstance.dismiss('cancel');
        };
        $scope.export = function (startTime, endTime) { //确认
            if(!startTime || !endTime) return sweetAlertCommon(SweetAlert, '请填写完整的创建时间', 'warning');
            var _promise = CatalogService.service.createCatalogTask(startTime, endTime);
            if(_promise) _promise.then(function (res) {
                if(res.status != 1) return sweetAlertCommon(SweetAlert, res.msg, 'warning');
                sweetAlertCommon(SweetAlert, res.msg, 'success');
                location.reload();
            })
        }
    }]);
    function getTaskFlowAndAuth(TaskService, $scope){  //获取工单流程和权限
        var _promise1 = TaskService.service.getTaskFlow($scope.$parent.form.projectId);
        if(_promise1) _promise1.then(function (res) {
            $scope.$parent.p_type = res.data.list[0].flowType;
            $scope.$parent.distribution = res.data.list[0].distribution;
            $scope.$parent.cyr_list = res.data.list[0].cyrList;
            $scope.$parent.cyr_list = $scope.cyr_list.concat(res.data.list[0].fzrList);
            $scope.$parent.cyr_list.forEach(function (val) {
                val.uid += '';
                if(val.uid == JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid) $scope.$parent.userRole = 'fzr';
            });
        });
        var _promise2 = TaskService.service.getTaskAuth($scope.$parent.form.projectId);
        if(_promise2) _promise2.then(function (res) {
            if(res.returnCode == '000000') $scope.$parent.authoritySetting = res.list[0];
        })
    }

})();

function taskSwitch(module, projectId, $scope, $state) {
    $scope.datas = [];  //清空数据
    var _param = inherit($scope.form);
    for(var p in _param){
        _param[p] = '';
    }
    _param.module = module,_param.projectId = projectId,_param.pageSize = 50,_param.pageNo = 1;
    $state.go($state.current.name, _param, {inherit: false});
}

