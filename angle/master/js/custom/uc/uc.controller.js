/**
 * Created by hao.cheng on 2015/11/10.
 * user_center_controller
 */
angular.module('app.routes').config(['$stateProvider',function($stateProvider){
    $stateProvider
        .state('app.uc',{
            url: '/uc',
            templateUrl: 'app/views/uc/uc.html',
            title: '项目中心'
        })
        .state('app.uc.cp',{//创建的项目
            url: '/cp',
            title: '项目中心-创建项目',
            views : {
                "pro_list":{
                    templateUrl: 'app/views/uc/uc_pro_cp.html',
                    controller: 'UcCpController'
                }
            }
        })
        .state('app.uc.fz',{//负责的项目
            url: '/fz',
            title: '项目中心-负责项目',
            views : {
                "pro_list": {
                    templateUrl: 'app/views/uc/uc_pro_fz.html',
                    controller: 'UcFzController'
                }
            }
        })
        .state('app.uc.cy',{//参与的项目
            url: '/cy',
            title: '项目中心-参与项目',
            views : {
                "pro_list": {
                    templateUrl: 'app/views/uc/uc_pro_cy.html',
                    controller: 'UcCyController'
                }
            }
        })
        .state('app.uc_atask',{
            url: '/uc_atask?:pId&:status',
            templateUrl: 'app/views/uc/uc_task.html',
            controller: 'UcAtaskController'
        })
        .state('app.uc_mtask',{
            url: '/uc_mtask?:pId&:uId',
            templateUrl: 'app/views/uc/uc_mtask.html',
            controller: 'UcMtaskController'
        })
        .state('app.uc_pdetail',{   //项目详情页面
            url: '/uc_pdetail?:pId',
            templateUrl: 'app/views/uc/uc_pro_detail.html',
            controller: 'UcDetailController'
        })
}]);
angular.module('app.routes').controller('UcCpController',['$scope','$http','$cookies',function($scope,$http,$cookies){
    $scope.user = _session;
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data={"uId":"'+$cookies.get("kuid")+'"}').success(function(res){    //所有项目
        $scope.projects = getData(res);
        $scope.totalRecord = res.totalRecord;
    });
}]);
angular.module('app.routes').controller('UcFzController',['$scope','$http','$cookies',function($scope,$http,$cookies){
    if(isEmpty(_session)){
        getUser($http,$cookies,function(data){
            $scope.user = data;
        });
    } else {
        $scope.user = _session;
    }
    $scope.projects_fz = undefined;
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data={"fzr":"'+$cookies.get("kuid")+'"}').success(function(res){    //负责的项目
        $scope.projects_fz = getData(res);
        $scope.totalRecord = res.totalRecord;
    });
}]);
angular.module('app.routes').controller('UcCyController',['$scope','$http','$cookies',function($scope,$http,$cookies){
    //$scope.user = _session;
    if(isEmpty(_session)){
        getUser($http,$cookies,function(data){
            $scope.user = data;
        });
    } else {
        $scope.user = _session;
    }
    $scope.projects_fz = undefined;
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data={"fzr":"'+$cookies.get("kuid")+'"}').success(function(res){    //负责的项目
        $scope.projects_fz = getData(res);
        $scope.totalRecord = res.totalRecord;
        console.log($scope.projects_fz);
    });
    $scope.projects_cy = undefined;
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data={"cyr":"'+$cookies.get("kuid")+'"}').success(function(res){     //参与的项目
        $scope.projects_cy = getData(res);
        $scope.totalRecord = res.totalRecord;
        console.log($scope.projects_cy);
    });
}]);
angular.module('app.routes').controller('UcAtaskController',['$scope','$http','$stateParams',function($scope,$http,$stateParams){
    if($stateParams.status == 0){
        $scope.show = true;
    }else{
        $scope.show = false;
    }
    $scope.pro = $stateParams.pId;
    $scope.uId = _session.id;
    var param = {};
    param.pId = $stateParams.pId;
    //param.uId = -1;
    param.status = $stateParams.status;
    var p_param= {};
    p_param.id = $stateParams.pId;
    var p_type = '';
    //获取项目的流程
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data='+ JSON.stringify(p_param)).success(function(res){
        $scope.p_type = res.list[0].type;
        $scope.cyr_list = [];
        for(var i = 0; i < res.list[0].cyrList.length;i++){
            $scope.cyr_list.push(res.list[0].cyrList[i]);
        }
        for(var i = 0; i < res.list[0].fzrList.length;i ++){
            $scope.cyr_list.push(res.list[0].fzrList[i]);
        }
        //console.log($scope.cyr_list);
        p_type = $scope.p_type;
        if( $scope.p_type == 1){    //新歌流程
            reflectData('song','歌曲',$scope,$http,param)
        }
        if($scope.p_type == 3){ //艺人流程
            reflectData('artist','艺人',$scope,$http,param);
        }
        if($scope.p_type == 4){ //专辑流程
            reflectData('album','专辑',$scope,$http,param);
        }
        if($scope.p_type == 5){ //歌曲流程
            reflectData('song','歌曲',$scope,$http,param);
        }
    });
    $scope.user = undefined;
    $scope.selectUser = function(v){
        $scope.user = {};
        $scope.user.name = v.name;
        $scope.user.id = v.uId;
    };
    $scope.removeUser = function(){ //去除分配人的方法
        console.log($scope.user);
        $scope.user = undefined;
    };
    $scope.selectCyr = function(v){ //select选择参与人分配任务的方法
        $scope.user = {};
        $scope.user.name = v.uName;
        $scope.user.id = v.uId;
        console.log(v);
    };
    //复选框的单个选择
    var str = "";
    var unstr = "";
    var flag = '';
    var choseArr = [];
    $scope.checkb = false;
    $scope.choseArr = [];
    $scope.unchoseArr = [];
    $scope.chk = function(data, checkb){
        if(flag == 'a'){//在全选的基础上操作
            str = $scope.choseArr.join(',') + ',';
        } else {
            if($scope.unchoseArr.length != 1 && $scope.unchoseArr[0] != ""){
                unstr = $scope.unchoseArr.join(',') + ',';
            }
        }
        if(checkb != true){//选中
            str = str + data.id + ',';
            unstr = unstr.replace(data.id + ',', '');
            data.isCheck = true;
        } else {
            str = str.replace(data.id + ',', '');//取消选中
            unstr = unstr + data.id + ',';
            data.isCheck = false;
        }
        if(str.length = 0){
            $scope.choseArr = [];
        } else {
            $scope.choseArr = (str.substr(0,str.length-1)).split(',');
        }
        if(unstr.length = 0){
            $scope.unchoseArr = [];
        } else {
            $scope.unchoseArr = (unstr.substr(0,unstr.length-1)).split(',');
        }
        $scope.unchoseArr = (unstr.substr(0,unstr.length-1)).split(',');
        console.log($scope.choseArr);
        console.log($scope.unchoseArr);
    };
    $scope.distributionTask = function(uId){
        if($scope.choseArr.length < 1){
            alert('请选择需要分配的数据');
            return;
        }
        $http.jsonp(uc_assign_t + '.json?callback=JSON_CALLBACK&pId=' + $stateParams.pId + '&uId=' + uId + '&tId=' + $scope.choseArr.join(',')).success(function(res){
            if(res.returnCode == '000000'){
                alert('分配成功',function(){
                    location.reload();
                });
            }else{
                alert('分配失败');
            }
        });
    };
    $scope.export = function(){ //导出数据
        console.log($scope.p_type);
        var type = '';
        if($scope.choseArr.length < 1){
            alert('请选择要导出的数据');
            return;
        }
        if($scope.p_type == 1)
            type = 'song';
        if($scope.p_type == 3)
            type = 'artist';
        if($scope.p_type == 4)
            type = 'album';
        if($scope.p_type == 5){
            type = 'song';
            console.log(type)
        }
        var url = '/mls/' + type + '/excel?ids=' +  $scope.choseArr.join(',');
        location.href = url;
    };
    //复选框的全选
    $scope.checkAll = function(all, datas){
        if(all==true){
            $scope.allIsCheck = true;
            $scope.choseArr = [];
            $scope.unchoseArr = [];
            for(var i=0; i < datas.length; i++){
                var data = datas[i];
                $scope.choseArr.push(data.id + "");
                data.isCheck = true;
            }
            str = $scope.choseArr.join(',') + ',';
            unstr = "";
//                                        $scope.choseArr = datas;
            flag = 'a';
//                                        console.log("选中的数据:" + $scope.choseArr);
        }else{
            $scope.allIsCheck = false;
            $scope.choseArr=[];
            for(var i=0; i < datas.length; i++){
                data = datas[i];
                $scope.unchoseArr.push(data.id + "");
                data.isCheck = false;
            }
            unstr = $scope.unchoseArr.join(',') + ',';
            str = "";
            flag = '';
//                                        console.log("未选中的数据" + $scope.unchoseArr);
        }
        console.log($scope.choseArr);
        console.log($scope.unchoseArr);

    }
}]);
angular.module('app.routes').controller('UcMtaskController',['$scope','$http','$stateParams',function($scope,$http,$stateParams){
    $scope.param = {};
    $scope.param.pId = $stateParams.pId;
    $scope.param.uId = $stateParams.uId;
    $scope.param.status = 1;
    var p_param= {};
    p_param.id = $stateParams.pId;
    var p_type = '';
    //获取项目的流程
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data='+ JSON.stringify(p_param)).success(function(res){
        $scope.p_type = res.list[0].type;
        p_type = $scope.p_type;
        if( $scope.p_type == 1){    //新歌流程
            reflectData('song','歌曲',$scope,$http,$scope.param)
        }
        if($scope.p_type == 3){ //艺人流程
            reflectData('artist','艺人',$scope,$http,$scope.param);
        }
        if($scope.p_type == 4){ //专辑流程
            reflectData('album','专辑',$scope,$http,$scope.param);
        }
        if($scope.p_type == 5){ //歌曲流程
            reflectData('song','歌曲',$scope,$http,$scope.param);
        }
    });
    //复选框的单个选择
    var str = "";
    var unstr = "";
    var flag = '';
    $scope.checkb = false;
    $scope.choseArr = [];
    $scope.unchoseArr = [];
    $scope.chk = function(data, checkb){
        if(flag == 'a'){//在全选的基础上操作
            str = $scope.choseArr.join(',') + ',';
        } else {
            if($scope.unchoseArr.length != 1 && $scope.unchoseArr[0] != ""){
                unstr = $scope.unchoseArr.join(',') + ',';
            }
        }
        if(checkb != true){//选中
            str = str + data.id + ',';
            unstr = unstr.replace(data.id + ',', '');
            data.isCheck = true;
        } else {
            str = str.replace(data.id + ',', '');//取消选中
            unstr = unstr + data.id + ',';
            data.isCheck = false;
        }
        if(str.length = 0){
            $scope.choseArr = [];
        } else {
            $scope.choseArr = (str.substr(0,str.length-1)).split(',');
        }
        if(unstr.length = 0){
            $scope.unchoseArr = [];
        } else {
            $scope.unchoseArr = (unstr.substr(0,unstr.length-1)).split(',');
        }
        $scope.unchoseArr = (unstr.substr(0,unstr.length-1)).split(',');
        console.log($scope.choseArr);
        //console.log($scope.unchoseArr);
    }
    $scope.jumpPage = function(data,pId,pType){
        if(data == undefined){
            alert('请选择要跳转的数据');
            return;
        }
        if(pType == 1){
            window.open('/mls/song/search?songId=' + data.join(',') + '&pId=' + $stateParams.pId);
        }
        if(pType == 3){
            window.open('/mls/artist?artistId=' + data.join(',')+ '&pId=' + $stateParams.pId)
        }
        if(pType == 4){
            window.open('/mls/song/search?albumId=' + data.join(',')+ '&pId=' + $stateParams.pId)
        }
        if(pType == 5){
            window.open('/mls/song/search?songId=' + data.join(',') + '&pId=' + $stateParams.pId);
        }
    };

}]);
angular.module('app.routes').controller('UcDetailController',['$http','$stateParams','$scope','$state','SweetAlert',function($http,$stateParams,$scope,$state,SweetAlert){
    console.log(_users);
    $scope.uid = JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid;
    var param = {};
    param.id = $stateParams.pId;
    $http.jsonp(uc_find_p+'.json?callback=JSON_CALLBACK&data='+ JSON.stringify(param)).success(function(res){
        $scope.data = res.data.list[0];
        //$scope.selected = undefined;
        //$scope.users = _users;
    });
    $scope.selectUser = function(user, users){ //保存负责人数组
        if(!judgeIndexOfUser(user, users)){
            user.uid = user.uId;
            user.uName = user.name;
            users.push(user);
        }
    };
    $scope.removeUser = function(user, users){
        users.remove(user);
        console.log(users);
    };
    $scope.ok = function(flag){     //更新或者关闭项目
        console.log($scope.data);
        sweetAlertConfirm(SweetAlert, function () {
            console.log("确认方法");
            if($scope.data == undefined){
                $scope.error = '保存失败';
                return;
            }
            var keepPropertys = ["id","uid","type","cyrList","name","flowType","builtin","distribution","fzrList"];
            var data = keepObjectProperty(keepPropertys, $scope.data);
            data.fzrList = getArrayProperty(data.fzrList, 'uid');
            data.cyrList = getArrayProperty(data.cyrList, 'uid');
            if(flag == 'close'){
                data.builtin = 9;
            }
            console.log(data);
            var url = uc_save_p + '.json?callback=JSON_CALLBACK&data='+JSON.stringify(data);
            console.log(url);
            $http.jsonp(url).success(function(res){
                if(res.returnCode == '000000' || res.returnCode == '000002'){
                    sweetAlertCommon(SweetAlert,res.description,'success');
                    $state.go('app.uc.fz');
                    //if(flag == 'close'){
                    //    sweetAlertCommon(SweetAlert,'关闭成功','success');
                    //    $state.go('app.uc.cp');
                    //} else {
                    //    sweetAlertCommon(SweetAlert,'保存成功','success');
                    //    $state.go('app.uc.cp');
                    //}
                    //location.reload();  //保存成功后刷新页面
                }else{
                    sweetAlertCommon(SweetAlert,res.description,'error');
                    //$scope.error = '保存失败';
                }
                //console.log(res);
            }).error(function(res){
                console.log(res);
                sweetAlertCommon(SweetAlert,'请求接口异常','warning');
                $scope.error = '请求接口异常';
            });
        }, undefined, '', '');
    };
}]);
function getData(res){  //获取项目列表并设置完成进度
    var arr = [];
    arr = res.data.list;
    for(var i = 0; i < res.data.list.length; i++){
        var count = parseInt(res.data.list[i].tTask);
        if(count <= 0){
            arr[i].progress = 0;
        }else{
            var finished = parseInt(res.data.list[i].finished);
            arr[i].progress = Math.round( finished / count * 100)
        }
        arr[i].fzrList.splice(2);
    }
    //console.log(arr);
    return arr;
}
//获取数据
function reflectData(name,type,$scope,$http,param){
    $http.jsonp(uc_find_t+'.json?callback=JSON_CALLBACK&data=' + JSON.stringify(param)).success(function(res){  //获取任务的数据id
        var ids = [];
        var users = [];
        for(var i = 0; i < res.list.length; i ++){
            ids.push(res.list[i].tId);
            for(var j = 0; j < _users.length; j ++){
                if(_users[j].uId == res.list[i].uId){
                    console.log(_users[j]);
                    users.push(_users[j]);
                }
            }
        }
        console.log(users);
        $http.jsonp(list_url + name+'.json?callback=JSON_CALLBACK&ids=' + ids.join(',') + '&sp=11').success(function(res){    //根据id获取数据信息
            $scope.datas = [];
            var id = name + 'Id';
            //console.log(res.data);
            for(var i = 0; i <  res.data.length; i ++){
                var data = {};
                if(name == 'artist'){
                    console.log(res.data[i].artistId);
                    data.id = res.data[i].artistId;
                    data.name = res.data[i].artistName;
                    if(users.length >0)
                        data.uName = users[i].name;
                }
                if(name == 'album'){
                    data.id = res.data[i].albumId;
                    data.name = res.data[i].albumName;
                    if(users.length >0)
                        data.uName = users[i].name;
                }
                if(name == 'song'){
                    data.id = res.data[i].songId;
                    data.name = res.data[i].songName;
                    if(users.length >0)
                        data.uName = users[i].name;
                }
                data.type = type;
                $scope.datas.push(data);
            }
            console.log($scope.datas);
        });
    });
}
//复选框单选
function checkSingle(isCheck, data,choseArr){
    if(choseArr.length > 0){
        var choseStr = choseArr.join(',');
    }
    console.log(isCheck);
    console.log(choseArr);
    if(isCheck != true){
        choseStr = choseStr + data + ",";
        data.isCheck = true;
    } else {
        choseStr.replace(data + ",", "");
        data.isCheck = false;
    }
    if(choseStr.length = 0){
       choseArr = [];
    } else {
        choseArr = (choseStr.substr(0,choseStr.length-1)).split(',');
    }
    console.log(choseArr);
    return choseArr;
};
angular.module('app.routes').controller('ModalCtrl',['$scope', '$uibModal',function($scope, $uibModal){   //添加项目弹出层控件
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.animationsEnabled = true;
    $scope.user = {};
    $scope.user.id = _session.id;
    $scope.user.name = _session.name;
    function ModalOpenSetup(templateUrl, controller, resolve, size) {
        this.templateUrl = templateUrl;
        this.controller = controller;
        this.resolve = resolve;
        this.size = size;
    }
    $scope.open = function (size){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });
    };
    $scope.openImport = function(pId,uId,p_type){     //打开上传excel弹出层
        var param = {};
        param.pId = pId;
        param.uid = uId;
        if(p_type == 0 || p_type == 5){
            param.p_type = 'artist';
        } else if(p_type == 1 || p_type == 6){
            param.p_type = 'album';
        } else if(p_type == 2 || p_type == 7){
            param.p_type = 'song';
        } else if(p_type == 3 || p_type == 8){
            param.p_type = 'tag';
        } else if(p_type == 4 || p_type == 9){
            param.p_type = 'cp';
        }

            console.log(param);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'import.html',
            controller: 'ImportCtrl',
            resolve: {
                param: function () {
                    return param;
                }
            }
        });
    };
    $scope.openRole = function(id,name){      //打开权限分配角色列表弹出层
        $scope.user = {};
        $scope.user.id = id;
        $scope.user.name = name;
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'role.html',
            controller: 'RoleCtrl',
            resolve: {
                user: function(){
                    return $scope.user;
                }
            }
        });
    };
    $scope.openUser = function(id){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'user.html',
            controller: 'UserCtrl',
            resolve: {
                id: function(){
                    return id;
                }
            }
        });
    };
    $scope.openAuthority = function(id){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'authority.html',
            controller: 'AuthorityCtrl',
            resolve: {
                id: function(){
                    return id;
                }
            }
        });
    };
    $scope.addRole = function(){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'addRole.html',
            controller: 'AddRoleCtrl',
            resolve: {
            }
        });
    };
    $scope.openRAuthority = function(){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'rAuthority.html',
            controller: 'RAuthorityCtrl',
            resolve: {
            }
        });
    };
    $scope.openImport_lack = function(){     //打开缺歌上传excel
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'import_lack.html',
            controller: 'ImportCtrl_lack',
            resolve: {
                user: function(){
                    return $scope.user;
                }
            }
        });
    };
    $scope.openEdit= function(data,size){     //打开缺歌列表编辑页面
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'edit.html',
            controller: 'EditCtrl',
            size: size,
            resolve: {
                data: function(){
                    return data;
                },
                user: function () {
                    return $scope.user;
                }
            }
        });
    };
    $scope.batchExamine = function (datas,form,types,size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/myModalContent.html',
            controller: 'BatchModalCtrl',
            size: size,
            resolve: {
                datas: function () {
                    return datas;
                },
                form: function () {
                    return form;
                },
                types: function () {
                    return types;
                }
            }
        });
    };
    $scope.exportCommon = function (datas,form,size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'exportTpl.html',
            controller: 'PreCatalogModal',
            size: size,
            resolve: {
                datas: function () {
                    return datas;
                },
                form: function () {
                    return form;
                }
            }
        });
    };
    $scope.preCatalogImport = function (datas,form) {
        var modalInstance = $uibModal.open({
            templateUrl: 'importTpl.html',
            controller: 'PreCatalogModal',
            resolve: {
                datas: function () {
                    return datas;
                },
                form: function () {
                    return form;
                }
            }
        })
    };
    $scope.preCatalogEmergImport = function (datas,form) {
        var modalInstance = $uibModal.open({
            templateUrl: 'emergImportTpl.html',
            controller: 'PreCatalogModal',
            resolve: {
                datas: function () {
                    return datas;
                },
                form: function () {
                    return form;
                }
            }
        })
    };
    $scope.unAssign = function (datas) {
        var modalInstance = $uibModal.open({
            templateUrl: 'unAssign.html',
            controller: 'UnAssignModal',
            resolve: {
                datas: function () {
                    return datas;
                }
            }
        })
    };
    $scope.songTagExport = function (module, datas, form) {
        $uibModal.open(new ModalOpenSetup('exportTpl.html', 'SongTagModal', {
            datas: function () {
                return datas;
            },
            form: function () {
                var _form = inherit(form);
                if(module == 3) _form.type = 3;
                else _form.type = 2;
                return _form;
            }
        }))
    };
    $scope.songTagImport = function (type) {
        $uibModal.open(new ModalOpenSetup('importTpl.html', 'SongTagImportModal', {
            type: function(){
                return type;
            }
        }))
    };
    $scope.assignToTask = function (type, datas) {
        $uibModal.open(new ModalOpenSetup('assignToTaskTpl.html', 'AssignToTaskModal', {
            type: function () {
                return type;
            },
            datas: function () {
                return datas;
            }
        }))
    };
    $scope.newSongImport = function(){
        $uibModal.open(new ModalOpenSetup('importTpl.html', 'NewSongImportController', {}));
    };
    $scope.newSongExport = function(datas,params){
        $uibModal.open(new ModalOpenSetup('exportTpl.html', 'NewSongExportController', {
            datas: function(){
                return datas;
            },
            params: function(){
                return params;
            }
        }))
    };
    $scope.newSongDelete = function(datas, params){
        $uibModal.open(new ModalOpenSetup('deleteTpl.html', 'NewSongDeleteController', {
            datas: function(){
                return datas;
            },
            params: function(){
                return params;
            }
        }))
    };
    $scope.qualityTagExport = function(datas,form){
        console.log(datas);
        $uibModal.open(new ModalOpenSetup('exportTpl.html', 'QualityTagExportController', {
            datas: function(){
                return datas;
            },
            form: function(){
                return form;
            }
        }))
    };
    $scope.qualityTagBatch = function(datas,form){
        $uibModal.open(new ModalOpenSetup('batchTpl.html', 'QualityTagExportController', {
            datas: function(){
                return datas;
            },
            form: function(){
                return form;
            }
        }))
    };
    $scope.qualityChangeOrder = function(data, orderType){
        $uibModal.open(new ModalOpenSetup('orderTpl.html', 'QualityOrderController', {
            data: function(){
                return data;
            },
            orderType: function(){
                return orderType;
            }
        }))
    };
}]);
angular.module('app.routes').controller('ImportCtrl',['$scope','$uibModalInstance','$http','param','$timeout','$rootScope','display',function($scope,$uibModalInstance,$http,param,$timeout,$rootScope,display){ //导入excel页面操作
    console.log("进入了导入excel");
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){
        var filename = $('#excelFile').val();
        if(filename == undefined || filename == ''){
            $scope.error = '请选择上传的excel文件';
        }else{
             var url = uc_uploadexcel;
            var datas = {'pid':param.pId,'uid':param.uid,'type':param.p_type};
            ajaxFileUpload(url, $scope, datas, $uibModalInstance,$timeout,$rootScope,display, 'excelFile');
        }
    }
}]);
var _users = [];
//下拉框，自动补全并选中
angular.module('app.routes').controller('ModalInstanceCtrl',['$cookieStore','$scope', '$http','$uibModalInstance','SweetAlert',function($cookieStore,$scope, $http,$uibModalInstance,SweetAlert){
    $scope.data = {};
    $scope.selected = undefined;
    var user = {};
    user.name = _session.name;
    user.uid = _session.id;
    console.log(user);
    $scope.users = _users;
    $scope.fzr_arr = [],$scope.fzr_arr.push(user);
    $scope.cyr_arr = [];
    $scope.selectFzr = function(fzr_detail){ //保存负责人数组
        if(!fzr_detail) return;
        var fzr = {};
        fzr.uid = fzr_detail.uId;
        fzr.name = fzr_detail.name;
        console.log(fzr);
        console.log($scope.fzr_arr);
        if($scope.fzr_arr.indexOf(fzr) == -1){
            $scope.fzr_arr.push(fzr);
        }
    };
    $scope.selectCyr = function(cyr_detail){ //保存参与人数组
        if(!cyr_detail) return;
        var cyr = {};
        cyr.uid = cyr_detail.uId;
        cyr.name = cyr_detail.name;
        if(JSON.stringify(user) == JSON.stringify(cyr)){
            return;
        }
        if($scope.cyr_arr.indexOf(cyr) == -1){
            $scope.cyr_arr.push(cyr);
        }
    };
    $scope.ok = function(){
        console.log(JSON.stringify($scope.data));
        if($scope.fzr_arr.length < 1){
            $scope.error = '请选择负责人';
            return;
        }
        if($scope.data == undefined){
            $scope.error = '保存失败';
            return;
        }
        $scope.data.fzrList = getArrayProperty($scope.fzr_arr, 'uid');
        $scope.data.cyrList = getArrayProperty($scope.cyr_arr, 'uid');
        $scope.data.uid = _session.id;
        $scope.data.builtin = 0;
        $scope.data.distribution = 1;
        var data = JSON.stringify($scope.data);
        console.log(data);
        $http.jsonp(uc_save_p + '.json?callback=JSON_CALLBACK&data=' + data).success(function(res){
            if(res.returnCode == '000000'){
                $uibModalInstance.close($scope.data);
                sweetAlertCall(SweetAlert, "保存成功", "success", null, function () {
                    location.reload();
                });
            }else{
                $scope.error = '保存失败';
            }
            console.log(res);
        });
    };
    //$scope.validName = function(){
    //    console.log($scope.data);
    //    var proName =  $scope.data.name;
    //    var d, s = "";
    //    var c = ":";
    //    d = new Date();
    //    s += d.getFullYear()+ "/";
    //    s += d.getMonth()+ "/";
    //    s += d.getDate()+ "/";
    //    s += d.getHours() + c;
    //    s += d.getMinutes() + c;
    //    s += d.getSeconds();
    //    $http.jsonp(uc_url + 'findRepartProjectName.json?callback=JSON_CALLBACK&userId=' + _session.id + '&projectName=' + proName).success(function(res){
    //        console.log(res);
    //        if(res.returnCode != '000000'){
    //            $scope.error = '项目名称重复,已自动修改';
    //            var pro_name = $scope.data.name;
    //            $scope.data.name = pro_name + s;
    //        }else{
    //            $scope.error = '';
    //        }
    //    });
    //};
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.removeFzr = function(fzr){
        $scope.fzr_arr.remove(fzr);
    };
    $scope.removeCyr = function(cyr){
        $scope.cyr_arr.remove(cyr);
    }
}]);
angular.module('app.routes').controller('taskCtrl',['$scope','$http','$cookies',function($scope,$http,$cookies){
    if(_users.length < 1){    //如果缓存不存在,则请求获取用户
        getAllUser($http, function(users){
            _users = users;
            $scope.users = _users;
            $scope.selected = undefined;
        });
    } else {
        $scope.users = _users;
        $scope.selected = undefined;
    }
}]);

