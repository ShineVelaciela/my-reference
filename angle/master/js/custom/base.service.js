/**
 * Created by hao.cheng on 2016/7/6.
 */
(function () {
    'use strict';

    angular.module('app.routes').service('BaseService',BaseService);
    BaseService.$inject = ['$http','SweetAlert'];
    function BaseService($http,SweetAlert) {
        var preData = {};   //预览功能
        var _self = this;
        _self.service = {
            'changeDataStatus': changeDataStatus,
            'setPreData': setPreData,
            'getPreData': getPreData,
            'getList': listByIds,
            'mergeData': mergeData,
            'batchUpdate': batchUpdate,
            'getTagTree': getTagTree,
            'excludeIsolateData': excludeIsolateData,
            'clearExcelSearch': clearExcelSearch, //清空excel
            'taggingAlone': taggingAlone, //单独的打标签
            'taggingAloneCheck': taggingAloneCheck  //单独打标签验证权限
        };
        function changeDataStatus(type,id,status) { //改变数据状态
            return $http.get(CHANGEDATASTATUS + type + '/' + id + '/' + status + '.json').then(function (res) {
                if(res.data.status == 1) sweetAlertCommon(SweetAlert,res.data.msg,'success');
                else sweetAlertCommon(SweetAlert,res.data.msg,'error');
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'请求接口异常','warning');
            });
        }
        function setPreData(data) { //设置预览对象
            preData = Object.create(data);
        }
        function getPreData(){  //获取预览对象
            return preData;
        }
        function listByIds(ids,type) {  //通过id查询数据列表
            return $http.jsonp(list_url + type + ".json?ids=" + ids + '&' + CALLBACK).then(function(res){
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'请求接口异常','warning');
            });
        }
        function mergeData(data,type) { //合并数据接口
            return $http.get(MERGE_NEW + type + '.json?data='+data).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'请求接口异常','warning');
            })
        }
        function batchUpdate(data,type) { //批量修改
            var _postSet = new PostSetup(BATCHUPDATE + type + '.json', 'data=' + data);
            return $http(_postSet).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'接口请求异常','warning');
            });
        }
        function getTagTree(materialType,maxLevel) { //获取标签树
            return $http.get(tag_alone_tree + '?materialType=' + materialType + '&maxLevel=' + maxLevel).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'标签树请求异常','warning');
            });
        }
        function excludeIsolateData(data,type) {
            var promise = function () {
                return $http.jsonp(_search_url+'search/'+type+'.json?data=' + data + '&' + CALLBACK).then(function (res) {
                    return res.data;
                });
            }();
            var ids = [];
            return promise.then(function (res) {
                res.body.list.forEach(function (val) {
                    ids.push(val[type + 'Id']);
                });
                if(ids.length > 0)
                    return _self.service.getList(ids,type);
            });

        }
        function clearExcelSearch(type) { //清空excel
            return $http.jsonp(SEARCH_CLEAREXCEL + '?type=' + type + '&' + CALLBACK).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert, '清空excel查询接口请求异常', 'warning');
            })
        }
        function taggingAlone(type, data) { //单独打标签
            return $http(new PostSetup(tag_edi_new_update + type + '.json', data)).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '打标签接口请求异常', 'warning');
            })
        }
        function taggingAloneCheck(type, id, taskId) {
            var url = TAG_EDIT_NEW_CHECK + type + '/' + id + '.json?'+ CALLBACK;
            if(taskId) url += '&taskId=' + taskId;
            return $http.jsonp(url).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '打标签权限验证接口请求异常', 'warning');
            })
        }
    };
})();
