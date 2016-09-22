/**
 * Created by YuChunzhuo on 2015/11/19.
 */

var tag_tree_tags = '';
var tag_tree_user_id = '';
var tag_tree_checked = [];
angular.module('app.routes').config(tagTreeConfig);
tagTreeConfig.$inject = ['$stateProvider',  'RouteHelpersProvider'];
function tagTreeConfig($stateProvider,helper){
    $stateProvider
        .state('app.tagTree',{
            url:'/tag-tree',
            title: '标签树管理',
            templateUrl:'app/views/tags/tag-tree/tag-tree.html',
            resolve: helper.resolveFor('ztree'),
            controller:function($scope, $http,permissions, $state, $timeout, $rootScope, display){
                $scope.tags = [];
                tag_tree_user_id = _session.id;
                $http.get(tag_tree_url + "getTagsTreeByUserId").success(function(res){
                    //console.log(_session.id);
                    //tag_tree_user_id = _session.id;
                    var json = res;
                    //右边已选标签
                    $scope.choseIds = [];
                    //for(var i = 0; i < json.treeEntityList.length; i++){
                    //    json.treeEntityList[i].idName = json.treeEntityList[i].id + json.treeEntityList[i].name;
                    //}
                    for(var i = 0; i < json.treeEntityList.length; i++){
                        if(json.treeEntityList[i].tagType == 0) json.treeEntityList[i].iconSkin = 'pIcon01';
                        // else json.treeEntityList[i].iconSkin = 'icon01';
                    }
                    $scope.tagTreeNodes = json.treeEntityList;
                    console.log($.fn.zTree);
                    $.fn.zTree.init($("#treeDemo"), tagTreeSetting, $scope.tagTreeNodes);
                    $scope.choseArr = [];
                    //console.log(res);
                });
                //$scope.choseTagIds = tag_tree_tags;
                //查看勾选的标签的按钮
                $scope.show = function(){
                    if(tag_tree_tags.length <= 0){
                        //alert('根本就没有勾选标签，请不要逗我好吗');
                        alertTipCommon($timeout,$rootScope,'根本就没有勾选标签，请不要逗我好吗',display);
                        return;
                    }
                    $scope.choseArr.length = 0;
                    $scope.tags = [];
                    var ids = [];
                    //for(var i = 0; i < $scope.checkedIds.length; i++){
                    //    ids.push($scope.checkedIds[i].id);
                    //}
                    $http.get(tag_tree_url + 'getTagsListByIds.do?userId=' + tag_tree_user_id + '&tagIds=' + tag_tree_tags).success(function(res){
                        //var tagList = res.tagInfoList;
                        for(var i=0; i < res.tagInfoList.length; i++){
                            var tag = res.tagInfoList[i];
                            var tagDetail = new Object();
                            tagDetail.isAlbumCheck = (tag.album == 1 ? true : false);
                            tagDetail.isArtistCheck = (tag.artist == 1 ? true : false);
                            tagDetail.isSongCheck = (tag.song == 1 ? true : false);
                            tagDetail.isHideCheck = (tag.tagState == -1 ? true : false);
                            //tagDetail.isHideCheck = false;
                            tagDetail.isFolderCheck = (tag.tagType == 2 ? true : false);
                            tagDetail.isMlsCheck = ((tag.tagAttribute == 1 || tag.tagAttribute == 3) ? true : false);
                            tagDetail.isQQCheck = ((tag.tagAttribute == 2 || tag.tagAttribute == 3) ? true : false);
                            tagDetail.name = tag.name;
                            tagDetail.id = tag.id;
                            tagDetail.qqCheck = 'qq';
                            tagDetail.mlsCheck = 'mls';
                            tagDetail.folderCheck = 'folder';
                            tagDetail.hideCheck = 'hide';
                            tagDetail.songCheck = 'song';
                            tagDetail.artistCheck = 'artist';
                            tagDetail.albumCheck = 'album';
                            var flag = true;
                            for(var m = 0; m < $scope.tags.length; m++){
                                if($scope.tags[m].id == tagDetail.id){
                                    flag = false;
                                }
                            }
                            if(flag){
                                $scope.tags.push(tagDetail);
                            }
                            //$scope.tags.push(tagDetail);
                        }
                    });
                };
                //合并按钮
                $scope.mergeTagButton = function(){
                    if($scope.choseIds.length <= 0){
                        //alert('根本就没有勾选合并框，请不要逗我好吗');
                        alertTipCommon($timeout,$rootScope,'根本就没有勾选合并框，请不要逗我好吗',display);
                        return;
                    } else {
                        $state.go('app.tagTree.merge',{mergeIds:$scope.choseIds});
                    }
                };
                //搜索框搜索单条标签
                $scope.searchTag = function(t){
                    //console.log(t);
                    $http.get(tag_tree_url + 'getTagsListByIds.do?userId=' + tag_tree_user_id + '&tagIds=' + t.id).success(function(res){
                        for(var i=0; i < res.tagInfoList.length; i++){
                            var tag = res.tagInfoList[i];
                            var tagDetail = new Object();
                            tagDetail.isAlbumCheck = (tag.album == 1 ? true : false);
                            tagDetail.isArtistCheck = (tag.artist == 1 ? true : false);
                            tagDetail.isSongCheck = (tag.song == 1 ? true : false);
                            tagDetail.isHideCheck = (tag.tagState == -1 ? true : false);
                            //tagDetail.isHideCheck = false;
                            tagDetail.isFolderCheck = (tag.tagType == 2 ? true : false);
                            tagDetail.isMlsCheck = ((tag.tagAttribute == 1 || tag.tagAttribute == 3) ? true : false);
                            tagDetail.isQQCheck = ((tag.tagAttribute == 2 || tag.tagAttribute == 3) ? true : false);
                            tagDetail.name = tag.name;
                            tagDetail.id = tag.id;
                            tagDetail.qqCheck = 'qq';
                            tagDetail.mlsCheck = 'mls';
                            tagDetail.folderCheck = 'folder';
                            tagDetail.hideCheck = 'hide';
                            tagDetail.songCheck = 'song';
                            tagDetail.artistCheck = 'artist';
                            tagDetail.albumCheck = 'album';
                            var flag = true;
                            for(var m = 0; m < $scope.tags.length; m++){
                                if($scope.tags[m].id == tagDetail.id){
                                    flag = false;
                                }
                            }
                            if(flag){
                                $scope.tags.push(tagDetail);
                            }
                        }
                    });
                };
                //提交单条标签
                $scope.commit = function(tag){
                    var tagJsons = [];
                    var tagJson = new Object();
                    tagJson.id = tag.id;
                    tagJson.name = tag.name;
                    tagJson.artist = (tag.isArtistCheck ? 1 : 0);
                    tagJson.album = (tag.isAlbumCheck ? 1 : 0);
                    tagJson.song = (tag.isSongCheck ? 1 : 0);
                    tagJson.tagState = (tag.isHideCheck ? -1 : 0);
                    tagJson.tagType = (tag.isFolderCheck ? 2 : 0);
                    if(tag.isMlsCheck == false && tag.isQQCheck == false){
                        tagJson.tagAttribute = 0;
                    } else if(tag.isMlsCheck == true && tag.isQQCheck == false){
                        tagJson.tagAttribute = 1;
                    } else if(tag.isMlsCheck == false && tag.isQQCheck == true){
                        tagJson.tagAttribute = 2;
                    } else if(tag.isMlsCheck == true && tag.isQQCheck == true){
                        tagJson.tagAttribute = 3;
                    }
                    tagJsons.push(tagJson);
                    console.log(encodeURIComponent(JSON.stringify(tagJsons)));
                    $http.get(tag_tree_url + 'mergeTagInfo.do?userId=' + tag_tree_user_id + '&tagInfoListJson=' + encodeURIComponent(JSON.stringify(tagJsons))).success(function(res){
                        if(res.message == 'success' && res.status == '000000'){
                            //alert('提交成功');
                            alertTipCommon($timeout,$rootScope,'提交成功',display);
                            //然后在array里面删除指定下标的元素
                            var temp = 0;
                            for(var i = 0; i < $scope.tags.length; i++){
                                if($scope.tags[i].id == tag.id){
                                    temp = i;
                                }
                            }
                            $scope.tags.splice(temp, 1);
                        } else {
                            //alert('提交失败，返回信息:' + JSON.stringify(res));
                            alertTipCommon($timeout,$rootScope,'提交失败，返回信息:' + JSON.stringify(res),display);
                        }
                    }).error(function(res){
                        //alert('提交失败');
                        alertTipCommon($timeout,$rootScope,'提交失败',display);
                    });
                };
                //复选框勾选各种属性,此处用class的check验证控制
                $scope.checkPorp = function(flag, tag){
                    if (flag == 'qq'){
                        tag.isQQCheck = !tag.isQQCheck;
                    } else if (flag == 'mls'){
                        tag.isMlsCheck = !tag.isMlsCheck;
                    } else if (flag == 'folder'){
                        tag.isFolderCheck = !tag.isFolderCheck;
                    } else if (flag == 'hide'){
                        tag.isHideCheck = !tag.isHideCheck;
                    } else if (flag == 'song'){
                        tag.isSongCheck = !tag.isSongCheck;
                    } else if (flag == 'artist'){
                        tag.isArtistCheck = !tag.isArtistCheck;
                    } else if (flag == 'album'){
                        tag.isAlbumCheck = !tag.isAlbumCheck;
                    }
                };

                //复选框的单选事件把id放入array里面,checkb是ng-model控制
                $scope.checkSingle = function(checkb, data){
                    var choseStr = '';
                    if($scope.choseArr.length > 0){
                        choseStr = $scope.choseArr.join(',') + ',';
                    }
                    if(checkb == true){    //选中
                        choseStr = choseStr + data.id + ",";
                        data.isCheck = true;
                    } else {    //取消勾选
                        choseStr = choseStr.replace(data.id + ",", "");
                        data.isCheck = false;
                    }
                    if(choseStr.length == 0 || choseStr == ''){
                        $scope.choseArr = [];
                    } else {
                        $scope.choseArr = (choseStr.substr(0,choseStr.length-1)).split(',');
                    }
                    //console.log(data);
                    console.log($scope.choseArr);
                    $scope.choseIds = $scope.choseArr.join(',');
                    //return choseArr;
                }
            }
        })
        .state('app.tagTree.merge',{
            url:'/merge$:mergeIds',
            views: {
                "tag-tree-merge": {
                    templateUrl:'app/views/tags/tag-tree/tag-tree-oper.html',
                    controller:function($scope, $http,$stateParams,permissions, $timeout, $rootScope, display){
                        $http.get(tag_tree_url + 'getTagsListByIds.do?userId=' + tag_tree_user_id + '&tagIds=' + $stateParams.mergeIds).success(function(res){
                            //var tagList = res.tagInfoList;
                            $scope.tags = [];
                            for(var i=0; i < res.tagInfoList.length; i++){
                                var tag = res.tagInfoList[i];
                                var tagDetail = new Object();
                                tagDetail.isAlbumCheck = (tag.album == 1 ? true : false);
                                tagDetail.isArtistCheck = (tag.artist == 1 ? true : false);
                                tagDetail.isSongCheck = (tag.song == 1 ? true : false);
                                tagDetail.isHideCheck = (tag.tagState == -1 ? true : false);
                                //tagDetail.isHideCheck = false;
                                tagDetail.isFolderCheck = (tag.tagType == 2 ? true : false);
                                tagDetail.isMlsCheck = ((tag.tagAttribute == 1 || tag.tagAttribute == 3) ? true : false);
                                tagDetail.isQQCheck = ((tag.tagAttribute == 2 || tag.tagAttribute == 3) ? true : false);
                                tagDetail.name = tag.name;
                                tagDetail.id = tag.id;
                                tagDetail.qqCheck = 'qq';
                                tagDetail.mlsCheck = 'mls';
                                tagDetail.folderCheck = 'folder';
                                tagDetail.hideCheck = 'hide';
                                tagDetail.songCheck = 'song';
                                tagDetail.artistCheck = 'artist';
                                tagDetail.albumCheck = 'album';
                                tagDetail.isCheck = false;
                                $scope.tags.push(tagDetail);
                            }
                        });
                        $scope.checkSingle = function(data, datas){
                            console.log('进入了合并页面的复选框函数');
                            //console.log(data);
                            //console.log(datas);
                            for(var i = 0; i < datas.length; i++){
                                if(datas[i].id != data.id)
                                    datas[i].isCheck = false;
                            }
                            data.isCheck = !data.isCheck;
                            console.log(data.id);
                        };
                        //合并标签
                        $scope.mergeTags = function(datas){
                            var con = confirm('确认合并这些标签吗？');
                            if(con){
                                var mergeId = '';
                                var mergedIds = '';
                                var count = 0;
                                for(var i = 0; i < datas.length; i++){
                                    if(datas[i].isCheck){
                                        mergeId += datas[i].id + ',';
                                        count++;
                                    }
                                }
                                //拼接留下的ID
                                if(count == 0){
                                    //alert('需要勾选一个留下的标签');
                                    alertTipCommon($timeout,$rootScope,'需要勾选一个留下的标签',display);
                                    console.log('count:' + count);
                                    return;
                                } else if (count > 1){
                                    //alert('不能勾选超过1个标签');
                                    alertTipCommon($timeout,$rootScope,'不能勾选超过一个标签',display);
                                    console.log('count:' + count);
                                    return;
                                } else {
                                    mergeId = mergeId.substr(0, mergeId.length - 1);
                                    count = 0;
                                }
                                console.log(mergeId);
                                //拼接被合并的ID
                                for(var i = 0; i < datas.length; i++){
                                    if(!datas[i].isCheck){
                                        mergedIds += datas[i].id + ',';
                                        count++;
                                    }
                                }
                                if(count == 0){
                                    //alert('至少需要一个被合并的标签');
                                    alertTipCommon($timeout,$rootScope,'至少需要一个被合并的标签',display);
                                    console.log('count:' + count);
                                    return;
                                } else {
                                    mergedIds = mergedIds.substr(0, mergedIds.length - 1);
                                }
                                var url = tag_tree_url + 'mergeTagID.do?userId=' + tag_tree_user_id + '&mergeID=' + mergeId + '&mergedStr=' + mergedIds;
                                $http.get(url).success(function(res){
                                    if(res.message == 'success' && res.status == '000000'){
                                        //alert('合并成功');
                                        alertTipCommon($timeout,$rootScope,'合并成功',display);
                                        //location.reload();
                                        window.location.href = '/mls/resources/pages/top/top.html#/tag-tree';
                                        location.reload();
                                    } else {
                                        //alert('合并失败,返回信息:' + res);
                                        alertTipCommon($timeout,$rootScope,'合并失败，返回信息:' + JSON.stringify(res),display);
                                    }
                                }).error(function(res){
                                    //alert('合并失败');
                                    alertTipCommon($timeout,$rootScope,'合并失败',display);
                                });
                            }
                        };
                    }
                }
            }

        })
}

