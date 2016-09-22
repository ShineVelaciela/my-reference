/**qualityContent.data
 * Created by hao.cheng on 2016/3/3.
 * quality_content_controller
 */
angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.qualityContent',{
            url: '/qualityContent?:type',
            views:{
                '':{
                    templateUrl: 'app/views/quality_content/quality_content.html',
                    controller: 'QualityContentController'
                }
            }
        })
        .state('app.qualityContent.data',{
            //url: '/data?:status&:artistName&:artistId&:tagIds&:albumId&:albumName&:albumArtist&:copyrightId&:songName' +
            //'&:hidden&:songArtist&:arOriginScore&:arOriginMigu&:alOriginArtist&:alOriginMigu&:alOriginContent' +
            //'&:alOriginUrgent&:sOriginArtist&:sOriginMigu&:sOriginContent&:sOriginUrgent&:pageNo&:overdue',     //type=1,2,3分别表示艺人,专辑,歌曲
            url: '/data?:status&:pageNo&:pageSize&:cstartTime&:cendTime&:ustartTime&:uendTime&:artistId&:artistName&:tagIds&:originScore&:originMigu' +
            '&:albumId&:albumName&:originArtist&:originContent&:originUrgent' +
            '&:copyrightId&:overdue&:hidden&:songName&:language',
            views: {
                'data-list':{
                    templateUrl: 'app/views/quality_content/data_list.html',
                    controller: 'QualityContentDataController'
                }
            }
        })
        .state('app.qualityContent.staistics',{
            url:'/staistics',
            views:{
                'quality_statistics':{
                    templateUrl: 'app/views/quality_content/quality_statistics.html',
                    controller: 'QualityContentStaisticsController'
                }
            }
        });
}]);
angular.module('app.routes').controller('QualityContentController', ['$scope','$sce','$http','$stateParams','$filter','$state','$rootScope',function ($scope,$sce,$http,$stateParams,$filter,$state,$rootScope) {
    $rootScope.pageTitle = ($stateParams.type == 1 && '优质艺人') || ($stateParams.type == 2 && '优质专辑') || ($stateParams.type == 3 && '优质歌曲');
    //console.log('进入了顶层');
    $scope.type = $stateParams.type;
    $scope.data = {};
    //$scope.artist = {};
    //$scope.album = {};
    //$scope.song = {};
    if($scope.locations == undefined){      //获取地域标签
        $http.get(quality_location).success(function(res){
            $scope.locations = res.tagsList;
        });
    }
    $scope.clearInput = function(){   //清空查询条件
        $scope.data = {};
        //$scope.artist = {};
        //$scope.song = {};
        //$scope.album = {};
    };
    $scope.export = function(type){     //导出表格
        var url = '';
        if(type == 1)
            url = quality_artist_export + JSON.stringify(returnObj($scope.data,$stateParams));
        if(type == 2)
            url = quality_album_export + JSON.stringify(returnObj($scope.data,$stateParams));
        if(type == 3)
            url = quality_song_export + JSON.stringify(returnObj($scope.data,$stateParams));
        window.open(url);
    };
    $scope.searchBtn = function(type){
        //console.log($scope.data);
        //console.log(formatDate(Date.parse($scope.data.cendTime), $filter));
        //console.log(formatDate(Date.parse($scope.data.cstartTime), $filter));
        //console.log(formatDate(Date.parse($scope.data.uendTime), $filter));
        //console.log(formatDate(Date.parse($scope.data.ustartTime), $filter));

        if(type == 1){
            //console.log($scope.data);
            $state.go('app.qualityContent.data',{type: type, status: $scope.data.status, cstartTime: ($scope.data.cstartTime != undefined ? formatDate(Date.parse($scope.data.cstartTime), $filter) : ''), cendTime: ($scope.data.cendTime != undefined ? formatDate(Date.parse($scope.data.cendTime), $filter) : ''), ustartTime: ($scope.data.ustartTime != undefined ? formatDate(Date.parse($scope.data.ustartTime), $filter) : ''), uendTime: ($scope.data.uendTime != undefined ? formatDate(Date.parse($scope.data.uendTime), $filter) : ''), artistId: $scope.data.artistId, artistName: $scope.data.artistName, tagIds: $scope.data.tagIds, originScore: $scope.data.originScore, originMigu: $scope.data.originMigu});
            //console.log('artist');
        } else if(type == 2){
            //console.log($scope.data);
            $state.go('app.qualityContent.data',{type: type, status: $scope.data.status, cstartTime: ($scope.data.cstartTime != undefined ? formatDate(Date.parse($scope.data.cstartTime), $filter) : ''), cendTime: ($scope.data.cendTime != undefined ? formatDate(Date.parse($scope.data.cendTime), $filter) : ''), ustartTime: ($scope.data.ustartTime != undefined ? formatDate(Date.parse($scope.data.ustartTime), $filter) : ''), uendTime: ($scope.data.uendTime != undefined ? formatDate(Date.parse($scope.data.uendTime), $filter) : ''), albumId: $scope.data.albumId, albumName: $scope.data.albumName, artistName: $scope.data.artistName, originArtist: $scope.data.originArtist, originMigu: $scope.data.originMigu, originContent: $scope.data.originContent, originUrgent: $scope.data.originUrgent});
            //console.log('album');
        } else if(type == 3){
            //console.log($scope.data);
            $state.go('app.qualityContent.data',{type: type, status: $scope.data.status, cstartTime: ($scope.data.cstartTime != undefined ? formatDate(Date.parse($scope.data.cstartTime), $filter) : ''), cendTime: ($scope.data.cendTime != undefined ? formatDate(Date.parse($scope.data.cendTime), $filter) : ''), ustartTime: ($scope.data.ustartTime != undefined ? formatDate(Date.parse($scope.data.ustartTime), $filter) : ''), uendTime: ($scope.data.uendTime != undefined ? formatDate(Date.parse($scope.data.uendTime), $filter) : ''), copyrightId: $scope.data.copyrightId, overdue: $scope.data.overdue, hidden: $scope.data.hidden, songName: $scope.data.songName, artistName: $scope.data.artistName, language: $scope.data.language, originArtist: $scope.data.originArtist, originMigu: $scope.data.originMigu, originContent: $scope.data.originContent, originUrgent: $scope.data.originUrgent});
            //console.log('song');
        }
    };

    //打开日期框
    $scope.open = function(flag) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        } else if (flag == 2){
            $scope.dateStatus.opened2 = true;
        } else if(flag == 3){
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
}]);
angular.module('app.routes').controller('QualityContentDataController', ['$scope','$stateParams','$http','$state','$timeout','$rootScope','display','$window',function($scope,$stateParams,$http,$state,$timeout,$rootScope,display,$window){
    if(checkEmpty($stateParams.pageSize)) $stateParams.pageSize = 50;
    var data = {};
    data = compeleteUrl($stateParams, data);
    var url = '';
    if($stateParams.type == 1){     //优质艺人处理逻辑
        url = quality_artist + JSON.stringify(data);
    }else if($stateParams.type == 2){   //优质专辑处理逻辑
        url = quality_album + JSON.stringify(data);
    }else if($stateParams.type == 3){      //优质歌曲处理逻辑
        url = quality_song + JSON.stringify(data);
    }
    if(url != ''){
        $http.get(url).success(function(res){
            $scope.datas = res.data.list;
        });
    }
    //上面填充数据，下面进行分页
    data.isQueryCount = 1;
    var url2 = '';
    if($stateParams.type == 1){     //优质艺人处理逻辑
        url2 = quality_artist + JSON.stringify(data);
    }else if($stateParams.type == 2){   //优质专辑处理逻辑
        url2 = quality_album + JSON.stringify(data);
    }else if($stateParams.type == 3){      //优质歌曲处理逻辑
        url2 = quality_song + JSON.stringify(data);
    }
    if(url2 != ''){
        $http.get(url2).success(function(res){
            paginationDiscreteness($scope,5,res.data.pageSize,res.data.totalCount,res.data.pageTotal,res.data.pageNo);
            paginationCommon($scope,5,res.data.pageSize,res.data.totalCount,res.data.pageTotal,res.data.pageNo);
        });
    }

    $scope.deleteMaterial = function(data, type){
        console.log(data);
        console.log(type);
        var con = confirm('确认删除该条数据吗？');
        if(con){
            var url = '';
            if(type != 'song'){
                url = quality_delete + type + '/' + data[type + 'Id'] + '.json?' + CALLBACK;
            } else if (type == 'song'){
                url = quality_delete + type + '/' + data['copyrightId'] + '.json?' + CALLBACK;
            }
            if(url != ''){
                $http.jsonp(url).success(function(res){
                    if(res.status == 1){
                        alertTipCommon($timeout,$rootScope,res.msg,display);
                        location.reload(true);
                    }
                });
            }
        }
    };

    $scope.showDataInfo = function(data, type){
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
                        $window.open(tyqkUrl);
                    }
                } else {
                    alertTipCommon($timeout,$rootScope,'反向接口返回异常',display);
                }
            },
            error: function (res) {
                alertTipCommon($timeout,$rootScope,'获取反向接口网络异常',display);
            }
        });
    };

    $scope.editData = function(data, type){
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
                        tyqkUrl = 'http://218.200.230.40:18089/material/artist!showUpdateArtistPage.action?artistFormBean.artistId=' + uuid;
                    } else if(type == 'album'){
                        uuid = res.albumList[0].uuid;
                        tyqkUrl = 'http://218.200.230.40:18089/material/album!showUpdateAlbumPage.action?albumFormBean.albumId=' + uuid;
                    } else if(type == 'song'){
                        uuid = res.songList[0].uuid;
                        tyqkUrl = 'http://218.200.230.40:18089/musiclibrary/song!showUpdateSongPage.action?songFormBean.songId=' + uuid;
                    }
                    if(tyqkUrl != '' && uuid != undefined && uuid != ''){
                        $window.open(tyqkUrl);
                    }
                } else {
                    alertTipCommon($timeout,$rootScope,'反向接口返回异常',display);
                }
            },
            error: function (res) {
                alertTipCommon($timeout,$rootScope,'获取反向接口网络异常',display);
            }
        });
    };

    $scope.checkAll = function(datas){
        selectAll($scope, datas, 'checked', 'allIsCheck');
        var needProperty = '';
        if($scope.type == 1){
            needProperty = 'artistId';
        } else if($scope.type == 2){
            needProperty = 'albumId';
        } else if($scope.type == 3){
            needProperty = 'copyrightId';
        }
        $scope.$parent.selectedDataIds = getPropertyFromCheckBox(datas, 'checked', true, needProperty);
    };

    $scope.checkOne = function(data, datas){
        selectOne(data, !data.checked, 'checked');
        var needProperty = '';
        if($scope.type == 1){
            needProperty = 'artistId';
        } else if($scope.type == 2){
            needProperty = 'albumId';
        } else if($scope.type == 3){
            needProperty = 'copyrightId';
        }
        $scope.$parent.selectedDataIds = getPropertyFromCheckBox(datas, 'checked', true, needProperty);
    };

    $scope.choosePage = function(){//分页
        $state.go('app.qualityContent.data',{pageNo: $scope.bigCurrentPage});
    };
    //console.log($stateParams);
    //$scope.artist.artistName = $stateParams.artist.artistName;
}])
angular.module('app.routes').controller('QualityContentStaisticsController', ['$scope','$http','$stateParams',function($scope,$http,$stateParams){
    $http.jsonp(quality_url + 'countArtist.json?'+CALLBACK).success(function(res){      //获取优质艺人统计
        $scope.artist_staistics = res.data.list;
    });
    $http.jsonp(quality_url + 'countAlbum.json?'+CALLBACK).success(function(res){      //获取优质专辑统计
        $scope.album_staistics = res.data.list;
    });
    $http.jsonp(quality_url + 'countSong.json?'+CALLBACK).success(function(res){      //获取歌曲无损音源统计
        $scope.song_staistics = res.data.list;
    });
    //$http.jsonp(quality_url + 'countSongGq.json?'+CALLBACK).success(function(res){      //获取歌曲高清音源统计
    //    $scope.song_gq = res.data;
    //})
    //$http.jsonp(quality_url + 'countSongBq.json?'+CALLBACK).success(function(res){      //获取歌曲标签统计
    //    $scope.song_bq = res.data;
    //})
    //$http.jsonp(quality_url + 'countSongGc.json?'+CALLBACK).success(function(res){      //获取歌曲歌词统计
    //    $scope.song_gc = res.data;
    //})
    //$http.jsonp(quality_url + 'countSongSc.json?'+CALLBACK).success(function(res){      //获取歌曲素材统计
    //    $scope.song_sc = res.data;
    //})
}]);
function returnObj(o,$stateParams){//转换对象返回
        var obj = o;
        for(var p in obj){
            if(obj[p] == true)
                obj[p] = 1;
            else if(obj[p] == false)
                delete obj[p];
            else if(p == 'tagIds' && !(obj[p] instanceof Array)){
                var tagIds = obj[p];
                obj.tagIds = [];
                obj.tagIds.push(tagIds);       //将字符串转成数组
            }
        }
        //if($stateParams.pageNo == undefined){
        //    obj.pageNo = 1;
        //} else {
        //    obj.pageNo = $stateParams.pageNo;
        //}
    return obj;
}

