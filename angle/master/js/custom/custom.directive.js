/**
 * Created by hao.cheng on 2016/5/28.
 */
angular.module('app.routes').directive('validNumber', function() { //规定只能正整数输入
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if(!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function(val) {
                var clean = val.replace( /[^0-9]+/g, '');
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function(event) {
                if(event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
});
angular.module('app.routes').directive('decimal', function() { //规定只能正整数或者小数
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if(!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function(val) {
                if(!/^-?\d+\.?\d{0,1}$/.test(val)){
                    ngModelCtrl.$setViewValue('');
                    ngModelCtrl.$render();
                }else{
                    return val;
                }
            });

            element.bind('keypress', function(event) {
                if(event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
});
angular.module('app.routes').filter('cut', function () {   //filter过滤器，数据超长部分显示省略号
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});
angular.module('app.routes').directive('myDate',['dateFilter',function(dateFilter){ //自动转换日期类型，将日期插件转换为yyyy-MM-dd
    return{
        restrict:'EAC',
        require:'?ngModel',
        link:function(scope,element,attrs,ngModel,ctrl){
            ngModel.$parsers.push(function(viewValue){
                return dateFilter(viewValue,'yyyy-MM-dd');
            });
        }
    }
}]);
angular.module('app.routes').directive('tagSearchTpl',function () { //自定义标签搜索模板指令 2016-6-30 13:51:17
   return {
       restrict: 'EA',
       templateUrl: 'app/views/partials/tagsearch-tpl.html',
       controller: 'TagSearchTplController'
   }
});
angular.module('app.routes').controller('TagSearchTplController',['$scope',function ($scope) {
    $scope.selectSearchTag = function(tag){
        selectTagSearch(tag,$scope.$parent);
    };
    $scope.artistTagRemove = function(tag){
        styleTagSearchWay(tag,$scope,false);
        $scope.$parent.form.tagBeans.remove(tag);
    };
}]);
angular.module('app.routes').directive('tagSearchOneTagTpl',function () { //自定义标签搜索模板指令 2016-6-30 13:51:17
    return {
        restrict: 'EA',
        templateUrl: 'app/views/partials/tagsearch-tpl.html',
        controller: 'TagSearchOneTagTplController'
    }
});
angular.module('app.routes').controller('TagSearchOneTagTplController',['$scope',function ($scope) {
    $scope.selectSearchTag = function(tag){
        selectTagSearchOneTag(tag,$scope.$parent);
    };
    $scope.artistTagRemove = function(tag){
        styleTagSearchWay(tag,$scope,false);
        $scope.$parent.form.tagBeans.remove(tag);
    };
}]);
angular.module('app.routes').directive('changeTagType', function () { //主次标签切换查询自定义指令 2016-8-23 18:09:04
   return {
       restrict: 'EAC',
       link: function (scope, element) {
            element.bind('click', function () {
                for(var i = 0; i < scope.form.tagBeans.length; i++){
                    if(!checkEmpty(scope.form.tagBeans[i].type)){
                        scope.form.tagBeans[i].type = scope.form.style;
                    }
                }
            });
       }
   }
});
angular.module('app.routes').directive('songtagSearchTpl',function () { //自定义标签搜索模板指令 2016-6-30 13:51:17
    return {
        restrict: 'EA',
        templateUrl: 'app/views/partials/songtagsearch-tpl.html',
        controller: 'SongtagSearchTplController'
    }
});
angular.module('app.routes').controller('SongtagSearchTplController',['$scope',function ($scope) {
    $scope.songSelectSearchTag = function(tag){
        songSelectSearchTag(tag,$scope.$parent);
    };
    $scope.songTagRemove = function(tag){
        //tagRemove(tag,$scope,$stateParams,$state,'app.song');
        $scope.form.searchTag.remove(tag);
    };
}]);
angular.module('app.routes').directive('playButton',function () {  //自定义播放按钮 2016-7-6 13:51:11
    return {
        restrict: 'EA',
        templateUrl: 'app/views/partials/playbutton.html',
        controller: 'PlayButtonController'
    }
});
angular.module('app.routes').controller('PlayButtonController',['$scope','SweetAlert',function ($scope,SweetAlert) {
    $scope.addPlaySong = function(songId,copyrights){ //歌曲播放
        if(!copyrights) return sweetAlertCommon(SweetAlert, '暂无试听版权', 'warning');
        var copyrightIds = [];
        for(var i = 0; i < copyrights.length; i++){
            copyrightIds.push(copyrights[i].copyrightId);
        }
        addPlaySong(songId,SweetAlert, [],copyrightIds, 0);
    };
}]);
angular.module('app.routes').directive('playIcon',function () {     //自定义播放icon指令 2016-7-6 15:05:06
    return{
        restrict: 'EA',
        templateUrl: 'app/views/partials/playicon.html',
        controller: 'PlayIconController'
    }
});
angular.module('app.routes').controller('PlayIconController',['$scope','CatalogService','SweetAlert',function ($scope,CatalogService,SweetAlert) {
    $scope.addPlaySong = function(songId){ //歌曲播放
        function _compare(a, b) {   //版权接收时间排序
            return b.createTime - a.createTime;
        }
        var promise = CatalogService.service.getCatalogs(songId);  //获取版权
        promise.then(function (res) {
            var copyrights = [],copyrights = res.sort(_compare);
            var copyrightIds = [];
            for(var i = 0; i < copyrights.length; i++){
                copyrightIds.push(copyrights[i].copyrightId);
            }
            addPlaySong(songId,SweetAlert, [],copyrightIds, 0);
        });
    };
}]);
angular.module('app.routes').directive('operateData',function () {   //自定义改变状态指令    2016-7-6 17:54:21
    return{
        restrict: 'EA',
        templateUrl: 'app/views/partials/operatedata.html',
        controller: 'DirectiveController'
    }
});
angular.module('app.routes').controller('DirectiveController',['$scope','BaseService', 'SweetAlert',function ($scope,BaseService, SweetAlert) {
    $scope.changeStatus = function (data,status) {
        var type,id;
        if(data.hasOwnProperty('artistId')) type = 'artist',id = data['artistId'];
        if(data.hasOwnProperty('albumId')) type = 'album',id = data['albumId'];
        if(data.hasOwnProperty('songId')) type = 'song',id = data['songId'];
        sweetAlertConfirm(SweetAlert, function () {
            var promise = BaseService.service.changeDataStatus(type,id,status);
            promise.then(function (res) {
                if(res.status == 1) data.status = status;
            });
        }, 'warning');

    }
}]);
angular.module('app.routes').directive('materialOperation',function () {    //自定义预览指令 2016-7-7 18:13:31
    return{
        restrict: 'E',
        templateUrl: 'app/views/partials/materialoperation.html',
        controller: 'MaterialOperationController'
    }
});
angular.module('app.routes').controller('MaterialOperationController',['BaseService','$scope','$state', '$stateParams',function (BaseService,$scope,$state, $stateParams) {
    $scope.preData = function (data,type,tags,tagExt) {    //预览按钮
        if(type == 'song'){
            tags = [];
            $("input[name=taggingCheck]:checked").each(function () {
                var tag = {};
                tag.tagId = $(this).val();
                tag.type = 0;
                tag.tagName = $(this).parent().attr('title');
                tags.push(tag);
            });
        }
        if(!checkEmpty(data.effectYearsStart)) data.effectYears = data.effectYearsStart;    //特殊处理影响年代
        if(!checkEmpty(data.effectYearsEnd)){
            if(!checkEmpty(data.effectYearsStart)) data.effectYears += '-' + data.effectYearsEnd;
            else data.effectYears = data.effectYearsEnd;
        }
        if(data.birth) data.birth = sliceDate(data.birth);
        if(data.deathdate) data.deathdate = sliceDate(data.deathdate);
        if(data.publishTime) data.publishTime = sliceDate(data.publishTime);
        var preData = Object.create([data,tags,tagExt]);
        localStorage.setItem('preData',angular.toJson(preData.__proto__));
        var urlType = type.charAt(0).toUpperCase() + type.slice(1);
        var url = $state.href('material.pre'+urlType);
        window.open(url,'','width=1300,height=600,left=200,top=50');
    };
    $scope.back = function () {
        if($stateParams.lastPage) window.open(returnLastPage($stateParams.lastPage), '_self');
        else history.back();
    }
}]);
angular.module('app.routes').directive('ngRightClick', ['$parse',function($parse) {   //自定义右键指令，执行右键方法 2016-7-12 11:26:07
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
}]);
angular.module('app.routes').directive('mergeButton',['$state',function ($state) { //自定义合并按钮指令 2016-7-14 17:05:29
   return {
       restrict: 'A',
       link: function (scope,element) {
           element.bind('click',function () {
               var dataType = $state.current.name.replace('app.','');
               var ids = [];
               scope.datas.forEach(function (val) {
                   if(val.isCheck){
                       ids.push(val[dataType+'Id']);
                   }
               });
               // if(ids.length < 1){
               //     sweetAlertCommon(SweetAlert,'请选择需要合并的数据','warning');
               //     return;
               // }
               $state.go('app.merge.list',{type: dataType,mergeIds: ids.join(','), lastPage: returnLastPageTime()});
           })
       }
   }
}]);
angular.module('app.routes').directive('bacthUpdateBtn',['$state', 'SweetAlert',function ($state, SweetAlert) { //自定义批量修改按钮指令 2016-7-20 17:03:13
    return {
        restrict: 'A',
        link: function (scope,element) {
            element.bind('click',function () {
                var dataType = 'song',_batchLocal = {};
                var _stateName = $state.current.name;
                // if($state.current.name.indexOf('song') != -1) dataType = 'song';
                var ids = [];
                if(!checkEmpty(scope.datas))
                    scope.datas.forEach(function (val) {
                        if(val.isCheck) {
                            ids.push(val[dataType+'Id']);
                            if(val.taskId && (_stateName.indexOf('songtagTask') != -1 || _stateName.indexOf('songTask') != -1)) _batchLocal[val[dataType+'Id']] = val.taskId;  //歌曲标签特殊处理
                            if( _stateName.indexOf('songTask') != -1) _batchLocal.all = true;
                        }
                    });
                var _batchLocalLength = Object.getOwnPropertyNames(_batchLocal).length;
                if(_batchLocalLength > 0) localStorage.setItem('batchLocal', JSON.stringify(_batchLocal));
                if((_stateName.indexOf('songtagTask') != -1 || _stateName.indexOf('songTask') != -1) && ids.length == 0) return sweetAlertCommon(SweetAlert, '请先选择需要修改的数据', 'warning');
                if(_stateName.indexOf('uc_task_new_song') != -1 || _stateName.indexOf('preCatalog') != -1) var _flow = 0;  //新歌和预编目工单特殊处理
                var _url = $state.href('app.update.list',{upType: dataType,updateIds: ids.join(','), batchLocal: _batchLocalLength, flow: _flow});
                window.open(_url, '_blank');
            })
        }
    }
}]);
angular.module('app.routes').directive('editUserTpl',function () {
   return {
       restrict: 'EA',
       templateUrl: 'app/views/partials/edituser-tpl.html',
       controller: 'EditUserTplController'
   }
});
angular.module('app.routes').controller('EditUserTplController',['$scope',function ($scope) {
    if(checkEmpty($scope.users))
    // getAllUser($http,function(users){
    //     $scope.users
    //     localStorage.setItem('users',JSON.stringify(users));
    // });
        $scope.users = JSON.parse(localStorage.getItem('users'));
    //选择最后编辑人
    $scope.selectLastEdit = function(user){
        $scope.form.uid = user.uId;
    };
}]);
angular.module('app.routes').directive('resetBtn',function () {
   return {
       restrict: 'EA',
       link: function (scope,element) {
           element.bind('click',function () {
               scope.form = {};
           });
       }
   }
});
angular.module('app.routes').directive('radioButton',function () {
    return {
        restrict: 'EA',
        templateUrl: 'app/views/partials/radiobtn-tpl.html',
        controller: function ($scope) {
            $scope.selectRadio = function (datas, data) {
                angular.forEach(datas, function (data) {
                    data.isCheck = false;
                });
                data.isCheck = true;
            };
        }
    }
});
angular.module('app.routes').directive('checkAllBtn',function () {
   return {
       restrict: 'EA',
       templateUrl: 'app/views/partials/checkAll-tpl.html',
       controller: function ($scope) {
           $scope.checkAll = function (datas) {
               $scope.allCheck = !$scope.allCheck;
               datas.forEach(function (val) {
                   if($scope.allCheck) val.isCheck = true;
                   else val.isCheck = false;
               });
           }
       }
   }
});
angular.module('app.routes').directive('loadScript', function($filter) {
    return function(scope, element, attrs) {
        element.wrap('<script type="text/ng-template" id="myModalContent.html"></script>');
    };
});
angular.module('app.routes').directive('assignTask', function (TaskService, SweetAlert) {  //自定义指派任务指令 2016-8-9 16:40:41
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind('click', function () {
                if(!scope.assignUser) return sweetAlertCommon(SweetAlert, '请选择分配人', 'warning');
                var _taskIds = getPropertyFromCheckBox(scope.datas, "isCheck", true, "taskId");
                if(_taskIds.length == 0) return sweetAlertCommon(SweetAlert, '请选择需要分配的数据', 'warning');
                var _promise = TaskService.service.assignTask(_taskIds, scope.authoritySetting.flowId, scope.authoritySetting.auth, scope.assignUser); // 确认权限和流程
                if(_promise) _promise.then(function (res) {
                    if(res.returnCode == "000000"){
                        sweetAlertCommon(SweetAlert, res.msg, 'success');
                        location.reload(true);
                    } else if (res.returnCode == "000005") {
                        var tips = "版权ID为" + res.list.join(',') + '的数据分配失败，已为您重新勾选，请重新分配';
                        sweetAlertCommon(SweetAlert, tips, 'success');
                        checkAssignedFailed(res.list, scope.datas);
                    } else {
                        sweetAlertCommon(SweetAlert, res.msg, 'warning');
                    }
                })
            })
        }
    }
});
angular.module('app.routes').directive('taskSubmit', function ($state) {  //工单条件查询自定义查询按钮指令 2016-8-9 16:44:17
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind('click', function () {
                var form = JSON.parse(JSON.stringify(scope.form));
                if(form.tagBeans && (form.tagBeans.constructor == Array)) form.tagBeans = JSON.stringify(form.tagBeans);
                if(!form.lastEditSearch) form.uid = undefined;
                form.pageNo = 1;
                $state.go($state.current.name, form);
            });
        }
    }
});
angular.module('app.routes').directive('taskReset', function () {  //工单重置查询条件自定义按钮指令 2016-8-9 16:46:15
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind('click', function () {
                for(var p in scope.form){
                    if(p != 'projectId' && p != 'pageNo' && p != 'pageSize') scope.form[p] = '';
                }
            })
        }
    }
});
angular.module('app.routes').directive('formOnChange', function($parse, $interpolate){  //form表单字段变化自定义指定按钮
    return {
        require: "form",
        link: function(scope, element, attrs, form){
            var cb = $parse(attrs.formOnChange);
            element.on("change", function(){
                cb(scope);
            });
        }
    };
});
angular.module('app.routes').directive('stateToFeedback', function ($stateParams, $state) {
    return {
        restrict: 'EA',
        scope: {
            feedBack: '@'
        },
        link: function (scope, element) {
            element.bind('click', function () {
                var _params = {type: scope.feedBack, pid: $stateParams.projectId, uid: JSON.parse(localStorage.getItem('ngStorage-loginUserInfo')).uid, pageSize: 50, pageNo: 1};
                var _url = $state.href('app.songtagTaskFeedback', _params);
                window.open(_url, '_blank');
            });

        }
    }
});
angular.module('app.routes').directive('lastExamine', function () {     //自定义存储审核操作记录指令，2016-9-6 15:34:48
   return {
       restrict: 'A',
       require: 'ngModel',
       link: function (scope, ele, attrs, c) {
           scope.$watch(attrs.ngModel, function (newVal, oldVal) {
               if(!scope.data) return;
               var _id = (scope.data.artistId && scope.data.artistId) || (scope.data.albumId && scope.data.albumId) || (scope.data.songId && scope.data.songId);
               var _context = {examineResult: scope.examineResult, examineSuggest: scope.examineSuggest, ckResult: scope.ckResult, ckSuggest: scope.ckSuggest, ckTagError: scope.ckTagError};
               if(newVal) sessionStorage.setItem(_id, JSON.stringify(_context));
           });
       }
   } 
});
