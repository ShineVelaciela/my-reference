angular.module('app.routes').config(artistConfig);
artistConfig.$inject = ['$stateProvider', 'RouteHelpersProvider','$httpProvider'];
function artistConfig($stateProvider, helper,$httpProvider){

    $stateProvider
        .state('app.artist',{
            url: '/artist?:time&:id&:pageNo&:pageSize&:artistKeyword&:artistIds&:status&:{orderBys:json}&:tagBeans&:style&:score&:manualScore&:mscoreMin&:mscoreMax&:lastEditSearch&:lastEdit&:ckResult&:hotScoreMin&:hotScoreMax',
            title: '艺人管理',
            templateUrl: 'app/views/artist/all/artist.html',
            resolve: helper.resolveFor('ngGrid'),
            controller: 'ArtistController'
        })
        .state('artistInfo',{
            //url:'/artistInfo?:tp&:artistId&:{lastPage:json}',
            url:'/artistInfo?:tp&:artistId&:lastPage&:returnBtn',
            title: '查看-艺人查看',
            views:{
                '':{
                    templateUrl:'app/views/artist/all/artist-info.html',
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','modernizr'),
                    controller: 'ArtistInfoController'
                }
            }
        })
        .state('artistExamine',{
            url:'/artistExamine?:tp&:artistId&:taskId&:lastPage&:returnBtn',
            title: '审核-艺人审核',
            views:{
                '':{
                    templateUrl:'app/views/artist/all/artist-info.html',
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','modernizr'),
                    controller: 'ArtistExamineController'
                }
            }
        })
        .state('artistEdit',{
            url:'/artistEdit?:tp&artistId&:taskId&:auth&:lastPage',
            title: '编辑-艺人编辑',
            views:{
                '':{
                    templateUrl:'app/views/artist/all/artist-edit.html',
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','inputmask','lightbox2','modernizr'),
                    controller: 'ArtistEditController'
                }
            }
        })
        .state('app.separate',{
            'url' : '/separate/:type?:id&:lastPage',
            'views' : {
                '':{
                    templateUrl:
                        'app/views/artist/all/separate.html',
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','lightbox2'),
                    controller:'SeparateController'
                }
            }
        })
        .state('artistCheck',{
            'url':'/artistCheck?:tp&:artistId&:taskId&:lastPage',
            title: '抽查-艺人抽查',
            'views':{
                '':{
                    templateUrl:'app/views/artist/all/artist-info.html',
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','lightbox2','modernizr'),
                    controller: 'ArtistCheckController'
                }
            }
        })
        .state('material',{
            url: '/material',
            views:{
                '':{
                    templateUrl: helper.basepath('artist/blank.html'),
                    resolve: helper.resolveFor('oitozero.ngSweetAlert','icons','inputmask','lightbox2', 'modernizr')
                }
            }
        })
        .state('material.preArtist',{
            url: '/preArtist',
            title: '预览-艺人预览',
            views: {
                '': {
                    templateUrl: 'app/views/artist/all/artist-info.html',
                    controller: 'PreDataController'
                }
            }
        })
};
var catalogsArtist = [{'name':'概述','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'主要作品','id':'catalog-3'},{'name':'艺人风格','id':'catalog-4'},{'name':'艺人经历','id':'catalog-5'}];
angular.module('app.routes').controller('artist_chart',['$http', '$scope',function($http,$scope){
    $scope.size_lg = {
        width: 500,
        height: 500
    };
    getChartData();
    function getChartData(){//获取统计图表数据
        var data = {};
        data.tagIds = [1000001672,1000001674,1000001681,1000001682,1000001683,1000001775,1000001783,1000001808,1000001809];
        data.minScore = 3;
        $http.jsonp(charts_artist_tag + '?callback=JSON_CALLBACK&data='+JSON.stringify(data)).success(function(res){
            console.log(res);
            $scope.datas = res.body;
            setConfig($scope,$scope.datas);

            $scope.tag = res.body[0].name;
            var data = {};
            data.tagId = res.body[0].id;
            data.tagIds = _location_tids;
            data.artistSize = 5;
            getData(data);
        });
        //$scope.datas = [{"id":1000001672,"name":"流行","y":925},{"id":1000001681,"name":"爵士","y":171},{"id":1000001682,"name":"电子","y":253},{"id":1000001683,"name":"乡村","y":76},{"id":1000001775,"name":"民谣","y":130},{"id":1000001783,"name":"古典","y":136},{"id":1000001808,"name":"R&B","y":0},{"id":1000001809,"name":"嘻哈","y":0}];
        //setConfig($scope,$scope.datas);
    }
    function getData(data){
        $http.jsonp(charts_artist_data + '?callback=JSON_CALLBACK&data='+JSON.stringify(data)).success(function(res){
            console.log(res);
            $scope.tag_datas = res.body;
            for(var j in $scope.tag_datas){
                for(var i in $scope.tag_datas[j].artists){
                    if($scope.tag_datas[j].artists[i].imgUrl != null && $scope.tag_datas[j].artists[i].imgUrl != undefined){
                        $scope.tag_datas[j].artists[i].imgUrl = $scope.tag_datas[j].artists[i].imgUrl.replace(/http:\/\/218.200.230.40:18089\/files/,'http://218.200.230.40:18089/files/resize');
                    }
                }
            }
            //$scope.datas = $scope.tag_datas;
        });
    }
    function setConfig($scope,data){
        $scope.artistChart = {//抓取总量配置
            options: {
                chart: {
                    type: 'pie'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        },
                        point:{
                            events : {
                                click:function($http){
                                    $scope.tag = this.name;
                                    var data = {};
                                    data.tagId = this.id;
                                    data.tagIds = _location_tids;
                                    data.artistSize = 5;
                                    getData(data);
                                    //alert(this.id);
                                }
                            }
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: '艺人所占比例',
                data: data
            }],
            title: {
                text: '优质艺人优质标签统计'
            },
            loading: false,
            useHighStocks: false,
            size:{
                width: 500,
                height: 500
            },
            "credits":{"enabled":false}
        };
        //return $scope.artistChart;
    }

}]);
angular.module('app.routes').controller('SeparateController',['$http', '$scope', '$stateParams', '$timeout', '$rootScope', 'display', '$state', 'ngDialog', 'SweetAlert',
    function($http,$scope,$stateParams,$timeout,$rootScope,display,$state,ngDialog,SweetAlert){
    $rootScope.pageTitle = ($stateParams.type == 'artist' && '拆分-艺人拆分') || ($stateParams.type == 'album' && '拆分-专辑拆分') || ($stateParams.type == 'song' && '拆分-歌曲拆分');
    $scope.type = $stateParams.type;
    var sites_url = http_url + '/mid2SiteId/all/';
    //var sites_url = 'http://192.168.2.203:17080/mid2SiteId/all/';
    $http.get(SEPARATE_SEARCH + 'karakal/' +$stateParams.type+'/'+$stateParams.id+'.json').success(function(res){
        if(!res.data) return sweetAlertCommon(SweetAlert, res.msg, 'warning');
        var param = [];
        var map = [];
        for(var i = 0; i < res.data.length;i++){  //设置获取素材接口参数
            var obj = {};
            obj.id = res.data[i].siteId;
            obj.type = $stateParams.type.toUpperCase();
            obj.site = res.data[i].site.toUpperCase();
            param.push(obj);
            var m = {};
            m.id = res.data[i].siteId;
            m.status =  res.data[i].status;
            map.push(m);
        }
        console.log(param);
        $http.jsonp(SEPARATE_SOURCE + '1/extractions.json?jsonParams='+JSON.stringify(param)+'&'+CALLBACK).success(function(res){
            $rootScope.datas = [];
            for(var i = 0; i < res.content.length; i++){
                if(!checkEmpty(res.content[i].data))    $rootScope.datas.push(res.content[i]);
            }
            for(var i = 0;i < $scope.datas.length; i++){
                for(var j = 0; j < map.length; j ++){
                    if($rootScope.datas[i].param.id == map[j].id){
                        $rootScope.datas[i].param.mStatus = map[j].status;
                        if(map[j].status == 1){
                            $rootScope.datas[i].checked = true;
                        }else{
                            $rootScope.datas[i].checked = false;
                        }
                    }
                }
                $rootScope.datas[i].hide =false;
            }
            console.log($rootScope.datas);
        });
    });
    $scope.separateData = function(tp,site,id,name){
        site = site.toLowerCase();
        if(id == $stateParams.id){
            alertTipCommon($timeout,$rootScope,'曲库ID和媒资库ID一致,不允许拆分',display);
            return;
        }
        if($scope.datas.length <= 1){
            alertTipCommon($timeout,$rootScope,'只有一条数据，不能进行此操作',display);
            return;
        }
        $http.jsonp(http_url + '/split/' + tp + '/' + site + '/' + id + '.json?'+CALLBACK).success(function(res){
            if(res.status == 0){
                alertTipCommon($timeout,$rootScope,'拆分失败',display);
            }else{
                alertConfirm('拆分成功',function(){location.reload()},function(){
                    var param = {};
                    param[$stateParams.type+'Keyword'] = name;
                    $state.go($stateParams.type,param);
                },'停留此页面','跳转列表页面');
            }
        });
    };
    $scope.showSiteOnly = function(site){
        var _flag;
        $scope.datas.forEach(function (val) {
            val.hide = true;
        });

        for(var p in site){
            for(var i = 0; i < $scope.datas.length; i++){
                    if(site[p]){
                        if(p == 'ALL'){
                            $scope.datas[i].hide = false;
                        }else if($scope.datas[i].param.site != p && $scope.datas[i].hide){
                            $scope.datas[i].hide = true;
                        }else{
                            $scope.datas[i].hide = false;
                        }
                        _flag = true;
                    }
            }
        }
        if(!_flag) $scope.datas.forEach(function (val) {
            val.hide = false;
        });

        // for(var i = 0; i < $scope.datas.length; i++){
        //     if(site == 'ALL'){
        //         $scope.datas[i].hide = false;
        //     }else if($scope.datas[i].param.site != site){
        //         $scope.datas[i].hide = true;
        //     }else{
        //         $scope.datas[i].hide = false;
        //     }
        // }
    };
    $scope.dialog = function(){  //抓取
        var dialog = ngDialog.open({
            template: '<div class="ngdialog-message"> <h4 class="mt0">手动抓取</h4> ' +
                '<form class="form-horizontal text-center" name="loginForm"><div class="form-group">' +
            '<label for="param-name" class="col-sm-3 control-label" >URL</label> ' +
            '<div class="col-sm-8"> <input id="param-name" required type="text" placeholder="请输入要抓取的URL地址" class="form-control input-sm" ng-model="url"> </div></div>'+
            '<button type="button" ng-click="catch(url)" class="btn btn-primary" ng-disabled="loginForm.$invalid">确认</button></form></div>',
            plain: true,
            closeByDocument: false,
            closeByEscape: false,
            controller:['$scope',function($scope){
                $scope.catch = function(url){
                    console.log($stateParams.type);
                    var param = {};param.url =url;
                        //var catch_url = 'http://192.168.2.251:18181/mzk-capture-client/1/captureUrl.json';
                    //var catch_url = 'http://192.168.2.123:18181/mzk-capture-client/1/captureUrl.json';
                    //var e_param = encodeURIComponent(JSON.stringify(param));
                    //catch_url = catch_url+JSON.stringify(param)+'&'+CALLBACK;
                    $.post(CATCH_URL,'jsonParams='+encodeURIComponent(JSON.stringify(param))).success(function(res){
                        ngDialog.close();
                        if(res.code == '000000' && res.hasOwnProperty('content')){
                            if(checkEmpty(res.content)){
                                sweetAlertCommon(SweetAlert,'未抓取到数据','warning');
                                return;
                            }
                            var catch_type = res.param.type.substring(0,res.param.type.indexOf('_')).toLowerCase();
                            if(catch_type != $stateParams.type){
                                sweetAlertCommon(SweetAlert,'抓取数据与当前数据类型不一致，请重新抓取','warning');
                                return;
                            }
                            if(checkEmpty($rootScope.datas)){
                                $rootScope.datas = [];
                            }
                            for(var i = 0;i < $rootScope.datas.length;i++){ //判断数据是否存在
                                if(!checkEmpty($rootScope.datas[i].data) && $rootScope.datas[i].data.id == res.content.id){
                                    sweetAlertCommon(SweetAlert,'抓取数据已存在','warning');
                                    return;
                                }
                            }
                            var data = {};
                            data.data= res.content;
                            data.param = res.param;
                            data.isNew = true;
                            data.param.id = res.content.id;
                            $rootScope.datas.push(data);
                            sweetAlertCommon(SweetAlert,res.message,'success');
                        }else{
                            sweetAlertCommon(SweetAlert,res.message,'error');
                        }

                        console.log(res);
                    }).error(function(){
                        sweetAlertCommon(SweetAlert,'抓取请求异常','error');
                    });
                    //ngDialog.close();
                    console.log(url);
                }
            }]
        });
    };
    $scope.submit = function(type,datas){       //确认合并关系
        var obj = {};
        obj.type = $stateParams.type;obj.data = [];
        for(var i = 0; i < datas.length; i++){
            var o = {site: datas[i].param.site.toLowerCase(), siteId: datas[i].param.id};
            if(datas[i].hasOwnProperty('isNew')) o.isNew = true;
            if(datas[i].checked){
                o.status = 1;
                if(datas[i].param.id == $stateParams.id) o.target = true;
            }else{
                o.status = -1;
            }
            obj.data.push(o);
        }
        $http(new PostSetup(SEPARATE_CONFIRM, 'data=' + JSON.stringify(obj))).success(function (res) {
            if(res.status == 0) sweetAlertCommon(SweetAlert, res.msg, 'success'),location.reload();
            else sweetAlertCommon(SweetAlert,res.msg,'error');
            console.log(res);
        }).error(function () {
            sweetAlertCommon(SweetAlert, '拆分关系确认接口请求异常', 'error');
        });
        // $http.jsonp(url).success(function(res){
        //     if(res.status == 1){
        //         sweetAlertCommon(SweetAlert,res.msg,'success');
        //         location.reload();
        //     }else{
        //         sweetAlertCommon(SweetAlert,res.msg,'error');
        //     }
        // }).error(function(){
        //     sweetAlertCommon(SweetAlert,'请求异常','error');
        // });
    };
    $scope.back = function(){
        window.open(returnLastPage($stateParams.lastPage),'_self');
    }
}]);
angular.module('app.routes').controller('PreDataController', ['BaseService', '$scope',function (BaseService,$scope) {
    $scope.pre = true;
    var preData = JSON.parse(localStorage.getItem('preData'));
    $scope.data = preData[0];
    $scope.artistTags = preData[1];
    $scope.tagExt = preData[2];
    if(checkEmpty($scope.relTags)) $scope.relTags = {};
    var languageTags = JSON.parse(localStorage.getItem('languageTags'));
    if(languageTags)
        $scope.relTags['15'] = languageTags;
    if($scope.data.hasOwnProperty('artistName')) $scope.catalogs = catalogsArtist;
    if($scope.data.hasOwnProperty('albumName')) $scope.catalogs = catalogsAlbum;
    if($scope.data.hasOwnProperty('songName')) $scope.catalogs = catalogs;
    $scope.closeWin = function () { //关闭窗口按钮
        window.close();
    };
    console.log($scope.data);
}]);
angular.module('app.routes').controller('AssignToTaskModal', ['type', 'datas', '$scope', 'SweetAlert', '$uibModalInstance', '$http',function (type, datas, $scope, SweetAlert, $uibModalInstance, $http) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.assign = function () {
        if(!$scope.assign || !$scope.assign.type) return sweetAlertCommon(SweetAlert, '请选择需要添加的工单', 'warning');
        switch($scope.assign.type){
            case '1':
                var _selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, type + 'Id');
                addToCheckTask($http, type, _selectedDataIds, SweetAlert, $uibModalInstance);
                break;
        }
    };
}]);
angular.module('app.routes').controller('ArtistController', ['$scope', '$http', '$stateParams', 'permissions', '$timeout', '$rootScope', 'display', '$state', '$window', '$cookies', 'SweetAlert',
    function($scope, $http, $stateParams, permissions, $timeout, $rootScope, display, $state,$window,$cookies,SweetAlert){
    //界面元素控制下拉框列表
    var _table = JSON.parse(localStorage.getItem('local-artistHtml'));
    $scope.artist_html = _table ? _table : [{name:'状态', checked:true},{name: '艺人ID', checked:true},{name: '艺人名', checked:true},{name:'别名及昵称', checked:true},{name:'性别', checked:true},{name: '国家', checked:true},{name:'综合评分', checked:true},{name:'人工评分', checked:true}];
    $scope.storageTableShow = function () {
        var _localStorage = [];
        $scope.artist_html.forEach(function (val) {
            _localStorage.push(val);
        });
        localStorage.setItem('local-artistHtml', JSON.stringify(_localStorage));
    };
    if(checkEmpty($scope.users)) $scope.users = JSON.parse(localStorage.getItem('users'));
    //初始化界面的artists

    $scope.datas = [];
    $scope.artistTags = [];
    $scope.page = new Object();
    $scope.form = {};
    $scope.form.searchTag = [];
    $scope.form.tagBeans = [];
    $stateParams.queryMethod = 1;
    getTagList(1,$scope,$stateParams,$http,$cookies,SweetAlert);
    var url = _search_artist + '?' + CALLBACK;
    url = materialListFillUrl(url, $stateParams);
    if(url != undefined){
        $http.jsonp(url).success(function(res){
            //填充页面数据
            getMaterialBySearch(res, $http, $scope, 'artist');
        });
    }
    //分页
    var page_url = _search_artist + '?' + CALLBACK;
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
        var param = {};
        for(var p in params){
            if(p == 'score' || p == 'manualScore'){
                var map = {};
                map.key = p;
                map.value = params[p];
                param.orderBys = map;
                param[p] = params[p];
            }else{
                param[p] = params[p];
            }
        }

        if(!checkEmpty(param.tagBeans)) param.tagBeans = angular.toJson(param.tagBeans);
        param.pageNo = '',param.pageSize = '';
        param.time = new Date().getTime();
        $state.go('app.artist',param,{reload: false, inherit: false});
    };
    $scope.setScore = function(type){
        if(!checkEmpty($scope.form) && !checkEmpty($scope.form[type])){
            $scope.form[type] = '';
        }
    };
    $scope.scoreSearch = function(type,op){
        if(checkEmpty($scope.form)) $scope.form = {};
        $scope.form[type] = op;
        if(type == 'score'){
            deleteProperty($scope.form,'manualScore');

        }else{
            deleteProperty($scope.form,'score');
        }
        this.submit();
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
    $scope.changeTagType = function (type) {
        for(var i = 0; i < $scope.form.tagBeans.length; i++){
            if(!checkEmpty($scope.form.tagBeans[i].type)){
                $scope.form.tagBeans[i].type = type;
            }
        }
    };
    //全文搜索
    $scope.getSearchResult = function(value, searchType){
        //console.log(value);
        var _params = {data: {artistKeyword: value, isolated: 0}, searchType: searchType ? searchType : 1};
        return $http.get(_search_artist, {
            params: _params
        }).then(function(response){
            //console.log(response.data);
            return response.data.body.list.map(function(item){
                //console.log(item);
                var allstr = item.artistName + '-';
                allstr = allstr.substr(0, allstr.length - 1) + '-' + item.artistId;
                item.allstr = allstr;
                return item;
            });
        })
    };
    //全文检索选择事件
    $scope.addArtist2List = function(data){
        console.log(data);
        $state.go('app.artist',{artistIds:data.artistId, artistKeyword:''});
    };
    //全文检索点击搜索按钮
    $scope.searchArtistBtn = function(value){
        $state.go('app.artist',{artistKeyword:value, artistIds:'', tagIds:''});
    };
    //标签右上角的叉叉函数
    $scope.artistTagRemove = function(tag){
        console.log(tag);
        styleTagSearchWay(tag,$scope,false);
        //tagRemove(tag,$scope,$stateParams,$state,'app.artist');
        $scope.form.searchTag.remove(tag);
        $scope.form.tagBeans.remove(tag);
    };
    //点击标签树中的标签跳转相应数据显示页面
    $scope.artistTagClick = function(tag){
        tagClick(tag,artistTagTree,'artist',$stateParams,$state);
    };
    //重新抽取素材
    $scope.extractedMaterial = function(id, type){
        extractedMaterial(id, type, $http, SweetAlert);
    };
    //分页跳转
    $scope.choosePage = function(){
        $state.go('app.artist',{pageNo: $scope.page.currentPage});
    };
    $scope.jumpPage = function(pageNo){ //页面跳转
        $state.go('app.artist',{pageNo:pageNo});
    };
    $scope.choosePageSize = function (pageSize) {   //每页展示数据
        $state.go('app.artist',{pageSize:pageSize});
        // console.log(elem.inheritedData('$uiView').state);
        console.log($state.current);
    };
    //监听键盘按钮事件
    $scope.enter = function(event, searchValue, searchType){
        if(event.keyCode == 13){
            //console.log(searchValue);
            if(searchType == 'artistId'){
                $state.go('app.artist',{artistIds:searchValue, artistKeyword:'', karakalStatus:''});
            } else if(searchType == 'artistName'){
                $state.go('app.artist',{artistKeyword:searchValue, artistIds:''});
            }
        }
    };
    //勾选框控制界面元素
    $scope.changeCheck = function(html){
        //把勾选框去掉
        html.checked = !html.checked;
        $scope.html_chooseElem = false;
    };
    //显示所有属性
    $scope.showAllHtmlElem = function(){
        for(var  i = 0; i < $scope.artist_html.length; i++){
            $scope.artist_html[i].checked = true;
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
        var selectedDataIds = getPropertyFromCheckBox(datas, 'isCheck', true, 'artistId');
        addToCheckTask($http, "artist", selectedDataIds, SweetAlert);
    };
    //编辑按钮
    $scope.editJump = function(data){
        editJump($http,'artist',data,$state,SweetAlert,'_self', $stateParams);
    };
    $scope.rightClick = function (data) {
        editJump($http,'artist',data,$state,SweetAlert, '_blank', $stateParams);
    };
    //查看艺人信息按钮
    $scope.showArtistInfo = function(artist){
        openNewTab('artist',artist,'Info',$state);
        //window.open("/mls/resources/pages/top/index.html#/artistInfo?artistId=" + artist.artistId + '&lastPage={"url":"' + encodeURIComponent(document.location.href)+'"}', '_blank');
    };
    $scope.separate = function(type,id){
        var url = $state.href('app.separate',{type:type,id:id,lastPage:returnLastPageTime()});
        window.open(url,'_blank');
    };
    $scope.new = function (type) {
        addNewMaterialFromTop(type,$state);
    }

}]);
angular.module('app.routes').controller('ArtistInfoController', ['$scope', '$stateParams', '$http', '$cookies', '$sce', '$state', '$timeout', '$rootScope', 'display', '$location', '$anchorScroll', 'SweetAlert',
    function($scope, $stateParams, $http, $cookies,$sce,$state,$timeout,$rootScope,display,$location,$anchorScroll,SweetAlert){
    if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
    $scope.catalogs = [{'name':'概述','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'主要作品','id':'catalog-3'},{'name':'艺人风格','id':'catalog-4'},{'name':'艺人经历','id':'catalog-5'}];
    $scope.gotoAnchor = function(id) {  //锚点跳转
        // set the location.hash to the id of
        // the element you wish to scroll to.
        $location.hash(id);
        // call $anchorScroll()
        $anchorScroll();
    };
    getDataInfo('artist',$http,$scope,$sce,$stateParams,true);//获取数据信息
    getOpRecord('artist',$stateParams.artistId,1,1,$http,$scope);
    getExamineList('artist',1,$http,$scope,$stateParams,SweetAlert);
    getCheckRecod('artist',$stateParams.artistId,1,$http,$scope,SweetAlert);
    var artistTagUrl = tag_edit_new_query + 'artist/' + $stateParams.artistId + '.json?' + CALLBACK;
    $http.jsonp(artistTagUrl).success(function(res3){
        $scope.artistTags = res3.data.tags;
    });

    $scope.edit = function(type,data){ //编辑按钮
        editJumpNew(type,data,SweetAlert,$state,'_self', $stateParams);
    };
    $scope.goBack = function(){ //返回按钮
        window.open(returnLastPage($stateParams.lastPage), '_self');
    };
    $scope.selectImgNext = function(img,imgs){
        selectImgNext(img,imgs);
    };
    $scope.selectImgPre = function(img,imgs){
        selectImgPre(img,imgs);
    };
    $scope.jumpInfo = function(type,id,op){
        infoNewTabState(type,id,op,$state)
    };
    loadMoreRecord('artist',$scope,$stateParams,$http,SweetAlert);
}]);
angular.module('app.routes').controller('ArtistExamineController', ['$scope', '$stateParams', '$http', '$cookies', '$sce', 'SweetAlert',function($scope, $stateParams, $http, $cookies,$sce, SweetAlert){
    if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
    $scope.catalogs = [{'name':'概述','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'主要作品','id':'catalog-3'},{'name':'艺人风格','id':'catalog-4'},{'name':'艺人经历','id':'catalog-5'}];
    $scope.examine = true;
    getLastExamine($stateParams.artistId, $scope);      //获取本地存储
    getDataInfo('artist',$http,$scope,$sce,$stateParams);//获取数据信息
    getOpRecord('artist',$stateParams.artistId,1,1,$http,$scope);
    getExamineList('artist',1,$http,$scope,$stateParams,SweetAlert);
    getCheckRecod('artist',$stateParams.artistId,1,$http,$scope);
    var artistTagUrl = tag_edit_new_query + 'artist/' + $stateParams.artistId + '.json?' + CALLBACK;
    $http.jsonp(artistTagUrl).success(function(res3){
        $scope.artistTags = res3.data.tags;
    });

    //审核提交按钮
    $scope.examinArtist = function(examineResult, examineSuggest){
        examineCommon('artist',examineResult,examineSuggest,$http,$stateParams,SweetAlert);
    };
    //返回按钮
    $scope.goBack = function(){ //返回按钮
        window.open(returnLastPage($stateParams.lastPage), '_self');
    };
    $scope.loadMoreOperate = function(){
        $scope.pageNo = checkEmpty($scope.pageNo) ? 2 : ($scope.pageNo + 1);
        getOpRecord('artist',$stateParams.artistId,1,$scope.pageNo,$http,$scope,SweetAlert);
    };
    $scope.loadMoreExamine = function(){
        $scope.pageNo = checkEmpty($scope.pageNo) ? 2 : ($scope.pageNo + 1);
        getExamineList('artist',$scope.pageNo,$http,$scope,$stateParams,SweetAlert);
    };
    $scope.loadMoreCheck = function(){
        $scope.pageNo = checkEmpty($scope.pageNo) ? 2 : ($scope.pageNo + 1);
        getCheckRecod('artist',$stateParams.artistId,$scope.pageNo,$http,$scope,SweetAlert);
    };
    loadMoreRecord('artist',$scope,$stateParams,$http,SweetAlert);
    $scope.showExamine = function () {
        console.log('test');
        $scope.examineStyle = true;
    }
}]);
angular.module('app.routes').controller('ArtistEditController', ['$scope', '$stateParams', '$http', '$cookies','$timeout','$rootScope','display','$anchorScroll','$location','$window','$filter','$state','SweetAlert','$sce',function($scope, $stateParams, $http, $cookies,$timeout,$rootScope,display,$anchorScroll,$location,$window,$filter,$state,SweetAlert,$sce){
    $scope.birth = '9999-19-39';
    $scope.type = 'artist';
    $scope.preBtn = true;
    addNewDataPage('album',$scope,$stateParams);
    console.log(decodeURIComponent($stateParams.lastPage));
    $scope.catalogs = [{'name':'概述','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'主要作品','id':'catalog-3'},{'name':'艺人风格','id':'catalog-4'},{'name':'艺人经历','id':'catalog-5'}];
    getOpRecord('artist',$stateParams.artistId,1,1,$http,$scope);
    getDataInfo('artist',$http,$scope,$sce,$stateParams);
    getCheckRecod('artist',$stateParams.artistId,1,$http,$scope);
    getExamineList('artist',1,$http,$scope,$stateParams,SweetAlert);
    var artistInfoUrl = detail_url+'artist/'+$stateParams.artistId+'.json?' + CALLBACK;

    //几种数据字典搜索
    $scope.getDictionary = function(value, type){
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

    //艺人代表歌曲全文搜索
    $scope.getSearchResult = function(value,type, searchType){
        // var _params = {data: {artistKeyword: value, isolated: 0}, searchType: searchType ? searchType : 1};
        var param = {};param.params = {searchType: searchType ? searchType : 1};param.params.data={};
        param.params.data[type+'Keyword'] = value;
        param.params.data['isolated'] = 0;
        return $http.get(_search_url+'search/'+type+'.json', param).then(function(response){
            var ids = [];
            for(var i = 0; i < response.data.body.list.length; i++){
                ids.push(response.data.body.list[i][type+'Id']);
            }
            if(ids.length == 0){
                return;
            }else{
                return $http.jsonp(list_url + type + ".json?ids=" + ids.join(',')+'&'+CALLBACK).then(function(res){
                    return res.data.data.map(function(item){
                        var _dataDetail = [];
                        _dataDetail.push(item[type+'Name'] + '--');
                        if(type == 'artist'){
                            if(item.sex) _dataDetail.push(item.sex);
                            if(item.artistNameAlias) _dataDetail.push(item.artistNameAlias);
                            if(item.nation) _dataDetail.push(item.nation);
                            // allstr += item.sex + ',' + item.artistNameAlias + ',' + item.nation + ',';
                        }
                        if(item.artists){
                            for (var i = 0; i < item.artists.length; i++){
                                _dataDetail.push(item.artists[i].artistName + ',');
                            }
                        }
                        _dataDetail.push(item[type+'Id']);
                        // allstr = allstr.substr(0, allstr.length - 1) + ',' + item[type+'Id'];
                        item.allstr = _dataDetail.join(',');
                        return item;
                    });
                });
            }
        })
    };

    //相似艺人全文搜索
    $scope.getSimilarArtist = function(){};
    $scope.taggingData = {},$scope.taggingData.rid=$stateParams.artistId,$scope.taggingData.tags=[];     //更新标签参数
    var artistTagUrl = tag_edit_new_query + 'artist/' + $stateParams.artistId + '.json?' + CALLBACK;
    $http.jsonp(artistTagUrl).success(function(res3){
        $scope.artistTags = res3.data.tags;
        for(var i=0;i < res3.data.tags.length; i++){
            var tag = {};
            tag.type = res3.data.tags[i].type;
            tag.tagId = res3.data.tags[i].tagId;
            $scope.taggingData.tags.push(tag);
            if(res3.data.tags[i].type == 11){
                $scope.area = {},$scope.area.tagId = res3.data.tags[i].tagId + '',
                    $scope.area.tagName = res3.data.tags[i].tagName;
            }
        }
        // if($stateParams.tp == 2 || $stateParams.tp == 3 || $stateParams.tp == 4){  //切换模板时特殊处理，没有的标签去掉
        //     var tagsTemp = [];
        //     var artistTagsTemp = [];
        //     for(var i = 0 ; i < $scope.taggingData.tags.length; i++){
        //         if($scope.taggingData.tags[i].type != 10 && $scope.taggingData.tags[i].type != 12 && $scope.taggingData.tags[i].type != 13){
        //             tagsTemp.push($scope.taggingData.tags[i]);
        //             artistTagsTemp.push($scope.artistTags[i]);
        //         }
        //     }
        //     $scope.taggingData.tags = tagsTemp;
        //     $scope.artistTags = artistTagsTemp;
        // }else if($stateParams.tp == 0){
        //     $scope.taggingData.tags = [];
        // }
        if($stateParams.tp == 0){
            $scope.taggingData.tags = [];
        }
        getCStyle('1,2','otherSonStyleList',$scope,$http);      //先获取其他子风格的所有标签，以便用于删除一级和二级标签

        getArtistTags();  //获取艺人标签

        //console.log($scope.taggingData.tags);
    }).error(function () {
        console.log('error');
        getArtistTags();  //获取艺人标签
    });
    //提交按钮
    $scope.submit = function(){
        if(!$scope.data.artistName) return sweetAlertCommon(SweetAlert, '艺人名不能为空', 'warning');
        console.log($scope.data);
        var submitUrl = save_url + 'artist.json';
        //特殊处理
        if($scope.data.effectYearsStart != undefined || $scope.data.effectYearsEnd != undefined){
            //$scope.data.effectYears = $scope.data.effectYearsStart + '-' + $scope.data.effectYearsEnd;
            var effectYearsStart = checkEmpty($scope.data.effectYearsStart)?'':$scope.data.effectYearsStart;
            var effectYearsEnd = checkEmpty( $scope.data.effectYearsEnd)?'': '-' + $scope.data.effectYearsEnd;
            $scope.data.effectYears = effectYearsStart + effectYearsEnd;
        }
        if($scope.data.imgUrl != undefined){
            if($scope.data.imgUrl.indexOf(img_r_url) != -1){
                //console.log($scope.data.imgUrl.substring(31,$scope.data.imgUrl.length));
                // $scope.data.imgUrl = $scope.data.imgUrl.substring(31,$scope.data.imgUrl.length);

                $scope.data.imgUrl = $scope.data.imgUrl.replace(img_r_url,'');
            }
        }
        //$scope.data.imgUrl = $scope.data.avatar;
        //console.log($scope.data.similarArtists);
        $scope.data.birth = sliceDate($scope.data.birth);  //特殊裁剪生日
        $scope.data.deathdate = sliceDate($scope.data.deathdate);  //特殊裁剪逝世日期

        // if($scope.data.birth)
        //     if($scope.data.birth.indexOf('_'))
        //         $scope.data.birth = $scope.data.birth.slice(0, $scope.data.birth.indexOf('_')-1);
        //需要保留的属性的字段名
        var propertyArr = [
            'artistId','description','type','artistName','artistNameAlias','englishName','chineseName','usedName','nickName','birth','deathdate','zodiac','constellation','height','weight','bloodType','recruitment','ethnic','location','degree','graduate','hobby','sex','company','rcompany','archieve','insrument','lover','nation','birthPlace','effectYears','composeTime','missTime','imgUrl','mscore','course','representSongs'//代表歌曲，数组
            ,'resumes','honors'//荣誉记录，数组
            ,'bands'//艺人所属组合，数组（type为艺人时才传）
            ,'artists'//组合包含艺人，数组（type为组合时才传）
            ,'similarArtists'//相似艺人，数组
            ,'status','karakalStatus','isolated','honorsJson'
        ];
        var data = keepObjectProperty(propertyArr, $scope.data);
        data.auth = $stateParams.auth;
        data.tags = $scope.taggingData.tags;
        data.tagExt = $scope.taggingData.tagExt;
        console.log(data);
        //艺人属性
        $http(new PostSetup(submitUrl, 'data='+encodeURIComponent(angular.toJson(data)))).success(function(res){
            if(res.status == 1){
                pausePlay();
                // sweetAlertCommon(SweetAlert,res.msg,'success');
                if(!checkEmpty($stateParams.lastPage)) window.open(returnLastPage($stateParams.lastPage), '_self');
                else history.back();
            }else{
                sweetAlertCommon(SweetAlert,res.msg,'error');
            }
        });
        //艺人标签
        // $http.jsonp(tag_edi_new_update + 'artist.json?'+CALLBACK+'&data='+JSON.stringify($scope.taggingData)).success(function(res){
        //     if(res.status != 1){
        //         sweetAlertCommon(SweetAlert,'标签更新失败','error');
        //     }
        // });
    };

    //打开日期框
    $scope.open = function(flag,model) {
        if(flag == 1){
            $scope.dateStatus.opened1 = true;
        } else if (flag == 2){
            $scope.dateStatus.opened2 = true;
        }
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false
    };
    $scope.selectSingleProperty = function (val, property) {  //选择单一的数据属性
        if(!$scope.data) $scope.data = {};
        $scope.data[property] = val;
    };
    $scope.removeSingleProperty = function (property) {     //删除单一的数据属性
        delete $scope.data[property];
    };

    function getArtistTags() {
        $http.get(tag_tree_url+'getArtisteByClassificationAndTag?type=1').success(function(res){
            $scope.areaList = res.areaList;     //地域
            $scope.eraList = res.eraList;       //年代
            $scope.mainStylesList = res.mainStylesList;     //主风格
            $scope.occupationList = res.occupationList;     //职业
            $scope.secondaryStyleList = res.secondaryStyleList;     //次风格
            $scope.skilledInMusicList = res.skilledInMusicList;     //乐器
            $scope.timbreList = res.timbreList;     //音色

            for(var j = 0; j <　$scope.areaList.tagList.length; j++){
                if($scope.area.tagId == $scope.areaList.tagList[j].tagId){
                    $scope.area = $scope.areaList.tagList[j];
                }
            }
            console.log(res);
        });
    }


    $scope.tagging = function(t,type){  //打标签操作
        setTaggingData(t,type,$scope);
    };

    $scope.selectPlace = function(t,type){  //选择地域操作
        for(var i = 0; i < $scope.artistTags.length; i++){
            if(isPropertyEmpty(t) && $scope.artistTags[i].type == type){
                for(var j = 0; j < $scope.taggingData.tags.length; j++){
                    if($scope.taggingData.tags[j].type == type){
                        $scope.taggingData.tags.del(j);
                    }
                }
                $scope.artistTags.del(i);
                return;
            }
        }
        setTaggingData(t,type,$scope);
    };

    $scope.addRepresentSongs = function(){
        var s = {};
        s.songName = '';
        s.songId = '';
        if($scope.data.representSongs == undefined){
            $scope.data.representSongs = [];
        }
        $scope.data.representSongs.push(s);
    };
    //全文检索选择事件
    $scope.addDataRepresentSongs = function(item, s){
        s.songId = item.songId;
        s.songName = item.songName;
        $scope.addRepresentSongs();
    };
    $scope.deleteRepresentSongs = function(data,index){   //删除对应的代表歌曲
        $scope.data.representSongs.del(index);
        //for(var i = 0; i < $scope.data.representSongs.length; i ++){
        //    if(data.songId == $scope.data.representSongs[i].songId){
        //        $scope.data.representSongs.del(i);
        //    }
        //}
        console.log($scope.data.representSongs);
    };
    $scope.deleteBands = function(data,index){  //删除所属乐队
        $scope.data.bands.del(index);
    };
    $scope.deleteArtists = function(data,index){
        $scope.data.artists.del(index);
    };
    $scope.deleteArr = function(index,arr){
        arr.del(index);
    };
    $scope.addBands = function(tp){ //添加所属组合乐队或者添加成员（添加输入框）
        if($scope.data[tp] == undefined){
            $scope.data[tp] = [];
        }
        if($scope.data[tp].length >= 10){
            sweetAlertCommon(SweetAlert,'最多添加十行','warning');
            return;
        }
        var m = {};
        m.timeRange = '';
        m.role = '';
        m.artistName = '';
        $scope.data[tp].push(m);
        console.log( $scope.data[tp]);
    };
    $scope.addHonors = function(tp){  //添加荣誉记录
        var m = {};
        m.prize = '';
        m.time = '';
        m.type = '';
        m.works = '';
        m.description = '';
        m.classes = '';
        if($scope.data[tp] == undefined){
            $scope.data[tp] = [];
        }
        $scope.data[tp].push(m);
    };
    $scope.showBands = function(){
        console.log( $scope.data.bands);
    };
    $scope.addDataGroup = function(item,m,tp){  //添加所属组合乐队或者添加成员（往对象里面放数据用于编辑保存数据）
        console.log(item);
        console.log(m);
        m.artistName = item.artistName;
        m[tp+'Id'] = item.artistId;
    };
    $scope.groupChange = function (m, tp) {
        delete m[tp+ 'Id'];
    };
    //全文检索选择事件
    $scope.addData2List = function(data, type){
        if(!$scope.data) $scope.data = {};
        if(!$scope.data[type])  $scope.data[type] = [];
        console.log(data);
        var material = new Object();
        if(data.hasOwnProperty("songId")){
            material.songId = data.songId;
            material.songName = data.songName;
        } else if (data.hasOwnProperty("albumId")){
            material.albumId = data.albumId;
            material.albumName = data.albumName;
        } else if (data.hasOwnProperty("artistId")){
            material.similarArtistId = data.artistId;
            material.artistName = data.artistName;
        }
        $scope.data[type].push(material);
        //$scope.representSongs = "";
    };
    //删除某个相似艺人
    $scope.removeSimilarArtist = function(artist, artists){
        artists.remove(artist);
    };
    $scope.goBack = function(type,id){  //返回按钮
        if(checkEmpty($stateParams.artistId)){
            window.open(returnLastPage($stateParams.lastPage),'_self');
        }else{
            $http.jsonp(http_url+'/edit/rollback/'+type+'/'+id+'.json?'+CALLBACK).success(function(res){
                if(res.status == 1){
                    window.open(returnLastPage($stateParams.lastPage), '_self');
                }
                console.log(res);
            }).error(function(res){
                sweetAlertCommon(SweetAlert,'请求异常','error');
            });
        }
    };
    $scope.sonStyleList = [];
    $scope.getCStyle = function(tp,property){   //获取子风格和其他子风格
        var ids = [];
        var tps = tp.split(',');
        for(var i in $scope.taggingData.tags){
            for(var j in tps){
                if($scope.taggingData.tags[i].type == tps[j]){ //只获取主风格的子风格
                    ids.push($scope.taggingData.tags[i].tagId);
                }
            }

        }
        if(ids.length > 0){
            $http.get(tag_tree_url+'getArtisteBySonStyleListAndTag.do?'+'data='+ids.join(',')).success(function(res){
                $scope[property] = res[property];
                console.log($scope[property]);
            })
        }
    };
    function returnChildrenTags(tagList,tagName){
        for(var i = 0; i < tagList.length; i++){
            if(tagList[i].tagName == tagName){
                return tagList[i].tagList;
            }
        }
    }
    $scope.removeTagging = function(t,songList,type){
        console.log($scope.sonStyleList);
        for(var i in $scope.taggingData.tags){
            if($scope.taggingData.tags[i].tagId == t.tagId){
                $scope.taggingData.tags.del(i);
                $scope.artistTags.del(i);
            }
        }
        if(!checkEmpty(songList)){
            var tempTaggingData = [];
            var tempArtistTags = [];
            var type_list = type.split(',');
            for(var i = 0; i < $scope.taggingData.tags.length; i++){
                var childrenTags = returnChildrenTags(songList, t.tagName);
                for(var j = 0; j < childrenTags.length;j++){
                    if($scope.taggingData.tags[i].tagId == childrenTags[j].tagId){
                        for(var m=0; m < type_list.length; m++){
                            if($scope.taggingData.tags[i].type == type_list[m]){
                                tempTaggingData.push($scope.taggingData.tags[i]);
                                tempArtistTags.push($scope.artistTags[i]);
                            }
                        }
                    }
                }
            }
            $scope.taggingData.tags =  $scope.taggingData.tags.filter(function(el){
                return tempTaggingData.indexOf(el) < 0;
            })
            $scope.artistTags =  $scope.artistTags.filter(function(el){
                return tempArtistTags.indexOf(el) < 0;
            })
        }
        console.log($scope.taggingData.tags);
        console.log($scope.artistTags);
    };
    $scope.changeTemplate = function(tp){
        sweetAlertConfirm(SweetAlert,function(){
            $state.go('artistEdit',{tp:tp});
            sweetAlertCommon(SweetAlert,'操作成功','success');
        },'warning',undefined,'更换模板将丢失部分数据');
    };

    $scope.gotoAnchor = function(id) {
        // set the location.hash to the id of
        // the element you wish to scroll to.
        $location.hash(id);
        // call $anchorScroll()
        $anchorScroll();
    };
    $scope.uploadImg = function(id){
        id = $scope.data ? $scope.data.artistId : undefined;
        uploadImg(id,'artist',$scope,$http,SweetAlert);
    };
    $scope.deleteImg = function () {
        deleteImg($scope,SweetAlert);

    };
    $scope.select = function(date){
        console.log(date);
    };
    $scope.inputChange = function (birth) {     //监听生日输入框值变化
        console.log(birth);
        if(birth != undefined){
            if(birth.length == 5){
                //var date = formatDate(birth,$filter);
                var month = birth.substring(0,2);
                var day = birth.substring(3,birth.length);
                $scope.data.constellation = (getAstro(month,day) + '座');
                // $scope.data.birth = month + '-' + day;
                console.log(getAstro(month,day));
                // console.log($scope.data.birth);
            }else{
                //var date = formatDate(birth,$filter);
                var year = birth.substring(0,4);
                var month = birth.substring(5,7);
                var day = birth.substring(8,birth.length);
                console.log('month'+month);
                console.log('day'+day);
                if((month.indexOf('_') == -1) && (day.indexOf('_') == -1))  $scope.data.constellation = (getAstro(month,day) + '座');
                if(year.indexOf('_') == -1) $scope.data.zodiac = getpet(year,$filter,$http);
                // $scope.data.birth = year+ '-'+ month + '-' + day;
                // console.log(year+ '--'+ month + '--' + day);
                console.log(getpet(year, $filter, $http));
                console.log(getAstro(month,day));
                // console.log($scope.data.birth);
            }
        }
    };
    $scope.deathChange = function(date){    //监听逝世日期值变化
        if(date != undefined){
            if(date.length == 4){
                var month = date.substring(0,2);
                var day = date.substring(2,birth.length);
                $scope.data.deathdate = month + '-' + day;
            }else{
                var year = date.substring(0,4);
                var month = date.substring(4,6);
                var day = date.substring(6,birth.length);
                $scope.data.deathdate = year+ '-'+ month + '-' + day;
            }
        }
    };
    $scope.numChange = function(data,property){      //监听身高等值变化
        if(data != undefined && data.length == 4){
            var be = data.substring(0,3);
            var ba = data.substring(3,data.length);
            $scope.data[property] = be + '.' + ba;
        }
    };
    $scope.deleteSex = function(sex){
        $scope.data.sex = '';
        //deleteProperty($scope.data,sex);
        console.log($scope.data.sex);
        console.log(sex);
    };
    $scope.scoreChange = function(s,property){ //评分变化
        watchScore(s,property);
    };
    loadMoreRecord('artist',$scope,$stateParams,$http,SweetAlert);
}]);
angular.module('app.routes').controller('ArtistCheckController', ['$scope', '$stateParams', '$http', '$cookies','$sce','SweetAlert',function($scope, $stateParams, $http, $cookies,$sce,SweetAlert){
    $scope.check = true;
    $scope.ckTagError = {};
    getLastExamine($stateParams.artistId, $scope);
    $scope.catalogs = [{'name':'概述','id':'catalog-1'},{'name':'基础信息','id':'catalog-2'},{'name':'主要作品','id':'catalog-3'},{'name':'艺人风格','id':'catalog-4'},{'name':'艺人经历','id':'catalog-5'}];
    getDataInfo('artist',$http,$scope,$sce,$stateParams);//获取数据信息
    getOpRecord('artist',$stateParams.artistId,1,1,$http,$scope);
    getCheckRecod('artist',$stateParams.artistId,1,$http,$scope);
    getExamineList('artist',1,$http,$scope,$stateParams,SweetAlert);
    var artistTagUrl = tag_edit_new_query + 'artist/' + $stateParams.artistId + '.json?' + CALLBACK;
    $http.jsonp(artistTagUrl).success(function(res3){
        $scope.artistTags = res3.data.tags;
    });

    //抽查提交按钮
    $scope.checkMaterial = function(ckResult, ckSuggest, ckTagError){
        checkCommon('artist',ckResult,ckSuggest,ckTagError,$http,$stateParams,SweetAlert);
    };
    //返回按钮
    $scope.goBack = function(){ //返回按钮
        window.open(returnLastPage($stateParams.lastPage), '_self');
    };
    loadMoreRecord('artist',$scope,$stateParams,$http,SweetAlert);
}]);
//地区标签id
var _location_tids = [1002598738,1002598742,1002598740,1000001600,1000001777];
var _neidi = '1002598738';
var _taiwan = '1002598742';
var _hongkong = '1002598740';
var _rihan = '1002598743';
var _oumei = '';

/**
 * 删除一个对象中的不需要的属性，只保留需要的属性
 *
 */
function keepObjectProperty(keepPropertyArr, data){
    var tempData = data;
    //遍历tempData的属性，如果某个属性不在需要保留的属性数组里面，就删除这个属性
    for(var property in tempData){
        if(keepPropertyArr.indexOf(property) == -1){
            delete  tempData[property];
        }else if(tempData[property] instanceof Array){  //如果数组里面的对象为空，则删除该对象
            var tempArr = [];
            for(var i = 0; i < tempData[property].length; i ++){
                if(!checkEmpty(tempData[property][i])){
                    tempArr.push(tempData[property][i]);
                }
            }
            tempData[property] = tempArr;
        }
    }
    return tempData;
}

function editJump($http,type,data,$state,SweetAlert,flag, $stateParams){  //跳转编辑页面
    if(!flag)   flag = '_blank';
    var url = http_url + '/edit/' + type + '/'+ data[type + 'Id'] + '.json';
    if(data.taskId != undefined){
        url += '?taskId=' + data.taskId;
    }
    jQuery.ajax({
        url: url ,
        beforeSend: function(request) {
            request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
        },
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "json",  // not "json" we'll parse
        contentType: "application/json; charset=utf-8",
        success: function(res) {
            if(res.status != 1){
                sweetAlertCommon(SweetAlert,res.msg,'error');
                return;
            } else {
                var param = {};
                param[type+'Id'] = data[type + 'Id'];
                param['auth'] = res.data.auth;
                param['lastPage'] = $stateParams.lastPage ? $stateParams.lastPage : returnLastPageTime();
                if(data.taskId != undefined){
                    param['taskId'] = data.taskId;
                }
                var url = $state.href(type+'Edit',param);
                window.open(url, flag);
                // window.open(url);
            }
        },
        error: function (res) {
            sweetAlertCommon(SweetAlert,'请求异常','error');
        }
    });
}

function addToCheckTask($http, type, ids, SweetAlert, $uibModalInstance){
    if(ids.length == 0) return sweetAlertCommon(SweetAlert,'请选择添加数据','warning');
    var data = {type: type, ids: stringToArray(ids)};
    $http.jsonp(check_sync_add + "?" + CALLBACK + "&data=" + JSON.stringify(data)).success(function(res){
        var message = "成功" + res.successCount + "条,失败" + res.failCount + "条";
        sweetAlertCommon(SweetAlert,message,'success');
        if($uibModalInstance) $uibModalInstance.dismiss('cancel');
    });

}
function watchSourceImg(){
    var _url = $('.lb-image').attr('src');
    _url = _url.substring(0, _url.indexOf('?'));
    $('.lb-image').attr('src',_url);
    $('.lb-image').css({width: 'auto',height: 'auto'});
}
