/**
 * Created by hao.cheng on 2015/12/3.
 * catch_controller
 */
(function () {
    'use strict';
    angular.module('app.routes').config(CatchConfig);
    CatchConfig.$inject = ['$stateProvider'];
    function CatchConfig($stateProvider){
        $stateProvider
            .state('app.charts',{
                url: '/charts',
                templateUrl: 'app/views/charts/charts.html'
            })
            .state('app.charts.catch',{
                url: '/catch',
                views: {
                    'catch_view' : {
                        templateUrl: 'app/views/charts/catch_charts/catch_charts.html',
                        controller: function(){

                        }
                    }
                }
            })
    }
    angular.module('app.routes').controller('catch_chart',['$scope','$http','$timeout',function($scope,$http,$timeout){
        //$timeout(monitor,2000);
        monitor();
        setInterval(function(){
            monitor();
        },30000);
        function monitor(){
            $http.jsonp(charts_catch_monitor + '?callback=JSON_CALLBACK').success(function(res){
                $scope.monitor_data = res.body.statData;
                var currentSite = res.body.currentSite.name;
                var activeThreadNum = res.body.activeThreadNum;
                $scope.monitor_name = [];
                $scope.monitor_success = [];
                $scope.monitor_fail = [];
                for(var i = 0; i < $scope.monitor_data.length; i++){
                    $scope.monitor_name.push($scope.monitor_data[i].name);
                    $scope.monitor_success.push($scope.monitor_data[i].success);
                    $scope.monitor_fail.push($scope.monitor_data[i].fail);
                }
                $scope.chartConfig = {//抓取监控配置
                    options: {
                        chart: {
                            type: 'bar'
                        },
                        tooltip: {
                            style: $scope.style
                        },
                        plotOptions: {
                            bar: {
                                stacking: '',
                                dataLabels: $scope.dataLabels
                            }
                        }
                    },
                    series: [{
                        name: '失败',
                        data: $scope.monitor_fail,
                        color: '#E27B6A'
                    },{
                        name: '成功',
                        data: $scope.monitor_success,
                        color: '#008000'
                    }],
                    title: {
                        text: '抓取实时监控'
                    },
                    subtitle:{
                        text: '当前抓取线程数 '+activeThreadNum+'  当前抓取站点 ' +currentSite + '每30秒更新一次'
                    },
                    loading: false,
                    xAxis: {
                        lineWidth: 1,
                        tickWidth: 5,
                        categories: $scope.monitor_name,
                        title: {
                            align: 'high',
                            offset: 0,
                            text: '状态(次)',
                            rotation: 0,
                            y: -10
                        }
                    },
                    useHighStocks: false,
                    size: $scope.size_lg,
                    "credits":{"enabled":false}
                };
                console.log(res);
            });
        }
        $scope.style = {
            padding: 10,
            fontWeight: 'bold'
        };
        $scope.dataLabels = {
            enabled: true,
            color: '#fffff',
            style: {
                //textShadow: '0 0 3px black'
            }
        };
        $scope.size_lg = {
            width: 1050,
            height: 500
        };
        $scope.size_sm = {
            width: 500,
            height: 500
        };
        $http.jsonp(charts_catch_all + '?callback=JSON_CALLBACK').success(function(res){
            $scope.data_all = res.body;
            $scope.data_artist = [];
            $scope.data_album = [];
            $scope.data_song = [];
            $scope.data_song_form = [];
            for(var i = 0; i < $scope.data_all.length; i ++){//循环设置每个图标的数据
                var obj = {};
                obj.data = [];
                obj.name = $scope.data_all[i].name;
                obj.data.push($scope.data_all[i].data[0]);
                $scope.data_artist.push(obj);
                var obj = {};
                obj.data = [];
                obj.name = $scope.data_all[i].name;
                obj.data.push($scope.data_all[i].data[1]);
                $scope.data_album.push(obj);
                var obj = {};
                obj.data = [];
                obj.name = $scope.data_all[i].name;
                obj.data.push($scope.data_all[i].data[2]);
                $scope.data_song.push(obj);
                var obj = {};
                obj.data = [];
                obj.name = $scope.data_all[i].name;
                obj.data.push($scope.data_all[i].data[3]);
                $scope.data_song_form.push(obj);

            }
            console.log($scope.data_artist);
            $scope.chartConfig_artist = setConfig($scope.data_artist,$scope,'艺人总量');   //艺人总量统计配置
            $scope.chartConfig_album = setConfig($scope.data_album,$scope,'专辑总量');   //专辑总量统计配置
            $scope.chartConfig_song = setConfig($scope.data_song,$scope,'歌曲总量');     //歌曲总量统计配置
            $scope.chartConfig_song_form = setConfig($scope.data_song_form,$scope,'歌单总量');       //歌单总量统计配置
            function setConfig(data,$scope,type){
                return $scope.config = {//抓取总量配置
                    options: {
                        chart: {
                            type: 'column'
                        },
                        tooltip: {
                            style: $scope.style
                        },
                        plotOptions: {
                            column: {
                                stacking: '',
                                dataLabels: $scope.dataLabels
                            }
                        }
                    },
                    series: data,
                    title: {
                        text: '抓取'+type+'统计'
                    },
                    subtitle:{
                        text: ''
                    },
                    loading: false,
                    xAxis: {
                        categories: [type]
                    },
                    yAxis: {
                        lineWidth: 1,
                        tickWidth: 1,
                        title: {
                            align: 'high',
                            offset: 0,
                            text: '数据总量 (条)',
                            rotation: 0,
                            y: -10
                        }
                    },
                    useHighStocks: false,
                    size:$scope.size_sm,
                    "credits":{"enabled":false}
                };
            }
        });
        //实时刷新请求监控
        var y_before,z_before;
        $('#chartConfig_monitor_new').highcharts({
            chart: {
                type: 'spline',
                //animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function() {
                        // set up the updating of the chart each second
                        var series = this.series[0];
                        var series2 = this.series[1];
                        setInterval(function() {
                            $http.jsonp(charts_catch_monitor_all + '?callback=JSON_CALLBACK').success(function(res){
                                if(y_before == '' || y_before == undefined){
                                    y_before = res.body.successTotal;
                                }
                                if(z_before == '' || z_before == undefined){
                                    z_before == res.body.failTotal;
                                }
                                var x = (new Date()).getTime() + 8*60*60*1000, // current time
                                    y = res.body.successTotal - y_before,
                                    z = res.body.failTotal - z_before;
                                y_before = res.body.successTotal;
                                z_before = res.body.failTotal;

                                series.addPoint([x, y], true, true);
                                series.name = '成功总数';
                                series2.addPoint([x,z],true,true);
                                series2.name = '失败总数';
                            });
                        }, 3000);
                    }
                }
            },
            plotOptions: {
                spline: {
                    stacking: '',
                    dataLabels: {
                        enabled: true,
                        color: '#fffff',
                        style: {
                            //textShadow: '0 0 3px black'
                        }
                    }
                }
            },
            title: {
                text: '续点监控抓取状态增量图--每三秒请求一次'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 50
            },
            yAxis: {
                title: {
                    text: '增量总数'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            size:{
                width: 1050,
                height: 500
            },
            credits:{"enabled":false},
            series: [{
                name: '失败总数',
                color: '#008000',
                data: (setInit)()
            },{
                name: '成功总数',
                color: '#E27B6A',
                data: (setInit)()
            }]
        });
        function setInit(){ //初始化图标
            // generate an array of random data
            var data = [],
                time = (new Date()).getTime() + 8*60*60*1000,
                i;
            console.log(time);
            for (i = -10; i <= 0; i++) {
                data.push({
                    x: time + i * 3000,
                    y: 0
                });
            }
            return data;
        }
    }]);
})();