/**
 * Created by hao.cheng on 2016/6/24.
 * 统一获取编目记录列表service
 */
(function () {
    'use strict';

    angular.module('app.routes').service('CatalogService',CatalogService);

    CatalogService.$inject = ['$http', 'SweetAlert'];

    function CatalogService($http) {
        var _self = this;
        _self.service = {
            'getCatalogs' : getCatalogs,                //获取编目列表
            'createCatalogPre': createCatalogPre,       //创建编目数据
            'getCatalogPre': getCatalogPre,             //获取预编目ID
            'createCatalogTask': createCatalogTask      //创建编目工单未分配任务
        };
        
        function getCatalogs(songId) { //获取编目列表
            
            return $http.jsonp(catalog_list+'?songId='+songId+'&pageNo=1&pageSize=500&'+CALLBACK).then(function (res) {
                return res.data.data.list;
            });
        }
        function createCatalogPre(copyId,songId) {
            return $http.jsonp(CATALOG_CREATE + '?' + CALLBACK + '&copyrightId=' + copyId + '&songId=' + songId).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert, '创建编目接口请求异常', 'warning');
            });
        }
        function getCatalogPre(songId) {
            return $http.jsonp(CATALOG_GETPRE + songId + '.json?' + CALLBACK).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert, '获取预编目ID接口请求异常', 'warning');
            });
        }
        function createCatalogTask(startTime, endTime) {
            return $http.get(CATALOG_CREATETASK + '?startTime=' + startTime + '&endTime=' + endTime).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '创建编目工单任务接口请求异常', 'warning');
            })
        }
    }
})();