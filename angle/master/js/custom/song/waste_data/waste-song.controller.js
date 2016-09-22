/**
 * Created by YuChunzhuo on 2016/5/10.
 */
angular.module('app.routes').config(wastesongConfig);
wastesongConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
function wastesongConfig($stateProvider,helper){
    $stateProvider
        .state('app.waste-song', {//缺歌页面
            url: '/waste-song?:pageNo&:pageSize&:copyrightId&:copyrightStatus&:copyrightTimeStart&:copyrightTimeEnd&:songName&:artistName&:cStartTime&:cEndTime&:tagId',
            title: '垃圾歌曲',
            templateUrl: 'app/views/song/waste_data/waste-song.html',
            controller: 'WasteSongController'
        })
}
angular.module('app.routes').controller('WasteSongController', ['$scope', '$http', '$stateParams', 'permissions', '$timeout', '$rootScope', 'display', '$state', '$filter','$window','SweetAlert',
    function ($scope, $http, $stateParams, permissions, $timeout, $rootScope, display, $state, $filter,$window,SweetAlert) {
    $scope.form = {};
    //$scope.form.searchTag = [];


    //界面元素控制下拉框列表
    //初始化界面的songs
    $scope.datas = [];
    $scope.songTags = [];
    $scope.page = new Object();
    var songTagTree = [];
    var songFilterTagTree = [];

    $http.jsonp(waste_data + "tags.json?" + CALLBACK).success(function(res){
        $scope.tags = res.data.list;
        wasteFillSearchCondition($scope, $stateParams);

        var url = waste_data + "song.json?" + CALLBACK;
        url = wasteMaterialListFillUrl(url, $stateParams, $scope.tags);
        if(url != undefined){
            $http.jsonp(url).success(function(res){
                //填充页面数据
                //getMaterialBySearch(res, $http, $scope, 'song');
                $scope.datas = res.data.list;
                //分页
                res.body = res.data;
                materialListSeparatePage($scope, res);
            });
        }
    });

    //获取歌曲的标签搜索树
    //提交搜索条件
    $scope.submit = function(){
        var params = $scope.form;
        //console.log(formatDate(Date.parse($scope.form.copyrightTimeStart), $filter));
        $state.go('app.waste-song',{copyrightId: params.copyrightId, copyrightStatus: params.copyrightStatus, songName: params.songName, artistName: params.artistName, tagId: params.tagId, copyrightTimeStart: formatDate(Date.parse($scope.form.copyrightTimeStart),$filter), copyrightTimeEnd: formatDate(Date.parse($scope.form.copyrightTimeEnd),$filter), cStartTime: formatDate(Date.parse($scope.form.cStartTime),$filter), cEndTime: formatDate(Date.parse($scope.form.cEndTime),$filter)},{reload: true, newtab : true});
    };

    //重置搜索条件
    $scope.reset = function(){
        $scope.form = {};
        //$scope.form.searchTag = [];
    };

    //选择标签时候选择顶部标签
    $scope.selectMainTag = function(tag){
        console.log(tag);
        $scope.tag_list = tag.children;
    };
    //选择需要搜索的标签
    $scope.songSelectSearchTag = function(tag){
        if($scope.form.searchTag != undefined && $scope.form.searchTag.length != 0){
            for(var i = 0; i < $scope.form.searchTag.length; i++){
                if($scope.form.searchTag[i].id == tag.id){
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
                    "songKeyword": value
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
        $state.go('app.waste-song',{pageNo: $scope.page.currentPage});
    };
    //监听键盘按钮事件
    $scope.enter = function(event, searchValue, searchType){
        if(event.keyCode == 13){
            //console.log(searchValue);
            if(searchType == 'songId'){
                $state.go('app.song',{songIds:searchValue, songKeyword:'', artistKeyword:'', tagIds:'', karakalStatus:''});
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
            $scope.song_html[i].cheched = true;
        }
    };
    //查看歌曲信息按钮
    $scope.showInfo = function(data){
        window.open(getOpenUrl(data,'song'), "_blank");
    };
    //播放歌曲按钮
    $scope.playSong = function(data){
        if(isPropertyEmpty(data.cids)){
            sweetAlertCommon(SweetAlert,'当前歌曲没有版权id,无法播放','warning');
        } else {
            addPlaySong(data.songId, data.cids.copyrightId,SweetAlert);
        }
    };
    //全选
    $scope.checkAll = function(datas){
        //console.log($scope.allIsCheck);
        selectAll($scope, datas, 'checked', 'allIsCheck');
        //console.log($scope.allIsCheck);
        //console.log($scope.selectedDataIds);
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'checked', true, 'copyrightId');
    };
    //单选
    $scope.checkOne = function(data, datas){
        selectOne(data, !data.checked, 'checked');
        //console.log($scope.selectedDataIds);
        $scope.selectedDataIds = getPropertyFromCheckBox(datas, 'checked', true, 'copyrightId');
    };
    //删除单个数据按钮
    $scope.deleteWasteData = function(data, type){
        var ids = data.copyrightId;
        deleteWasteData(ids, type, $http, SweetAlert);
    };
    //批量删除数据按钮
    $scope.deleteWasteDatas = function(datas, type){
        var ids = getPropertyFromCheckBox(datas, 'checked', true, 'copyrightId');
        deleteWasteData(ids.join(","), type, $http, SweetAlert);
    };
    //查看
    $scope.showDataInfo = function(data, type){
        showTyqk(data, type, $timeout,$rootScope, display, $window);
    };
    //编辑
    $scope.editData = function(data, type){
        editTyqk(data, type, $timeout,$rootScope, display, $window);
    };
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
}]);
function fillSearchCondition($stateParams, $scope, songTagTree){
    if(!isPropertyEmpty($stateParams.songIds)){
        $scope.form.songIds = $stateParams.songIds;
    }
    if(!isPropertyEmpty($stateParams.songKeyword)){
        $scope.form.songKeyword = $stateParams.songKeyword;
    }
    if(!isPropertyEmpty($stateParams.artistKeyword)){
        $scope.form.artistKeyword = $stateParams.artistKeyword;
    }
    if(!isPropertyEmpty($stateParams.albumKeyword)){
        $scope.form.albumKeyword = $stateParams.albumKeyword;
    }
    if(!isPropertyEmpty($stateParams.karakalStatus)){
        $scope.form.karakalStatus = $stateParams.karakalStatus;
    }
    if(!isPropertyEmpty($stateParams.lyricPerson)){
        $scope.form.lyricPerson = $stateParams.lyricPerson;
    }
    if(!isPropertyEmpty($stateParams.composePerson)){
        $scope.form.composePerson = $stateParams.composePerson;
    }
    if(!isPropertyEmpty($stateParams.conductor)){
        $scope.form.conductor = $stateParams.conductor;
    }
    if(!isPropertyEmpty($stateParams.player)){
        $scope.form.player = $stateParams.player;
    }
    if(!isPropertyEmpty($stateParams.lastEditor)){
        $scope.form.lastEditor = $stateParams.lastEditor;
    }
    if(!isPropertyEmpty($stateParams.copyrightId)){
        $scope.form.copyrightId = $stateParams.copyrightId;
    }
    if(!isPropertyEmpty($stateParams.projectName)){
        $scope.form.projectName = $stateParams.projectName;
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
}

//专项库的导入导出控件
angular.module('app.routes').controller('song_waste_controller', ['$scope','$uibModal','$stateParams','$timeout','$rootScope','display',function($scope,$uibModal,$stateParams,$timeout,$rootScope,display){
    $scope.animationsEnabled = true;
    //导入excel
    $scope.import = function(type){
        //if($stateParams.tagId == undefined){
        //    alertTipCommon($timeout,$rootScope,"没有选择标签,不能导入",display);
        //    return;
        //}
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'song_waste_import.html',
            controller: 'song_waste_import_ctrl',
            resolve: {
                type: function(){
                    return type
                }
            }
        });
    };

    //导出excel
    $scope.export = function(type, selectedDataIds){
        //if($stateParams.tagId == undefined){
        //    alertTipCommon($timeout,$rootScope,"没有选择标签,不能导入",display);
        //    return;
        //}
        console.log(selectedDataIds);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'song_waste_export.html',
            controller: 'song_waste_export_ctrl',
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
angular.module('app.routes').controller('song_waste_import_ctrl', ['$scope','$uibModalInstance','$http','$filter','type','$timeout','$rootScope','display','$stateParams',function($scope,$uibModalInstance,$http,$filter,type,$timeout,$rootScope,display,$stateParams) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.downloadTemplet = function(){
        window.open(waste_data + "getImportTemplate.json");
    };
    $scope.ok = function(){
        var filename = $('#file').val();
        if(filename == ''){
            $scope.error = '请选择上传的excel文件';
        }else{
            var url = waste_data + 'import/' + type + '.json';
            //var datas = {'tagId':$stateParams.tagId};
            ajaxFileUpload(url, $scope, {}, $uibModalInstance,$timeout,$rootScope,display, 'file');
        }
    }
}]);
//专项库导出框
angular.module('app.routes').controller('song_waste_export_ctrl', ['$scope', '$uibModalInstance', '$stateParams', '$http', '$stateParams', '$filter', 'type', 'ids',function($scope, $uibModalInstance, $stateParams, $http, $stateParams, $filter, type, ids){
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        var data = filterUndefinedPorperty($stateParams);
        data.copyrightIds = ids;
        //var propertyArr = ['copyrightId','copyrightStatus','copyrightTimeStart','copyrightTimeEnd','songName','artistName','cStartTime','cEndTime','tagId','copyrightIds'];
        //data = keepObjectProperty(propertyArr, data);
        //var export_data = formatExportCondition(cloneOneObject(data), $filter);
        console.log(data);
        ////console.log(export_data);
        //console.log($scope.export_type);
        if($scope.export_type == 1){
            //console.log("选择了按照选中导出");
            if(ids == undefined || ids == null || ids === '' || ids.length <= 0){
                $scope.error = '没有选中数据，无法导出';
                return;
            }
            if(type != 'song'){
                data[type + 'Ids'] = stringToArray(ids);
            } else if (type == 'song'){
                data['copyrightIds'] = stringToArray(ids);
            } else {
                return;
            }
        } else if($scope.export_type == 2){
            if($scope.numberStart == undefined || $scope.numberEnd == undefined || $scope.numberStart == '' || $scope.numberEnd == ''){
                $scope.error = '请输入序号起止';
                return;
            }
            data.startNo = $scope.numberStart - 1;
            data.endNo = $scope.numberEnd;
            //console.log($scope.numberStart + " +++++ " + $scope.numberEnd);
        } else if($scope.export_type == 3){
            if($scope.pageStart == undefined || $scope.pageEnd == undefined || $scope.pageStart == '' || $scope.pageEnd == ''){
                $scope.error = '请输入页码起止';
                return;
            }
            data.startNo = ($scope.pageStart - 1) * 100;
            data.endNo = $scope.pageEnd * 100 - 1;
            //console.log($scope.pageStart + " +++++ " + $scope.pageEnd);
        } else {
            $scope.error = '请选择导出类型';
            return;
        }
        var url = waste_data + 'export/' + type + '.do?data=' + JSON.stringify(fillSearchParams(data, $stateParams));
        console.log(url);
        if(url == undefined){
            $scope.error = "搜索类型不对,无法导出,请重新选择类型";
        } else {
            window.open(url);
            $uibModalInstance.dismiss('cancel');
        }
    };
}]);

function wasteMaterialListFillUrl(url, $stateParams, tags){
    var data = new Object();
    data = fillSearchParams(data, $stateParams, tags);
    //如果没有参数（只有pageNo和pageSize那么不请求网络）
    //var dataPropertyCount = 0;
    //for(var elem in data){
    //    dataPropertyCount++;
    //}
    //if(dataPropertyCount <= 2){
    //    return undefined;
    //}
    //data.isolated = 0;
    if(data == undefined){
        return undefined;
    }
    url += '&data=' + JSON.stringify(data);
    return url;

}

function fillSearchParams(data, $stateParams, tags){
    var pageNo = ($stateParams.pageNo == undefined ? 1 : $stateParams.pageNo);
    var pageSize = ($stateParams.pageSize == undefined ? 50 : $stateParams.pageSize);
    data.pageNo = pageNo;
    data.pageSize =pageSize;
    if(!isPropertyEmpty($stateParams.copyrightId)){
        data.copyrightId = $stateParams.copyrightId;
    }
    if(!isPropertyEmpty($stateParams.copyrightStatus)){
        data.copyrightStatus = $stateParams.copyrightStatus;
    }
    if(!isPropertyEmpty($stateParams.copyrightTimeStart)){
        data.termStartTime = $stateParams.copyrightTimeStart;
    }
    if(!isPropertyEmpty($stateParams.copyrightTimeEnd)){
        data.termEndTime = $stateParams.copyrightTimeEnd;
    }
    if(!isPropertyEmpty($stateParams.songName)){
        data.songName = $stateParams.songName;
    }
    if(!isPropertyEmpty($stateParams.artistName)){
        data.artistName = $stateParams.artistName;
    }
    if(!isPropertyEmpty($stateParams.cStartTime)){
        data.cstartTime = $stateParams.cStartTime;
    }
    if(!isPropertyEmpty($stateParams.cEndTime)){
        data.cendTime = $stateParams.cEndTime;
    }
    if(!isPropertyEmpty($stateParams.tagId)){
        var tag = getTagIdByName($stateParams.tagId, tags);
        if(tag == undefined){
            return undefined;
        }
        data.tagId = tag;
    }
    if(!isPropertyEmpty($stateParams.startNo)){
        data.startNo = $stateParams.startNo;
    }
    if(!isPropertyEmpty($stateParams.endNo)){
        data.endNo = $stateParams.endNo;
    }
    return data;
}

function deleteWasteData(ids, type, $http, SweetAlert){
    if(ids.length == 0){
        sweetAlertCommon(SweetAlert,'没有勾选数据，无法删除','warning');
        return;
    }
    if(type == 'song'){
        type = "copyright";
    }
    var url = waste_data + "delSongByCopyrights.json?" + CALLBACK + "&" + type + "Ids=" + ids;
    $http.jsonp(url).success(function(res){
        if(res.status == 1){
            sweetAlertCommon(SweetAlert,res.msg,'success');
            location.reload();
        } else {
            sweetAlertCommon(SweetAlert,res.msg,'error');
        }
    }).error(function(res){
        sweetAlertCommon(SweetAlert,'网络异常,删除失败','warning');
    });
}

function wasteFillSearchCondition($scope, $stateParams){
    //if(!isPropertyEmpty($stateParams.songName)){
    //    $scope.form.songName = $stateParams.songName;
    //}
    for(var property in $stateParams){
        $scope.form[property] = $stateParams[property];
    }
    if(!isPropertyEmpty($stateParams.pageSize)) $scope.pageSize = $stateParams.pageSize;
    if(!isPropertyEmpty($stateParams.pageNo)) $scope.pageNo = $stateParams.pageNo;
}

function getTagIdByName(tagName, tags){
    for(var i = 0; i < tags.length; i++){
        if(tags[i].tagName === tagName){
            return tags[i].tagId;
        }
    }
    return undefined;
}