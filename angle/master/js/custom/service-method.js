/**
 * Created by kiracheng on 2016/5/21.
 */
/**
 * Created by hao.cheng on 2016/4/21.
 * 1.素材界面通用
 */
/**
 * 请求获取数据信息
 * @param tp    数据类型，artist，album，song
 * @param $http
 * @param $scope
 * @param $sce
 * @param $stateParams
 * @param method    回调函数
 */
function getDataInfo(tp,$http,$scope,$sce,$stateParams,flag){
    var infoUrl = detail_url+tp+'/'+$stateParams[tp+'Id']+'.json?' + CALLBACK;
    $http.jsonp(infoUrl).success(function(res1){
        //$scope.data = JSON.parse(JSON.stringify(res1.data).replace(/\\r\\n/g, '<br />'));  //将对象进行特俗处理，替换所有\r\n  -->  <br/>
        //$scope.honors = $sce.trustAsHtml($scope.data.honors);      //转换html代码，使得页面上不用显示<br/>而是换行效果
        //$scope.course = $sce.trustAsHtml($scope.data.course);
        //$scope.resumes = $sce.trustAsHtml($scope.data.resumes);
        if(!checkEmpty($stateParams.tp)){
            res1.data.type = $stateParams.tp;
        }
        if(checkEmpty(res1.data.movies) && res1.data.hasOwnProperty('songId')) res1.data.movies = [{movieType:'',name:'',type:''}]; //如果歌曲不存在movie，默认添加一个空
        if(!checkEmpty(res1.data.birth)){
            if(res1.data.birth.length == 5) $scope.month = true;
        }
        if(!checkEmpty(res1.data.deathdate)){
            if(res1.data.deathdate.length == 5) $scope.deathdatemonth = true;
        }
        if(res1.data.imgUrl != undefined && res1.data.imgUrl != '' && res1.data.imgUrl.indexOf('http') == -1){
            res1.data.imgUrl = img_r_url + res1.data.imgUrl;
            res1.data.imgs = [];

            var imgSize = {}; // undefined var
            // function getMeta(url){
            //     var img = new Image();
            //     img.addEventListener("load", function(){
            //         imgSize.width = this.naturalWidth;
            //         imgSize.height = this.naturalHeight;
            //         getImgHeaders('大','',true);
            //     });
            //     img.src = url;
            // }
            // getMeta(res1.data.imgUrl);
            function getImgHeaders(type,size,f){ //获取图片请求的头信息
                $http.jsonp(http_url+'/img/getHeaders.json?'+CALLBACK+'&url='+res1.data.imgUrl + '?w='+size+'&h='+size).success(function(res){
                    var img = {};
                    img.sizeN = type;
                    img.orderNum = (type == '大' && 3) || (type == '中' && 1) || (type == '小' && 2);
                    img.url = res1.data.imgUrl + '?w='+size+'&h='+size;
                    img.width = (type == '大')?imgSize.width : size;
                    img.height = (type == '大')?imgSize.height : size;
                    img.size = res.hasOwnProperty('data')?Math.ceil(res.data['Content-Length']/1024):'';
                    img.type = res.hasOwnProperty('data')?res.data['Content-Type']:'';
                    if(type == '大'){        //代理请求大图获取宽高
                        var _md5 = res1.data.imgUrl.slice(res1.data.imgUrl.lastIndexOf('/') + 1);
                        $http.get(PROXY_API + '?url=' + img_r_url + 'info?md5=' + _md5).success(function (result) {
                            if(result.info) img.width = result.info.width,img.height = result.info.height;
                        });
                    }
                    if(f)
                        img.selected = true;
                    res1.data.imgs.push(img);
                    if(f){
                        $scope.data = res1.data;            //防止异步请求刷新问题，将$scope.data赋值放到此处
                        setGallery(res1.data.imgs,$scope);
                        if($scope.data.imgs){
                            $scope.data.imgs.sort(function (a, b) {
                                return a.orderNum - b.orderNum;
                            });
                            $scope.data.imgs.forEach(function (val) {
                               val.showUrl = val.url.substring(0, val.url.indexOf('?') ? val.url.indexOf('?') : val.url.lenght);
                            });
                        }
                        getBirth($scope);       //艺人生日特殊处理
                        if(!checkEmpty($scope.data.effectYears)){   //艺人影响年代特殊处理
                            $scope.data.effectYearsStart = ($scope.data.effectYears.split('-'))[0] == 'undefined'?'':($scope.data.effectYears.split('-'))[0];
                            $scope.data.effectYearsEnd = ($scope.data.effectYears.split('-'))[1] == 'undefined'?'':($scope.data.effectYears.split('-'))[1];
                        }
                        translateScore($scope);
                        if(flag != undefined && flag == true){
                            if(tp == 'artist'){
                                setRaty($scope,'mscore');
                            }else{
                                setRaty($scope,'manualScore');
                            }
                            $('#playTime').setTime({drag:true,a:0.05});
                        }
                        console.log($scope.data);
                    }
                })
            }
            getImgHeaders('中',150);
            getImgHeaders('小',85);  //裁剪图片
            getImgHeaders('大','',true);
        }else{
            $scope.data = res1.data;
            setGallery(undefined,$scope,res1.data.imgUrl);
            getBirth($scope);       //艺人生日特殊处理
            if(!checkEmpty($scope.data.effectYears)){   //艺人影响年代特殊处理
                $scope.data.effectYearsStart = ($scope.data.effectYears.split('-'))[0];
                $scope.data.effectYearsEnd = ($scope.data.effectYears.split('-'))[1];
            }
            translateScore($scope);
            if(flag != undefined && flag == true){
                if(tp == 'artist'){
                    setRaty($scope,'mscore');
                }else{
                    setRaty($scope,'manualScore');
                }
                $('#playTime').setTime({drag:true,a:0.05});
            }
            console.log($scope.data);
        }
    });
}
function setGallery(imgs,$scope,img){ //设置图片预览
    $scope.images = [];
    if(!checkEmpty(imgs)){
        for(var i =0; i < imgs.length;i++){
            var image = {};
            image.thumb = imgs[i].url;
            image.img = imgs[i].url;
            image.type = imgs[i].sizeN;
            $scope.images.push(image);
        }
    }else if(!checkEmpty(img)){
        var image = {};
        image.thumb = img;
        image.img = img;
        $scope.images.push(image);
    }

}
function translateScore($scope){    //转换评分，5 --> 5.0
    if(!checkEmpty($scope.data.mscore+'')){
        if(($scope.data.mscore+'').length == 1){
            $scope.data.mscore = $scope.data.mscore + '.0';
        }
    }
    if(!checkEmpty($scope.data.manualScore+'')){
        if(($scope.data.manualScore+'').length == 1){
            $scope.data.manualScore = $scope.data.manualScore + '.0';
        }
    }
}
function setRaty($scope,property){       //评分插件
    $.fn.raty.defaults.path = 'vendor/jquery-raty/lib/img';
    $.fn.raty.defaults.cancelHint = '重置评分！';
    $.fn.raty.defaults.width = 'auto';
    var score = '';
    if(checkEmpty($scope.data)){
        score = '0.0';
    }else{
        if($scope.data[property] == null || $scope.data[property] == undefined || $scope.data[property] == ''){
            score = '0.0';
        }else{
            score = $scope.data[property];
        }
    }
    $('#precision-demo').raty({size: 15.5, target: '#precision-hint', cancel: true, targetKeep: true, precision: true,readOnly: true,score:score});
}
/**
 * 素材界面上传图片
 * @param id    关联数据id
 * @param $timeout
 * @param $rootScope
 * @param display
 * @param type  上传关联数据类型
 * @param $scope
 */
