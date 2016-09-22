/**
 * Created by YuChunzhuo-Dev on 2016/8/25.
 */
(function () {
    'use strict';
    angular.module('app.routes').config(QualityTagConfig);
    QualityTagConfig.$inject = ['$stateProvider','RouteHelpersProvider'];
    function QualityTagConfig($stateProvider, helper) {
        $stateProvider
            .state('app.qualityTag',{
                url: '/tag/quality',
                templateUrl: helper.basepath('partials/container-tpl.html'),
                controller: 'QualityTagHeadController'
            })
            .state('app.qualityTag.list', {
                url: '/list?:copyrightId&:songIds&:songName&:artistName&:&:editUid&:startTime&:endTime&:orderType&:hotScoreMin&:hotScoreMax&:mscoreMin&:mscoreMax&:copyrightCategory&:tagStatus&:tagId&:tagName&:tagBeans&:pageSize&:pageNo&:lastEditSearch&:uid',
                title: '精品标签',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('tags/quality-tag/quality-tag-condition.html')
                    },
                    'data-list': {
                        templateUrl: helper.basepath('tags/quality-tag/quality-tag-list.html'),
                        controller: 'QualityTagListController'
                    }
                }
            })
    }
    angular.module('app.routes').controller('QualityTagHeadController', function ($scope, $state, $stateParams, $http, $cookies, SweetAlert) {
        $scope.container = new Container('标签管理/精品标签');
        getTagList(3,$scope,$stateParams,$http,$cookies,SweetAlert,1);
    });
    angular.module('app.routes').controller('QualityTagListController', function ($scope, $state, $stateParams, $http, $cookies, SweetAlert, TagService) {
        $scope.$parent.form = excludeProperties($stateParams, []); //刷新页面回显
        $scope.orderType = $scope.$parent.form.orderType;
        TagService.method.getDatas($scope); //获取页面数据及分页
        $scope.changeTagStatus = function (data) {
            TagService.method.oneAudit(data, data.tagStatus * -1);
            $scope.checkOne(data);
        };
        $scope.changeTagsStatus = function(datas, tagStatus){
            TagService.method.batchAudit(datas, tagStatus);
        };
    });
    //导出及批量操作
    angular.module('app.routes').controller('QualityTagExportController', function ($scope, $uibModalInstance, $state, $stateParams, $http, $cookies, SweetAlert, datas, form) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.export = function () {
            var paramsList = JSON.parse(JSON.stringify(form));
            if(!!paramsList.tagBeans && !!paramsList.tagBeans.length){
                paramsList.tagId = paramsList.tagBeans[0].id;
                paramsList.tagName = paramsList.tagBeans[0].name;
                delete paramsList.tagBeans;
            } else {
                return;
            }
            exportCommon(datas, paramsList, $scope, QUALITY_TAG_EXPORT, SweetAlert, 'id', $uibModalInstance);
        }
    });
    angular.module('app.routes').controller('QualityOrderController', function($scope, $uibModalInstance, $state, $stateParams, $http, $cookies, SweetAlert, TagService, data, orderType){
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.setPosition = function (position) {
            console.log(data);
            console.log(orderType);
            if(parseInt(position) <= 0){
                sweetAlertCommon(SweetAlert, "必须输入大于0的整数", "warning");
                // SweetAlert.swal(new SweetAlertSetup("必须输入大于0的整数", "点击按钮", "warning"))
            }
            TagService.method.changeOrder(orderType, data.id, parseInt(position));
        }
    })
})();

