/**
 * Created by kiraCheng on 2015/11/30.
 */
angular
    .module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.songForm',{
            url:'/songForm',
            title: '歌单管理',
            cache:'false',
            templateUrl:'app/views/songform/song_form.html'
        })
        .state('app.songForm.main', {
            url: '/main',
            title: '歌单管理',
            cache:'false',
            views: {
                'form-content': {
                    templateUrl: 'app/views/songform/song_form_main.html',
                    controller: 'SongFormMainController'
                }
            }
        })
        .state('app.songForm.more',{
            url:'/more?:site$:firstIndex$:searchName$:order&:pageNo&:pageSize',
            title: '歌单管理',
            cache:'false',
            views:{
                'form-content':{
                    templateUrl: 'app/views/songform/song_form_more.html',
                    controller: 'SongFormMoreController'
                }
            }
        })
        .state('app.songForm.detail',{
            url:'/detail?:site&:id',
            title: '歌单管理-详情',
            cache:'false',
            views:{
                'form-content':{
                    templateUrl: 'app/views/songform/song_form_detail.html',
                    controller: 'SongFormDetailController'
                }
            }
        })
}]);
angular.module('app.routes').controller('SongFormMainController', ['$scope', '$http', function ($scope, $http) {
    var wangyiList = [];
    var wangyiurl = song_form_list + 'wangyi.json?callback=JSON_CALLBACK&maxResult=10&ctrl=es&';
    $http.jsonp(wangyiurl).success(function(res){
        for(var i = 0; i < res.data.resultlist.length; i++){
            pushData(res.data.resultlist[i], wangyiList);
        }
        //console.log(wangyiList);
    });
    var xiamiList = [];
    var xiamiurl = song_form_list + 'xiami.json?callback=JSON_CALLBACK&maxResult=10&ctrl=es';
    $http.jsonp(xiamiurl).success(function(res){
        for(var i = 0; i < res.data.resultlist.length; i++){
            pushData(res.data.resultlist[i], xiamiList);
        }
    });
    var tencentList = [];
    var tencenturl = song_form_list + 'tencent.json?callback=JSON_CALLBACK&maxResult=10&ctrl=es';
    $http.jsonp(tencenturl).success(function(res){
        for(var i = 0; i < res.data.resultlist.length; i++){
            pushData(res.data.resultlist[i], tencentList);
        }
    });
    $scope.wangyi = wangyiList;
    $scope.xiami = xiamiList;
    $scope.tencent = tencentList;
}]);
angular.module('app.routes').controller('SongFormMoreController', ['$scope','$http','$stateParams','$state', function($scope,$http,$stateParams,$state){
    //console.log($stateParams.order);
    //控制是否显示下拉列表
    //$scope.showList = false;
    //console.log('进入了' + $stateParams.site + '更多界面');
    $scope.site = $stateParams.site;
    $scope.firstIndex = parseInt($stateParams.firstIndex);
    if($scope.firstIndex < 0){
        console.log('1');
        return;
    }
    $scope.searchName = $stateParams.searchName;
    var site = $stateParams.site;
    $scope.siteName = new Object();
    if(site == 'wangyi'){
        $scope.siteName.cn = '网易';
        $scope.siteName.en = site;
    } else if(site == 'xiami'){
        $scope.siteName.cn = '虾米';
        $scope.siteName.en = site;
    } else if(site == 'tencent'){
        $scope.siteName.cn = '腾讯';
        $scope.siteName.en = site;
    }
    if($stateParams.pageNo != undefined && $stateParams.pageNo != '') $stateParams.firstIndex = ($stateParams.pageNo - 1) * 100;
    $scope.itemsPerPage = checkEmpty($stateParams.pageSize)?100:$stateParams.pageSize;
    var moreList = [];
    var url = song_form_url + '/pl/ls/' + $stateParams.site + '.json?callback=JSON_CALLBACK&firstIndex=' + $stateParams.firstIndex + '&ctrl=es&order='+ $stateParams.order +  '&maxResult='+$scope.itemsPerPage+'&srhname=';
    if($stateParams.searchName != undefined && $stateParams.searchName != null && $stateParams.searchName != ''){
        url += $stateParams.searchName;
    }
    $http.jsonp(url).success(function(res){
        for(var i = 0; i < res.data.resultlist.length; i++){
            pushData(res.data.resultlist[i], moreList);
        }
        //分页显示
        console.log($scope.currentPage);
        paginationDiscreteness($scope,5,res.data.maxResult,res.data.totalrecord,Math.ceil(res.data.totalrecord/ res.data.maxResult),res.data.firstIndex / res.data.maxResult + 1);
        $scope.maxSize = 5;
        $scope.itemsPerPage = res.data.maxResult;

        $scope.totalItems = res.data.totalrecord;
    });
    $scope.moreList = moreList;
    //分页函数
    $scope.choosePage = function(){
        console.log($scope.currentPage);
        $state.go('app.songForm.more',{firstIndex:(($scope.currentPage - 1) * $scope.itemsPerPage)});
    }
}]);
angular.module('app.routes').controller('SongFormDetailController', ['$scope','$http','$stateParams','SweetAlert', function($scope,$http,$stateParams,SweetAlert){
    $scope.addPlaySong = function(songId,copyId){
        addPlaySong(songId,copyId,SweetAlert);
    };
    $http.jsonp(song_form_detail + $stateParams.site + '/' + $stateParams.id + '.json?callback=JSON_CALLBACK&ctrl=pset').success(function(res){
        $scope.data = res.data;
        if(res.data.imgs != null){
            $scope.data.img = JSON.parse(res.data.imgs)[0];
        }else{
            $scope.data.img = '/mls/resources/img/album_separate.gif';
        }
        $scope.data.tags = JSON.parse(res.data.tags);
        var ids = [];
        var site_map = {};
        for(var i = 0; i < res.data.playlistSongs.length;i ++){
            ids.push(res.data.playlistSongs[i].songId);
        }
        $http.jsonp(song_form_list_mls + '/' + $stateParams.site + '/song.json?callback=JSON_CALLBACK&ids=' + ids.join(',') + '&ctrl=11').success(function(data){
            var songIds = [];
            $scope.data.songs = data.data;
            for(var a = 0; a < $scope.data.songs.length; a++){
                $scope.data.songs[a].album =  $scope.data.songs[a].albums[0];
                songIds.push($scope.data.songs[a].songId);
            }
            //查询歌曲的曲库ID跳转到咪咕音乐用

            $http.jsonp(http_url + "/mbs/karakal/song.json?callback=JSON_CALLBACK&mids=" + songIds.join(',')).success(function(res){
                var songQidMap = new HashMap();
                for (var i = 0; i < res.data.list.length; i++){
                    //console.log(res.data.resultlist[i][0]);
                    songQidMap.put(res.data.list[i][0], res.data.list[i][1].split(',')[0]);
                }
                //console.log(songQidMap.keys());
                for (var j = 0; j < $scope.data.songs.length; j++){
                    //console.log(songQidMap.get($scope.data.songs[j].songId));
                    if(songQidMap.containsKey($scope.data.songs[j].songId)){
                        $scope.data.songs[j].qid = songQidMap.get($scope.data.songs[j].songId);
                        //console.log($scope.data.songs[j]);
                    } else {
                        $scope.data.songs[j].qid = '';
                    }
                }
                //console.log($scope.data.songs);
            });

        });
    });
}]);
function pushData(data, siteList){
    var songList = new Object();
    songList.id = data.id;
    songList.name = data.name;
    songList.ctime = data.ctime;
    if(data.imgs != undefined && data.imgs!= null && data.imgs != ''){
        songList.img = data.imgs.replace(/"/g,'').replace('[','').replace(']','');
    } else {
        songList.img = '';
    }

    songList.listenNum = data.playlistExt.playNum;
    songList.songNum = data.playlistSongs.length;
    songList.tag = data.tags.replace(/"/g,'').replace('[','').replace(']','');
//console.log(res.data[i].tags.replace(/"/g,'').replace('[','').replace(']',''));
    siteList.push(songList);
}
angular
    .module('app.routes').filter('to_trusted', ['$sce', function ($sce) {//解析html标签过滤器
    return function (text) {
        return $sce.trustAsHtml(text);
    }
}]);
function HashMap() {
    /** Map 大小 **/
    var size = 0;
    /** 对象 **/
    var entry = new Object();
    /** 存 **/
    this.put = function (key, value) {
        if (!this.containsKey(key)) {
            size++;
        }
        entry[key] = value;
    };
    /** 取 **/
    this.get = function (key) {
        if (this.containsKey(key)) {
            return entry[key];
        }
        else {
            return null;
        }
    };
    /** 删除 **/
    this.remove = function (key) {
        if (delete entry[key]) {
            size--;
        }
    };
    /** 是否包含 Key **/
    this.containsKey = function (key) {
        return (key in entry);
    };
    /** 是否包含 Value **/
    this.containsValue = function (value) {
        for (var prop in entry) {
            if (entry[prop] == value) {
                return true;
            }
        }
        return false;
    };
    /** 所有 Value **/
    this.values = function () {
        var values = new Array(size);
        for (var prop in entry) {
            values.push(entry[prop]);
        }
        return values;
    };
    /** 所有 Key **/
    this.keys = function () {
        var keys = new Array(size);
        for (var prop in entry) {
            keys.push(prop);
        }
        return keys;
    };
    /** Map Size **/
    this.size = function () {
        return size;
    }
}