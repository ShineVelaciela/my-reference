/**
 * Created by hao.cheng on 2016/8/29.
 */
(function () {
    'use strict';

    function Directive(template, controller, link) {    //指定公共类
        this.restrict = 'EAC';
        this.replace = true;
        this.controllerAs = 'vm';
        if(template) this.template = template;
        if(controller) this.controller = controller;
        if(link) this.link = link;
    }
    function DirectiveCommonMethod($state) {
        this.goState = function (stateName, param, flag) {
            param.lastPage = returnLastPageTime();
            var _url = $state.href(stateName, param, {inherit: false});
            window.open(_url, flag);
        }
    }
    function tdDirectiveService(template) {   //提取表格自定义指令通用业务方法
        var _controller = ['$state',function ($state) {
            DirectiveCommonMethod.call(this, $state);
        }];
        return new Directive(template, _controller, null);
    }
    angular.module('app.routes').directive('tdArtist', function () {    //自定义表格艺人a标签指令 2016-8-29 16:58:22
        var _template = '<a ng-click="vm.goState(\'artistInfo\', {artistId: data.artistId}, \'_self\');" ng-right-click="vm.goState(\'artistInfo\',{artistId: data.artistId}, \'_blank\');">{{data.artistName}}</a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdAlbum', function () {     //自定义表格专辑a标签指令 2016-8-30 10:36:05
        var _template = '<a ng-click="vm.goState(\'albumInfo\', {albumId: data.albumId}, \'_self\');" ng-right-click="vm.goState(\'albumInfo\',{albumId: data.albumId}, \'_blank\');">{{data.albumName}}</a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdSong', function () {     //自定义表格歌曲a标签指令 2016-8-30 10:36:05
        var _template = '<a ng-click="vm.goState(\'songInfo\', {songId: data.songId}, \'_self\');" ng-right-click="vm.goState(\'songInfo\', {songId: data.songId}, \'_blank\');">{{data.songName}}</a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdArtistSearch', function () {     //自定义表格搜索a标签指令 2016-8-30 11:20:40
        var _template = '<a ng-click="vm.goState(\'app.artist\', {artistKeyword:data.artistName}, \'_self\');" ng-right-click="vm.goState(\'app.artist\', {artistKeyword:data.artistName}, \'_blank\');">【搜】</a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdAlbumSearch', function () {       //自定义表格搜索a标签指令 2016-8-30 13:05:06
        var _template = '<a ng-click="vm.goState(\'app.album\', {albumKeyword:data.albumName,artistKeyword:data.artists[0].artistName}, \'_self\');" ng-right-click="vm.goState(\'app.album\', {albumKeyword:data.albumName,artistKeyword:data.artists[0].artistName}, \'_blank\');">【搜】</a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdSongSearch', function () {        //自定义表格搜索a标签指令 2016-8-30 13:17:29
        var _template = '<a ng-click="vm.goState(\'app.song\', {songKeyword:data.songName,artistKeyword:data.artists[0].artistName}, \'_self\');" ng-right-click="vm.goState(\'app.song\', {songKeyword:data.songName,artistKeyword:data.artists[0].artistName}, \'_blank\');">【搜】</a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdArtists', function () {       //自定义所属多个艺人的表格指令 2016-8-30 13:58:43
        var _template = '<a ng-repeat="artist in data.artists track by $index" ng-click="vm.goState(\'artistInfo\', {artistId: artist.artistId}, \'_self\');" ' +
            'ng-right-click="vm.goState(\'artistInfo\',{artistId: artist.artistId}, \'_blank\');">{{artist.artistName}}<span ng-if="!$last">、</span></a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdAlbums', function () {        //自定义所属多个专辑的表格指令 2016-8-30 13:59:05
        var _template = '<a ng-repeat="album in data.albums track by $index" ng-click="vm.goState(\'albumInfo\', {albumId: album.albumId}, \'_self\');" ' +
            'ng-right-click="vm.goState(\'albumInfo\',{albumId: album.albumId}, \'_blank\');">{{album.albumName}}<span ng-if="!$last">、</span></a>';
        return tdDirectiveService(_template);
    });
    angular.module('app.routes').directive('tdCatalog', function () {       //自定义表格编目按钮指令 2016-8-30 14:41:20
        var _template = '<span><span ng-if="data.karakalStatus == 11 "> <a ng-click="vm.goState(\'app.catalog.info\', {copyId:data.copyrightId,karakalStatus:data.karakalStatus}, \'_self\');" ng-right-click="vm.goState(\'app.catalog.info\',{copyId:data.copyrightId,karakalStatus:data.karakalStatus}, \'_blank\');">编目</a> </span> ' +
            '<span ng-if="data.karakalStatus == 10"> <a ng-click="vm.goState(\'app.catalog.info\', {copyId:data.copyrightId,karakalStatus:data.karakalStatus}, \'_self\');" ng-right-click="vm.goState(\'app.catalog.info\',{copyId:data.copyrightId,karakalStatus:data.karakalStatus}, \'_blank\');">重新编目</a> </span></span>';
        return tdDirectiveService(_template);
    })
})();
