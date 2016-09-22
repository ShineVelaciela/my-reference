/**
 * Created by Administrator on 2016/5/8.
 */

function alertTooltip(show, $rootScope, str, display) {//通用-tooltip提示
//        localStorage.setItem(['msg','date'],[str,new Date()]);
    $rootScope.msg = str;
    $rootScope.date = new Date();
    if (show) {
        $rootScope.display = display.setShow();
    } else {
        $rootScope.display = display.setHide();
    }
}
function alertTipCommon($timeout, $rootScope, msg, display) {//通用-tooltip提示后几秒自动消失
    $timeout(function () {
        alertTooltip(true, $rootScope, msg, display);
    }, 100);
    $timeout(function () {
        alertTooltip(false, $rootScope, msg, display);
    }, 3000);
}

/**
 * Created by hao.cheng on 2016/3/23.
 * 公共提取方法，部分只适用angularjs版本
 */
/**
 * 分页通用方法--获取分页
 * @param $scope
 * @param maxSize  分页显示的页码个数
 * @param itemsPerPage  每页显示的数量
 * @param bigTotalItems 数据总条数
 * @param totalPage 数据总页数
 * @param bigCurrentPage    当前选择的页码
 */
function paginationCommon($scope,maxSize,itemsPerPage,bigTotalItems,totalPage,bigCurrentPage){
    $scope.maxSize = maxSize;
    $scope.itemsPerPage = itemsPerPage;
    $scope.bigCurrentPage = bigCurrentPage;
    $scope.bigTotalItems = bigTotalItems;
    $scope.totalPage = totalPage;
}
/**
 * 分页通用方法--选择页码
 * @param $scope
 * @param $state
 * @param url   跳转的地址映射
 */
function choosePageCommon($scope,$state,url){
    $state.go(url,{pageNo: $scope.bigCurrentPage});
}
/**
 * 遍历$stateparams参数对象,返回需求对象
 * @param params    $stateparams对象
 * @param toArr    需要进行特殊处理（转换为数组）的对象
 * @returns {{}}    需求对象
 */
function iteratorStateParam(params,$filter,toArr){
    var data = {};
    var specialStrArr = [];
    if(!isPropertyEmpty(toArr)){
        specialStrArr = toArr.split(",");
    }
    for(var n in params){
        if(params[n] != undefined && params[n] != ''){
            if(specialStrArr != null && specialStrArr != undefined && specialStrArr.length != 0 && specialStrArr.indexOf(n) != -1){
                data[n] = stringToArray(params[n]);        //如果等于特殊字符，则进行相应的特殊处理
            }else if(params[n].constructor == Object){    //判断是否为对象，对象特殊处理
                data[n] = stringToArray(params[n]);     //将对象包装成数组
            }else if(typeof params[n] === 'string'){      //匹配时间格式，若包含则格式化日期（适用ui-bootstrap插件）并且是字符串
                if( params[n].match(reg_date_new)){
                    data[n] = formatDate(Date.parse(params[n]),$filter);
                }else{
                    data[n] = params[n];
                }
            }else{
                data[n] = params[n];
            }
        }
    }
    return data;
}
/**
 * 遍历素材数据对象，对特殊字段进行处理
 * @param data
 * @param $filter
 * @returns {{}}
 */
function iteratorData(data,$filter){
    for(var n in data){
        if( (data[n]+'').match(reg_date_new)){     //对日期进行转换
            data[n] = formatDate(Date.parse(data[n]),$filter);
        }
    }
    return data;
}
/**
 * 删除对象指定的属性
 * @param data  需要删除属性的对象
 * @param property  需要删除的属性名
 * @returns {*}
 */
function deleteProperty(data,property){
    var obj = data;
    delete  obj[property];
    return obj;
}
/**
 * 将字符串转换成数组 eg:'1,2,3' --->  [1,2,3]
 * @param str   字符串参数
 */
function stringToArray(str){
    if(checkEmpty(str))
        return;
    if(str.constructor == String){
        if(!checkEmpty(str)){
            str = JSON.parse('['+str+']');
        }
    }
    if(str.constructor == Object){
        if(!isEmpty(str)){
            str = JSON.parse('['+JSON.stringify(str)+']');
        }
    }

    return str;
}
/**
 *  判断对象是否是undefined或''
 * @param data
 */
function checkEmpty(data){
    if(data == undefined || data == '')
        return true;
}
/**
 * 判断对象是否为空对象
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj) {
    for (var name in obj) {
        if(obj[name] != undefined && obj[name] != ''){
            return false;
        }
    }
    return true;
};
var reg_date_new = 'GMT';
function getGitUsers($http,$cookies,$scope,method){
    $http.get(git_user+ '&private_token=' +  $cookies.get('kpk')).success(function(res){
        var users = [];
        for(var i = 0; i < res.length; i++){
            var user = {};
            user.name = res[i].name;
            user.uId = res[i].id;
            users.push(user);
        }
        $scope.gitUsers = users;
        if(checkEmpty(method)){
            method();
        }
    });
}

/**
 * 获取一个数组的对象的特定属性
 * @param array
 * @param propertyName
 */
function getArrayProperty(array, propertyName){
    var propertyList = new Array();
    for(var i = 0; i < array.length; i++){
        if(array[i][propertyName] != undefined){
            var obj = {};
            obj[propertyName] = array[i][propertyName];
            propertyList.push(obj);
        }
    }
    return propertyList;
}

/**
 * 克隆一个对象
 * @returns 返回一个新对象
 * @constructor
 */
//Object.prototype.Clone = function()
//{
//    var objClone;
//    if ( this.constructor == Object ) objClone = new this.constructor();
//    else objClone = new this.constructor(this.valueOf());
//    for ( var key in this )
//    {
//        if ( objClone[key] != this[key] )
//        {
//            if ( typeof(this[key]) == 'object' )
//            {
//                objClone[key] = this[key].Clone();
//            }
//            else
//            {
//                objClone[key] = this[key];
//            }
//        }
//    }
//    objClone.toString = this.toString;
//    objClone.valueOf = this.valueOf;
//    return objClone;
//};

/**
 * 克隆一个对象
 */
function cloneOneObject(object){
    var objClone;
    if ( object.constructor == Object ) objClone = new object.constructor();
    else objClone = new object.constructor(object.valueOf());
    for ( var key in object )
    {
        if ( objClone[key] != object[key] )
        {
            if (object[key].constructor == Object)
            {
                objClone[key] = cloneOneObject(object[key]);
            }
            else
            {
                objClone[key] = object[key];
            }
        }
    }
    objClone.toString = object.toString;
    objClone.valueOf = object.valueOf;
    return objClone;
}
function replaceByIndex(index,str,reg){
    var arr = str.split('');
    arr.splice(index,1,reg);    //数组替换
    return arr.join('');        //数组拼接字符串
}

function hideBody(obj) {
    const status = $(obj).parents('.widget-title').siblings().css('display');
    if (status == 'none') {
        $(obj).parents('.widget-title').siblings().slideDown('fast');
    } else {
        $(obj).parents('.widget-title').siblings().slideUp('fast');
    }
}
Array.prototype.del = function(dx) {    //删除数组对应的下标
    if(isNaN(dx)||dx>this.length){return false;}
    this.splice(dx,1);
}
Array.prototype.remove = function(val) {//数组删除对应的值
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
Array.prototype.indexOf = function(val) {//数组判断对应的值是否存在
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};