function uploadImg(id,type,$scope,$http,SweetAlert){
    if(checkEmpty($('#file').val())){
        sweetAlertCommon(SweetAlert,'操作失败','warning','请选择上传图片');
        return;
    }
    var fileType = $('#file').val().substring($('#file').val().lastIndexOf('.')+1).toLowerCase();
    if(fileType != 'jpg' && fileType != 'png'){
        sweetAlertCommon(SweetAlert,'操作失败','warning','只能上传jpg或者png格式');
        return;
    }
    if(id)  var url = http_url + '/img/upload/'+type+'/'+id+'.json';
    else var url = http_url + '/img/upload.json';
    // $.ajaxFileUpload(new JqueryAjaxFileUpload(url, 'file', function (data) {
    //     var md5 = data.data;
    //     sweetAlertCommon(SweetAlert,data.msg,'success');
    //     $scope.data.imgUrl = img_r_url + data.data;
    //     var imgs = [];
    //     getImgHeaders('小',85,$scope.data.imgUrl,imgs,$scope,$http);  //裁剪图片
    //     getImgHeaders('中',150,$scope.data.imgUrl,imgs,$scope,$http);
    //     getImgHeaders('大','',$scope.data.imgUrl,imgs,$scope,$http,true);
    // }, function () {
    //     sweetAlertCommon(SweetAlert, '上传图片接口异常', 'warning');
    // }));
    $.ajaxFileUpload({
        url: url,
        type: 'post',
        beforeSend: function (request) {  //token认证
            request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
        },
        secureuri: false,           //一般设置为false
        fileElementId: 'file',      // 上传文件的id、name属性名
        dataType: 'json',           //返回值类型，一般设置为json、application/json
        success: function(data){
            var md5 = data.data;
            sweetAlertCommon(SweetAlert,data.msg,'success');
            $scope.data.imgUrl = img_r_url + data.data;
            var imgs = [];
            getImgHeaders('中',150,$scope.data.imgUrl,imgs,$scope,$http);
            getImgHeaders('小',85,$scope.data.imgUrl,imgs,$scope,$http);  //裁剪图片
            getImgHeaders('大','',$scope.data.imgUrl,imgs,$scope,$http,true);
        },
        error: function(data, status, e){
            console.log(e);
        }
    });
}
function deleteImg($scope,SweetAlert){
    if($scope.data.imgUrl != undefined){
        $scope.data = deleteProperty($scope.data,'imgUrl');
        sweetAlertCommon(SweetAlert,'删除图片成功，点击提交后才能改变数据','success');
    }
    if($scope.data.imgs != undefined){
        $scope.data = deleteProperty($scope.data,'imgs');
    }
}
function getImgHeaders(type,size,imgUrl,arr,$scope,$http,f){ //获取图片请求的头信息
    $http.jsonp(http_url+'/img/getHeaders.json?'+CALLBACK+'&url='+imgUrl + '?w='+size+'&h='+size).success(function(res){
        var img = {};
        img.orderNum = (type == '大' && 3) || (type == '中' && 1) || (type == '小' && 2);
        img.sizeN = type;
        img.url = imgUrl + '?w='+size+'&h='+size;
        img.width = size;
        img.height = size;
        img.size = res.hasOwnProperty('data')?Math.ceil(res.data['Content-Length']/1024):'';
        img.type = res.hasOwnProperty('data')?res.data['Content-Type']:'';
        if(f)
            img.selected = true;
        arr.push(img);
        if(f){
            $scope.data.imgs = arr            //防止异步请求刷新问题，将$scope.data赋值放到此处
            console.log($scope.data.imgs);
            setGallery($scope.data.imgs,$scope);
            $scope.data.imgs.sort(function (a, b) {
               return a.orderNum = b.orderNum;
            });
        }
    })
}
function uploadLyric(content,$scope,SweetAlert){
    if(checkEmpty($('#lyricFile').val())){
        sweetAlertCommon(SweetAlert,'请选择上传文件','warning');
        return;
    }
    var fileType = $('#lyricFile').val().substring($('#lyricFile').val().lastIndexOf('.')+1);
    if(fileType != 'txt' && fileType != 'lrc'){
        sweetAlertCommon(SweetAlert,'只能上传txt或者lrc格式','warning');
        return;
    }
    $.ajaxFileUpload({
        url:http_url + '/lyric/upload.json',
        type: 'post',
        secureuri: false,           //一般设置为false
        fileElementId: 'lyricFile',      // 上传文件的id、name属性名
        dataType: 'json',           //返回值类型，一般设置为json、application/json
        success: function(data){
            if(data.status != 1)
                return sweetAlertCommon(SweetAlert,res.msg,'error');
            content.lyric = data.data;
            console.log(data);
            $scope.$apply();
        },
        error: function(data, status, e){
            console.log(e);
        }
    });
}
/**
 * 查看以及审核界面编辑按钮
 * @param type
 * @param id
 */
function dataEdit(type,id,$timeout,$rootScope,display){
    //ajaxJson(edit_auth + '/'+type+'/' + id + '.json','post','json',null,function(res){
    //    if(res.status == 1){
    //        var lastUrl = document.location.href.substring(0, document.location.href.indexOf('lastPage') -1);
    //        window.open('/mls/resources/pages/top/index.html#/artistEdit?artistId=' + $stateParams.artistId + '&auth=' + res.data.auth + '&lastPage=' + encodeURIComponent(lastUrl), '_blank');
    //    } else {
    //        alertTipCommon($timeout,$rootScope,res.msg,display);
    //    }
    //},false);
    var url = edit_auth + '/'+type+'/' + id + '.json';
    jQuery.ajax({
        url: url ,
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "jsonp",  // not "json" we'll parse
        jsonp: CALLBACK,
        contentType: "application/jsonp; charset=utf-8",
        success: function(res) {
            if(res.status == 1){
                var lastUrl = document.location.href.substring(0, document.location.href.indexOf('lastPage') -1);
                //var lastUrl = document.location.href;
                window.open('/mls/resources/pages/top/index.html#/artistEdit?artistId=' + $stateParams.artistId + '&auth=' + res.data.auth + '&lastPage=' + encodeURIComponent(lastUrl), '_blank');
            } else {
                alertTipCommon($timeout,$rootScope,res.msg,display);
            }
        },
        error: function (res) {
            alertTipCommon($timeout,$rootScope,res.msg,display);
        }
    });
}
/**
 * 素材界面获取审核意见数据列表
 * @param type  素材类型，song,album,artist
 * @param $http
 * @param $scope
 * @param $cookies
 * @param $stateParams
 */
function getExamineList(type,pageNo,$http,$scope,$stateParams,SweetAlert){
    var url = http_audit+'opinion/'+type+'/' + $stateParams[type+'Id'] + '.json?' + CALLBACK+'&pageNo='+ pageNo;
    $http.jsonp(url).success(function(res2){
        if(res2.data.list.length < 1 && pageNo > 1){
            sweetAlertCommon(SweetAlert,'暂无更多数据','warning');
            return;
        }
        $scope.auditDatas = res2.data.list;
        //if(res2.status == 1){
        //    getGitUsers($http, $cookies, $scope, 1, function(){
        //        $scope.auditDatas = res2.data.list;
        //        for(var i in $scope.auditDatas){
        //            for(var p in $scope.gitUsers){
        //                if($scope.auditDatas[i].userId == $scope.gitUsers[p].uId){
        //                    $scope.auditDatas[i].userName = $scope.gitUsers[p].name;
        //                    //$scope.auditDatas[i].optTime = format($scope.auditDatas[i].optTime,'yyyy-MM-dd');
        //                }
        //            }
        //        }
        //    });
        //}
    });
}
/**
 * 素材界面获取关联标签数据
 * @param type
 * @param $http
 * @param $scope
 * @param $stateParams
 */
