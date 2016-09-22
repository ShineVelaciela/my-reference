/**
 * Created by hao.cheng on 2016/7/19.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(UpdateConfig);
    UpdateConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function UpdateConfig($stateProvider, helper) {
        $stateProvider
            .state('app.update',{
                url: '/update',
                views: {
                    '': {
                        templateUrl: helper.basepath('update/batchupdate-head.html'),
                        controller: 'UpdateHeadCtrl'
                    }
                }
            })
            .state('app.update.list',{
                url: '/list?:upType&:updateIds&:ids&:taskId:type&:batchLocal&:flow',
                views: {
                    'data-list': {
                        templateUrl: helper.basepath('update/batchupdate-list.html'),
                        controller: 'UpdateListCtrl'
                    }
                }
            })
    }
    
    angular.module('app.routes').controller('UpdateHeadCtrl',['$scope','$state','SweetAlert','$http','BaseService',function ($scope,$state,SweetAlert,$http,BaseService) {
        if(!$scope.form) $scope.form = {};
        $scope.submit = function () {   //提交按钮
            if(!$scope.datas || $scope.datas.length == 0) return sweetAlertCommon(SweetAlert,'请先添加数据','warning');
            var data = {songIds: []};
            $scope.datas.forEach(function (val) {
                var song = {songId: val.songId};
                if($scope.batchLocal) song.taskId = $scope.batchLocal[val.songId];
                // if($scope.form.taskId) song.taskId = $scope.form.taskId;
                data.songIds.push(song);
            });
            if($scope.form.type == 'artist')
                data.rmArtists = $scope.form.delArtists,data.addArtists = $scope.form.addArtists;
            if($scope.form.type == 'album')
                data.rmAlbums = $scope.form.delAlbums,data.addAlbums = $scope.form.addAlbums;
            if($scope.form.type == 'lyricser')
                data.rmLyricsers = $scope.form.delArtists,data.addLyricsers = $scope.form.addArtists;
            if($scope.form.type == 'composer')
                data.rmComposers = $scope.form.delArtists,data.addComposers = $scope.form.addArtists;
            if($scope.form.type == 'tag')
                data.rmTags = $scope.form.delTags,data.addTags = $scope.form.addTags;
            if($scope.form.type == 'lyric')
                data.lyric = $scope.form.lyric,data.lyric = $scope.form.lyric;
            if($scope.form.flow) data.flow = $scope.form.flow;
            var promise = BaseService.service.batchUpdate(angular.toJson(data),$scope.form.upType);
            promise.then(function (res) {
                if(res.status == 1){
                    sweetAlertCommon(SweetAlert,res.msg,'success');
                    var tempDatas = [];
                    var _updateIds = [];
                    $scope.datas.forEach(function (val) { //返回失败的数据进行处理
                        res.data.forEach(function (cVal) {
                            if(val.songId == cVal.songId) val.msg = cVal.msg,tempDatas.push(val),_updateIds.push(val.songId);
                        });
                    });
                    $scope.errorDatas = tempDatas;
                    $state.go('app.update.list',{updateIds: _updateIds.join(',')});
                }
                else sweetAlertCommon(SweetAlert,res.msg,'error');
            });
        };
        $scope.add = function () {  //添加按钮
            if(checkEmpty($scope.form.ids)){
                sweetAlertCommon(SweetAlert,'请填写歌曲ID','warning');
                return;
            }
            var ids = $scope.form.ids.split(',');
            if(checkEmpty($scope.form.updateIds)) var updateIds = [];
            else var updateIds = function () { //从数据里面获取系列id。防止从url地址重复添加上一次数据
                var tempIds = [];
                $scope.datas.forEach(function (val) {
                    tempIds.push(val[$scope.form.upType + 'Id']);
                });
                return tempIds;
            }();
            ids.forEach(function (val) {    //往updateIds里面添加数据
                if(updateIds.indexOf(val) == -1)
                    updateIds.push(val);
            });
            $scope.form.updateIds = updateIds.join(',');
            $state.go('app.update.list',$scope.form);
        };
        $scope.getArtistInputSearch = function(value,type){   //精确输入框搜索艺人
            return $http.jsonp(list_url + type + '.json?ids=' + value + '&' + CALLBACK).then(function(res){
                return res.data.data.map(function(item){
                    var allstr = item[type + 'Name'] + '-' + (checkEmpty(item[type + 'NameAlias'])?'':item[type + 'NameAlias']);
                    allstr = allstr.substr(0, allstr.length - 1) + '-' + item[type + 'Id'];
                    item.allstr = allstr;
                    return item;
                });
            });
        };
        $scope.addDelArtist = function (value,type) { //删除艺人
            var tp = type.charAt(0).toUpperCase() + type.slice(1);
            // var artist = {artistId: value.artistId,artistName: value.artistName};
            var data = {};data[type + 'Id'] = value[type + 'Id'];data[type + 'Name'] = value[type + 'Name'];
            if(checkEmpty($scope.form['del'+tp+'s'])) $scope.form['del'+tp+'s'] = [];
            if($scope.form['del'+tp+'s'].indexOf(data) == -1) $scope.form['del'+tp+'s'].push(data);
        };
        $scope.addAddArtist = function (value,type) { //新增艺人
            var tp = type.charAt(0).toUpperCase() + type.slice(1);
            // var artist = {artistId: value.artistId,artistName: value.artistName};
            var data = {};data[type + 'Id'] = value[type + 'Id'];data[type + 'Name'] = value[type + 'Name'];
            if(checkEmpty($scope.form['add'+tp+'s'])) $scope.form['add'+tp+'s'] = [];
            if($scope.form['add'+tp+'s'].indexOf(data) == -1) $scope.form['add'+tp+'s'].push(data);
        };
        $scope.addDelTags = function (val) { //删除标签
            var tag  = {tagId: val.id,tagName: val.name};
            if(checkEmpty($scope.form.delTags)) $scope.form.delTags= [];
            if($scope.form.delTags.indexOf(tag) == -1) $scope.form.delTags.push(tag);
        };
        $scope.addAddTags = function (val) { //新增标签
            var tag  = {tagId: val.id,tagName: val.name};
            if(checkEmpty($scope.form.addTags)) $scope.form.addTags= [];
            if($scope.form.addTags.indexOf(tag) == -1) $scope.form.addTags.push(tag);
        };
        $scope.removeRelationData = function (arr,data) {
            $scope.form[arr].remove(data);
        };
        $scope.changeUpdateType = function (type) {
            delete $scope.form.addArtists;
            delete $scope.form.delArtists;
            // if(type == 'tag' && !$scope.tagTree) //如果类型是标签并且标签为空则获取标签树
            //     var promise = BaseService.service.getTagTree(3,3);
            // if(promise)
            //     promise.then(function (res) {
            //         $scope.tagTree = [];
            //         res.tnList.forEach(function (val) {
            //             val.children.forEach(function (cVal) {
            //                 $scope.tagTree.push(cVal);
            //             });
            //         });
            //     });
            $state.go('app.update.list',{type: type});
        };
        $scope.uploadLyric = function(element){ //上传歌词
            $scope.$apply(function($scope) {
                $scope.form.fileName = element.files[0].name;
            });
            uploadLyric($scope.form,$scope,SweetAlert);
        };
        $scope.reset = function () { //重置按钮
            for(var p in $scope.form){
                if(p.toLowerCase().indexOf('s') != -1 && p != 'updateIds')
                    delete $scope.form[p];
            }
        };

        //获取标签树
        var promise = BaseService.service.getTagTree(3,3);
        if(promise && !$scope.tagTree) promise.then(function (res) {
            $scope.tagTree = [];
            res.tnList.forEach(function (val) {
                val.children.forEach(function (cVal) {
                    $scope.tagTree.push(cVal);
                });
            });
        });
    }]);
    angular.module('app.routes').controller('UpdateListCtrl',['$scope','BaseService','$stateParams','$state','SweetAlert', function ($scope,BaseService,$stateParams,$state,SweetAlert) {
        if($stateParams.batchLocal != 0) $scope.$parent.batchLocal = JSON.parse(localStorage.getItem('batchLocal'));
        for(var p in $stateParams){
            if(!checkEmpty($stateParams[p])) $scope.$parent.form[p] = $stateParams[p];
        }
        if(!checkEmpty($stateParams.updateIds)) //获取歌曲列表
            var promise = BaseService.service.getList($stateParams.updateIds,$stateParams.upType);
        else $scope.$parent.datas = [];
        if(promise)
            promise.then(function (res) {  
                if(res.data.length == 0){
                    return sweetAlertCommon(SweetAlert,'暂无数据','warning');
                }
                $scope.$parent.datas = res.data;
                if( $scope.$parent.errorDatas)
                    $scope.$parent.datas.forEach(function (val) {    //提交反馈失败数据处理
                        $scope.$parent.errorDatas.forEach(function (val2) {
                            if(val.songId == val2.songId) val.msg = val2.msg;
                        })
                    });
            });
        $scope.remove = function (datas,data) { //删除按钮
            var updateIds = [];
            updateIds = $scope.form.updateIds.split(',');
            updateIds.remove(data[$stateParams.upType+'Id']);
            $scope.form.updateIds = updateIds.join(',');
            $state.go('app.update.list',{updateIds: $scope.form.updateIds});
        }
    }])
})();