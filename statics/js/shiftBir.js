$(function () {
    var $page = $('body').find('.shiftBir-box'),
        $calc_type = $('#typeBut', $page),
        StationID = stateman.current.param['sid'];


    //form初始化
    (function () {
        var $productList = $('#product-list', $page),
            $typeList = $('#birType-list', $page),
            params = {
                //"SessionID": SessionID,
                "StationID": StationID
            }

        ajaxCall(URL.ProductList, params, function (_message) {
            var html = '<li data-value="">' + getI18n('09001') + '</li>';
            for (var index in _message.ProductList) {
                html = html + '<li data-value="' + _message.ProductList[index].DisplayName + '">' + _message.ProductList[index].DisplayName + '</li>';
            }

            $productList.find('.select-con').html(html);
            NameSpace.Select.firstSelected($productList);

            $('.condition-list').find('.block-loading').hide();

            //判断参数
            var urlBeginDate = stateman.current.param['beginDate'];

            if (urlBeginDate) {
                $('#shiftBir-query').trigger('click');
            }
        });
    })();

    //销售损溢初始化以及更新
    (function () {
        var $panelReport = $('.panel-report', $page),
            defaultCtype = $('a.btn-default', $calc_type).attr('data-type');

        //查询
        $('#shiftBir-query').on('click', function () {
            init();
            $('.chart-gap-con').find('.block-loading').show();
        });

        //vt、v20切换
        $calc_type.on('click', '.btn', function () {
            var calcType = $(this).attr('data-type');

            defaultCtype = calcType;
            init(calcType);
        });

        NameSpace.Select.select_birType = function (_element, _selector) {
            var type = _element.attr('data-value');

            if (type == '2') {
                $calc_type.find('[data-type=V20]').hide();
                $calc_type.find('[data-type=Vt]').addClass('btn-default').removeClass('btn-hollow').siblings().removeClass('btn-default').addClass('btn-hollow'); ;
            } else {
                $calc_type.find('[data-type=V20]').show();
                $calc_type.find('[data-type=' + defaultCtype + ']').addClass('btn-default').removeClass('btn-hollow').siblings().removeClass('btn-default').addClass('btn-hollow'); ;
            }
        }

        function init(_calcType) {
            var shiftBIRParams = {
                //"SessionID": SessionID,
                "StationID": StationID
            }

            shiftBIRParams = NameSpace.String.getFormParams('#shiftBIR-report-form', shiftBIRParams);
            if (shiftBIRParams === false) {
                return false
            }
            if (_calcType) $calc_type.find('a[data-type="' + _calcType + '"]').addClass('btn-default').removeClass('btn-hollow').siblings().removeClass('btn-default').addClass('btn-hollow');
            var calcType = $('a.btn-default', $calc_type).attr('data-type'),
                calcName = $('a.btn-default', $calc_type).attr('data-name');

            shiftBIRParams['CalcType'] = calcType;

            $('#shiftBIRReportTable').find('tbody').html('<tr class="loading"><td colspan="14">' + getI18n('10801') + '</td></tr>');
            $('.panel-hourlyBIR', $page).find('.highcharts-loading').css({ 'display': 'block', 'opacity': 1 });
            $('.chart-con', $panelReport).show();

            ajaxCall(URL.ShiftBIRReport, shiftBIRParams, function (_message) {
                console.log(_message);
                shiftBIR_report(_message.BIRList[calcName]);
            });
        }

        //销售损溢
        function shiftBIR_report(_dataList) {
            var $table = $('#shiftBIRReportTable');

            changeTitle();

            var table = $table.DataTable({
                'lengthChange': false,
                'searching': false,
                'paging': false,
                'dom': 'tr',
                'info': false,
                'ordering': false,
                'scrollY': 450,
                'scrollCollapse': true,
                'destroy': true,
                'data': _dataList,
                'createdRow': function (_row, _data, _dataIndex) {
                    var data = {
                        'OtShortName': _data.OtShortName,
                        'TankID': _data.TankID,
                        'OpenDateTime': _data.OpenDateTime,
                        'CloseDateTime': _data.CloseDateTime
                    }
                    data = JSON.stringify(data);
                    $(_row).attr('data-value', data);
                },
                'columns': [
                    {
                        'data': 'TankID',
                        'width': 60
                    },
                    {
                        'data': 'OtShortName',
                        'width': 60
                    },
                    {
                        'data': 'OpenDateTime',
                        'width': 180,
                        'render': function (_data, _type, _row, _meta) {
                            var api = new $.fn.dataTable.Api(_meta.settings),
                                $row = $(api.row(_meta.row).node());

                            if (_data == '0001-01-01 00:00:00') {
                                $row.attr('data-click', false);
                                return '';
                            } else {
                                var dateTime = _data.split(' ');
                                $row.attr('data-click', true);
                                return '<span class="date">' + dateTime[0] + '</span><span class="time">' + dateTime[1] + '</span>';
                            }
                        }
                    },
                    {
                        'data': 'CloseDateTime',
                        'width': 180,
                        'render': function (_data, _type, _row, _meta) {
                            if (_data == '0001-01-01 00:00:00') return '';
                            else {
                                var dateTime = _data.split(' ');
                                return '<span class="date">' + dateTime[0] + '</span><span class="time">' + dateTime[1] + '</span>';
                            }
                        }
                    },
                    {
                        'data': 'PreProbeInventory',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'Delivery',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'Sales',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'Adjustments',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'CloCalInventory',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'CloProbeInventory',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'CloWaterHeight',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return _data.toFixed(2);
                        }
                    },
                    {
                        'data': 'CloTemperature',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '--';
                            else return _data.toFixed(2);
                        }
                    },
                    {
                        'data': 'Variance',
                        'render': function (_data, _type, _row, _meta) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'render': function (_data, _type, _full) {
                            if (_full.Sales == '' || _full.Sales==0) {
                                return '0.00';
                            } else {
                                var ratio = (_full.Variance / _full.Sales) * 100;
                                return ratio.toFixed(2);
                            }
                        }
                    }
                ],
                'language': {
                    'emptyTable': getI18n('24901')
                }
            });

            if (_dataList.length == 0) {
                $('.panel-hourlyBIR', $page).hide();
            } else {
                $(table.row(0).node()).click();
            }
        }

        function changeTitle() {
            var $chartCon = $('.chart-con', $panelReport),
                $date = $('.date', $chartCon),
                beginDate = $('input[name=BeginDate]', $page).val().replace(/-/g, '.'),
                endDate = $('input[name=EndDate]', $page).val().replace(/-/g, '.');

            $('.subtitle', $chartCon).html($('#station-name').text());
            $date.html(beginDate + '—' + endDate);
        }

    })();

    //小时BIR
    (function () {
        var $panelBir = $('.panel-hourlyBIR', $page);

        //点击销售损溢联动
        $('#shiftBIRReportTable').find('tbody').on('click', 'tr', function () {
            if ($(this).attr('data-click') == 'true') {

                $(this).addClass('highlight').siblings('tr').removeClass('highlight');
                var calcType = $('a.btn-default', $calc_type).attr('data-type'),
                    calcName = $('a.btn-default', $calc_type).attr('data-name'),
                    row = JSON.parse($(this).attr('data-value')),
                    params = {
                        //'SessionID': SessionID,
                        'GsID': StationID,
                        'TankID': row.TankID,
                        'OpenDateTime': row.OpenDateTime,
                        'CloseDateTime': row.CloseDateTime,
                        'BIRType': $('#birType-list').find('.select-title').attr('data-value'),
                        'CalcType': calcType
                    };

                $panelBir.show();

                //图表
                var dataOptions = {
                    chart: {
                        renderTo: 'hourly-bir-chart',
                        type: 'line'
                    },
                    title: {
                        text: getI18n('24008'),
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
                        enabled: false
                    },
                    /*xAxis: {
                    categories: [],
                    tickInterval: 25
                    },*/
                    loading: {
                        showDuration: 1,
                        hideDuration: 1000,
                        style: {
                            position: 'absolute',
                            color: '#6b6b6b',
                            fontSize: '18px',
                            backgroundColor: 'white',
                            opacity: 1,
                            textAlign: 'center'
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        //minTickInterval: 24 * 3600 * 1000,
                        labels: {
                            formatter: function () {
                                return Highcharts.dateFormat('%Y-%m-%d %H:%M', this.value);
                            },
                            y: 25
                            //align: 'right',
                            //rotation: -30
                        }
                    },
                    yAxis: {
                        title: {
                            text: getI18n('10701') + getRelatedMeasure('Volume'),
                            align: 'high',
                            rotation: 0,
                            offset: -10,
                            y: -30,
                            style: {
                                color: '#333',
                                fontSize: '14px',
                                fontFamily: 'Microsoft YaHei'
                            }
                        }
                    },
                    tooltip: {
                        //valueDecimals: 2, //设置formatter后，valueDecimals不起作用
                        formatter: function () {
                            return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.key) + '<br/>' + '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ':' + this.y.toFixed(2);
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: getI18n('24008'),
                        data: []
                    }],
                    lang: {
                        loading: getI18n('10801'),
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
                chart.showLoading();
                $('.table-result', $panelBir).find('tbody').html('<tr class="loading"><td colspan="13">' + getI18n('10801') + '</td></tr>');

                ajaxCall(URL.HourlyBIR, params, function (_message) {
                    console.log(_message);
                    var birList = _message.BIRList[calcName],
                        dataList = [];

                    for (var index in birList) {
                        var temp = [],
                            tempDate = birList[index].Date.split(' '),
                            date = tempDate[0].split('-'),
                            time = tempDate[1].split(':');

                        temp.push(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]));
                        temp.push(birList[index].BalancingVariance);
                        dataList.push(temp);
                    }
                    chart.series[0].setData(dataList);
                    chart.hideLoading();

                    //表格
                    $('.subtitle', $panelBir).html(row.OtShortName);
                    $('.date', $panelBir).html(row.OpenDateTime.split(' ')[0].replace(/-/g, '.') + '—' + row.CloseDateTime.split(' ')[0].replace(/-/g, '.'));

                    var table = $('.table-result', $panelBir).DataTable({
                        'lengthChange': false,
                        'searching': false,
                        'paging': false,
                        'info': false,
                        'ordering': false,
                        'scrollY': 450,
                        'scrollCollapse': true,
                        'destroy': true,
                        'data': birList,
                        'columns': [
                            {
                                'data': 'TankID',
                                'width': 60
                            },
                            {
                                'data': 'Date',
                                'width': 180,
                                'render': function (_data, _type, _full) {
                                    var dateTime = _data.split(' ');

                                    return '<span class="date">' + dateTime[0] + '</span><span class="time">' + dateTime[1] + '</span>';
                                }
                            },
                            {
                                'data': 'OpenDateTime'
                            },
                            {
                                'data': 'CloseDateTime'
                            },
                            {
                                'data': 'PreProbeInventory',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'data': 'Delivery',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'data': 'Sales',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'data': 'CloProbeInventory',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'data': 'BalancingVariance',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'data': 'AccumulatedVariance',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'data': 'OriginalVariance',
                                'render': function (_data, _type, _full) {
                                    return Math.round(_data);
                                }
                            },
                            {
                                'render': function (_data, _type, _full) {
                                    if (_full.Sales == '' || _full.Sales == 0) {
                                        return '0.00';
                                    } else {
                                        var ratio = (_full.BalancingVariance / _full.Sales) * 100;
                                        return ratio.toFixed(2);
                                    }
                                }
                            },
                            {
                                'data': 'Remark'
                            }
                        ],
                        'language': {
                            'emptyTable': getI18n('24016')
                        }
                    });
                });
            }
        });
    })();
});