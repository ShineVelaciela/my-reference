/**
 * Created by YuChunzhuo on 2016/1/27.
 */

angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.uc_task_new_song',{
            url: '/uc_atask_new_song?:pId&:status&:taskStatus&:uId&:pageNo&:pageSize&:taskStatusList&:urgentDegree&:language',
            title: '新歌项目',
            templateUrl: 'app/views/uc/new_song/uc_task_new_song.html',
            controller: 'NewSongController'
        })
        //未完成
        .state('app.uc_task_new_song.uncompelete',{
            url: "/uncompelete?:cid&:productSongName&:productAlbumName&:productArtistName&:songId&:catalogSongName&:catalogAlbumName&:catalogArtistName&:dataState&:newOrFirst&:degree&:projectName&:distributionTimeStart&:distributionTimeEnd&:errorTypeTag&:auth",
            title: '新歌项目',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song/assigned.html',
                    controller: 'NewSongUncompeleteController'
                }
            }
        })
        //已分配
        .state('app.uc_task_new_song.assigned',{
            url: "/assigned?:cid&:productSongName&:productAlbumName&:productArtistName&:songId&:catalogSongName&:catalogAlbumName&:catalogArtistName&:dataState&:newOrFirst&:degree&:projectName&:distributionTimeStart&:distributionTimeEnd&:errorTypeTag",
            title: '新歌项目',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song/assigned.html',
                    controller: 'NewSongAssignedController'
                }
            }
        })
        //未分配
        .state('app.uc_task_new_song.unassigned',{
            url: "/unassigned?:productSongName&:productAlbumName&:productArtistName&:cid&:catalogSongName&:catalogAlbumName&:catalogArtistName&:filterCondition&:songId&:creatTimeStart&:creatTimeEnd&:projectName&:newOrFirst&:degree&:errorTypeTag",
            title: '新歌项目',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song/unassigned.html',
                    controller: 'NewSongUnassignedController'
                }
            }
        })
        //已完成
        .state('app.uc_task_new_song.compelete',{
            url: "/compelete?:cid&:productSongName&:productAlbumName&:productArtistName&:songId&:catalogSongName&:catalogAlbumName&:catalogArtistName&:newOrFirst&:degree&:projectName&:distributionTimeStart&:distributionTimeEnd&:compeleteTimeStart&:compeleteTimeEnd",
            title: '新歌项目',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song/compelete.html',
                    controller: 'NewSongCompeleteController'
                }
            }
        })
}]);

