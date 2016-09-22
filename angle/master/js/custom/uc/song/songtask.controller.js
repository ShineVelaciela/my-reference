/**
 * Created by YuChunzhuo on 2016/1/5.
 * Reconstruction by YuChunzhuo on 2016/8/22.
 */

(function(){
    'use strict';
    angular.module('app.routes').config(SongTaskConfig);
    SongTaskConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function SongTaskConfig($stateProvider, helper){
        $stateProvider
            .state('app.songTask', {
                url: '/task',
                templateUrl: helper.basepath('partials/container-tpl.html'),
                controller: 'TaskSongHeadController'
            })
            .state('app.songTask.module', {
                url: '/song?:module&:projectId&:pageNo&:pageSize&:artistName&:albumName&:lyricser&:composer&:urgentDegree&:mscoreMin&:mscoreMax&:hotScoreMin&:hotScoreMax&:tags&:' +
                'status&:createStartTime&:createEndTime&:uid&:lastEditSearch&:distributionStartTime&:distributionEndTime&:completeStartTime&:completeEndTime&:copyrightId&:songIds' +
                '&:songName&:taskStatus&:tagBeans',
                views: {
                    'condition': {
                        templateUrl: helper.basepath('uc/song/song-condition.html')
                    },
                    'data-list': {
                        templateUrl: helper.basepath('uc/song/song-list.html'),
                        controller: 'TaskSongListController'
                    }
                }
            })
    }

    angular.module('app.routes').controller('TaskSongHeadController', ['$scope', '$state', '$stateParams', '$http', '$cookies', 'SweetAlert',function($scope, $state, $stateParams, $http, $cookies, SweetAlert){
        $scope.container = new Container('工单/歌曲存量工单');
        $scope.taskSwitch = function (module, projectId) {
            taskSwitch(module, projectId, $scope, $state);
        };
        getTagList(3,$scope,$stateParams,$http,$cookies,SweetAlert,1);
    }]);
    angular.module('app.routes').controller('TaskSongListController', ['$scope', '$state', '$http', 'TaskService', '$stateParams', 'SweetAlert',function ($scope, $state, $http, TaskService, $stateParams, SweetAlert) {
        taskListService($stateParams, $scope, TaskService);
        taskLoadSearch('song', $scope, TaskService);
        $scope.edit = function (data, jump) {
            editJump($http, 'song', data, $state, SweetAlert, jump, $stateParams);
        }
    }]);
})();