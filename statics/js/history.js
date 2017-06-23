$(function () {
    var StationID = stateman.current.param['sid'],
        DataList;

    var documentTitle = document.title;
    //油品列表
    (function () {
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID   //默认为0，查询所有油站,测试数据：-90049 
        }
        ajaxCall(URL.ProductList, params, function (_message) {
            console.log(_message);
            var productList = _message.ProductList;
            for (var index in productList) {
                $('#productList').find('.select-con').append('<li data-value=' + productList[index].DisplayName + '>' + productList[index].DisplayName + '</li>');
            }
            $('.condition-list').find('.block-loading').hide();
        });
    })();
    //历史库存查询
    (function () {
        $('#history-query').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "PageInfo": {}
            },
            total,
            historyInventoryList;

            params = NameSpace.String.getFormParams('#history-inventory-form', params);
            if (params === false) {
                return false;
            }
            $('.record-box').show();
            var $table = $('#historyHnventory'),
                pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);
            $table.show().find('tbody').html('');
            var table = $table.DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false,
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'dom': 'Blfrt<"dataTables_bottom"pi>',
                'destroy': true,
                'sAjaxSource': URL.HistoryInventory,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);

                    params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1; // 请求的开始记录编号
                    params['PageInfo'].RequestCount = ''; // 请求记录数量

                    ajaxCall(sSource, params, function (_message) {
                        console.log(_message);
                        historyInventoryList = format(_message, total).data;
                        if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                        fnCallback(format(_message, total));
                    });
                },
                'buttons': [
                    {
                        extend: 'excel',
                        text: getI18n('09902'),
                        className: 'btn-export',
                        footer: true,
                        enabled: false,
                        exportOptions: {
                            modifier: {
                                page: 'all'
                            }
                        },
                        title: getI18n('00000') + '-' + getI18n('22001'),
                        customize: function (xls) {
                            document.title = documentTitle;
                            var sheetData = xls.xl.worksheets['sheet1.xml'];
                            console.log(sheetData);
                            for (var i in historyInventoryList) {
                                var $row = $('row[r=' + (parseInt(i) + 2) + ']', sheetData),
                                    rowData = historyInventoryList[i].InventoryDate.split(' ');

                                $('c[r=C' + (parseInt(i) + 2) + '] t', $row).text(rowData[0] + '  ' + rowData[1]);

                                if (historyInventoryList[i].Inventory === 0) {
                                    $('c[r=D' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (historyInventoryList[i].InventoryV20 === 0) {
                                    $('c[r=E' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (historyInventoryList[i].Ullage === 0) {
                                    $('c[r=F' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (historyInventoryList[i].WaterVolume === 0) {
                                    $('c[r=I' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                            }
                        }
                    }
                ],
                'columns': [
                    {
                        'data': 'TankLabel'
                    },
                    {
                        'data': 'ProductLabel'
                    },
                    {
                        'data': 'InventoryDate',
                        'render': function (_data, _type, _full) {
                            var date = _data.split(' ');
                            return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                        }
                    },
                    {
                        'data': 'Inventory',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'InventoryV20',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'Ullage',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'FuelHeight',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return _data.toFixed(2);
                        }
                    },
                    {
                        'data': 'WaterHeight',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return _data.toFixed(2);
                        }
                    },
                    {
                        'data': 'WaterVolume',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'Temperature',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return _data.toFixed(2);
                        }
                    }
                ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('22901'),
                    'paginate': {
                        'first': '<i class="fa fa-angle-double-left"></i>',
                        'last': '<i class="fa fa-angle-double-right"></i>',
                        'previous': '<i class="fa fa-angle-left"></i>',
                        'next': '<i class="fa fa-angle-right"></i>'
                    }
                },
                'initComplete': function (settings, json) {
                    if (table.data().length == 0) {
                        table.buttons().enable(false);
                    } else {
                        table.buttons().enable(true);
                    }
                    //$(this.api().table().container()).find('.dataTables_info,.dataTables_paginate').show();
                    $(this.api().table().container()).find('.dataTables_bottom').slideDown(function(){
                        document.title = documentTitle;
                    });
                }
            });
            function format(_data, _total, _sortName, _sortValue) {
                var historyInventory = _data.HistoryInventory,
                    temp = [];
                for (var i in historyInventory) {
                    for (var j in historyInventory[i].InventoryList) {
                        historyInventory[i].InventoryList[j]['ProductLabel'] = historyInventory[i].ProductLabel;
                        historyInventory[i].InventoryList[j]['TankLabel'] = historyInventory[i].TankLabel;
                    }
                    temp = temp.concat(historyInventory[i].InventoryList);
                }
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: temp
                };
            }
        });
    })();

    //库存曲线
    (function () {
        var $modal = $('#modal-inventory');

        $('.station-body').find('.station-con').on('click', '#inventory-chart', function () {
            $('.chart-con', $modal).html('');
            $('.modal-loading', $modal).show();
            modal_show($modal);

            var params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "PageInfo": {}
            };
            params['PageInfo'].RecordOffset = 1;
            params['PageInfo'].RequestCount = '';

            params = NameSpace.String.getFormParams('#history-inventory-form', params);

            ajaxCall(URL.HistoryInventory, params, function (_message) {
                console.log(_message);
                $('.modal-loading', $modal).hide();
                DataList = _message.HistoryInventory;
                var historyInventory = _message.HistoryInventory,
                    series = [];

                for (var i in historyInventory) {
                    series[i] = {};
                    series[i].data = [];
                    series[i]['name'] = historyInventory[i].TankLabel + '(' + historyInventory[i].ProductLabel + ')';

                    //排序
                    historyInventory[i].InventoryList.sort(function (a, b) {
                        a.InventoryDate = a.InventoryDate.replace(/-/g, "/");
                        b.InventoryDate = b.InventoryDate.replace(/-/g, "/");

                        return Date.parse(a.InventoryDate) - Date.parse(b.InventoryDate);
                    });
                    for (var j in historyInventory[i].InventoryList) {
                        var temp = [],
                            tempDate = historyInventory[i].InventoryList[j].InventoryDate.split(' '),
                            date = tempDate[0].split('/'),
                            time = tempDate[1].split(':'); ;

                        temp.push(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1]));
                        temp.push(Math.round(Number(historyInventory[i].InventoryList[j].Inventory)));
                        series[i].data.push(temp);
                    }
                }
                var dataOptions = {
                    chart: {
                        renderTo: 'history-inventory-chart',
                        type: 'line'
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
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            rotation: -45,
                            formatter: function () {
                                return Highcharts.dateFormat('%m/%d %H:%M', this.value); //Highcharts.dateFormat('%Y/%m/%d %H:%M', this.value);
                            },
                            y: 25
                        }
                    },
                    yAxis: {
                        allowDecimals: false,
                        title: {
                            text: getI18n('10701') + getRelatedMeasure('Volume'),
                            align: 'high',
                            rotation: 0,
                            offset: -60,
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
                            return Highcharts.dateFormat('%Y-%m-%d %H:%M', this.key) + '<br/>' + '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ':' + Math.round(this.y); //toFixed(2)
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: series,
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

                var chart = new Highcharts.Chart(dataOptions);
            });

        });
    })();
});