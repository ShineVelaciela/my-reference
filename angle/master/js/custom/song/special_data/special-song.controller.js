/**
 * Created by yuchunzhuo on 2016/4/22.
 */
angular.module('app.routes').config(specialsongConfig);
specialsongConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
function  specialsongConfig($stateProvider,helper){
    $stateProvider
        .state('app.special-song', {//缺歌页面
            url: '/special-song?:id&:tagId&:pageNo&:pageSize&:copyrightId&:songIds&:songName&:artistIds&:artistName&:language&:ethnic&:category&:termStartTime&:termEndTime&:cstartTime&:cendTime&:ustartTime&:uendTime',
            title: '专项歌曲',
            templateUrl: 'app/views/song/special_data/special-song.html',
            controller: 'SpecialSongController'
        })
}
angular.module('app.routes').controller('SpecialSongController', ['$scope', '$http', '$stateParams', 'permissions', '$cookies', '$timeout', '$rootScope', '$window', 'display', '$state,SweetAlert',
    function ($scope, $http, $stateParams, permissions, $cookies, $timeout, $rootScope, $window, display, $state,SweetAlert) {
    if($stateParams.tagId != undefined){
        $scope.tagId = $stateParams.tagId;
    }
    //界面元素控制下拉框列表
    $scope.song_html = [
        {
            name: '曲库是否引入',
            cheched: false
        }, {
            name: '版权ID',
            cheched: true
        }, {
            name: '歌曲ID',
            cheched: true
        }, {
            name: '歌曲名称',
            cheched: true
        }, {
            name: '歌手ID',
            cheched: true
        }, {
            name: '歌手名称',
            cheched: true
        }, {
            name: '有效期',
            cheched: true
        }, {
            name: '语种',
            cheched: true
        }, {
            name: '民族',
            cheched: true
        }, {
            name: '分类',
            cheched: true
        }, {
            name: '入库时间',
            cheched: true
        }
    ];
    //初始化界面的datas
    $scope.datas = [];
    $scope.songTags = [];
    $scope.page = new Object();
    var songTagTree = [];
    //获取专项库顶部标签树
    var special_song_tag_url = special_data + 'tags.json?' + CALLBACK + '&kuid=' + $cookies.get("kuid");
    $http.jsonp(special_song_tag_url).success(function (res) {
        //console.log(res);
        if (res.status == '1') {
            //把标签树保存下来供其它地方根据ID获取标签
            songTagTree = res.data.list;
            //获取页面数据
            var url = special_data + 'song.json?' + CALLBACK;
            url = fillSearchUrl(url, $stateParams);
            if (url != undefined) {
                $http.jsonp(url).success(function (res) {
                    res.body = res.data;
                    $scope.datas = res.data.list;
                    //填充页面数据
                    //getMaterialBySearch(res, $http, $scope, 'song');
                    //分页
                    materialListSeparatePage($scope, res);
                    $scope.page.startRow = res.body.startRow;
                });
            }
            //显示已经选取的标签
            if ($stateParams.tagId != undefined) {
                for (var ii = 0; ii < $stateParams.tagId.split(',').length; ii++) {
                    var tagId = $stateParams.tagId.split(',')[ii];
                    //遍历获取到的标签树获得标签ID对应的标签
                    var tag = getTagByTagId($stateParams.tagId.split(',')[ii], songTagTree);
                    if (tag != undefined) {
                        $scope.songTags.push(tag);
                    }
                }
            }
            $scope.tags_list = songTagTree;
        } else {
            console.log(res);
            //alert('返回异常，无法加载标签，返回值:' + JSON.stringify(res));
            sweetAlertCommon(SweetAlert,'请求异常，无法加载标签树','warning');
        }
        //点击顶部标签展开下级的标签
        //if ($stateParams.id != undefined) {
        //    for (var i = 0; i < $scope.tags_title.length; i++) {
        //        if ($scope.tags_title[i].id == $stateParams.id) {
        //            $scope.tags_list = $scope.tags_title[i].children;
        //        }
        //    }
        //}
    }).error(function (res) {
        //alert('网络错误，无法加载标签');
        sweetAlertCommon(SweetAlert,'请求异常,无法加载标签树','warning');
    });
    //获取专项库的语言，民族，分类
    var special_song_category = special_data + "getCategories.json?" + CALLBACK;
    $http.jsonp(special_song_category).success(function(res){
        res.body.language.unshift("空");
        res.body.ethnic.unshift("空");
        res.body.category.unshift("空");
        $scope.languages = res.body.language;
        $scope.ethnics = res.body.ethnic;
        $scope.categorys = res.body.category;
        specialFillSearchCondition($scope, $stateParams);
    });
    //过滤返回里面的null或者空
    $scope.filterNullInArray = function(str){
        return str !== null && str !== '';
    };
    //搜索按钮
    $scope.submit = function(){
        $state.go("app.special-song",{category: $scope.search_category, ethnic: $scope.search_ethnic, language: $scope.search_language},{reload: true});
    };
    //全文搜索
    $scope.getSearchResult = function (value) {
        //console.log(value);
        return $http.get(special_data + 'song.json' , {
            params: {
                data: {
                    "songName": value
                }
            }
        }).then(function (response) {
            //console.log(response.data);
            return response.data.data.list.map(function (item) {
                //console.log(item);
                var allstr = item.songName + '-';
                if (item.artists != undefined && item.artists != null) {
                    for (var i = 0; i < item.artists.length; i++) {
                        allstr += item.artists[i].artistName + ',';
                    }
                }
                allstr = allstr.substr(0, allstr.length - 1) + '-' + item.songId;
                item.allstr = allstr;
                return item;
            });
        })
    };
    //全文检索选择事件
    $scope.addSong2List = function (data) {
        console.log(data);
        $state.go('app.special-song', {songIds: stringToArray(data.songId), songKeyword: ''});
    };
    //全文检索点击搜索按钮
    $scope.searchSongBtn = function (value) {
        $state.go('app.special-song', {songKeyword: value, songIds: ''});
    };
    //标签右上角的叉叉函数
    $scope.songTagRemove = function (tag) {
        console.log(tag);
        var tagId = $stateParams.tagId.split(',');
        tagId.splice(tagId.indexOf(tag.tagId), 1);
        $state.go('app.special-song', {tagId: tagId});
    };
    //点击标签树中的标签跳转相应数据显示页面
    $scope.songTagClick = function (tag) {
        $state.go('app.special-song', {tagId: tag.tagId},{inherit :false});
    };
    //重新抽取素材
    $scope.extractedMaterial = function (id, type) {
        extractedMaterial(id, type, $http, $timeout, $rootScope, display);
    };
    //分页跳转
    $scope.choosePage = function () {
        $state.go('app.special-song', {pageNo: $scope.page.currentPage});
    };
    //监听键盘按钮事件
    $scope.enter = function (event, searchValue, searchType) {
        //console.log(searchType);
        if (event.keyCode == 13) {
            //console.log(searchValue);
            if (searchType == 'songId') {
                $state.go('app.special-song', {songIds: stringToArray(searchValue), songName: '', artistIds: '', artistName: '', copyrightId: ''});
            } else if (searchType == 'songName') {
                $state.go('app.special-song', {songIds: '', songName: searchValue, artistIds: '', artistName: '', copyrightId: ''});
            } else if (searchType == 'artistName') {
                $state.go('app.special-song', {songIds: '', songName: '', artistIds: '', artistName: searchValue, copyrightId: ''});
            } else if (searchType == 'artistIds') {
                $state.go('app.special-song', {songIds: '', songName: '', artistIds: stringToArray(searchValue), artistName: '', copyrightId: ''});
            } else if (searchType == 'copyrightId') {
                $state.go('app.special-song', {songIds: '', songName: '', artistIds: '', artistName: '', copyrightId: searchValue});
            } else if (searchType == 'language') {
                $state.go('app.special-song', {songIds: '', songName: '', artistIds: '', artistName: '', category: '', copyrightId: '', ethnic: '', language: searchValue});
            } else if (searchType == 'ethnic') {
                $state.go('app.special-song', {songIds: '', songName: '', artistIds: '', artistName: '', category: '', copyrightId: '', ethnic: searchValue, language: ''});
            } else if (searchType == 'category') {
                $state.go('app.special-song', {songIds: '', songName: '', artistIds: '', artistName: '', category: searchValue, copyrightId: '', ethnic: '', language: ''});
            }
        }
    };
    //显示所有属性
    $scope.showAllHtmlElem = function () {
        for (var i = 0; i < $scope.song_html.length; i++) {
            $scope.song_html[i].cheched = true;
        }
    };
    //编辑按钮
    $scope.editSpecialData = function(data, type){
        //console.log('点击了编辑按钮');
        editSpecialData(data, type, SweetAlert);
    };
    //查看按钮
    $scope.showSpecialData = function(data, type){
        showSpecialData(data, type, SweetAlert);
    };
    //删除单个数据按钮
    $scope.deleteSpecialData = function(data, type){
        var ids = data.copyrightId;
        deleteSpecialData(ids, type, $http, SweetAlert);
    };
    //批量删除按钮
    $scope.deleteSpecialDatas = function(datas, type){
        var ids = getPropertyFromCheckBox(datas, 'checked', true, 'copyrightId');
        deleteSpecialData(ids.join(","), type, $http, SweetAlert);
    };
    //查看艺人信息按钮
    $scope.showInfo = function (data) {
        window.open(getOpenUrl(data, 'song'), "_blank");
    };
    //全选
    $scope.checkAll = function(datas){
        selectAll($scope, datas, 'checked', 'allIsCheck');
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'checked', true, 'copyrightId');
        //console.log($scope.selectedDataIds);
    };
    //单选
    $scope.checkOne = function(data, datas){
        selectOne(data, !data.checked, 'checked');
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'checked', true, 'copyrightId');
        //console.log($scope.selectedDataIds);
    };
}]);