function getMaterialTags(type,$http,$scope,$stateParams){
    var url = tag_edit_new_query + type + '/' + $stateParams[type+'Id'] + '.json?' + CALLBACK;
    $http.jsonp(url).success(function(res3){
        $scope.artistTags = res3.data.tags;
        $scope.tagExt = res3.data.tagExt;
        //if(!checkEmpty($scope.tagExt)){
        //    if(!checkEmpty($scope.tagExt.ishot)){
        //        $scope.tagExt.ishot = translateTimeToDate($scope.tagExt.ishot);
        //    }
        //    if(!checkEmpty($scope.tagExt.isnew)){
        //        $scope.tagExt.isnew = translateTimeToDate($scope.tagExt.isnew);
        //    }
        //}
        $scope.relTags = res3.data;
        for(var i=0;i < res3.data.tags.length; i++){    //设置标签，将获取的关联标签赋值给打标签操作
            var tag = {};
            tag.type = res3.data.tags[i].type;
            tag.tagId = res3.data.tags[i].tagId;
            $scope.taggingData.tags.push(tag);
        }
    });
}
/**
 * 获取当前数据的子数据列表
 * @param type      当前数据类型 song,album,artist
 * @param sub       当前数据的子类型，eg:album的子类型-->song
 * @param id        当前数据id
 * @param $http
 * @param $scope
 */
function getDataSubs(type,sub,id,$http,$scope){
    var url = http_url + '/subs/'+type+'/'+id+'/'+sub+'.json?'+CALLBACK;
    $http.jsonp(url).success(function(res){
        $scope.subDatas = res.data.list;
    })
}
/**
 * 素材界面通用审核确认
 * @param type      素材类型，song,album,artist
 * @param examineResult     审核结果，通过，不通过
 * @param examineSuggest    审核意见
 * @param $http
 * @param $stateParams
 * @param $timeout
 * @param $rootScope
 * @param display
 */
function examineCommon(type,examineResult,examineSuggest,$http,$stateParams,SweetAlert){
    var rtp = type;
    if(type == 'songTag'){
        rtp = 'song';
    };
    if($stateParams.taskId == undefined){
        return sweetAlertCommon(SweetAlert,'没有工单ID','warning');
    }
    if(examineResult == undefined){
        return sweetAlertCommon(SweetAlert,'请选通过或者不通过','warning');
    }
    if(examineSuggest == undefined){
        examineSuggest = '';
    }
    var url = http_audit + type + '/' + $stateParams.taskId + '.json?' + 'rid=' + $stateParams[rtp+'Id'] + '&status=' + examineResult + '&opinion=' + examineSuggest;
    $http.get(url).success(function(res){
        // sweetAlertCommon(SweetAlert,res.msg,'success');
        if(res.status == 1){
            pausePlay();
            if(!checkEmpty($stateParams.lastPage)) window.open(returnLastPage($stateParams.lastPage), '_self');
            else history.back();
        }else {
            sweetAlertCommon(SweetAlert,res.msg,'error');
        }
    }).error(function () {
        sweetAlertCommon(SweetAlert,'请求审核接口异常','warning');
    });
}
/**
 * 素材界面通用抽查确认
 * @param type      素材类型，song,album,artist
 * @param examineResult     审核结果，通过，不通过
 * @param examineSuggest    审核意见
 * @param $http
 * @param $stateParams
 * @param $timeout
 * @param $rootScope
 * @param display
 */
function checkCommon(type,ckResult,ckSuggest,ckTagError,$http,$stateParams,SweetAlert){
    if(ckResult == undefined) return sweetAlertCommon(SweetAlert,'没有选择抽查结果','warning');
    if($stateParams.taskId == undefined) return sweetAlertCommon(SweetAlert,'没有工单ID','warning');
    var ckTag = [];
    for(var i = 1; i <= 5; i++){
        if(ckTagError["tag" + i]){
            ckTag.push(i);
        }
    }
    //if(ckTag.length == 0){
    //    sweetAlertCommon(SweetAlert,'没有选择错误分类','warning');
    //    return;
    //}
    if(ckSuggest == undefined){
        ckSuggest = '';
    }
    var data = {};
    data.type = type;
    data.taskId = $stateParams.taskId;
    data.rid = (type == 'songTag') ? $stateParams['songId'] : $stateParams[type+'Id']; //标签抽查单独特殊处理
    data.result = ckResult;
    data.opinion = ckSuggest;
    data.tagIds = stringToArray(ckTag);
    var postSet = new PostSetup(http_check + 'save.json', 'data=' + encodeURIComponent(JSON.stringify(data)));
    $http(postSet).success(function (res) {
        if(res.status == 1){
            pausePlay();
            // sweetAlertCommon(SweetAlert,res.msg,'success');
            if(!checkEmpty($stateParams.lastPage)) window.open(returnLastPage($stateParams.lastPage), '_self');
            else history.back();
        }else{
            sweetAlertCommon(SweetAlert, res.msg, 'error');
        }
    }).error(function () {
        sweetAlertCommon(SweetAlert, '抽查接口请求异常', 'warning');
    })

}
/**
 * 获取素材界面url地址
 * @param data  对象数据
 * @param type  数据类型
 * @returns {string}
 */
function getOpenUrl(data,type){
    return '/mls/resources/pages/top/index.html#/'+type+'Info?'+type+'Id=' + data[type+'Id'] + '&lastPage={"url":"' + encodeURIComponent(document.location.href)+'"}';
}
/**
 * 解锁编辑和审核状态
 * @param type  数据类型
 * @param id    数据id
 * @param $http
 * @param $stateParams
 * @param $timeout
 * @param $rootScope
 * @param display
 */
function unLock(type,id,$http,$stateParams,SweetAlert){
    var url = returnLastPage($stateParams.lastPage);
    if(checkEmpty($stateParams[type+'Id'])){    //如果是新增界面就直接返回
        window.open(url, '_self');
        return;
    }
    $http.jsonp(http_url+'/edit/rollback/'+type+'/'+id+'.json?'+CALLBACK).success(function(res){
        if(res.status == 1){
            window.open(url, '_self');
        }else{
            sweetAlertCommon(SweetAlert,res.msg,'error');
        }
    }).error(function(res){
        sweetAlertCommon(SweetAlert,'请求异常','warning');
    });
}
/**
 * 向素材添加关联数据，eg:艺人的相似艺人，专辑的歌手，歌曲的歌手等
 * @param data      需要的数据信息
 * @param arr       需要往里面添加数据的数组名
 */
function addRelationData(data,arr,type){
    if(arr == undefined){
        arr = [];
    }
    var material = new Object();
    material[type+'Id'] = data[type+'Id'];
    material[type+'Name'] = data[type+'Name'];
    var flag = -1;
    arr.forEach(function (val) { //已经存在的数据不能重复添加
        if(val[type+'Id'] == material[type+'Id']) return flag = 1;
    });
    if(flag == 1) return console.log('数据已存在');
    arr.push(material);
}
/**
 * 向素材添加唯一的对象数据 eg:歌曲的首张专辑
 * @param data
 * @param obj
 * @param type
 */
function addOnlyData(data,obj,type,property){
    var material = new Object();
    material[type+'Id'] = data[type+'Id'];
    material[type+'Name'] = data[type+'Name'];
    obj[property] = material;
    obj[property+'Id'] = data[type+'Id'];
}
/**
 * 获取素材界面打标签的标签列表
 * @param type  类型，song 3,artist 1,album 2
 * @param $scope
 * @param $http
 */
function getTaggingTags(type,$scope,$http){
    $http.get(tag_tree_url+'getArtisteByClassificationAndTag?'+'type='+type).success(function(res){
        $scope.areaList = res.areaList;     //地域
        $scope.eraList = res.eraList;       //年代
        $scope.mainStylesList = res.mainStylesList;     //主风格
        $scope.occupationList = res.occupationList;     //职业
        $scope.secondaryStyleList = res.secondaryStyleList;     //次风格
        $scope.skilledInMusicList = res.skilledInMusicList;     //乐器
        $scope.timbreList = res.timbreList;     //音色
        $scope.languageList = res.languageList;     //语言
        $scope.emotionList = res.emotionList;       //情感
        $scope.sceneList = res.sceneList;       //场景
        $scope.subjectList = res.subjectList;   //主题
        if($scope.subjectList) {
            $scope.subjectList.tagList.forEach(function (val) { //处理二级子标签
                if(val.tagLevel == 1){
                    val.children = [];
                    $scope.subjectList.tagList.forEach(function (val2) {
                        if(val2.tagLevel == 2){
                            if(val.tagId == val2.parentId){
                                val.isParent = true;
                                val.children.push(val2);
                            }
                        }
                    });
                }
            });
            $scope.subjectList.tagList.forEach(function (val) { //处理三级子标签
                if(val.tagLevel == 2){
                    val.children = [];
                    $scope.subjectList.tagList.forEach(function (val2) {
                        if(val2.tagLevel == 3){
                            if(val.tagId == val2.parentId){
                                val.isParent = true;
                                val.children.push(val2);
                            }
                        }
                    });
                }
            });
        }
        console.log($scope.subjectList);
    });
}
/**
 * 打标签后设置标签参数对象（操作逻辑）
 * @param t     所需标签值对象
 * @param type      标签类型
 * @param $scope
 */
