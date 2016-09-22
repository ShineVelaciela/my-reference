/**
 * Created by YuChunzhuo on 2015/11/22.
 */

//url获取的结果有的信息放入songMaps里面
//ID放入songIds里面以供后面查询
function getDataMap(res, songMaps, songIds, $stateParams){
    for (var i = 0; i < res.data.resultlist.length; i++) {
        var songId = res.data.resultlist[i].songId;
        var song = new Object();
        song.id = res.data.resultlist[i].id;
        song.songId = songId;
        song.tagId = $stateParams.tagId;
        song.tagName = $stateParams.tagName;
        song.num = res.data.resultlist[i].num;
        song.userName = res.data.resultlist[i].email;
        if (song.userName != null && song.userName != "" && song.userName.indexOf("@") != -1){
            song.userName = song.userName.substr(0, song.userName.length-15);
        }
        //获取歌曲时间
        song.utime = res.data.resultlist[i].utime;
        //获取歌曲置顶状态
        song.topStatus = res.data.resultlist[i].spstat;
        //获取歌曲的状态
        song.status = res.data.resultlist[i].stat;
        if (song.status != "undefined" && song.status != null) {
            if (song.status == 1) {
                song.status = "通过";
                //                                                        console.log(song.songName + "通过");
            } else if (song.status == 0) {
                song.status = "默认";
//                                                            console.log(song.songName + "默认");
            } else if (song.status == -1) {
                song.status = "禁用";
                //                                                        console.log(song.songName + "禁用");
            }
        } else {
            song.status = "";
            console.log(song.songName + "没有状态");
        }
        songMaps.put(songId, song);
        songIds.push(songId);
    }
}

//把所有ID一起查询把获得的数据塞入songMaps里面
function getSongByIds($http, songMaps, songIds, $stateParams,$scope){
    $http.jsonp(list_url + "song.json?callback=JSON_CALLBACK&ids=" + songIds.join(',') + "&sp=01").success(function (res) {
        for (var i = 0; i < res.data.length; i++) {
            var tempId = res.data[i].songId;
            var song = songMaps.get(tempId);
            if (song != null) {
                //                                                console.log(tempId + "获得了歌曲");
                //获取歌曲名字
                song.songName = res.data[i].songName;
                //获取歌手名字
                //song.artists = "";
                if(res.data[i].artists != undefined && res.data[i].artists != null && res.data[i].artists != ''){
                    song.artists = res.data[i].artists;
                    //for (var j = 0; j < res.data[i].artists.length; j++) {
                        //song.artistName = song.artistName + res.data[i].artists[j].artistName + ",";
                        //song.artists.push(res.data[i].artists[j]);
                        //                                                    console.log(song.artistName);
                    //}
                }
                //if (song.artistName.length > 1) {
                //    song.artistName = song.artistName.substr(0, song.artistName.length - 1);
                //}
                //获取版权，可能没有
                if (res.data[i].cids != undefined && res.data[i].cids != null && res.data[i].cids != "") {
                    song.cid = res.data[i].cids.copyrightId;
                    song.cidDate = res.data[i].cids.expirationDate;
                    //                                                    console.log(tempId + "的歌曲有版权")
                }
                //数据获取完毕，去掉原来这个ID的歌曲，放入后来的歌曲
                songMaps.remove(tempId);
                songMaps.put(tempId, song);
                //                                                console.log(song);
            }
        }
    });
    //
    if($stateParams.id == '1002599047'){
        $scope.sahala = true;
        $http.jsonp(http_tag_url + 'songbpm.json?songIds=' + songIds.join(',') + '&' + CALLBACK).success(function(res){
            console.log(res);
            for (var i = 0; i < res.data.length; i++){
                var tempId = res.data[i].songId;
                var song = songMaps.get(tempId);
                if (song != null){
                    song.bpmVal = res.data[i].bpmVal;
                    song.paceVal = res.data[i].paceVal;
                    song.weightVal = res.data[i].weightVal;
                }
                songMaps.remove(tempId);
                songMaps.put(tempId, song);
            }
        });
    }
    //查询歌曲的曲库ID跳转到咪咕音乐用
    //$http.jsonp(http_url + "/mbs/karakal/song.json?callback=JSON_CALLBACK&mids=" + songIds.join(',')).success(function(res){
    //    for (var i = 0; i < res.data.list.length; i++){
    //        var tempId = res.data.list[i][0];
    //        var song = songMaps.get(tempId);
    //        if (song != null){
    //            song.qid = res.data.list[i][1].split(',')[0];
    //        }
    //        songMaps.remove(tempId);
    //        songMaps.put(tempId, song);
    //    }
    //});
}