function fillSearchUrl(url, $stateParams){
    var data = new Object();
    var pageNo = ($stateParams.pageNo == undefined ? 1 : $stateParams.pageNo);
    var pageSize = ($stateParams.pageSize == undefined ? 50 : $stateParams.pageSize);
    data.pageNo = pageNo;
    data.pageSize =pageSize;
    if(!isPropertyEmpty($stateParams.copyrightId)){
        data.copyrightId = $stateParams.copyrightId;
    }
    if(!isPropertyEmpty($stateParams.songIds)){
        data.songIds = stringToArray($stateParams.songIds);
    }
    if(!isPropertyEmpty($stateParams.songName)){
        data.songName = $stateParams.songName;
    }
    if(!isPropertyEmpty($stateParams.artistIds)){
        data.artistIds = stringToArray($stateParams.artistIds);
    }
    if(!isPropertyEmpty($stateParams.artistName)){
        data.artistName = $stateParams.artistName;
    }
    if(!isPropertyEmpty($stateParams.language)){
        data.language = $stateParams.language;
    }
    if(!isPropertyEmpty($stateParams.ethnic)){
        data.ethnic = $stateParams.ethnic;
    }
    if(!isPropertyEmpty($stateParams.category)){
        data.category = $stateParams.category;
    }
    if(!isPropertyEmpty($stateParams.termStartTime)){
        data.termStartTime = $stateParams.termStartTime;
    }
    if(!isPropertyEmpty($stateParams.termEndTime)){
        data.termEndTime = $stateParams.termEndTime;
    }
    if(!isPropertyEmpty($stateParams.cstartTime)){
        data.cstartTime = $stateParams.cstartTime;
    }
    if(!isPropertyEmpty($stateParams.cendTime)){
        data.cendTime = $stateParams.cendTime;
    }
    if(!isPropertyEmpty($stateParams.ustartTime)){
        data.ustartTime = $stateParams.ustartTime;
    }
    if(!isPropertyEmpty($stateParams.uendTime)){
        data.uendTime = $stateParams.uendTime;
    }
    if(!isPropertyEmpty($stateParams.tagId)){
        data.tagId = $stateParams.tagId;
    }
    //如果没有参数（只有pageNo和pageSize那么不请求网络）
    var dataPropertyCount = 0;
    for(var elem in data){
        dataPropertyCount++;
    }
    if(dataPropertyCount <= 2){
        return undefined;
    }
    url += '&data=' + JSON.stringify(data);
    return url;
}

