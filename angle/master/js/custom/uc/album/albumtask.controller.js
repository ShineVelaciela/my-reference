/**
 * Created by hao.cheng on 2016/8/23.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(AlbumTaskConfig);
    AlbumTaskConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function AlbumTaskConfig($stateProvider, helper) {
        $stateProvider
            .state('app.albumTask',{
                url: '/albumTask',
                views: {
                    '': {
                        templateUrl: helper.basepath('partials/container-tpl.html'),
                        controller: 'AlbumTaskHeadController'
                    }
                }
            })
            .state('app.albumTask.module', {
                url: '/module?:module&:projectId&:pageNo&:pageSize&:albumIds&:artistName&:albumName&:status&:tagBeans&:style' +
                '&:mscoreMin&:mscoreMax&:hotScoreMax&:hotScoreMin&:taskStatus&:uid&:lastEditSearch&:distributionStartTime&:distributionEndTime&:completeStartTime&:completeEndTime&:createStartTime&:createEndTime',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('uc/album/albumtask-condition.html')
                    },
                    'data-list': {
                        templateUrl: helper.basepath('uc/album/albumtask-list.html'),
                        controller: 'AlbumTaskListController'
                    }
                }
            })
    }

    /*专辑存量工单系列controller*/
    angular.module('app.routes').controller('AlbumTaskHeadController', ['$scope', '$state', '$stateParams', '$http', '$cookies', 'SweetAlert',function ($scope, $state, $stateParams, $http, $cookies, SweetAlert) {
        $scope.container = new Container('专辑存量工单');
        $scope.taskSwitch = function (module, projectId) {
            taskSwitch(module, projectId, $scope, $state);
        };
        //获取标签
        getTagList(2,$scope,$stateParams,$http,$cookies,SweetAlert,1);
    }]);
    angular.module('app.routes').controller('AlbumTaskListController', ['$scope', 'TaskService', '$stateParams', 'SweetAlert', '$state', '$http',function ($scope, TaskService, $stateParams, SweetAlert, $state, $http) {
        taskListService($stateParams, $scope, TaskService);
        taskLoadSearch('album', $scope, TaskService);
        $scope.edit = function (data, jump) {
            editJump($http, 'album', data, $state, SweetAlert, jump, $stateParams);
        }
    }]);
})();