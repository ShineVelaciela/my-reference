/**
 * Created by YuChunzhuo on 2016/3/28.
 */
angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.uc_task_new_song_tag',{
            url: '/uc_atask_new_song_tag?:pId&:status&:taskStatus&:uId&:pageNo&:pageSize&:taskStatusList',
            templateUrl: 'app/views/uc/new_song_tag/uc_task_new_song_tag.html',
            controller: 'NewSongTagController'
        })
        //未分配
        .state('app.uc_task_new_song_tag.unassigned',{
            url: "/unassigned?:catalogSongName&:catalogAlbumName&:catalogArtistName&:cid&:filterCondition&:songId&:creatTimeStart&:creatTimeEnd&:projectName&:newOrFirst&:degree&:errorTypeTag",
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song_tag/unassigned.html',
                    controller: 'NewSongTagUnassignedController'
                }
            }
        })
        //已分配
        .state('app.uc_task_new_song_tag.assigned',{
            url: "/assigned?:cid&:catalogSongName&:catalogAlbumName&:catalogArtistName&:songId&:tagStatus&:newOrFirst&:degree&:projectName&:distributionTimeStart&:distributionTimeEnd",
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song_tag/assigned.html',
                    controller: 'NewSongTagAssignedController'
                }
            }
        })
        //未完成
        .state('app.uc_task_new_song_tag.uncompelete',{
            url: "/uncompelete?:cid&:catalogSongName&:catalogAlbumName&:catalogArtistName&:songId&:tagStatus&:newOrFirst&:degree&:projectName&:distributionTimeStart&:distributionTimeEnd&:errorTypeTag",
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song_tag/uncompelete.html',
                    controller: 'NewSongTagUncompeleteController'
                }
            }
        })
        //已完成
        .state('app.uc_task_new_song_tag.compelete',{
            url: "/compelete?:cid&:catalogSongName&:catalogAlbumName&:catalogArtistName&:songId&:newOrFirst&:degree&:projectName&:distributionTimeStart&:distributionTimeEnd&:compeleteTimeStart&:compeleteTimeEnd",
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/new_song_tag/compelete.html',
                    controller: 'NewSongTagCompeleteController'
                }
            }
        })
}]);
angular.module('app.routes').controller('NewSongTagController',['$scope','$http','$stateParams','$cookies','$filter','$timeout','$rootScope','display','$state',function($scope,$http,$stateParams,$cookies,$filter,$timeout,$rootScope,display,$state){
    //记录当前界面的tab
    $scope.nowTab = "";

    $scope.params = new Object();
    $scope.datas = [];
    $scope.cyr_list = [];
    //用于判断当前url是否有userId参数
    $scope.userId = $stateParams.uId;
    if($scope.userId == undefined && ($stateParams.taskStatus == 1 || $stateParams.taskStatus == 2)){
        $scope.userId = -1;
    }
    $scope.userRole = 'cyr';
    $scope.taskStatus = $stateParams.taskStatus;
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
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data='+ JSON.stringify(p_param)).success(function(res){
        $scope.p_type = res.data.list[0].flowType;
        $scope.cyr_list = [];
        for(var i = 0; i < res.data.list[0].cyrList.length;i++){
            $scope.cyr_list.push(res.data.list[0].cyrList[i]);
        }
        for(var i = 0; i < res.data.list[0].fzrList.length;i ++){
            $scope.cyr_list.push(res.data.list[0].fzrList[i]);
            if(res.data.list[0].fzrList[i].uid == _session.id){
                $scope.userRole = 'fzr';
            }
        }
    });
    $scope.user = undefined;
    //获取项目是第多少个自定义权限分配模板（A,B,AB之类的）
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
    $scope.distributionTask = function(){
        //console.log($scope.params.task_auth_setting);
        authSetting = $scope.params.task_auth_setting;
        //console.log($scope.datas);
        var taskIds = getPropertyFromCheckBox($scope.datas, "isCheck", true, "taskId");
        //console.log(taskIds);
        if($scope.user == undefined || $scope.user.id == undefined){
            alertTipCommon($timeout,$rootScope,'没有选择分配人',display);
            return;
        }
        //分配任务
        //assignTask('song', uId, $scope, $stateParams, $http);
        assignTaskNewSong(taskIds, authSetting.flowId, authSetting.auth, $scope.user.id, $scope, $http,$timeout,$rootScope,display);
    };

    $scope.dealNewSongTag = function(songId, taskId){
        $http.jsonp(http_url + '/tagRel/edit/song/' + songId + '.json?' + CALLBACK + '&taskId=' + taskId).success(function(res){ //锁定打标签状态
            if(res.status != 1){
                alertTipCommon($timeout,$rootScope,'该数据无编辑权限',display);
                return;
            }else{
                alertTipCommon($timeout,$rootScope,'状态锁定成功',display);
            }
            var url = $state.href('app.tagging.info',{songId:songId});    //状态锁定成功后进入打标签页面
            window.open(url, '_blank');
        })
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
    //分页函数
    $scope.choosePage = function(pageType){
        //var id = getIdByName($scope.params.selectedUser, $scope.cyr_list);
        $stateParams.pageNo = $scope.params.currentPage;
        //getUcTaskDatas('song', id, $scope, $stateParams, $http);
        $state.go('app.uc_task_new_song_tag.' + pageType, {pageNo: $scope.params.currentPage, taskStatus: $stateParams.taskStatus, uId: $stateParams.uId});
    };
    //预设分配AB权限
    $scope.authoritySetting = [
        {
            name:'全权限',
            value:'AB'
        },
        {
            name:'A权限',
            value:'A'
        },
        {
            name:'B权限',
            value:'B'
        }
    ];
    $scope.setting = $scope.authoritySetting[0];

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
angular.module('app.routes').controller('NewSongTagUnassignedController',['$scope', '$stateParams', '$http', '$filter','$state',function($scope, $stateParams, $http, $filter,$state){
    $scope.nowTab = "unassigned";
    fillSearchCondition($stateParams, $scope);

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
        $state.go('app.uc_task_new_song_tag.unassigned',{cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, filterCondition: $scope.params.filterCondition, songId: $scope.params.songId, creatTimeStart: formatDate(Date.parse($scope.params.creatTimeStart),$filter), creatTimeEnd: formatDate(Date.parse($scope.params.creatTimeEnd),$filter), projectName: $scope.params.projectName, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, errorTypeTag: $scope.params.errorTypeTag});
    };
    $scope.reset = function () {
        $scope.params = {};
    };
}]);
angular.module('app.routes').controller('NewSongTagAssignedController',['$scope', '$stateParams', '$http', '$filter', '$state',function($scope, $stateParams, $http, $filter, $state){
    $scope.nowTab = "assigned";

    fillSearchCondition($stateParams, $scope);
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
        if($scope.params.user != undefined){
            $state.go('app.uc_task_new_song_tag.assigned',{cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, songId: $scope.params.songId, tagStatus: $scope.params.tagStatus, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), uId: $scope.params.user.uid, errorTypeTag: $scope.params.errorTypeTag});
        } else {
            $state.go('app.uc_task_new_song_tag.assigned',{cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, songId: $scope.params.songId, tagStatus: $scope.params.tagStatus, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), uId: '', errorTypeTag: $scope.params.errorTypeTag});
        }
    };
    $scope.reset = function () {
        $scope.params = {};
    };
}]);
angular.module('app.routes').controller('NewSongTagUncompeleteController',['$scope','$http','$stateParams','$filter','$state',function($scope,$http,$stateParams,$filter,$state){
    $scope.nowTab = "uncompelete";

    if($stateParams.tagStatus == undefined){
        $stateParams.tagStatus = '10';
    }
    fillSearchCondition($stateParams, $scope);
    getUcTaskDatasNewSong('copyright', '1', $stateParams.uId, $scope, $stateParams, $http);
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
        $state.go('app.uc_task_new_song_tag.uncompelete',{cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, songId:$scope.params.songId, tagStatus: $scope.params.tagStatus, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), errorTypeTag: $scope.params.errorTypeTag});
    };
    $scope.reset = function () {
        $scope.params = {};
    };
}]);
angular.module('app.routes').controller('NewSongTagCompeleteController',['$scope','$http','$stateParams','$filter','$state',function($scope,$http,$stateParams,$filter,$state){
    $scope.nowTab = "compelete";

    console.log('已完成');
    fillSearchCondition($stateParams, $scope);
    getUcTaskDatasNewSong('copyright', '3', $stateParams.uId, $scope, $stateParams, $http);
    $scope.$parent.pageType = "compelete";
    //打开日期框
    $scope.open = function(flag) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        } else if (flag == 2){
            $scope.dateStatus.opened2 = true;
        } else if (flag == 3){
            $scope.dateStatus.opened3 = true;
        } else if (flag == 4){
            $scope.dateStatus.opened4 = true;
        }
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false,
        opened3: false,
        opened4: false
    };
    $scope.paramsSearchClick = function(){
        $state.go('app.uc_task_new_song_tag.compelete',{cid: $scope.params.cid, catalogSongName: $scope.params.catalogSongName, catalogAlbumName: $scope.params.catalogAlbumName, catalogArtistName: $scope.params.catalogArtistName, songId: $scope.params.songId, newOrFirst: $scope.params.newOrFirst, degree: $scope.params.degree, projectName: $scope.params.projectName, distributionTimeStart: formatDate(Date.parse($scope.params.distributionTimeStart),$filter), distributionTimeEnd: formatDate(Date.parse($scope.params.distributionTimeEnd),$filter), compeleteTimeStart: formatDate(Date.parse($scope.params.compeleteTimeStart),$filter), compeleteTimeEnd: formatDate(Date.parse($scope.params.compeleteTimeEnd),$filter)});
    };
    $scope.reset = function () {
        $scope.params = {};
    };
}]);
function fillSearchCondition($stateParams, $scope){
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
        //$("select.uc_tagStatus").val($stateParams.dataState);
    }
    if($stateParams.tagStatus != undefined && $stateParams.tagStatus != ''){
        $scope.$parent.params.tagStatus = $stateParams.tagStatus;
        //$("select.uc_tagStatus").val($stateParams.dataState);
    }
    if($stateParams.degree != undefined && $stateParams.degree != ''){
        $scope.$parent.params.degree = $stateParams.degree;
    }
    if($stateParams.uId != undefined && $stateParams.uId != ''){
        //var user = filterUserById($scope.$parent.users, $stateParams.uId);
        //if(user != undefined){
        //    $("select.uc_user").find("option[text='余春灼']").attr("selected",true);
        //    //$scope.$parent.params.user = user.uName;
        //}
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