angular.module('app.routes').controller('DatepickerCtrl', ['$scope',function ($scope) {  //日期时间选择控件
    $scope.sopen = function($event) {
        $scope.status.sopened = true;
    };
    $scope.eopen = function($event) {
        $scope.status.eopened = true;
    };
    $scope.status = {
        sopened: false,
        eopened: false
    };
}]);

//字符串转日期格式，strDate要转为日期格式的字符串
function getDate(strDate) {
    var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/,
            function (a) { return parseInt(a, 10) - 1; }).match(/\d+/g) + ')');
    return date;
}
//复选框的单选
function ucTaskSelectOne($scope, data, checkb){
    var str = '';
    //var unstr = '';
    if($scope.choseArr.length > 0){
        str = $scope.choseArr.join(',') + ',';
        $scope.choseArr = [];
    }
    //if($scope.unchoseArr.length > 0){
    //    unstr = $scope.unchoseArr.join(',') + ',';
    //    $scope.unchoseArr = [];
    //}
    if(checkb != true){//选中
        if(data.songId != undefined){
            str = str + data.songId + ',';
            //unstr = unstr.replace(data.songId + ',', '');
        } else if (data.albumId != undefined){
            str = str + data.albumId + ',';
            //unstr = unstr.replace(data.albumId + ',', '');
        } else if (data.artistId != undefined){
            str = str + data.artistId + ',';
            //unstr = unstr.replace(data.artistId + ',', '');
        }
        data.isCheck = true;
    } else {//取消选中
        if(data.songId != undefined){
            str = str.replace(data.songId + ',', '');
            //unstr = unstr + data.songId + ',';
        } else if (data.albumId != undefined){
            str = str.replace(data.albumId + ',', '');
            //unstr = unstr + data.albumId + ',';
        } else if (data.artistId != undefined){
            str = str.replace(data.artistId + ',', '');
            //unstr = unstr + data.artistId + ',';
        }
        data.isCheck = false;
    }
    if(str.length > 0){
        $scope.choseArr = (str.substr(0,str.length-1)).split(',');
    }
    //if(unstr.length > 0){
    //    $scope.unchoseArr = (unstr.substr(0,unstr.length-1)).split(',');
    //}
    //console.log($scope.choseArr);
    //console.log($scope.unchoseArr);
}
//复选框的全选
function ucTaskSelectAll($scope, all, datas){
    $scope.choseArr = [];
    //$scope.unchoseArr = [];
    if(all == true){
        $scope.allIsCheck = true;
        for(var i=0; i < datas.length; i++){
            var data = datas[i];
            if(data.songId != undefined){
                $scope.choseArr.push(data.songId + "");
            } else if (data.albumId != undefined){
                $scope.choseArr.push(data.albumId + "");
            } else if (data.artistId != undefined){
                $scope.choseArr.push(data.artistId + "");
            }
            data.isCheck = true;
        }
    }else{
        $scope.allIsCheck = false;
        for(var i=0; i < datas.length; i++){
            data = datas[i];
            //if(data.songId != undefined){
            //    $scope.unchoseArr.push(data.songId + "");
            //} else if (data.albumId != undefined){
            //    $scope.unchoseArr.push(data.albumId + "");
            //} else if (data.artistId != undefined){
            //    $scope.unchoseArr.push(data.artistId + "");
            //}
            data.isCheck = false;
        }
    }
    console.log($scope.choseArr);
    //console.log($scope.unchoseArr);
}
//获取当前任务数据
function getUcTaskDatas(type, userId, $scope, $stateParams, $http){
    $scope.datas.length = 0;
    var data = new Object();
    data.projectId = $stateParams.pId;
    data = compeleteUrlData(data, userId, $stateParams, $scope, type);
    var url = _search_url + 'search/' + type + '.json' + "?callback=JSON_CALLBACK&data=" + JSON.stringify(data);
    console.log(JSON.stringify(data));
    $http.jsonp(url).success(function (res){
        var dataIds = [];
        for(var i = 0; i < res.body.list.length; i++){
            if(type == 'song'){
                dataIds.push(res.body.list[i].songId);
            } else if (type == 'album'){
                dataIds.push(res.body.list[i].albumId);
            } else if (type == 'artist'){
                dataIds.push(res.body.list[i].artistId);
            } else if (type == 'copyright'){
                dataIds.push(res.body.list[i].copyrightId);
            }
        }
        ucTaskSeparatePage($scope, res);
        if(dataIds.length > 0){
            var url1 = list_url + type + ".json?callback=JSON_CALLBACK&ids=" + dataIds.join(",");
            if(type == 'copyright'){
                url1 += '&loadSong=true&loadAlbum=true&loadArtist=111111';
            }
            $http.jsonp(url1).success(function (res1) {
                for(var j = 0; j < res1.data.length; j++){
                    $scope.datas.push(res1.data[j]);
                    //获得数据的负责人
                    $scope.datas[j].user = getParticipateUser($scope.datas[j], res, $scope.cyr_list, type);
                }
            }).error(function () {
                alert("批量获取详细信息网络错误");
            });
        }
    }).error(function(){
        alert("获取任务批量ID网络错误");
    });
}
//新歌流程获取数据
function getUcTaskDatasNewSong(materialType, pageType, userId, $scope, $stateParams, $http,SweetAlert){
    var url = uc_new_song + materialType + ".json?" + CALLBACK + "&data=";
    var data = new Object();
    if(checkEmpty($stateParams.pageSize)) $stateParams.pageSize = 50;
    data = compeleteUrlDataNewSong(data, pageType, userId, $scope, $stateParams);
    //console.log(data);
    var url1 = url + encodeURIComponent(JSON.stringify(data));
    //url += JSON.stringify(data);
    $http.jsonp(url1).success(function(res){
        $scope.$parent.datas.length = 0;
        $scope.$parent.datas = res.data.list;
    });
    var data2 = cloneOneObject(data);
    data2.isQueryCount = 1;
    var url2 = url + JSON.stringify(data2);
    $http.jsonp(url2).success(function(res) {
        materialListSeparatePage($scope.$parent,res);
    });
}

