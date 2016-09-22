/**
 * Created by hao.cheng on 2016/7/25.
 */
(function () {
    'use strict';

    angular.module('app.routes').service('PreCatalogService',PreCatalogService);
    PreCatalogService.$inject = ['$http','SweetAlert'];
    function PreCatalogService($http,SweetAlert) {
        var _self = this;
        _self.service = {
            'preCatalogSearch': preCatalogSearch,
            'deleteCatalog': deleteCatalog,
            'preCatalogExport': preCatalogExport,
            'preCatalogConfirm': preCatalogConfirm
        };
        function preCatalogSearch(data) {   //预编目工单搜索
            return $http.jsonp(SEARCH_PRECATALOG + '?' + CALLBACK + '&data=' + data).then(function (res) {
                return res.data;
            },function () {
               sweetAlertCommon(SweetAlert,'预编目搜索接口请求异常','warning');
            });
        }
        function deleteCatalog(copyrightIds) {  //删除编目记录
            return $http.jsonp(CATALOG_DELETE + '?' + CALLBACK + '&copyrightIds=' + copyrightIds).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'编目删除接口请求异常','warning');
            });
        }
        function preCatalogExport(data) { //预编目导出
            return $http.jsonp(CATALOG_EXPORT + '?' + CALLBACK + '&data=' + data).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert, '预编目导出接口请求异常', 'warning');
            });
        }
        function preCatalogConfirm(copyIds) { //预编目数据强制确认完成
            return $http(new PostSetup(CATALOG_CONFIRM, 'copyrightIds=' + copyIds)).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '预编目强制确认接口请求异常', 'warning');
            })
        }
    }
}());