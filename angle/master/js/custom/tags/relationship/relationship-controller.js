/**
 * Created by YuChunzhuo on 2015/12/1.
 */
var relationship_tree_tags = '';
var relationship_user_id = '';
//var tag_tree_checked = [];
angular.module('app.routes').config(relationshipConfig);
relationshipConfig.$inject = ['$stateProvider',  'RouteHelpersProvider'];
function relationshipConfig($stateProvider,helper){
    $stateProvider
        .state('app.relationship',{
            url:'/relationship',
            title: '设置标签对应关系',
            templateUrl:'app/views/tags/relationship/relationship.html',
            resolve: helper.resolveFor('ztree'),
            controller:function($scope, $http,permissions,$uibModal,$timeout,$rootScope,display){
                $scope.tags = [];
                $scope.cps = [];
                relationship_user_id = _session.id;
                $http.get(tag_tree_url + "getTagsTreeByUserId.do?userId=" + relationship_user_id ).success(function(res){
                    for(var i = 0; i < res.treeEntityList.length; i++){
                        if(res.treeEntityList[i].tagType == 0) res.treeEntityList[i].iconSkin = 'pIcon01';
                    }
                    $scope.relationshipTreeNodes = res.treeEntityList;
                    $.fn.zTree.init($("#relationshipTree"), relationshipTreeSetting, $scope.relationshipTreeNodes);
                });

                //获取有多少个公司
                $http.get(tag_tree_url + 'findCpInfo.do?userId=' + relationship_user_id).success(function(res){
                    if(res.message == 'success'){
                        for(var i = 0; i < res.cpInfoList.length; i++){
                            var newCp = new Object();
                            newCp.cpId = res.cpInfoList[i].cpId;
                            newCp.cpName = res.cpInfoList[i].cpName;
                            $scope.cps.push(newCp);
                        }
                        $("#dynamicspan9").css("width", (234 + $scope.cps.length * 166) + "px");
                        //$("#body").css("width", (478 + $scope.cps.length * 166) + "px");
                        $("#body").css("width", (594 + $scope.cps.length * 166) + "px");
                        //console.log($scope.cps);
                    }else{
                        //alert('网络错误');
                        alertTipCommon($timeout,$rootScope,'网络错误',display);
                    }
                });

                //显示勾选的标签
                $scope.show = function(){
                    $scope.tags = [];
                    if(relationship_tree_tags.length <= 0){
                        //alert('根本就没有勾选标签，请不要逗我好吗');
                        alertTipCommon($timeout,$rootScope,'根本就没有勾选标签，请不要逗我好吗',display);
                        return;
                    }
                    $http.get(tag_tree_url + 'getTagCpRel.do?userId=' + relationship_user_id + '&tagId=' + relationship_tree_tags).success(function(res){
                        console.log(res);
                        if(res.status == 000000){
                            //获取未计算权重完成的标签

                            $http.jsonp(http_tag_url + 'cpx/list.json?callback=JSON_CALLBACK&tids=' + relationship_tree_tags).success(function(res1){
                                //console.log(res1);
                                //console.log(res);
                                var uncompleteTag = [];
                                if(res1.status == 1){
                                    for(var i = 0; i < res1.data.length; i++){
                                        if(res1.data[i].htp == 'add'){
                                            uncompleteTag.push(res1.data[i]);
                                        }
                                    }
                                }
                                //});
                                for(var i = 0; i < res.tagCpList.length; i++){
                                    //把res里面的单个标签结果放入一个hashMap
                                    var tempRes = res.tagCpList[i].ttcrList;
                                    var cpsMap = new HashMap();
                                    for(var j = 0; j < tempRes.length; j++){
                                        if(cpsMap.containsKey(tempRes[j].cpId)){
                                            var cp = cpsMap.get(tempRes[j].cpId);
                                            var cpTag = new Object();
                                            cpTag.cpTagId = tempRes[j].cpTagId;
                                            cpTag.cpTagName = tempRes[j].cpTagName;
                                            cpTag.cptagType = tempRes[j].cpTagType;
                                            cpTag.cpTagTypeValue = tempRes[j].cpTagTypeValue;

                                            cpTag.status = 'complete';
                                            for(var k = 0; k < uncompleteTag.length; k++){
                                                if(res.tagCpList[i].tagInfo.tagId == uncompleteTag[k].tagId && tempRes[j].cpId == uncompleteTag[k].siteId && cpTag.cpTagName == uncompleteTag[k].relTagName){
                                                    cpTag.status = 'calculation';
                                                    //console.log('判断成功');
                                                }
                                            }
                                            cp.tags.push(cpTag);
                                            cpsMap.put(cp.cpId, cp);
                                        }else{
                                            var cp = new Object();
                                            cp.cpId = tempRes[j].cpId;
                                            cp.cpName = tempRes[j].cpName;
                                            cp.tagId = tempRes[j].tagId;
                                            cp.tagName = tempRes[j].tagName;
                                            var cpTag = new Object();
                                            cpTag.cpTagId = tempRes[j].cpTagId;
                                            cpTag.cpTagName = tempRes[j].cpTagName;
                                            cpTag.cptagType = tempRes[j].cpTagType;
                                            cpTag.cpTagTypeValue = tempRes[j].cpTagTypeValue;
                                            cp.tags = [];

                                            cpTag.status = 'complete';
                                            for(var k = 0; k < uncompleteTag.length; k++){
                                                //console.log(res.tagCpList[i].tagInfo.tagId);
                                                if(res.tagCpList[i].tagInfo.tagId == uncompleteTag[k].tagId && tempRes[j].cpId == uncompleteTag[k].siteId && cpTag.cpTagName == uncompleteTag[k].relTagName){
                                                    cpTag.status = 'calculation';
                                                    //console.log('判断成功');
                                                }
                                            }
                                            cp.tags.push(cpTag);
                                            cpsMap.put(cp.cpId, cp);
                                            //console.log(cp);
                                        }
                                    }
                                    //console.log(cpsMap.values());
                                    //按照获取的所有cps建立一个tagcps，每一个通过ID去匹配res的hashmap
                                    var tagCps = [];
                                    for(var j = 0; j < $scope.cps.length; j++){
                                        var tagCp = new Object();
                                        //tagCp.tagId = res.tagCpList;
                                        tagCp.cpId = $scope.cps[j].cpId;
                                        tagCp.cpName = $scope.cps[j].cpName;
                                        if(cpsMap.containsKey(tagCp.cpId)){
                                            tagCp.cpTags = cpsMap.get(tagCp.cpId).tags;
                                        }else{
                                            tagCp.cpTags = [];
                                        }
                                        tagCps.push(tagCp);
                                    }
                                    //console.log(tagCps);
                                    var tagDetail = new Object();
                                    tagDetail.tagName = res.tagCpList[i].tagInfo.tagName;
                                    tagDetail.tagId = res.tagCpList[i].tagInfo.tagId;
                                    tagDetail.cps = tagCps;
                                    //console.log(tagDetail);
                                    var flag = true;
                                    for(var m = 0; m < $scope.tags.length; m++){
                                        if($scope.tags[m].tagId == tagDetail.tagId){
                                            flag = false;
                                        }
                                    }
                                    if(flag){
                                        $scope.tags.push(tagDetail);
                                    }
                                }
                            });
                        }else{
                            //alert('返回结果错误：'+ res);
                            alertTipCommon($timeout,$rootScope,'返回结果错误:' + JSON.stringify(res),display);
                        }
                    });
                };
                //搜索单个标签
                $scope.searchTag = function(t){
                    //console.log(t);
                    $http.get(tag_tree_url + 'getTagCpRel.do?userId=' + relationship_user_id + '&tagId=' + t.id).success(function(res){
                        if(res.status == 000000){
                            //获取未计算权重完成的标签
                            $http.jsonp(http_tag_url + 'cpx/list.json?callback=JSON_CALLBACK&tids=' + t.id).success(function(res1) {
                                //console.log(res1);
                                //console.log(res);
                                var uncompleteTag = [];
                                if (res1.status == 1) {
                                    for (var i = 0; i < res1.data.length; i++) {
                                        if (res1.data[i].htp == 'add') {
                                            uncompleteTag.push(res1.data[i]);
                                        }
                                    }
                                }
                                //});
                                for(var i = 0; i < res.tagCpList.length; i++){
                                    //把res里面的单个标签结果放入一个hashMap
                                    var tempRes = res.tagCpList[i].ttcrList;
                                    var cpsMap = new HashMap();
                                    for(var j = 0; j < tempRes.length; j++){
                                        if(cpsMap.containsKey(tempRes[j].cpId)){
                                            var cp = cpsMap.get(tempRes[j].cpId);
                                            var cpTag = new Object();
                                            cpTag.cpTagId = tempRes[j].cpTagId;
                                            cpTag.cpTagName = tempRes[j].cpTagName;
                                            cpTag.cptagType = tempRes[j].cpTagType;
                                            cpTag.cpTagTypeValue = tempRes[j].cpTagTypeValue;

                                            cpTag.status = 'complete';
                                            for(var k = 0; k < uncompleteTag.length; k++){
                                                if(res.tagCpList[i].tagInfo.tagId == uncompleteTag[k].tagId && tempRes[j].cpId == uncompleteTag[k].siteId && cpTag.cpTagName == uncompleteTag[k].relTagName){
                                                    cpTag.status = 'calculation';
                                                    //console.log('判断成功');
                                                }
                                            }
                                            cp.tags.push(cpTag);
                                            cpsMap.put(cp.cpId, cp);
                                        }else{
                                            var cp = new Object();
                                            cp.cpId = tempRes[j].cpId;
                                            cp.cpName = tempRes[j].cpName;
                                            cp.tagId = tempRes[j].tagId;
                                            cp.tagName = tempRes[j].tagName;
                                            var cpTag = new Object();
                                            cpTag.cpTagId = tempRes[j].cpTagId;
                                            cpTag.cpTagName = tempRes[j].cpTagName;
                                            cpTag.cptagType = tempRes[j].cpTagType;
                                            cpTag.cpTagTypeValue = tempRes[j].cpTagTypeValue;
                                            cp.tags = [];

                                            cpTag.status = 'complete';
                                            for(var k = 0; k < uncompleteTag.length; k++){
                                                if(res.tagCpList[i].tagInfo.tagId == uncompleteTag[k].tagId && tempRes[j].cpId == uncompleteTag[k].siteId && cpTag.cpTagName == uncompleteTag[k].relTagName){
                                                    cpTag.status = 'calculation';
                                                    //console.log('判断成功');
                                                }
                                            }
                                            cp.tags.push(cpTag);
                                            cpsMap.put(cp.cpId, cp);
                                            //console.log(cp);
                                        }
                                    }
                                    //console.log(cpsMap.values());
                                    //按照获取的所有cps建立一个tagcps，每一个通过ID去匹配res的hashmap
                                    var tagCps = [];
                                    for(var j = 0; j < $scope.cps.length; j++){
                                        var tagCp = new Object();
                                        //tagCp.tagId = res.tagCpList;
                                        tagCp.cpId = $scope.cps[j].cpId;
                                        tagCp.cpName = $scope.cps[j].cpName;
                                        if(cpsMap.containsKey(tagCp.cpId)){
                                            tagCp.cpTags = cpsMap.get(tagCp.cpId).tags;
                                        }else{
                                            tagCp.cpTags = [];
                                        }
                                        tagCps.push(tagCp);
                                    }
                                    //console.log(tagCps);
                                    var tagDetail = new Object();
                                    tagDetail.tagName = res.tagCpList[i].tagInfo.tagName;
                                    tagDetail.tagId = res.tagCpList[i].tagInfo.tagId;
                                    tagDetail.cps = tagCps;
                                    console.log(tagDetail);
                                    //console.log($scope.tags);
                                    var flag = true;
                                    for(var m = 0; m < $scope.tags.length; m++){
                                        if($scope.tags[m].tagId == tagDetail.tagId){
                                            flag = false;
                                        }
                                    }
                                    if(flag){
                                        $scope.tags.push(tagDetail);
                                    }
                                }
                            });
                        }else{
                            //alert('返回结果错误：'+ res);
                            alertTipCommon($timeout,$rootScope,'返回结果错误:' + JSON.stringify(res),display);
                        }
                    });
                };
                //给某个媒资库标签对应的所有关系计算权重
                $scope.calWeight = function(tag){
                    console.log(tag);
                    var flag = false;
                    for(var i = 0; i < tag.cps.length; i++){
                        var cp = tag.cps[i];
                        if(cp.cpTags.length != 0){
                            flag = true;
                        }
                    }
                    if(!flag){
                        //alert('根本就没有关联标签，请不要逗我好吗');
                        alertTipCommon($timeout,$rootScope,'根本就没有关联标签，请不要逗我好吗',display);
                        return;
                    }
                    var con = confirm('确认提交计算权重吗？');
                    if(con){
                        for(var i = 0; i < tag.cps.length; i++){
                            var cp = tag.cps[i];
                            for(var j = 0; j < cp.cpTags.length; j++){
                                var cpTag = cp.cpTags[j];
                                var url = http_tag_url + 'cpx/add.json?callback=JSON_CALLBACK&siteId=' + tag.cps[i].cpId + '&tagCpRelId=' + tag.cps[i].cpTags[j].cpTagId;
                                console.log(url);
                                $http.jsonp(url).success(function(res){
                                    console.log(res);
                                });
                            }
                        }
                        //alert('提交成功');
                    }

                };

                //给某一个标签弹出一个层添加一个新的关联关系
                $scope.open = function(tag){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'myModalContent.html',
                        controller: 'tagRelationshipCtrl',
                        resolve: {
                            tag: function () {
                                return tag;
                            },
                            cps: function(){
                                return $scope.cps;
                            }
                        }
                    });
                };
            }
        })
}

