/**
 * Created by YuChunzhuo on 2016/8/28.
 */
(function () {
    'use strict';

    angular.module('app.routes').service('TagService', TagService);
    TagService.$inject = ['$http', 'SweetAlert', '$timeout'];
    function TagService($http, SweetAlert, $timeout) {
        var vm = this;
        vm.service = {
            'query': query,
            'audit': audit,
            'export': exportExcelService,
            'order': order
        };
        vm.method = {
            'getDatas': getDatas,
            'batchAudit': batchAudit,
            'oneAudit': oneAudit,
            'export': exportExcelMethod,
            'changeOrder': changeOrder
        };
        function query(data){
            var url = QUALITY_TAG_QUERY + "?data=" + data;
            return HttpGET(url, $http, SweetAlert, "精品标签数据查询接口异常");
        }
        function audit(params){
            var url = QUALITY_TAG_AUDIT;
            return HttpPost(url, params,  $http, SweetAlert, "精品标签数据审核接口异常");
        }
        function exportExcelService(data){
            var url = QUALITY_TAG_EXPORT + "?data=" + data;
            window.open(url);
        }
        function order(type, id, no){
            var url = QUALITY_TAG_ORDER + type + "/" + id + "/" + no + ".json";
            return HttpGET(url, $http, SweetAlert, "精品标签排序接口异常");
        }
        function push(params){
            var url = QUALITY_TAG_PUSH;
            return HttpPost(url, params,  $http, SweetAlert, "精品标签输出接口异常");
        }
        function getDatas($scope){
            //获取list
            var paramsList = JSON.parse(JSON.stringify($scope.form));
            if(!!paramsList.tagBeans && !!paramsList.tagBeans.length){
                paramsList.tagId = paramsList.tagBeans[0].id;
                paramsList.tagName = paramsList.tagBeans[0].name;
                delete paramsList.tagBeans;
            } else {
                $scope.$parent.datas = [];
                return;
            }
            var _promiseList = vm.service.query(encodeURIComponent(JSON.stringify(paramsList)));
            if(_promiseList){
                _promiseList.then(function(res){
                    if(res.status == 1){
                        $scope.$parent.datas = res.data.list;
                    } else{
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                });
            }
            //获取count
            var paramsLCount = paramsList;
            paramsLCount.isQueryCount = 1;
            var _promiseCount = vm.service.query(encodeURIComponent(JSON.stringify(paramsLCount)));
            if(_promiseCount){
                _promiseCount.then(function(res){
                    if(res.status == 1){
                        paginationDiscreteness($scope, 5, res.data.pageSize, res.data.totalCount, res.data.pageTotal, res.data.pageNo);
                    } else{
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                });
            }
        }
        function batchAudit(datas, tagStatus){
            var params = {};
            params.tagStatus = tagStatus;
            params.ids = getPropertyFromCheckBox(datas, 'isCheck', true, 'id').join(",");
            if(!params.ids.length){
                //直接进行反向操作
                params.tagStatus *= -1;
                params.ids = getPropertyFromCheckBox(datas, 'isCheck', false, 'id').join(",");
                var __promise = vm.service.audit(formatObject4Url(params));
                if(__promise){
                    __promise.then(function (res) {
                        if(res.status == 1){
                            sweetAlertCommon(SweetAlert);
                            $timeout(function () {
                                location.reload();
                            }, 1000);
                        } else {
                            sweetAlertCommon(SweetAlert, res.message, 'warning');
                        }
                    })
                }
                return;
            }
            //先进行正向操作
            var _promise = vm.service.audit(formatObject4Url(params));
            if(_promise){
                _promise.then(function(res0){
                    if(res0.status == 1){
                        //然后进行反向操作
                        params.tagStatus *= -1;
                        params.ids = getPropertyFromCheckBox(datas, 'isCheck', false, 'id').join(",");
                        if(!params.ids.length){
                            sweetAlertCommon(SweetAlert);
                            $timeout(function () {
                                location.reload();
                            }, 1000);
                        } else {
                            var __promise = vm.service.audit(formatObject4Url(params));
                            if(__promise){
                                __promise.then(function (res) {
                                    if(res.status == 1){
                                        sweetAlertCommon(SweetAlert);
                                        $timeout(function () {
                                            location.reload();
                                        }, 1000);
                                    } else {
                                        sweetAlertCommon(SweetAlert, res.message, 'warning');
                                    }
                                })
                            }
                        }
                    } else{
                        sweetAlertCommon(SweetAlert, res0.message, 'warning');
                    }
                });
            }
        }
        function oneAudit(data, tagStatus){
            var params = {};
            params.tagStatus = tagStatus;
            params.ids = (data.id + '').split(',');
            var __promise = vm.service.audit(formatObject4Url(params));
            if(__promise){
                __promise.then(function (res) {
                    if(res.status == 1){
                        sweetAlertCommon(SweetAlert);
                        $timeout(function () {
                            location.reload();
                        }, 1000);
                    } else {
                        sweetAlertCommon(SweetAlert, res.message, 'warning');
                    }
                })
            }
        }
        function exportExcelMethod(params){
            var paramsList = JSON.parse(JSON.stringify(params));
            if(!!paramsList.tagBeans && !!paramsList.tagBeans.length){
                paramsList.tagId = paramsList.tagBeans[0].id;
                delete paramsList.tagBeans;
            } else {
                return;
            }
            vm.service.exportExcelService(JSON.stringify(paramsList));
        }
        function changeOrder(orderType, id, no){
            var _promise = vm.service.order(orderType, id, no);
            if(_promise){
                _promise.then(function (res) {
                    if(res.status == 1){
                        sweetAlertCommon(SweetAlert);
                        $timeout(function () {
                            location.reload();
                        }, 1000);
                    } else {
                        sweetAlertCommon(SweetAlert, res.message, 'warning');
                    }
                });
            }
        }
    }
})();