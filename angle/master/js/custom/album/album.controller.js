/**
 * Created by YuChunzhuo on 2015/12/8.
 */
(function () {
    angular.module('app.routes').config(albumConfig);
    albumConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function albumConfig($stateProvider, helper){
        $stateProvider
            .state('app.album', {//专辑列表页面
                url: '/album?:time&:id&:tagBeans&:category&:pageNo&:pageSize&:albumKeyword&:albumIds&:artistKeyword&:artistId&:karakalStatus&:lastEdit&:lastEditSearch&:accurateArtist&:style&:ckResult&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:status',
                title: '专辑管理',
                templateUrl: 'app/views/album/album.html',
                controller: 'AlbumController'
            })
            .state('albumInfo',{
                'url':'/albumInfo?:albumId&:lastPage&:returnBtn',
                title: '查看-专辑查看',
                templateUrl:'app/views/album/album-info.html',
                resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','modernizr'),
                controller: 'AlbumInfoController'
            })
            .state('albumExamine',{
                'url':'/albumExamine?:albumId&:lastPage&:taskId&:returnBtn',
                title: '审核-专辑审核',
                templateUrl:'app/views/album/album-info.html',
                resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','modernizr'),
                controller: 'AlbumExamineController'
            })
            .state('albumEdit',{
                'url': '/albumEdit?:albumId&:tp&:lastPage&:auth',
                title: '编辑-专辑编辑',
                templateUrl:'app/views/album/album-edit.html',
                resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','inputmask','modernizr', 'angularFileUpload'),
                controller: 'AlbumEditController'
            })
            .state('albumCheck',{
                'url':'/albumCheck?:albumId&:lastPage&:taskId',
                title: '抽查-专辑抽查',
                templateUrl:'app/views/album/album-info.html',
                resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','modernizr'),
                controller: 'AlbumCheckController'
            })
            .state('material.preAlbum',{
                url: '/preAlbum',
                title: '预览-专辑预览',
                views: {
                    '': {
                        templateUrl: 'app/views/album/album-info.html',
                        controller: 'PreDataController'
                    }
                }
            })
    }
    /**
     * 锚点定点跳转
     */
    angular.module('app.routes').controller('GotoAnchor',['$scope', '$location', '$anchorScroll', '$state',function($scope,$location,$anchorScroll,$state){
        $scope.gotoAnchor = function(id) {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash(id);
            // call $anchorScroll()
            $anchorScroll();
        };
        $scope.selectImgNext = function(img,imgs){  //下一张图片
            selectImgNext(img,imgs);
        };
        $scope.selectImgPre = function(img,imgs){   //上一张图片
            selectImgPre(img,imgs);
        };
        $scope.jumpInfo = function(type,id,op){     //跳转info界面
            infoNewTabState(type,id,op,$state)
        }
    }]);
    angular.module('app.routes').controller('AlbumController',['$scope', '$http', '$stateParams', 'permissions', '$timeout', '$rootScope', 'display', '$state', '$window', '$cookies', 'SweetAlert',
        function ($scope, $http, $stateParams, permissions, $timeout, $rootScope, display, $state,$window,$cookies,SweetAlert) {
            if(checkEmpty($scope.users)) $scope.users = JSON.parse(localStorage.getItem('users'));
            //界面元素控制下拉框列表
            var _table = JSON.parse(localStorage.getItem('local-albumHtml'));
            $scope.album_html = _table ? _table : [{name:'状态', checked:true},{name:'专辑ID', checked:true},{name: '专辑名称', checked:true},{name: '艺人名', checked:true},{name:'发行时间', checked:true},{name:'语言', checked:true}];
            $scope.storageTableShow = function () {
                var _localStorage = [];
                $scope.album_html.forEach(function (val) {
                    _localStorage.push(val);
                });
                localStorage.setItem('local-albumHtml', JSON.stringify(_localStorage));
            };

            //初始化界面的albums
            $scope.datas = [];
            $scope.albumTags = [];
            $scope.page = new Object();
            $scope.form = {};
            $scope.form.searchTag = [];
            $scope.form.tagBeans = [];
            getTagList(2,$scope,$stateParams,$http,$cookies,SweetAlert);
            var url = _search_album + '?' + CALLBACK;
            url = materialListFillUrl(url, $stateParams);
            if(url != undefined){
                $http.jsonp(url).success(function(res){
                    //填充页面数据
                    getMaterialBySearch(res, $http, $scope, 'album');
                    //分页
                });
            }
            //分页
            var page_url = _search_album + '?' + CALLBACK;
            page_url = materialListFillUrl(page_url, $stateParams, 'count');
            if(page_url != undefined){
                $http.jsonp(page_url).success(function(res){
                    //分页
                    materialListSeparatePage($scope, res);
                });
            }
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
                if(!checkEmpty(params.tagBeans))
                    params.tagBeans = angular.toJson(params.tagBeans);
                params.pageNo = '',params.pageSize = '';
                params.time = new Date().getTime();
                $state.go('app.album',params,{reload: false, inherit: false});
            };
            //选择最后编辑人
            $scope.selectLastEdit = function(user){
                $scope.form.lastEdit = user.uId;
            };
            //重置搜索条件
            $scope.reset = function(){
                $scope.form = {};
                $scope.form.searchTag = [];
            };
            //选择标签时候选择顶部标签
            $scope.selectMainTag = function(tag){
                $scope.tag_list = tag.children;
            };
            $scope.selectSearchTag = function(tag){
                selectTagSearch(tag,$scope);
            };
            //全文搜索
            $scope.getSearchResult = function(value){
                //console.log(value);
                return $http.jsonp(_search_album+'?'+CALLBACK+'&data='+JSON.stringify({"albumKeyword": value, "isolated":0})).then(function(response){
                    //console.log(response.data);
                    return response.data.body.list.map(function(item){
                        //console.log(item);
                        var allstr = item.albumName + '-';
                        if(item.artists != undefined && item.artists != null){
                            for (var i = 0; i < item.artists.length; i++){
                                allstr += item.artists[i].artistName + ',';
                            }
                        }
                        allstr = allstr.substr(0, allstr.length - 1) + '-' + item.albumId;
                        item.allstr = allstr;
                        return item;
                    });
                })
            };
            //全文检索选择事件
            $scope.addAlbum2List = function(album){
                console.log(album);
                $state.go('app.album',{albumIds:album.albumId, albumKeyword:''});
            };
            //全文检索点击搜索按钮
            $scope.searchAlbumBtn = function(value){
                $state.go('app.album',{albumKeyword:value, albumIds:''});
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
            //标签右上角的叉叉函数
            $scope.albumTagRemove = function(tag){
                console.log(tag);
                styleTagSearchWay(tag,$scope,false);
                //tagRemove(tag,$scope,$stateParams,$state,'app.album');
                $scope.form.searchTag.remove(tag);
                $scope.form.tagBeans.remove(tag);
            };
            //点击标签树中的标签跳转相应数据显示页面
            $scope.albumTagClick = function(tag){
                tagClick(tag,albumTagTree,'app.album',$stateParams,$state);
            };
            $scope.changeTagType = function (type) {
                for(var i = 0; i < $scope.form.tagBeans.length; i++){
                    if(!checkEmpty($scope.form.tagBeans[i].type)){
                        $scope.form.tagBeans[i].type = type;
                    }
                }
            };
            //重新抽取素材
            $scope.extractedMaterial = function(id, type){
                extractedMaterial(id, type, $http, SweetAlert);
            };
            //分页跳转
            $scope.choosePage = function(){
                $state.go('app.album',{pageNo: $scope.page.currentPage});
            };
            //监听键盘按钮事件
            //$scope.enter = function(event, searchValue, searchType){
            //    if(event.keyCode == 13){
            //        //console.log(searchValue);
            //        if(searchType == 'albumId'){
            //            $state.go('app.album',{albumIds:searchValue, albumKeyword:'', artistKeyword:'', karakalStatus:''});
            //        } else if(searchType == 'albumName'){
            //            $state.go('app.album',{albumIds:'', albumKeyword:searchValue});
            //        } else if(searchType == 'artistName'){
            //            $state.go('app.album',{albumIds:'', artistKeyword:searchValue});
            //        }
            //    }
            //};
            //勾选框控制界面元素
            $scope.changeCheck = function(html){
                //把勾选框去掉
                html.cheched = !html.cheched;
                $scope.html_chooseElem = false;
            };
            //显示所有属性
            $scope.showAllHtmlElem = function(){
                for(var  i = 0; i < $scope.album_html.length; i++){
                    $scope.album_html[i].checked = true;
                }
            };
            //点击展开自定义界面列表
            $scope.showDropChooseElem = function(){
                if($scope.html_chooseElem == undefined){
                    $scope.html_chooseElem = true;
                } else {
                    $scope.html_chooseElem = !$scope.html_chooseElem;
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
                var selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'albumId');
                addToCheckTask($http, "album", selectedDataIds, SweetAlert);
            };
            //查看艺人信息按钮
            $scope.showInfo = function(type,data){
                openNewTab(type,data,'Info',$state);
            };
            //编辑按钮
            $scope.editJump = function(data){
                editJumpNew('album',data,SweetAlert,$state,'_self', $stateParams);
            };
            $scope.rightClick = function (data) {
                editJumpNew('album',data,SweetAlert,$state, '_blank', $stateParams);
            };
            $scope.separate = function(type,id){
                var url = $state.href('app.separate',{type:type,id:id,lastPage:returnLastPageTime()});
                window.open(url,'_blank');
            };
            $scope.new = function(type){
                addNewMaterialFromTop(type,$state);
            };
        }]);
    angular.module('app.routes').controller('AlbumInfoController', ['$http', '$scope', '$sce', '$stateParams', '$cookies', '$state', '$timeout', '$rootScope', 'display', 'SweetAlert',function($http,$scope,$sce,$stateParams,$cookies,$state,$timeout,$rootScope,display,SweetAlert){
            if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
            getDataInfo('album',$http,$scope,$sce,$stateParams,true);
            basicRequest('album',catalogsAlbum,$scope,$http,$sce,$stateParams,$cookies,true);
            $scope.goBack = function(){     //返回按钮
                window.open(returnLastPage($stateParams.lastPage), '_self');
            };
            $scope.edit = function(type,id){    //编辑按钮
                toEdit(type,id,$stateParams,$state,SweetAlert);
            };
            $scope.editJump = function(data){       //编辑按钮
                editJumpNew('album',data,$timeout,$rootScope,display,'_self');
            };
            $scope.jumpInfo = function(type,id,op){
                infoNewTabState(type,id,op,$state)
            };
            $scope.addPlaySong = function(songId,copyId){ //歌曲播放
                addPlaySong(songId,copyId,SweetAlert);
            };
            loadMoreRecord('album',$scope,$stateParams,$http,SweetAlert);
        }]);
    angular.module('app.routes').controller('AlbumExamineController', ['$scope', '$http', '$sce', '$stateParams', '$cookies', 'display', '$timeout', '$rootScope', 'SweetAlert',function($scope,$http,$sce,$stateParams,$cookies,display,$timeout,$rootScope,SweetAlert){
            getLastExamine($stateParams.albumId, $scope);
            if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
            $scope.examine = true;
            basicRequest('album',catalogsAlbum,$scope,$http,$sce,$stateParams,$cookies);
            //basicRequest('album',$scope,$http,$sce,$stateParams,$cookies);
            $scope.examineConfirm = function(examineResult, examineSuggest){    //审核确认
                examineCommon('album',examineResult,examineSuggest,$http,$stateParams,SweetAlert);
            };
            $scope.goBack = function(type,id){      //返回按钮
                unLock(type,id,$http,$stateParams,SweetAlert);     //解锁审核状态
            };
            $scope.addPlaySong = function(songId,copyId){ //歌曲播放
                addPlaySong(songId,copyId,SweetAlert);
            };
            loadMoreRecord('album',$scope,$stateParams,$http,SweetAlert);
        }]);
    angular.module('app.routes').controller('AlbumEditController', ['$scope', '$http', '$sce', '$stateParams', '$cookies', 'display', '$state', '$timeout', '$rootScope', '$filter', 'SweetAlert',function($scope,$http,$sce,$stateParams,$cookies,display,$state,$timeout,$rootScope,$filter,SweetAlert){
            $scope.type = 'album';
            $scope.preBtn = true;
            addNewDataPage('album',$scope,$stateParams);
            // getDataInfo('album',$http,$scope,$sce,$stateParams,true);
            basicRequest('album',catalogsAlbum,$scope,$http,$sce,$stateParams,$cookies,true);
            //basicRequest('album',$scope,$http,$sce,$stateParams,$cookies,true);
            getTaggingTags('2',$scope,$http);       //获取标签树
            $scope.changeTemplate = function(tp){       //切换模板
                sweetAlertConfirm(SweetAlert,function(){
                    $state.go('albumEdit',{tp:tp});
                    sweetAlertCommon(SweetAlert,'操作成功','success');
                },'warning',undefined,'更换模板将丢失部分数据');

                //$state.go('albumEdit',{tp:tp});
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
            $scope.getSearchResult = function(value,type){      //获取搜索数据
                var param = {};param.params = {};param.params.data={};
                param.params.data[type+'Keyword'] = value;
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
                            return res.data.data.map(function(item){
                                var allstr = item[type+'Name'] + '--' + item.sex + ',' + item.artistNameAlias + ',' + item.nation + ',';
                                if(item.artists != undefined && item.artists != null){
                                    for (var i = 0; i < item.artists.length; i++){
                                        allstr += item.artists[i].artistName + ',';
                                    }
                                }
                                allstr = allstr.substr(0, allstr.length - 1) + ',' + item[type+'Id'];
                                item.allstr = allstr;
                                return item;
                            });
                        });
                    }
                })
            };
            $scope.addRelationData = function(data,arr){        //添加关联关系数据（添加歌手）
                addRelationData(data,arr,'artist');
                console.log($scope.data.artists);
            };
            $scope.removeRelationData = function(data, arr){        //删除关联关系数据（删除歌手）
                arr.remove(data);
            };
            $scope.open = function(flag,model) {     //打开日期框
                if(flag == 1){
                    $scope.dateStatus.opened1 = true;
                } else if (flag == 2){
                    $scope.dateStatus.opened2 = true;
                }
            };
            $scope.dateStatus = {opened1: false, opened2: false};
            $scope.tagging = function(t,type, parentT, grandPT){  //打标签操作
                setTaggingData(t,type,$scope);
                if(parentT) setTaggingData(parentT, type, $scope);
                if(grandPT) setTaggingData(grandPT, type, $scope);
                console.log(parentT);
            };
            $scope.taggingShow = function (t, $event) {
                if(t.tagName == '中国方言' || t.isParent){  //展示中国方言二级标签特殊处理
                    if(!t.selectedIndex) t.selectedIndex = t.tagId;
                    else t.selectedIndex = undefined;
                }
                $event.stopPropagation();
            };
            $scope.getCStyle = function(tp,property) {   //获取子风格和其他子风格
                getCStyle(tp,property,$scope,$http);
            };
            $scope.addPlaySong = function(songId,copyId){ //歌曲播放
                addPlaySong(songId,copyId,SweetAlert);
            };
            $scope.fixDateNew = function(date,data,property){   //修复自定义标签时间
                if(checkEmpty($scope[data])){
                    $scope[data] = {};
                }
                $scope[data][property] = fixDate(date);
            };
            $scope.submit = function(tagExt){     //提交按钮
                if(!$scope.data.albumName) return sweetAlertCommon(SweetAlert, '专辑名不能为空', 'warning');
                if(!$scope.data.artists || $scope.data.artists.length == 0) return sweetAlertCommon(SweetAlert, '专辑艺人不能为空', 'warning');
                if(!checkEmpty(tagExt)){
                    tagExt.status = 1;
                    $scope.taggingData.tagExt = tagExt;
                }
                submit('album',$scope,$http,$stateParams,$filter,SweetAlert);
            };
            $scope.removeTagging = function(t){     //去除已打标签
                removeTagging(t,$scope);
            };
            $scope.uploadImg = function(form,id){       //上传图片
                console.log(form);
                id = $scope.data ? $scope.data.albumId : undefined;
                uploadImg(id,'album',$scope,$http,SweetAlert);
            };
            $scope.deleteImg = function () {        //删除图片
                deleteImg($scope,SweetAlert);
            };
            $scope.new = function(type){        //新增素材
                addNewMaterialFromTop(type,$state);
            };
            $scope.goBack = function(type,id){      //返回按钮
                if(checkEmpty($stateParams.albumId)){
                    window.open(returnLastPage($stateParams.lastPage),'_self');
                }else{
                    unLock(type,id,$http,$stateParams,SweetAlert);     //解锁审核状态
                }
            };
            $scope.scoreChange = function(s,property){
                watchScore(s,property);
            };
            loadMoreRecord('album',$scope,$stateParams,$http,SweetAlert);
        }]);
    angular.module('app.routes').controller('AlbumCheckController', ['$scope', '$http', '$sce', '$stateParams', '$cookies', 'display', '$timeout', '$rootScope', 'SweetAlert',function($scope,$http,$sce,$stateParams,$cookies,display,$timeout,$rootScope,SweetAlert){
            $scope.check = true;
            $scope.ckTagError = {};
            getLastExamine($stateParams.albumId, $scope);
            basicRequest('album',catalogsAlbum,$scope,$http,$sce,$stateParams,$cookies);
            //basicRequest('album',$scope,$http,$sce,$stateParams,$cookies);
            //抽查提交按钮
            $scope.checkMaterial = function(ckResult, ckSuggest, ckTagError){
                checkCommon('album',ckResult,ckSuggest,ckTagError,$http,$stateParams,SweetAlert);
            };
            $scope.goBack = function(type,id){      //返回按钮
                unLock(type,id,$http,$stateParams,SweetAlert);     //解锁审核状态
            };
            loadMoreRecord('album',$scope,$stateParams,$http,SweetAlert);
        }]);

})();