//复选框单选
//function checkSingle(isCheck, data,choseStr,choseArr){
//    if(isCheck == true){
//        choseStr = choseStr + data + ",";
//        data.isCheck = true;
//    } else {
//        choseStr.replace(data + ",", "");
//        data.isCheck = false;
//    }
//    if(choseStr.length = 0){
//        choseArr = [];
//    } else {
//        choseArr = (choseStr.substr(0,choseStr.length-1)).split(',');
//    }
//    return choseArr;
//};
var tagTreeSetting = {
    view: {
        // addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
        selectedMulti: false
    },
    check: {
        enable: true,
        chkboxType: {
            "Y": "",
            "N": ""
        }
    },
    data: {
        simpleData: {
            enable: true
        },
        keep: {
            //parent:true
        },
        key: {
            //name: "idName",
        }
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false,
        renameTitle: "修改标签名字"
    },
    callback:{
        //beforeRemove:zTreeBeforeRemove,
        onCheck: tagTreeOnCheck,
        beforeRename: zTreeBeforeRename,
        onClick: zTreeOnClick
    }
};

//var zNodes =[
//    { id:1, pId:0, name:"语言", open:true},
//    { id:11, pId:1, name:"日语"},
//    { id:12, pId:1, name:"国语"},
//    { id:111, pId:12, name:"汉语"},
//    { id:112, pId:12, name:"闽南语"},
//    { id:113, pId:12, name:"藏语"},
//    { id:114, pId:12, name:"蒙古语"},
//    { id:13, pId:1, name:"英语"},
//    { id:14, pId:1, name:"韩语"},
//    { id:15, pId:1, name:"法语"},
//    { id:17, pId:1, name:"纯音乐"},
//    { id:2, pId:0, name:"风格"},
//    { id:21, pId:2, name:"轻音乐"},
//    { id:22, pId:2, name:"拉丁"},
//    { id:23, pId:2, name:"民谣"},
//    { id:23, pId:2, name:"流行"},
//    { id:23, pId:2, name:"爵士"},
//    { id:23, pId:2, name:"古典", isHidden:true},
//    { id:3, pId:0, name:"人声", isParent:true}
//];