function fillSearchConditionAgain($stateParams, $scope){
    if(!checkEmpty($stateParams.taskStatus)) $scope.$parent.params.taskStatus = $stateParams.taskStatus + '';
    if($stateParams.productSongName != undefined && $stateParams.productSongName != ''){
        $scope.$parent.params.productSongName = $stateParams.productSongName;
    }
    if($stateParams.productAlbumName != undefined && $stateParams.productAlbumName != ''){
        $scope.$parent.params.productAlbumName = $stateParams.productAlbumName;
    }
    if($stateParams.productArtistName != undefined && $stateParams.productArtistName != ''){
        $scope.$parent.params.productArtistName = $stateParams.productArtistName;
    }
    if($stateParams.cid != undefined && $stateParams.cid != ''){
        $scope.$parent.params.cid = $stateParams.cid;
    }
    if($stateParams.catalogSongName != undefined && $stateParams.catalogSongName != ''){
        $scope.$parent.params.catalogSongName = $stateParams.catalogSongName;
    }
    if($stateParams.catalogAlbumName != undefined && $stateParams.catalogAlbumName != ''){
        $scope.$parent.params.catalogAlbumName = $stateParams.catalogAlbumName;
    }
    if($stateParams.catalogArtistName != undefined && $stateParams.catalogArtistName != ''){
        $scope.$parent.params.catalogArtistName = $stateParams.catalogArtistName;
    }
    if($stateParams.filterCondition != undefined && $stateParams.filterCondition != ''){
        $scope.$parent.params.filterCondition = $stateParams.filterCondition;
    }
    if($stateParams.songId != undefined && $stateParams.songId != ''){
        $scope.$parent.params.songId = $stateParams.songId;
    }
    if($stateParams.creatTimeStart != undefined && $stateParams.creatTimeStart != ''){
        $scope.$parent.params.creatTimeStart = $stateParams.creatTimeStart;
    }
    if($stateParams.creatTimeEnd != undefined && $stateParams.creatTimeEnd != ''){
        $scope.$parent.params.creatTimeEnd = $stateParams.creatTimeEnd;
    }
    if($stateParams.projectName != undefined && $stateParams.projectName != ''){
        $scope.$parent.params.projectName = $stateParams.projectName;
    }
    if($stateParams.newOrFirst != undefined && $stateParams.newOrFirst != ''){
        $scope.$parent.params.newOrFirst = $stateParams.newOrFirst;
    }
    if($stateParams.degree != undefined && $stateParams.degree != ''){
        $scope.$parent.params.degree = $stateParams.degree;
    }
    if($stateParams.dataState != undefined && $stateParams.dataState != ''){
        $scope.$parent.params.dataState = $stateParams.dataState;
        //$("select.uc_dataState").val($stateParams.dataState);
    }
    if($stateParams.degree != undefined && $stateParams.degree != ''){
        $scope.$parent.params.degree = $stateParams.degree;
    }
    if($stateParams.uId != undefined && $stateParams.uId != ''){
        $scope.$parent.params.uId = parseInt($stateParams.uId);
    }
    if($stateParams.errorTypeTag != undefined && $stateParams.errorTypeTag != ''){
        $scope.$parent.params.errorTypeTag = $stateParams.errorTypeTag;
        //$("select.uc_auth").val($stateParams.auth);
    }
    if($stateParams.auth != undefined && $stateParams.auth != ''){
        $scope.$parent.params.auth = $stateParams.auth;
        //$("select.uc_auth").val($stateParams.auth);
    }
    if($stateParams.distributionTimeStart != undefined && $stateParams.distributionTimeStart != ''){
        $scope.$parent.params.distributionTimeStart = $stateParams.distributionTimeStart;
    }
    if($stateParams.distributionTimeEnd != undefined && $stateParams.distributionTimeEnd != ''){
        $scope.$parent.params.distributionTimeEnd = $stateParams.distributionTimeEnd;
    }
    if($stateParams.compeleteTimeStart != undefined && $stateParams.compeleteTimeStart != ''){
        $scope.$parent.params.compeleteTimeStart = $stateParams.compeleteTimeStart;
    }
    if($stateParams.compeleteTimeEnd != undefined && $stateParams.compeleteTimeEnd != ''){
        $scope.$parent.params.compeleteTimeEnd = $stateParams.compeleteTimeEnd;
    }
    if(!isPropertyEmpty($stateParams.urgentDegree)) $scope.$parent.params.urgentDegree = $stateParams.urgentDegree;
    if(!isPropertyEmpty($stateParams.language)) $scope.$parent.params.language = $stateParams.language;
}

//根据用户id选出用户
function filterUserById(users, id){
    return filterElemByProperty(users, 'uId', id);
}

//根据元素的某个属性从列表中选出某个元素
function filterElemByProperty(array, propertyName, propertyValue){
    //var sss = new Array();
    for(var i = 0; i < array.length; i++){
        var elem = array[i];
        if(elem[propertyName] == propertyValue){
            return elem;
        }
    }
}