function setTaggingData(t,type,$scope){
    t.type = type;
    var _t = cloneOneObject(t);
    for(var i in $scope.artistTags){    //相同标签不能重复打
        if(type == 14 || type == 11){   //如果是特殊的标签只能打一个的就替换原有标签
            if($scope.artistTags[i].type == type){
                $scope.artistTags[i].tagId = _t.tagId;
                $scope.artistTags[i].tagName = _t.tagName;
            }
        }else if($scope.artistTags[i].tagId == t.tagId){
            console.log('标签已存在');
            return;
        }
    }
    // t.type = type;
    if($scope.artistTags == undefined){
        $scope.artistTags = [];
    }
    if(type == 14 || type == 11){   //对于单个标签替换处理
        var flag = true;
        for(var i in $scope.artistTags){
            if($scope.artistTags[i].type == type){
                $scope.artistTags[i].tagId = _t.tagId;
                $scope.artistTags[i].tagName = _t.tagName;
                flag = false;
            }
        }
        if(flag)
            $scope.artistTags.push(_t);
    }else{
        $scope.artistTags.push(_t);  //打标签时往标签对象里面添加数据使得页面同步显示
    }

    // var tag = {};
    // tag.type = type;
    // tag.tagId = t.tagId;
    if(type == 14 || type == 11){   //如果类型等于14或者11，标签只能替换，打一次，其他可以打多个
        for(var i=0;i<$scope.taggingData.tags.length;i++ ){
            if($scope.taggingData.tags[i].type == type){
                $scope.taggingData.tags[i].tagId = _t.tagId;
                console.log($scope.taggingData);
                return;
            }
        }
    }
    $scope.taggingData.tags.push(_t);
}
/**
 * 获取子风格和其他子风格
 * @param tp        专辑类型
 * @param property      专辑对应的属性
 */
function getCStyle(tp,property,$scope,$http){
    var ids = [];
    var tps = tp.split(',');
    for(var i in $scope.taggingData.tags){
        for(var j in tps){
            if($scope.taggingData.tags[i].type == tps[j]){ //只获取主风格的子风格
                ids.push($scope.taggingData.tags[i].tagId);
            }
        }

    }
    if(ids.length > 0){
        $http.get(tag_tree_url+'getArtisteBySonStyleListAndTag.do?'+'data='+ids.join(',')).success(function(res){
            $scope[property] = res[property];
            console.log($scope[property]);
        })
    }
}
/**
 * 提交按钮提交数据
 * @param type      数据类型
 * @param $scope
 * @param $http
 * @param $stateParams
 * @param $filter
 * @param $timeout
 * @param $rootScope
 * @param display
 */
function submit(type,$scope,$http,$stateParams,$filter,SweetAlert,preCatalogId,CatalogService){
    if($scope.data.imgUrl != undefined){
        if($scope.data.imgUrl.indexOf(img_r_url) != -1){
            // $scope.data.imgUrl = $scope.data.imgUrl.substring(31,$scope.data.imgUrl.length);
            $scope.data.imgUrl = $scope.data.imgUrl.replace(img_r_url,'');
        }
    }
    var data = deleteProperty(iteratorData($scope.data,$filter),'imgs');   //遍历数据处理特殊字段
    data.auth = $stateParams.auth;
    //data.manualScore = getRatingStars();    //设置评分
    var submitUrl = '';
    data.tags = $scope.taggingData.tags;
    data.tagExt = $scope.taggingData.tagExt;
    if(!checkEmpty($stateParams.taskId)){
        data.taskId = $stateParams.taskId;
    }
    submitUrl = save_url + type +'.json';
    //数据标签提交
    // $http.jsonp(tag_edi_new_update + type + '.json?'+CALLBACK+'&data='+JSON.stringify($scope.taggingData)).success(function(res){
    //     if(res.status != 1){
    //         sweetAlertCommon(SweetAlert,'打标签失败','error');
    //     }
    // });
    //var submitUrl = 'http://192.168.2.203:17080/update/' + type +'.json';
    //数据对象属性提交
    $http(new PostSetup(submitUrl, 'data='+encodeURIComponent(angular.toJson(data)))).success(function(res){
        if(res.status == 1){
            if(preCatalogId) var _promise = CatalogService.service.createCatalogPre(preCatalogId, res.data);
            if(_promise) _promise.then(function (res) {
                if(res.status != 1) return sweetAlertCommon(SweetAlert, '预编目创建失败', 'warning');
                else _finalJump();
            });
            else _finalJump();
            function _finalJump() {
                // sweetAlertCommon(SweetAlert,res.msg,'success');
                pausePlay();
                if(!checkEmpty($stateParams.lastPage)) window.open(returnLastPage($stateParams.lastPage), '_self');
                else history.back();
            }
        }else{
            sweetAlertCommon(SweetAlert,res.msg,'error');
        }
    });
}
/**
 * 去掉已打标签
 * @param t
 * @param $scope
 */
function removeTagging(t,$scope){
    for(var i in $scope.taggingData.tags){
        if($scope.taggingData.tags[i].tagId == t.tagId){
            $scope.taggingData.tags.del(i);
            $scope.artistTags.del(i);
        }
    }
}
/**
 * 素材界面编辑按钮
 * @param type      素材类型
 * @param id        素材id
 * @param $timeout
 * @param $rootScope
 * @param display
 * @param $stateParams
 */
function edit(type,id,$timeout,$rootScope,display,$stateParams){
    var url = edit_auth + '/'+type+'/' + id + '.json';
    jQuery.ajax({
        url: url ,
        type: "post",
        async: false,
        timeout: 15000,
        dataType: "jsonp",  // not "json" we'll parse
        jsonp: CALLBACK,
        contentType: "application/jsonp; charset=utf-8",
        success: function(res) {
            if(res.status == 1){
                //var lastUrl = document.location.href.substring(0, document.location.href.indexOf('lastPage') -1);
                var lastUrl = document.location.href;
                window.open('/mls/resources/pages/top/index.html#/'+type+'Edit?'+type+'Id=' + $stateParams[type+'Id'] + '&auth=' + res.data.auth + '&lastPage={"url":"' + encodeURIComponent(lastUrl)+'"}', '_self');
            } else {
                alertTipCommon($timeout,$rootScope,res.msg,display);
            }
        },
        error: function (res) {
            alertTipCommon($timeout,$rootScope,res.msg,display);
        }
    });
}
function toEdit(type,id,$stateParams,$state,SweetAlert){
    var url = edit_auth + '/'+type+'/' + id + '.json';
    $.ajax(new JqueryAjax(url, function (res) {
        if(res.status == 1){
            var param = {};
            param[type+'Id'] = $stateParams[type+'Id'];
            param['auth'] = res.data.auth;
            param['lastPage'] = $stateParams.lastPage;
            $state.go(type+'Edit',param);
        } else {
            sweetAlertCommon(SweetAlert,res.msg,'warning');
        }
    }), function () {
        sweetAlertCommon(SweetAlert,'编辑权限验证接口请求异常','warning');
    });
}
/**
 * 图片下一张查看
 * @param img
 * @param imgs
 */
