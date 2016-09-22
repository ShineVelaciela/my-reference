/**
 * Created by hao.cheng on 2016/8/8.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(SongTagTaskConfig);
    SongTagTaskConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function SongTagTaskConfig($stateProvider, helper) {
        $stateProvider
            .state('app.songtagTask', {
                url: '/songtagTask',
                views: {
                    '': {
                        templateUrl: helper.basepath('partials/container-tpl.html'),
                        controller: 'SongtagTaskHeadController'
                    }
                }
            })
            .state('app.songtagTask.module', {
                url: '/module?:module&:projectId&:pageNo&:pageSize&:copyrightId&:songIds&:songName&:artistName&:albumName&:projectName&:urgentDegree&:degree&:newSong&:status' +
                '&:mscoreMin&:mscoreMax&:hotScoreMax&:hotScoreMin&:taskStatus&:uid&:lastEditSearch&:distributionStartTime&:distributionEndTime&:completeStartTime&:completeEndTime',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('uc-songtagtask/songtagtask-condition.html'),
                        controller: 'SongtagTaskHeadController'
                    },
                    'data-list': {
                        templateUrl: helper.basepath('uc-songtagtask/songtagtask-list.html'),
                        controller: 'SongtagTaskListController'
                    }
                }
            })
            .state('app.songtagTaskFeedback', {
                url: '/task/feedback?:pid&:uid&:type&:pageNo&:pageSize',
                templateUrl: helper.basepath('uc-songtagtask/songtagtask-feedback.html'),
                controller: 'SongtagTaskFeedbackController'
            })
            .state('app.songtagTaskFailed', {
                url: '/task/failed?:type&:fid',
                templateUrl: helper.basepath('uc-songtagtask/songtagtask-failed.html'),
                controller: 'SongtagTaskFaildController'
            })
    }

    /*歌曲标签工单系列controller*/
    angular.module('app.routes').controller('SongtagTaskHeadController', ['$scope', 'TaskService', '$stateParams', '$state',function ($scope, TaskService, $stateParams, $state) {
        // $scope.container = {title: '歌曲标签工单'};
        $scope.container = new Container('歌曲标签工单');
        $scope.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
        console.log($scope.container);
        $scope.taskSwitch = function (module, projectId) {
            taskSwitch(module, projectId, $scope, $state);
        };
        $scope.submit = function () {
            $state.go($state.current.name, $scope.form);
        };
        $scope.reset = function () {
            for(var p in $scope.form){
                if(p != 'projectId' && p != 'pageNo' && p != 'pageSize') $scope.form[p] = '';
            }
        };
        $scope.state2feedback = function(type){
            var params = {type: type, pid: $stateParams.projectId, uid: JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid, pageSize: 20, pageNo: 1};
            var url = $state.href('app.songtagTaskFeedback', params);
            window.open(url, '_blank');
        }
    }]);
    angular.module('app.routes').controller('SongtagTaskListController', ['$scope', 'TaskService', '$stateParams', '$state', 'SweetAlert',function ($scope, TaskService, $stateParams, $state, SweetAlert) {
        taskListService($stateParams, $scope, TaskService);
        $scope.tagging = function (data, blank) {  //打标签操作
            taggingAloneCheck(data.songId, blank, 'song', data.taskId, $state, SweetAlert);
        };
        taskLoadSearch('song', $scope, TaskService);
    }]);
    angular.module('app.routes').controller('SongTagModal', ['datas', 'form', '$uibModalInstance', '$scope', 'SweetAlert',function (datas, form, $uibModalInstance, $scope, SweetAlert) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.export = function () {
            exportCommon(datas, form, $scope, SONGTAG_EXPORT, SweetAlert);
        };
    }]);
    angular.module('app.routes').controller('SongTagImportModal', ['type', '$uibModalInstance', '$scope', '$stateParams', 'SweetAlert', '$timeout',function (type, $uibModalInstance, $scope, $stateParams, SweetAlert, $timeout) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.import = function(){
            var filename = $('#excelFile').val();
            if(filename == undefined || filename == '') return sweetAlertCommon(SweetAlert, '请选择上传的excel文件', 'warning');
            var datas = {pid: $stateParams.projectId};
            datas.type = (type == 'task' && 1) || (type == 'tag' && 2) || 1;     // 默认为1，第一个条件为task，第二个条件为tag
            if(type != 'task' && type != 'tag') datas.kind = (type == 'artist' && 'artist') || (type == 'album' && 'album') || (type == 'song' && 'song');
            ajaxFileUpload(SONGTAG_IMPORT, $scope, datas, $uibModalInstance,SweetAlert, 'excelFile', $stateParams, undefined, $timeout);
        };
        $scope.downloadTpl = function(){
            var _tplUrl = ((type == 'task' || type == 'song') && SONGTAG_TPL) ||
                (type == 'tag' && TAG_TPL) || (type == 'artist' && ARTIST_TPL) || (type == 'album' && ALBUM_TPL);
            window.open(_tplUrl);
        }
    }]);
    angular.module('app.routes').controller('SongtagTaskFeedbackController', ['$scope', '$stateParams', 'SongTagTaskService',function($scope, $stateParams, SongTagTaskService){
        $scope.type = $stateParams.type;

        var obj = cloneOneObject($stateParams);
        if(obj.hasOwnProperty('type')){
            if(obj.type == 'tag'){
                obj.type = 2;
            } else{
                obj.type = 1;
            }
        }
        SongTagTaskService.method.getFeedbackDatas(obj, function(res){
            $scope.datas = res.data.list;
            paginationDiscreteness($scope, 5, res.data.pageSize, res.data.totalCount, res.data.pageTotal, res.data.pageNo);
        })
    }]);
    angular.module('app.routes').controller('SongtagTaskFaildController', ['$scope', '$stateParams', 'SongTagTaskService',function($scope, $stateParams, SongTagTaskService){
        $scope.type = $stateParams.type;

        SongTagTaskService.method.getFailedDatas($stateParams.fid, function(res){
            $scope.datas = res.data;
            for(var i = 0; i < $scope.datas.length; i++){
                var tag = [];
                var arr = ['language', 'style', 'emotion', 'theme', 'scene', 'holiday', 'instrument', 'voice', 'ring'];
                getSpecialPropertiesByArray($scope.datas[i].data, arr, function(value){
                    if(!checkEmpty(value)){
                        tag.push(value);
                    }
                });
                if(tag.length > 0){
                    $scope.datas[i].tag = tag.join('、');
                }
            }
        });
        $scope.exportFaildExcel = function(){
            var type = $stateParams.type == 'tag' ? 'tag' : 'task';
            SongTagTaskService.method.exportFailedExcel(type, $stateParams.fid);
        }
    }]);
})();
function taskListService($stateParams, $scope, TaskService) {  //工单基本业务逻辑
    if($stateParams.module == '-1,1,2') $stateParams.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
    $scope.$parent.form = excludeProperties($stateParams, ['module']); //刷新页面回显
    if($scope.$parent.form.tagBeans) $scope.$parent.form.tagBeans = JSON.parse($scope.$parent.form.tagBeans);
    if($stateParams.module){
        $scope.$parent.module = $stateParams.module;
        if($stateParams.module == 1) $scope.$parent.form.taskStatusList = [-1,1,2];
        else $scope.$parent.form.taskStatusList = $stateParams.module.split(',');
    }
    if(!$scope.$parent.userRole && $stateParams.projectId) TaskService.method.getTaskFlowAndAuth($scope);  //获取项目流程和权限
}
function taskLoadSearch(type, $scope, TaskService){ //工单搜索加载数据
    if($scope.$parent.form[type + 'Ids']) $scope.$parent.form[type + 'Ids'] = $scope.$parent.form[type + 'Ids'].split(',');
    TaskService.method.taskSearchFromPage(type, $scope);
}