//从全局搜索接口获取id然后获取素材详细信息
function getMaterialBySearch(res, $http, $scope, type){
    // var materialIds = [];
    for(var i = 0; i < res.body.list.length; i++){
        // materialIds.push(res.body.list[i][type + 'Id']);
        $scope.datas.push(res.body.list[i]);
    }
    // if(materialIds.length > 0){
    //     $http.jsonp(list_url + type + ".json?callback=JSON_CALLBACK&ids=" + materialIds.join(',')).success(function(res){
    //         for(var i = 0; i < res.data.length; i++){
    //             if(!judgeRepeat($scope['datas'], res.data[i], type)){
    //                 $scope['datas'].push(res.data[i]);
    //             }
    //         }
    //     });
    // }
}
var catalogsAlbum = [{'name':'概述','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'标签','id':'catalog-3'},{'name':'创作背景','id':'catalog-4'},{'name':'获奖情况','id':'catalog-5'},{'name':'专辑介绍','id':'catalog-6'},{'name':'专辑评价','id':'catalog-7'},{'name':'曲目列表','id':'catalog-8'}];
//专辑页面填充url
function materialListFillUrl(url, $stateParams, flag){
    var data = new Object();
    var pageNo = ($stateParams.pageNo == undefined ? 1 : $stateParams.pageNo);
    var pageSize = ($stateParams.pageSize == undefined ? 50 : $stateParams.pageSize);
    data.pageNo = pageNo;
    data.pageSize =pageSize;
    if(!isPropertyEmpty($stateParams.tagIds)){
        data.tags = stringToArray($stateParams.tagIds);
    }
    if(!isPropertyEmpty($stateParams.tagBeans)){
        data.tagBeans = JSON.parse($stateParams.tagBeans);
    }
    if(!isPropertyEmpty($stateParams.albumIds)){
        data.albumIds = stringToArray($stateParams.albumIds);
    }
    if(!isPropertyEmpty($stateParams.albumKeyword)){
        data.albumKeyword = $stateParams.albumKeyword;
    }
    if(!isPropertyEmpty($stateParams.artistKeyword)){
        data.artistKeyword = $stateParams.artistKeyword;
    }
    if(!isPropertyEmpty($stateParams.artistId)){
        data.artistId = $stateParams.artistId;
    }
    if(!isPropertyEmpty($stateParams.artistIds)){
        data.artistIds = stringToArray($stateParams.artistIds);
    }
    if(!isPropertyEmpty($stateParams.karakalStatus)){
        data.karakalStatus = $stateParams.karakalStatus;
    }
    if(!isPropertyEmpty($stateParams.status)){
        data.status = $stateParams.status;
    }
    if(!isPropertyEmpty($stateParams.songIds)){
        data.songIds = stringToArray($stateParams.songIds);
    }
    if(!isPropertyEmpty($stateParams.songKeyword)){
        data.songKeyword = $stateParams.songKeyword;
    }
    if(!isPropertyEmpty($stateParams.lyricPerson)){
        data.lyricser = $stateParams.lyricPerson;
    }
    if(!isPropertyEmpty($stateParams.composePerson)){
        data.composer = $stateParams.composePerson;
    }
    //指挥者
    if(!isPropertyEmpty($stateParams.conductor)){
        data.cantor = $stateParams.conductor;
    }
    //演奏者
    if(!isPropertyEmpty($stateParams.player)){
        data.performer = $stateParams.player;
    }
    if(!isPropertyEmpty($stateParams.lastEdit)){
        data.editUid = $stateParams.lastEdit;
    }
    if(!isPropertyEmpty($stateParams.copyrightId)){
        data.copyrightId = $stateParams.copyrightId;
    }
    if(!isPropertyEmpty($stateParams.projectName)){
        data.projectName = $stateParams.projectName;
    }
    if(!isPropertyEmpty($stateParams.orderBys)){
        data.orderBys = [],data.orderBys.push($stateParams.orderBys);
    }
    if(!isPropertyEmpty($stateParams.ckResult)) data.ckResult = $stateParams.ckResult;
    if(!isPropertyEmpty($stateParams.mscoreMin)) data.mscoreMin = $stateParams.mscoreMin;
    if(!isPropertyEmpty($stateParams.mscoreMax)) data.mscoreMax = $stateParams.mscoreMax;
    if(!isPropertyEmpty($stateParams.hotScoreMin)) data.hotScoreMin = $stateParams.hotScoreMin;
    if(!isPropertyEmpty($stateParams.hotScoreMax)) data.hotScoreMax = $stateParams.hotScoreMax;
    if(!isPropertyEmpty($stateParams.istag)) data.istag = $stateParams.istag;
    if(!isPropertyEmpty($stateParams.category)) data.category = $stateParams.category;
    if($stateParams.queryMethod) data.queryMethod = $stateParams.queryMethod;
    if(flag == 'count') data.isQueryCount = 1;
    data.isolated = 0;
    url += '&data=' + encodeURIComponent(JSON.stringify(data));
    return url;
}
function fillSearchCondition($stateParams, $scope, $http, $cookies, songTagTree){
    //获取所有git用户
    //填充最后编辑人
    if($scope.$parent.users ==undefined || $scope.$parent.users.length <= 0){
        getGitUsers($http,$cookies,$scope, 1, function (){
            //console.log($scope.gitUsers);
            $scope.$parent.users = git_users;
            fillUser();
        });
    } else {
        fillUser();
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
    if(!isPropertyEmpty($stateParams.tagIds)){
        for(var i = 0; i < $stateParams.tagIds.split(',').length; i++){
            //遍历获取到的标签树获得标签ID对应的标签
            var tag = getTagById($stateParams.tagIds.split(',')[i], songTagTree);
            if(tag != undefined){
                $scope.form.searchTag.push(tag);
            }
        }
    }
    for(var property in $stateParams){
        if(!isPropertyEmpty($stateParams[property])){
            $scope.form[property] = $stateParams[property];
        }
    }
}
//分页显示
function materialListSeparatePage($scope, res){
    if(checkEmpty($scope.page)) $scope.page = {};
    $scope.page.maxSize = 5;
    $scope.page.itemsPerPage = checkEmpty(res.body)?res.data.pageSize:res.body.pageSize;
    $scope.page.currentPage = checkEmpty(res.body)?res.data.pageNo:res.body.pageNo;
    $scope.page.totalItems = checkEmpty(res.body)?res.data.totalCount:res.body.totalCount;
    $scope.page.totalPage = checkEmpty(res.body)?res.data.pageTotal:res.body.pageTotal;
}

//素材去重
function judgeRepeat(datas, data, type){
    for(var i = 0; i < datas.length; i++){
        if(datas[i][type + 'Id'] == data[type + 'Id']){
            return true;
        }
    }
    return false;
}