function selectImgNext(img,imgs){
    var index = imgs.indexOf(img);
    if(index == (imgs.length -1)){
        imgs[0].selected = true;
        imgs[index].selected = false;
    }else{
        imgs[index+1].selected = true;
        imgs[index].selected = false;
    }
}
/**
 * 图片上一张查看
 * @param img
 * @param imgs
 */
function selectImgPre(img,imgs){
    var index = imgs.indexOf(img);
    if(index == 0){
        imgs[imgs.length -1].selected = true;
        imgs[index].selected = false;
    }else{
        imgs[index-1].selected = true;
        imgs[index].selected = false;
    }
}
/**
 * 新增素材数据初始化调用
 * @param type      新增素材类型
 * @param $scope
 * @param $stateParams
 */
function addNewDataPage(type,$scope,$stateParams){
    if(checkEmpty($stateParams[type+'Id'])){   //如果数据id为空
        $scope.data = {};       //初始化数据对象
        if(type == 'album') $scope.data.composers = [],$scope.data.cantors = [],$scope.data.performers = [],$scope.data.artists = [];
        if(checkEmpty($stateParams.tp)){
            $scope.data.type = 1;
        }else{
            $scope.data.type = $stateParams.tp;
        }
    }
}
/**
 * 获取评分数据
 * @returns {*}
 */
function getRatingStars(){
    var stars = $('#precision-hint').val();
    if(checkEmpty(stars))
        return '';
    else
        return stars;
}
function getBirth($scope){
    if(checkEmpty($scope.data.birth)){
        return;
    }
    if($scope.data.birth.indexOf('年') == -1){
        return;
    }
    var reg = /[^\[]*\年(.*)\月[^\]]*/;
    var reg2 = /[^\[]*\月(.*)\日[^\]]*/;
    var month = $scope.data.birth.replace(reg,'$1');
    var day = $scope.data.birth.replace(reg2,'$1');
    var year = $scope.data.birth.substring(0,4);
    if(month.length != 2)
        month = '0'+month;
    if(day.length != 2)
        day = '0' + day;
    $scope.data.birth = year + '-' + month + '-' + day;
}
/**
 * 列表页面标签搜索
 * @param tag   所选标签
 * @param artistTagTree     所有标签
 * @param type  素材类型
 * @param $stateParams
 * @param $state
 */
function tagClick(tag,artistTagTree,type,$stateParams,$state){
    for(var p in $stateParams){
        if(p != 'tagIds' && p != 'id'){
            $stateParams[p] = '';
        }
    }
    if($stateParams.tagIds == undefined){
        $stateParams.tagIds = tag.id;
        $state.go(type,$stateParams);
    } else {
        //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
        //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
        var parentRepeatTag = judgeParentTagRepeat(tag, $stateParams.tagIds.split(','), artistTagTree);
        if(parentRepeatTag == undefined){
            $stateParams.tagIds = $stateParams.tagIds + ',' + tag.id;
            $state.go(type,$stateParams);
        } else {
            var ids = $stateParams.tagIds.split(',');
            ids[ids.indexOf(parentRepeatTag.id)] = tag.id;
            $stateParams.tagIds = ids.join(',');
            $state.go(type,$stateParams);
        }
    }
}
function openNewTab(type,data,op,$state){
    var date = new Date();
    var time = date.getTime();
    localStorage.setItem(time,document.location.href);
    var param = {};
    param[type+'Id'] = data[type+'Id'];
    param['lastPage'] = time;
    var url = $state.href(type+op,param);
    window.open(url, '_blank');
}
function infoNewTabState(type,id,op,$state){
    var date = new Date();
    var time = date.getTime();
    localStorage.setItem(time,document.location.href);
    var param = {};
    param[type+'Id'] = id;
    param['lastPage'] = time;
    var url = $state.href(type+op,param);
    window.open(url, '_self');
}
/**
 * 返回lastPage的时间戳
 * @returns {number}
 */
function returnLastPageTime(){
    var date = new Date();
    var time = date.getTime();
    sessionStorage.setItem(time,document.location.href);
    return time;
}
function returnLastPage(time){
    return sessionStorage.getItem(time);
}
/**
 * 素材界面基础请求
 * @param type  素材类型
 * @param $scope
 * @param $http
 * @param $sce
 * @param $stateParams
 * @param $cookies
 * @param flag
 */
function basicRequest(type,catalogs,$scope,$http,$sce,$stateParams,$cookies,flag){
    $scope.catalogs = catalogs;
    $scope.birth = '9999-19-39';
    $scope.taggingData = {},$scope.taggingData.rid=$stateParams[type+'Id'],$scope.taggingData.tags=[];     //更新标签参数
    $scope.tagExt = {};
    if(!checkEmpty($stateParams[type+'Id'])){
        getDataInfo(type,$http,$scope,$sce,$stateParams,flag);    //获取专辑信息
        getExamineList(type,1,$http,$scope,$stateParams);     //获取审核意见列表
        getOpRecord(type,$stateParams[type+'Id'],1,1,$http,$scope);     //获取操作记录
        getMaterialTags(type,$http,$scope,$stateParams);     //获取关联标签
        getCheckRecod(type,$stateParams[type+'Id'],1,$http,$scope);     //获取抽查记录
        if(type == 'album')
            getDataSubs(type,'song',$stateParams[type+'Id'],$http,$scope);      //获取专辑下的歌曲列表
    }
}
/**
 * 对象数组中添加佚名
 * @param arr
 */
function addUnknown(arr,type,id,name){
    var material = {};
    material[type+'Id'] = id;
    material[type+'Name'] = name;
    for(var i in arr){      //已经存在的数据不能重复添加
        if(arr[i][type+'Id'] == material[type+'Id']){
            console.log('数据已存在');
            return;
        }
    }
    arr.push(material);
}
function editJumpNew(type,data,SweetAlert,$state,flag, $stateParams){  //跳转编辑页面
    if(flag == null || flag == undefined){
        flag = '_blank';
    }
    var url = http_url + '/edit/' + type + '/'+ data[type + 'Id'] + '.json';
    $.ajax({
        url: url ,
        beforeSend: function(request) {
            request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
        },
        type: "post",
        async: false,
        dataType: "json",  // not "json" we'll parse
        success: function(res) {
            if(res.status != 1){
                sweetAlertCommon(SweetAlert,res.msg,'error');
                return;
            } else {
                var param = {};
                param[type+'Id'] = data[type + 'Id'];
                param['auth'] = res.data.auth;
                param['lastPage'] = $stateParams.lastPage ? $stateParams.lastPage : returnLastPageTime();
                if(data.taskId != undefined){
                    param['taskId'] = data.taskId;
                }
                var openUrl =  $state.href(type+'Edit',param);
                window.open(openUrl,flag);
            }
        },
        error: function (res) {
            sweetAlertCommon(SweetAlert,'请求异常','error');
        }
    });
}
/**
 * 获取操作记录
 * @param type 素材类型
 * @param id    素材id
 * @param opType    操作类型
 * @param $http
 */
function getOpRecord(type,id,opType,pageNo,$http,$scope,SweetAlert){
    $http.jsonp(operating_history+'/'+type+'/'+id+'.json?optType='+opType+'&'+CALLBACK+'&pageSize=20&pageNo='+pageNo).success(function(res){
        if(res.data.list.length < 1 && pageNo > 1){
            sweetAlertCommon(SweetAlert,'暂无更多数据','warning');
            return;
        }
        $scope.opDatas = res.data.list;
    })
}
/**
 * 获取抽查记录
 * @param type
 * @param rid
 * @param pageNo
 * @param $http
 */
