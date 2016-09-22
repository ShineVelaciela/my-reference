/**
 * Created by YuChunzhuo on 2015/11/23.
 */
(function () {
    angular.module('app.routes').config(function($stateProvider,$urlRouterProvider) {
        $stateProvider
        //标签知识库页面
            .state('app.knowledge',{
                url:'/knowledge/1',
                title: '标签知识库',
                templateUrl:"app/views/tags/knowledge/knowledge-title.html",
                controller: function($scope, $http){
                    url = tag_tree_url + 'getTagsByMaterialAndUser.do?userId=' + _session.id + '&materialType=1';
                    console.log(url);
                    $http.get(url).success(function (res) {
                        var tags = [];
                        for(var i=0; i < res.tnList.length; i ++){
                            var nodeList = [];
                            var tag_all = getAllNode(res.tnList[i],nodeList);
                            var tag = tag_all[tag_all.length -1];
                            tag.children = [];
                            for(var j = 0; j < tag_all.length - 1;j++){
                                tag.children.push(tag_all[j]);
                            }
                            tags.push(tag);
                        }
                        console.log(tags);
                        for(var i = 0; i < tags.length; i++){
                            if(tags[i].name == '风格'){
                                $scope.tags_list = tags[i].children;
                            }
                        }
                        //$scope.tags_title = tags;
                    });
                    //$scope.tags_title = [{'name':'地区','id':0},{'name':'艺术家职业','id':1},{'name':'风格','id':2},];
                    //$http.jsonp(tag_url + 'artist.json'+"?callback=JSON_CALLBACK").success(function (res) {
                    //    $scope.tags_list = res.data.风格;
                    //});
                }
            })
            //                .state('knowledge.list',{             //标签列表页面
            //                    url: '/{id:[0-9]{1,4}}',
            //                    views: {
            //                        "view-list": {
            //                            templateUrl: "../knowledge/knowledge-list.html",
            //                            controller: function($scope,$http,$stateParams){
            //                                $http.jsonp(tag_url + 'song.json'+"?callback=JSON_CALLBACK").success(function (res) {
            //                                    if($stateParams.id == 0)
            //                                        $scope.tags_list = res.data.语言;
            //                                    if($stateParams.id == 1)
            //                                        $scope.tags_list = res.data.风格;
            //                                    if($stateParams.id == 2)
            //                                        $scope.tags_list = res.data.心情;
            //                                    if($stateParams.id == 3)
            //                                        $scope.tags_list = res.data.场景;
            //                                    if($stateParams.id == 4)
            //                                        $scope.tags_list = res.data.主题;
            //                                    if($stateParams.id == 5)
            //                                        $scope.tags_list = res.data.乐器;
            //                                    if($stateParams.id == 6)
            //                                        $scope.tags_list = res.data.人声;
            //                                    if($stateParams.id == 7)
            //                                        $scope.tags_list = res.data.节日;
            //                                });
            ////                                    console.log($stateParams.id);
            //                            }
            //                        }
            //                    }
            //                })
            //                .state('knowledge.list.tagId',{
            .state('app.knowledge.tagId',{
                url:'/tagId/:tagName$:tagId',
                title: '标签知识库',
                views:{
                    "knowledge-view-list":{
                        templateUrl:"app/views/tags/knowledge/tag-knowledge.html",
                        controller:function($scope, $http, $stateParams){
                            console.log($stateParams.tagId);
//                                console.log($stateParams.tagName);
                            //////////////////////////////////////////////////
                            //以下是歌曲的逻辑
                            $http.jsonp(demo_url + '3/'+$stateParams.tagId+'.json?callback=JSON_CALLBACK&maxResult=10').success(function(res){
//                                    var songMaps = new HashMap();
                                var songList = [];
                                var songIds = [];
                                for(var i=0; i < res.data.resultlist.length; i++){
                                    songIds.push(res.data.resultlist[i].rid);
//                                        song = new Object();
//                                        song.songId = res.status.resultlist[i].rid;

                                }
                                //把10个凑成一串然后批量查询
                                console.log("歌曲ID："+songIds.join(','));
                                if(songIds.length > 0){
                                    $http.jsonp(list_url + "song.json?callback=JSON_CALLBACK&ids=" + songIds.join(',') + "&sp=10").success(function(res){
                                        var n = res.data.length-1;
                                        var i = 0;
                                        function getData(i){
                                            song = new Object();
                                            song.songId = res.data[i].songId;
                                            song.tagId = $stateParams.tagId;
                                            song.songName = res.data[i].songName;
                                            song.score = res.data[i].score;
                                            song.albumId = checkEmpty(res.data[i].albums) ? '' : res.data[i].albums[0].albumId;
                                            song.artistName = "";
                                            var songArtists = [];
                                            for(var j =0; j < res.data[i].artists.length; j++){
                                                songArtist = new Object();
                                                songArtist.artistName = res.data[i].artists[j].artistName;
                                                songArtist.artistId = res.data[i].artists[j].artistId;
                                                song.artistName = song.artistName + res.data[i].artists[j].artistName + ",";
                                                songArtists.push(songArtist);
                                            }
                                            if (res.data[i].artists.length > 0){
                                                song.artistName = song.artistName.substr(0,song.artistName.length-1);
                                            }
                                            song.artist = songArtists;
                                            if(checkEmpty(song.albumId)){
                                                $http.jsonp(img_url + "album/" + song.albumId + ".json?callback=JSON_CALLBACK").success(function(res){
//                                                    console.log("专辑的url：" + res.data.resultlist[0].url + "");
//                                                    console.log(song.albumId);
                                                    if(res.data.list.length > 0){
                                                        song.albumImgUrl = checkEmpty(res.data.list[0].url) ? img_r_url+res.data.list[0].md5 : res.data.list[0].url;
                                                        //song.albumImgUrl = res.data.list[0].url;
                                                    } else {
                                                        song.albumImgUrl = "";
                                                    }
                                                    if(i<n){
                                                        getData(i+1);
                                                    }
                                                });
                                            }
//                                                console.log(song);
                                            songList.push(song);
                                        };
                                        getData(i);
                                    });
                                }
//                                    console.log(songList);
                                $scope.songs = songList;
//                                    getTagDatas(songList,res.data.totalrecord,res.data.maxResult,res.data.firstIndex,$stateParams.tagId,$scope);
//                                    _maxResult = res.data.maxResult;
//                                    _firstIndex = res.data.firstIndex;
//                                    _tagId = $stateParams.tagId;
                            });
                            //////////////////////////////////////////////////////////////////
                            //以下是专辑的逻辑
                            $http.jsonp(demo_url + '2/'+$stateParams.tagId+'.json?callback=JSON_CALLBACK&maxResult=10').success(function(res){
                                var albumList = [];
                                var albumIds = [];
                                for(var i=0; i < res.data.resultlist.length; i++){
                                    albumIds.push(res.data.resultlist[i].rid);
                                }
                                //把10个凑成一串然后批量查询
                                console.log("专辑的ID："+albumIds.join(','));
                                if(albumIds.length > 0){
                                    $http.jsonp(list_url + "album.json?callback=JSON_CALLBACK&ids=" + albumIds.join(',') + "&sp=10").success(function(res){
                                        var n = res.data.length-1;
                                        var i = 0;
                                        function getData(i){
                                            album = new Object();
                                            album.tagId = $stateParams.tagId;
                                            album.score = res.data[i].score;
                                            album.albumId = res.data[i].albumId;
                                            album.albumName = res.data[i].albumName;
                                            album.artistName = "";
                                            var albumArtists = [];
                                            for(var j =0; j < res.data[i].artists.length; j++){
                                                albumArtist = new Object();
                                                albumArtist.artistName = res.data[i].artists[j].artistName;
                                                albumArtist.artistId = res.data[i].artists[j].artistId;
                                                album.artistName = album.artistName + res.data[i].artists[j].artistName + ",";
                                                albumArtists.push(albumArtist);
                                            }
                                            if (res.data[i].artists.length > 0){
                                                album.artistName = album.artistName.substr(0,album.artistName.length-1);
                                            }
                                            album.artist = albumArtists;
//                                                album.artistId = res.data[i].artists[0].artistId;
//                                                album.artistName = res.data[i].artists[0].artistName;
                                            $http.jsonp(img_url + "album/" + album.albumId + ".json?callback=JSON_CALLBACK").success(function(res){
//                                                    console.log("专辑的url：" + res.data.resultlist[0].url + "");
//                                                    console.log(i);
                                                if(res.data.list.length > 0) {
                                                    if(checkEmpty(res.data.list[0].url)) album.albumImgUrl=img_r_url+res.data.list[0].md5;
                                                    else album.albumImgUrl = res.data.list[0].url;
                                                } else {
                                                    album.albumImgUrl = "";
//                                                        console.log(album.albumId);
                                                }
                                                if(i<n){
                                                    getData(i+1);
                                                }
                                            });
//                                                console.log(album);
                                            albumList.push(album);
                                        };
                                        getData(i);
                                    });
                                }
                                $scope.albums = albumList;
                            });
                            //////////////////////////////////////////////////////////////////
                            //以下是歌手的逻辑
                            $http.jsonp(demo_url + '1/'+$stateParams.tagId+'.json?callback=JSON_CALLBACK&maxResult=10').success(function(res){
                                var artistList = [];
                                var artistIds = [];
                                for(var i=0; i < res.data.resultlist.length; i++){
                                    artistIds.push(res.data.resultlist[i].rid);
                                }
                                console.log("歌手的ID："+artistIds.join(','));
                                if(artistIds.length > 0){
                                    $http.jsonp(list_url + "artist.json?callback=JSON_CALLBACK&ids=" + artistIds.join(',') + "&sp=00").success(function(res){
                                        var n = res.data.length-1;
                                        var i = 0;
                                        function getData(i){
                                            artist = new Object();
                                            artist.artistId = res.data[i].artistId;
                                            artist.tagId = $stateParams.tagId;
                                            artist.score = res.data[i].score;
                                            artist.artistName = res.data[i].artistName;
//                                                album.artistId = res.data[i].artists[0].artistId;
//                                                album.artistName = res.data[i].artists[0].artistName;
                                            $http.jsonp(img_url + "artist/" + artist.artistId + ".json?callback=JSON_CALLBACK").success(function(res){
//                                                    console.log("专辑的url：" + res.data.resultlist[0].url + "");
//                                                    console.log(i);
                                                if(res.data.list.length > 0) {
                                                    artist.artistImgUrl = res.data.list[0].url;
                                                } else {
                                                    artist.artistImgUrl = "";
                                                }
                                                if(i<n){
                                                    getData(i+1);
                                                }
                                            });
//                                                console.log(artist);
                                            artistList.push(artist);
                                        };
                                        getData(i);
                                    });
                                }
                                $scope.artists = artistList;
                            });
                        }
                    },
                    "tag-view": {               //选择查询的标签
                        templateUrl: "app/views/tags/knowledge/knowledge.html",
                        controller:function($scope,$http,$stateParams){
                            console.log("进入了knowledge.tag.html");
                            $scope.id = $stateParams.tagName;
                        }
                    }
                }
            })
    })
})();
