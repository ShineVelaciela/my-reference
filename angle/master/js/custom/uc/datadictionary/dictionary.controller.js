/**
 * Created by hao.cheng on 2016/8/16.
 */
(function () {
    'use strict';
    angular.module('app.routes').config(DictionaryConfig);
    DictionaryConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function DictionaryConfig($stateProvider, helper) {
        $stateProvider
            .state('app.dictionary', {
                url: '/dictionary',
                title: '数据字典',
                views: {
                    '': {
                        templateUrl: helper.basepath('partials/container-tpl.html'),
                        controller: 'DictionaryHeadController'
                    }
                }
            })
            .state('app.dictionary.nation', {       //民族
                url: '/nation?:pageSize&:pageNo&:searchKeyWord',
                title: '数据字典-民族',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('datadictionary/dictionary-condition.html'),
                        controller: 'DictionaryHeadController'
                    },
                    'data-list': {
                        templateUrl: helper.basepath('datadictionary/dictionary-country.html'),
                        controller: 'DictionaryBodyController',
                        resolve: helper.resolveFor('xeditable')
                    }
                }
            })
            .state('app.dictionary.country', {      //国家
                url: '/country?:pageSize&:pageNo&:searchKeyWord',
                title: '数据字典-国家',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('datadictionary/dictionary-condition.html'),
                        controller: 'DictionaryHeadController'
                    },
                    'data-list': {
                        templateUrl: helper.basepath('datadictionary/dictionary-country.html'),
                        controller: 'DictionaryBodyController',
                        resolve: helper.resolveFor('xeditable')
                    }
                }
            })
            .state('app.dictionaryEdit', {
                url: '/dictionary/edit?:type&:id',
                views: {
                    '': {
                        templateUrl: helper.basepath('datadictionary/dictionary-edit.html'),
                        controller: 'DictionaryEditController'
                    }
                }
            })

    }

    /*数据字典系列controller*/
    angular.module('app.routes').controller('DictionaryHeadController', ['$scope','$state',function ($scope,$state) {
        $scope.container = new Container('数据字典',{show: false});
        $scope.addDic = function () {
            var type = '';
            if($state.current.name.indexOf('country') != -1){
                type = 'country';
            } else if($state.current.name.indexOf('nation') != -1){
                type = 'nation';
            }
            if(!checkEmpty(type)){
                $state.go('app.dictionaryEdit', {type: type});
            }
        }
    }]);
    angular.module('app.routes').controller('DictionaryBodyController', ['$scope', '$state', 'DictionaryService', 'SweetAlert', '$stateParams',function ($scope, $state, DictionaryService, SweetAlert, $stateParams) {
        var _title;
        if($state.current.name.indexOf('country') != -1) {
            _title = '数据字典-国家地区管理';
            $scope.$parent.type = 'country';
        } else {
            _title = '数据字典-民族管理';
            $scope.$parent.type = 'nation';
        }
        $scope.$parent.container.title = _title;
        $scope.$parent.form = inherit($stateParams);

        loadSearch();

        function loadSearch() {
            var _promise = DictionaryService.service.search($scope.$parent.type, JSON.stringify($stateParams));
            if(_promise) _promise.then(function (res) {
                console.log(res);
                $scope.$parent.datas = res.data.list;
                paginationDiscreteness($scope, 5, res.data.pageSize, res.data.totalCount, res.data.pageTotal, res.data.pageNo);
            });
        }

        $scope.saveDic = function (data, rowform) {     //保存按钮
            console.log(data);
            sweetAlertConfirm(SweetAlert, function () {
                DictionaryService.service.saveDic($scope.$parent.type, JSON.stringify(data)).then(function (res) {
                    if(res.status == 1) return sweetAlertCommon(SweetAlert, res.msg, 'success'),rowform.$cancel();
                    else return sweetAlertCommon(SweetAlert, res.msg, 'error');
                });
            }, 'warning');
        };
        $scope.deleteDic = function (data) {        //删除按钮
            sweetAlertConfirm(SweetAlert, function () {
                DictionaryService.service.deleteDic($scope.$parent.type, data.id, null).then(function (res) {
                    if(res.status == 1) return sweetAlertCommon(SweetAlert, res.msg, 'success'),loadSearch();
                    else return sweetAlertCommon(SweetAlert, res.msg, 'error');
                })
            }, 'warning')
        }
    }]);
    angular.module('app.routes').controller('DictionaryEditController', ['$scope', '$stateParams', '$state', 'DictionaryService', 'SweetAlert',function($scope, $stateParams, $state, DictionaryService, SweetAlert){
        $scope.type = $stateParams.type;
        $scope.isRepeat = false;
        if($stateParams.id){
            DictionaryService.service.search($scope.type, JSON.stringify($stateParams)).then(function(res){
                if(res.status == 1 && res.data.list.length > 0) {
                    $scope.data = res.data.list[0];
                } else {
                    return sweetAlertCommon(SweetAlert, res.msg, 'error');
                }
            });
        }
        $scope.formChange = function(data){
            DictionaryService.service.search($scope.type, JSON.stringify(data)).then(function(res){
                if(res.status == 1 && res.data && res.data.list.length > 0){
                    $scope.isRepeat = true;
                } else {
                    $scope.isRepeat = false;
                }
            });
        };
        $scope.submit = function(data){
            if($scope.isRepeat){
                sweetAlertConfirm(SweetAlert,function(){
                    saveDictionary(data);
                }, "warning", "已经有一条相同的数据", "确定新建吗？");
            } else {
                sweetAlertConfirm(SweetAlert, function(){
                    saveDictionary(data);
                }, "warning");
            }
        };
        $scope.return = function(){
            $state.go('app.dictionary.' + $stateParams.type, {pageNo: 1, pageSize: 100});
        };
        var saveDictionary = function(data){
            DictionaryService.service.saveDic($scope.type, JSON.stringify(data)).then(function (res) {
                if(res.status == 1) {
                    return sweetAlertCommon(SweetAlert, res.msg, 'success')
                        ,$state.go('app.dictionary.' + $stateParams.type, {pageNo: 1, pageSize: 100});
                } else {
                    return sweetAlertCommon(SweetAlert, res.msg, 'error');
                }
            });
        }
    }]);

    angular.module('app.routes').controller('DictionaryCountrySelectController', ['$scope', '$stateParams', 'DictionaryService',function($scope, $stateParams, DictionaryService){
        var _promise = DictionaryService.service.search('country', JSON.stringify({}));
        if(_promise) _promise.then(function (res) {
            $scope.countrySelects = res.data.list;
        });
    }]);
})();