function getCheckRecod(type,rid,pageNo,$http,$scope,SweetAlert){
    var data = {
        'type':type,	//数据类型，artist,album,song
        'rid':rid,			//关联数据id
        'pageNo':pageNo,			//默认为1
        'pageSize':20		//默认为20
    };
    $http.jsonp(CHECK_RECORD+'?data='+JSON.stringify(data)+'&'+CALLBACK).success(function(res){
        if(res.data.pageNo != pageNo && pageNo > 1){
            sweetAlertCommon(SweetAlert,'暂无更多数据','warning');
            return;
        }
        $scope.checkRecords = res.data.list;
        console.log(res);
    })
}
var loadMore = {        //操作记录加载更多数据逻辑
    'pageNo': function($scope){
        return $scope.pageNo = checkEmpty($scope.pageNo) ? 2 : ($scope.pageNo + 1);
    },
    'operate': function(type,$scope,$stateParams,$http,SweetAlert){
        getOpRecord(type,$stateParams[type+'Id'],1,loadMore.pageNo($scope),$http,$scope,SweetAlert);
    },
    'examine': function (type,$scope,$stateParams,$http,SweetAlert) {
        getExamineList(type,loadMore.pageNo($scope),$http,$scope,$stateParams,SweetAlert);
    },
    'check': function(type,$scope,$stateParams,$http,SweetAlert){
        getCheckRecod(type,$stateParams[type+'Id'],loadMore.pageNo($scope),$http,$scope,SweetAlert);
    }
};
function loadMoreRecord(type,$scope,$stateParams,$http,SweetAlert){
    $scope.loadMoreOperate = function(){
        loadMore.operate(type,$scope,$stateParams,$http,SweetAlert);
    };
    $scope.loadMoreExamine = function(){
        loadMore.examine(type,$scope,$stateParams,$http,SweetAlert);
    };
    $scope.loadMoreCheck = function(){
        loadMore.check(type,$scope,$stateParams,$http,SweetAlert);
    };
};
/**
 * 新增素材数据,当前单页面
 * @param type  素材类型
 * @param $state
 * @param $stateParams
 */
function addNewMaterial(type,$state,$stateParams){
    var param = {};param[type+'Id']='';param['lastPage']=returnLastPageTime();param['auth']=$stateParams.auth;
    var url = $state.href(type+'Edit', param);
    window.open(url,'_blank');
}
function addNewMaterialFromTop(type,$state){
    var param = {};
    param[type+'Id']  = '';
    param['lastPage'] = returnLastPageTime();
    var url = $state.href(type+'Edit',param);
    window.open(url,'_blank');
}
/**
 * 转换时间戳为日期
 * @param date
 * @returns {string}
 */
function fixDate(date){
    if(!checkEmpty(date)){
        if(date.length == 4){
            var month = date.substring(0,2);
            var day = date.substring(2,date.length);
            return date = month + '-' + day;
        }else{
            var year = date.substring(0,4);
            var month = date.substring(4,6);
            var day = date.substring(6,date.length);
            return date = year+ '-'+ month + '-' + day;
        }
    }
}
/**
 * 监听评分变化
 * @param s
 * @param property
 */
function watchScore(s,property){
    if(!checkEmpty(s[property])){
        var score = parseInt(s[property]);
        if(score>50){
            s[property] = 5+ '.' +0 ;
        }else{
            s[property] = s[property].substring(0,1) + '.' + s[property].substring(1);
        }
        console.log(s[property]);
    }
}
/**
 * 判断某个标签和一串标签ID是否父标签相同,如果不相同,返回undefined，如果相同，返回相同标签
 * @param tag   查询的标签对象
 * @param tagIds    已查询的标签id集合
 * @param tnList    标签搜索的所有标签集合
 * @returns {*}
 */
function judgeParentTagRepeat(tag, tagIds, tnList) {
    //tag是自己封装的，只有id,name,pId属性
    //tnList是接口来的tag集合，属性较多，id,name,parentId等
    for (var i = 0; i < tagIds.length; i++) {
        var tempTag = getTagById(tagIds[i], tnList);
        if (tag.pId == tempTag.parentId) {
            return tempTag;
        }
    }
    return undefined;
}
/**
 * 通过标签id获取标签对象
 * @param tagId
 * @param tags
 * @returns {*}
 */
function getTagById(tagId, tags) {
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].id == tagId) {
            return tags[i];
        }
        for (var j = 0; j < tags[i].children.length; j++) {
            if (tags[i].children[j].id == tagId) {
                return tags[i].children[j];
            }
        }
    }
    return undefined;
}
/**
 * 获取标签树数据
 * @param tp
 * @param $scope
 * @param $stateParams
 * @param $http
 */
function getTagList(tp,$scope,$stateParams,$http,$cookies,SweetAlert,flag){
    var songTagTree = [];
    var songFilterTagTree = [];
    var tag_url = tag_tree_url + 'getTagsByMaterialAndUser.do?userId=' + JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid + '&materialType='+tp+'&maxLevel=3';
    $http.get(tag_url).success(function(res){
        //console.log(res);
        if(res.message == 'success'){
            //循环标签树设置祖先节点id
            for(var i = 0; i < res.tnList.length; i++){
                for(var j = 0; j < res.tnList[i].children.  length; j++){
                    res.tnList[i].children[j].ancestorId = res.tnList[i].id;
                    res.tnList[i].children[j].ancestorName = res.tnList[i].name;
                }
            }
            //把标签树保存下来供其它地方根据ID获取标签
            songTagTree = res.tnList;
            // localStorage.setItem('tagTree'+tp,JSON.stringify(songTagTree));
            $scope.allTags = [];
            songFilterTagTree.length = 0;
            for(var n = 0; n < songTagTree.length; n++ ){
                $scope.allTags.push(songTagTree[n]);
                for(var m = 0; m < songTagTree[n].children.length; m++){
                    songFilterTagTree.push(songTagTree[n].children[m]);
                }
                $scope.allTags = $scope.allTags.concat(songFilterTagTree);
            }
            $scope.songFilterTagTree = songFilterTagTree;
            if(checkEmpty(flag)){
                songFillSearchCondition($stateParams, $scope, $http, $cookies, songTagTree);
            }
            //下面的代码是拼凑歌曲页面顶部的标签树的结构
            var tags = [];
            for(var i=0; i < songTagTree.length; i++){
                var nodeList = [];
                var tag_all = getAllNode(songTagTree[i],nodeList);
                var tag = tag_all[tag_all.length -1];
                tag.children = [];
                for(var j = 0; j < tag_all.length - 1;j++){
                    tag.children.push(tag_all[j]);
                }
                tags.push(tag);
            }
            //console.log(tags);
            $scope.tags_title = tags;
        } else {
            console.log(res);
            sweetAlertCommon(SweetAlert,'标签树请求异常','warning','返回值:'+JSON.stringify(res));
        }
        //点击顶部标签展开下级的标签
        if($stateParams.id != undefined){
            for(var i = 0; i < $scope.tags_title.length; i++){
                if($scope.tags_title[i].id == $stateParams.id){
                    $scope.tags_list = $scope.tags_title[i].children;
                }
            }
        }
    }).error(function(res){
        //alert('网络错误，无法加载标签');
        sweetAlertCommon(SweetAlert,'标签树请求异常','warning');
    });
}
/**
 * 风格标签搜索处理方式
 * @param tag
 * @param $scope
 * @param addOrRemove
 */
function styleTagSearchWay(tag,$scope,addOrRemove) {    //选择标签addorremve为true否则为false
    if(tag.ancestorName == '风格' && tag.tagLevel != 2 && tag.parentId != 1000129663){
        if(checkEmpty($scope.form)) $scope.form = {};
        if(addOrRemove){
            return $scope.form.style = 1;
        }else {
            return $scope.form.style = undefined;
        }
    }
    // for(var i = 0; i < $scope.allTags.length; i++){
    //     if(tag.pId == $scope.allTags[i].id){
    //         var ancestor = $scope.allTags[i];
    //         if(ancestor.tagLevel == 0 && (ancestor.name == '风格' || ancestor.name == '有声内容'
    //             || ancestor.name == '通用流派' || ancestor.name == '中国特色' || ancestor.name == '世界音乐')) {
    //             if(checkEmpty($scope.form)) $scope.form = {};
    //             if(addOrRemove){
    //                 return $scope.form.style = 1;
    //             }else {
    //                 return $scope.form.style = undefined;
    //             }
    //         }
    //     }
    // }
}
/**
 * 选择标签展示子标签
 * @param $scope
 */
