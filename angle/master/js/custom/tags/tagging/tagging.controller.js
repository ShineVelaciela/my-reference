/**
 * Created by hao.cheng on 2016/1/18.
 * tagging-controller
 */
angular.module('app.routes').config(taggingConfig);
taggingConfig.$inject = ['$stateProvider',  'RouteHelpersProvider'];
function taggingConfig($stateProvider,helper){
    $stateProvider
        .state('app.tagging',{
            url: '/tagging',
            templateUrl: 'app/views/tags/tagging/tagging.html',
            controller: function($http,$scope){
                $scope.params = {};
            }
        })
        .state('app.tagging.search',{
            url: '/search?:songIds&:songKeyword&:artistKeyword&:albumKeyword&:karakalStatu&:pageNo&:pageSize',
            views: {
                'tagging-list': {
                    templateUrl: 'app/views/tags/tagging/tagging-list.html',
                    controller: function($http,$scope,$stateParams,$state,$timeout,$rootScope,display,SweetAlert){
                        for(var p in $stateParams){//循环参数赋值
                            if($stateParams[p] == undefined){
                                $stateParams[p] = '';
                            }
                            if(p == 'pageSize' && checkEmpty($stateParams[p])) $stateParams[p] = 100;
                            $scope.params[p] = $stateParams[p];
                        }
                        if('songIds' in $scope.params){
                            $scope.params.songIds = JSON.parse("[" + $scope.params.songIds + "]");//将字符串转成数组
                        }
                        $http.jsonp(_search_song + '?' + CALLBACK + '&data=' + JSON.stringify($scope.params)).success(function(res){
                            paginationDiscreteness($scope,5,res.body.pageSize,res.body.totalCount,res.body.pageTotal,res.body.pageNo);
                            // paginationCommon($scope,5,res.body.pageSize,res.body.totalCount,res.body.pageTotal,res.body.pageNo);
                            var ids = [];
                            for(var i in res.body.list){
                                ids.push(res.body.list[i].songId);
                            }
                            $http.jsonp(list_url + 'song.json?' + CALLBACK + '&ids=' + ids.join(',')).success(function(resp){
                                $scope.datas = resp.data;
                            });
                        });
                        $scope.addPlaySong = function(songId,copyId){
                            addPlaySong(songId,copyId,SweetAlert);
                        }
                        $scope.taggingCheck = function(songId){
                            $http.jsonp(http_url + '/tagRel/edit/song/' + songId + '.json?' + CALLBACK).success(function(res){ //锁定打标签状态
                                if(res.status == 0){
                                    alertTipCommon($timeout,$rootScope,'状态锁定失败,不能打标签',display);
                                    return;
                                }else{
                                    alertTipCommon($timeout,$rootScope,'状态锁定成功',display);
                                }
                                $state.go('app.tagging.info',{songId:songId});    //状态锁定成功后进入打标签页面
                            })
                        }
                        $scope.choosePage = function(){
                            $state.go('app.tagging.search',{pageNo: $scope.bigCurrentPage});
                        };
                    }
                }
            }
        })
        .state('app.tagging.info',{
            url: '/info/:songId&:type&:taskId',
            views: {
                'tagging-page':{
                    templateUrl: 'app/views/tags/tagging/tagging-info.html',
                    resolve: helper.resolveFor('ztree'),
                    controller: function($http,$scope,$cookies,$stateParams,$timeout,$rootScope,display){
                        $scope.type = $stateParams.type;
                        $scope.taskId = $stateParams.taskId;
                        $http.jsonp(http_url+'/audit/opinion/song/'+$stateParams.songId+'.json?' + CALLBACK+'&source=1').success(function(res){    //获取审核意见列表
                            $scope.examine_datas =  res.data.list;
                            $http.get(git_user+ '&private_token=' +  $cookies.get('kpk')).success(function(res){
                                for(var i in $scope.examine_datas){
                                    for(var j in res){
                                        if($scope.examine_datas[i].userId == res[j].id){
                                            $scope.examine_datas[i].userName = res[j].name;
                                        }
                                    }
                                }
                            });
                        });
                        $http.jsonp(http_url + '/tagRel/query/song/' + $stateParams.songId + '.json?' + CALLBACK).success(function(res){//获取关联标签
                            $scope.tags = res.data.tags;
                        });
                        $http.jsonp(detail_url + 'song/' + $stateParams.songId + '.json?' + CALLBACK).success(function(res){//获取详情
                            $scope.detail = res.data;
                        });
                        var url = tag_alone_tree+'?'+CALLBACK+'&userId=12&materialType=3';
                        //tag_tree_url + 'getTagsTreeByUserId.do?userId=' + $cookies.kuid + '&' + CALLBACK
                        $http.get(url).success(function(res){
                            $scope.tagTreeNodes = res.tnList;
                            $.fn.zTree.init($("#treeDemo"), tagTreeSetting_tagging, $scope.tagTreeNodes);
                            var treeObj = $.fn.zTree.getZTreeObj('treeDemo');
                            expandAll('treeDemo');
                            collapseAll('treeDemo');

                            var lastValue = "", nodeList = [], fontCss = {};
                            var key = $('#key');
                            function searchNode(e) {
                                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                                var value = $.trim(key.get(0).value);
                                var keyType = "";
                                keyType = "name";
                                if (key.hasClass("empty")) {
                                    value = "";
                                }
                                if (lastValue === value) return;
                                lastValue = value;
                                if (value === "") return;
                                updateNodes(false);

                                nodeList = zTree.getNodesByParamFuzzy(keyType, value);

                                updateNodes(true);

                            }
                            function updateNodes(highlight) {
                                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                                for( var i=0, l=nodeList.length; i<l; i++) {
                                    nodeList[i].highlight = highlight;
                                    zTree.updateNode(nodeList[i]);
                                }
                            }
                            function focusKey(e) {
                                if (key.hasClass("empty")) {
                                    key.removeClass("empty");
                                }
                            }
                            function blurKey(e) {
                                if (key.get(0).value === "") {
                                    key.addClass("empty");
                                }
                            }
                            key.bind("focus", focusKey)
                                .bind("blur", blurKey)
                                .bind("propertychange", searchNode)
                                .bind("input", searchNode);

                            $('#datetimepicker').datetimepicker(dateConfig);
                            $('#datetimepicker2').datetimepicker(dateConfig);
                        });
                        $scope.tagging = function(songId){
                            var tagIds = [];
                            $("input[name=taggingCheck]:checked").each(function () {
                                var tag = {};
                                tag.tagId = $(this).val();
                                tag.type = 0;
                                tagIds.push(tag);
                            });
                            if(tagIds.length < 1){
                                alertTipCommon($timeout,$rootScope,'标签不能为空',display);
                                return;
                            }
                            var data = {};
                            data.rid = songId;
                            data.tags = tagIds;
                            data.page = 1;
                            $http.jsonp(tag_edi_new_update + 'song.json?' + CALLBACK + '&data=' + JSON.stringify(data)).success(function(res){
                                if(res.status == 1){
                                    alertTipCommon($timeout,$rootScope,'操作成功',display);
                                }else{
                                    alertTipCommon($timeout,$rootScope,'操作失败',display);
                                }
                            });
                        };
                        $scope.goBack = function(){//返回
                            history.back();
                        };
                        $scope.deleteAll = function(){
                            $('.W_btn_b.W_btn_tag').remove();
                        };
                        $scope.expandAll = function(){
                            expandAll('treeDemo');
                        };
                        $scope.collapseAll = function(){
                            collapseAll('treeDemo');
                        };
                        $scope.examine = function(data){
                            //console.log(data);
                            $http.jsonp(http_url+'/audit/songTag/' + $stateParams.taskId + '.json?rid='+$stateParams.songId+'&status='+data.status+'&opinion='+data.opinion + '&' + CALLBACK).success(function(res){
                                if(res.status == 1){
                                    alertTipCommon($timeout,$rootScope,'操作成功',display);
                                    history.back();
                                }else{
                                    alertTipCommon($timeout,$rootScope,'操作失败',display);
                                }
                            });
                        }
                    }
                }
            }
        })
        .state('material.taggingInfo',{
            url: '/taggingInfo?:songId&:returnBtn',
            title: '标签详情',
            views: {
                '': {
                    templateUrl: helper.basepath('tags/tagging/tagging-info.html'),
                    controller: 'TaggingInfoCtrl'
                }
            }
        })
        .state('material.taggingEdit', {
            url: '/taggingEdit?:songId&:taskId&:lastPage',
            title: '打标签',
            views: {
                '': {
                    templateUrl: helper.basepath('tags/tagging/tagging-info.html'),
                    resolve: helper.resolveFor('ztree'),
                    controller: 'TaggingEditCtrl'
                }
            }
        })

        .state('material.taggingCheck', {
            url: '/taggingCheck?:songId&:taskId',
            title: '标签抽查',
            views: {
                '': {
                    templateUrl: helper.basepath('tags/tagging/tagging-info.html'),
                    controller: 'TaggingCheckCtrl'
                }
            }
        })
        .state('material.taggingExamine',{
            url: '/taggingExamine?:songId&:lastPage&:taskId&:returnBtn',
            title: '标签审核',
            views: {
                '': {
                    templateUrl: helper.basepath('tags/tagging/tagging-info.html'),
                    controller: 'TaggingInfoCtrl'
                }
            }
        })}

