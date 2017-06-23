/*
    公司库存
*/
$(function () {
    var $page = $('body').find('.company-inventory'),
        sessionCid = stateman.current.param["cid"];

    //库存摘要、明细初始化以及更新
    (function () {
        var $calc_type = $('.inner-options .btn-group', $page),
            $panelSummary = $('.panel-summary', $page),
            $panelInventory = $('.panel-inventory', $page),
            $panelStationInventory = $('.panel-stationInventory', $page),
            commonProductList,
            inventorySummary,
            inventoryList,
            realTimeInventoryList;

        //初始化
        init();

        //vt、v20切换
        $calc_type.on('click', '.btn', function () {
            var calcType = $(this).attr('data-type');

            $(this).addClass('active').siblings().removeClass('active');
            $('.block-loading', $panelSummary).show();
            $('.block-loading', $panelInventory).show();
            $('.block-loading', $panelStationInventory).show();
            inventory_summary(calcType);
            realTime_inventory(calcType);
        });

        //更新
        $('.update', $calc_type).on('click', function () {
            $('.block-loading', $panelSummary).show();
            $('.block-loading', $panelInventory).show();
            $('.block-loading', $panelStationInventory).show();
            init();
        });

        function init() {
            var calcType = $('a.active', $calc_type).attr('data-type'),
                date = NameSpace.Date.getCurrentMonth(),
                dateArray = NameSpace.Date.get30DaysFromNow(),
                inventorySummaryParams = {
                    //"SessionID": SessionID
                },
                inventoryParams = {
                    //"SessionID": SessionID,
                    "CompanyID": sessionCid,
                    "BeginDate": dateArray[0],
                    "EndDate": dateArray[1],
                    "CalcType": "Vt,V20"
                },
                realTimeInventoryParams = {
                    //"SessionID": SessionID,
                    "CompanyID": sessionCid
                };

            //库存摘要
            ajaxCall(URL.ProductList, '{}', function (_message) {  //调用此api是为了找到对应油品的颜色
                commonProductList = _message.ProductList;

                inventorySummaryParams['CompanyID'] = sessionCid;
                inventorySummaryParams['BeginDate'] = date[0];
                inventorySummaryParams['EndDate'] = date[1];
                inventorySummaryParams['CalcType'] = 'Vt,V20';

                ajaxCall(URL.InventorySummary, inventorySummaryParams, function (_message) {
                    console.log(_message);

                    inventorySummary = _message;
                    //明细
                    ajaxCall(URL.Inventory, inventoryParams, function (_message) {
                        console.log(_message);
                        inventoryList = _message;
                        inventory_summary(calcType);
                    });
                });
            });

            //油站实时库存
            ajaxCall(URL.StationRealTimeInventory, realTimeInventoryParams, function (_message) {
                console.log(_message);
                realTimeInventoryList = _message.InventoryList;
                realTime_inventory(calcType);
            });
        }

        //库存摘要
        function inventory_summary(_ctype) {
            var $panel = $page.find('.panel-summary'),
                cType;


            if (_ctype == 'Vt') cType = 'VtInventory';
            else if (_ctype == 'V20') cType = 'V20Inventory';

            var inventoryProductList = inventorySummary[cType].ProductList,
                html = '',
                template_chart = $('.template-item-chart', $page).html();

            for (var index = 0; index < inventoryProductList.length; index++) {
                html = html + '<li class="item-chart">' + template_chart + '</li>';
            }
            $('.panel-body', $panel).html(html);

            //inventoryProductList = inventoryProductList.slice(0, 8);
            for (var i in inventoryProductList) {
                var $itemCon = $('.item-chart', $panel).eq(i),
                    $itemChart = $itemCon.find('.item-chart-group'),
                    length = inventoryProductList.length;

                if (length <= 9) $itemCon.width((1 / length) * 100 + '%');
                else $itemCon.width((1 / 8) * 100 + '%');

                $itemChart.css('background', function () {
                    for (var j in commonProductList) {
                        if (commonProductList[j].ProductID == inventoryProductList[i].ID) return commonProductList[j].Color;
                    }
                });
                $itemChart.height(function () {
                    return $(this).width();
                });
                $('.item-chart-ullage', $itemChart).html('<p>' + getI18n('12007') + ':' + Math.round(inventoryProductList[i].Ullage) + '</p>');
                $('.item-chart-inventory', $itemChart).html('<p>' + getI18n('12008') + ':' + Math.round(inventoryProductList[i].Inventory) + '</p>');
                $('.item-chart-name', $itemCon).html(inventoryProductList[i].Name);
            }
            $('.block-loading', $panel).hide();

            //调用公司明细
            company_inventory(_ctype, inventoryProductList);
        }

        //库存明细
        function company_inventory(_ctype, _productList) {
            var $panel = $('.panel-inventory', $page),
                dataOptions = {
                    chart: {
                        renderTo: 'company-inventory-chart',
                        type: 'spline'
                    },
                    title: {
                        text: getI18n('10103'),
                        style: {
                            color: '#6b6b6b',
                            fontSize: '24px',
                            fontFamily: 'Microsoft YaHei'
                        }
                    },
                    subtitle: {
                        align: 'center',
                        style: {
                            color: '#a1a1a1',
                            fontSize: '14px',
                            fontFamily: 'Microsoft YaHei'
                        },
                        y: 40
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        backgroundColor: '#fff'
                    },
                    xAxis: {
                        categories: [],
                        labels: {
                            rotation: 0
                        },
                        tickColor: '#FF0000',
                        tickWidth: 1,
                        tickLength: 10
                    },
                    yAxis: {
                        title: {
                            text: getI18n('10701') + getRelatedMeasure('Volume')
                        }
                    },
                    tooltip: {
                        valueDecimals: 0
                    },
                    plotOptions: {
                        series: {
                            connectNulls: true
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
                },
                cType;

            if (_ctype == 'Vt') cType = 'VtInventoryList';
            else if (_ctype == 'V20') cType = 'V20InventoryList';

            var color = ['#edab41', '#e3f79b', '#a2d200'],
                data = inventoryList[cType],
                arrayDate = [],
                arrayMonth = [],
                date = [],
                month = [];

            for (var index in data) {
                var month = new Date(data[index].InventoryDate).getMonth() + 1;
                arrayDate.push(data[index].InventoryDate);
                arrayMonth.push(month);
            }
            date = NameSpace.Array.unique(arrayDate);
            month = NameSpace.Array.unique(arrayMonth);
            month.sort(function (a, b) {
                return a - b;
            });
            date.sort(function (a, b) {
                return Date.parse(a) - Date.parse(b);
            });
            for (var index in month) {
                dataOptions.xAxis.categories[index] = {};
                dataOptions.xAxis.categories[index]['categories'] = [];
                dataOptions.xAxis.categories[index]['name'] = month[index] + '月';
                for (var i in date) {
                    var currMonth = new Date(date[i]).getMonth() + 1,
                        currDay = NameSpace.Format.addFormat(new Date(date[i]).getDate());
                    if (currMonth == month[index]) dataOptions.xAxis.categories[index]['categories'].push(currDay);
                }
            }
            var newData = {};
            for (var i in data) {
                if (newData[data[i].ProductID] == undefined) {
                    newData[data[i].ProductID] = {};
                }
                newData[data[i].ProductID][data[i].InventoryDate] = data[i].Inventory;
            }
            console.log(newData);

            for (var index in _productList) {
                dataOptions.series[index] = {};
                dataOptions.series[index].data = [];
                dataOptions.series[index]['name'] = _productList[index].Name;
                dataOptions.series[index]['color'] = color[index];
                var temp = [];

                for (var i in date) {
                    if (newData[_productList[index].ID] !== undefined && newData[_productList[index].ID][date[i]] !== undefined) {
                        temp.push(Number(newData[_productList[index].ID][date[i]]));
                    } else {
                        temp.push(null);
                    }
                }

                dataOptions.series[index].data = temp;
            }
            sessionCompanyName = sessionCompanyName || $('#company-name').text();
            var subTitle = {
                text: sessionCompanyName
            }
            var chart = new Highcharts.Chart(dataOptions);
            chart.setTitle(null, subTitle, true);

            $('.block-loading', $panel).hide();
        }

        //油站实时库存
        function realTime_inventory(_ctype) {
            var $selector = $('.selector', $panelStationInventory),
                SumOrTcVolume,
                CurOrTcVolume;

            //设置标题
            $('.chart-heading .title', $panelStationInventory).html(getI18n('12009') + _ctype);

            if (realTimeInventoryList.length) {
                $('.dataTables_wrapper', $panelStationInventory).remove();
                $('.chart-body', $panelStationInventory).append('<table class="table"><thead></thead></table>');
                if (_ctype == 'Vt') {
                    SumOrTcVolume = 'SumVolume';
                    CurOrTcVolume = 'CurVolume';
                } else if (_ctype == 'V20') {
                    SumOrTcVolume = 'SumTcVolume';
                    CurOrTcVolume = 'CurTcVolume';
                }

                var map = {}, //临时存放数据
                    dataList = [];
                for (var i in realTimeInventoryList) {
                    var row = realTimeInventoryList[i];
                    if (!map[row.GsId]) {
                        dataList.push({
                            CompanyShortName: row.CompanyShortName,
                            GsId: row.GsId,
                            GsShortName: row.GsShortName,
                            UpdateTime: row.UpdateTime,
                            SumOrTcVolume: row[SumOrTcVolume],
                            SumUllage: row.SumUllage,
                            Data: [row]
                        });
                        map[row.GsId] = row;
                    } else {
                        for (var j in dataList) {
                            var newRow = dataList[j];
                            if (newRow.GsId == row.GsId) {
                                newRow.Data.push(row);
                                break;
                            }
                        }
                    }
                }

                var maxTankNum = dataList[0].Data.length;
                for (var i in dataList) {
                    if (dataList[i].Data.length > maxTankNum) maxTankNum = dataList[i].Data.length;
                }
                var $table = $('.table', $panelStationInventory);
                //动态生成table的表头
                var theadHtml01 = '<tr><th rowspan="2">' + getI18n('12002') + '</th><th rowspan="2">' + getI18n('12003') + '</th><th rowspan="2">' + getI18n('12010') + '</th><th rowspan="2">' + getI18n('12011') + '</th><th rowspan="2">' + getI18n('12012') + '</th><th rowspan="2">' + getI18n('12013') + '</th><th rowspan="2">' + getI18n('12014') + '</th>',
                theadHtml02 = '<tr>';

                for (var index = 1; index <= maxTankNum; index++) {
                    theadHtml01 = theadHtml01 + '<th colspan="2">0' + index + '</th>';
                    theadHtml02 = theadHtml02 + '<th class="thin"><span data-tankid="' + index + '">' + getI18n('10008') + '</span></th><th class="thin"><span data-tankid="' + index + '">' + getI18n('10007') + '</span></th>';
                }
                theadHtml01 = theadHtml01 + '</tr>';
                theadHtml02 = theadHtml02 + '</tr>';

                $table.find('thead').html(theadHtml01 + theadHtml02);

                var tableColumns = [
                    {
                        'data': 'SumOrTcVolume',
                        'visible': false
                    },
                    {
                        'data': 'SumUllage',
                        'visible': false
                    },
                    {
                        'width': '60px',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            return '';
                        }
                    },
                    {
                        'data': 'CompanyShortName',
                        'orderable': false
                    },
                    {
                        'data': 'GsShortName',
                        'orderable': false
                    },
                    {
                        'width': '100px',
                        'data': 'UpdateTime',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            var dateTime = _data.split(' ');
                            return '<span class="date">' + dateTime[0] + '</span><span class="time-block">' + dateTime[1] + '</span>';
                        }
                    },
                    {
                        'width': '150px',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            return '<p>' + getI18n('12015') + '</p><p>' + getI18n('12016') + '</p><p class="last">' + getI18n('12017') + '</p>';
                        }
                    }
                ];

                for (var index = 1; index <= maxTankNum; index++) {
                    var prodcutCell = {
                        'data': 'Data',
                        'width': '70px',
                        'orderable': false,
                        'render': function (_data, _type, _row, _meta) {
                            var api = new $.fn.dataTable.Api(_meta.settings),
                            tankId = $(api.column(_meta.col).header()).find('span').attr('data-tankid');

                            for (var i in _data) {
                                if (_data[i].TankId == tankId) {
                                    return _data[i].OtShortName;
                                }
                            }
                            return '';
                        }
                    },
                    volumeCell = {
                        'data': 'Data',
                        'width': 100,
                        'orderable': false,
                        'render': function (_data, _type, _row, _meta) {
                            var api = new $.fn.dataTable.Api(_meta.settings),
                                tankId = $(api.column(_meta.col).header()).find('span').attr('data-tankid');

                            for (var i in _data) {
                                if (_data[i].TankId == tankId) {
                                    return '<p>' + Math.round(_data[i][CurOrTcVolume]) + '</p><p>' + Math.round(_data[i].CurUllage) + '</p><p class="last">' + Math.round(_data[i][CurOrTcVolume] + _data[i].CurUllage) + '</p>';
                                }
                            }
                            return '';
                        }
                    }
                    tableColumns.push(prodcutCell, volumeCell);
                }
                var table = $table.DataTable({
                    'lengthChange': false,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'order': [[0, 'desc']],
                    'scrollY': 600,
                    'scrollCollapse': true,
                    'destroy': true,
                    'data': dataList,
                    'columns': tableColumns,
                    'language': {
                        'emptyTable': getI18n('12901')
                    }
                });

                table.on('order.dt', function () {
                    table.column(2, {
                        search: 'applied',
                        order: 'applied'
                    }).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                }).draw();

                //默认
                table_sort();
            } else {
                $('.data-empty', $panelStationInventory).remove();
                $('.chart-body', $panelStationInventory).append('<div class="data-empty">' + getI18n('12901') + '</div>');
            }
            $('.block-loading', $panelStationInventory).hide();

            function table_sort() {
                var sortFiled = $('input[name=sort-field]:checked', $selector).val(),
                    sortWay = $('input[name=sort-way]:checked', $selector).val();

                if (sortFiled == 'SumVolume') table.order([0, sortWay]).draw();
                else table.order([1, sortWay]).draw();
            }

            //排序
            $('input:radio', $selector).on('click', function () {
                table_sort();
            });
        }

        $(window).resize(function () {
            $('.item-chart').each(function () {
                var $item = $(this).find('.item-chart-group'),
                    itemWidth = $item.width();

                $item.height(itemWidth);
            });
        });
    })();
});