var newCount = 0;
function addHoverDom(treeId, treeNode) {
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
    var removeStr = "<span class='button remove' id='removeBtn_" + treeNode.tId
        + "' title='删除标签' onfocus='this.blur();'></span>";
    if(treeNode.pId != null && treeNode.pId != undefined && treeNode.pId != ""){
        sObj.after(removeStr);
    }
    var editStr = "<span class='button edit' id='editBtn_" + treeNode.tId
        + "' title='修改标签名字' onfocus='this.blur();'></span>";
    if(treeNode.pId != null && treeNode.pId != undefined && treeNode.pId != ""){
        sObj.after(editStr);
    }
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
        + "' title='添加子标签' onfocus='this.blur();'></span>";
    sObj.after(addStr);

    //绑定添加按钮的事件
    var addbtn = $("#addBtn_"+treeNode.tId);
    if (addbtn) addbtn.bind("click", function(){
        console.log(tag_tree_url + "addTagsFolder.do?folderFatherNum=" + treeNode.id + "&folderName=new node" + (newCount + 1) +"&userId=" + tag_tree_user_id + "&folderState=10&folderDesc=");
        $.ajax({
            url: tag_tree_url + "addTagsFolder.do?folderFatherNum=" + treeNode.id + "&folderName=new node" + (newCount + 1) +"&userId=" + tag_tree_user_id + "&folderState=10&folderDesc=",
            type: "get",
            dataType: "jsonp",
            data: "",
            cache: false,
            async: false,
            success: function(res){
                if (res.message == "success" && res.status == "000000"){
                    console.log("添加节点成功");
                    alert("添加节点成功");
                    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                    zTree.addNodes(treeNode, {id:res.objId,pId:treeNode.id, name:"new node" + (++newCount)});
                    //zTree.addNodes(treeNode, {id:100+newCount,pId:treeNode.id, name:"new node" + (newCount++)});
                } else {
                    alert("添加节点失败");
                }
            },
            error: function(){
                alert("请求出错");
            }
        });

        return false;
    });
    //绑定重命名按钮
    var editbtn = $("#editBtn_"+treeNode.tId);
    if (editbtn) editbtn.bind("click", function(){
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        treeObj.editName(treeNode);
    });
    //绑定删除按钮的事件
    var removebtn = $("#removeBtn_"+treeNode.tId);
    if (removebtn) removebtn.bind("click", function(){
        console.log(tag_tree_url + "delTagsFolder.do?userId=" + tag_tree_user_id + "&folderId=" + treeNode.id);
        if(treeNode.children != null && treeNode.children != undefined && treeNode.children.length > 0){    //
            alert(treeNode.name + '下面还有子标签，不能删除');
            return false;
        } else {
            var con = confirm('确认删除' + treeNode.name + '标签吗？');
            if (con){
                //var flag = false;
                var url = tag_tree_url + "delTagsFolder.do?userId=" + tag_tree_user_id + "&folderId=" + treeNode.id;
                console.log(url);
                $.ajax({
                    url: tag_tree_url + "delTagsFolder.do?userId=" + tag_tree_user_id + "&folderId=" + treeNode.id,
                    type: "get",
                    dataType: "jsonp",
                    data: "",
                    cache: false,
                    async: false,
                    success: function(res){
                        if (res.message == "success" && res.status == "000000"){
                            console.log("删除节点" + treeNode.name + "成功");
                            alert("删除节点" + treeNode.name + "成功");
                            //flag = true;
                            var treeObj = $.fn.zTree.getZTreeObj(treeId);
                            treeObj.removeNode(treeNode);
                        } else {
                            alert("删除节点失败，返回信息:" + res.message + " " + res.status);
                            //return flag;
                        }
                    },
                    error: function(){
                        alert('连接错误');
                        //return false;
                    }
                });
                //console.log(flag);
                //return true;
            } else {
                return false;
            }
        }
    });
};
function removeHoverDom(treeId, treeNode) {
    $("#addBtn_"+treeNode.tId).unbind().remove();
    $("#editBtn_"+treeNode.tId).unbind().remove();
    $("#removeBtn_"+treeNode.tId).unbind().remove();
};