function editSpecialData(data, type, SweetAlert){
    var url = '';
    if(type == 'artist'){
        url = quality_tyqk + 'getArtist?PID=6000020&SEQ=mzk&KEY=974e734459c4179cf26605b0993d6271&artistId=' + data.artistId;
    } else if(type == 'album'){
        url = quality_tyqk + 'getAlbum?PID=6000020&SEQ=mzk&KEY=974e734459c4179cf26605b0993d6271&albumId=' + data.albumId;
    } else if(type == 'song'){
        url = quality_tyqk + 'getSong?PID=6000020&SEQ=mzk&KEY=974e734459c4179cf26605b0993d6271&songId=' + data.songId;
    }
    jQuery.ajax({
        url: url ,
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "jsonp",  // not "json" we'll parse
        jsonp: CALLBACK,
        contentType: "application/jsonp; charset=utf-8",
        success: function(res) {
            if(res.status == '000000'){
                var uuid = '';
                var tyqkUrl = '';
                if(type == 'artist'){
                    uuid = res.artists[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/material/artist!showUpdateArtistPage.action?artistFormBean.artistId=' + uuid;
                } else if(type == 'album'){
                    uuid = res.albumList[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/material/album!showUpdateAlbumPage.action?albumFormBean.albumId=' + uuid;
                } else if(type == 'song'){
                    uuid = res.songList[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/musiclibrary/song!showUpdateSongPage.action?songFormBean.songId=' + uuid;
                }
                if(tyqkUrl != '' && uuid != undefined && uuid != ''){
                    window.open(tyqkUrl);
                }
            } else {
                sweetAlertCommon(SweetAlert,'反向接口返回异常','warning');
            }
        },
        error: function (res) {
            sweetAlertCommon(SweetAlert,'获取反向接口网络异常','warning');
        }
    });
}

function showSpecialData(data, type, SweetAlert){
    var url = '';
    if(type == 'artist'){
        url = quality_tyqk + 'getArtist?PID=6000020&SEQ=mzk&KEY=974e734459c4179cf26605b0993d6271&artistId=' + data.artistId;
    } else if(type == 'album'){
        url = quality_tyqk + 'getAlbum?PID=6000020&SEQ=mzk&KEY=974e734459c4179cf26605b0993d6271&albumId=' + data.albumId;
    } else if(type == 'song'){
        url = quality_tyqk + 'getSong?PID=6000020&SEQ=mzk&KEY=974e734459c4179cf26605b0993d6271&copyrightId=' + data.copyrightId;
    }
    jQuery.ajax({
        url: url ,
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "jsonp",  // not "json" we'll parse
        jsonp: CALLBACK,
        contentType: "application/jsonp; charset=utf-8",
        success: function(res) {
            if(res.status == '000000'){
                var uuid = '';
                var tyqkUrl = '';
                if(type == 'artist'){
                    uuid = res.artists[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/material/artist!showArtistInfo.action?artistFormBean.artistId=' + uuid;
                } else if(type == 'album'){
                    uuid = res.albumList[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/material/album!showAlbumInfo.action?albumFormBean.albumId=' + uuid;
                } else if(type == 'song'){
                    uuid = res.songList[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/musiclibrary/song!showSongInfo.action?songFormBean.songId=' + uuid;
                }
                if(tyqkUrl != ''){
                    window.open(tyqkUrl);
                }
            } else {
                sweetAlertCommon(SweetAlert,'反向接口返回异常','warning');
            }
        },
        error: function (res) {
            sweetAlertCommon(SweetAlert,'获取反向接口网络异常','warning');
        }
    });
}

function deleteSpecialData(ids, type, $http, SweetAlert){
    if(ids.length == 0){
        sweetAlertCommon(SweetAlert,'没有勾选数据，无法删除','warning');
        return;
    }
    if(type == 'song'){
        type = "copyright";
    }
    var url = special_data + "delSpecialSong.json?" + CALLBACK + "&" + type + "Ids=" + ids;
    $http.jsonp(url).success(function(res){
        if(res.status == 1){
            sweetAlertCommon(SweetAlert,res.msg,'success');
            location.reload();
        } else {
            sweetAlertCommon(SweetAlert,res.msg,'error');
        }
    }).error(function(res){
        sweetAlertCommon(SweetAlert,'网络异常,删除失败','success');
    });
}

//专项库的导入导出控件
angular.module('app.routes').controller('song_special_controller', ['$scope','$uibModal','$stateParams','SweetAlert',function($scope,$uibModal,$stateParams,SweetAlert){
    $scope.animationsEnabled = true;
    //导入excel
    $scope.import = function(type){
        if($stateParams.tagId == undefined){
            sweetAlertCommon(SweetAlert,"没有选择标签,不能导入",'error');
            return;
        }
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'song_special_import.html',
            controller: 'song_special_import_ctrl',
            resolve: {
                type: function(){
                    return type
                }
            }
        });
    };

    //导出excel
    $scope.export = function(type, selectedDataIds){
        if($stateParams.tagId == undefined){
            sweetAlertCommon(SweetAlert,"没有选择标签,不能导入",'error');
            return;
        }
        console.log(selectedDataIds);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'song_special_export.html',
            controller: 'song_special_export_ctrl',
            resolve: {
                type: function(){
                    return type;
                },
                ids: function(){return selectedDataIds;}
            }
        });
    };

}]);
//专项库导入框
angular.module('app.routes').controller('song_special_import_ctrl', ['$scope','$uibModalInstance','$http','$filter','type','$timeout','$rootScope','display','$stateParams','SweetAlert',
    function($scope,$uibModalInstance,$http,$filter,type,$timeout,$rootScope,display,$stateParams,SweetAlert) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        var filename = $('#file').val();
        if(filename == ''){
            $scope.error = '请选择上传的excel文件';
        }else{
            var url = special_data + 'import/' + type + '.json';
            var datas = {'tagId':$stateParams.tagId};
            ajaxFileUpload(url, $scope, datas, $uibModalInstance,SweetAlert, 'file');
        }
    }
}]);
//专项库导出框
angular.module('app.routes').controller('song_special_export_ctrl', ['$scope', '$uibModalInstance', '$stateParams', '$http', '$stateParams', '$filter', 'type', 'ids',
    function($scope, $uibModalInstance, $stateParams, $http, $stateParams, $filter, type, ids){
    //console.log(type);
    //console.log(data);
    //console.log(ids);
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        var data = filterUndefinedPorperty($stateParams);
        data.copyrightIds = ids;
        var propertyArr = ['copyrightId','songIds','songName','artistIds','artistName','language','ethnic','category','termStartTime','termEndTime','cstartTime','cendTime','ustartTime','uendTime','startNo','endNo','copyrightIds','tagId'];
        data = keepObjectProperty(propertyArr, data);
        var export_data = formatExportCondition(cloneOneObject(data), $filter);
        console.log(export_data);
        //console.log(export_data);
        console.log($scope.export_type);
        if($scope.export_type == 1){
            //console.log("选择了按照选中导出");
            if(ids == undefined || ids == null || ids === '' || ids.length <= 0){
                $scope.error = '没有选中数据，无法导出';
                return;
            }
            if(type != 'song'){
                export_data[type + 'Ids'] = stringToArray(ids);
            } else if (type == 'song'){
                export_data['copyrightIds'] = stringToArray(ids);
            } else {
                return;
            }
        } else if($scope.export_type == 2){
            if($scope.numberStart == undefined || $scope.numberEnd == undefined || $scope.numberStart == '' || $scope.numberEnd == ''){
                $scope.error = '请输入序号起止';
                return;
            }
            export_data.startNo = $scope.numberStart - 1;
            export_data.endNo = $scope.numberEnd - 1;
            //console.log($scope.numberStart + " +++++ " + $scope.numberEnd);
        } else if($scope.export_type == 3){
            if($scope.pageStart == undefined || $scope.pageEnd == undefined || $scope.pageStart == '' || $scope.pageEnd == ''){
                $scope.error = '请输入页码起止';
                return;
            }
            export_data.startNo = ($scope.pageStart - 1) * 100;
            export_data.endNo = $scope.pageEnd * 100 - 1;
            //console.log($scope.pageStart + " +++++ " + $scope.pageEnd);
        } else {
            $scope.error = '请选择导出类型';
            return;
        }
        var url = special_data + 'export/' + type + '.do?data=' + JSON.stringify(export_data);
        console.log(url);
        window.open(url);
        $uibModalInstance.dismiss('cancel');
    };
}]);

function filterUndefinedPorperty($statePatams){
    var data = new Object();
    for(var property in $statePatams){
        if ($statePatams[property] != undefined){
            data[property] = $statePatams[property];
        }
    }
    return data;
}

function getTagByTagId(tagId, tags){
    for(var i = 0; i < tags.length; i++){
        if(tagId == tags[i].tagId){
            return tags[i]
        }
    }
    return undefined;
}

function specialFillSearchCondition($scope, $stateParams){
    if(!isPropertyEmpty($stateParams.language)){
        $scope.search_language = $stateParams.language;
    }
    if(!isPropertyEmpty($stateParams.ethnic)){
        $scope.search_ethnic = $stateParams.ethnic;
    }
    if(!isPropertyEmpty($stateParams.category)){
        $scope.search_category = $stateParams.category;
    }
    if(!isPropertyEmpty($stateParams.pageSize)) $scope.pageSize = $stateParams.pageSize;
    if(!isPropertyEmpty($stateParams.pageNo)) $scope.pageNo = $stateParams.pageNo;
}