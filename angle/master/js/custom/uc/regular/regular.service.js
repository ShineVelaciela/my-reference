/**
 * Created by YuChunzhuo-Dev on 2016/8/22.
 */
(function() {
    'use strict';
    angular.module('app.routes').service('RegularService', RegularService);
    RegularService.$inject = ['$http', 'SweetAlert', '$timeout'];
    function RegularService($http, SweetAlert, $timeout){
        var vm = this;

        vm.service = {
            'query':query,
            'save':save,
            'remove':remove,
            'info':info,
            'resumeTask':resumeTask,    //禁用一个任务
            'pauseTask':pauseTask           //启用一个后台任务
        };
        vm.method = {
            'getDatas':getDatas,
            'deleteData':deleteData,
            'saveData':saveData,
            'detailData':detailData,
            'enableOrDisable':enableOrDisable
        };

        function query(params){
            var url = REGULAR_URL + "getTaskList.action?" + formatObject4Url(params);
            return HttpGET(url);
        }
        function save(data){
            var url = REGULAR_URL + "saveTask.action";
            return HttpPost(url, data);
        }
        function remove(key){
            var url = REGULAR_URL + "deleteTask.action";
            return HttpPost(url, "taskId=" + key);
        }
        function info(key){
            var url = REGULAR_URL + "getTask.action?taskId=" + key;
            return HttpGET(url);
        }
        function resumeTask(key){
            var url = REGULAR_URL + "resumeTask.action";
            return HttpPost(url, "taskId=" + key);
        }
        function pauseTask(key){
            var url = REGULAR_URL + "pauseTask.action";
            return HttpPost(url, "taskId=" + key);
        }

        function getDatas($scope, $stateParams){
            var params = cloneOneObject($stateParams);
            var _promise = vm.service.query(params);
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        $scope.datas = res.data.list;
                        paginationDiscreteness($scope, 5, res.data.pageSize, res.data.totalCount, res.data.pageTotal, res.data.pageNo);
                    } else{
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                });
            }
        }
        function deleteData(key){
            var _promise = vm.service.remove(key);
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        sweetAlertCommon(SweetAlert);
                        $timeout(function () {
                            location.reload();
                        }, 1000);
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                });
            }
        }
        function saveData(data, $state){
            console.log(encodeURI(formatObject4Url(data)));
            var _promise = vm.service.save(encodeURI(formatObject4Url(data)));
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        sweetAlertCommon(SweetAlert, res.msg);
                        $timeout(function () {
                            $state.go('app.regular.list');
                        }, 1000);
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                })
            }
        }
        function detailData($scope, key){
            var _promise = vm.service.info(key);
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
        function enableOrDisable(flag, key){
            var _promise = (flag === 0 && vm.service.pauseTask(key)) || (flag === 1 && vm.service.resumeTask(key));
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1){
                        sweetAlertCommon(SweetAlert);
                        $timeout(function () {
                            location.reload();
                        }, 1000);
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                });
            }
        }

        function HttpGET(url){
            return $http.get(url).then(function(res){
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '定时任务接口请求异常', 'warning');
            });
        }
        function HttpPost(url, params){
            return $http(new PostSetup(url, params)).then(function(res){
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '定时任务接口请求异常', 'warning');
            });
        }

    }
})();