function compeleteUrl($stateParams, data){
    if($stateParams.status != undefined && $stateParams.status != ''){
        data.status = $stateParams.status;
    }
    if($stateParams.cstartTime != undefined && $stateParams.cstartTime != ''){
        data.cstartTime = $stateParams.cstartTime;
    }
    if($stateParams.cendTime != undefined && $stateParams.cendTime != ''){
        data.cendTime = $stateParams.cendTime;
    }
    if($stateParams.ustartTime != undefined && $stateParams.ustartTime != ''){
        data.ustartTime = $stateParams.ustartTime;
    }
    if($stateParams.uendTime != undefined && $stateParams.uendTime != ''){
        data.uendTime = $stateParams.uendTime;
    }
    if($stateParams.pageNo != undefined && $stateParams.pageNo != ''){
        data.pageNo = $stateParams.pageNo;
    }
    if($stateParams.pageSize != undefined && $stateParams.pageSize != ''){
        data.pageSize = $stateParams.pageSize;
    }
    //上面是通用的属性
    //下面是艺人属性
    if($stateParams.artistId != undefined && $stateParams.artistId != ''){
        data.artistId = $stateParams.artistId;
    }
    if($stateParams.artistName != undefined && $stateParams.artistName != ''){
        data.artistName = $stateParams.artistName;
    }
    if($stateParams.tagIds != undefined && $stateParams.tagIds != ''){
        data.tagIds = stringToArray($stateParams.tagIds);
    }
    if($stateParams.status != undefined && $stateParams.status != ''){
        data.status = $stateParams.status;
    }
    if($stateParams.originScore != undefined && $stateParams.originScore != ''){
        data.originScore = $stateParams.originScore;
    }
    if($stateParams.originMigu != undefined && $stateParams.originMigu != ''){
        data.originMigu = $stateParams.originMigu;
    }
    //下面是专辑的属性
    if($stateParams.albumId != undefined && $stateParams.albumId != ''){
        data.albumId = $stateParams.albumId;
    }
    if($stateParams.albumName != undefined && $stateParams.albumName != ''){
        data.albumName = $stateParams.albumName;
    }
    if($stateParams.originArtist != undefined && $stateParams.originArtist != ''){
        data.originArtist = $stateParams.originArtist;
    }
    if($stateParams.originContent != undefined && $stateParams.originContent != ''){
        data.originContent = $stateParams.originContent;
    }
    if($stateParams.originUrgent != undefined && $stateParams.originUrgent != ''){
        data.originUrgent = $stateParams.originUrgent;
    }
    //下面是歌曲的属性
    if($stateParams.copyrightId != undefined && $stateParams.copyrightId != ''){
        data.copyrightId = $stateParams.copyrightId;
    }
    if($stateParams.overdue != undefined && $stateParams.overdue != ''){
        data.overdue = $stateParams.overdue;
    }
    if($stateParams.hidden != undefined && $stateParams.hidden != ''){
        data.hidden = $stateParams.hidden;
    }
    if($stateParams.songName != undefined && $stateParams.songName != ''){
        data.songName = $stateParams.songName;
    }
    if($stateParams.language != undefined && $stateParams.language != ''){
        data.language = $stateParams.language;
    }
    return data;
}

