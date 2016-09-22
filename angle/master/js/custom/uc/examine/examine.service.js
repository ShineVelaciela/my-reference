/**
 * Created by hao.cheng on 2016/7/19.
 */
(function () {
    'use strict';
    angular.module('app.routes').service('ExamineService',ExamineService);
    ExamineService.$inject = ['$http','SweetAlert'];
    function ExamineService($http,SweetAlert) {
        this.service = {
            'batchExamine': batchExamine
        };
        function batchExamine(data) {
            return $http.get(AUDITBATCH + '?data=' + data).then(function (res) {
                return res.data;
            },function () {
                sweetAlertCommon(SweetAlert,'批量审核接口请求异常','warning');
            });
        }
    }
}());