//根据名字获取负责人ID
function getIdByName(name, cyr_list){
    var id = '';
    for(var i = 0; i < cyr_list.length; i++){
        if(name == cyr_list[i].uName){
            id = cyr_list[i].uId;
        }
    }
    return id;
}
//根据用户ID获取名字
function getNameById(id, users){
    for(var i = 0; i < users.length; i++){
        if(users[i].uId == id){
            return users[i].uName;
        }
    }
    return '';
}

function compeleteUrlDataNewSong(data, pageType, userId, $scope, $stateParams){
    if($stateParams.taskStatusList != undefined && $stateParams.taskStatusList != ''){
        data.taskStatusList = stringToArray($stateParams.taskStatusList);
    } else if (pageType != undefined && pageType != ''){
        data.taskStatus = pageType;
    }
    if(!checkEmpty($stateParams.taskStatus)) data.taskStatus = $stateParams.taskStatus;
    if($stateParams.pId != undefined && $stateParams.pId != ''){
        data.projectId = $stateParams.pId;
    }
    if(userId != undefined && userId != ''){
        data.uid = userId;
    }
    if($stateParams.artistIds != undefined && $stateParams.artistIds != ''){
        data.artistIds = stringToArray($stateParams.artistIds);
    }
    if($stateParams.status != undefined && $stateParams.status != ''){
        data.status = $stateParams.status;
    }
    if($stateParams.productSongName != undefined && $stateParams.productSongName != ''){
        data.cpSongName = $stateParams.productSongName;
    }
    if($stateParams.productAlbumName != undefined && $stateParams.productAlbumName != ''){
        data.cpAlbumName = $stateParams.productAlbumName;
    }
    if($stateParams.productArtistName != undefined && $stateParams.productArtistName != ''){
        data.cpArtistName = $stateParams.productArtistName;
    }
    if($stateParams.cid != undefined && $stateParams.cid != ''){
        data.copyrightId = $stateParams.cid;
    }
    if($stateParams.catalogSongName != undefined && $stateParams.catalogSongName != ''){
        data.songName = $stateParams.catalogSongName;
    }
    if($stateParams.catalogAlbumName != undefined && $stateParams.catalogAlbumName != ''){
        data.albumName = $stateParams.catalogAlbumName;
    }
    if($stateParams.catalogArtistName != undefined && $stateParams.catalogArtistName != ''){
        data.artistName = $stateParams.catalogArtistName;
    }
    if($stateParams.artistName != undefined && $stateParams.artistName != ''){
        data.artistName = $stateParams.artistName;
    }
    if($stateParams.filterCondition != undefined && $stateParams.filterCondition != ''){
        data.filterItem = $stateParams.filterCondition;
    }
    if($stateParams.songId != undefined && $stateParams.songId != ''){
        data.songIds = stringToArray($stateParams.songId);
    }
    if($stateParams.creatTimeStart != undefined && $stateParams.creatTimeStart != ''){
        data.createStartTime = $stateParams.creatTimeStart;
    }
    if($stateParams.creatTimeEnd != undefined && $stateParams.creatTimeEnd != ''){
        data.createEndTime = $stateParams.creatTimeEnd;
    }
    if($stateParams.projectName != undefined && $stateParams.projectName != ''){
        data.projectName = $stateParams.projectName;
    }
    if($stateParams.newOrFirst != undefined && $stateParams.newOrFirst != ''){
        data.newSong = $stateParams.newOrFirst;
    }
    if($stateParams.degree != undefined && $stateParams.degree != ''){
        data.degree = $stateParams.degree;
    }
    if($stateParams.auth != undefined && $stateParams.auth != ''){
        data.auth = $stateParams.auth;
    }
    if($stateParams.dataState != undefined && $stateParams.dataState != '' && $stateParams.dataState != "all"){
        data.status = $stateParams.dataState;
    }
    if($stateParams.tagStatus != undefined && $stateParams.tagStatus != '' && $stateParams.tagStatus != "all"){
        data.tagStatus = stringToArray($stateParams.tagStatus);
    }
    if($stateParams.distributionTimeStart != undefined && $stateParams.distributionTimeStart != ''){
        data.distributionStartTime = $stateParams.distributionTimeStart;
    }
    if($stateParams.distributionTimeEnd != undefined && $stateParams.distributionTimeEnd != ''){
        data.distributionEndTime = $stateParams.distributionTimeEnd;
    }
    if($stateParams.compeleteTimeStart != undefined && $stateParams.compeleteTimeStart != ''){
        data.completeStartTime = $stateParams.compeleteTimeStart;
    }
    if($stateParams.compeleteTimeEnd != undefined && $stateParams.compeleteTimeEnd != ''){
        data.completeEndTime = $stateParams.compeleteTimeEnd;
    }
    if($stateParams.pageNo != undefined && $stateParams.pageNo != ''){
        data.pageNo = $stateParams.pageNo;
    }
    if($stateParams.pageSize != undefined && $stateParams.pageSize != ''){
        data.pageSize = $stateParams.pageSize;
    }
    //专辑工单页面特有查询条件
    if($stateParams.albumId != undefined && $stateParams.albumId != ''){
        data.albumIds = stringToArray($stateParams.albumId);
    }
    if($stateParams.albumName != undefined && $stateParams.albumName != ''){
        data.albumName = $stateParams.albumName;
    }
    //歌曲工单特有查询条件
    if($stateParams.songName != undefined && $stateParams.songName != ''){
        data.songName = $stateParams.songName;
    }
    if($stateParams.lyricPerson != undefined && $stateParams.lyricPerson != ''){
        data.lyricser = $stateParams.lyricPerson;
    }
    if($stateParams.composePerson != undefined && $stateParams.composePerson != ''){
        data.composer = $stateParams.composePerson;
    }
    if($stateParams.conductor != undefined && $stateParams.conductor != ''){
        data.cantor = $stateParams.conductor;
    }
    if($stateParams.player != undefined && $stateParams.player != ''){
        data.performer = $stateParams.player;
    }
    if($stateParams.tagIds != undefined && $stateParams.tagIds != ''){
        data.tags = stringToArray($stateParams.tagIds);
    }
    if(!isPropertyEmpty($stateParams.lastEdit != '')){
        data.editUid = $stateParams.lastEdit;
    }
    if(!isPropertyEmpty($stateParams.editSubmitStart != '')){
        data.editStartTime = $stateParams.editSubmitStart;
    }
    if(!isPropertyEmpty($stateParams.editSubmitEnd != '')){
        data.editEndTime = $stateParams.editSubmitEnd;
    }
    if(!isPropertyEmpty($stateParams.urgentDegree)) data.urgentDegree = $stateParams.urgentDegree;
    if(!isPropertyEmpty($stateParams.language)) data.language = $stateParams.language;
    //if(pageType != undefined && pageType != ''){
    //    data.type = pageType;
    //}
    return data;
}
//获得当前数据对应的哪个操作人
function getParticipateUser(data, res, cyr_list, type){
    var userId = '';
    for(var i = 0; i < res.body.list.length; i++){
        if (type == 'song'){
            if(data.songId == res.body.list[i].songId){
                userId = res.body.list[i].userId;
            }
        } else if (type == 'album'){
            if(data.albumId == res.body.list[i].albumId){
                userId = res.body.list[i].userId;
            }
        } else if (type == 'artist'){
            if(data.artistId == res.body.list[i].artistId){
                userId = res.body.list[i].userId;
            }
        } else if (type == 'copyright'){
            if(data.copyrightId == res.body.list[i].copyrightId){
                userId = res.body.list[i].userId;
            }
        }
    }
    if(userId == ''){
        return new Object();
    }
    for(var j = 0; j < cyr_list.length; j++){
        if(userId == cyr_list[j].uId){
            return cyr_list[j];
        }
    }
    return new Object();
}
//分页的函数
function ucTaskSeparatePage($scope, res){
    if(!checkEmpty($scope.params)){
        $scope.params.maxSize = 5;
        $scope.params.itemsPerPage = res.data.pageSize;
        $scope.params.currentPage = res.data.pageNo;
        $scope.params.totalItems = res.data.totalCount;
    }
    if(!checkEmpty($scope.form)){
        $scope.form.maxSize = 5;
        $scope.form.itemsPerPage = res.data.pageSize;
        $scope.form.currentPage = res.data.pageNo;
        $scope.form.totalItems = res.data.totalCount;
    }

}