//优质库的导入导出控件
angular.module('app.routes').controller('quality_controller', function($scope,$uibModal){
    $scope.animationsEnabled = true;
    //导入excel
    $scope.import = function(type){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'quality_import.html',
            controller: 'quality_import_ctrl',
            resolve: {
                type: function(){
                    if(type == 1){
                        return 'artist';
                    } else if(type == 2){
                        return 'album';
                    } else if(type == 3){
                        return 'song';
                    }
                }
            }
        });
    };
    //导出excel
    $scope.export = function(type, selectedDataIds){
        //console.log(selectedDataIds);
        //console.log($scope.data);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'quality_export.html',
            controller: 'quality_export_ctrl',
            resolve: {
                type: function(){
                    if(type == 1){
                        return 'artist';
                    } else if(type == 2){
                        return 'album';
                    } else if(type == 3){
                        return 'song';
                    }
                },
                data: function(){return $scope.data;},
                ids: function(){return selectedDataIds;}
            }
        });
    };
});

angular.module('app.routes').controller('quality_import_ctrl', function($scope,$uibModalInstance,$http,$filter,type,$stateParams,SweetAlert){
    //console.log(_session.id);
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        if($scope.import_status == undefined){
            $scope.error = '未选择导入状态';
            return;
        }
        if($scope.import_ctime == undefined){
            $scope.error = '未选择入库时间';
            return;
        }
        //console.log($scope.import_status);
        //console.log($scope.import_ctime != undefined ? formatDate(Date.parse($scope.import_ctime), $filter) : '');
        //return;
        var ctime = $scope.import_ctime != undefined ? formatDate(Date.parse($scope.import_ctime), $filter) : '';
        console.log(ctime);
        var filename = $('#file').val();
        if(filename == ''){
            $scope.error = '请选择上传的excel文件';
        }else{
            $scope.error= '';
            //$.ajaxFileUpload({
            //    url: quality_import_excel + type + '.json',
            //    type: 'post',
            //    secureuri: false, //一般设置为false
            //    fileElementId: 'file', // 上传文件的id、name属性名
            //    dataType: 'json', //返回值类型，一般设置为json、application/json
            //    data: {'status':$scope.import_status,'ctime': ctime, 'kuid': _session.id},
            //    success: function(res){
            //        console.log(res);
            //        if(res.status == 1){
            //            alert(res.msg);
            //            $uibModalInstance.dismiss('cancel');
            //            location.reload();
            //            //alert(res.msg,function(){
            //            //    location.reload();
            //            //})
            //        }else{
            //            $scope.error = res.msg;
            //            //$scope.error = '上传失败';
            //        }
            //    },
            //    error: function(res){
            //        console.log(res);
            //        $scope.error = '访问接口发生异常';
            //    }
            //});
            var url = quality_import_excel + type + '.json';
            var datas = {'status':$scope.import_status,'ctime': ctime, 'kuid': JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid};
            ajaxFileUpload(url, $scope, datas, $uibModalInstance,SweetAlert, 'file', $stateParams,undefined);
        }
    };

    //打开日期框
    $scope.open = function(flag) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        }
    };
    $scope.dateStatus = {
        opened1: false
    };
});

