/**
 * Created by kiraCheng on 2016/2/25.
 * song_controller
 */
'use strict';
var tags_title = [];
var catalogs = [{'name':'编目记录','id':'catalog-10'},{'name':'图片','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'标签','id':'catalog-3'},{'name':'歌曲介绍','id':'catalog-4'},{'name':'创作背景','id':'catalog-5'},{'name':'获奖记录','id':'catalog-6'},{'name':'歌曲评价','id':'catalog-7'},{'name':'歌曲故事','id':'catalog-8'},{'name':'版权信息表','id':'catalog-9'}];
angular.module('app.routes').config(songConfig);
songConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
function songConfig($stateProvider, helper){
    $stateProvider
        .state('app.song', {//缺歌页面
            url: '/song?:time&:tagIds&:pageNo&:pageSize&:songKeyword&:songIds&:artistKeyword&:artistId&:status&:albumKeyword&:lyricPerson&:composePerson&:conductor&:player&:lastEdit&:copyrightId&:projectName&:lastEditSearch&:accurateArtist&:ckResult&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:istag',
            title: '歌曲管理',
            templateUrl: 'app/views/song/song.html',
            controller: 'SongListController'
        })
        .state('songInfo',{
            url: '/songInfo?:songId&:lastPage&:returnBtn',
            title: '查看-歌曲查看',
            templateUrl: 'app/views/song/song-info.html',
            resolve: helper.resolveFor('oitozero.ngSweetAlert','lightbox2','modernizr'),
            controller: 'SongInfoController'
        })
        .state('songExamine',{
            url: '/songExamine?:songId&:lastPage&:taskId&:returnBtn',
            title: '审核-歌曲审核',
            templateUrl: 'app/views/song/song-info.html',
            resolve: helper.resolveFor('oitozero.ngSweetAlert','lightbox2','modernizr'),
            controller: 'SongExamineController'
        })
        .state('songEdit',{
            url: '/songEdit?songId&:lastPage&:tp&:auth&:taskId',
            title: '编辑-歌曲编辑',
            'views' : {
                '':{
                    templateUrl:'app/views/song/song-edit.html',
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','ztree','inputmask','modernizr'),
                    controller:'songController'
                }
            }
        })
        .state('songCheck',{
            url: '/songCheck?:songId&:lastPage&:taskId',
            title: '抽查-歌曲抽查',
            templateUrl: 'app/views/song/song-info.html',
            resolve: helper.resolveFor('oitozero.ngSweetAlert','lightbox2','modernizr'),
            controller: 'SongCheckController'
        })
        .state('material.preSong',{
            url: '/preSong',
            title: '预览-歌曲预览',
            views: {
                '': {
                    templateUrl: 'app/views/song/song-info.html',
                    controller: 'PreDataController'
                }
            }
        })
}
angular.module('app.routes').controller('SongListController', ['$scope', '$http', '$stateParams', 'permissions', '$cookies', '$timeout', '$rootScope', '$state','SweetAlert', function ($scope, $http, $stateParams, permissions, $cookies, $timeout, $rootScope,$state,SweetAlert) {
    $scope.form = {};
    $scope.form.searchTag = [];
    if(checkEmpty($scope.users)) $scope.users = JSON.parse(localStorage.getItem('users'));

    //界面元素控制下拉框列表
    var _table = JSON.parse(localStorage.getItem('local-songHtml'));
    $scope.song_html = _table ? _table : [{name:'状态', checked:true},{name:'版权ID', checked:true},{name:'歌曲ID', checked:true},{name:'歌曲名', checked:true},{name:'专辑名', checked:true},{name:'艺人名', checked:true},{name:'时长', checked:true},{name: '语言', checked: true}];
    $scope.storageTableShow = function () {
        var _localStorage = [];
        $scope.song_html.forEach(function (val) {
            _localStorage.push(val);
        });
        localStorage.setItem('local-songHtml', JSON.stringify(_localStorage));
    };
    //初始化界面的songs
    $scope.datas = [];
    $scope.songTags = [];
    $scope.page = new Object();
    var songTagTree = [];
    var songFilterTagTree = [];
    var url = _search_song + '?' + CALLBACK;
    url = materialListFillUrl(url, $stateParams);
    if(url != undefined){
        $http.jsonp(url).success(function(res){
            //填充页面数据
            getMaterialBySearch(res, $http, $scope, 'song');
        });
    }
    //分页
    var page_url = _search_song + '?' + CALLBACK;
    page_url = materialListFillUrl(page_url, $stateParams, 'count');
    if(page_url != undefined){
        $http.jsonp(page_url).success(function(res){
            //分页
            materialListSeparatePage($scope, res);
        });
    }

    //获取歌曲的标签搜索树
    getTagList(3,$scope,$stateParams,$http,$cookies,SweetAlert);
    //提交搜索条件
    $scope.submit = function(){
        var params = $scope.form;
        if(!isPropertyEmpty(params.searchTag)){
            var tagIds = '';
            for(var i = 0; i < params.searchTag.length; i++){
                tagIds += params.searchTag[i].id + ',';
            }
            if(params.searchTag.length != 0){
                tagIds = tagIds.substr(0, tagIds.length - 1);
                params.tagIds = tagIds;
            }
        }
        // if(isPropertyEmpty(params.lastEditSearch)) params.lastEdit = returnUidByUname(params.lastEdtiSearch,$scope.users);
        // $state.go('app.song',{songIds: params.songIds, songKeyword: params.songKeyword, artistKeyword: params.artistKeyword, albumKeyword: params.albumKeyword, status: params.status, lyricPerson: params.lyricPerson, composePerson: params.composePerson, conductor: params.conductor, player: params.player, lastEdit: params.lastEdit, copyrightId: params.copyrightId, projectName: params.projectName, tagIds: params.tagIds},{reload: true, inherit: false});
        params.pageNo = '',params.pageSize = '';
        params.time = new Date().getTime();
        $state.go('app.song',params,{reload: false, inherit: false});
    };

    //重置搜索条件
    $scope.reset = function(){
        $scope.form = {};
        $scope.form.searchTag = [];
    };

    //选择标签时候选择顶部标签
    $scope.selectMainTag = function(tag){
        //console.log(tag);
        $scope.tag_list = tag.children;
    };
    //选择需要搜索的标签
    $scope.songSelectSearchTag = function(tag){
        //首先判断重复
        if($scope.form.searchTag != undefined && $scope.form.searchTag.length != 0){
            for(var i = 0; i < $scope.form.searchTag.length; i++){
                if($scope.form.searchTag[i].id == tag.id){
                    return;
                }
            }
        }
        //然后判断父标签是否重复
        //var tagIds = getPropertyFromCheckBox($scope.form.searchTag, 'undefined', undefined, 'id');
        if($scope.form.searchTag != undefined && $scope.form.searchTag.length != 0){
            //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
            //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
            for(var n = 0; n < $scope.form.searchTag.length; n++){
                var tempTag = $scope.form.searchTag[n];
                if(tag.ancestorId == tempTag.ancestorId){
                    $scope.form.searchTag[n] = tag;
                    return;
                }
            }
        }
        $scope.form.searchTag.push(tag);
    };
    //全文搜索
    $scope.getSearchResult = function(value){
        //console.log(value);
        return $http.get(_search_song, {
            params: {
                data:{
                    "songKeyword": value,
                    "isolated": 0
                }
            }
        }).then(function(response){
            //console.log(response.data);
            return response.data.body.list.map(function(item){
                //console.log(item);
                var allstr = item.songName + ' —';
                if(item.artists != undefined && item.artists != null){
                    for (var i = 0; i < item.artists.length; i++){
                        allstr += ' ' + item.artists[i].artistName + ',';
                    }
                }
                allstr = allstr.substr(0, allstr.length - 1) + ' —';
                if(item.albums != undefined && item.albums != null){
                    //for (var i = 0; i < item.albums.length; i++){
                    allstr += ' ' + item.albums[0].albumName + ',';
                    //}
                }
                allstr = allstr.substr(0, allstr.length - 1) + '—' + item.songId;
                item.allstr = allstr;
                return item;
            });
        })
    };
    //全文检索选择事件
    $scope.addSong2List = function(song){
        console.log(song);
        $state.go('app.song',{songIds:song.songId},{inherit: false});
    };
    //全文检索点击搜索按钮
    $scope.searchSongBtn = function(value){
        $state.go('app.song',{songKeyword:value, songIds:''});
    };
    //标签右上角的叉叉函数
    $scope.songTagRemove = function(tag){
        //tagRemove(tag,$scope,$stateParams,$state,'app.song');
        $scope.form.searchTag.remove(tag);
    };
    //点击标签树中的标签跳转相应数据显示页面
    $scope.songTagClick = function(tag){
        if($stateParams.tagIds == undefined){
            $state.go('app.song',{tagIds:tag.id});
        } else {
            //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
            //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
            var parentRepeatTag = judgeParentTagRepeat(tag, $stateParams.tagIds.split(','), songTagTree);
            if(parentRepeatTag == undefined){
                $state.go('app.song',{tagIds:$stateParams.tagIds + ',' + tag.id});
            } else {
                var ids = $stateParams.tagIds.split(',');
                ids[ids.indexOf(parentRepeatTag.id)] = tag.id;
                $state.go('app.song',{tagIds:ids.join(',')});
            }
        }
    };
    //重新抽取素材
    $scope.extractedMaterial = function(id, type){
        extractedMaterial(id, type, $http, $timeout, $rootScope, display);
    };
    //分页跳转
    $scope.choosePage = function(){
        $state.go('app.song',{pageNo: $scope.page.currentPage});
    };
    //监听键盘按钮事件
    $scope.enter = function(event, searchValue, searchType){
        if(event.keyCode == 13){
            //console.log(searchValue);
            if(searchType == 'songId'){
                $state.go('app.song',{songIds:searchValue, songKeyword:'', artistKeyword:'', tagIds:'', status:''});
            } else if(searchType == 'songName'){
                $state.go('app.song',{songIds:'', songKeyword:searchValue});
            } else if(searchType == 'artistName'){
                $state.go('app.song',{songIds:'', artistKeyword:searchValue});
            }
        }
    };
    //勾选框控制界面元素
    $scope.changeCheck = function(html){
        //把勾选框去掉
        html.cheched = !html.cheched;
        $scope.html_chooseElem = false;
    };
    //显示所有属性
    $scope.showAllHtmlElem = function(){
        for(var  i = 0; i < $scope.song_html.length; i++){
            $scope.song_html[i].checked = true;
        }
    };
    //查看歌曲信息按钮
    $scope.showInfo = function(type,data){
        openNewTab(type,data,'Info',$state);
    };
    //播放歌曲按钮
    $scope.playSong = function(data){
        if(isPropertyEmpty(data.cids)){
            sweetAlertCommon(SweetAlert,'当前歌曲没有版权id,无法播放','warning');
        } else {
            addPlaySong(data.songId, SweetAlert, data.cids.copyrightId,SweetAlert);
        }
    };
    //全选
    $scope.checkAll = function(datas){
        selectAll($scope, datas, 'isCheck', 'allIsCheck');
    };
    //单选
    $scope.checkOne = function(data, datas){
        selectOne(data, !data.checked, 'checked');
    };
    //添加到抽查工单
    $scope.addToCheckTask = function(datas){
        var selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'songId');
        addToCheckTask($http, "song", selectedDataIds, SweetAlert);
    };
    $scope.editJump = function(data){//编辑按钮
        editJumpNew('song',data,SweetAlert,$state,'_self', $stateParams);
    };
    $scope.rightClick = function (data) {
        editJumpNew('song',data,SweetAlert,$state,  '_blank', $stateParams);
    };
    $scope.extractedMaterial = function(id, type){//重新抽取素材
        extractedMaterial(id, type, $http, SweetAlert);
    };
    $scope.new = function(type){
        addNewMaterialFromTop(type,$state);
    };
    //选择最后编辑人
    $scope.selectLastEdit = function(user){
        $scope.form.lastEdit = user.uId;
    };
    $scope.separate = function(type,id){
        var url = $state.href('app.separate',{type:type,id:id,lastPage:returnLastPageTime()});
        window.open(url,'_blank');
    };
    $scope.getArtistInputSearch = function(value){   //精确输入框搜索艺人
        //console.log(value);
        return $http.jsonp(_search_artist+'?'+CALLBACK+'&data='+JSON.stringify({"artistKeyword": value, "isolated":0})).then(function(response){
            //console.log(response.data);
            var ids = [];
            for(var i = 0; i < response.data.body.list.length; i++){
                ids.push(response.data.body.list[i].artistId);
            }
            return $http.jsonp(list_url + "artist.json?callback=JSON_CALLBACK&ids=" + ids.join(',')).then(function(res){
                return res.data.data.map(function(item){
                    //console.log(item);
                    var allstr = item.artistName + '-' + item.artistNameAlias + '-' + item.sex;
                    allstr = allstr.substr(0, allstr.length - 1) + '-' + item.artistId;
                    item.allstr = allstr;
                    return item;
                });
            });
        })
    };
    $scope.addAccurateArtist = function(data){ //添加精确搜索
        if(checkEmpty($scope.form)) $scope.form={};
        $scope.form.artistId = data.artistId;
        $scope.form.accurateArtist = data.artistName;
        // $scope.accurateSearch = data;
    };
    $scope.removeAccurateSearch = function(accurateSearch){ //删除精确搜索
        if(!checkEmpty($scope.form)) deleteProperty($scope.form,'artistId');
        deleteProperty($scope.form,'accurateArtist');
    };
    $scope.tagging = function (id, blank) {
        taggingAloneCheck(id, blank, 'song', null, $state, SweetAlert);
    }
}]);
angular.module('app.routes').controller('SongInfoController', ['$scope','$http','$sce','$stateParams','$cookies','authority', '$timeout', '$rootScope', '$state','SweetAlert','CatalogService', function($scope,$http,$sce,$stateParams,$cookies,authority, $timeout, $rootScope,$state,SweetAlert,CatalogService){
    if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
    basicRequest('song',catalogs,$scope,$http,$sce,$stateParams,$cookies,true);
    var promise = CatalogService.service.getCatalogs($stateParams.songId);  //获取版权
    promise.then(function (res) {
        $scope.catalog_list = res;
    });
    $scope.goBack = function(){
        window.open(returnLastPage($stateParams.lastPage), '_self');
    };
    $scope.edit = function(type,id){    //编辑按钮
        toEdit(type,id,$stateParams,$state,SweetAlert);
    };
    loadMoreRecord('song',$scope,$stateParams,$http,SweetAlert);
    getSongCatalogPre($scope, $stateParams, CatalogService);
}]);
angular.module('app.routes').controller('SongExamineController', ['$scope','$http','$sce','$stateParams','$cookies','$timeout','$rootScope','SweetAlert','CatalogService', function($scope,$http,$sce,$stateParams,$cookies,$timeout,$rootScope,SweetAlert,CatalogService){
    getLastExamine($stateParams.songId, $scope);
    if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
    var promise = CatalogService.service.getCatalogs($stateParams.songId);  //获取版权
    promise.then(function (res) {
        $scope.catalog_list = res;
    });
    $scope.examine = true;
    basicRequest('song',catalogs,$scope,$http,$sce,$stateParams,$cookies);
    $scope.examineConfirm = function(examineResult, examineSuggest){    //审核确认
        examineCommon('song',examineResult,examineSuggest,$http,$stateParams,SweetAlert);
    };
    $scope.goBack = function(type,id){      //返回按钮
        unLock(type,id,$http,$stateParams,SweetAlert);     //解锁审核状态
    };
    loadMoreRecord('song',$scope,$stateParams,$http,SweetAlert);
}]);
angular.module('app.routes').controller('SongCheckController', ['$scope','$http','$sce','$stateParams','$cookies','$timeout','$rootScope','SweetAlert','CatalogService', function($scope,$http,$sce,$stateParams,$cookies,$timeout,$rootScope,SweetAlert,CatalogService){
    $scope.check = true;
    $scope.ckTagError = {};
    getLastExamine($stateParams.songId, $scope);
    basicRequest('song',catalogs,$scope,$http,$sce,$stateParams,$cookies);
    var promise = CatalogService.service.getCatalogs($stateParams.songId);  //获取版权
    promise.then(function (res) {
        $scope.catalog_list = res;
    });
    //抽查提交按钮
    $scope.checkMaterial = function(ckResult, ckSuggest, ckTagError){
        checkCommon('song',ckResult,ckSuggest,ckTagError,$http,$stateParams,SweetAlert);
    };
    $scope.goBack = function(type,id){      //返回按钮
        unLock(type,id,$http,$stateParams,SweetAlert);     //解锁审核状态
    };
    loadMoreRecord('songTag',$scope,$stateParams,$http,SweetAlert);
}]);
angular.module('app.routes').controller('songController',['$scope','$http','$sce','$stateParams','$cookies','$timeout','$rootScope','$state','$filter','SweetAlert','SongService','CatalogService', function($scope,$http,$sce,$stateParams,$cookies,$timeout,$rootScope,$state,$filter,SweetAlert,SongService,CatalogService){
    $scope.preBtn = true;
    $scope.type = 'song';
    if(checkEmpty($stateParams.songId)){ //新增页面逻辑
        $scope.data = {type: 1};
        $scope.data.composers = [];$scope.data.lyricsers = [];$scope.data.performers = [];$scope.data.albums = [];$scope.data.artists = [];
        $timeout(function () {
            $('#playTime').setTime({drag:true,a:0.05});
        }, 2000);
    }
    if(!checkEmpty($stateParams.tp)){
        if(checkEmpty($stateParams.songId)){ //新增页面逻辑
            $scope.data.type = $stateParams.tp;
        }
    }
    var catalogs = [{'name':'图片','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'歌曲介绍','id':'catalog-3'},{'name':'创作背景','id':'catalog-4'},{'name':'获奖情况','id':'catalog-5'},{'name':'歌曲评价','id':'catalog-6'},{'name':'歌曲故事','id':'catalog-7'},{'name':'歌曲标签','id':'catalog-8'}];
    basicRequest('song',catalogs,$scope,$http,$sce,$stateParams,$cookies,true);
    getSongCatalogPre($scope, $stateParams, CatalogService);
    $scope.changeTemplate = function(tp){       //切换模板
        sweetAlertConfirm(SweetAlert,function(){
            $state.go('songEdit',{tp:tp});
            sweetAlertCommon(SweetAlert,'操作成功','success');
        },undefined,undefined,'更换模板将丢失部分数据');
    };
    $scope.getSearchResult = function(value,type,id){      //获取搜索数据
        var param = {};param.params = {};param.params.data={};
        if(id) param.params.data[id] = [],param.params.data[id].push(value);
        if(!id) param.params.data[type+'Keyword'] = value;
        param.params.data['isolated'] = 0;
        return $http.get(_search_url+'search/'+type+'.json', param).then(function(response){
            var ids = [];
            for(var i = 0; i < response.data.body.list.length; i++){
                ids.push(response.data.body.list[i][type+'Id']);
            }
            if(ids.size < 0){
                return;
            }else{
                return $http.jsonp(list_url + type + ".json?ids=" + ids.join(',')+'&'+CALLBACK).then(function(res){
                    var results = [];
                    for(var i in res.data.data){
                        if(res.data.data[i].status == 10 || res.data.data[i].status == 12){
                            results.push(res.data.data[i]);
                        }
                    }
                    return results.map(function(item){
                        if(item.status == 10 || item.status == 12){
                            var allstr = item[type+'Name'] + '--' + returnStatus(item.status) + ',';
                            if(type == 'artist')
                                allstr += item.sex + ','  + item.artistNameAlias + ',' + item.nation + ',';
                            if(item.artists != undefined && item.artists != null){
                                for (var i = 0; i < item.artists.length; i++){
                                    allstr += item.artists[i].artistName + ',';
                                }
                            }
                            if(type == 'album')
                                allstr += item.publishTime;
                            allstr = allstr.substr(0, allstr.length - 1) + ',' + item[type+'Id'];
                            item.allstr = allstr;
                            return item;
                        }else{
                            return null;
                        }
                    });
                });
            }
        })
    };
    $scope.getDictionary = function(value, type){    //几种数据字典搜索（发行公司）
        return $http.get(dictionary_url + type + '.json', {
            params: {
                "search": value
            }
        }).then(function(response){
            //console.log(response.data);
            return response.data.data.map(function(item){
                return item;
            });
        })
    };
    $scope.addRelationData = function(data,arr,type){        //添加关联关系数据（添加歌手等）
        addRelationData(data,arr,type);
    };
    $scope.removeRelationData = function(data, arr){        //删除关联关系数据（删除歌手等）
        arr.remove(data);
    };
    $scope.addMovie = function (type) {
        if($scope.data[type] == undefined){
            $scope.data[type] = [];
        }
        var m = {movieType:'',name:'',type:''};
        $scope.data[type].push(m);
    };
    $scope.addOnlyData = function(data,obj,type,property){
        addOnlyData(data,obj,type,property);
    };
    $scope.removeOnlyData = function(property,data){
        deleteProperty(data,property);
        deleteProperty(data,property+'Id');
    };
    $scope.addUnknown = function(arr,type,id,name){
        addUnknown(arr,type,id,name);
    };
    $scope.goBack = function(){
        window.open(returnLastPage($stateParams.lastPage),'_self');
    };
    $scope.uploadImg = function(id){
        id = $scope.data ? $scope.data.songId : undefined;
        uploadImg(id,'song',$scope,$http,SweetAlert);
    };
    $scope.uploadLyric = function(data){
        uploadLyric($scope.data,$scope,SweetAlert);
    };
    $scope.clearLyric = function(){
        $scope.data.lyric = '';
    };
    $scope.editLyric = function(){
        $scope.lyricEdited = true;
    };
    $scope.new = function(type){
        addNewMaterial(type,$state,$stateParams);
    };
    $scope.deleteImg = function () {        //删除图片
        deleteImg($scope,$timeout,$rootScope,display);
    };
    $scope.downloadLyric = function(copyid){
        if(checkEmpty(copyid)){
            sweetAlertCommon(SweetAlert,'请填写版权ID','warning');
            return;
        }
        $.post(http_url + '/lyric/download/'+copyid+'.json').success(function(res){
            if(res.status == undefined){
                location.href = http_url + '/lyric/download/'+copyid+'.json';
            }else{
                sweetAlertCommon(SweetAlert,'暂无歌词','warning');
            }
            console.log(res);
        });
    };
    $scope.scoreChange = function(s,property){
        watchScore(s,property);
    };

    $scope.fixDateNew = function(date,data,property){
        if(checkEmpty($scope[data])){
            $scope[data] = {};
        }
        $scope[data][property] = fixDate(date);
    };
    $scope.submit = function(tagExt,albumId,preCatalogId){
        if(!$scope.data.songName) return sweetAlertCommon(SweetAlert, '歌曲名不能为空', 'warning');
        if(!$scope.data.albums || $scope.data.albums.length == 0) return sweetAlertCommon(SweetAlert, '歌曲专辑不能为空', 'warning');
        if(!$scope.data.artists || $scope.data.artists.length == 0) return sweetAlertCommon(SweetAlert, '歌曲艺人不能为空', 'warning');
        $scope.taggingData.tags = [];
        $("input[name=taggingCheck]:checked").each(function () {
            var tag = {};
            tag.tagId = $(this).val();
            tag.type = 0;
            $scope.taggingData.tags.push(tag);
        });
        if(!checkEmpty(tagExt)){
            tagExt.status = 1;
            $scope.taggingData.tagExt = tagExt;
        }
        if(!checkEmpty(albumId)) addRelationData({albumId:albumId}, $scope.data.albums,'album');
        $scope.data.publishTime = sliceDate($scope.data.publishTime);
        $scope.data.playTime = $('#playTime').val();
        if($scope.data.hasOwnProperty('movies')){   //排除字段全为空的值
            var movies = [];
            $scope.data.movies.forEach(function (obj) {
                movies.push(obj);
            });
            movies.forEach(function (obj) {
                var tempArr = [];
                for(var pro in obj){
                    tempArr.push(obj[pro]);
                }
                var flag = tempArr.every(function (value) { //如果都为空，才返回true否则false
                    return value === '';
                });
                if(flag) $scope.data.movies.remove(obj);
            });
        }
        // if($scope.preCatalogId) CatalogService.service.createCatalogPre($scope.preCatalogId, $scope.data)
        submit('song',$scope,$http,$stateParams,$filter,SweetAlert,preCatalogId,CatalogService);
    };
    $scope.tagTagging = function(item){
        $('.tag-content').append(getTag(item.name,item.id));
    };
    $scope.createSongRel = function (songId) {  //一键创建词曲作者并且关联标签
        var promise = SongService.service.createSongRel(songId);
        promise.then(function (res) {
            var obj = res.data;
            if(obj.status != 1){
                sweetAlertCommon(SweetAlert,'创建失败','error');
                return;
            }
            if(obj.data.hasOwnProperty('composers')){
                if(!$scope.data.hasOwnProperty('composers')) $scope.data.composers = [];
                $scope.data.composers = obj.data.composers;
            }
            if(obj.data.hasOwnProperty('lyricsers')){
                if(!$scope.data.hasOwnProperty('lyricsers')) $scope.data.lyricsers = [];
                $scope.data.lyricsers = obj.data.lyricsers;
            }
            if(obj.data.hasOwnProperty('tags')){
                obj.data.tags.forEach(function (val) {
                    var nodes = $('.tag-content').children();
                    var flag = true;
                    for(var j = 0; j < nodes.length; j++){
                        if(nodes[j].innerText.trim() == val.tagName){
                            flag = false;
                            break;
                        }
                    }
                    if(flag){
                        $('.tag-content').append(getTag(val.tagName,val.tagId));
                    }
                });

            }
            if(obj.data.hasOwnProperty('language')){
                if(!$scope.hasOwnProperty('artistTags')) $scope.artistTags = [];
                for(var i = 0; i < $scope.artistTags.length; i++){
                    if($scope.artistTags[i].tagId == obj.data.language.tagId) return;
                }
                obj.data.language.type = 15;
                $scope.artistTags.push(obj.data.language);
            }
            sweetAlertCommon(SweetAlert,'创建成功','success');
        });
    };
    loadMoreRecord('song',$scope,$stateParams,$http,SweetAlert);

    /*标签操作*/
    setTimeout(function () {    //已经打上的标签对标签树着色
        var treeObj = $.fn.zTree.getZTreeObj('treeDemo');
        var nodes = treeObj.transformToArray(treeObj.getNodes());
        var tagedNodes = $('.tag-content').children();
        for(var i = 0; i< nodes.length; i++){
            for(var j = 0; j < tagedNodes.length; j++){
                if(tagedNodes[j].innerText.trim() == nodes[i].name)
                    $('#'+nodes[i].tId).children('a').addClass('checked');
            }
        }
    },3000);
    setTaggingTree($http, $scope);
    $scope.deleteAll = function(){
        sweetAlertConfirm(SweetAlert,function(){
            $('.level1').removeClass('checked');
            $('.W_btn_b.W_btn_tag').remove();
            sweetAlertCommon(SweetAlert, '删除成功', 'success');
        },undefined,'确认要删除全部标签?',undefined);
    };
    $scope.expandAll = function(){
        expandAll('treeDemo');
    };
    $scope.collapseAll = function(){
        collapseAll('treeDemo');
    }
}]);
function setTaggingTree($http, $scope) {
    var url = tag_tree_url + 'getTagsTreeByMaterialType?materialType=3&maxLevel=4';
    $http.get(url).success(function(res){
        $scope.tagTreeFilter = [];
        for(var i = 0; i < res.treeEntityList.length; i++){
            if(res.treeEntityList[i].tagType == 0){
                res.treeEntityList[i].iconSkin = 'pIcon01';
                $scope.tagTreeFilter.push(res.treeEntityList[i]);
            }
        }
        function compare(a,b) {
            var _sub = a.tagSort - b.tagSort;
            var _result = ((a.parent && b.parent) && _sub) ||
                ((!a.parent && b.parent) && 1) || ((a.parent && !b.parent) && -1)|| ((!a.parent && !b.parent) && _sub);
            // if(a.pId == 1002598952 || b.pId == 1002598952) return a.tagSort - b.tagSort;
            // if(a.parent && b.parent) return a.tagSort - b.tagSort;
            // if(a.parent && !b.parent) return -1;
            // if(!a.parent && b.parent) return 1;
            // if(!a.parent && !b.parent) return a.tagSort - b.tagSort;

            // if (b.parent)   return 1;
            return _result;
        }

        $scope.tagTreeNodes = res.treeEntityList;
        for(var i =0;i < $scope.tagTreeNodes.length;i++){
            $scope.tagTreeNodes[i].open = false;
        }
        $scope.tagTreeNodes.sort(compare);
        $.fn.zTree.init($("#treeDemo"), tagTreeSetting_tagging, $scope.tagTreeNodes);
        var treeObj = $.fn.zTree.getZTreeObj('treeDemo');

        expandAll('treeDemo');
        collapseAll('treeDemo');

        //默认展开ROOT节点
        var rootNode = treeObj.getNodeByParam("name", "ROOT", null);
        treeObj.expandNode(rootNode, true, false, false, false);
        var allNodes =  treeObj.transformToArray(treeObj.getNodes());
        for(var i = 0; i < allNodes.length; i++){   //将没有children的节点设置为浮动
            if(checkEmpty(allNodes[i].children)){
                var c = $('#'+allNodes[i].tId).attr('class');
                if((c == 'level2' || c == 'level3' || c == 'level4') && allNodes[i].tagType == 0){
                    if(allNodes[i].pId == 1000001851) var _width = '220px';  //蓝调宽度特殊处理
                    else var _width = '150px';
                    $('#'+allNodes[i].tId).css({'float':'left','clear':'inherit', 'width': _width});
                }
            }
        }

        var lastValue = "", nodeList = [], fontCss = {};
        var key = $('#key');
        function searchNode(e) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            var value = $.trim(key.get(0).value);
            var keyType = "";
            keyType = "name";
            if (key.hasClass("empty")) {
                value = "";
            }
            if (lastValue === value) return;
            lastValue = value;
            if (value === "") return;
            updateNodes(false);

            nodeList = zTree.getNodesByParamFuzzy(keyType, value);

            updateNodes(true);

        }
        function updateNodes(highlight) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            for( var i=0, l=nodeList.length; i<l; i++) {
                nodeList[i].highlight = highlight;
                zTree.updateNode(nodeList[i]);
            }
        }
        function focusKey(e) {
            if (key.hasClass("empty")) {
                key.removeClass("empty");
            }
        }
        function blurKey(e) {
            if (key.get(0).value === "") {
                key.addClass("empty");
            }
        }
        key.bind("focus", focusKey)
            .bind("blur", blurKey)
            .bind("propertychange", searchNode)
            .bind("input", searchNode);

    });
}
function getSongCatalogPre($scope,$stateParams,CatalogService) { //获取预编目版权ID
    if(!checkEmpty($stateParams.songId)) var _promise = CatalogService.service.getCatalogPre($stateParams.songId);
    if(_promise) _promise.then(function (res) {
        if(res.data.copyrightPre) $scope.preCatalogId = res.data.copyrightPre[0];
    });
}
function removeTag(obj){
    $(obj).parent().remove();
    var tagId = $(obj).prev().attr('id');
    var treeObj = $.fn.zTree.getZTreeObj('treeDemo');
    var checkedNodes = treeObj.getCheckedNodes();
    for(var i = 0; i < checkedNodes.length; i++){
        if(checkedNodes[i].id == tagId){
            $('#'+checkedNodes[i].tId).children('a').removeClass('checked');
            treeObj.checkNode(checkedNodes[i], false, true, true);
            checkedNodes[i].checked = false;
            var childrenNodes = getAllChildNode(checkedNodes[i], []);
            childrenNodes.forEach(function(node){
                $('#'+node.tId).children('a').removeClass('checked');
                $('input[value=' + node.id + ']').parent().remove();
            });
        }
    }
}
function songFillSearchCondition($stateParams, $scope, $http, $cookies, songTagTree){
    //获取所有git用户
    //填充最后编辑人
    if(!isPropertyEmpty($stateParams.lastEdit)){
        if($scope.$parent.users ==undefined || $scope.$parent.users.length <= 0){
            getAllUser($http,function(users){
                $scope.$parent.users = git_users;
                fillUser();
            })
        } else {
            fillUser();
        }
    }
    function fillUser(){
        if(!isPropertyEmpty($stateParams.lastEdit)){
            for(var n = 0; n < $scope.$parent.users.length; n++){
                if($scope.$parent.users[n].uId == $stateParams.lastEdit){
                    $scope.form.lastEditSearch = $scope.$parent.users[n].name;
                }
            }
        }
    }


    //if(!isPropertyEmpty($stateParams.songIds)){
    //    $scope.form.songIds = $stateParams.songIds;
    //}
    //if(!isPropertyEmpty($stateParams.songKeyword)){
    //    $scope.form.songKeyword = $stateParams.songKeyword;
    //}
    //if(!isPropertyEmpty($stateParams.artistKeyword)){
    //    $scope.form.artistKeyword = $stateParams.artistKeyword;
    //}
    //if(!isPropertyEmpty($stateParams.albumKeyword)){
    //    $scope.form.albumKeyword = $stateParams.albumKeyword;
    //}
    //if(!isPropertyEmpty($stateParams.karakalStatus)){
    //    $scope.form.karakalStatus = $stateParams.karakalStatus;
    //}
    //if(!isPropertyEmpty($stateParams.lyricPerson)){
    //    $scope.form.lyricPerson = $stateParams.lyricPerson;
    //}
    //if(!isPropertyEmpty($stateParams.composePerson)){
    //    $scope.form.composePerson = $stateParams.composePerson;
    //}
    //if(!isPropertyEmpty($stateParams.conductor)){
    //    $scope.form.conductor = $stateParams.conductor;
    //}
    //if(!isPropertyEmpty($stateParams.player)){
    //    $scope.form.player = $stateParams.player;
    //}
    //if(!isPropertyEmpty($stateParams.copyrightId)){
    //    $scope.form.copyrightId = $stateParams.copyrightId;
    //}
    //if(!isPropertyEmpty($stateParams.projectName)){
    //    $scope.form.projectName = $stateParams.projectName;
    //}
    if(!isPropertyEmpty($stateParams.tagIds)){
        for(var i = 0; i < $stateParams.tagIds.split(',').length; i++){
            //遍历获取到的标签树获得标签ID对应的标签
            var tag = getTagById($stateParams.tagIds.split(',')[i], songTagTree);
            if(tag != undefined){
                $scope.form.searchTag.push(tag);
            }
        }
    }
    if(!isPropertyEmpty($stateParams.tagBeans)) $stateParams.tagBeans = JSON.parse($stateParams.tagBeans);
    for(var property in $stateParams){
        if(!isPropertyEmpty($stateParams[property])){
            $scope.form[property] = $stateParams[property];
        }
    }
    if(!checkEmpty($stateParams.pageNo)) $scope.pageNo = $stateParams.pageNo;
    if(!checkEmpty($stateParams.pageSize)) $scope.pageSize = $stateParams.pageSize;
}
function returnStatus(s){
    if(s == 1)
        return '抽';
    if(s == 10)
        return '正常';
    if(s == 11)
        return '正常待编目';
    if(s == 12)
        return '正常待审核';
    if(s == 14)
        return '审核中';
    if(s == 15)
        return '编辑中';
    if(s == 20)
        return '删除';
    if(s == 30)
        return '禁用';
    if(s == 111)
        return '审核未通过';
    if(s == -1)
        return '未关联曲库';
}
angular.module('app.routes').controller('PaginationCustomController',['$scope','$state','$stateParams',function($scope,$state,$stateParams){
    if(!checkEmpty($stateParams.pageNo)) $scope.pageNo = $stateParams.pageNo;
    if(!checkEmpty($stateParams.pageSize)) $scope.pageSize = $stateParams.pageSize;
    $scope.choosePage = function(){//分页跳转
        $state.go($state.current.name,{pageNo: $scope.page.currentPage});
    };
    $scope.jumpPage = function(pageNo){ //页面跳转
        $state.go($state.current.name,{pageNo:pageNo});
    };
    $scope.pageSizeOptions = [{'value':'20'},{'value':'50'},{'value':'100'},{'value':'150'},{'value':'200'}];
    if(checkEmpty($scope.pageSize)) $scope.pageSize = $scope.pageSizeOptions[1].value;
        // $scope.pageSize = $scope.pageSize == undefined ? $scope.pageSizeOptions[1].value : $scope.pageSize;
    $scope.choosePageSize = function (pageSize) {   //每页展示数据
        $state.go($state.current.name,{pageSize:pageSize,pageNo:1});
        console.log($state.current);
    };
}]);
