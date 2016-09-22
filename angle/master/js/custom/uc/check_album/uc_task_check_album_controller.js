/**
 * Created by YuChunzhuo on 2016/1/5.
 */
(function () {
    'use strict';
    angular.module('app.routes').config(checkAlbumConfig);
    checkAlbumConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function checkAlbumConfig($stateProvider, helper){
        $stateProvider
            .state('app.uc_task_check_album',{
                url: '/uc_task_check_album?:pId&:taskStatus&:uid&:pageNo&:pageSize&:taskStatusList&:albumIds&:albumName&:artistName&:urgentDegree&:cpCreateStartTime&:cpCreateEndTime&:sendStartTime&:sendEndTime&:editUserName&:auditUserName&:hotScoreMin&:hotScoreMax&:status&:mscoreMin&:mscoreMax&:tagBeans&:style',
                title: '专辑抽查',
                templateUrl: 'app/views/uc/check_album/uc_task_check_album.html',
                controller: 'CheckAlbumController'
            })
            .state('app.uc_task_check_album.unassigned',{
                url: '/unassigned',
                views: {
                    "condition": {
                        templateUrl: 'app/views/uc/check_album/uncompelete.html',
                        controller: 'CheckAlbumUnassignedController'
                    }
                }
            })
            .state('app.uc_task_check_album.assigned',{
                url: '/assigned?:distributionStartTime&:distributionEndTime',
                title: '专辑抽查',
                views: {
                    "condition": {
                        templateUrl: 'app/views/uc/check_album/uncompelete.html',
                        controller: 'CheckAlbumAssignedController'
                    }
                }
            })
            .state('app.uc_task_check_album.uncompelete',{
                url: '/uncompelete?:distributionStartTime&:distributionEndTime',
                title: '专辑抽查',
                views: {
                    "condition": {
                        templateUrl: 'app/views/uc/check_album/uncompelete.html',
                        controller: 'CheckAlbumUncompeleteController'
                    }
                }
            })
            .state('app.uc_task_check_album.compelete',{
                url: '/compelete?:completeStartTime&:completeEndTime&:ckResult&:ckTagErrors',
                title: '专辑抽查',
                views: {
                    "condition": {
                        templateUrl: 'app/views/uc/check_album/uncompelete.html',
                        resolve: helper.resolveFor('localytics.directives'),
                        controller: 'CheckAlbumCompeleteController'
                    }
                }
            })
    }
    angular.module('app.routes').controller('CheckAlbumController', ['$scope','$http','$stateParams','$state','$timeout','$rootScope','display', '$window', '$filter', '$cookies','SweetAlert', 'TaskService',
        function($scope,$http,$stateParams,$state,$timeout,$rootScope,display, $window, $filter, $cookies,SweetAlert, TaskService){
            $scope.tempscope = tempTagChoices;
            $scope.pageType = "";
            $scope.ucSongGitUsers = [];
            $scope.form = new Object();
            $scope.datas = [];
            $scope.userRole = 'cyr';
            $scope.taskStatus = $stateParams.taskStatus;
            $scope.pId = $stateParams.pId;
            $scope.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
            $scope.ckTagError = {};
            //获取项目的自定义权限分配模板（A,B,AB之类的）
            $scope.authoritySetting = [];

            //获取项目的流程
            getTaskContent($scope, $stateParams, $http);
            //获取标签
            getTagList(2,$scope,$stateParams,$http,$cookies,SweetAlert,1);
            //获取所有用户
            if($scope.$parent.users == undefined || $scope.$parent.users.length <= 0){
                getAllUser($http, function(users){
                    $scope.$parent.users = users;
                });
            }
            $scope.changeTagType = function (type) {
                for(var i = 0; i < $scope.form.tagBeans.length; i++){
                    if(!checkEmpty($scope.form.tagBeans[i].type)){
                        $scope.form.tagBeans[i].type = type;
                    }
                }
            };

            //分配项目
            $scope.distributionTask = function(userId){
                console.log(userId);
                var authSetting = $scope.form.task_auth_setting;
                var taskIds = getPropertyFromCheckBox($scope.datas, "isCheck", true, "taskId");
                if(isPropertyEmpty(userId)){
                    return sweetAlertCommon(SweetAlert, '请选择分配人', 'warning');
                }
                if(taskIds.length <= 0){
                    return sweetAlertCommon(SweetAlert, '请选择分配数据', 'warning');
                }
                //分配任务
                assignTaskNewSong(taskIds, authSetting.flowId, authSetting.auth, userId, SweetAlert, $scope, TaskService);
            };
            //$scope.export = function(){ //导出数据
            //    exportData($scope);
            //};
            //复选框的单个选择
            $scope.chk = function(data, datas){
                $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'albumId');
            };
            //复选框的全选
            $scope.checkAll = function(all, datas){
                selectAll($scope, datas, 'isCheck', 'allIsCheck');
                $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'albumId');
            };
            //分页函数
            $scope.choosePage = function(pageType){
                //$stateParams.pageNo = $scope.params.currentPage;
                $state.go('app.uc_task_check_album.' + pageType, {pageNo: $scope.form.currentPage});
            };
            //点击查询按钮
            $scope.paramsSearchClick = function(type){
                //下面处理搜索字段
                var datas = cloneOneObject($scope.form);
                datas = iteratorData(datas, $filter);
                //对错误分类进行处理
                // var ckTagErrors = [];
                // for(var i = 1; i <= 5; i++){
                //     if($scope.ckTagError["tag" + i]){
                //         ckTagErrors.push(i);
                //     }
                // }
                // console.log(ckTagErrors);
                // datas.ckTagErrors = ckTagErrors.join(",");
                var propertys = ['projectId','taskStatus','taskStatusList','albumIds','albumName','artistName','createStartTime','createEndTime','distributionStartTime','distributionEndTime','completeStartTime','completeEndTime','status','karakal_status','ckResult','ckTagErrors','scoreStart','scoreEnd','sendStartTime','sendEndTime','editUserName','auditUserName','urgentDegree','uid','cpCreateStartTime','cpCreateEndTime','tags','hotScoreMin','hotScoreMax','status','mscoreMin','mscoreMax','tagBeans','style'];
                datas = keepObjectProperty(propertys, datas);

                datas.pId = $stateParams.pId;
                datas.taskStatus = $stateParams.taskStatus;
                datas.taskStatusList = $stateParams.taskStatusList;

                if(!checkEmpty(datas.tagBeans)) datas.tagBeans = angular.toJson(datas.tagBeans);    //标签特殊处理

                console.log(datas);

                $state.go('app.uc_task_check_album.' + type, datas,{reload: true,inherit: false});
            };
            //查看素材信息
            $scope.showMaterialInfo = function(type, data){
                openNewTab(type, data, 'Info', $state);
            };
            //跳转到抽查页面
            $scope.jumpToCheck = function(data){
                jumpToCheck($state, "album", data);
            };
            //重置搜索条件
            $scope.reset = function(){
                $scope.form = {};
                $scope.form.task_auth_setting = $scope.authoritySetting[0];
                if(!isPropertyEmpty($stateParams.uid) && ($scope.pageType == "uncompelete" || ($scope.pageType == "compelete" && $scope.userRole == "cyr"))){
                    $scope.form.uid = $stateParams.uid;
                }
                for(var n in $scope.ckTagError){
                    $scope.ckTagError[n] = false;
                }
                clearUploadExcel($http,2);
            };
            //导出excel
            //$scope.export = function(){
            //    exportMaterialExcel('album', $stateParams, $scope.datas);
            //};
            //打开日期框
            $scope.open = function(flag) {
                $scope.dateStatus["opened" + flag] = true;
            };
            $scope.dateStatus = {
                opened1: false, opened2: false, opened3: false, opened4: false, opened5: false, opened6: false, opened7: false, opened8: false
            };
        }]);
    angular.module('app.routes').controller('CheckAlbumUnassignedController', ['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);

        $scope.$parent.pageType = "unassigned";
        $stateParams.projectId = $stateParams.pId;
        $stateParams.isQueryExcel = 1;
        ucCheckGetData("album", $stateParams, $scope, $http);
    }]);
    angular.module('app.routes').controller('CheckAlbumAssignedController', ['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);

        $scope.$parent.pageType = "assigned";
        $stateParams.projectId = $stateParams.pId;
        ucCheckGetData("album", $stateParams, $scope, $http);
    }]);
    angular.module('app.routes').controller('CheckAlbumUncompeleteController', ['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
        $stateParams.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);
        $scope.$parent.pageType = "uncompelete";
        $stateParams.projectId = $stateParams.pId;
        ucCheckGetData("album", $stateParams, $scope, $http);
    }]);
    angular.module('app.routes').controller('CheckAlbumCompeleteController', ['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);

        $scope.$parent.pageType = "compelete";
        $stateParams.projectId = $stateParams.pId;
        ucCheckGetData("album", $stateParams, $scope, $http);
        $scope.tagErrorChoose = function(t){ //添加错误分类
            tagErrorChoose(t,$scope);
        };
        $scope.ckTagErrorsRemove = function(c){
            $scope.form.ckTagErrors.remove(c);
        }
    }])
})();
