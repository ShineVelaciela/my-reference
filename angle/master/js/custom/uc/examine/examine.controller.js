/**
 * Created by kiraCheng on 2016/3/14.
 */
angular.module('app.routes').config(['$urlMatcherFactoryProvider', function($urlMatcherFactory) {

    $urlMatcherFactory.type('CoolParam',
        {
            name : 'CoolParam',
            decode: function(val)  { return typeof(val) ==="string" ? JSON.parse(val) : val;},
            encode: function(val)  { return JSON.stringify(val); },
            equals: function(a, b) { return this.is(a) && this.is(b)
                && a.status === b.status && a.type == b.type },
            is: function(val)      { return angular.isObject(val)
                && "status" in val && "type" in val },
        })

}]);
angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.examine',{
            url: '/examine',
            title: '审核管理',
            templateUrl: 'app/views/uc/examine/examine.html',
            controller: 'ExamineHeadController'
        })
        .state('app.examine.1',{
            url: '/:type/song?:tagIds&:copyrightId&:songIds&:songName&:albumName&:artistName&:degree&:newSong&:uid&:startTime&:pageNo&:pageSize&:endTime&:{orderBys:json}&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:projectName&:urgentDegree&:distributionStartTime&:distributionEndTime&:lastEditSearch',
            title: '歌曲审核',
            views:{
                'data-list':{
                    templateUrl: 'app/views/uc/examine/data_song.html',
                    controller: 'ExamineController'
                }
            }
        })
        .state('app.examine.2',{
            url: '/:type/album?:albumIds&:artistName&:albumName&:uid&:startTime&:endTime&:pageNo&:pageSize&:{orderBys:json}&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:tagBeans&:lastEditSearch&:style',
            title: '专辑审核',
            views:{
                'data-list':{
                    templateUrl: 'app/views/uc/examine/data_album.html',
                    controller: 'ExamineController'
                }
            }
        })
        .state('app.examine.3',{
            url: '/:type/artist?:artistIds&:artistName&:uid&:startTime&:endTime&:pageNo&:pageSize&:{orderBys:json}&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:tagBeans&:lastEditSearch&:style',
            title: '艺人审核',
            views:{
                'data-list':{
                    templateUrl: 'app/views/uc/examine/data_artist.html',
                    controller: 'ExamineController'
                }
            }
        })
        .state('app.examine.4',{
            url: '/:type/tag?:tagIds&:copyrightId&:songIds&:songName&:albumName&:artistName&:tagStartTime&:tagEndTime&:degree&:newSong&:uid&:startTime&:pageNo&:pageSize&:endTime&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:projectName&:urgentDegree&:lastEditSearch&:{orderBys:json}',
            title: '标签审核',
            views:{
                'data-list':{
                    templateUrl: 'app/views/uc/examine/data_song.html',
                    controller: 'ExamineTagController'
                }
            }
        })
        .state('app.examine.5',{
            url: '/:type/tongji?:songName&:artistName',
            title: '统计审核',
            views:{
                'data-list':{
                    templateUrl: 'app/views/uc/examine/data_tongji.html',
                    controller: 'ExamineController'
                }
            }
        })
}]);
angular.module('app.routes').controller('ExamineHeadController', ['$scope','$http','$state',function($scope,$http,$state){
    $scope.form = {},$scope.form.tagBeans = [],$scope.form.searchTag = [];
    $scope.tabs = [{"name":"歌曲","type":"1"},{"name":"专辑","type":"2"},{"name":"艺人","type":"3"},{"name":"标签","type":"4"},{"name":"统计","type":"5"}];
    //打开日期框
    $scope.open = function(flag) {
        $scope.dateStatus["opened" + flag] = true;
    };
    $scope.dateStatus = {
        opened1: false,
        opened2: false,
        opened3: false,
        opened4: false,
        opened5: false,
        opened6: false
    };
    $scope.changeTagType = function (type) {
        for(var i = 0; i < $scope.form.tagBeans.length; i++){
            if(!checkEmpty($scope.form.tagBeans[i].type)){
                $scope.form.tagBeans[i].type = type;
            }
        }
    };
    $scope.submit = function () {   //查询按钮
        var params = $scope.form;
        if(isPropertyEmpty(params.lastEditSearch)){
            params.uid = "";
        }
        if(!isPropertyEmpty(params.searchTag)){
            var tagIds = '';
            for(var i = 0; i < params.searchTag.length; i++){
                tagIds += params.searchTag[i].id + ',';
            }
            if(params.searchTag.length != 0){
                tagIds = tagIds.substr(0, tagIds.length - 1);
            }
            params.tagIds = tagIds;
        }
        if(!checkEmpty(params.tagBeans))
            params.tagBeans = angular.toJson(params.tagBeans);
        params.pageNo = 1,params.pageSize = 50,params.type = $scope.type;
        $state.go('app.examine.'+$scope.type,params,{reload: true, inherit: false});
    };
}]);
angular.module('app.routes').controller('ExamineController',['$stateParams','$scope','$cookies','$http','$filter','$state','SweetAlert', 'BaseService',function($stateParams,$scope,$cookies,$http,$filter,$state,SweetAlert, BaseService){
    $scope.$parent.types = $scope.types = ['song','album','artist','tag'];
    $scope.$parent.type = $stateParams.type;

    getExamineData($scope.types[$stateParams.type-1],$scope,$stateParams,$http,$filter);
    setParentValue($scope,$stateParams,$http,$cookies,$scope.types[$stateParams.type-1],$filter, BaseService);

    $scope.choosePage = function(){
        choosePageCommon($scope,$state,'app.examine.'+$stateParams.type)
    };
    $scope.examineJump = function(data,tp, flag){ //跳转审核界面
        examineJumpNew(tp,data,$state,SweetAlert, flag);
    };
    $scope.infoJump = function(type,data){ //跳转详情界面
        openNewTab(type,data,'Info',$state);
    };
    $scope.search = function(songName,artistName){  //搜字搜索
        var url = $state.href('app.song',{'songKeyword':songName,'artistKeyword':artistName});
        window.open(url,'_blank');
    };
    /*标签搜索操作*/
    getTagList(4 - new Number($stateParams.type),$scope.$parent,$stateParams,$http,$cookies,SweetAlert,1);
    
}]);
angular.module('app.routes').controller('BatchModalCtrl',['$uibModalInstance','$scope','$stateParams','datas','form','types','ExamineService','SweetAlert',function ($uibModalInstance,$scope,$stateParams,datas,form,types,ExamineService,SweetAlert) {
    $scope.batch = {};
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
        var data = {type: types[$stateParams.type-1]};
        if($stateParams.type == '4') data.type = 'songTag';
        if(checkEmpty(datas))
            return $scope.error = '暂无审核的数据';
        if(checkEmpty($scope.batch.type))
            return $scope.error = '请选择审核操作类型';
        if(checkEmpty($scope.batch.pass))
            return $scope.error = '请选择审核通过或不通过';
        data.status = $scope.batch.pass;
        data.searchParams = {};
        switch($scope.batch.type){
            case '1':
                var ids = [];
                datas.forEach(function (val) {
                    if(val.isCheck) ids.push(val[types[$stateParams.type-1]+'Id']);
                });
                if(ids.length == 0){
                    return $scope.error = '请选择需要审核的数据';
                }
                data.searchParams[types[$stateParams.type-1]+'Ids'] = ids;
                break;
            case '2':
                if(checkEmpty($scope.batch.startNo) || checkEmpty($scope.batch.endNo)) return $scope.error = '请填写完整的序号起止数目';
                // data.searchParams = cloneOneObject(form);
                data.searchParams = excludeProperties(form,['pageSize','pageNo','type']);
                data.searchParams.startNo = $scope.batch.startNo - 1,data.searchParams.endNo = $scope.batch.endNo - 1;
                break;
            case '3':
                if(checkEmpty($scope.batch.pageStart) || checkEmpty($scope.batch.pageEnd)) return $scope.error = '请填写完整的起止页数';
                // data.searchParams = cloneOneObject(form);
                data.searchParams = excludeProperties(form,['pageSize','pageNo','type']);
                data.searchParams.startNo = ($scope.batch.pageStart - 1) * form.pageSize;
                data.searchParams.endNo = ($scope.batch.pageEnd) * form.pageSize - 1;
                break;
        }
        data.searchParams.taskStatus = 0;
        console.log(data);
        $scope.error = '';
        var promise = ExamineService.service.batchExamine(JSON.stringify(data));
        promise.then(function (res) {
            if(res.status == 1) sweetAlertCall(SweetAlert,res.msg,'success',null,function () {
                location.reload();
            }),$uibModalInstance.dismiss('cancel');
            else sweetAlertCommon(SweetAlert,res.msg,'error');
        });

    };
}]);
angular.module('app.routes').controller('ExamineTagController', ['$stateParams','$scope','$cookies','$filter','$http','$timeout','$rootScope','display','$state','$location','SweetAlert', 'BaseService',function($stateParams,$scope,$cookies,$filter,$http,$timeout,$rootScope,display,$state,$location,SweetAlert, BaseService){
    $scope.$parent.types = $scope.types = ['song','album','artist','song'];
    setParentValue($scope,$stateParams,$http,$cookies,'tag',$filter, BaseService);
    getExamineData('songTag',$scope,$stateParams,$http,$filter);
    $scope.choosePage = function(){
        choosePageCommon($scope,$state,'app.examine.4')
    };
    $scope.examineJump = function(data,tp, flag){ //跳转审核界面
        examineJumpNew(tp,data,$state,SweetAlert, flag);
    };
    /*标签搜索操作*/
    getTagList("3",$scope.$parent,$stateParams,$http,$cookies,SweetAlert,1);
}]);
function setParentValue($scope,$stateParams,$http,$cookies,tp,$filter, BaseService){    //设置父元素作用域对象，tp:父元素对象类型
    if(!isPropertyEmpty($stateParams.tagBeans)) $stateParams.tagBeans = JSON.parse($stateParams.tagBeans);
    $scope.$parent.type = $stateParams.type;
    $scope.$parent['form'] = iteratorStateParam($stateParams,$filter);
    if(!isPropertyEmpty($stateParams.tagIds)){
        BaseService.service.getTagTree(3, 3).then(function (res) {
            for(var i = 0; i < $stateParams.tagIds.split(',').length; i++){
                //遍历获取到的标签树获得标签ID对应的标签
                var tag = getTagById($stateParams.tagIds.split(',')[i], res.tnList);
                if(tag != undefined){
                    if(checkEmpty($scope.form.searchTag)) $scope.form.searchTag = [];
                    $scope.form.searchTag.push(tag);
                }
            }
        });
    }
};
function getExamineData(tp,$scope,$stateParams,$http,$filter){    //获取审核数据列表，tp数据类型
    $scope.$parent.datas = [];      //清空数据
    //var examine_search = 'http://temp.karakal.com.cn:18089/new/mzk-search/1/search/audit/';
    if(checkEmpty($stateParams.pageSize)) $stateParams.pageSize = 50;
    var param = deleteProperty(iteratorStateParam($stateParams,$filter,tp+'Ids'),'type');    //根据需求获取参数所转换对象
    if(tp == 'songTag'){
        param.songIds = stringToArray(param.songIds);   //标签审核参数特殊处理：将数字字符串转成数组
    }
    if(!isPropertyEmpty($stateParams.tagIds)) param.tags = stringToArray($stateParams.tagIds);
    if(!isPropertyEmpty($stateParams.tagBeans)) param.tagBeans = JSON.parse($stateParams.tagBeans);
    param.taskStatus = 0;
    $http.jsonp(examine_search + tp + '.json' + '?data=' + JSON.stringify(param) + '&' + CALLBACK).success(function (res) {
        // $scope.datas = res.data.list;
        $scope.$parent.datas = res.data.list;
    });
    param.isQueryCount = 1;        //异步分页
    $http.jsonp(examine_search + tp + '.json' + '?data=' + JSON.stringify(param) + '&' + CALLBACK).success(function (res) {
        paginationDiscreteness($scope,5,res.data.pageSize,res.data.totalCount,res.data.pageTotal,res.data.pageNo);
    });
}

