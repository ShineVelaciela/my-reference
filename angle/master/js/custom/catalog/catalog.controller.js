/**
 * Created by hao.cheng on 2015/12/31.
 * catalog-controller
 */
angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.catalog',{
            url: '/catalog',
            title: '手动编目',
            templateUrl: 'app/views/catalog/catalog.html',
            controller: 'CatalogController'
        })
        .state('app.catalog.search',{
            url: '/search?:pageNo&:copyrightId&:projectnameKeyword&:cpArtistKeyword&:cpAlbumKeyword&:songKeyword&:artistKeyword&:albumKeyword&:karakalStatus&:pageSize',
            title: '手动编目',
            views:{
                'catalog-list':{
                    templateUrl: 'app/views/catalog/catalog_list.html',
                    controller: 'CatalogSearchController'
                }
            }
        })
        .state('app.catalog.info',{
            url: '/info/:copyId',
            title: '手动编目-编目详情',
            views:{
                'catalog-page':{
                    templateUrl: 'app/views/catalog/catalog_info.html',
                    controller: 'CatalogInfoController'
                }
            }
        })
}]);
angular.module('app.routes').controller('CatalogController', ['$state','$scope',function($state,$scope){
    $scope.copy = {};
    $scope.clearInput = function(){
        $scope.copy = {};
    }
}]);
angular.module('app.routes').controller('CatalogSearchController', ['$scope','$http','$stateParams','$state','SweetAlert',function($scope,$http,$stateParams,$state,SweetAlert){
    if($stateParams.copyrightId == undefined || $stateParams.copyrightId == null)
        $stateParams.copyrightId = '';
    if($stateParams.projectnameKeyword == undefined || $stateParams.projectnameKeyword == null)
        $stateParams.projectnameKeyword = '';
    if($stateParams.cpArtistKeyword == undefined || $stateParams.cpArtistKeyword == null)
        $stateParams.cpArtistKeyword = '';
    if($stateParams.cpAlbumKeyword == undefined || $stateParams.cpAlbumKeyword == null)
        $stateParams.cpAlbumKeyword = '';
    if($stateParams.songKeyword == undefined || $stateParams.songKeyword == null)
        $stateParams.songKeyword = '';
    if($stateParams.artistKeyword == undefined || $stateParams.artistKeyword == null)
        $stateParams.artistKeyword = '';
    if($stateParams.albumKeyword == undefined || $stateParams.albumKeyword == null)
        $stateParams.albumKeyword = '';
    if(checkEmpty($stateParams.karakalStatus)){
        $stateParams.karakalStatus = '';
    }
    var params = {};
    params.copyrightId = $stateParams.copyrightId,params.projectnameKeyword =$stateParams.projectnameKeyword,
        params.cpArtistKeyword = $stateParams.cpArtistKeyword,params.cpAlbumKeyword = $stateParams.cpAlbumKeyword,
        params.songKeyword = $stateParams.songKeyword,params.artistKeyword = $stateParams.artistKeyword,
        params.albumKeyword =  $stateParams.albumKeyword,params.karakalStatus= $stateParams.karakalStatus,
        params.pageSize = checkEmpty($stateParams.pageSize)?50:$stateParams.pageSize,params.pageNo= $stateParams.pageNo;
    for(var p in $stateParams){
        $scope.copy[p] = $stateParams[p];
    }
    $http.jsonp(catalog_seach_all + '?' + CALLBACK + '&data=' + JSON.stringify(params)).success(function(resp){
        // paginationCommon($scope,5,resp.body.pageSize,resp.body.totalCount,resp.body.pageTotal,resp.body.pageNo);
        var ids = [];
        for(var i = 0; i < resp.body.list.length; i ++){
            ids.push(resp.body.list[i].copyrightId);
        }
        if(ids.length < 1){
            sweetAlertCommon(SweetAlert,'暂无数据','warning');
            return;
        }
        $http.jsonp(catalog_search + '?callback=JSON_CALLBACK' +'&ids=' + ids.join(',')).success(function(res){
            //paginationCommon($scope,5,resp.body.pageSize,resp.body.totalCount,resp.body.pageTotal,resp.body.pageNo);
            $scope.datas = res.data;
        });
    });
    params.isQueryCount = 1;    //异步count
    $http.jsonp(catalog_seach_all + '?' + CALLBACK + '&data=' + JSON.stringify(params)).success(function(resp){
        materialListSeparatePage($scope,resp);
    });
    $scope.choosePage = function(){//分页
        $state.go('catalog.search',{pageNo: $scope.bigCurrentPage});
    }
}]);
angular.module('app.routes').controller('CatalogInfoController', ['$scope','$http','$stateParams','SweetAlert',function($scope,$http,$stateParams,SweetAlert){
    var copy_url = catalog_copy_zqsc + '?copyrightId=' + $stateParams.copyId;
    $scope.info = {};
    $scope.info.zqs = [],$scope.info.cl = [],$scope.info.mv = [];
    //获取所有产品数据彩振全随mv等
    $http.get(copy_url).success(function(res){
        $scope.info.fullMusicList = res.body.fullMusicList; //全曲
        $scope.info.colorRingList = res.body.colorRingList; //彩铃
        $scope.info.callRingList = res.body.callRingList;   //振铃
        $scope.info.walkmanList = res.body.walkmanList;   //随身听
        $scope.info.mvList = res.body.mvList;   //mv
        $scope.info.losslessList = res.body.losslessList;   //无损
        $scope.info.dalbumList = res.body.dalbumList;       //数字专辑
    });
    //获取已编目的歌曲详情
    $http.jsonp(catalog_info+$stateParams.copyId + '.json?'+CALLBACK).success(function(res){
        $scope.info = concatObj(res.data, $scope.info);
        if(res.data.songId){
            $http.jsonp(detail_url+'song/'+res.data.songId+'.json?callback=JSON_CALLBACK').success(function(resp){
                $scope.detail = resp.data;
            });
        }
        if(res.data.albumId){
            $http.jsonp(detail_url+'album/'+res.data.albumId+'.json?callback=JSON_CALLBACK').success(function(resp){
                $scope.detail = resp.data;
            });
        }
    });
    $scope.firstIndex = 0;
    $scope.info_search = function(song,type){//搜索按钮搜索
        getData(song,type);
    };
    $scope.choosePage = function(){//分页
        $scope.song.pageNo = $scope.bigCurrentPage;
        $scope.info_search($scope.song);
    };
    $scope.addPlaySong = function(songId,copyId){//歌曲播放
        addPlaySong(songId,SweetAlert, [],copyId.split(','), 0);
    };
    $scope.addPlaySong_Catalog = function(copyId,type){//版权信息播放
        addPlaySong_Catalog(copyId,type,SweetAlert);
    };
    $scope.chk = function(data,datas){//单选事件
        radioBtnChk(data,datas);
        $scope.catalogInfo = data;
    };
    $scope.goBack = function(){//返回
        history.back();
    };
    $scope.update = function(copyId,songId,urge,copyType){
        if(copyId == undefined ){
            return sweetAlertCommon(SweetAlert,'无版权信息','warning');
        }
        if(songId == undefined){
            sweetAlertCommon(SweetAlert,'请选择编目的数据','warning');
            return;
        }
        var url = catalog_update + copyId + '/' + songId + '.json?' + CALLBACK +'&copyrightType='+copyType;
        if(!checkEmpty(urge)){
            url = url +  '&urge=' + urge;
        }
        $http.jsonp(url).success(function(res){
            if(res.status == 1){
                return sweetAlertCommon(SweetAlert, res.msg, 'success'),history.back();
            }else{
                sweetAlertCommon(SweetAlert,'编目失败','error');
            }
        });
    };
    $scope.catalogPass = function(copyId,type){
        var pass = '';
        if(type == 1){
            pass = 10;
        }else if(type == 0){
            pass = 111;
        }
        $http.jsonp(catalog_check + copyId + '/' + pass + '.json?' + CALLBACK).success(function(res){
            if(res.status == 1){
                sweetAlertCommon(SweetAlert,'操作成功','success');
            }else{
                sweetAlertCommon(SweetAlert,'操作失败','error');
            }
        });
    };
    function getData(song,type){//通过歌曲信息获取列表
        song.status = 10;
        $http.jsonp(_search_url + 'search/'+type+'.json'+'?callback=JSON_CALLBACK&data='+JSON.stringify(song)).success(function(res){
            // materialListSeparatePage($scope,res);
            paginationCommon($scope,5,20,res.body.totalCount,res.body.pageTotal,res.body.pageNo);//分页
            if(res.body.list.length < 1){   //如果没有数据，则返回
                $scope.datas = [];
                return;
            }
            var ids = [];
            for(var i in res.body.list){
                if(res.body.list[i].songId) ids.push(res.body.list[i].songId);
                if(res.body.list[i].albumId) ids.push(res.body.list[i].albumId);
            }
            $http.jsonp(list_url + type + '.json?callback=JSON_CALLBACK&ids='+ids.join(',')).success(function(res){
                $scope.datas = res.data;
                console.log(res);
            });
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
function radioBtnChk(data,datas){   //单选框选中
    for(var i in datas){
        datas[i].isCheck = false;
    }
    data.isCheck = true;
}