//设置成如果还有子项目，就弹出窗口，不让删除
//function zTreeBeforeRemove(treeId, treeNode){
//    console.log(treeNode.isHidden);
//    if(treeNode.children != null && treeNode.children != undefined && treeNode.children.length > 0){    //
//        alert(treeNode.name + '下面还有子标签，不能删除');
//        return false;
//    } else {
//        var res = confirm('确认删除' + treeNode.name + '标签吗？');
//        if (res){
//            return true;
//        } else {
//            return false;
//        }
//    }
//};
//捕获勾选事件，让选中的数据出现在右边
function tagTreeOnCheck(event, treeId, treeNode){
    //tag_tree_tags.length = 0;
    if(event != null && treeId != null && treeNode != null){
        //console.log(treeNode);
        //console.log(event);
        var tempIds = []
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        var nodes = zTree.getCheckedNodes(true);
        //if(treeNode.checked === true){
        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];
            tempIds.push(node.id);
        }
        tag_tree_tags = tempIds.join(',');
        //console.log(tag_tree_tags);
        //permissions.console.log(tag_tree_tags);
        //}

    }
};
var tagTreeId;
var tagTreeNode;
//重命名事件回调函数
function zTreeBeforeRename(treeId, treeNode, newName, isCancel) {
    tagTreeId = treeId;
    tagTreeNode = treeNode;
    console.log(isCancel);
    //console.log(treeNode);
    if(!isCancel){
        if(treeNode.pId == null || treeNode.pId == undefined || treeNode.pId == ""){
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            treeObj.cancelEditName();
            return false;
        }
        var url = tag_tree_url + 'updateTagsFolder.do?userId=' + tag_tree_user_id + '&folderId=' + treeNode.id + '&folderName=' + encodeURIComponent(newName) + '&folderFatherNum=' + treeNode.pId + '&folderState=0&folderDesc=';
        $.ajax({
            url: tag_tree_url + 'updateTagsFolder.do?userId=' + tag_tree_user_id + '&folderId=' + treeNode.id + '&folderName=' + encodeURIComponent(newName) + '&folderFatherNum=' + treeNode.pId + '&folderState=0&folderDesc=',
            type: "get",
            dataType: "json",
            data: "",
            cache: false,
            async: false,
            success: function(res){
                if (res.message == "success" && res.status == "000000"){
                    alert('修改名称成功');
                    return true;
                } else {
                    alert('修改名称失败，不能修改');
                    var treeObj = $.fn.zTree.getZTreeObj(tagTreeId);
                    treeObj.cancelEditName();
                    return false;
                }
            },
            error: function(res){
                console.log(res);
                alert('返回异常，重命名失败，请刷新此界面');
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                treeObj.cancelEditName();
                //return false;
            }
        });
    }
    //if(newName.length > 5){
    //    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    //    treeObj.cancelEditName();
    //    console.log("取消编辑");
    //    return false;
    //}
    //return true;
};
//点击事件回调函数
function zTreeOnClick(event, treeId, treeNode) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    treeObj.checkNode(treeNode, !treeNode.checked, false, true);
    //alert(treeNode.tId + ", " + treeNode.name);
};