//分配任务
function assignTask(type, uId, $scope, $stateParams, $http){
    console.log($scope.setting);
    if($scope.choseArr.length < 1){
        alert('请选择需要分配的数据');
        return;
    }
    console.log($scope.choseArr);
    var url = uc_assign_t + '.json?callback=JSON_CALLBACK&pId=' + $stateParams.pId + '&uId=' + uId + '&tId=' + $scope.choseArr.join(',') + '&type=' + type;
    if($scope.setting != undefined && $scope.setting != null && $scope.setting.value != ''){
        url += ('&aBType=' + $scope.setting.value);
    }
    $http.jsonp(url).success(function(res){
        if(res.returnCode == '000000'){
            alert('分配成功',function(){
                location.reload();
            });
        }else{
            alert('分配失败');
        }
    });
}

//新歌工单分配任务
function assignTaskNewSong(taskIds, flowId, auth, uId, SweetAlert, $scope, TaskService){
    var _promise = TaskService.service.assignTask(taskIds, flowId, auth, uId); // 确认权限和流程
    if(_promise) _promise.then(function (res) {
        if(res.returnCode == "000000"){
            sweetAlertCommon(SweetAlert, res.msg, 'success');
            location.reload(true);
        } else if (res.returnCode == "000005") {
            var tips = "版权ID为" + res.list.join(',') + '的数据分配失败，已为您重新勾选，请重新分配';
            sweetAlertCommon(SweetAlert, tips, 'success');
            checkAssignedFailed(res.list, $scope.datas);
        } else {
            sweetAlertCommon(SweetAlert, res.msg, 'warning');
        }
    });
    // $http.jsonp(uc_assign_t + ".json?callback=JSON_CALLBACK&ids=" + taskIds + "&flowId=" + flowId + "&auth=" + auth + "&uId=" + uId).success(function(res){
    //     if(res.returnCode == "000000"){
    //         alertTipCommon($timeout,$rootScope,'分配成功',display);
    //         //alert("分配成功");
    //         location.reload(true);
    //     } else if (res.returnCode == "000005") {
    //         var tips = "版权ID为" + res.list.join(',') + '的数据分配失败，已为您重新勾选，请重新分配';
    //         alertTipCommon($timeout, $rootScope, tips, display);
    //         checkAssignedFailed(res.list, $scope.datas);
    //     } else {
    //         alertTipCommon($timeout,$rootScope,'分配失败,请重新操作',display);
    //     }
    // });
}

