/**
 * Created by YuChunzhuo-Dev on 2016/8/2.
 */
(function () {
    'use strict';
    angular.module('app.routes').service('CheckService',CheckService);
    CheckService.$inject = ['$http','SweetAlert'];
    function CheckService($http,SweetAlert) {
        this.service = {
            'batchDelete': batchDelete
        };
        function batchDelete(type, data) {
            return $http(new PostSetup(_search_url + 'checkexport/' + type + 'TaskDel.json', data)).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'接口请求异常','warning');
            });
        }
    }
})();