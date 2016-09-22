/**
 * Created by hao.cheng on 2016/3/23.
 * 公共提取方法，部分只适用angularjs版本
 */
function ajaxJson(url,type,dataType,data,method,async){
    if(type == null || type == undefined || type == ''){
        type = 'get';
    }
    if(dataType == null || dataType == undefined || dataType == ''){
        dataType = 'json';
    }
    if(data == null || data == undefined){
        data = '';
    }
    if(async == null || async == undefined){
        async = true;
    }
    $.ajax({
        url: url,
        type: type,
        dataType: dataType,
        data: data,
        async: async,
        success: method,
        error: function(){
            alert('接口异常');
            //console.log(1);
        }
    });
}
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
 * 分页组件
 * @param $scope
 * @param maxSize
 * @param itemsPerPage
 * @param bigTotalItems
 * @param totalPage
 * @param bigCurrentPage
 */
function paginationDiscreteness($scope,maxSize,itemsPerPage,bigTotalItems,totalPage,bigCurrentPage){
    if(checkEmpty($scope.page)) $scope.page = {};
    $scope.page.maxSize = maxSize;
    $scope.page.itemsPerPage = itemsPerPage;
    $scope.page.currentPage = bigCurrentPage;
    $scope.page.totalItems = bigTotalItems;
    $scope.page.totalPage = totalPage;
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
    //var arr = property.split(",");
    //for(var i = 0; i < arr.length; i++){
    //    delete  obj[arr[i]];
    //}
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
var git_users = [];
//var git_page = 1;
function getGitUsers($http,$cookies,$scope,git_page, method){
    if(git_page === 1){
        git_users.length = 0;
    }
    $http.get(git_user+ '&private_token=' +  $cookies.get('kpk') + '&page=' + git_page).success(function(res){
        if(res.length > 0){
            for(var i = 0; i < res.length; i++){
                var user = {};
                user.name = res[i].name;
                user.uId = res[i].id;
                user.allname = res[i].name + "—" + res[i].username + "—" + res[i].id;
                if(judgeInArray(git_users, user, 'uId') == -1){
                    git_users.push(user);
                }
            }
            $scope.gitUsers = git_users;
            //method();
            git_page = git_page + 1;
            getGitUsers($http,$cookies,$scope,git_page,method);
        } else {
            method();
        }
    });
}
/**
 * 获取所有用户
 * @param $http
 * @param method
 */
function getAllUser($http, method){
    var data = {};data['pageSize'] = 1000;
    var url = uc_url + "user/queryUser.json?" + CALLBACK + "&data="+JSON.stringify(data);
    $http.jsonp(url).success(function(res){
        if(res.status == 1){
            var users = res.data.list;
            for(var i = 0; i < users.length; i++){
                users[i].allname = users[i].name + "-" + users[i].userName + "-" + users[i].id;
                users[i].uId = users[i].id;
            }
            if(!checkEmpty(method)){
                method(users);
            }
        }
    }).error(function(res){
        console.log(res);
        alertTipCommon($timeout,$rootScope,"获取用户列表失败",display);
    })
}
/**
 * 判断一个元素是否在一个数组里面
 * @param datas
 * @param data
 * @param propertyName
 */
function judgeInArray(datas, data, propertyName){
    for(var i = 0; i < datas.length; i++){
        if(datas[i][propertyName] === data[propertyName])
            return i;
    }
    return -1;
}

/**
 * 获取一个数组的对象的特定属性的对象
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

/**
 * 判断一个对象属性是否是空
 * @param str
 * @returns {boolean}
 */
function isPropertyEmpty(str){
    if (str == undefined || str == null || str === ''){
        return true;
    }
    return false;
}
/**
 * 将时间戳转成yyyy-MM-dd
 * @param time
 * @returns {string}
 */
function translateTimeToDate(time){
    var date = new Date(time);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    return Y+M+D;
}
//递归调用json，返回所有的叶子节点
//a 待处理的数组
//nodeList 返回的结果list
function getAllNode(a, nodeList) {
    for (var key in a) {
        if (key == 'children') {  //如果是子节点数组，那么循环里面每一个对象
            for (var i in a.children) {
                getAllNode(a.children[i], nodeList);
            }
        } else if (key == 'name') {  //如果是名字,就记录
            var obj = {};
            obj.id = a.id;
            obj.name = a.name;
            obj.pId = a.parentId;
            obj.tagLevel = a.tagLevel;
            obj.ancestorId = a.ancestorId;
            obj.ancestorName = a.ancestorName;
            nodeList.push(obj);
        }
    }
    return nodeList;
}
/**
 * 通过用户名返回用户id
 * @param name  用户名
 * @param users 用户集合
 * @returns {*}
 */
function returnUidByUname(name,users) {
    for(var i = 0; i < users.length; i++){
        if(users[i].name == name){
            return users[i].id;
        }
    }
}
/**
 * 排除响应的对象属性
 * @param obj
 * @param excludeProperties
 */
function excludeProperties(obj,excludeProperties){
    var tempObj = {};
    for(var p in obj){
        var flag = true;
        for(var i = 0; i < excludeProperties.length; i++){
            if(excludeProperties[i] == p){
                flag = false;
                break;
            }
        }
        if(flag && obj[p])
            tempObj[p] = obj[p];
        if(flag && obj[p] && p == 'tagBeans')
            tempObj[p] = JSON.parse(obj[p]);
    }
    return tempObj;
}
/**
 * 继承一个对象并且返回所有pototype属性
 * @param obj
 * @returns {obj}
 */
function inherit(parentObj,childObj) {
    if(!childObj) var childObj;
    childObj = Object.create(parentObj);
    for(var p in childObj) if(childObj[p]) childObj[p] = childObj[p];
    return childObj;
}
/**
 * 复制一个对象的属性值到另外一个对象
 * @param fromObj
 * @param toObj
 * @returns {*}
 */
function concatObj(fromObj, toObj) {
    if(!toObj) var toObj;
    for(var p in fromObj) toObj[p] = fromObj[p];
    return toObj;
}

/**
 * 把一个对象里面的属性拼装成适合url
 * @param obj
 */
function formatObject4Url(obj){
    var str = "";
    if(!obj || Object.getOwnPropertyNames(obj).length === 0){
        return str;
    }
    for(var key in obj){
        if(obj.hasOwnProperty(key) && typeof obj[key] != 'function'){
            str += key + "=" + obj[key] + "&";
        }
    }
    str = str.substr(0, str.length - 1);
    return str;
}

/**
 * 获取对象的一串属性
 * @param obj
 * @param arr
 * @param method
 */
function getSpecialPropertiesByArray(obj, arr, method){
    for(var property in obj){
        if(arr.indexOf(property) != -1){
            method(obj[property]);
        }
    }
}

/**
 *获取ztree某个节点的所有子节点
 * @param parentNode 需要获取子节点的父节点
 * @param childNodes 用于装子节点的数组
 * @returns {*}
 */
function getAllChildNode(parentNode, childNodes){
    parentNode.children.forEach(function(node){
        childNodes.push(node);
        var nodes = node.children;
        if(nodes && nodes.length != 0){
            getAllChildNode(node, childNodes);
        }
    });
    return childNodes;
}
/**
 * get请求
 * @param url
 * @param $http
 * @param SweetAlert
 * @param failedMsg
 * @returns {*}
 * @constructor
 */
function HttpGET(url, $http, SweetAlert, failedMsg){
    return $http.get(url).then(function(res){
        return res.data;
    }, function () {
        sweetAlertCommon(SweetAlert, failedMsg, 'warning');
    });
}
/**
 * post请求
 * @param url
 * @param params
 * @param $http
 * @param SweetAlert
 * @param failedMsg
 * @returns {*}
 * @constructor
 */
function HttpPost(url, params, $http, SweetAlert, failedMsg){
    return $http(new PostSetup(url, params)).then(function(res){
        return res.data;
    }, function () {
        sweetAlertCommon(SweetAlert, failedMsg, 'warning');
    });
}


