/**
 * Created by YuChunzhuo-Dev on 2016/8/8.
 * 系统常量service
 */
(function(){
    'use strict';
    angular.module('app.routes').service('ConstantService', ConstantService);
    ConstantService.$inject = ['$http','SweetAlert'];
    function ConstantService($http, SweetAlert){
        var config_url = http_url + '/config/';
        var _self = this;
        _self.service = {
            'query':query,
            'save':save,
            'remove':remove,
            'info':info
        };
        _self.method = {
            'getDatas':getDatas,
            'deleteData':deleteData,
            'saveData':saveData,
            'detailData':detailData
        };

        function query(params){
            var url = config_url + 'query.json?' + formatObject4Url(params);
            return $http.get(url).then(function(res){
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '系统常量接口请求异常', 'warning');
            });
        }
        function save(data){
            var url = config_url + 'save.json';
            console.log(url);
            return $http(new PostSetup(url, 'data=' + data)).then(function(res){
            // return $http.jsonp(url).then(function(res){
                return res.data;
            }, function(){
                sweetAlertCommon(SweetAlert, '系统常量接口请求异常', 'warning');
            });
        }
        function remove(key){
            var url = config_url + 'remove/' + key + '.json';
            return $http.get(url).then(function(res){
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '系统常量接口请求异常', 'warning');
            });
        }
        function info(key){
            var url = config_url + 'info/' + key + '.json';
            return $http.get(url).then(function(res){
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '系统常量接口请求异常', 'warning');
            });
        }

        function getDatas($scope, $stateParams){
            var params = cloneOneObject($stateParams);
            var _promise = _self.service.query(params);
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1)
                        $scope.datas = res.data;
                    else
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                })
            }
        }

        function deleteData(key){
            var _promise = _self.service.remove(key);
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        sweetAlertCall(SweetAlert,res.msg,'success',null,function () {
                            location.reload();
                        });
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                })
            }
        }

        function saveData(data, $state){
            var _promise = _self.service.save(angular.toJson(data));
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        sweetAlertCall(SweetAlert,res.msg,'success',null,function () {
                            $state.go('app.constant.list');
                        });
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                })
            }
        }

        function detailData($scope, key){
            var _promise = _self.service.info(key);
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        $scope.data = res.data;
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                });
            }
        }

    };
})();