function selectTagSearch(tag,$scope){
    if(isPropertyEmpty($scope.form.tagBeans)) $scope.form.tagBeans = [];

    var flag = styleTagSearchWay(tag,$scope,true);
    if($scope.form.tagBeans != undefined && $scope.form.tagBeans.length != 0){
        for(var i = 0; i < $scope.form.tagBeans.length; i++){
            if($scope.form.tagBeans[i].id == tag.id){
                return;
            }
        }
    }

    var o = {};o = tag;o.tagId = tag.id;o.pId = tag.parentId;
    if(!checkEmpty(flag)) o.type = $scope.form.style;

    //然后判断父标签是否重复
    //var tagIds = getPropertyFromCheckBox($scope.form.searchTag, 'undefined', undefined, 'id');
    // if($scope.form.searchTag != undefined && $scope.form.searchTag.length != 0){
        //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
        //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
    //     for(var n = 0; n < $scope.form.searchTag.length; n++){
    //         var tempTag = $scope.form.searchTag[n];
    //         if(tag.pId == tempTag.pId){
    //             $scope.form.tagBeans[n] = o;
    //             $scope.form.searchTag[n] = tag;
    //             console.log($scope.form.tagBeans);
    //             return;
    //         }
    //     }
    // }

    if($scope.form.tagBeans != undefined && $scope.form.tagBeans.length != 0){
        //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
        //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
        for(var n = 0; n < $scope.form.tagBeans.length; n++){
            var tempTag = $scope.form.tagBeans[n];
            if(tag.ancestorId == tempTag.ancestorId ){  //对有声内容标签特殊处理
                if(tag.id == 1000129663){
                    if(tempTag.pId != 1000129663) return $scope.form.tagBeans[n] = o;
                    else continue;
                }
                if(tag.parentId == 1000129663){
                    if(tempTag.tagLevel == 2)   return $scope.form.tagBeans[n] = o;
                    else if(tempTag.pId == 1000129663) return $scope.form.tagBeans[n] = o;
                    else continue;
                }
                if(tag.tagLevel != 2 ){
                    if(tempTag.pId != 1000129663 ){
                        return $scope.form.tagBeans[n] = o;
                    }
                }
                if((tag.tagLevel == 2 && tag.tagLevel == tempTag.tagLevel) || (tag.tagLevel == 2 && tempTag.pId == 1000129663)){
                    return $scope.form.tagBeans[n] = o;
                }
            }
        }
    }
    // $scope.form.searchTag.push(tag);
    $scope.form.tagBeans.push(o);
    console.log($scope.form.tagBeans);
}
function selectTagSearchOneTag(tag, $scope){
    // selectTagSearch(tag, $scope);
    $scope.form.tagBeans = [];
    $scope.form.tagBeans.push(tag);
    console.log($scope.form.tagBeans);
}
function judgeTagRepeat(tagBeans, tag){
    if(tagBeans != undefined && tagBeans.length != 0){
        tagBeans.forEach(function (item) {
            if($scope.form.tagBeans[i].id == tag.id){
                return true;
            }
        });
        return false;
        // for(var i = 0; i < tagBeans.length; i++){
        //     if($scope.form.tagBeans[i].id == tag.id){
        //         return;
        //     }
        // }
    }
}
function songSelectSearchTag(tag,$scope) {
    if(checkEmpty($scope.form.searchTag)) $scope.form.searchTag = [];
    //首先判断重复
    if($scope.form.searchTag != undefined && $scope.form.searchTag.length != 0){
        for(var i = 0; i < $scope.form.searchTag.length; i++){
            if($scope.form.searchTag[i].id == tag.id){
                return;
            }
        }
    }
    //然后判断父标签是否重复
    //var tagIds = getPropertyFromCheckBox($scope.form.searchTag, 'undefined', undefined, 'id');
    if($scope.form.searchTag != undefined && $scope.form.searchTag.length != 0){
        //下面要判断新来的tag的一级类别，如果一级类别相同，那么把原有标签替换掉
        //如果和原有的所有标签一级类别都不重复，也就是新类别的标签，那么在原有的标签上面新增
        for(var n = 0; n < $scope.form.searchTag.length; n++){
            var tempTag = $scope.form.searchTag[n];
            if(tag.ancestorId == tempTag.ancestorId){
                $scope.form.searchTag[n] = tag;
                return;
            }
        }
    }
    $scope.form.searchTag.push(tag);
}
//重新抽取素材
function extractedMaterial(id, type, $http, SweetAlert){
    $http.jsonp(http_url + '/extract/' + type + '/' + id + '.json?' + CALLBACK).success(function(res){
        if(res.status == 1){
            sweetAlertCommon(SweetAlert,'抽取成功','success');
        } else {
            sweetAlertCommon(SweetAlert,res.msg,'error');
        }
    }).error(function(res){
        sweetAlertCommon(SweetAlert,'请求异常','warning');
    });
}
//获取本地存储中的上一次操作的审核界面的操作记录
function getLastExamine(id, $scope) {
    var _lastContext = sessionStorage.getItem(id);
    if(_lastContext){
        var _obj = JSON.parse(_lastContext);
        $scope.examineResult = _obj.examineResult,$scope.examineSuggest = _obj.examineSuggest,
            $scope.ckResult = _obj.ckResult, $scope.ckSuggest = _obj.ckSuggest,
            $scope.ckTagError = _obj.ckTagError;
    }
}
//angularjs复选框单选通用方法
function selectOne(data, checkb, checkName){
    if (!checkb) {//选中
        data[checkName] = true;
    } else {
        data[checkName] = false;
    }
}
//angulajs复选框全选通用方法
//all:全部勾选还是全部取消勾选
//datas:需要获取的对象的array集合
//checkName:单条数据判断是否check的属性
//allCheckName所有属性是否选择的属性
function selectAll($scope, datas, checkName, allCheckName) {
    if ($scope[allCheckName] != true) {
        if (allCheckName != undefined && allCheckName != '') {
            $scope[allCheckName] = true;
        }
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            data[checkName] = true;
        }
    } else {
        if (allCheckName != undefined && allCheckName != '') {
            $scope[allCheckName] = false;
        }
        for (var i = 0; i < datas.length; i++) {
            data = datas[i];
            data[checkName] = false;
        }
    }
}
//angularjs复选框获取某个属性通用函数
//datas:需要获取的对象的array集合
//checkName:单个对象用于判断是否check的属性名字
//checkValue:用于判断是否check的属性为此值的时候获取属性
//propertyName:单个对象需要获取的属性名字,不传入就是返回对象集合
//返回一个array
function getPropertyFromCheckBox(datas, checkName, checkValue, propertyName){
    var values = new Array();
    for(var i= 0; i < datas.length; i++){
        var data = datas[i];
        if(data[checkName] == checkValue){
            if(propertyName == undefined){
                values.push(data);
            } else {
                values.push(data[propertyName]);
            }
        }
    }
    return values;
}
/**
 * 统一sweetAlert提示框
 * @param SweetAlert    必传对象
 * @param msg1
 * @param type  提示框类型，success,error,warning ....
 * @param msg2
 */
function sweetAlertCommon(SweetAlert,msg1,type,msg2){
    if(checkEmpty(msg1))
        msg1 = '操作成功';
    if(checkEmpty(type))
        type = 'success';
    if(checkEmpty(msg2))
        msg2 = '点击按钮关闭';
    SweetAlert.swal(new SweetAlertSetup(msg1, msg2, type));
}
/**
 * 提示框回调    
 * @param SweetAlert
 * @param msg1
 * @param type
 * @param msg2
 * @param method
 */
