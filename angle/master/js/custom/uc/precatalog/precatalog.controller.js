/**
 * Created by hao.cheng on 2016/7/25.
 */
(function () {
    'use strict';

    angular.module('app.routes').config(PreCatalogConfig);
    PreCatalogConfig.$inject = ['$stateProvider', 'RouteHelpersProvider'];
    function PreCatalogConfig($stateProvider, helper) {
        $stateProvider
            .state('app.preCatalog',{
                url: '/preCatalog',
                views: {
                    '': {
                        templateUrl: helper.basepath('precatalog/precatalog-head.html'),
                        controller: 'PreCatalogHeadCtrl'
                    }
                }
            })
            .state('app.preCatalog.list',{
                url: '/list?:copyrightId&:catalogStatus&:songStatus&:istag&:startTime&:endTime&:uid&:lastEditSearch&:pageNo&:pageSize',
                title: '预编目工单',
                views: {
                    'data-list': {
                        templateUrl: helper.basepath('precatalog/precatalog-list.html'),
                        controller: 'PreCatalogListCtrl'
                    }
                }
            })
    }

    /*预编目controller*/
    angular.module('app.routes').controller('PreCatalogHeadCtrl',['$scope','$state','$stateParams','BaseService','SweetAlert',function ($scope,$state,$stateParams,BaseService,SweetAlert) {
        $scope.form = {};
        $scope.submit = function () { //查询按钮
            if(!$scope.form.pageNo) $scope.form.pageNo = 1;
            if(!$scope.form.pageSize) $scope.form.pageSize = 100;
            $state.go('app.preCatalog.list',$scope.form);
        };
        $scope.new = function(type){    //新建歌曲
            addNewMaterial(type,$state,$stateParams);
        };
        $scope.reset = function () {
            for(var p in $scope.form) $scope.form[p] = '';
            var promise = BaseService.service.clearExcelSearch(3);
            if(promise) promise.then(function (res) {
                if(res.code != '000000') sweetAlertCommon(SweetAlert, '清空excel查询失败', 'error');
            })
        }
    }]);
    angular.module('app.routes').controller('PreCatalogListCtrl',['$stateParams','$scope','PreCatalogService','BaseService','SweetAlert','$state' ,function ($stateParams,$scope,PreCatalogService,BaseService,SweetAlert,$state ) {
        $scope.$parent.form = inherit($stateParams);
        console.log($scope.$parent.form);
        activate();
        function activate() { //获取预编目数据
            var _param = excludeProperties($stateParams,['PreCatalogService']);
            if($stateParams)
                var promise = PreCatalogService.service.preCatalogSearch(encodeURIComponent(angular.toJson(_param)));
            if(promise)
                var listPromise = promise.then(function (res) {
                    console.log(res);
                    $scope.$parent.datas = res.body.list;
                });
            _param.isQueryCount = 1;        //异步count
            PreCatalogService.service.preCatalogSearch(encodeURIComponent(angular.toJson(_param))).then(function (res) {
                paginationDiscreteness($scope,5,res.body.pageSize,res.body.totalCount,res.body.pageTotal,res.body.pageNo);
            })
        }
        $scope.delete = function (copyId) { //删除按钮
            sweetAlertConfirm(SweetAlert,function () {
                var _promise = PreCatalogService.service.deleteCatalog(copyId);
                if(_promise) _promise.then(function (res) {
                    if(res.status == 1) return sweetAlertCommon(SweetAlert, res.msg, 'success'),activate();
                    else return sweetAlertCommon(SweetAlert, res.msg, 'error');
                });
            },'warning');
        };
        $scope.tagging = function (data, blank) {  //打标签操作
            taggingAloneCheck(data.songId, blank, 'song', data.taskId, $state, SweetAlert);
        };
        $scope.dataConfirm = function (copyId) {      //确认按钮
            PreCatalogService.service.preCatalogConfirm(copyId).then(function (res) {
                if(res.status == 1) return sweetAlertCommon(SweetAlert, res.msg, 'success'),activate();
                else return sweetAlertCommon(SweetAlert, res.msg, 'error');
            });
        }
    }]);
    angular.module('app.routes').controller('PreCatalogModal',['$scope','$uibModalInstance','datas','SweetAlert','$stateParams','form',function ($scope,$uibModalInstance,datas,SweetAlert,$stateParams,form) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.export = function () {
            var _data = {};
            if(checkEmpty(datas))
                return sweetAlertCommon(SweetAlert, '暂无数据', 'warning');
            if(checkEmpty($scope.export.type))
                return sweetAlertCommon(SweetAlert, '请选择导出操作类型', 'warning');
            switch($scope.export.type){
                case '1':
                    var ids = [];
                    datas.forEach(function (val) {
                        if(val.isCheck) ids.push(val['copyrightId']);
                    });
                    if(ids.length == 0){
                        return sweetAlertCommon(SweetAlert, '请选择要导出的数据', 'warning');
                    }
                    _data.copyrightIds = ids;
                    break;
                case '2':
                    if(checkEmpty($scope.export.startNo) || checkEmpty($scope.export.endNo)) return sweetAlertCommon(SweetAlert, '请填写完整的序号起止数目', 'warning');
                    _data = excludeProperties(form,['pageSize','pageNo']);
                    _data.startNo = $scope.export.startNo - 1,_data.endNo = $scope.export.endNo - 1;
                    break;
                case '3':
                    if(checkEmpty($scope.export.pageStart) || checkEmpty($scope.export.pageEnd)) return sweetAlertCommon(SweetAlert, '请填写完整的起止页数', 'warning');
                    _data = excludeProperties(form,['pageSize','pageNo']);
                    _data.startNo = ($scope.export.pageStart - 1) * form.pageSize;
                    _data.endNo = ($scope.export.pageEnd) * form.pageSize - 1;
                    break;
            }
            window.open(CATALOG_EXPORT + '?' + CALLBACK + '&data=' + JSON.stringify(_data), '_blank');
        };
        $scope.import = function () {
            var _filename = $('#excelFile').val();
            if(checkEmpty(_filename))
                return sweetAlertCommon(SweetAlert,'请选择上传的excel文件','warning');
            else
                ajaxFileUpload(CATALOG_IMPORT, $scope, '', $uibModalInstance, SweetAlert,'excelFile',$stateParams,undefined);
        };
        $scope.emergImport = function (flag) { //紧急歌曲导入
            var _filename = $('#file').val();
            if(checkEmpty(_filename)){
                return sweetAlertCommon(SweetAlert,'请选择上传的excel文件','warning');
            }else{
                var _data;
                if(flag) _data = {isNeedRelated: true};
                else _data = {isNeedRelated: false};
                ajaxFileUpload(CATALOG_EMERGIMPORT, $scope, _data, $uibModalInstance, SweetAlert,'file',$stateParams,undefined);
            }
        };
        $scope.downloadTpl = function () { //导入查询模板下载
            window.open(environment+ '/cmssearch/resources/excel/song.xls','_blank');
        };
        $scope.downloadEmergTpl = function () { //紧急歌曲导入模板下载
            window.open(CATALOG_EMERGTPL, '_blank');
        }
    }]);
})();