//通用方法
angular.module('app.routes').factory('display',function($rootScope){
    $rootScope.display = false;
    $rootScope.msg = '';
    $rootScope.date = new Date();
    return {
        setShow: function(){
            return true;
        },
        setHide: function(){
            return false;
        }
    }
});


angular.module('app.routes').controller('quality_export_ctrl', function($scope, $uibModalInstance, $http, $filter, $filter, type, data, ids){
    //console.log(type);
    //console.log(data);
    //console.log(ids);
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        //console.log(data);
        var export_data = formatExportCondition(cloneOneObject(data), $filter);
        //console.log(export_data);
        //console.log($scope.export_type);
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
            export_data.startNo = ($scope.pageStart - 1) * 50;
            export_data.endNo = $scope.pageEnd * 50 - 1;
            //console.log($scope.pageStart + " +++++ " + $scope.pageEnd);
        } else {
            $scope.error = '请选择导出类型';
            return;
        }
        var url = quality_url + 'export/' + type + '.do?data=' + JSON.stringify(export_data);
        window.open(url);
        $uibModalInstance.dismiss('cancel');
    };

});

function formatExportCondition(data, $filter){
    if(data.cstartTime != undefined){
        data.cstartTime = formatDate(Date.parse(data.cstartTime), $filter);
    }
    if(data.cendTime != undefined){
        data.cendTime = formatDate(Date.parse(data.cendTime), $filter);
    }
    if(data.ustartTime != undefined){
        data.ustartTime = formatDate(Date.parse(data.ustartTime), $filter);
    }
    if(data.uendTime != undefined){
        data.uendTime = formatDate(Date.parse(data.uendTime), $filter);
    }
    return data;
}