//编辑弹出层
angular.module('app.routes').controller('tagRelationshipCtrl', function ($scope, $uibModalInstance, $http, tag, $timeout, $rootScope, display) {
    $scope.tag = tag;
    $scope.selectedCp;
    //添加标签
    $scope.addCpRel = function(){
        if($scope.selectedCp == undefined || $scope.selectedCp == null || $scope.selectedCp == ''){
            //alert('没有选择公司');
            alertTipCommon($timeout,$rootScope,'没有选择公司',display);
            return;
        }
        //if($scope.selectedCpType == undefined || $scope.selectedCpType == null || $scope.selectedCpType == ''){
        //    //alert('没有选择类型');
        //    return;
        //}
        if($scope.addCpTagName == undefined || $scope.addCpTagName == null || $scope.addCpTagName == ''){
            //alert('没有输入标签名字');
            alertTipCommon($timeout,$rootScope,'没有输入标签名字',display);
            return;
        }
        var tempCp;
        var tempI;
        for(var i = 0; i < $scope.tag.cps.length; i++){
            if($scope.tag.cps[i].cpName == $scope.selectedCp){
                tempCp = $scope.tag.cps[i];
                tempI = i;
                console.log(tempCp);
                console.log(tempI);
            }
        }
        //添加标签映射关系
        var url = tag_tree_url + 'addTagCpRel.do?callback=JSON_CALLBACK&userId=' + relationship_user_id + '&tagId=' + tag.tagId + '&cpId=' + tempCp.cpId + '&cpName=' + tempCp.cpName + '&cpTagName=' + $scope.addCpTagName + '&cpTagType=3&cpTagTypeValue=0';
        console.log(url);
        $http.jsonp(url).success(function(res){
            console.log(res);
            if(res.message == 'success'){
                var newTag = new Object();
                newTag.cpTagId = res.objId;
                newTag.cpTagName = $scope.addCpTagName;
                newTag.cptagType = $scope.selectedCpType;
                newTag.cpTagTypeValue = 0;
                newTag.status = 'calculation';
                //计算权重
                $http.jsonp(http_tag_url + 'cpx/add.json?callback=JSON_CALLBACK&siteId=' + tempCp.cpId + '&tagId=' + tag.tagId + '&relTagName=' + $scope.addCpTagName+ '&htp=add').success(function(res){
                    console.log(res);
                    if(res.status != 1){
                        newTag.status = 'exception';
                        //alert('提交计算失败，请重新操作');
                        alertTipCommon($timeout,$rootScope,'提交计算失败，请重新操作',display);
                    }
                });
                console.log(newTag);
                $scope.tag.cps[tempI].cpTags.push(newTag);
            }
        });

    };

    //删除标签
    $scope.deleteTag = function(cpTag){
        console.log(cpTag);
        //console.log($scope.tags);
        //删除关联关系
        var url = tag_tree_url + 'delTagCpRel.do?userId=' + relationship_user_id + '&tagId=-1&tagCpId=' + cpTag.cpTagId;
        console.log(url);
        $http.get(url).success(function(res){
            if(res.message == 'success'){
                var tempCpId = 0;
                for(var i = 0; i < $scope.tag.cps.length; i++){
                    var cp = $scope.tag.cps[i];
                    for(var j = 0; j < cp.cpTags.length; j++){
                        if(cp.cpTags[j].cpTagId == cpTag.cpTagId){
                            tempCpId = cp.cpId;
                        }
                    }
                }
                //计算权重
                $http.jsonp(http_tag_url + 'cpx/add.json?callback=JSON_CALLBACK&siteId=' + tempCpId + '&tagId=' + $scope.tag.tagId + '&relTagName=' + cpTag.cpTagName+ '&htp=delete').success(function(res){
                    console.log(res);
                    if(res.status != 1){

                    }
                });
                var tempI;
                var tempJ;
                for(var i = 0; i < $scope.tag.cps.length; i++){
                    var cp = $scope.tag.cps[i];
                    for(var j = 0; j < cp.cpTags.length; j++){
                        if(cpTag.cpTagId == cp.cpTags[j].cpTagId){
                            tempI = i;
                            tempJ = j;
                        }
                    }
                }
                $scope.tag.cps[tempI].cpTags.splice(tempJ,1);
            }
        });
    };

    $scope.ok = function () {
        console.log(tag);
    };

    $scope.cancel = function () {

        $uibModalInstance.dismiss('cancel');
    };
});

var relationshipTreeSetting = {
    view: {
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
        }
    },
    edit: {
        //enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    callback:{
        onCheck: relationshipTreeOnCheck,
        onClick: relationshipTreeOnClick
    }
};
//check事件
function relationshipTreeOnCheck(event, treeId, treeNode){
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
        relationship_tree_tags = tempIds.join(',');
        console.log(relationship_tree_tags);
        //permissions.console.log(tag_tree_tags);
        //}
    }
};
//点击事件回调函数
function relationshipTreeOnClick(event, treeId, treeNode) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    treeObj.checkNode(treeNode, !treeNode.checked, false, true);
    //alert(treeNode.tId + ", " + treeNode.name);
};