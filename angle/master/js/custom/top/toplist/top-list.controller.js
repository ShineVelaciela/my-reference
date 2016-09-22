/**
 * Created by kiraCheng on 2016/2/26.
 * top_list_controller
 */
angular
    .module('app.routes').config(function($stateProvider){
    $stateProvider
        .state('app.top-list',{
            url: '/top-list',
            templateUrl: 'app/views/top/toplist/top-list.html',
            controller: function($scope,$http,$timeout,$rootScope,display, $state, $stateParams,SweetAlert){
                $scope.topType = '';
                $scope.songs = '';
                $scope.tops = [];
                //$scope.tops = [{"name":"幽浮劲碟排行榜","id":12},{"name":"中国Top排行榜-内地","id":32},{"name":"UK排行榜周榜","id":55}];
                //$http.jsonp('http://media.karakal.com.cn:18089/toplist/app/tops?'+CALLBACK).success(function(res){
                //    console.log(res);
                //});
                $scope.download = function(top,num){//导出榜单表格
                    var toplistIds = [];
                    for(var i in top){
                        if(top[i].check){
                            toplistIds.push(top[i].id);
                        }
                    }
                    if(toplistIds.length < 1){
                        sweetAlertCommon(SweetAlert,'请选择需要导出的榜单','warning');
                        return;
                    }
                    var songCount = 12;
                    if(num != undefined && num != ''){
                        songCount = num;
                    }
                    console.log(toplistIds + '--'  + songCount);
                    var url = top_list_download + "?" + CALLBACK + "&toplistIds=" + toplistIds.join(',') + "&songCount=" + songCount;
                    if($scope.topListDate != undefined){
                        url += "&date=" + $scope.topListDate;
                    }
                    if($scope.compareDate != undefined){
                        url += "&compareDate=" + $scope.compareDate;
                    }
                    //else {
                    //    url += "&date=" + $scope.topListDate;
                    //}
                    //window.location.href = url;
                    window.open(url);
                };
                //$('#dateValue').datetimepicker(dateConfig);//日期选择
                $scope.addPlaySong = function(songId,copyId){//歌曲播放
                    addPlaySong(songId,copyId,SweetAlert);
                };
                $scope.searchTopByDate = function(date,compareDate, songCount){
                    searchTopByDate(date,compareDate,songCount,$state, $scope);
                };
                $scope.downloadCheckAll = function(tops){
                    $scope.allCheck = !$scope.allCheck;
                    for(var i in tops){
                        tops[i].check = $scope.allCheck;
                    }
                };
                $http.jsonp(top_list_tops + "?" + CALLBACK + "&formatTree=false&hidden=0").success(function(res){
                    $scope.tops = res.data;
                });
                //打开日期框
                $scope.open = function(flag) {
                    $scope.dateStatus["opened" + flag] = true;
                };
                $scope.dateStatus = {
                    opened1: false,
                    opened2: false
                };
            }
        })
        .state('app.top-list.day',{
            url: '/day',
            title: '榜单-日榜',
            views:{
                'menu-list':{
                    templateUrl: 'app/views/top/toplist/top-list-menu.html',
                    controller: function($scope,$http){
                        $scope.$parent.topListTpye = "app.top-list.day.list";
                        var url = top_list_tops + "?" + CALLBACK;
                        $http.jsonp(url).success(function(res){
                            //$scope.$parent.tops = [];
                            for(var i = 0; i < res.data.length; i++){
                                if(res.data[i].name == '日榜'){
                                    $scope.menus = res.data[i].data;
                                    //for(var j = 0; j < res.data[i].data.length; j++){
                                    //    $scope.$parent.tops = $scope.$parent.tops.concat(res.data[i].data[j].data);
                                    //}
                                    //$http.jsonp(top_list_tops + "?" + CALLBACK + "&formatTree=false&hidden=0").success(function(res1){
                                    //    $scope.$parent.tops = res1.data;
                                    //});
                                }
                            }
                        });
                        $scope.$parent.topType = '日榜';
                    }
                }
            }
        })
        .state('app.top-list.day.list',{
            url: '/:id?:date&:compareDate&:songCount',
            views: {
                'top-song-list':{
                    templateUrl: 'app/views/top/toplist/top-song-list.html',
                    controller: function($scope, $stateParams, $http, $filter,SweetAlert){
                        console.log($stateParams.date);
                        if(checkEmpty($stateParams.id)){
                            sweetAlertCommon(SweetAlert,'请选择具体榜单','warning');
                            return;
                        }
                        var url = top_list_info + $stateParams.id + ".json?" + CALLBACK;
                        if($stateParams.date != undefined){
                            url += "&date=" + $stateParams.date;
                        }
                        if($stateParams.compareDate != undefined){
                            url += "&compareDate=" + $stateParams.compareDate;
                        }
                        if($stateParams.songCount != undefined){
                            url += "&songCount=" + $stateParams.songCount;
                        }
                        $http.jsonp(url).success(function(res){
                            $scope.$parent.top_name = res.data.name;
                            //$scope.$parent.$parent.songs = res.data.songs;
                            $scope.$parent.$parent.name = res.data.name;
                            $scope.$parent.$parent.totalCount = res.data.totalCount;
                            $scope.$parent.$parent.topListDate = formatDate(res.data.captureDate, $filter);
                            //$scope.$parent.$parent.compareDate = formatDate(res.data.compareDate, $filter);
                            //$scope.$parent.$parent.songCount = res.data.totalCount;
                            if(res.data.songs != undefined && res.data.songs.length > 0){
                                pushData2TopList($scope, $http, res.data, $filter);
                            } else {
                                $scope.$parent.$parent.songs = [];
                            }
                            //console.log($scope.songs);
                        });
                    }
                }
            }
        })
        .state('app.top-list.week',{
            url: '/week',
            title: '榜单-周榜',
            views:{
                'menu-list':{
                    templateUrl: 'app/views/top/toplist/top-list-menu.html',
                    controller: function($scope, $http){
                        $scope.$parent.topListTpye = "app.top-list.week.list";
                        var url = top_list_tops + "?" + CALLBACK;
                        $http.jsonp(url).success(function(res){
                            for(var i in res.data){
                                //console.log(i);
                                //console.log(res.data[i]);
                                if(res.data[i].name == '周榜'){
                                    $scope.menus = res.data[i].data;
                                    //$scope.$parent.tops = [];
                                    //for(var j = 0; j < res.data[i].data.length; j++){
                                    //    $scope.$parent.tops = $scope.$parent.tops.concat(res.data[i].data[j].data);
                                    //}
                                    //$http.jsonp(top_list_tops + "?" + CALLBACK + "&formatTree=false&hidden=0").success(function(res1){
                                    //    $scope.$parent.tops = res1.data;
                                    //});
                                }
                            }
                        });
                        $scope.$parent.topType = '周榜';
                    }
                }
            }
        })
        .state('app.top-list.week.list',{
            url: '/:id?:date&:compareDate&:songCount',
            views: {
                'top-song-list':{
                    templateUrl: 'app/views/top/toplist/top-song-list.html',
                    controller: function($scope, $stateParams, $http, $filter,SweetAlert){
                        if(checkEmpty($stateParams.id)){
                            sweetAlertCommon(SweetAlert,'请选择具体榜单','warning');
                            return;
                        }
                        var url = top_list_info + $stateParams.id + ".json?" + CALLBACK;
                        if($stateParams.date != undefined){
                            url += "&date=" + $stateParams.date;
                        }
                        if($stateParams.compareDate != undefined){
                            url += "&compareDate=" + $stateParams.compareDate;
                        }
                        if($stateParams.songCount != undefined){
                            url += "&songCount=" + $stateParams.songCount;
                        }
                        $http.jsonp(url).success(function(res){
                            $scope.$parent.top_name = res.data.name;
                            //$scope.$parent.$parent.songs = res.data.songs;
                            $scope.$parent.$parent.name = res.data.name;
                            $scope.$parent.$parent.totalCount = res.data.totalCount;
                            $scope.$parent.$parent.topListDate = formatDate(res.data.captureDate, $filter);
                            //$scope.$parent.$parent.compareDate = formatDate(res.data.compareDate, $filter);
                            //$scope.$parent.$parent.songCount = res.data.totalCount;
                            if(res.data.songs != undefined && res.data.songs.length > 0){
                                pushData2TopList($scope, $http, res.data, $filter);
                            } else {
                                $scope.$parent.$parent.songs = [];
                            }
                            //console.log($scope.songs);
                        });
                    }
                }
            }
        })
});
var dateConfig = {//日期插件配置
    lang: 'ch',
    timepicker: false,
    format: 'Y-m-d',
    formatDate: 'Y-m-d'
};
function searchTopByDate(date,compareDate,songCount,$state, $scope){
    $state.go($scope.topListTpye, {date: date, compareDate: compareDate, songCount: songCount});
}
function pushData2TopList($scope, $http, data, $filter){
    //$scope.$parent.$parent.topListDate = formatDate(data.captureDate, $filter);
    //$scope.$parent.$parent.compareDate = formatDate(data.compareDate, $filter);
    if(data.songs.length <= 0){
        $scope.$parent.$parent.songs = [];
        return;
    }
    var songIds = new Array();
    for(var i = 0; i < data.songs.length; i++){
        songIds.push(data.songs[i].siteId);
    }
    var url = song_form_list_mls + '/' + data.site + '/song.json?' + CALLBACK + '&ids=' + songIds.join(',');
    $http.jsonp(url).success(function(res){
        for(var j in data.songs){
            var song = data.songs[j];
            for(var k in res.data){
                if(song.siteId == res.data[k].siteId){
                    if(res.data[k].cids != undefined){
                        song.cids = res.data[k].cids;
                    }
                    break;
                }
            }
        }
        $scope.$parent.$parent.songs = data.songs;
    });
}
//格式化日期类型
function formatDate(date, $filter) {    //ui.bootstrap.datepicker format日期类型
    if (date == undefined || date.toString() == 'NaN') {
        return "";
    }
    var datefilter = $filter('date'),
        formattedDate = datefilter(date, 'yyyy-MM-dd');
    return formattedDate;
}
