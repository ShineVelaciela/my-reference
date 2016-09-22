/**
 * Created by hao.cheng on 2015/12/1.
 * top-controller
 */
angular
    .module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.song-lack',{//缺歌页面
            url: '/songLack',
            title: '缺歌对标',
            templateUrl: 'app/views/top/top-song-lack.html',
            controller: 'SongLackController'
        })
        .state('app.song-lack.search',{ //查询
            url:'/search?:songName&:singerName&:copyfName&:lange&:oneStatus&:twoStatus&:qgType&:stdbDate&:enddbDate&:firstIndex&:pageNo&:pageSize',
            title: '缺歌对标',
            views:{
                'song_lack_list':{
                    templateUrl: 'app/views/top/top-song-lack-list.html',
                    controller: 'SongLackSearchController'
                }
            }
        })
}]);
angular.module('app.routes').controller('SongLackController', ['$scope','$http','permissions','$cookies','SweetAlert',function($scope,$http,permissions,$cookies,SweetAlert){
    $scope.params = {};
    $scope.reset = function(){//重置按钮
        $scope.params = {};
        //location.reload();
    }
    $scope.downloadModel = function(){//下载模板
        window.open(song_lack_model);
    }
    $scope.export = function(params){
        //$scope.params == false;
        //if(isEmpty($scope.params)){
        //    alert('请先查询数据');
        //}else{
        //    location.href = song_lack_export + '?data=' + JSON.stringify($scope.params);
        //}
        console.log(params);
        location.href = song_lack_export + '?data=' + JSON.stringify(params);
    }
    $scope.del = function(){
        if(permissions.choseArr == undefined || permissions.choseArr.length < 1){
            sweetAlertCommon(SweetAlert,'请选择要删除的数据','warning');
            return;
        }
        $http.jsonp(song_lack_del + '?callback=JSON_CALLBACK&ids=' +
            permissions.choseArr.join(',') + '&uid=' + $cookies.kuid + '&uname=' +_session.name).success(function(res){
            if(res.returnCode == '000000'){
                sweetAlertCommon(SweetAlert,'删除成功','success');
                location.reload();
            }else{
                sweetAlertCommon(SweetAlert,'删除失败','error');
            }
        })
    }
}]);
angular.module('app.routes').controller('SongLackSearchController', ['$scope','$http','$filter','$stateParams','permissions','$state', function($scope,$http,$filter,$stateParams,permissions,$state){
    $scope.maxSize = 5;
    $scope.itemsPerPage = checkEmpty($stateParams.pageSize)?20:$stateParams.pageSize;
    $scope.bigCurrentPage = 1;
    if($stateParams.songName != undefined && $stateParams.songName != '')
        $scope.params.songName = $stateParams.songName;
    if($stateParams.singerName != undefined && $stateParams.singerName != '')
        $scope.params.singerName = $stateParams.singerName;
    if($stateParams.copyfName != undefined && $stateParams.copyfName != '')
        $scope.params.copyfName = $stateParams.copyfName;
    if($stateParams.lange != undefined && $stateParams.lange != '')
        $scope.params.lange = $stateParams.lange;
    if($stateParams.oneStatus != undefined && $stateParams.oneStatus != '')
        $scope.params.oneStatus = $stateParams.oneStatus;
    if($stateParams.twoStatus != undefined && $stateParams.twoStatus != '')
        $scope.params.twoStatus = $stateParams.twoStatus;
    if($stateParams.qgType != undefined && $stateParams.qgType != '')
        $scope.params.qgType = $stateParams.qgType;
    if($scope.params.enddbDate != undefined && $scope.params.enddbDate != '')
        $scope.params.enddbDate = formatDate($scope.params.enddbDate,$filter);
    if($scope.params.stdbDate != undefined && $scope.params.stdbDate != '')
        $scope.params.stdbDate = formatDate($scope.params.stdbDate,$filter);
    if($stateParams.firstIndex == undefined || $stateParams.firstIndex == '')
        $stateParams.firstIndex = 0;
    if($stateParams.pageNo != undefined && $stateParams.pageNo != '') $stateParams.firstIndex = ($stateParams.pageNo - 1) * 20;
    console.log($scope.params);
    $http.jsonp(song_lack_search + '?callback=JSON_CALLBACK&data=' + JSON.stringify($scope.params) + '&firstIndex=' + $stateParams.firstIndex+'&maxResult='+$scope.itemsPerPage).success(function(res){//获取缺歌列表
        $scope.datas = res.list;
        paginationDiscreteness($scope,5,$scope.itemsPerPage,res.totalRecord,Math.ceil($scope.totalRecord/ $scope.itemsPerPage),$stateParams.firstIndex / 20 + 1);
        $scope.totalRecord = res.totalRecord;
        $scope.maxResult = res.maxResult;
        $scope.bigTotalItems = res.totalRecord;
        $scope.bigCurrentPage = $stateParams.firstIndex / 20 + 1;
        $scope.totalPage = Math.ceil($scope.totalRecord/ $scope.itemsPerPage);
        console.log(Math.ceil($scope.bigTotalItems/ $scope.itemsPerPage));
    });
    var str = "";
    var flag = '';
    $scope.chk = function(data, checkb){//复选框的单个选择
        if(flag == 'a'){//在全选的基础上操作
            str = $scope.choseArr.join(',') + ',';
        }
        if(checkb != true){//选中
            str = str + data.id + ',';
            data.isCheck = true;
        } else {
            str = str.replace(data.id + ',', '');//取消选中
            data.isCheck = false;
        }
        if(str.length = 0){
            permissions.choseArr = [];
        } else {
            permissions.choseArr = (str.substr(0,str.length-1)).split(',');
        }
        console.log(permissions.choseArr);
    }
    $scope.checkAll = function(all, datas){//复选框的全选
        if(all==true){
            $scope.allIsCheck = true;
            permissions.choseArr = [];
            for(var i=0; i < datas.length; i++){
                var data = datas[i];
                permissions.choseArr.push(data.id + "");
                data.isCheck = true;
            }
            str = permissions.choseArr.join(',') + ',';
            flag = 'a';
        }else{
            $scope.allIsCheck = false;
            permissions.choseArr=[];
            for(var i=0; i < datas.length; i++){
                data = datas[i];
                data.isCheck = false;
            }
            str = "";
            flag = '';
        }
        console.log(permissions.choseArr);
    };
    $scope.choosePage = function(){
        //console.log($scope.bigCurrentPage);
        $scope.firstIndex = ($scope.bigCurrentPage - 1) * 20;
        //console.log(firstIndex);
        $http.jsonp(song_lack_search + '?callback=JSON_CALLBACK&data=' + JSON.stringify($scope.params) + '&firstIndex=' + $scope.firstIndex ).success(function(res){//获取缺歌列表
            $scope.datas = res.list;
            $scope.totalRecord = res.totalRecord;
            $scope.maxResult = res.maxResult;
            $scope.totalPage = Math.ceil($scope.totalRecord/ $scope.itemsPerPage);
            //var param = { firstIndex:$scope.firstIndex};
            //$scope.bigCurrentPage = $stateParams.firstIndex / 20;
            $state.go('song_lack.search',{ firstIndex:$scope.firstIndex});
        });
    }
}]);
angular.module('app.routes').controller('ImportCtrl_lack',['$scope','$uibModalInstance','$http','user','SweetAlert',function($scope,$uibModalInstance,$http,user,SweetAlert){ //导入excel页面操作
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        var filename = $('#excelFile').val();
        var mime = filename.toLowerCase().substr(filename.lastIndexOf("."));
        if(mime != '.xls'){
            $scope.error = '请转换.xls的03版本';
            return;
        }
        if(filename == ''){
            $scope.error = '请选择上传的excel文件';
        }else{
            $scope.error= '';
            $.ajaxFileUpload({
                url: song_lack_import,
                type: 'post',
                secureuri: false, //一般设置为false
                fileElementId: 'excelFile', // 上传文件的id、name属性名
                dataType: 'json', //返回值类型，一般设置为json、application/json
                data: {'uname':user.name,'uid':user.id},
                success: function(data){
                    if(data.returnCode == '000000'){
                        sweetAlertCommon(SweetAlert,'导入成功','success');
                        location.reload();
                    }else if(data.returnCode == '000004'){
                        sweetAlertCommon(SweetAlert,'导入数据全重复，导入失败','error');
                    }else{
                        sweetAlertCommon(SweetAlert,'导入失败','error');
                    }
                }
            });
            $uibModalInstance.dismiss('cancel');
        }
    }
}]);
angular.module('app.routes').run(function($http,$cookies){
    getUser($http,$cookies);
});
var _session = {};
function getUser($http,$cookies,method){   //获取用户信息
    $http.get(git_user_single + $cookies.get('kpk')).success(function(data){
        _session = data;
        if(method != undefined){
            method(data);
        }
    });
}
angular.module('app.routes').controller('EditCtrl',['$scope','$uibModalInstance','$http','data','user','$filter','SweetAlert',function($scope,$uibModalInstance,$http,data,user,$filter,SweetAlert){
    $scope.song = data;
    $scope.cancel = function () {//取消按钮
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(song){//确认按钮
        if(song.scanner){
            song.scanner = 0;
        }else{
            song.scanner = 1;
        }
        song.dbDate = formatDate(song.dbDate,$filter);
        console.log(song);
        $http.jsonp(song_lack_edit + '?callback=JSON_CALLBACK&data=' +
            JSON.stringify(song) + '&uid=' + user.id + '&uname=' + user.name).success(function(res){
            if(res.returnCode == '000000'){
                $uibModalInstance.dismiss('cancel');
                sweetAlertCommon(SweetAlert,'编辑成功','success');
            }else{
                $scope.error = '编辑失败'
            }
        })
    }
}]);


