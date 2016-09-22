/**
 * Created by hao.cheng on 2016/1/7.
 * comment_controller
 */
var arr_type = ['album','song','playlist'];
var hide_ids = [];
angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.comment',{
            url: '/comment/:type',
            templateUrl: 'app/views/comment/comment.html',
            controller: 'CommentController'
        })
        .state('app.comment.search',{
            url: '/search?:name&:album&:artist&:no&:len&:pageNo&:pageSize',
            views:{
                'comment-saved-list':{
                    templateUrl: 'app/views/comment/comment-saved-list.html',
                    controller: 'CommentSearchSavedController'
                },
                'comment-list':{
                    templateUrl: 'app/views/comment/comment-list.html',
                    controller: 'CommentSearchController'
                }
            }
        })
}]);
angular.module('app.routes').controller('CommentController', ['$http','$scope','$stateParams','$state','$rootScope',function($http,$scope,$stateParams,$state,$rootScope){
    $scope.type = {};
    $scope.data = {};
    $scope.info = '';
    var arr = ['专辑','歌曲','歌单'];
    $scope.type.name = arr[$stateParams.type];
    $scope.type.num = $stateParams.type;
    $scope.search = function(no){
        $state.go('app.comment.search',{no:no});
    };
    $scope.export = function(){
        window.open(comment_export + arr_type[$stateParams.type] + '.do');
    };
    $rootScope.pageTitle = ($stateParams.type == 0 && '专辑评论') || ($stateParams.type == 1 && '歌曲评论') || ($stateParams.type == 2 && '歌单评论');
}]);
angular.module('app.routes').controller('CommentSearchSavedController', ['$http','$scope','$stateParams','display','$rootScope','$timeout','SweetAlert',function($http,$scope,$stateParams,display,$rootScope,$timeout,SweetAlert){
    //console.log($stateParams.name);
    var url = comment_song_excelid + arr_type[$stateParams.type] + '.json?callback=JSON_CALLBACK';
    if($stateParams.no != undefined && $stateParams.no != null && $stateParams.no != ''){
        url += '&no=' + $stateParams.no;
    } else {
        return;
    }
    $http.jsonp(url).success(function(res){
        $scope.info = res.data.list[0];
        //console.log($scope.info);
        var id = res.data.list[0].id;
        $http.jsonp(comment_saved_list + arr_type[$stateParams.type] + '/' + id + '.json?callback=JSON_CALLBACK').success(function(resp){
            hide_ids = [];
            $scope.saved_datas = resp.data.list;
            for(var i in $scope.saved_datas){
                for(var p in $scope.saved_datas[i]){
                    if(p == 'sourceId'){
                        hide_ids.push($scope.saved_datas[i][p]);
                    }
                }
            }
            //console.log(hide_ids);
        });
    });
    $scope.addPlaySong = function(songId,copyId){//歌曲播放
        if(!copyId) return sweetAlertCommon(SweetAlert, '暂无试听版权', 'warning');
        addPlaySong(songId, SweetAlert, [], copyId.split(','), 0)
    };
    $scope.saveComment = function(data,content,n){//保存评论
        //console.log(content);
        if(content == '' || content == undefined){
            sweetAlertCommon(SweetAlert,'评论不能为空','warning');
            //alert('评论不能为空');
            return;
        }
        if(content != undefined && content != null && content != '' && content.trim() != '{{data.content}}'){
            data.content = content;
        }
        var param = data;
        param.status = 0;
        //alertTooltip(true,$rootScope,'操作进行中...',display);//操作进行中提示
        $.post(comment_save + arr_type[$stateParams.type] + '.json','data='+encodeURIComponent(JSON.stringify(param))).success(function(res){
            if(res.status == 1){
                data.status = 0;
                n.isSaved = true;
                sweetAlertCommon(SweetAlert,res.msg,'success');
            }else{
                sweetAlertCommon(SweetAlert,res.msg,'error');
            }
        });
        //$http.jsonp(comment_save + arr_type[$stateParams.type] + '.json?'+CALLBACK+'&data='+JSON.stringify(data)).success(function(res){
        //    alertCommon(res,'保存');
        //    n.isSaved = true;
        //    console.log(res);
        //});
    }
    $scope.deleteComment = function(data){//删除评论
        data.status = -1;
        $http.get(comment_save + arr_type[$stateParams.type] + '.json?data='+encodeURIComponent(JSON.stringify(data))).success(function(res){
            if(res.status != 1){
                data.status = 0;
                sweetAlertCommon(SweetAlert,res.msg,'error');
            }else{
                sweetAlertCommon(SweetAlert,res.msg,'success');
            }
            //alertCommon(res,'取消');
        });
    }
    $scope.newComments = [];
    $scope.addComment =function(){
        var obj = {};
        $scope.newComments.push(obj);
        $scope.newData = {};
        $scope.newData.relId = $scope.info.id;
        $scope.newData.isSaved = false;
    }
}]);
angular.module('app.routes').controller('CommentSearchController', ['$scope','$http','$stateParams','$state','$timeout','$rootScope','display','SweetAlert',function($scope,$http,$stateParams,$state,$timeout,$rootScope,display,SweetAlert){
    if($stateParams.len == undefined || $stateParams.len == ''){
        $stateParams.len = 50;
    }
    var t = arr_type[$stateParams.type];
    var url = comment_song_excelid + arr_type[$stateParams.type] + '.json?callback=JSON_CALLBACK';
    if($stateParams.no != undefined && $stateParams.no != null && $stateParams.no != ''){
        url += '&no=' + $stateParams.no;
    } else {
        return;
    }

    if(checkEmpty($stateParams.pageNo)) $stateParams.pageNo = 1;
    if(checkEmpty($stateParams.pageSize)) $stateParams.pageSize = 50;
    function getSourceComment(data){//获取源网站评论数据
        $http(new PostSetup(MDPFACE_URL + arr_type[$stateParams.type] + '/comments.json', 'data=' + data)).success(function (res) {
            $scope.comment_all = res.body.list;
            $http(new PostSetup(MDPFACE_URL + arr_type[$stateParams.type] + '/comment/count.json', 'data=' + data)).success(function (res2) {
                $scope.comment_all.totalCount = res2.body;
                paginationDiscreteness($scope,5,res.body.pageSize,res2.body, Math.ceil(res2.body / res.body.pageSize),res.body.pageNo);
            });
            console.log(res);
        }).error(function (res) {
            sweetAlertCommon(SweetAlert, '抓取评论查询接口请求异常');
        });
        // $http.jsonp(comment_all + site + '/' + t + '.json?callback=JSON_CALLBACK&relIds=' + siteIds[site].join(',') + '&contentMinLen=' + $stateParams.len + '&pageNo=' + $stateParams.pageNo + '&pageSize=' + $stateParams.pageSize + '&excIds=' + hide_ids.join(',')).success(function (resp) {
        //     $scope.comment_all = resp.body.list;
        //     $scope.comment_all.site = site;
        //     $http.jsonp(comment_all_count + site + '/' + t + '.json?callback=JSON_CALLBACK&relIds=' + siteIds[site].join(',') + '&contentMinLen=' + $stateParams.len + '&excIds=' + hide_ids.join(',')).success(function (resps) {
        //         $scope.comment_all.totalCount = resps.body;
        //         paginationDiscreteness($scope,5,resp.body.pageSize,resps.body, Math.ceil(resps.body / resp.body.pageSize),resp.body.pageNo);
        //         // paginationCommon($scope, 5, resp.body.pageSize, resps.body, Math.ceil(resps.body / resp.body.pageSize), resp.body.pageNo);
        //     });
        // });
    }
    $http.jsonp(url).success(function(res){
        $scope.info = res.data.list[0];
        $scope.siteIds = res.data.list[0].siteIds;
        var id = res.data.list[0].id;
        $scope.sites = [];
        for(var p in $scope.siteIds){ //循环设置网站类型
            $scope.sites.push(p);
        }
        if($stateParams.site == undefined || $stateParams.site == ''){
            $scope.site = $scope.sites[0];
        }else{
            $scope.site = $stateParams.site;
        }

        $http.jsonp(comment_saved_list + arr_type[$stateParams.type] + '/' + id + '.json?callback=JSON_CALLBACK').success(function(resp){//获取隐藏的ID后再调用list接口
            hide_ids = [];
            $scope.saved_datas = resp.data.list;
            for(var i in $scope.saved_datas){
                for(var p in $scope.saved_datas[i]){
                    if(p == 'sourceId'){
                        hide_ids.push($scope.saved_datas[i][p]);
                    }
                }
            }
            var data = {site: 'xiami', excIds: hide_ids, pageSize: $stateParams.pageSize, pageNo: $stateParams.pageNo};
            data[arr_type[$stateParams.type] + 'Name'] = $scope.info[arr_type[$stateParams.type] + 'Name'];
            data['artistName'] = $scope.info['artistName'];
            getSourceComment(encodeURIComponent(JSON.stringify(data)));
        });
    });
    $scope.choosePage = function(){//分页
        $state.go('app.comment.search',{pageNo: $scope.bigCurrentPage,len:$stateParams.len,name:$stateParams.name,no:$stateParams.no,site:$scope.site});
    }
    $scope.chooseSite = function(site){//选择源网站进行评论展示
        getSourceComment(site,hide_ids,$scope.siteIds);
        //console.log(site);
    }
    $scope.saveComment = function(data,id,site,content){//保存评论
        //console.log(data);
        var param = {};
        content = content.trim();
        //console.log(content);
        if(content == '' || content == undefined){
            sweetAlertCommon(SweetAlert,'评论不能为空','warning');
            //alert('评论不能为空');
            return;
        }
        if(content == undefined || content == null || content == '' || content == "{{data.content}}"){
            param.content = data.content;
        }else{
            param.content = content;
        }
        param.relId = id;
        param.sourceId = data.id;
        param.sourceSite = site;
        param.sourceAgreeNum = data.agreeNum;
        param.sourceDisagreeNum = data.disagreeNum;
        //alertTooltip(true,$rootScope,'操作进行中...',display);//操作进行中提示
        $.post(comment_save + arr_type[$stateParams.type] + '.json','data='+encodeURIComponent(JSON.stringify(param))).success(function(res){
            if(res.status == 1){
                sweetAlertCommon(SweetAlert,res.msg,'success');
            }else{
                sweetAlertCommon(SweetAlert,res.msg,'error');
            }
        });
    }
}]);
function paginationCommon($scope,maxSize,itemsPerPage,bigTotalItems,totalPage,bigCurrentPage){  //分页公共方法
    $scope.maxSize = maxSize;
    $scope.itemsPerPage = itemsPerPage;
    $scope.bigCurrentPage = bigCurrentPage;
    $scope.bigTotalItems = bigTotalItems;
    $scope.totalPage = totalPage;
}
function alertCommon(res,str){//统一状态返回提示
    if(res.status == 1){
        alert(str + '成功');
    }else{
        alert(str + '失败');
    }
}