//重新勾选分配失败的任务
function checkAssignedFailed(cpIds, datas){
    for (var i = 0; i < datas.length; i++) {
        data = datas[i];
        if(isContainValue(cpIds, data.copyrightId)){
            data.allIsCheck = true;
        } else {
            data.allIsCheck = false;
        }
    }
}

//导出数据
function exportData($scope){
    console.log($scope.p_type);
    var type = '';
    if($scope.choseArr.length < 1){
        alert('请选择要导出的数据');
        return;
    }
    if($scope.p_type == 1)
        type = 'song';
    if($scope.p_type == 3)
        type = 'artist';
    if($scope.p_type == 4)
        type = 'album';
    if($scope.p_type == 5){
        type = 'song';
        console.log(type)
    }
    var url = '/mls/' + type + '/excel?ids=' +  $scope.choseArr.join(',');
    location.href = url;
}

/**
 * 判断一个用户是否在一个用户数组里面
 * @param user
 * @param users
 */
function judgeIndexOfUser(user, users){
    for(var i = 0; i < users.length; i++){
        var id1 = (user.uId != undefined ? user.uId : user.uid);
        var id2 = (users[i].uId != undefined ? users[i].uId : users[i].uid);
        if(id1 == id2){
            return true;
        }
    }
    return false;
}

