/**
 * Created by hao.cheng on 2016/8/16.
 */
(function () {
    'use strict';

    angular.module('app.routes').service('DictionaryService', DictionaryService);
    DictionaryService.$inject = ['$http', 'SweetAlert', '$q'];
    function DictionaryService($http, SweetAlert, $q) {
        var _self = this,_deferred = $q.defer();
        _self.service = {
            'search': search,
            'saveDic': saveDic,
            'deleteDic': deleteDic
        };
        
        function search(type, data) {
            return httpRequest(DICTIONARY_SEARCH + type + '.json', data, '数据字典搜索接口请求异常');
        }
        function saveDic(type, data) {
            return httpRequest(DICTIONARY_SAVE + type + '.json', data, '数据字典保存接口请求异常');
        }
        function deleteDic(type, id, data) {
            return httpRequest(DICTIONARY_DELETE + type + '/' + id + '.json', data, '数据字典删除接口请求异常');
        }

        function httpRequest(url, data, errMsg) {
            return $http(new PostSetup(url, 'data=' + data)).then(function (res) {
                // _deferred.resolve(res);
                // return _deferred.promise;
                return res.data;
            }, function (err) {
                sweetAlertCommon(SweetAlert, errMsg, 'warning');
            })
        }
    }
})();