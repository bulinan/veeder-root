$(function () {
    var StationID = stateman.current.param['sid'];

    //当前库存
    (function () {
        var $staionCon = $('.panel-station .station-list');

        if (StationID) {
            var params = {
                //"SessionID": SessionID,
                'StationID': StationID
            }
            ajaxCall(URL.ProductList, params, function (_message) {
                var productList = _message.ProductList;

                ajaxCall(URL.CurrentInventory, params, function (_message) {
                    console.log(_message);
                    var InventoryList = _message.InventoryList;

                    if (InventoryList.length == 0) {
                        $staionCon.html('<div class="inventory-empty">' + getI18n('21901') + '</div>');
                    } else {
                        var itemHtml = $('.template-station-item').html(),
                            operationBarList = _message.OperationBarList,
                            cardList = _message.CardList,
                            html = '',
                            operationBarHtml = '',
                            infoArray = [],
                            planArray = [],
                            rowNum;

                        $('#inventory-updateTime').html(getI18n('21019') + ' ' + _message.InventoryUpdateTime);
                        for (var index = 0; index < InventoryList.length; index++) {
                            html = html + '<div class="item station-item" data-tank="' + InventoryList[index].TankNo + '">' + itemHtml + '</div>';
                        }
                        $staionCon.addClass('owl-carousel').html(html);

                        if (InventoryList.length == 1) {
                            rowNum = 3;
                        } else if (InventoryList.length <= 4) {
                            rowNum = InventoryList.length;
                        } else {
                            rowNum = 4;
                            $('.panel-station').addClass('panel-station-multi');
                        }

                        $staionCon.owlCarousel({
                            items: rowNum,
                            itemsDesktop: [1199, rowNum],
                            itemsDesktopSmall: [979, rowNum],
                            itemsTablet: [768, rowNum],
                            itemsMobile: [479, rowNum],
                            slideSpeed: 1000,
                            rewindNav: false,
                            pagination: false,
                            navigation: true,
                            navigationText: ['<i class="fa fa-arrow-circle-o-left"></i>', '<i class="fa fa-arrow-circle-o-right"></i>']
                        });

                        //操作
                        for (var i in operationBarList) {
                            var tankUrlList = JSON.stringify(operationBarList[i].TankUrlList),
                            popupMethod = operationBarList[i].PopupMethod;

                            if (popupMethod == '3') {
                                operationBarHtml = operationBarHtml + '<li data-popup="' + operationBarList[i].PopupMethod + '" data-tankUrlList=\'' + tankUrlList + '\'><a href="javascript:;" target="_blank">' + operationBarList[i].DisplayName + '</a></li>';
                            } else {
                                operationBarHtml = operationBarHtml + '<li data-popup="' + operationBarList[i].PopupMethod + '" data-tankUrlList=\'' + tankUrlList + '\'><a href="javascript:;">' + operationBarList[i].DisplayName + '</a></li>';
                            }
                        }
                        for (var index = 0; index < InventoryList.length; index++) {
                            var $item = $staionCon.find('.station-item').eq(index),
                                itemCardHtml = '',
                                waterRatio,
                                fuelRatio,
                                fuelColor;

                            $('[data-name]', $item).each(function () {
                                var name = $(this).attr('data-name');

                                $(this).text(InventoryList[index][name]);
                            });

                            $('.item-heading .select-box', $item).find('.select-con').html(operationBarHtml);

                            if (InventoryList[index].Diameter == 0) {
                                waterRatio = 0;
                                fuelRatio = 0;
                            } else {
                                waterRatio = (InventoryList[index].WaterHeight / InventoryList[index].Diameter) * 100;
                                fuelRatio = (InventoryList[index].FuelHeight / InventoryList[index].Diameter) * 100;
                            }
                            for (var i in productList) {
                                if (productList[i].DisplayName == InventoryList[index].Product) {
                                    fuelColor = productList[i].Color;
                                    break;
                                }
                            }
                            $('.item-chart', $item).find('.style01').css('height', waterRatio + '%');
                            $('.item-chart', $item).find('.style02').css({ 'height': fuelRatio + '%', 'bottom': waterRatio + '%', 'background': fuelColor });
                            $('.tooltip', $item).html('');
                            $('.water-tooltip', $item).append('<p>' + getI18n('10014') + '(' + MeasureText.Height + ')：' + InventoryList[index].WaterHeight.toFixed(2) + '</p><p>' + getI18n('10015') + '(' + MeasureText.Volume + ')：' + Math.round(InventoryList[index].WaterVolume) + '</p>');
                            $('.fuel-tooltip', $item).append('<p>' + getI18n('10010') + '(' + MeasureText.Height + ')：' + InventoryList[index].FuelHeight.toFixed(2) + '</p>').css('bottom', (waterRatio + fuelRatio) + '%');
                            //油罐信息列表
                            for (var i in cardList) {
                                if (cardList[i].AutoExpand == 1) {
                                    itemCardHtml = itemCardHtml + '<div class="item-box item-info" data-open="false"><div class="item-title clearfix"><h3 class="pull-left">' + cardList[i].DisplayName + '</h3><i class="fa fa-angle-down"></i></div><div class="item-con">';
                                } else {
                                    itemCardHtml = itemCardHtml + '<div class="item-box item-info" data-open="true"><div class="item-title clearfix"><h3 class="pull-left">' + cardList[i].DisplayName + '</h3><i class="fa fa-angle-down"></i></div><div class="item-con" style="display:none;">';
                                }

                                if (cardList[i].Error == '') {
                                    itemCardHtml = itemCardHtml + '<ul class="item-con-' + cardList[i].ColumnNumber + ' clearfix">';
                                    for (var j in cardList[i].TankList) {
                                        if (cardList[i].TankList[j].TankID == InventoryList[index].TankNo) {
                                            var displayList = cardList[i].TankList[j].DisplayList;
                                            for (var k in displayList) {
                                                itemCardHtml = itemCardHtml + '<li>' + displayList[k].Name + ' ' + displayList[k].Value + '</li>';
                                            }
                                            itemCardHtml = itemCardHtml + '</ul></div>';
                                        }
                                    }
                                } else {
                                    itemCardHtml = itemCardHtml + '<p class="error">' + cardList[i].Error + '</p></div>';
                                }
                                itemCardHtml = itemCardHtml + '</div>';
                            }
                            $('.tank-list', $item).html(itemCardHtml);
                        }

                        $('.item-chart-series', $staionCon).hover(function () {
                            var $itemChart = $(this).closest('.item-chart');

                            if ($(this).hasClass('style01')) $itemChart.find('.water-tooltip').show().siblings('.tooltip').hide();
                            else $itemChart.find('.fuel-tooltip').show().siblings('.tooltip').hide();
                        }, function () {
                            $(this).closest('.item-chart').find('.tooltip').hide();
                        });
                    }
                    $('.panel-station .block-loading').hide();
                });
            });

            //油站首页操作菜单
            NameSpace.Select.select_operationBar = function (_element, _selector) {
                var popupMethod = _element.attr('data-popup'),
                    tankUrlList = JSON.parse(_element.attr('data-tankUrlList')),
                    $stationItem = _selector.closest('.station-item'),
                    tankID = $stationItem.attr('data-tank');


                console.log(tankUrlList);
                for (var index in tankUrlList) {
                    if (tankUrlList[index].TankID == tankID) {
                        if (tankUrlList[index].Error == '') { //展现形式根据PopupMethod确定
                            console.log(tankUrlList[index].URL);
                            var tankUrl = tankUrlList[index].URL;
                            if (popupMethod == '1') {
                                _element.find('a').attr('href', '#/' + tankUrl);
                            } else if (popupMethod == '2') {
                                //操作列表
                                var $modal = $('#modal-commonPage'),
                                    iframeHtml = '<iframe frameborder="0" width="1300px" height="600px" scrolling="yes" src="" name="modalPage-iframe" id="modalPage-iframe"></iframe>';
                                $('.main-content', $modal).html(iframeHtml);
                                $('#modalPage-iframe', $modal).attr('src', 'dialog.html#/' + tankUrl + '&page=modalDialog'); //以窗口形式打开页面
                                modal_show($modal);
                            } else if (popupMethod == '3') {
                                _element.find('a').attr('href', '#/' + tankUrl);
                            }
                        } else alert(tankUrlList[index].Error);
                    }
                }
            }
        }
    })();

    //进销存
    (function () {
        if (StationID) {
            var params = {
                //"SessionID": SessionID,
                'StationID': StationID
            }
            ajaxCall(URL.StationLatestBIR, params, function (_message) {
                console.log(_message);
                var $tbody = $('#table-invoicing tbody'),
                    BIRList = _message.BIRList;

                //dataTables实现
                $('#table-invoicing').dataTable({
                    'lengthChange': false,
                    'processing': false,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': BIRList,
                    'columns': [
                        {
                            'data': 'TankNo'
                        },
                        {
                            'data': 'Product'
                        },
                        {
                            'data': 'BeginDate',
                            'render': function (_data, _type, _full) {
                                return '<span class="date">' + _data + '</span>';
                            }
                        },
                        {
                            'data': 'EndDate',
                            'render': function (_data, _type, _full) {
                                return '<span class="date">' + _data + '</span>';
                            }
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
                            'data': 'AdjustedVariance',
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
                $('.panel-invoicing .block-loading').hide();
            });
        }
    })();

    //历史库存
    (function () {
        var curMonth = NameSpace.Date.getCurrentMonth(),
            params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "BeginDate": curMonth[0],
                "EndDate": curMonth[1]
                //"BeginDate": '2015-08-01',
                //"EndDate": '2015-08-31'
            };

        //init
        data_call(params, 'init');
        var $box = $('.station .panel-inventory');

        //上个月
        $('.prev .month', $box).on('click', function () {
            var date = new Date($('.time-line input[name=lastOfPeriod]', $box).val()),
                curMonth = date.getMonth() + 1,
                curYear = date.getFullYear();

            curMonth = curMonth - 1;
            if (curMonth == 0) {
                curMonth = 12;
                curYear = curYear - 1;
            }
            var daysOfMonth = new Date(curYear, curMonth, 0).getDate();
            filterMonthData(curYear, curMonth, daysOfMonth);
        });

        //下个月
        $('.next .month', $box).on('click', function () {
            var date = new Date($('.time-line input[name=lastOfPeriod]', $box).val()),
                curMonth = date.getMonth() + 1,
                curYear = date.getFullYear();

            if (curMonth == 12) {
                curMonth = 1;
                curYear = curYear + 1;
            } else {
                curMonth = curMonth + 1;
            }
            var daysOfMonth = new Date(curYear, curMonth, 0).getDate();
            filterMonthData(curYear, curMonth, daysOfMonth);
        });

        //上周
        $('.prev .week', $box).on('click', function () {
            var date = new Date($('.time-line input[name=firstOfPeriod]', $box).val()),
                curMonth = date.getMonth() + 1,
                curYear = date.getFullYear(),
                curDay = date.getDate(),
                days = new Date(curYear, curMonth, 0).getDate(),
                firstDayOfWeek,
                lastDayOfWeek,
                firstDate,
                lastDate;

            if (curDay == 1) {
                curMonth = curMonth - 1;
                if (curMonth == 0) {
                    curMonth = 12;
                    curYear = curYear - 1;
                }
                var daysOfLastMonth = new Date(curYear, curMonth, 0).getDate();
                lastDayOfWeek = daysOfLastMonth;
                firstDayOfWeek = lastDayOfWeek - 6;
                firstDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(firstDayOfWeek);
                lastDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(lastDayOfWeek);
            } else {
                lastDayOfWeek = curDay - 1;
                lastDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(lastDayOfWeek);
                if (lastDayOfWeek - 6 <= 0) {
                    curMonth = curMonth - 1;
                    if (curMonth == 0) {
                        curMonth = 12;
                        curYear = curYear - 1;
                    }
                    var daysOfLastMonth = new Date(curYear, curMonth, 0).getDate();
                    firstDayOfWeek = lastDayOfWeek - 6 + daysOfLastMonth;
                    firstDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(firstDayOfWeek);
                } else {

                    firstDayOfWeek = lastDayOfWeek - 6;
                    console.log(firstDayOfWeek);
                    firstDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(firstDayOfWeek);
                }
            }
            filterWeekData(firstDate, lastDate);

        });

        //下周
        $('.next .week', $box).on('click', function () {
            var date = new Date($('.time-line input[name=lastOfPeriod]', $box).val()),
                curYear = date.getFullYear(),
                curMonth = date.getMonth() + 1,
                curDay = date.getDate(),
                days = new Date(curYear, curMonth, 0).getDate(),
                firstDayOfWeek,
                lastDayOfWeek,
                firstDate,
                lastDate;

            if (curDay == days) {
                firstDayOfWeek = 1;
                lastDayOfWeek = firstDayOfWeek + 6;
                curMonth = curMonth + 1;
                if (curMonth == 13) {
                    curMonth = 1;
                    curYear = curYear + 1;
                }
                firstDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(firstDayOfWeek);
                lastDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(lastDayOfWeek);
            } else {
                firstDayOfWeek = curDay + 1;
                lastDayOfWeek = firstDayOfWeek + 6;
                firstDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(firstDayOfWeek);
                if (lastDayOfWeek > days) {
                    lastDayOfWeek = lastDayOfWeek - days;
                    curMonth = curMonth + 1;
                    if (curMonth == 13) {
                        curMonth = 1;
                        curYear = curYear + 1;
                    }
                }
                lastDate = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + NameSpace.Format.addFormat(lastDayOfWeek);
            }
            filterWeekData(firstDate, lastDate);
        });

        function filterWeekData(firstDate, lastDate) {
            $('.block-loading', $box).show();
            $('.time-line input[name=firstOfPeriod]', $box).val(firstDate);
            $('.time-line input[name=lastOfPeriod]', $box).val(lastDate);
            params['BeginDate'] = firstDate;
            params['EndDate'] = lastDate;
            data_call(params);
        }

        function filterMonthData(curYear, curMonth, days) {
            $('.block-loading', $box).show();
            $('.time-line input[name=firstOfPeriod]', $box).val(curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-01');
            $('.time-line input[name=lastOfPeriod]', $box).val(curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + days);
            params['BeginDate'] = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + '01';
            params['EndDate'] = curYear + '-' + NameSpace.Format.addFormat(curMonth) + '-' + days;
            data_call(params);
        }

        function data_call(_params) {
            var argumentLength = arguments.length,
                dataOptions = {
                    chart: {
                        renderTo: 'station-inventory-chart',
                        type: 'spline'
                    },
                    title: {
                        text: getI18n('00003'),
                        style: {
                            color: '#333',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fontFamily: 'Microsoft YaHei'
                        },
                        align: 'left',
                        margin: 45
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        backgroundColor: '#fff'
                    },
                    loading: {
                        showDuration: 1,
                        hideDuration: 1000,
                        style: {
                            position: 'absolute',
                            color: '#666',
                            fontSize: '18px',
                            backgroundColor: 'white',
                            opacity: 1,
                            textAlign: 'center'
                        }
                    },
                    xAxis: {
                        categories: [],
                        labels: {
                            /*style: {
                            color: '#333',
                            fontSize: '14px',
                            fontFamily: 'Microsoft YaHei'
                            },*/
                            rotation: 0
                        }
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

            ajaxCall(URL.HistoryInventory, _params, function (_message) {
                console.log(_message);
                var historyInventory = _message.HistoryInventory,
                    array = [],
                    monthArray = [];

                if (argumentLength == 2) {
                    $('.time-line input[name=firstOfPeriod]').val(params.BeginDate);
                    $('.time-line input[name=lastOfPeriod]').val(params.EndDate);
                }
                if (historyInventory.length != 0) {
                    $('.time-line .show-month').hide();

                    for (var i in historyInventory) {
                        dataOptions.series[i] = {};
                        dataOptions.series[i].data = [];
                        dataOptions.series[i]['name'] = historyInventory[i].TankLabel + '(' + historyInventory[i].ProductLabel + ')';

                        for (var j in historyInventory[i].InventoryList) {
                            if (i == 0) {
                                var month = historyInventory[i].InventoryList[j].InventoryDate.slice(0, -3);
                                array.push(month);
                            }
                            if (historyInventory[i].InventoryList[j].Inventory === null) {
                                dataOptions.series[i].data.push(null);
                            } else {
                                dataOptions.series[i].data.push(Math.round(historyInventory[i].InventoryList[j].Inventory));
                            }

                        }
                    }
                    monthArray = NameSpace.Array.unique(array);

                    for (var index in monthArray) {
                        dataOptions.xAxis.categories[index] = {};
                        dataOptions.xAxis.categories[index]['categories'] = [];
                        dataOptions.xAxis.categories[index]['name'] = monthArray[index];
                        for (var j in historyInventory[0].InventoryList) {
                            var date = historyInventory[0].InventoryList[j].InventoryDate,
                                month = date.slice(0, -3),
                                day = date.split('-')[2];
                            if (month == monthArray[index]) {
                                dataOptions.xAxis.categories[index]['categories'].push(day);
                            }
                        }
                    }
                } else {
                    var date = $('.time-line input[name=lastOfPeriod]').val();

                    console.log(date);
                    $('.time-line .show-month').show().text(date.slice(0, -3));
                }
                console.log(dataOptions.series);
                if ($('#station-inventory-chart').length) {
                    var chart = new Highcharts.Chart(dataOptions);
                    $('.block-loading', $box).hide();
                }
            });
        }

    })();

    (function () {
        var $box = $('.station .panel-station');

        //click
        $box.delegate('.item-title i', 'click', function () {
            var $itemBox = $(this).closest('.item-box'),
                isOpen = $itemBox.attr('data-open');

            if (isOpen == 'false') {
                $(this).parent().next().slideUp(500);
                $itemBox.attr('data-open', true);
            } else {
                $(this).parent().next().slideDown(500);
                $itemBox.attr('data-open', false);
            }
        });
    })();
});