function sweetAlertCall(SweetAlert,msg1,type,msg2,method) {
    if(!msg1) msg1 = '操作成功';
    if(!type) type = 'success';
    if(!msg2) msg2 = '点击按钮关闭';
    SweetAlert.swal({
        title: msg1,
        text: msg2,
        type: type,
        showCancelButton: false ,
        cancelButtonText: '取消',
        // confirmButtonColor: '#DD6B55',
        confirmButtonText: '确认!',
        closeOnConfirm: true,
        closeOnCancel: true
    },  function(isConfirm){
        if(isConfirm && method){
            method();
        }
    });
}
/**
 * 统一sweetAlert确认框
 * @param SweetAlert
 * @param type
 * @param method
 * @param msg1
 * @param msg2
 */
function sweetAlertConfirm(SweetAlert,method,type,msg1,msg2){
    if(checkEmpty(type))
        type = 'warning';
    if(checkEmpty(method))
        method = SweetAlert.swal('Booyah!');
    if(checkEmpty(msg1))
        msg1 = '确定此操作吗?';
    if(checkEmpty(msg2))
        msg2 = '';
    SweetAlert.swal({
        title: msg1,
        text: msg2,
        type: type,
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonColor: '#DD6B55',
        confirmButtonText: '确认!',
        closeOnConfirm: false,
        closeOnCancel: true
    },  function(isConfirm){
        if(isConfirm){
            method();
        }
    });
}
/**
 * 标签搜索--去掉标签
 * @param $scope
 * @param $stateParams
 * @param $state
 * @param url
 */
function tagRemove(tag,$scope,$stateParams,$state,url){
    $scope.form.searchTag.remove(tag);
    if(!checkEmpty($stateParams.tagIds)){
        var tagIds = $stateParams.tagIds.split(',');
        tagIds.splice(tagIds.indexOf(tag.id), 1);
        $state.go(url,{tagIds:tagIds});
    }

}
/**
 * 本地存储上一个state
 * @param $state
 * @returns {number}
 */
function setLastState($state) {
    var state = {name: $state.current.name,params: $state.params};
    var time = new Date().getTime();
    localStorage.setItem(time, JSON.stringify(state));
    return time;
}
/**
 * 检测打标签权限
 * @param BaseService
 * @param id
 * @param blank
 */
function taggingAloneCheck(id, blank, type, taskId, $state, SweetAlert) {
    var url = TAG_EDIT_NEW_CHECK + type + '/' + id + '.json';
    if(taskId) var data = 'taskId=' + taskId;
    $.ajax({
        url: url ,
        type: 'post',
        async: false,
        beforeSend: function(request) {
            request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
        },
        data: data,
        dataType: 'json',  // not "json" we'll parse
        success: function(res) {
            if(res.status != 1){
                return sweetAlertCommon(SweetAlert,res.msg,'error');
            } else {
                var url = $state.href('material.taggingEdit', {songId: id,lastPage: returnLastPageTime()});
                window.open(url, blank);
            }
        },
        error: function (res) {
            sweetAlertCommon(SweetAlert, '标签权限验证接口请求异常', 'error');
        }
    });
}
function exportCommon(datas, form, $scope, exportUrl, SweetAlert, propertyName, $uibModalInstance) {
    var _data = {};
    if(checkEmpty(datas))
        return sweetAlertCommon(SweetAlert, '暂无数据', 'warning');
    if(checkEmpty($scope.export.type))
        return sweetAlertCommon(SweetAlert, '请选择导出操作类型', 'warning');
    _data = excludeProperties(form,['pageSize','pageNo']);
    switch($scope.export.type){
        case '1':
            var ids = [];
            datas.forEach(function (val) {
                if(propertyName && val.isCheck){
                    ids.push(val[propertyName]);
                }else if(val.isCheck) {
                    ids.push(val['songId']);
                }
            });
            if(ids.length == 0){
                return sweetAlertCommon(SweetAlert, '请选择要导出的数据', 'warning');
            }
            if(propertyName){
                _data.ids = ids;
            }else {
                _data.songIds = ids;
            }
            break;
        case '2':
            if(checkEmpty($scope.export.startNo) || checkEmpty($scope.export.endNo)) return sweetAlertCommon(SweetAlert, '请填写完整的序号起止数目', 'warning');
            _data.startNo = $scope.export.startNo - 1,_data.endNo = $scope.export.endNo - 1;
            break;
        case '3':
            if(checkEmpty($scope.export.pageStart) || checkEmpty($scope.export.pageEnd)) return sweetAlertCommon(SweetAlert, '请填写完整的起止页数', 'warning');
            _data.startNo = ($scope.export.pageStart - 1) * form.pageSize;
            _data.endNo = ($scope.export.pageEnd) * form.pageSize - 1;
            break;
    }
    window.open(exportUrl + '?' + 'data=' + JSON.stringify(_data), '_blank');
    // if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
    // }
}
/**
 * 跳转到某个state
 * @param stateName
 * @param param
 * @param $state
 */
function goState(stateName, param, $state) {
    $state.go(stateName, param);
}
/**
 * 获取函数的参数字符串名字并且根据名字获取对应的参数对象
 */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var _fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var _result = _fnStr.slice(_fnStr.indexOf('(')+1, _fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(_result === null)
        _result = [];
    return _result;
}
function getParamByName(name, self) {
    var _names = getParamNames(self.constructor);
    var _result;
    _names.forEach(function (val, index) {
        if(name == val) _result = self.arguments[index];
    });
    return _result;
}
// var _self = this;_self.arguments = arguments;
// console.log(getParamByName('SweetAlert', _self));
/**
 * 
 * @param time
 */
function getLastState(time) {
    return JSON.parse(localStorage.getItem(time));
}
/**
 * 特殊裁剪日期，去掉特殊符号
 * @param date
 * @returns {*}
 */
function sliceDate(date){
    if(date){
        if(date.indexOf('_') != -1)   //去掉'_'
            date = date.slice(0, date.indexOf('_') - 1);
        if(date.charAt(date.length - 1) == '-')    //去掉'-'
            date = date.slice(0, date.length - 1);
    }
    return date;
}

Array.prototype.remove = function(val) {//数组删除对应的值
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
Array.prototype.indexOf = function(val) {//数组判断对应的值是否存在
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
function getAstro(m,d){//获取星座
    return "摩羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎人马摩羯".substr(m*2-(d<"102223444433".charAt(m-1)- -19)*2,2);
}
function getpet(year,$filter,$http) { //获取生肖
    var vm = this;
    var toyear = 1997;
    var birthpet="Ox";
    // vm.pets = [];
    // vm.loadPets = function(){
    //     return vm.pets.length ? null : $http.get('server/pets.json').success(function(data) {
    //         vm.pets = data;
    //         vm.showPets(year);
    //     });
    // };
    // vm.showPets = function(year) {
    //     if(year) {
    //         var key = (toyear - year) % 12;
    //         var selected = $filter('filter')(this.pets, {key: key});
    //         return selected.length ? selected[0].value : 'Not pets';
    //     } else {
    //         return "";
    //     }
    // };
    // return vm.loadPets();
    x = (toyear - year) % 12;
    if ((x == 1) || (x == -11)) {
        birthpet="鼠";
    } else if (x == 0) {
        birthpet="牛";
    } else if ((x == 11) || (x == -1)) {
        birthpet="虎";
    } else if ((x == 10) || (x == -2)) {
        birthpet="兔";
    } else if ((x == 9) || (x == -3)) {
        birthpet="龙";
    } else if ((x == 8) || (x == -4)) {
        birthpet="蛇";
    } else if ((x == 7) || (x == -5)) {
        birthpet="马";
    } else if ((x == 6) || (x == -6)) {
        birthpet="羊";
    } else if ((x == 5) || (x == -7)) {
        birthpet="猴";
    } else if ((x == 4) || (x == -8)) {
        birthpet="鸡";
    } else if ((x == 3) || (x == -9)) {
        birthpet="狗";
    } else if ((x == 2) || (x == -10)) {
        birthpet="猪";
    }
    return birthpet;
}