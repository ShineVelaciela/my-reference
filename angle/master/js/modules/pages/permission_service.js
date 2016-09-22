/**
 * Created by hao.cheng on 2015/11/19.
 * 权限验证service
 */
angular.module('app.pages').factory('permissions', function ($rootScope) {        //service全局global变量以及方法
    $rootScope.checkb = false;
    $rootScope.choseArr = [];
    var permissionList = [];
    return {
        setPermissions: function(permissions) {
            permissionList = permissions;
            $rootScope.$broadcast('permissionsChanged')
        },
        hasPermission: function (permission) {
            if(permission == undefined)
                return false;
            permission = permission.trim();
            if (permissionList.indexOf(permission.trim()) > -1) {
                return true;
            } else {
                return false;
            }
        }
    };
});

//通用方法
angular.module('app.pages').factory('display',function($rootScope){
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


angular.module('app.pages').factory('authority',function($http,$state){
    return {
        getAuth: function(type,id){
            var url = edit_auth + '/'+type+'/' + id + '.json?'+CALLBACK;
            return $http.jsonp(url).then(function(res){
                console.log(res);
                if(res.data.status == 1){
                    var url = $state.href('songEdit',{'songId':id,'auth':res.data.data.auth,'lastPage':returnLastPageTime()})
                    window.open(url,'_blank');
                }
                return res;
            });
        }
    }
});
