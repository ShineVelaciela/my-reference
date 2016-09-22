 /**
 * Created by hao.cheng on 2015/12/30.
 */
var iframe = document.getElementById('player_iframe').contentWindow;
//    iframe.showIframe();
var list = [];
function addPlaySong(songId, SweetAlert, playList,copyIds, x ) {//点击添加歌曲试听
    // if (copyId == undefined || copyId == null || copyId == '') {
    //     sweetAlertCommon(SweetAlert,'暂无试听地址','warning');
    //     //alert('暂无试听地址');
    //     return;
    // }
    // var obj = localStorage.getItem('batchSong');
    //if (obj != null && obj.indexOf(songId + '-' + copyId) != -1) {
    //    alert('歌曲已存在播放器中');
    //    return;
    //}
    //var arr = localStorage.getItem('batchSong').split(',');//先取出缓存再保存进新缓存
    //for(var i in arr){
    //    list.push(arr[i]);
    //}
    // list.push(songId + '-' + copyId);
    // localStorage.setItem('nowPlay',songId);
    // localStorage.setItem('batchSong', list.join(','));
    //$('#player_iframe').contents().find("#list_num").text(localStorage.getItem('batchSong').split(',').length);
    if(copyIds.length == 0) return sweetAlertCommon(SweetAlert, '暂无试听版权', 'warning');
    ajaxJson(listen_url, 'get', 'json', 'copyrightId=' + copyIds[x], function (res) {//获取试听地址并添加到播放器中
        res = res.data;
        var _playList = [];
        if(res.length > 0){
            for (var j = 0; j < res.length; j++) {
                var songList = {};
                songList.title = res[j].title;
                songList.artist = res[j].artist + songId;
                songList.mp3 = res[j].mp3.replace('tyst.migu.cn','218.200.227.130');
                songList.time = new Date().getTime();
                _playList.push(songList);
            }
        }
        console.log(_playList);
        var type = ['全曲', '随身听', '振铃', '彩铃'];        //按此顺序排序播放
        for (var i = 0; i < type.length; i++) {
            for (var j = 0; j < _playList.length; j++) {
                if (_playList[j].title.indexOf(type[i]) != -1) {
                    playList.push(_playList[j]);
                }
            }
        }
        if(x != copyIds.length - 1){
            addPlaySong(songId,SweetAlert, playList,copyIds, x+1);
        } else {
            if(playList.length == 0){
                return sweetAlertCommon(SweetAlert,'暂无试听地址','warning');
            }
            iframe.myPlaylist.remove();
            for(var i = 0; i < playList.length; i++){
                iframe.myPlaylist.add(playList[i]);
            }
            setTimeout(function () {
                iframe.myPlaylist.play(0);
            }, 1200);

        }

            // var type = ['全曲', '随身听', '振铃', '彩铃'];        //只显示单个产品
            //优先选取全曲，然后随身听以此类推
            // choose:
            //     for (var i = 0; i < type.length; i++) {
            //         for (var j = 0; j < res.length; j++) {
            //             if (res[j].title.indexOf(type[i]) != -1) {
            //                 var songList = {};
            //                 songList.title = res[j].title;
            //                 songList.artist = res[j].artist + songId;
            //                 songList.mp3 = res[j].mp3;
            //                 songList.time = new Date().getTime();
            //                 iframe.myPlaylist.add(songList);
            //                 iframe.myPlaylist.play(-1);
            //                 break choose;
            //             }
            //         }
            //     }
    });
}
function  addPlaySong_Catalog(copyId,type,SweetAlert){//编目特殊播放器（播放对应的版权铃音）
    ajaxJson(listen_url, 'get', 'jsonp', 'copyrightFormBean.copyrightId=' + copyId, function (res) {//获取试听地址并添加到播放器中
        if (res['result'] != undefined || res.length < 1) {
            sweetAlertCommon(SweetAlert,'暂无试听地址','warning');
            //alert('暂无试听地址');
        } else {
            //循环播放的类型
            choose:
                for (var i = 0; i < type.length; i++) {
                    for (var j = 0; j < res.length; j++) {
                        if (res[j].title.indexOf(type[i]) != -1) {
                            iframe.myPlaylist.add(res[j]);
                            iframe.myPlaylist.play(-1);
                            break choose;
                        }
                    }
                }
        }
    });
}
function pausePlay() {      //暂停播放器
    iframe.myPlaylist.pause();
}