//上传文件函数
function ajaxFileUpload(url, $scope, datas, $uibModalInstance,SweetAlert, fileName,$stateParams, method, $timeout){
    $.ajaxFileUpload({
        url: url,
        beforeSend: function(request) {
            request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
        },
        type: 'post',
        secureuri: false, //一般设置为false
        fileElementId: fileName, // 上传文件的id、name属性名
        dataType: 'json', //返回值类型，一般设置为json、application/json
        data: datas,
        success: function(res){
            console.log(res);
            if(res.returnCode != undefined){
                res.status = res.returnCode;
            }
            if(res.description != undefined){
                res.msg = res.description;
            }
            if(res.status === "1" || res.code === "000000" || res.status === '000000' || res.status === 1){
                sweetAlertCommon(SweetAlert,res.msg,'success');
                $uibModalInstance.dismiss('cancel');
                if(!checkEmpty(method)){
                    method($stateParams);
                    return;
                }
                setTimeout(function(){
                    location.reload();
                }, 1000);
            }else{
                $scope.error = res.msg;
                sweetAlertCommon(SweetAlert,res.msg,'error');
                $uibModalInstance.dismiss('cancel');
            }
        },
        error: function(res){
            console.log(res);
            // sweetAlertCommon(SweetAlert,'请求异常','error');
            $uibModalInstance.dismiss('cancel');
        }
    });
}
function editTyqk(data, type, $timeout,$rootScope, display, $window){
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
                    tyqkUrl = 'http://218.200.230.40:18089/material/artist!showUpdateArtistPage.action?artistFormBean.artistId=' + uuid;
                } else if(type == 'album'){
                    uuid = res.albumList[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/material/album!showUpdateAlbumPage.action?albumFormBean.albumId=' + uuid;
                } else if(type == 'song'){
                    uuid = res.songList[0].uuid;
                    tyqkUrl = 'http://218.200.230.40:18089/musiclibrary/song!showUpdateSongPage.action?songFormBean.songId=' + uuid;
                }
                if(tyqkUrl != '' && uuid != undefined && uuid != ''){
                    $window.open(tyqkUrl);
                }
            } else {
                alertTipCommon($timeout,$rootScope,'反向接口返回异常',display);
            }
        },
        error: function (res) {
            alertTipCommon($timeout,$rootScope,'获取反向接口网络异常',display);
        }
    });
}
function showTyqk(data, type, $timeout,$rootScope, display, $window){
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
                    $window.open(tyqkUrl);
                }
            } else {
                alertTipCommon($timeout,$rootScope,'反向接口返回异常',display);
            }
        },
        error: function (res) {
            alertTipCommon($timeout,$rootScope,'获取反向接口网络异常',display);
        }
    });
}