//获取项目流程
function getTaskContent($scope, $stateParams, $http){
    //获取项目的流程
    $http.jsonp(uc_find_p+'.json?' + CALLBACK + '&data={"id":"' + $stateParams.pId + '"}').success(function(res){
        $scope.p_type = res.data.list[0].flowType;
        $scope.distribution = res.data.list[0].distribution;
        $scope.cyr_list = [];
        for(var i = 0; i < res.data.list[0].cyrList.length;i++){
            res.data.list[0].cyrList[i].uid = res.data.list[0].cyrList[i].uid + "";
            $scope.cyr_list.push(res.data.list[0].cyrList[i]);
        }
        for(var i = 0; i < res.data.list[0].fzrList.length;i ++){
            res.data.list[0].fzrList[i].uid = res.data.list[0].fzrList[i].uid + "";
            $scope.cyr_list.push(res.data.list[0].fzrList[i]);
            if(res.data.list[0].fzrList[i].uid == JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid){
                $scope.userRole = 'fzr';
            }
        }
    });
    $http.jsonp(uc_new_song_auth + "?" + CALLBACK + "&pId=" + $stateParams.pId).success(function(res){
        if(res.returnCode == "000000"){
            $scope.authoritySetting = res.list;
            if(!checkEmpty($scope.params)) $scope.params.task_auth_setting = $scope.authoritySetting[0];
            if(!checkEmpty($scope.form)) $scope.form.task_auth_setting = $scope.authoritySetting[0];
        }
    });
}

angular.module("app.routes").controller("UcFlowTypeController", ['$scope',function($scope){
    $scope.flowTypes = [{key: 0, value: "艺人编辑"},{key: 1, value: "专辑编辑"},{key: 2, value: "歌曲编辑"},{key: 3, value: "歌曲标签"}];
}]);