function checkBoxSingle(data, checkb){
    console.log('2333');
    selectOne(data, checkb, 'isCheck');
}
angular.module('app.routes').controller('NewSongController',['$scope','$http','$stateParams','$cookies','$filter','$timeout','$rootScope','display','$state','SweetAlert', 'TaskService',function($scope,$http,$stateParams,$cookies,$filter,$timeout,$rootScope,display,$state,SweetAlert, TaskService){
    //记录当前界面的tab
    $scope.nowTab = "";

    $scope.params = new Object();
    if($scope.datas == undefined){
        $scope.datas = [];
    }
    if($scope.cyr_list == undefined){
        $scope.cyr_list = [];
    }
    //$scope.choseArr = [];
    //用于判断当前url是否有userId参数
    $scope.userId = $stateParams.uId;
    if($scope.userId == undefined && ($stateParams.taskStatus == 1 || $stateParams.taskStatus == 2)){
        $scope.userId = -1;
    }
    $scope.userRole = 'cyr';
    $scope.taskStatus = $stateParams.taskStatus;
    //if($stateParams.status == 0){
    //    $scope.show = true;
    //}else{
    //    $scope.show = false;
    //}
    $scope.pId = $stateParams.pId;
    $scope.uId = _session.id;
    var param = {};
    param.pId = $stateParams.pId;
    //param.uId = -1;
    param.status = $stateParams.status;
    var p_param= {};
    p_param.id = $stateParams.pId;
    var p_type = '';
    //获取项目的流程
    getTaskContent($scope, $stateParams, $http);
    //$http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data='+ JSON.stringify(p_param)).success(function(res){
    //    $scope.p_type = res.data.list[0].flowType;
    //    $scope.cyr_list = [];
    //    for(var i = 0; i < res.data.list[0].cyrList.length;i++){
    //        $scope.cyr_list.push(res.data.list[0].cyrList[i]);
    //    }
    //    for(var i = 0; i < res.data.list[0].fzrList.length;i ++){
    //        $scope.cyr_list.push(res.data.list[0].fzrList[i]);
    //        if(res.data.list[0].fzrList[i].uid == _session.id){
    //            $scope.userRole = 'fzr';
    //        }
    //    }
    //});
    $scope.user = undefined;
    //$scope.removeUser = function(){ //去除分配人的方法
    //    //console.log($scope.user);
    //    $scope.user = undefined;
    //};
    //获取项目的自定义权限分配模板（A,B,AB之类的）
    $scope.authoritySetting = [];
    $http.jsonp(uc_new_song_auth + "?" + CALLBACK + "&pId=" + $stateParams.pId).success(function(res){
        if(res.returnCode == "000000"){
            $scope.authoritySetting = res.list;
            $scope.params.task_auth_setting = $scope.authoritySetting[0];
        }
    });

    $scope.selectCyr = function(v){ //select选择参与人分配/查看任务的方法
        //console.log($scope.user);
        //console.log(v);
        $scope.user = {};
        if(v != undefined){
            $scope.user.name = v.uName;
            $scope.user.id = v.uid;
        }
    };
    //分配任务
    $scope.distributionTask = function(userId){
        var authSetting = $scope.params.task_auth_setting;
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
    $scope.export = function(){ //导出数据
        exportData($scope);
    };
    //复选框的单个选择
    $scope.chk = function(data, checkb){
        //ucTaskSelectOne($scope, data, checkb);
        selectOne(data, checkb, 'isCheck');
    };
    //复选框的全选
    $scope.checkAll = function(all, datas){
        //ucTaskSelectAll($scope, all, datas);
        selectAll($scope, datas, 'isCheck', 'allIsCheck');
    };
    //处理单个歌曲
    $scope.dealSong = function(data){
        //console.log(data);
        editJump($http,'song',data,$state,SweetAlert,'_self', $stateParams);
    };
    $scope.rightClick = function (data) {
        editJump($http,'song',data,$state,SweetAlert, '_blank', $stateParams);
    };
    //分页函数
    $scope.choosePage = function(pageType){
        console.log(pageType);
        //var id = getIdByName($scope.params.selectedUser, $scope.cyr_list);
        $stateParams.pageNo = $scope.params.currentPage;
        //getUcTaskDatas('song', id, $scope, $stateParams, $http);
        $state.go('app.uc_task_new_song.' + pageType, {pageNo: $scope.params.currentPage, taskStatus: $stateParams.taskStatus, uId: $stateParams.uId});
    };
    $scope.removeErrorType = function(obj){
        obj.$parent.data.errorType.remove(obj.tag);
    };
    $scope.jumpInfo = function(type,id){
        var param = {};
        param[type+'Id'] = id;
        param['lastPage'] = returnLastPageTime();
        window.open($state.href(type+'Info',param),'_blank');
    };
}]);
angular.module('app.routes').controller('NewSongUncompeleteController',['$scope','$http','$stateParams','$filter','$state','SweetAlert','BaseService',function($scope,$http,$stateParams,$filter,$state,SweetAlert,BaseService){
    $stateParams.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
    $scope.$parent.nowTab = "uc_task_new_song.uncompelete";

    //console.log('未完成');
    // if($stateParams.dataState == undefined){
    //     $stateParams.dataState = '10';
    // }
    fillSearchConditionAgain($stateParams, $scope);
    $stateParams.uId = JSON.parse(localStorage.getItem("ngStorage-loginUserInfo")).uid;
    getUcTaskDatasNewSong('copyright', '1', $stateParams.uId, $scope, $stateParams, $http,SweetAlert);
    $scope.$parent.pageType = "uncompelete";
    //打开日期框
    $scope.open = function(flag) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        } else if (flag == 2){
            $scope.dateStatus.opened2 = true;
        }
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false
    };
    $scope.paramsSearchClick = function(){
        $state.go('app.uc_task_new_song.uncompelete',{taskStatus:$scope.params.taskStatus,productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, dataState: $scope.params.dataState, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), auth: $scope.params.auth, errorTypeTag: $scope.params.errorTypeTag,urgentDegree:$scope.params.urgentDegree,language:$scope.params.language,songId:$scope.params.songId,pageNo:1});
    };
    $scope.reset = function () {
        $scope.params = {};
        var promise = BaseService.service.clearExcelSearch(4);
        if(promise) promise.then(function (res) {
            if(res.code != '000000') sweetAlertCommon(SweetAlert, '清空excel查询失败', 'error');
        })
    }
}])
angular.module('app.routes').controller('NewSongAssignedController',['$scope', '$stateParams', '$http', '$filter', '$state', 'BaseService',function($scope, $stateParams, $http, $filter, $state, BaseService){
    $scope.$parent.nowTab = "uc_task_new_song.assigned";

    //console.log('已分配');
    fillSearchConditionAgain($stateParams, $scope);
    getUcTaskDatasNewSong('copyright', '1', $stateParams.uId, $scope, $stateParams, $http);
    $scope.$parent.pageType = "assigned";
    //打开日期框
    $scope.open = function(flag) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        } else if (flag == 2){
            $scope.dateStatus.opened2 = true;
        }
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false
    };
    $scope.paramsSearchClick = function(){
        //console.log($scope.params.user);
        // if($scope.params.user != undefined){
        $state.go('app.uc_task_new_song.assigned',{taskStatus:$scope.params.taskStatus,productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, songId: $scope.params.songId, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, dataState: $scope.params.dataState, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), uId: $scope.params.uId, errorTypeTag: $scope.params.errorTypeTag,urgentDegree:$scope.params.urgentDegree,language:$scope.params.language,pageNo:1});
        //$state.go('uc_task_new_song.unassigned',{productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, filterCondition: $scope.params.filterCondition, songId: $scope.params.songId, creatTimeStart: formatDate(Date.parse($scope.params.creatTimeStart),$filter), creatTimeEnd: formatDate(Date.parse($scope.params.creatTimeEnd),$filter), projectName: $scope.params.projectName, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, uId: $scope.params.user.uId, errorTypeTag: $scope.params.errorTypeTag});
        // } else {
        //     $state.go('app.uc_task_new_song.assigned',{productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, songId: $scope.params.songId, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, dataState: $scope.params.dataState, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), uId: '', errorTypeTag: $scope.params.errorTypeTag});
        // }
    };
    $scope.reset = function () {
        $scope.params = {};
        var promise = BaseService.service.clearExcelSearch(4);
        if(promise) promise.then(function (res) {
            if(res.code != '000000') sweetAlertCommon(SweetAlert, '清空excel查询失败', 'error');
        })
    }
}]);
angular.module('app.routes').controller('NewSongUnassignedController',['$scope', '$stateParams', '$http', '$filter','$state', 'BaseService',function($scope, $stateParams, $http, $filter,$state, BaseService){
    $scope.$parent.nowTab = "uc_task_new_song.unassigned";

    fillSearchConditionAgain($stateParams, $scope);

    getUcTaskDatasNewSong('copyright', '0', $stateParams.uId, $scope, $stateParams, $http);
    $scope.$parent.pageType = "unassigned";
    //打开日期框
    $scope.open = function(flag) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        } else if (flag == 2){
            $scope.dateStatus.opened2 = true;
        }
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false
    };
    $scope.paramsSearchClick = function(){
        console.log($scope.params.user);
        if($scope.params.user != undefined){
            $state.go('app.uc_task_new_song.unassigned',{productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, filterCondition: $scope.params.filterCondition, songId: $scope.params.songId, creatTimeStart: formatDate(Date.parse($scope.params.creatTimeStart),$filter), creatTimeEnd: formatDate(Date.parse($scope.params.creatTimeEnd),$filter), projectName: $scope.params.projectName, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, uId: $scope.params.user.uId, errorTypeTag: $scope.params.errorTypeTag,urgentDegree:$scope.params.urgentDegree,language:$scope.params.language,pageNo:1});
        } else {
            $state.go('app.uc_task_new_song.unassigned',{productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, filterCondition: $scope.params.filterCondition, songId: $scope.params.songId, creatTimeStart: formatDate(Date.parse($scope.params.creatTimeStart),$filter), creatTimeEnd: formatDate(Date.parse($scope.params.creatTimeEnd),$filter), projectName: $scope.params.projectName, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, uId: '', errorTypeTag: $scope.params.errorTypeTag,urgentDegree:$scope.params.urgentDegree,language:$scope.params.language,pageNo:1});
        }
    };
    $scope.reset = function () {
        $scope.params = {};
        var promise = BaseService.service.clearExcelSearch(4);
        if(promise) promise.then(function (res) {
            if(res.code != '000000') sweetAlertCommon(SweetAlert, '清空excel查询失败', 'error');
        })
    }
}]);
angular.module('app.routes').controller('NewSongCompeleteController',['$scope','$http','$stateParams','$filter','$state','BaseService',function($scope,$http,$stateParams,$filter,$state,BaseService){
    $scope.$parent.nowTab = "uc_task_new_song.compelete";

    console.log('已完成');
    fillSearchConditionAgain($stateParams, $scope);
    getUcTaskDatasNewSong('copyright', '3', $stateParams.uId, $scope, $stateParams, $http);
    $scope.$parent.pageType = "compelete";
    //打开日期框
    $scope.open = function(flag) {
        $scope.dateStatus['opened' + flag] = true;
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false,
        opened3: false,
        opened4: false
    };
    $scope.paramsSearchClick = function(){
        $state.go('app.uc_task_new_song.compelete',{taskStatus:$scope.params.taskStatus,productSongName: $scope.params.productSongName, productAlbumName: $scope.params.productAlbumName, productArtistName: $scope.params.productArtistName, cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), compeleteTimeStart: formatDate(Date.parse($scope.params.compeleteTimeStart),$filter), compeleteTimeEnd: formatDate(Date.parse($scope.params.compeleteTimeEnd),$filter),urgentDegree:$scope.params.urgentDegree,language:$scope.params.language,songId:$scope.params.songId,pageNo:1});
    };
    $scope.reset = function () {
        $scope.params = {};
        var promise = BaseService.service.clearExcelSearch(4);
        if(promise) promise.then(function (res) {
            if(res.code != '000000') sweetAlertCommon(SweetAlert, '清空excel查询失败', 'error');
        })
    }
}]);
angular.module('app.routes').controller('NewSongImportController', ['$scope','$uibModalInstance','SweetAlert','$stateParams','$timeout',function($scope,$uibModalInstance,SweetAlert,$stateParams,$timeout){
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.downloadTpl = function(){
        var url = environment + '/cmssearch/resources/excel/newsong.xlsx';
        window.open(url);
    };
    $scope.import = function(){
        var filename = $('#excelFile').val();
        if(filename == undefined || filename == ''){
            $scope.error = '请选择上传的excel文件';
            return;
        }
        var url = _search_url + "/search/task/copyright/exlQuery.json";
        ajaxFileUpload(url, $scope, '', $uibModalInstance, SweetAlert,'excelFile',$stateParams,undefined,$timeout);
    };
}]);
angular.module('app.routes').controller('NewSongExportController', ['$state','$scope','$uibModalInstance','SweetAlert','$stateParams','datas','params',function($state,$scope,$uibModalInstance,SweetAlert,$stateParams,datas,params){
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.export = function(){
        var _data = {};
        if(checkEmpty(datas))
            return sweetAlertCommon(SweetAlert, '暂无数据', 'warning');
        if(checkEmpty($scope.export.type))
            return sweetAlertCommon(SweetAlert, '请选择导出操作类型', 'warning');
        _data = compeleteUrlDataNewSong(_data, 0, $stateParams.uId, $scope, $stateParams);
        if($state.current.name.indexOf('uncompelete') != -1 && !_data.uid) _data.uid = JSON.parse(localStorage.getItem("ngStorage-loginUserInfo")).uid;   //首次进来调用
        switch($scope.export.type){
            case '1':
                var ids = [];
                datas.forEach(function (val) {
                    if(val.isCheck) ids.push(val['copyrightId']);
                });
                if(ids.length == 0){
                    return sweetAlertCommon(SweetAlert, '请选择要导出的数据', 'warning');
                }
                _data.copyrightIds = ids;
                break;
            case '2':
                if(checkEmpty($scope.export.startNo) || checkEmpty($scope.export.endNo)) return sweetAlertCommon(SweetAlert, '请填写完整的序号起止数目', 'warning');
                // _data = excludeProperties(params,['pageSize','pageNo']);
                _data.startNo = $scope.export.startNo - 1,_data.endNo = $scope.export.endNo - 1;
                break;
            case '3':
                if(checkEmpty($scope.export.pageStart) || checkEmpty($scope.export.pageEnd)) return sweetAlertCommon(SweetAlert, '请填写完整的起止页数', 'warning');
                // _data = excludeProperties(params,['pageSize','pageNo']);
                _data.startNo = ($scope.export.pageStart - 1) * _data.pageSize;
                _data.endNo = ($scope.export.pageEnd) * _data.pageSize - 1;
                break;
        }
        window.open(_search_url + 'search/task/copyright/export.json?data=' + JSON.stringify(_data), '_blank');
    };
}]);
angular.module('app.routes').controller('NewSongDeleteController', ['$scope','$uibModalInstance','$http','SweetAlert','$stateParams','$timeout','datas','params',function($scope,$uibModalInstance,$http,SweetAlert,$stateParams,$timeout,datas,params){
    $scope.export = {};
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        console.log(datas);
        console.log(params);
        var _data = {},_taskIds;
        if(checkEmpty(datas))
            return sweetAlertCommon(SweetAlert, '暂无数据', 'warning');
        if(checkEmpty($scope.export.type))
            return sweetAlertCommon(SweetAlert, '请选择导出操作类型', 'warning');
        if(checkEmpty($stateParams.pageSize)) $stateParams.pageSize = 100;
        _data = compeleteUrlDataNewSong(_data, 0, $stateParams.uId, $scope, $stateParams);
        var url = uc_new_song + "copyrightDel.json?" + CALLBACK + "&data=";
        switch($scope.export.type){
            case '1':
                var ids = [];
                datas.forEach(function (val) {
                    if(val.isCheck) ids.push(val['taskId']);
                });
                if(ids.length == 0){
                    return sweetAlertCommon(SweetAlert, '请选择要导出的数据', 'error');
                }
                _taskIds = ids;
                break;
            case '2':
                if(checkEmpty($scope.export.startNo) || checkEmpty($scope.export.endNo)) return sweetAlertCommon(SweetAlert, '请填写完整的序号起止数目', 'warning');
                // _data = excludeProperties(params,['pageSize','pageNo']);
                _data.startNo = $scope.export.startNo - 1,_data.endNo = $scope.export.endNo - 1;
                break;
            case '3':
                if(checkEmpty($scope.export.pageStart) || checkEmpty($scope.export.pageEnd)) return sweetAlertCommon(SweetAlert, '请填写完整的起止页数', 'warning');
                // _data = excludeProperties(params,['pageSize','pageNo']);
                _data.startNo = ($scope.export.pageStart - 1) * $stateParams.pageSize;
                _data.endNo = ($scope.export.pageEnd) * $stateParams.pageSize - 1;
                break;
        }
        url += encodeURIComponent(JSON.stringify(_data));
        if(_taskIds) url += '&taskIds=' + _taskIds;
        $http.jsonp(url).success(function(res){
            if(res.returnCode == '000000'){
                sweetAlertCommon(SweetAlert);
                $timeout(function () {
                    location.reload();
                }, 1000);
            } else{
                sweetAlertCommon(SweetAlert, res.description, 'warning');
            }
        }).error(function () {
            sweetAlertCommon(SweetAlert, "批量删除接口异常", 'warning');
        })
    };
}]);