//补全url
function completeUrl($stateParams, $scope, url, $filter){
    if ($stateParams.searchSongName != undefined && $stateParams.searchSongName != null && $stateParams.searchSongName != '') {
        url += '&songname=' + $stateParams.searchSongName;
    }
    if($stateParams.searchArtistName != undefined && $stateParams.searchArtistName != null && $stateParams.searchArtistName != ''){
        url += '&artistname=' + $stateParams.searchArtistName;
    }
    if($stateParams.searchCpId != undefined && $stateParams.searchCpId != null && $stateParams.searchCpId != ''){
        url += '&cid=' + $stateParams.searchCpId;
    }
    if($stateParams.searchUser != undefined && $stateParams.searchUser != null && $stateParams.searchUser != ''){
        url += '&uid=' + $stateParams.searchUser;
    }
    if($scope.params.dt1 != undefined && $scope.params.dt1 != null && $scope.params.dt1 != ''){
        console.log($scope.params.dt1);
        url += '&stime=' + formatDate($scope.params.dt1,$filter);
    }
    if($scope.params.dt2 != undefined && $scope.params.dt2 != null && $scope.params.dt2 != ''){
        url += '&etime=' + formatDate($scope.params.dt2,$filter);
    }
    if($stateParams.searchOrder != undefined && $stateParams.searchOrder != null && $stateParams.searchOrder != ''){
        console.log($stateParams.searchOrder);
        if($stateParams.searchOrder == 'ranked'){
            url += '&rank=ranked';
        } else {
            url += '&order=' + $stateParams.searchOrder;
        }
    }
    //console.log(url);
    return url;
}

//让搜索之后页面显示以前的搜索条件,给所有搜索条件绑定值
function bindSearch($scope, $stateParams,$filter){
    $scope.params.searchSongName = $stateParams.searchSongName;
    $scope.params.searchArtistName = $stateParams.searchArtistName;
    $scope.params.searchCpId = $stateParams.searchCpId;
    $scope.params.searchUser = $stateParams.searchUser;
    //$scope.params.dt1 = formatDate($scope.params.dt1,$filter);
    if($stateParams.dt1 != undefined){
        $scope.params.dt1 = formatDate(Date.parse($stateParams.dt1),$filter);
    }
    //$scope.params.dt2 = formatDate($scope.params.dt2,$filter);
    if($stateParams.dt2 != undefined){
        $scope.params.dt2 = formatDate(Date.parse($stateParams.dt2),$filter);
    }
    $scope.params.searchOrder = $stateParams.searchOrder;
    //console.log($scope.params);
}
//审核通过单条数据
function checkOneData(data, $scope, $http, $timeout, $rootScope, display){
    selectOne($scope, data.data, data.data.isCheck);
    console.log(data);
    var url = http_tag_url + "check.json?callback=JSON_CALLBACK&ids=" + data.data.id + "&stat=" + data.stat +'&tagId=' +data.data.tagId;
    console.log(url);
    $http.jsonp(url).success(function (res) {
        if (res.status == 1) {
            //alert("操作成功");
            alertTipCommon($timeout,$rootScope,'操作成功',display);
            if (data.stat == '1') {
                data.data.status = "通过";
            } else if (data.stat == '0') {
                data.data.status = "默认";
            } else if (data.stat == '-1') {
                data.data.status = "禁用";
            }
        }
        else {
            //alert("res:" + res.msg);
            alertTipCommon($timeout,$rootScope,"res:" + JSON.stringify(res.msg), display);
            console.log($scope.data);
        }
    }).error(function (err) {
        //alert("error:" + err);
        alertTipCommon($timeout,$rootScope,"error:" + JSON.stringify(err), display);
    });
}
//批量提交审核数据
function batchCheckData(flag, $http, chooseArray, unChooseArray,tagId,$timeout,$rootScope,display){
    var url = http_tag_url + "opscheck.json?callback=JSON_CALLBACK&pids=" + chooseArray.join(',') + "&upids=" + unChooseArray.join(',') +'&tagId=' +tagId;
    if(flag == -1){
        url = http_tag_url + "opscheck.json?callback=JSON_CALLBACK&pids=" + unChooseArray.join(',') + "&upids=" + chooseArray.join(',') +'&tagId=' +tagId;
    }
    console.log(url);
    //$http.jsonp(url).success(function (res) {
    //    if (res.status == 1){
    //        //alert("操作成功");
    //        alertTipCommon($timeout,$rootScope,'操作成功',display);
    //        location.reload(true);
    //    } else {
    //        //alert("res:" + res.msg);
    //        alertTipCommon($timeout,$rootScope,"res:" + JSON.stringify(res.msg),display);
    //    }
    //}).error(function (err) {
    //    //alert("error:" + err);
    //    alertTipCommon($timeout,$rootScope,"error:" + JSON.stringify(err),display);
    //});
}

