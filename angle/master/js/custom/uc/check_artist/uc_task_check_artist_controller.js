/**
 * Created by YuChunzhuo on 2016/1/5.
 */
'use strict';
angular.module('app.routes').config(checkArtistConfig);
checkArtistConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
function checkArtistConfig($stateProvider, helper){
    $stateProvider
        .state('app.uc_task_check_artist',{
            url: '/uc_task_check_artist?:pId&:projectId&:taskStatus&:pageNo&:pageSize&:taskStatusList&:uid&:artistIds&:artistName&:editUserName&:auditUserName&:cpCreateStartTime&:cpCreateEndTime&:sendStartTime&:sendEndTime&:scoreStart&:scoreEnd&:tags&:urgentDegree&:hotScoreMin&:hotScoreMax&:status&:tagBeans&:style&:mscoreMin&:mscoreMax',
            title: '艺人抽查',
            templateUrl: 'app/views/uc/check_artist/uc_task_check_artist.html',
            controller: 'CheckArtistController'
        })
        .state('app.uc_task_check_artist.unassigned',{
            url: '/unassigned',
            title: '艺人抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_artist/uncompelete.html',
                    controller: 'CheckArtistUnassignedController'
                }
            }
        })
        .state('app.uc_task_check_artist.assigned',{
            url: '/assigned?:distributionStartTime&:distributionEndTime',
            title: '艺人抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_artist/uncompelete.html',
                    controller: 'CheckArtistAssignedController'
                }
            }
        })
        .state('app.uc_task_check_artist.uncompelete',{
            url: '/uncompelete?:distributionStartTime&:distributionEndTime',
            title: '艺人抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_artist/uncompelete.html',
                    controller: 'CheckArtistUncompeleteController'
                }
            }
        })
        .state('app.uc_task_check_artist.compelete',{
            url: '/compelete?:completeStartTime&:completeEndTime&:ckResult&:ckTagErrors',
            title: '艺人抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_artist/uncompelete.html',
                    resolve: helper.resolveFor('localytics.directives'),
                    controller: 'CheckArtistCompeleteController'
                }
            }
        })
}

