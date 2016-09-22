/**
 * Created by hao.cheng on 2016/7/14.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(MergeConfig);
    MergeConfig.$inject = ['$stateProvider','RouteHelpersProvider'];
    function MergeConfig($stateProvider, helper) {
        $stateProvider
            .state('app.merge',{
                url: '/merge',
                views:{
                    '':{
                        templateUrl: 'app/views/merge/merge-head.html',
                        controller: 'MergeHeadController'
                    }
                }
            })
            .state('app.merge.list',{
                url: '/list?:type&:ids&:mergeIds&:lastPage',
                views:{
                    'data-list':{
                        templateUrl: helper.basepath('merge/merge-list.html'),
                        controller: 'MergeListController'
                    }
                }
            })
    }
    
    angular.module('app.routes').controller('MergeHeadController',['$scope','$state','SweetAlert',function ($scope,$state,SweetAlert) {
        $scope.submit = function () { //确认添加按钮
            if(checkEmpty($scope.form.ids)){
                sweetAlertCommon(SweetAlert,'请填写门户ID','warning');
                return;
            }
            var ids = $scope.form.ids.split(',');
            if(checkEmpty($scope.form.mergeIds)) var mergeIds = [];
            else var mergeIds = $scope.form.mergeIds.split(',');
            ids.forEach(function (val) {    //往mergeids里面添加数据
                if(mergeIds.indexOf(val) == -1)
                    mergeIds.push(val);
            });
            $scope.form.mergeIds = mergeIds.join(',');
            $state.go('app.merge.list',$scope.form);
        };
        $scope.changeMergeType = function (type) { //切换类型
            $state.go('app.merge.list',{type: type,ids: '',mergeIds: ''});
        };
        $scope.reset = function () { //重置按钮
            $scope.form.ids = '';
        }

    }]);
    angular.module('app.routes').controller('MergeListController',['$http','$scope','BaseService','$stateParams','SweetAlert','$state',function ($http,$scope,BaseService,$stateParams,SweetAlert,$state) {
        $scope.$parent.form = cloneOneObject($stateParams);
        $scope.type = $stateParams.type;
        if(!checkEmpty($stateParams.mergeIds)){//获取合并数据列表
            var data = {isolated: 0};data[$stateParams.type + 'Ids'] = $stateParams.mergeIds.split(',');
            var promise = BaseService.service.excludeIsolateData(JSON.stringify(data),$stateParams.type);
        }
        if(promise)
            promise.then(function (res) {
                if(res.data.length == 0){
                    sweetAlertCommon(SweetAlert,'暂无数据','warning');
                    return;
                }
                $scope.datas = res.data;
                $scope.datas.forEach(function (val) {
                   val.isCheck = false;
                });
                console.log(res.data);
            });
        $scope.mergeData = function (datas) { //合并按钮
            if(!datas)  return sweetAlertCommon(SweetAlert,'请先添加数据','warning');
            var param = {};param.mergeIds = [];
            datas.forEach(function (val) {
                if(val.isCheck) param.targetId = val[$stateParams.type+'Id'];
                else param.mergeIds.push(val[$stateParams.type+'Id']);
            });
            if(!param.hasOwnProperty('targetId')){
                sweetAlertCommon(SweetAlert,'请选择需要保留的数据','warning');
                return;
            }
            sweetAlertConfirm(SweetAlert,function () {
                var promise = BaseService.service.mergeData(JSON.stringify(param),$stateParams.type);
                promise.then(function (res) {
                    if(res.status == 1) sweetAlertCommon(SweetAlert,res.msg,'success'),window.open(returnLastPage($stateParams.lastPage), '_self');
                    else sweetAlertCommon(SweetAlert,res.msg,'error');
                    console.log(res.data);
                });
            },'warning',undefined,'你是否确定合并, 被合并的歌曲将被禁用并放入隔离区无法恢复, 请确认...?');
        };
        $scope.remove = function (datas,data) { //删除按钮
            var mergeIds = [];
            mergeIds =$scope.form.mergeIds.split(',');
            mergeIds.remove(data[$stateParams.type+'Id']);
            $scope.form.mergeIds = mergeIds.join(',');
            $state.go('app.merge.list',{mergeIds: $scope.form.mergeIds});
        }
    }]);

})();
