/**
 * Created by hao.cheng on 2016/7/6.
 */
(function () {
    'use strict';

    angular.module('app.routes').service('SongService',SongService);
    SongService.$inject = ['$http','BaseService'];
    function SongService($http,BaseService) {
        var _self = this;
        this.service = {
            'changeSongStatus': changeSongStatus,
            'createSongRel': createSongRel,
            'getCount': getCount
        };
        function changeSongStatus(id,status) {  //改变歌曲状态
            BaseService.service.changeDataStatus('song',id,status);
        }
        function createSongRel(songId) { //创建词曲作者并且关联标签
            return  $http.jsonp(CATALOG_CREATESONGREL + songId + '.json?' + CALLBACK).then(function (res) {
                return res;
            });
        }
        function getCount(){

        }
    }
})();