angular.module('app.routes').controller('CheckArtistController', ['$scope','$http','$stateParams','$state','$timeout','$rootScope','display', '$window', '$filter', '$cookies','SweetAlert', 'TaskService',function($scope,$http,$stateParams,$state,$timeout,$rootScope,display, $window, $filter, $cookies,SweetAlert, TaskService){
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
    getTagList(1,$scope,$stateParams,$http,$cookies,SweetAlert,1);

    $scope.changeTagType = function (type) {
        for(var i = 0; i < $scope.form.tagBeans.length; i++){
            if(!checkEmpty($scope.form.tagBeans[i].type)){
                $scope.form.tagBeans[i].type = type;
            }
        }
    };

    //艺人的地域是标签
    $http.get(tag_tree_url+'getArtisteByClassificationAndTag.do').success(function(res){
        for(var i = 0; i < res.areaList.tagList.length; i++){
            res.areaList.tagList[i].tagId = res.areaList.tagList[i].tagId + "";
        }
        $scope.areaList = res.areaList;     //地域
    }).error(function(res){
        alertTipCommon($timeout,$rootScope,'获取艺人地域标签失败',display);
    });

    //获取所有用户
    if($scope.$parent.users == undefined || $scope.$parent.users.length <= 0){
        getAllUser($http, function(users){
            $scope.$parent.users = users;
        });
    }

    //分配项目
    $scope.distributionTask = function(userId){
        console.log(userId);
        var authSetting = $scope.form.task_auth_setting;
        var taskIds = getPropertyFromCheckBox($scope.datas, "isCheck", true, "taskId");
        console.log($scope.datas);
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
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'artistId');
    };
    //复选框的全选
    $scope.checkAll = function(all, datas){
        selectAll($scope, datas, 'isCheck', 'allIsCheck');
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'artistId');
    };
    //分页函数
    $scope.choosePage = function(pageType){
        //$stateParams.pageNo = $scope.params.currentPage;
        $state.go('app.uc_task_check_artist.' + pageType, {pageNo: $scope.params.currentPage});
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
        var propertys = ['projectId','taskStatus','taskStatusList','artistIds','artistName','createStartTime','createEndTime','distributionStartTime','distributionEndTime','completeStartTime','completeEndTime','status','karakal_status','ckResult','ckTagErrors','scoreStart','scoreEnd','sendStartTime','sendEndTime','editUserName','auditUserName','urgentDegree','uid','cpCreateStartTime','cpCreateEndTime','tags','hotScoreMin','hotScoreMax','status','tagBeans','style', 'mscoreMax', 'mscoreMin'];
        datas = keepObjectProperty(propertys, datas);

        datas.pId = $stateParams.pId;
        datas.taskStatus = $stateParams.taskStatus;
        datas.taskStatusList = $stateParams.taskStatusList;

        if(!checkEmpty(datas.tagBeans)) datas.tagBeans = angular.toJson(datas.tagBeans);

        console.log(datas);

        $state.go('app.uc_task_check_artist.' + type, datas, {reload: true,inherit: false});
    };
    //查看素材信息
    $scope.showMaterialInfo = function(type, data){
        openNewTab(type, data, 'Info', $state);
    };
    //跳转到抽查页面
    $scope.jumpToCheck = function(data){
        jumpToCheck($state, "artist", data);
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
        clearUploadExcel($http,1);
    };
    //导出excel
    $scope.export = function(){
        exportMaterialExcel('artist', $stateParams, $scope.datas);
    };
    //打开日期框
    $scope.open = function(flag) {
        $scope.dateStatus["opened" + flag] = true;
    };
    $scope.dateStatus = {
        opened1: false, opened2: false, opened3: false, opened4: false, opened5: false, opened6: false, opened7: false, opened8: false
    };
}]);
angular.module('app.routes').controller('CheckArtistUnassignedController',['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
    ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);

    $scope.$parent.pageType = "unassigned";
    $stateParams.projectId = $stateParams.pId;
    $stateParams.isQueryExcel = 1;
    ucCheckGetData("artist", $stateParams, $scope, $http);
}]);
angular.module('app.routes').controller('CheckArtistAssignedController',['$scope', '$http', '$stateParams', '$cookies', function($scope, $http, $stateParams, $cookies){
    ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);

    $scope.$parent.pageType = "assigned";
    $stateParams.projectId = $stateParams.pId;
    ucCheckGetData("artist", $stateParams, $scope, $http);
}]);
angular.module('app.routes').controller('CheckArtistUncompeleteController',['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
    $stateParams.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
    ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);
    $scope.$parent.pageType = "uncompelete";
    $stateParams.projectId = $stateParams.pId;
    ucCheckGetData("artist", $stateParams, $scope, $http);
}]);
angular.module('app.routes').controller('CheckArtistCompeleteController',['$scope', '$http', '$stateParams', '$cookies',function($scope, $http, $stateParams, $cookies){
    ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree);

    $scope.$parent.pageType = "compelete";
    $stateParams.projectId = $stateParams.pId;
    ucCheckGetData("artist", $stateParams, $scope, $http);
    $scope.tagErrorChoose = function(t){ //添加错误分类
        tagErrorChoose(t,$scope);
    };
    $scope.ckTagErrorsRemove = function(c){
        $scope.form.ckTagErrors.remove(c);
    }
}]);
//抽查工单的的导入导出控件
angular.module('app.routes').controller('uc_task_check_controller', ['$scope','$uibModal',function($scope,$uibModal){
    $scope.animationsEnabled = true;
    //导出excel
    $scope.export = function(type, selectedDataIds){
        //if($stateParams.tagId == undefined){
        //    sweetAlertCommon(SweetAlert,"没有选择标签,不能导入",'error');
        //    return;
        //}
        console.log(selectedDataIds);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'uc_task_check_export.html',
            controller: 'uc_task_check_export_ctrl',
            resolve: {
                type: function(){
                    return type;
                },
                ids: function(){
                    return selectedDataIds;
                }
            }
        });
    };
    //导入excel
    $scope.import = function(type){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'uc_task_check_import.html',
            controller: 'checkImportCtrl',
            resolve: {
                type: function(){
                    return type
                }
            }
        });
    };
    //抽查工单批量删除
    $scope.checkBatchDelete = function(type, datas){
        console.log(datas);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'deleteTpl.html',
            controller: 'uc_task_check_delete_ctrl',
            resolve: {
                type: function(){
                    return type;
                },
                datas: function(){
                    return datas;
                }
            }
        });
    };
}]);
//抽查导入框
angular.module('app.routes').controller('checkImportCtrl', ['$scope','$uibModalInstance','$http','$filter','type','SweetAlert','$state','$rootScope','$stateParams',function($scope,$uibModalInstance,$http,$filter,type,SweetAlert,$state,$rootScope,$stateParams) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.downloadTemplet = function(){
        window.open(environment+ '/cmssearch/resources/excel/'+type+'.xls','_blank');
    };
    $scope.ok = function(){
        var filename = $('#excelFile').val();
        if(checkEmpty(filename)){
            $scope.error = '请选择上传的excel文件';
        }else{
            var url = _search_url + 'checksearch/'+ type + 'ExlQuery.json';
            ajaxFileUpload(url, $scope, '', $uibModalInstance, SweetAlert,'excelFile',$stateParams,function ($stateParams) {
                console.log($stateParams);
                var params = {
                    pId: $stateParams.pId,
                    taskStatus: 0
                }
                $state.go('app.uc_task_check_'+type+'.unassigned',params,{reload: true, inherit: false});
            });
        }
    }
}]);

