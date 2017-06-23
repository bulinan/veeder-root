function initialize() {
    // 百度地图API功能
    var $panel = $('.panel-map'),
        map = new BMap.Map("map"),    // 创建Map实例
        top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT}), // 左上角，添加比例尺
        top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
	

    language_init();
    //map.addEventListener('tilesloaded', function () {
    var params = {
        'CompanyID': stateman.current.param['cid']
    };
    ajaxCall(URL.Map, params, function (_message) {
        map.clearOverlays();

        //添加控件和比例尺
        map.addControl(top_left_control);
        map.addControl(top_left_navigation);

        if (_message.StationList.length) {
            var center = _message.centerPosition.split(',');

            map.centerAndZoom(new BMap.Point(Number(center[1]), Number(center[0])), Number(_message.mapZoom));  // 初始化地图,设置中心点坐标和地图级别
            map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

            for (var index in _message.StationList) {
                var lng = Number(_message.StationList[index].Longitude),
                    lat = Number(_message.StationList[index].Latitude);

                if (_message.StationList[index].Status == 0) {
                    var myIcon = new BMap.Icon("/html/statics/img/marker_gray_sprite.png", new BMap.Size(19, 25));
                    var marker = new BMap.Marker(new BMap.Point(lng, lat), { icon: myIcon });
                } else if (_message.StationList[index].Status == 1) {
                    var marker = new BMap.Marker(new BMap.Point(lng, lat));
                } else if (_message.StationList[index].Status == 2) {
                    var myIcon = new BMap.Icon("/html/statics/img/marker_green_sprite.png", new BMap.Size(19, 25));
                    var marker = new BMap.Marker(new BMap.Point(lng, lat), { icon: myIcon });
                }
                marker.id = _message.StationList[index].StationID;
                map.addOverlay(marker);     // 将标注添加到地图中
                marker.addEventListener("click", openInfo);
            }
            $('.block-loading', $panel).hide();
        } else {
            map.centerAndZoom(new BMap.Point(116.404, 39.915), 13);
            map.enableScrollWheelZoom(true);
            $('.block-loading', $panel).fadeOut(500, function () {
                alert(getI18n('19901'));
            });
        }
        console.log(map.getZoom());
    });
    //});

    //定义信息窗口
    var opts = {
        width: 640,     // 信息窗口宽度
        height: 420,     // 信息窗口高度
        enableMessage: true//设置允许信息窗发送短息
    },
    html = $('.template-station-item').html();

    function openInfo(e) {
        var p = e.target;
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
        var infoWindow = new BMap.InfoWindow(html, opts);  // 创建信息窗口对象 
        map.openInfoWindow(infoWindow, point); //开启信息窗口

        /*ajax调用数据*/
        var curDate = NameSpace.Date.getCurrentMonth(),
        inventoryParams = {
            "StationID": p.id,
            "BeginDate": curDate[0],
            "EndDate": curDate[1]
        },
        commonParams = {
            'StationID': p.id
        },
        historyInventory,
        BIRList;

        setTimeout(function () {
            var $con = $('.station-item');

            //油罐
            ajaxCall(URL.ProductList, commonParams, function (_message) {
                var productList = _message.ProductList;

                ajaxCall(URL.StationOverview, commonParams, function (_message) {
                    var stationData = _message.StationList[0],
                    $con = $('.station-item'),
                    $stationSummary = $('.station-summary', $con),
                    $stationInfo = $('.station-info', $con),
                    $tankCon = $('.tank-scroll', $con),
                    $statusList = $('.status-list', $con),
                    statusHtml = '';

                    $('.station-name', $stationSummary).attr('href', '#/Station?sid=' + stationData.StationID).text(stationData.StationName);

                    if (stationData.UpdatedTime === null) $('.update-time', $stationSummary).find('i').text('');
                    else $('.update-time', $stationSummary).find('i').text(stationData.UpdatedTime);

                    if (stationData.Online) {
                        $('.line-status', $stationSummary).html('<i class="online"></i>' + getI18n('21002'));
                    } else {
                        $('.line-status', $stationSummary).html('<i class="off-line"></i>' + getI18n('21003'));
                    }

                    $('.value', $stationInfo).each(function () {
                        var dataName = $(this).attr('data-name');

                        if (stationData[dataName] === null) $(this).text('');
                        else $(this).text(stationData[dataName]);

                    });

                    //tank list
                    var tankHtml = $('#tankList').html(),
                        template = Handlebars.compile(tankHtml);

                    Handlebars.registerHelper("calculateHeight", function (_data) {
                        if (_data.Diameter == 0) return 0;
                        else return (_data.FuelHeight / _data.Diameter) * 100 + '%';
                    });
                    Handlebars.registerHelper("calculateStyle", function (_data) {
                        for (var i in productList) {
                            if (productList[i].DisplayName == _data) return productList[i].Color;
                        }
                    });
                    Handlebars.registerHelper("keepDecimal", function (_data1, _data2) {
                        if (_data2 == 0) return Math.round(_data1);
                        else return _data1.toFixed(_data2);
                    });
                    $tankCon.html(template(stationData));

                    for (var i in stationData.TankStateList) {
                        if (stationData.TankStateList[i].StateValue) {
                            statusHtml = statusHtml + '<li class="right"><span class="key">' + stationData.TankStateList[i].StateKey + '：</span><i class="fa fa-check"></i></li>';
                        } else {
                            statusHtml = statusHtml + '<li class="wrong"><span class="key">' + stationData.TankStateList[i].StateKey + '：</span><i class="fa fa-times"></i></li>';
                        }
                    }
                    $('ul', $statusList).html(statusHtml);

                    language_init();
                    measureMatch();

                    $con.find('.tank-scroll').owlCarousel({
                        items: 4,
                        slideSpeed: 1000,
                        rewindNav: false,
                        pagination: false,
                        navigation: true,
                        navigationText: ['<i class="fa fa-arrow-circle-o-left"></i>', '<i class="fa fa-arrow-circle-o-right"></i>']
                    });

                    $('.item-chart-group', $tankCon).hover(function () {
                        $(this).parent().next().show();
                    }, function () {
                        $(this).parent().next().hide();
                    });

                    $con.find('.block-loading').hide();
                });
            });

            $('.tab-title', $con).on('click', 'a', function () {
                var index = $(this).index(),
                $tabCon = $(this).closest('.item-body').find('.tab-con');

                $(this).addClass('active').siblings().removeClass('active');
                $tabCon.find('.item-con').eq(index).show().siblings().hide();

                if (index == 1) {
                    if (!historyInventory) {
                        $con.find('.block-loading').show();
                        ajaxCall(URL.HistoryInventory, inventoryParams, function (_message) {
                            historyInventory = _message.HistoryInventory;
                            var dataOptions = {
                                chart: {
                                    renderTo: 'inventory-chart',
                                    type: 'spline'
                                },
                                title: {
                                    text: null
                                },
                                legend: {
                                    layout: 'vertical',
                                    align: 'right',
                                    verticalAlign: 'top',
                                    backgroundColor: '#fff'
                                },
                                xAxis: {
                                    categories: [],
                                    labels: {
                                        rotation: 0
                                    },
                                    tickInterval: 2
                                },
                                yAxis: {
                                    title: {
                                        text: getI18n('10701') + getRelatedMeasure('Volume'),
                                        align: 'high',
                                        rotation: 0,
                                        offset: -30,
                                        y: -30,
                                        style: {
                                            color: '#333',
                                            fontSize: '14px',
                                            fontFamily: 'Microsoft YaHei'
                                        }
                                    }
                                },
                                tooltip: {
                                    formatter: function () {
                                        var time = this.x.parent.name + '-' + this.x.name;
                                        return time + '<br/>' + '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ':' + this.y;
                                    }
                                },
                                credits: {
                                    enabled: false
                                },
                                series: [],
                                lang: {
                                    noData: getI18n('10803')
                                },
                                noData: {
                                    style: {
                                        fontFamily: 'Microsoft YaHei',
                                        fontWeight: 'bold',
                                        fontSize: '20px',
                                        color: '#6b6b6b'
                                    }
                                }
                            };

                            dataOptions.xAxis.categories[0] = {};
                            dataOptions.xAxis.categories[0]['categories'] = [];
                            for (var i in historyInventory) {
                                dataOptions.series[i] = {};
                                dataOptions.series[i].data = [];
                                dataOptions.series[i]['name'] = historyInventory[i].TankLabel + '(' + historyInventory[i].ProductLabel + ')';

                                for (var j in historyInventory[i].InventoryList) {
                                    dataOptions.xAxis.categories[0]['name'] = historyInventory[0].InventoryList[0].InventoryDate.slice(0, -3);

                                    if (i == 0) {
                                        var date = historyInventory[i].InventoryList[j].InventoryDate,
                                        day = date.split('-')[2];
                                        dataOptions.xAxis.categories[0]['categories'].push(day);
                                    }
                                    if (historyInventory[i].InventoryList[j].Inventory === null) {
                                        dataOptions.series[i].data.push(null);
                                    } else {
                                        dataOptions.series[i].data.push(Math.round(historyInventory[i].InventoryList[j].Inventory));
                                    }
                                }
                            }
                            var chart = new Highcharts.Chart(dataOptions);
                            $con.find('.block-loading').hide();
                        });
                    }
                } else if (index == 2) {
                    if (!BIRList) {
                        $con.find('.block-loading').show();
                        ajaxCall(URL.StationLatestBIR, commonParams, function (_message) {  //其他 - 进销存
                            BIRList = _message.BIRList;
                            $('#latestBIR-table').dataTable({
                                'lengthChange': false,
                                'processing': false,
                                'searching': false,
                                'paging': false,
                                'info': false,
                                'ordering': false,
                                'destroy': true,
                                'scrollY': 62,
                                "scrollCollapse": true,
                                'data': BIRList,
                                'columns': [
                        {
                            'data': 'TankNo'
                        },
                        {
                            'data': 'Product'
                        },
                        {
                            'data': 'StartInventory',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Math.round(_data);
                            }
                        },
                        {
                            'data': 'DeliveredVolume',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Math.round(_data);
                            }
                        },
                        {
                            'data': 'CalculatedInventory',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Math.round(_data);
                            }
                        },
                        {
                            'data': 'EndInventory',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Variance',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VarianceRatio'
                        }
                    ],
                                'language': {
                                    'emptyTable': getI18n('21902')
                                }
                            });
                            $con.find('.block-loading').hide();
                        });
                    }
                }
            });

            $('.status-list', $con).on('click', '.icon-list-collapse', function () {
                var $itemBox = $(this).closest('.status-list'),
                isOpen = $itemBox.attr('data-open');

                if (!isOpen || isOpen == 'false') {
                    $itemBox.slideUp(500);
                    $itemBox.attr('data-open', true);
                } else {
                    $itemBox.slideDown(500);
                    $itemBox.attr('data-open', false);
                }
            });
        }, 500);
    }
}
loadScript();
function loadScript() {
    var script = document.createElement("script");
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=81b2172e29c5dcd4b7eadf1a47836867&callback=initialize";
    document.body.appendChild(script);
}

