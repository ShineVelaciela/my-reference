/**
 * Created by hao.cheng on 2016/8/22.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(ArtistTaskConfig);
    ArtistTaskConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function ArtistTaskConfig($stateProvider, helper) {
        $stateProvider
            .state('app.artistTask', {
                url: '/artistTask',
                views: {
                    '': {
                        templateUrl: helper.basepath('partials/container-tpl.html'),
                        controller: 'ArtistTaskHeadController'
                    }
                }
            })
            .state('app.artistTask.module', {
                url: '/module?:module&:projectId&:pageNo&:pageSize&:artistIds&:artistName&:albumName&:status&:tagBeans&:style' +
                '&:mscoreMin&:mscoreMax&:hotScoreMax&:hotScoreMin&:taskStatus&:uid&:lastEditSearch&:distributionStartTime&:distributionEndTime&:completeStartTime&:completeEndTime&:createStartTime&:createEndTime',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('uc/artist/artisttask-condition.html')
                    },
                    'data-list': {
                        templateUrl: helper.basepath('uc/artist/artisttask-list.html'),
                        controller: 'ArtistTaskListController'
                    }
                }
            })
    }

    /*艺人存量工单系列controller*/
    angular.module('app.routes').controller('ArtistTaskHeadController', ['$scope', '$state', '$stateParams', '$http', '$cookies', 'SweetAlert',function ($scope, $state, $stateParams, $http, $cookies, SweetAlert) {
        $scope.container = new Container('艺人存量工单');
        $scope.taskSwitch = function (module, projectId) {
            taskSwitch(module, projectId, $scope, $state);
        };
        //获取标签
        getTagList(1,$scope,$stateParams,$http,$cookies,SweetAlert,1);
    }]);
    angular.module('app.routes').controller('ArtistTaskListController', ['$scope', 'TaskService', '$stateParams', 'SweetAlert', '$state', '$http',function ($scope, TaskService, $stateParams, SweetAlert, $state, $http) {
        taskListService($stateParams, $scope, TaskService);
        taskLoadSearch('artist', $scope, TaskService);
        $scope.edit = function (data, jump) {
            editJump($http, 'artist', data, $state, SweetAlert, jump, $stateParams);
        }
    }])
})();