//抽查导出框
angular.module('app.routes').controller('uc_task_check_export_ctrl', ['$state','$scope', '$uibModalInstance', '$stateParams', '$http', '$filter', 'type', 'ids',function($state,$scope, $uibModalInstance, $stateParams, $http, $filter, type, ids){
    console.log(type);
    console.log(ids);
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        $stateParams.projectId = $stateParams.pId;
        var data = iteratorStateParam($stateParams, undefined, "artistIds,taskStatusList,tags,albumIds,songIds,ckTagErrors");
        if($state.current.name.indexOf('uncompelete') != -1 && !data.uid) data.uid = JSON.parse(localStorage.getItem("ngStorage-loginUserInfo")).uid;
        if(data.tagBeans) data.tagBeans = JSON.parse(data.tagBeans);
        if($scope.export_type == 1){
            //console.log("选择了按照选中导出");
            if(ids == undefined || ids == null || ids === '' || ids.length <= 0){
                $scope.error = '没有选中数据，无法导出';
                return;
            }
            data[type + 'Ids'] = stringToArray(ids);
        } else if($scope.export_type == 2){
            if($scope.numberStart == undefined || $scope.numberEnd == undefined || $scope.numberStart == '' || $scope.numberEnd == ''){
                $scope.error = '请输入序号起止';
                return;
            }
            data.startNo = $scope.numberStart - 1;
            data.endNo = $scope.numberEnd - 1;
            //console.log($scope.numberStart + " +++++ " + $scope.numberEnd);
        } else if($scope.export_type == 3){
            if($scope.pageStart == undefined || $scope.pageEnd == undefined || $scope.pageStart == '' || $scope.pageEnd == ''){
                $scope.error = '请输入页码起止';
                return;
            }
            console.log($scope.form);
            data.startNo = ($scope.pageStart - 1) * (data.pageSize ? data.pageSize : 50);
            data.endNo = $scope.pageEnd * (data.pageSize ? data.pageSize : 50) - 1;
            //console.log($scope.pageStart + " +++++ " + $scope.pageEnd);
        } else {
            $scope.error = '请选择导出类型';
            return;
        }
        var url = _search_url + 'checkexport/' + type + '.json?data=' + JSON.stringify(data);
        console.log(url);
        window.open(url);
        $uibModalInstance.dismiss('cancel');
    };
}]);

//抽查批量删除框
angular.module('app.routes').controller('uc_task_check_delete_ctrl', ['$scope', '$uibModalInstance', '$stateParams', '$timeout', 'SweetAlert', 'CheckService', '$http', '$filter', 'type', 'datas',function($scope, $uibModalInstance, $stateParams, $timeout, SweetAlert, CheckService, $http, $filter, type, datas){
    console.log(datas);
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function() {
        var taskIds = [];
        $stateParams.projectId = $stateParams.pId;
        if($stateParams.tagBeans && $stateParams.tagBeans.constructor == String) {
            $stateParams.tagBeans = JSON.parse($stateParams.tagBeans);
        }
        var data = iteratorStateParam($stateParams, undefined, "artistIds,taskStatusList,tags,albumIds,songIds,ckTagErrors");
        console.log($scope.export.type);
        switch ($scope.export.type){
            case "1":
                //console.log("选择了按照选中导出");
                var materialIds = [];
                datas.forEach(function(val){
                    if(val['isCheck']){
                        taskIds.push(val['taskId']);
                        materialIds.push(val[type + 'Id']);
                    }
                });
                if(taskIds == undefined || taskIds == null || taskIds === '' || taskIds.length <= 0){
                    $scope.error = '没有选中数据，无法导出';
                    return;
                }
                data[type + 'Ids'] = stringToArray(materialIds);
                break;
            case "2":
                if(checkEmpty($scope.export.startNo) || checkEmpty($scope.export.endNo)){
                    $scope.error = '请输入序号起止';
                    return;
                }
                data.startNo = $scope.export.startNo - 1;
                data.endNo = $scope.export.endNo - 1;
            //console.log($scope.numberStart + " +++++ " + $scope.numberEnd);
                break;
            case "3":
                if(checkEmpty($scope.export.pageStart) || checkEmpty($scope.export.pageEnd)){
                    $scope.error = '请输入页码起止';
                    return;
                }
                data.startNo = ($scope.export.pageStart - 1) * ($stateParams.pageSize == undefined ? 50 : $stateParams.pageSize);
                data.endNo = $scope.export.pageEnd * ($stateParams.pageSize == undefined ? 50 : $stateParams.pageSize) - 1;
            //console.log($scope.pageStart + " +++++ " + $scope.pageEnd);
                break;
            default:
                $scope.error = '请选择导出类型';
                return;
        }
        var url = "data=" + JSON.stringify(data);
        if(taskIds.length > 0){
            url += "&taskIds=" + taskIds.join(',');
        }
        var promise = CheckService.service.batchDelete(type, url);
        promise.then(function (res) {
            if(res.status == 1 || res.returnCode == '000000') {
                sweetAlertCommon(SweetAlert,res.description,'success'), $uibModalInstance.dismiss('cancel');
                $timeout(function(){
                    location.reload();
                }, 1000);
            } else {
                sweetAlertCommon(SweetAlert,res.description,'error');
            }
        });
    };
}]);