/*标签页面系列controller*/
angular.module('app.routes').controller('TaggingInfoCtrl', function ($scope, $http, $sce, $stateParams, $cookies, SweetAlert) {
    getLastExamine($stateParams.songId, $scope);
    if($stateParams.returnBtn) $scope.returnBtn = $stateParams.returnBtn;
    if(window.location.href.indexOf("taggingExamine") != -1){
        $scope.examine = true;
    }
    basicRequest('song',catalogs,$scope,$http,$sce,$stateParams,$cookies,true);
    loadMoreRecord('song',$scope,$stateParams,$http,SweetAlert);
    $scope.examineConfirm = function(examineResult, examineSuggest){    //审核确认
        examineCommon('songTag',examineResult,examineSuggest,$http,$stateParams,SweetAlert);
    };
});
angular.module('app.routes').controller('TaggingEditCtrl', function ($scope, $http, $stateParams, $cookies, SweetAlert, BaseService) {
    $scope.tagging = true;
    basicRequest('song', catalogs, $scope, $http, null, $stateParams, $cookies, true);
    loadMoreRecord('song', $scope, $stateParams, $http, SweetAlert);
    $scope.tagging = function (tagExt) {
        var _tagIds = [];
        $("input[name=taggingCheck]:checked").each(function () {
            var tag = {tagId: $(this).val(), type: 0};
            _tagIds.push(tag);
        });
        if(_tagIds.length < 1) return sweetAlertCommon(SweetAlert, '标签不能为空', 'warning');
        var _data = {rid: $stateParams.songId, tags: _tagIds, page: 1};
        if(tagExt) tagExt.status = 1,_data.tagExt = tagExt;  //如果存在自定义标签则保存
        var _promise = BaseService.service.taggingAlone('song', 'data=' + JSON.stringify(_data));
        if(_promise) _promise.then(function (res) {
           if(res.status == 1) {
               pausePlay();
               if(!checkEmpty($stateParams.lastPage)) window.open(returnLastPage($stateParams.lastPage), '_self');
               else history.back();
           }
            else return sweetAlertCommon(SweetAlert, res.msg, 'error');
        });
    };
    //搜索选中打标签
    $scope.tagTagging = function(tag){
        var treeNode = tag;
        $('#'+treeNode.tId).children('a').addClass('checked');
        var nodes = $('.tag-content').children();
        var flag = true;
        for(var j = 0; j < nodes.length; j++){
            if(nodes[j].innerText.trim() == treeNode.name){
                flag = false;
                break;
            }
        }
        if(flag && treeNode.tagType == 0){
            $('.tag-content').append(getTag(treeNode.name,treeNode.id));
            if(treeNode.pId == '1001075733'){
                $('#language').append(
                    '<span class="tx label label-default tag"  >'+treeNode.name+'</span>'
                );
                var lTag = {};lTag.type = 15; lTag.tagName = treeNode.name;lTag.tagId = treeNode.id;
            }

        }
    };

    /*标签操作*/
    setTaggingTree($http, $scope);
    $scope.deleteAll = function(){
        sweetAlertConfirm(SweetAlert,function(){
            $('.level1').removeClass('checked');
            $('.W_btn_b.W_btn_tag').remove();
            sweetAlertCommon(SweetAlert, '删除成功', 'success');
        },undefined,'确认要删除全部标签?',undefined);
    };
    $scope.expandAll = function(){
        expandAll('treeDemo');
    };
    $scope.collapseAll = function(){
        collapseAll('treeDemo');
    };

});
angular.module('app.routes').controller('TaggingCheckCtrl', function ($scope, $http, $stateParams, $cookies, SweetAlert) {
    $scope.check = true;
    $scope.ckTagError = {};
    getLastExamine($stateParams.songId, $scope);
    basicRequest('song', catalogs, $scope, $http, null, $stateParams, $cookies, true);
    loadMoreRecord('song', $scope, $stateParams, $http, SweetAlert);
    $scope.checkMaterial = function(ckResult, ckSuggest, ckTagError){ //抽查提交按钮
        checkCommon('songTag',ckResult,ckSuggest,ckTagError,$http,$stateParams,SweetAlert);
    };
});

