/**
 * Created by YuChunzhuo on 2016/1/5.
 */
'use strict';
var tempTagChoices = [{name:"人工错误",value:"1"},{name:"产品错误",value:"2"},{name:"业务不熟",value:"3"},{name:"产品侧",value:"4"},{name:"运营侧",value:"5"}];
angular.module('app.routes').config(checkSongConfig);
checkSongConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
function checkSongConfig($stateProvider, helper){
    $stateProvider
        .state('app.uc_task_check_song',{
            url: '/uc_task_check_song?:pId&:taskStatus&:uid&:pageNo&:pageSize&:taskStatusList&:copyrightId&:songIds&:songName&:albumName&:artistName&:editUserName&:auditUserName&:urgentDegree&:cpCreateStartTime&:cpCreateEndTime&:tags&:projectName&:hotScoreMin&:hotScoreMax&:status&:mscoreMin&:mscoreMax&:tagBeans&:dataType',
            title: '歌曲抽查',
            templateUrl: 'app/views/uc/check_song/uc_task_check_song.html',
            controller: 'CheckSongController'
        })
        .state('app.uc_task_check_song.unassigned',{
            url: '/unassigned?:sendStartTime&:sendEndTime',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_song/uncompelete.html',
                    controller: 'CheckSongUnassignedController'
                }
            }
        })
        .state('app.uc_task_check_song.assigned',{
            url: '/assigned?:sendStartTime&:sendEndTime',
            title: '歌曲抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_song/uncompelete.html',
                    controller: 'CheckSongAssignedController'
                }
            }
        })
        .state('app.uc_task_check_song.uncompelete',{
            url: '/uncompelete?:sendStartTime&:sendEndTime',
            title: '歌曲抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_song/uncompelete.html',
                    controller: 'CheckSongUncompeleteController'
                }
            }
        })
        .state('app.uc_task_check_song.compelete',{
            url: '/compelete?completeStartTime&:completeEndTime&:ckResult&:ckTagErrors',
            title: '歌曲抽查',
            views: {
                "condition": {
                    templateUrl: 'app/views/uc/check_song/uncompelete.html',
                    resolve: helper.resolveFor('localytics.directives'),
                    controller: 'CheckSongCompeleteController'
                }
            }
        })
}
angular.module('app.routes').controller('CheckSongController', ['$scope','$http','$stateParams','$state','$timeout','$rootScope','display', '$window', '$filter', '$cookies','SweetAlert', 'TaskService',function($scope,$http,$stateParams,$state,$timeout,$rootScope,display, $window, $filter, $cookies,SweetAlert, TaskService){
    // $state.go('app.uc_task_check_song.uncompelete', {"pId": "9137", "taskStatusList": "-1,1,2", "uid": JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid});
    $scope.tempscope = tempTagChoices;

    $scope.pageType = "";
    $scope.ucSongGitUsers = [];
    $scope.form = {};
    $scope.form.ckTagErrors = [];
    $scope.datas = [];
    $scope.userRole = 'cyr';
    $scope.taskStatus = $stateParams.taskStatus;
    $scope.dataType = checkEmpty($stateParams.dataType) ? 'song' : $stateParams.dataType;
    $scope.pId = $stateParams.pId;
    $scope.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
    $scope.ckTagError = {};
    //获取项目的自定义权限分配模板（A,B,AB之类的）
    $scope.authoritySetting = [];

    //获取项目的流程
    getTaskContent($scope, $stateParams, $http);
    //获取所有用户
    if($scope.$parent.users == undefined || $scope.$parent.users.length <= 0){
        getAllUser($http, function(users){
            $scope.$parent.users = users;
        });
    }

    //选择标签时候选择顶部标签
    $scope.selectMainTag = function(tag){
        $scope.tag_list = tag.children;
    };

    //选择需要搜索的标签
    $scope.searchTag = [];
    $scope.selectSearchTag = function(tag){
        //首先判断重复
        if($scope.searchTag != undefined && $scope.searchTag.length != 0){
            for(var i = 0; i < $scope.searchTag.length; i++){
                if($scope.searchTag[i].id == tag.id){
                    return;
                }
            }
        }
        //然后判断父标签是否重复
        //var tagIds = getPropertyFromCheckBox($scope.form.searchTag, 'undefined', undefined, 'id');
        if($scope.searchTag != undefined && $scope.searchTag.length != 0){
            //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
            //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
            for(var n = 0; n < $scope.searchTag.length; n++){
                var tempTag = $scope.searchTag[n];
                if(tag.ancestorId == tempTag.ancestorId){
                    $scope.searchTag[n] = tag;
                    return;
                }
            }
        }
        $scope.searchTag.push(tag);
    };

    //标签右上角的叉叉函数
    $scope.songTagRemove = function(tag){
        $scope.searchTag.remove(tag);
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
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'songId');
    };
    //复选框的全选
    $scope.checkAll = function(all, datas){
        selectAll($scope, datas, 'isCheck', 'allIsCheck');
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'songId');
    };
    //分页函数
    $scope.choosePage = function(pageType){
        //$stateParams.pageNo = $scope.params.currentPage;
        $state.go('app.uc_task_check_song.' + pageType, {pageNo: $scope.form.currentPage});
    };
    //点击查询按钮
    $scope.paramsSearchClick = function(type){
        var tagIds = [];
        for(var i = 0; i < $scope.searchTag.length; i++){
            tagIds.push($scope.searchTag[i].id);
        }

        $scope.form.tags = tagIds.join(",");
        //下面处理搜索字段
        var datas = cloneOneObject($scope.form);
        datas = iteratorData(datas, $filter);
        //对错误分类进行处理
        // datas.ckTagErrors = datas.ckTagErrors.join(',');

        // var ckTagErrors = [];
        // for(var i = 1; i <= 5; i++){
        //     if($scope.ckTagError["tag" + i]){
        //         ckTagErrors.push(i);
        //     }
        // }
        // console.log(ckTagErrors);
        // datas.ckTagErrors = ckTagErrors.join(",");

        var propertys = ['projectId','taskStatus','copyrightId','taskStatusList','songIds','songName','albumName','artistName','projectName','createStartTime','createEndTime','distributionStartTime','distributionEndTime','completeStartTime','completeEndTime','status','karakal_status','ckResult','ckTagErrors','scoreStart','scoreEnd','sendStartTime','sendEndTime','editUserName',
            'auditUserName','urgentDegree','uid','cpCreateStartTime','cpCreateEndTime','tags','hotScoreMin','hotScoreMax','status','mscoreMin','mscoreMax','tagBeans','dataType'];
        datas = keepObjectProperty(propertys, datas);

        datas.pId = $stateParams.pId;
        datas.taskStatus = $stateParams.taskStatus;
        datas.taskStatusList = $stateParams.taskStatusList;
        if(!checkEmpty(datas.tagBeans)){
            datas.tagBeans.forEach(function (val) {
                delete val.type;
            });
            datas.tagBeans = angular.toJson(datas.tagBeans);
        }

        console.log(datas);

        $state.go('app.uc_task_check_song.' + type, datas,{reload: true,inherit: false});
    };
    //查看素材信息
    $scope.showMaterialInfo = function(type, data){
        openNewTab(type, data, 'Info', $state);
    };
    //跳转到抽查页面
    $scope.jumpToCheck = function(data, type){
        jumpToCheck($state, type, data);
    };
    $scope.jumpToCheckTag = function (data) {
        var type = 'song';
        var param = {};
        param[type+'Id'] = data[type + 'Id'];
        param['lastPage'] = returnLastPageTime();
        param['taskId'] = data.taskId;
        var openUrl =  $state.href('material.taggingCheck',param);
        // document.body.addEventListener('click', function () {
        //     // 打开页面，此处最好使用提示页面
        //     var newWin = window.open('loading page');
        //
        //     // ajax().done(function() {
        //         // 重定向到目标页面
        //         newWin.location.href = openUrl;
        //     // });
        // });
        window.open(openUrl,'_blank');
        // jumptoCheckTag($state, 'song', data);
    };
    //播放歌曲
    $scope.addPlaySong = function(data){
        console.log(data);
        addPlaySong(data.songId, data.copyrightId,SweetAlert);
    };
    //重置搜索条件
    $scope.reset = function(){
        $scope.form = {};
        $scope.searchTag.length = 0;
        $scope.form.task_auth_setting = $scope.authoritySetting[0];
        if(!isPropertyEmpty($stateParams.uid) && ($scope.pageType == "uncompelete" || ($scope.pageType == "compelete" && $scope.userRole == "cyr"))){
            $scope.form.uid = $stateParams.uid;
        }
        for(var n in $scope.ckTagError){
            $scope.ckTagError[n] = false;
        }
        clearUploadExcel($http,0);
    };
    //导出excel
    //$scope.export = function(){
    //    exportMaterialExcel('song', $stateParams, $scope.datas);
    //};
    //打开日期框
    $scope.open = function(flag) {
        $scope.dateStatus["opened" + flag] = true;
    };
    $scope.dateStatus = {
        opened1: false, opened2: false, opened3: false, opened4: false, opened5: false, opened6: false
    };
    $scope.changeDataType = function (dataType) { //更新抽查数据类型
        var param = {};
        if(dataType == 'song') param.pId = 9137;  //歌曲抽查
        if(dataType == 'songTag') param.pId = 9140;  //标签抽查
        param.dataType = dataType;
        $state.go($state.current.name, param);
    }
}]);
angular.module('app.routes').controller('CheckSongUnassignedController',['$scope', '$http', '$stateParams', '$cookies', '$timeout', '$rootScope', 'display',function($scope, $http, $stateParams, $cookies, $timeout, $rootScope, display){
    ucGetSongTagTree($http, $scope, $stateParams,$timeout,$rootScope,display, function(){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree, "song");
    });

    $scope.$parent.pageType = "unassigned";
    $stateParams.projectId = $stateParams.pId;
    $stateParams.isQueryExcel = 1;
    ucCheckGetData("song", $stateParams, $scope, $http);
}]);
angular.module('app.routes').controller('CheckSongAssignedController',['$scope', '$http', '$stateParams', '$cookies', '$timeout','$rootScope','display',function($scope, $http, $stateParams, $cookies, $timeout,$rootScope,display){
    ucGetSongTagTree($http, $scope, $stateParams,$timeout,$rootScope,display, function(){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree, "song");
    });

    $scope.$parent.pageType = "assigned";
    $stateParams.projectId = $stateParams.pId;
    ucCheckGetData("song", $stateParams, $scope, $http);
}]);
angular.module('app.routes').controller('CheckSongUncompeleteController',['$scope', '$http', '$stateParams', '$cookies', '$timeout','$rootScope','display',function($scope, $http, $stateParams, $cookies, $timeout,$rootScope,display){
    $stateParams.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
    ucGetSongTagTree($http, $scope, $stateParams,$timeout,$rootScope,display, function(){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree, "song");
    });
    $scope.$parent.pageType = "uncompelete";
    $stateParams.projectId = $stateParams.pId;
    ucCheckGetData("song", $stateParams, $scope, $http);
}]);
angular.module('app.routes').controller('CheckSongCompeleteController',['$scope', '$http', '$stateParams', '$cookies', '$timeout','$rootScope','display',function($scope, $http, $stateParams, $cookies, $timeout,$rootScope,display){
    ucGetSongTagTree($http, $scope, $stateParams,$timeout,$rootScope,display, function(){
        ucCheckFillSearchCondition($stateParams, $scope, $http, $cookies, $scope.$parent.songTagTree, "song");
    });
    $scope.$parent.pageType = "compelete";
    $stateParams.projectId = $stateParams.pId;
    ucCheckGetData("song", $stateParams, $scope, $http);
    $scope.tagErrorChoose = function(t){ //添加错误分类
        tagErrorChoose(t,$scope);
    };
    $scope.ckTagErrorsRemove = function(c){
        $scope.form.ckTagErrors.remove(c);
    }
}]);
function tagErrorChoose(t,$scope){
    if(isPropertyEmpty(t)) return;
    if(checkEmpty($scope.form)) $scope.form = {};
    if(checkEmpty($scope.form.ckTagErrors)) $scope.form.ckTagErrors = [];
    if($scope.form.ckTagErrors.indexOf(t) != -1) return;
    $scope.form.ckTagErrors.push(t)
}
function clearUploadExcel($http,type){
    $http.jsonp(_search_url+'checksearch/resetCkUser.json?type='+type+'&'+CALLBACK).success(function(res){
        if(res.code == '000000') console.log('清空excel成功');
        else console.log('清空excel失败');
        // location.reload();
    });
}
//获取标签树并判断
function ucGetSongTagTree($http, $scope, $stateParams,$timeout,$rootScope,display, method){
    var songFilterTagTree = [];
    var song_tag_url = tag_tree_url + 'getTagsByMaterialAndUser.do?userId=' + _session.id + '&materialType=3&maxLevel=3';
    $http.get(song_tag_url).success(function(res){
        if(res.message == 'success'){
            //循环标签树设置祖先节点id
            for(var i = 0; i < res.tnList.length; i++){
                for(var j = 0; j < res.tnList[i].children.  length; j++){
                    res.tnList[i].children[j].ancestorId = res.tnList[i].id;
                    res.tnList[i].children[j].ancestorName = res.tnList[i].name;
                }
            }
            //把标签树保存下来供其它地方根据ID获取标签
            var songTagTree = res.tnList;
            $scope.$parent.songTagTree = cloneOneObject(res.tnList);
            songFilterTagTree.length = 0;
            for(var n = 0; n < songTagTree.length; n++ ){
                for(var m = 0; m < songTagTree[n].children.length; m++){
                    songFilterTagTree.push(songTagTree[n].children[m]);
                }
            }
            $scope.songFilterTagTree = songFilterTagTree;
            //ucSongFillSearchCondition($stateParams, $scope,songTagTree);
            ////下面的代码是拼凑歌曲页面顶部的标签树的结构
            var tags = [];
            for(var i=0; i < songTagTree.length; i++){
                var nodeList = [];
                var tag_all = getAllNode(songTagTree[i],nodeList);
                var tag = tag_all[tag_all.length -1];
                tag.children = [];
                for(var j = 0; j < tag_all.length - 1;j++){
                    tag.children.push(tag_all[j]);
                }
                tags.push(tag);
            }
            //console.log(tags);
            $scope.tags_title = tags;

            method();
        } else {
            console.log(res);
            //alert('返回异常，无法加载标签，返回值:' + JSON.stringify(res));
            alertTipCommon($timeout,$rootScope,'返回异常，无法加载标签，返回值:' + JSON.stringify(res),display);
        }
        //点击顶部标签展开下级的标签
        if($stateParams.id != undefined){
            for(var i = 0; i < $scope.tags_title.length; i++){
                if($scope.tags_title[i].id == $stateParams.id){
                    $scope.tags_list = $scope.tags_title[i].children;
                }
            }
        }
    }).error(function(res){
        //alert('网络错误，无法加载标签');
        alertTipCommon($timeout,$rootScope,'网络错误，无法加载标签',display);
    });
}
