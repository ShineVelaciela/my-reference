/**
 * Created by hao.cheng on 2015/11/24.
 * 权限管理controller
 */
angular.module('app.routes').config(ucAuthConfig);
ucAuthConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
function ucAuthConfig($stateProvider, helper){
    $stateProvider
        .state('app.authority',{    //分配权限
            url: '/authority',
            title: '权限管理',
            templateUrl: 'app/views/uc/authority/uc_users.html',
            controller: 'AuthorityController'
        })
        .state('app.role',{     //设置角色
            url: '/role',
            title: '权限管理',
            templateUrl: 'app/views/uc/authority/uc_roles.html',
            resolve: helper.resolveFor('ztree'),
            controller: 'AuthorityRoleController'
        })
}
angular.module('app.routes').controller('AuthorityController', ['$http', '$scope',function($http,$scope){
    getAllUser($http,function(users){
        $scope.datas = users;
        var userIds = [];
        for(var i = 0; i < $scope.datas.length; i ++){
            userIds.push($scope.datas[i].id);
        }
        $http.jsonp(uc_user_role + '?callback=JSON_CALLBACK&type=0&ids=' + userIds.join(',')).success(function(data){
            for(var i = 0; i < $scope.datas.length; i ++){
                $scope.datas[i].roles = data.beanList[i].roleList;
            }
            // console.log($scope.datas);
        });

    });
}]);
angular.module('app.routes').controller('AuthorityRoleController', ['$http','$scope','permissions','SweetAlert', function($http,$scope,permissions,SweetAlert){
    $http.jsonp(uc_role + '?callback=JSON_CALLBACK').success(function(res){
        $scope.roles = res.roleList;
        for(var i =0;i < $scope.roles.length;i++){
            $scope.roles[i].isCheck = false;
        }
    });
    //复选框的单个选择
    var str = "";
    var flag = '';
    $scope.chk = function(data, checkb){
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

    $scope.delRole = function(){    //删除角色
        if(permissions.choseArr == undefined || permissions.choseArr.length < 1){
            sweetAlertCommon(SweetAlert,'请选择要删除的角色','warning');
        }else{
            $http.jsonp(uc_delRole + '?callback=JSON_CALLBACK&ids=' + permissions.choseArr.join(','))
                .success(function(res){
                    if(res.returnCode == '000000'){
                        sweetAlertCommon(SweetAlert,'删除成功','success');
                        location.reload();
                    }else{
                        sweetAlertCommon(SweetAlert,'删除失败','error');
                    }
                });
        }
    }
}]);
angular.module('app.routes').controller('RoleCtrl',['$scope','$http','$uibModalInstance','user','permissions','SweetAlert',function($scope,$http,$uibModalInstance,user,permissions,SweetAlert){  //角色列表弹出层controller
    $scope.user = user;
    $http.jsonp(uc_user_role + '?callback=JSON_CALLBACK&type=1&ids=' + user.id).success(function(res){
        $scope.roles = res.beanList[0].roleList;
    });
    //复选框的单个选择
    var str = "";
    var flag = '';
    $scope.chk = function(data, checkb){
        console.log(checkb);
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
        //console.log(permissions.choseArr);
        //single_chk(data,checkb,flag,str,$scope);
    }
    $scope.cancel = function () {   //取消按钮
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
        var params = [];
        for(var i = 0; i < permissions.choseArr.length; i ++){
            var param = {};
            param.roleId = permissions.choseArr[i];
            param.userId = user.id;
            param.userName = user.name;
            params.push(param);
        }
        $http.jsonp(uc_adduser2role + '?callback=JSON_CALLBACK&data=' + JSON.stringify(params)).success(function(res){
            if(res.returnCode == '000000'){
                $uibModalInstance.dismiss('cancel');
                sweetAlertCommon(SweetAlert,'成功分配权限','success');
                location.reload();
            }else{
                $uibModalInstance.dismiss('cancel');
                sweetAlertCommon(SweetAlert,'分配权限失败','error');
            }
        });
    }
}]);
function single_chk(data, checkb,flag,str,$scope){
    if(flag == 'a'){//在全选的基础上操作
        str = $scope.choseArr.join(',') + ',';
    }
    console.log(checkb);
    if(checkb != true){//选中
        str = str + data.id + ',';
        data.isCheck = true;
    } else {
        str = str.replace(data.id + ',', '');//取消选中
        data.isCheck = false;
    }
    console.log(str);
    if(str.length = 0){
        $scope.choseArr = [];
    } else {
        $scope.choseArr = (str.substr(0,str.length-1)).split(',');
    }
    console.log($scope.choseArr);
}
angular.module('app.routes').controller('UserCtrl',['$scope','$http','$uibModalInstance','id','SweetAlert',function($scope,$http,$uibModalInstance,id,SweetAlert){    //角色下的用户列表弹出层
    $scope.id = id;
    $http.jsonp(uc_role_users + '?callback=JSON_CALLBACK&ids=' + id).success(function(res){
        $scope.datas = res.userRoleList;

    });
    $scope.cancel = function () {   //取消按钮
        $uibModalInstance.dismiss('cancel');
    };
    $scope.removeUser = function(userId,id){
        $http.jsonp(uc_role_deluser + '?callback=JSON_CALLBACK&ids=' + userId + '&roleId=' + id).success(function(res){
            if(res.returnCode == '000000'){
                $uibModalInstance.dismiss('cancel');
                sweetAlertCommon(SweetAlert,'删除成功','success');
            }else{
                sweetAlertCommon(SweetAlert,'删除失败','success');
            }
        });
    }
}])
angular.module('app.routes').controller('AuthorityCtrl', ['$scope','$http','$uibModalInstance','id','SweetAlert',function ($scope,$http,$uibModalInstance,id,SweetAlert) {
    // helper.resolveFor('ztree');
    $scope.id = id;
    $http.jsonp(uc_allauth + '?callback=JSON_CALLBACK&ids=0').success(function(res){
        var nodes = [];
        for(var i = 0; i <res.authList.length; i ++ ){
            var auth = {};
            auth.id = res.authList[i].id;
            auth.pId = res.authList[i].pid;
            auth.name = res.authList[i].name;
            auth.open = true;
            nodes.push(auth);
        };
        $http.jsonp(uc_role_auth + '?callback=JSON_CALLBACK&ids=' + id).success(function(data){
            for(var i = 0; i < nodes.length; i++){
                for(var j = 0; j < data.authList.length; j ++){
                    var auth = {};
                    auth.id = data.authList[j].id;
                    auth.pId = data.authList[j].pid;
                    auth.name = data.authList[j].name;
                    auth.open = true;
                    if(JSON.stringify(nodes[i]) == JSON.stringify(auth)){
                        console.log(nodes[i]);
                        nodes[i].checked = true;
                    }
                }
            }
            $.fn.zTree.init($("#authorityTree"), setting_auth, nodes);
        });
    });
    $scope.cancel = function () {   //取消按钮
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(id){   //确认按钮
        console.log(id + '---' +authIds);
        var params = [];
        for(var i = 0; i < authIds.length; i++){
            var param = {};
            param.roleId = id;
            param.authId = authIds[i];
            params.push(param);
        }
        $http.jsonp(uc_role_addauth + '?callback=JSON_CALLBACK&data=' + JSON.stringify(params)).success(function(res){
            if(res.returnCode == '000000'){
                $uibModalInstance.dismiss('cancel');
                sweetAlertCommon(SweetAlert,'保存成功','success');
            }else{
                sweetAlertCommon(SweetAlert,'保存失败','error');
            }
        });
    }
}]);
var authIds = [];
function zTreeOnCheck_auth(event, treeId, treeNode) {
    authIds = [];
    var zTree = $.fn.zTree.getZTreeObj(treeId);
    var nodes = zTree.getCheckedNodes(true);
    for(var i = 0; i < nodes.length; i ++){
        authIds.push(nodes[i].id);
    }
    console.log(authIds);
    //console.log(treeNode.tId + ", " + treeNode.name + "," + treeNode.checked);
};
var setting_auth = {
    //view: {
    //    addHoverDom: addHoverDom,
    //    removeHoverDom: removeHoverDom,
    //    selectedMulti: false
    //},
    check: {
        enable: true,
        chkboxType: {
            "Y": "ps",
            "N": "ps"
        }
    },
    data: {
        simpleData: {
            enable: true
        },
        //keep: {
            //parent:true
        //}
    },
    //edit: {
    //    enable: true,
    //    showRemoveBtn: false,
    //    //showRenameBtn: false
    //},
    callback:{
        //beforeRemove:zTreeBeforeRemove,
        onCheck: zTreeOnCheck_auth,
        //beforeRename: zTreeBeforeRename
    }
};
angular.module('app.routes').controller('AddRoleCtrl',['$scope','$http','$uibModalInstance','SweetAlert',function($scope,$http,$uibModalInstance,SweetAlert){
    $scope.cancel = function () {   //取消按钮
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function(){   //确认按钮
        var param = JSON.stringify($scope.role);
        $http.jsonp(uc_saveRole + '?callback=JSON_CALLBACK&data=' + param).success(function(res){
            if(res.returnCode == '000000'){
                $uibModalInstance.dismiss('cancel');
                sweetAlertCommon(SweetAlert,'新增成功','success');
                location.reload();
            }else{
                $scope.error = '新增失败';
            }
        });
        console.log($scope.role)

    }
}])
angular.module('app.routes').controller('RAuthorityCtrl',['$scope','$http','$uibModalInstance',function($scope,$http,$uibModalInstance){
    $scope.cancel = function () {   //取消按钮
        $uibModalInstance.dismiss('cancel');
    };
}]);