//页面填充搜索条件
function ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, songTagTree, type){
    //填充标签
    //此处没有，歌曲才有标签
    if(type == "song" && !isPropertyEmpty($stateParams.tags)){
        $scope.searchTag.length = 0;
        for(var i = 0; i < $stateParams.tags.split(',').length; i++){
            //遍历获取到的标签树获得标签ID对应的标签
            var tag = getTagById($stateParams.tags.split(',')[i], songTagTree);
            if(tag != undefined){
                $scope.searchTag.push(tag);
            }
        }
    }
    if(!isPropertyEmpty($stateParams.tagBeans)) $stateParams.tagBeans = JSON.parse($stateParams.tagBeans); //标签特殊处理
    for(var property in $stateParams){
        if(!isPropertyEmpty($stateParams[property])){
            $scope.form[property] = $stateParams[property];
        }
    }
    if($stateParams.ckTagErrors != undefined && $stateParams.ckTagErrors.constructor !== Array && $stateParams.ckTagErrors.split(",").length > 0){
        $scope.form.ckTagErrors = $stateParams.ckTagErrors.split(",");
    }
}

function ucCheckGetData(type, $stateParams, $scope, $http){
    if(checkEmpty($stateParams.pageSize)) $stateParams.pageSize = 50;
    var url = _search_url + "checksearch/" + type + ".json?" + CALLBACK + "&data=";
    var data = iteratorStateParam($stateParams, undefined, "artistIds,taskStatusList,tags,albumIds,songIds,ckTagErrors");
    if(data.tagBeans && data.tagBeans.constructor === String) data.tagBeans = JSON.parse(data.tagBeans);
    //console.log(data);
    var url1 = url + JSON.stringify(data);
    $http.jsonp(url1).success(function(res){
        $scope.$parent.datas.length = 0;
        var ids = [];
        for(var i = 0; i < res.data.list.length; i++){
            $scope.$parent.datas.push(res.data.list[i]);
        }
    });
    var data2 = cloneOneObject(data);
    data2.isQueryCount = 1;
    var url2 = url + JSON.stringify(data2);
    $http.jsonp(url2).success(function(res) {
        materialListSeparatePage($scope.$parent,res);
    });
};

function jumpToCheck($state, type, data){
    var param = {};
    param[type+'Id'] = data[type + 'Id'];
    param['lastPage'] = returnLastPageTime();
    param['taskId'] = data.taskId;
    var openUrl =  $state.href(type+'Check',param);
    window.open(openUrl,'_blank');
    // window.focus();
}
function jumptoCheckTag($state, type, data) {
    var param = {};
    param[type+'Id'] = data[type + 'Id'];
    param['lastPage'] = returnLastPageTime();
    param['taskId'] = data.taskId;
    var openUrl =  $state.href('material.taggingCheck',param);
    window.open(openUrl,'_blank');
}

function exportMaterialExcel(type, $stateParams, datas){
    var ids = getPropertyFromCheckBox(datas, "isCheck", true, type + "Id");
    if(ids.length <= 0){
        alert("你没有勾选数据，不能导出");
        return;
    }
    var data = iteratorStateParam($stateParams, undefined, "artistIds,taskStatusList,tags,albumIds,songIds");
    data[type + "Ids"] = ids;
    var url = _search_url + "checkexport/" + type + ".json?data=" + JSON.stringify(data);
    window.open(url);
}