//人工排序数据
function setDataPosition(song, $http, $scope, $uibModal){
    selectOne($scope, song.song, song.song.isCheck);
    //弹出一个层来输入插入到多少位置
    var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'myModalContent.html',
        controller: 'tagSetPositionCtrl',
        resolve: {
            song: function () {
                return song.song;
            },
            tagId: function(){
                return song.song.tagId;
            }
        }
    });
}

//取消置顶数据
function resetDataPosition(song, $http, $scope,$timeout,$rootScope,display){
    selectOne($scope, song.song, song.song.isCheck);
    //selectOne($scope, $scope.song, $scope.song.isCheck);
    console.log(song.song);
    var url = http_tag_url + 'rank/del.json?callback=JSON_CALLBACK&songId=' + song.song.songId + '&tagId=' + song.song.tagId;
    console.log(url);
    $http.jsonp(url).success(function(res){
        console.log(res);
        if(res.status == 1){
            //把这首歌排到最后一位
            //var temp = 0;
            //for(var i = 0; i < $scope.datas.length; i++){
            //    if($scope.datas[i].songId == song.song.songId){
            //        temp = i;
            //    }
            //}
            //$scope.datas.splice(temp, 1);
            //song.song.topStatus = 0;
            //$scope.datas.push(song.song);
            //alert('取消置顶成功');
            alertTipCommon($timeout,$rootScope,"取消排序成功",display);
            location.reload(true);
        } else {
            //alert('取消置顶失败');
            alertTipCommon($timeout,$rootScope,"取消排序失败",display);
        }
    }).error(function(res){
        //alert('发生异常');
        alertTipCommon($timeout,$rootScope,"发生异常",display);
    });
}


//分页显示
function tagSeparatePage($scope, res, $stateParams){
    $scope.maxSize = 5;
    $scope.maxResult = res.data.maxResult;
    //$scope.itemsPerPage = res.data.maxResult;
    $scope.itemsPerPage = 20;
    //$scope.currentPage = res.data.firstIndex / res.data.maxResult + 1;
    $scope.currentPage = $stateParams.firstIndex / 20 + 1;
    $scope.totalItems = res.data.totalrecord;
    $scope.totalrecord = res.data.totalrecord;
    $scope.totalPage = ($scope.totalrecord - ($scope.totalrecord%$scope.maxResult != 0 ? $scope.totalrecord%$scope.maxResult : $scope.maxResult)) / $scope.maxResult + 1;
}
//通用渲染页面数据
function getPageData(maxResult, firstIndex, tagId, tagName, status, ctp){
    _maxResult = maxResult;
    _firstIndex = firstIndex;
    _tagId = tagId;
    _tagName = tagName;
    _status = status;
    _ctp = ctp;
}

//当前播放歌曲出现边框效果
function playSelectOne(datas, data){
    for(var i = 0; i < datas.length; i++){
        datas[i].playCheck = false;
    }
    data.playCheck = true;
}

//指定去多少页码
function jump2PageNum(pageType, num, $state,$timeout,$rootScope,display){
    if(num == undefined || num == null || num === ''){
        console.log(num);
        return;
    }
    if(num < 1){
        //alert("请输入正确的页码，不要乱玩好吗");
        alertTipCommon($timeout,$rootScope,"请输入正确的页码不要乱玩好吗",display);
        return;
    }
    $state.go("app." + pageType,{firstIndex:((num - 1) * 20)});
}


//通用渲染便签数据列表
function getTagDatas(resultlist, totalrecord, maxResult, firstIndex, tagId, $scope) {
    $scope.datas = resultlist;
//        $scope.totalrecord = totalrecord;
    $scope.maxResult = maxResult;
    $scope.firstIndex = firstIndex;
    $scope.tagId = tagId;
}
