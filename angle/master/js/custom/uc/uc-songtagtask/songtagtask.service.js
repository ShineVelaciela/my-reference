/**
 * Created by YuChunzhuo-Dev on 2016/8/9.
 */
(function(){
    'use strict';

    angular.module('app.routes').service('SongTagTaskService', SongTagTaskService);
    SongTagTaskService.$inject = ['$http', 'SweetAlert'];
    function SongTagTaskService($http, SweetAlert){
        var _self = this;
        _self.service = {
            'feedbackList': feedbackList,
            'failedList': failedList
        };
        _self.method = {
            'getFeedbackDatas': getFeedbackDatas,
            'getFailedDatas': getFailedDatas,
            'exportFailedExcel': exportFailedExcel
        };

        function feedbackList(str){
            var url = http_url + "/tag/task/" + "queryUpload.json?" + str;
            return $http.get(url).then(function(res){
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '导入反馈接口请求异常', 'warning');
            });
        }

        function failedList(fid){
            var url = http_url + "/tag/task/" + "resolveFail.json?fid=" + fid;
            return $http.get(url).then(function(res){
                return res.data;
            }, function(){
                sweetAlertCommon(SweetAlert, '导入反馈接口请求异常', 'warning');
            });
        }

        function getFeedbackDatas(data, _method){
            var _promise = _self.service.feedbackList(formatObject4Url(data));
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1) _method(res);
                    else sweetAlertCommon(SweetAlert, res.msg, 'warning');
                });
            }
        }

        function getFailedDatas(fid, _method){
            var _promise = _self.service.failedList(fid);
            if(_promise){
                _promise.then(function(res){
                    if(res.status == 1) _method(res);
                    else sweetAlertCommon(SweetAlert, res.msg, 'warning');
                });
            }
        }

        function exportFailedExcel(type, fid){
            type = type[0].toUpperCase() + type.substring(1, type.length);
            var url = http_url + "/tag/task/" + "export" + type + "ResolveFail.do?fid=" + fid;
            window.open(url);
        }
    }
})();