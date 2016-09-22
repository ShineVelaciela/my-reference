/**
 * Created by hao.cheng on 2016/8/2.
 * 工单基础service
 */
(function () {
    'use strict';

    angular.module('app.routes').service('TaskService', TaskService);
    TaskService.$inject = ['$http', 'SweetAlert'];
    function TaskService($http, SweetAlert) {
        var _self = this;
        _self.service = {
            'taskSearch': taskSearch,            //工单搜索
            'assignTask': assignTask,            //数据任务分配
            'getTaskFlow': getTaskFlow,          //获取项目工单流程
            'getTaskAuth': getTaskAuth           //获取项目工单权限
        };
        _self.method = {        //页面请求方法
            'getTaskFlowAndAuth': getTaskFlowAndAuth,        //获取项目流程和权限
            'taskSearchFromPage':  taskSearchFromPage       //页面的工单搜索
        };

        function taskSearch(type, data) {
            //uc_new_song http://192.168.3.75:8080/1/search/task/

            return $http.get(uc_new_song + type + '.json?data=' + data).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '工单搜索接口请求异常', 'warning');
            })
        }
        function assignTask(taskIds, flowId, auth, uId){
            return $http.jsonp(uc_assign_t + '.json?ids=' + taskIds + '&flowId=' + flowId + '&auth=' + auth + '&uId=' + uId + '&' + CALLBACK).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '分配任务接口请求异常', 'warning');
            })
        }
        function getTaskFlow(projectId) {
            return $http.get(uc_find_p+'.json?' + 'data={"id":"' + projectId + '"}').then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '工单流程查询接口请求异常', 'warning');
            })
        }
        function getTaskAuth(projectId) {
            return  $http.jsonp(uc_new_song_auth + '?' + CALLBACK + '&pId=' + projectId).then(function (res) {
                return res.data;
            }, function () {
                sweetAlertCommon(SweetAlert, '工单权限接口请求异常', 'warning');
            })
        }
        function getTaskFlowAndAuth($scope){
            var _promise1 = _self.service.getTaskFlow($scope.$parent.form.projectId);
            if(_promise1) _promise1.then(function (res) {
                $scope.$parent.p_type = res.data.list[0].flowType;
                $scope.$parent.distribution = res.data.list[0].distribution;
                $scope.$parent.cyr_list = res.data.list[0].cyrList;
                $scope.$parent.cyr_list = $scope.cyr_list.concat(res.data.list[0].fzrList);
                res.data.list[0].fzrList.forEach(function (val) {
                    val.uid += '';
                    if(val.uid == JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid) $scope.$parent.userRole = 'fzr';
                });
            });
            var _promise2 = _self.service.getTaskAuth($scope.$parent.form.projectId);
            if(_promise2) _promise2.then(function (res) {
                if(res.returnCode == '000000') $scope.$parent.authoritySetting = res.list[0];
            })
        }
        function taskSearchFromPage(type, $scope) {
            var form = cloneOneObject($scope.$parent.form);
            if(type == 'song' && form.tagBeans && form.tagBeans.length){     //歌曲工单的标签搜索做特殊处理
                form.tags=[];
                form.tagBeans.forEach(function(tag){
                    form.tags.push(tag.tagId);
                });
                delete form.tagBeans;
            }
            var _promise = _self.service.taskSearch(type, encodeURIComponent(angular.toJson(form)));
            if(_promise) _promise.then(function (res) {
                $scope.$parent.datas = res.data.list;
            });
            form.isQueryCount = 1;  //异步count
            _self.service.taskSearch(type, encodeURIComponent(angular.toJson(form))).then(function (res) {
                paginationDiscreteness($scope, 5, res.data.pageSize, res.data.totalCount, res.data.pageTotal, res.data.pageNo);
            })
        }

    }
})();