function examineJumpNew(tp,data,$state,SweetAlert, flag){
    var rtp = tp;
    if(tp == 'songTag'){
        rtp = 'song';
    };
    jQuery.ajax({
        url: http_url+'/auditing/'+tp+'/'+data.taskId+'.json?'+'rid='+data[rtp+'Id'] ,
        beforeSend: function(request) {
            request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
        },
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "json",  // not "json" we'll parse
        contentType: "application/json; charset=utf-8",
        success: function(res) {
            console.log(rtp);
            if(res.status != 1){
                //alertTipCommon($timeout,$rootScope,res.msg,display);
                sweetAlertCommon(SweetAlert,res.msg,'warning');
                return;
            }
            var params = {returnBtn: true};
            params[rtp+'Id'] = data[rtp + 'Id'];
            params.taskId = data.taskId;
            params.lastPage = returnLastPageTime();
            var url = $state.href(tp + 'Examine', params);
            if(tp == 'songTag'){
                url = $state.href('material.taggingExamine', params);
            }
            if(flag) window.open(url , flag);
            else window.open(url, '','left=0,top=0,location=0,status=0,width=1000,height=600,toolbar=yes,menubar=yes');
            //window.open('/mls/resources/pages/top/index.html#/'+tp+'Examine?'+tp+'Id=' + data[tp+'Id'] + '&taskId=' + data.taskId + '&lastPage=' + returnLastPageTime(), '_blank');
        },
        error: function (res) {
            console.log(res);
        }
    });
}
function examineJump(tp,data,$state,$timeout,$rootScope,display){     //检测状态后跳转审核界面
    jQuery.ajax({
        url: http_url+'/auditing/'+tp+'/'+data.taskId+'.json?'+'rid='+data[tp+'Id'] ,
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "jsonp",  // not "json" we'll parse
        jsonp: CALLBACK,
        contentType: "application/jsonp; charset=utf-8",
        success: function(res) {
            if(res.status != 1){
                alertTipCommon($timeout,$rootScope,res.msg,display);
                return;
            }
            //var url = $state.href(tp+'Examine',{artistId:data[tp+'Id'],taskId:data.taskId});
            //if(tp == 'artist'){
            window.open('/mls/resources/pages/top/index.html#/'+tp+'Examine?'+tp+'Id=' + data[tp+'Id'] + '&taskId=' + data.taskId + '&lastPage={"url":"' + encodeURIComponent(document.location.href)+'"}', '_blank');
            //} else {
            //    window.open(url, '_blank');
            //}
        },
        error: function (res) {
            console.log(res);
        }
    });
}