var tagTreeSetting_tagging = {
    view: {
        selectedMulti: false,
        fontCss: getFontCss,
        showLine: false
    },
    check: {
        enable: true,
        chkStyle: 'checkbox',
        chkboxType: {
            "Y": "p",
            "N": "s"
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
        beforeExpand: taggingTreeBeforeExpand,
        onExpand: taggingTreeOnExpand,
        onClick: taggingOnClick,
        onCollapse: taggingOnCollapse
    }
};
function taggingTreeBeforeExpand(treeId, treeNode){
    getChildrenNodes(treeNode);
}
function taggingTreeOnExpand(event,treeId, treeNode){
    // if(!checkEmpty(treeNode.children)) $('#'+treeNode.tId).css({'width': '100%'});
    getChildrenNodes(treeNode);
}
function taggingOnCollapse(event, treeId, treeNode) {
    // if(!checkEmpty(treeNode.children)) $('#'+treeNode.tId).css({'width': '150px'});
}
function getChildrenNodes(treeNode){
    if(treeNode.isParent){
        for(var i = 0; i < treeNode.children.length; i++){
            getChildrenNodes(treeNode.children[i]);
        }
    } else {
        $('#' + treeNode.getParentNode().tId).after("<div style=\"clear:both;\"></div>");
        $('#' + treeNode.tId).css('float','left');
    }
}
//展开标签树
function expandAll(id){
//		console.log($('#tagPage_' + id).html());
    var treeObj = $.fn.zTree.getZTreeObj(id);
    var nodes = treeObj.transformToArray(treeObj.getNodes());
    for(var i = 0; i< nodes.length; i++){
        var tagedNodes = $('.tag-content').children();
        for(var j = 0; j < tagedNodes.length; j++){     //已经打上的标签对标签树着色
            if(tagedNodes[j].innerText == nodes[i].name) $('#'+nodes[i].tId).children('a').addClass('checked');
        }
        treeObj.expandNode(nodes[i], true, false, false);
        if(!nodes[i].isParent && nodes[i].getParentNode() != undefined){
            // $('#' + nodes[i].getParentNode().tId).after("<div style=\"clear:both;\"></div>");
            $('#' + nodes[i].tId).css('float','left');
        }
    }
}
//折叠标签树
function collapseAll(id){
    var treeObj = $.fn.zTree.getZTreeObj(id);
    var nodes = treeObj.transformToArray(treeObj.getNodes());
    for(var i = 0; i< nodes.length; i++){
        treeObj.expandNode(nodes[i], false, false, false);
    }
}
//点击事件回调函数
function taggingOnClick(event, treeId, treeNode) {
    console.log('tagging');
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    if(treeNode.parentTId == null){
        treeObj.expandNode(treeNode);
        return;
    }
    treeObj.checkNode(treeNode, !treeNode.checked, true, true);
    var checkedNodes = treeObj.getCheckedNodes();

    //歌曲编辑页面语言标签预览特殊处理，放入本地存储
    var languageTags = [];
    for(var i = 0; i < checkedNodes.length; i++){
        $('#'+checkedNodes[i].tId).children('a').addClass('checked');
        var nodes = $('.tag-content').children();
        var flag = true;
        for(var j = 0; j < nodes.length; j++){
            if(nodes[j].innerText.trim() == checkedNodes[i].name){
                flag = false;
                break;
            }
        }
        if(flag && checkedNodes[i].tagType == 0){
            $('.tag-content').append(getTag(checkedNodes[i].name,checkedNodes[i].id));
            if(checkedNodes[i].pId == '1001075733'){
                $('#language').append(
                    '<span class="tx label label-default tag"  >'+checkedNodes[i].name+'</span>'
                );
                var lTag = {};lTag.type = 15; lTag.tagName = checkedNodes[i].name;lTag.tagId = checkedNodes[i].id;
                languageTags.push(lTag);
            }

        }
    }
    localStorage.setItem('languageTags',JSON.stringify(languageTags));
    // var nodes = treeObj.getSelectedNodes();
    console.log(treeNode);
    if(treeNode.checked == true && treeNode.tagType == 0){
        $('#'+treeNode.tId).children('a').addClass('checked');
        console.log($('.tag-content').children());
        var nodes = $('.tag-content').children();
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i].innerText == treeNode.name) return;
        }
        // $('.tag-content').append(getTag(treeNode.name,treeNode.id));
    }else{
        $('#'+treeNode.tId).children('a').removeClass('checked');
        $('#'+treeNode.id).parent().remove();
        // $('#'+treeNode.tId).children('a').removeClass('checked');
        treeObj.checkNode(treeNode, false, true, true);
        treeNode.checked = false;
        var childrenNodes = getAllChildNode(treeNode, []);
        childrenNodes.forEach(function(node){
            $('#'+node.tId).children('a').removeClass('checked');
            $('input[value=' + node.id + ']').parent().remove();
        });
        // removeTag($('input[value=' + treeNode.id + ']').prev());
    }
    //console.log(nodes);
    //alert(treeNode.tId + ", " + treeNode.name);
};
function getTag(name,id){
    var tag_str = '<span action-type="check" title="'+name+'" class="W_btn_b W_btn_tag"> ' +
        '<span class="W_arrow_bor W_arrow_bor_l"><i class="S_line3"></i><em class="S_bg2_br"></em></span> ' +
        '<i id="'+id+'">'+name+'</i>&nbsp;&nbsp; <em class="fa fa-remove" onclick="removeTag(this);"></em> ' +
        '<input type="checkbox" name="taggingCheck" style="display:none;" ng-model="taggingCheck" checked="checked" value="'+id+'"> </span>';
    return tag_str;
}
function getFontCss(treeId, treeNode) {
    return (!!treeNode.highlight) ? {color:"rgb(255, 0, 10)", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"};
}

