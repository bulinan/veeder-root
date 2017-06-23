$(function () {
    console.log(stateman);
    var sessionCid = stateman.current.param['cid'],
        VarMonthCount = $.cookie('CompanyDashboardVarMonthCount'),
        varianceDataList,
        inventorySummaryList;

    //报警
    (function () {
        var $box = $('.panel-warning'),
            params = {
                //'SessionID': SessionID,
                'LastRequestTime': NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'),
                'CompanyID': sessionCid
            };

        //初始化
        initWarning();

        //更新
        $('.panel-options .update', $box).on('click', function () {
            $('.block-loading', $box).show();
            initWarning();
        });

        function initWarning() {
            ajaxCall(URL.AlarmSummary, params, function (_message) {
                var levelHtml = '',
                    typeHtml = '';

                console.log(_message);
                $('.count .inner', $box).html('<a href="#/Alarm?cid=' + sessionCid + '&alarmState=0" target="_blank">' + _message.AlarmCount + '</a><p>' + getI18n('11006') + '</p>');

                for (var index = 0; index < _message.AlarmLevels.length; index++) {
                    levelHtml = levelHtml + '<a href="#/Alarm?cid=' + sessionCid + '&alarmLevel=' + _message.AlarmLevels[index].ID + '&alarmState=0" target="_blank"><span>' + _message.AlarmLevels[index].Count + '</span><p>' + _message.AlarmLevels[index].Display + '</p></a>';
                }
                for (var index = 0; index < _message.AlarmTypes.length; index++) {
                    typeHtml = typeHtml + '<a href="#/Alarm?cid=' + sessionCid + '&alarmType=' + _message.AlarmTypes[index].ID + '&alarmState=0" target="_blank"><span>' + _message.AlarmTypes[index].Count + '</span><p>' + _message.AlarmTypes[index].Display + '</p></a>';
                    $('.list-type a', $box).eq(index).find('span').text();
                }
                $('.list-level', $box).html(levelHtml);
                $('.list-type', $box).html(typeHtml);
                $('.block-loading', $box).hide();
            });
        }
    })();

    //本月损益率排行
    (function () {
        var $panel = $('.panel-profit-ranking'),
            params = {
                //'SessionID': SessionID,
                'CompanyID': sessionCid,
                "CalcInterval": "Month",
                'CalcType': 'Vt/V20'
            }

        //初始化
        initVarianceRank();

        //更新
        $('.panel-options .update', $panel).on('click', function () {
            $('table', $panel).each(function () {
                $(this).find('tbody').show().html('<tr class="loading"><td colspan="6">' + getI18n('10801') + '</td></tr>');
            });
            initVarianceRank();
        });

        function initVarianceRank() {
            ajaxCall(URL.VarianceRank, params, function (_message) {
                console.log(_message);
                var varianceList;
                $('.panel-profit-ranking table').each(function () {
                    var $table = $(this);

                    if ($table.hasClass('table-vt')) varianceList = _message.Variance.VtVarianceList;
                    else if ($table.hasClass('table-v20')) varianceList = _message.Variance.V20VarianceList;

                    var table = $table.DataTable({
                        'paging': false,
                        'info': false,
                        'searching': false,
                        'order': [],
                        'destroy': true,
                        'data': varianceList,
                        'columns': [
                            {
                                'width': '10%',
                                'orderable': false,
                                'render': function (_data, _type, _full) {
                                    return '';
                                }
                            },
                            {
                                'data': 'CompanyName',
                                'width': '25%',
                                'orderable': false
                            },
                            {
                                'data': 'SalesVariance'
                            },
                            {
                                'data': 'DeliveryVariance'
                            },
                            {
                                'data': 'OperationVariance'
                            },
                            {
                                'width': '10%',
                                'orderable': false,
                                'render': function (_data, _type, _full) {
                                    return '';
                                }
                            }
                        ],
                        'fnInitComplete': function () {
                            var vtHtml = $('table.table-vt tbody').html(),
                                v20Html = $('table.table-v20 tbody').html();

                            //初始化
                            if ($table.attr('data-open') == 'false') {
                                $table.find('tbody').hide();
                                $table.find('thead .fa').removeClass('fa-minus').addClass('fa-plus');
                            } else {
                                $table.find('tbody').show();
                                $table.find('thead .fa').removeClass('fa-plus').addClass('fa-minus');
                            }
                            /*$table.delegate('.fa-plus', 'click', function () {
                            if ($(this).hasClass('vt')) {
                            $('#table-v20').removeClass('table-fold').find('tbody').hide();
                            $('#table-vt tbody').slideDown(500);
                            } else {
                            $('#table-vt tbody').hide();
                            $('#table-v20').addClass('table-fold').find('tbody').slideDown(500);
                            }
                            $('.panel-profit-ranking .fa-minus').removeClass('fa-minus').addClass('fa-plus');
                            $(this).removeClass('fa-plus').addClass('fa-minus');
                            });*/
                            $table.delegate('.fa-plus', 'click', function () {
                                $table.find('tbody').slideDown(500);
                                $(this).removeClass('fa-plus').addClass('fa-minus');
                            });
                            $table.delegate('.fa-minus', 'click', function () {
                                $table.find('tbody').hide();
                                $(this).removeClass('fa-minus').addClass('fa-plus');
                            });
                        },
                        'language': {
                            'emptyTable': getI18n('11902')
                        }
                    });
                    table.on('order.dt', function () {
                        table.column(0, {
                            search: 'applied',
                            order: 'applied'
                        }).nodes().each(function (cell, i) {
                            cell.innerHTML = i + 1;
                        });
                    }).draw();
                });
            });
        }
    })();

    //报警排行
    (function () {
        var $panel = $('.panel-warning-ranking'),
            params = {
                //'SessionID': SessionID,
                'CompanyID': sessionCid
            };

        //初始化
        initAlarmTank();

        //更新
        $('.panel-options .update', $panel).on('click', function () {
            $('table', $panel).find('tbody').show().html('<tr class="loading"><td colspan="6">' + getI18n('10801') + '</td></tr>');
            initAlarmTank();
        });

        function initAlarmTank() {
            ajaxCall(URL.AlarmRank, params, function (_message) {
                console.log(_message);
                var $table = $('table', $panel),
                    theadHtml = '<tr><th class="first"></th><th></th>';

                //动态生成表头
                for (var i in _message.AlarmLevelList) {
                    theadHtml = theadHtml + '<th><span data-level="' + _message.AlarmLevelList[i].AlarmLevelId + '">' + _message.AlarmLevelList[i].DisplayName + '</span></th>'
                }
                theadHtml = theadHtml + '</th>';
                $('thead', $table).html(theadHtml);

                //动态生成列
                var tableColumns = [
                    {
                        'width': '10%',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            return '';
                        }
                    },
                    {
                        'data': 'CompanyName',
                        'width': '25%',
                        'orderable': false
                    }
                ],
                tempColumn = {
                    'data': function (row, type, set, meta) {
                        var api = new $.fn.dataTable.Api(meta.settings),
                            levelId = $(api.column(meta.col).header()).find('span').attr('data-level');

                        for (var i in row.AlarmLevelCount) {
                            if (row.AlarmLevelCount[i].AlarmLevelId == levelId) return row.AlarmLevelCount[i].AlarmCount;
                        }
                        return '0';
                    }
                },
                alarmLevelLength = _message.AlarmLevelList.length;
                for (var index = 0; index < alarmLevelLength; index++) {
                    tableColumns.push(tempColumn);
                }
                var table = $table.DataTable({
                    'paging': false, //paging
                    'info': false,
                    'searching': false, //searching
                    'order': [],
                    'destroy': true,
                    'data': _message.AlarmList,
                    'columns': tableColumns,
                    'language': {
                        'emptyTable': getI18n('11903')
                    }
                });

                table.on('order.dt', function () {
                    table.column(0, {
                        search: 'applied',
                        order: 'applied'
                    }).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                }).draw();
            });
        }
    })();

    //下属机构损益
    (function () {
        //date select
        var $box = $('.panel-subprofit'),
            $typeBut = $('.panel-options', $box),
            $tabTitle = $('.tab-title', $box),
            date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            currentDate = year + '-' + format(month);

        $('.block-loading', $box).show();

        //月份列表
        $('.select_subdate .select-title', $typeBut).attr('data-value', currentDate).find('span').text(currentDate);
        for (var index = VarMonthCount; index >= 1; index--) { //index=6
            var temp_date = year + '-' + format(month);
            $('.select_subdate  .select-con', $typeBut).append('<li data-value="' + temp_date + '">' + temp_date + '</li>');
            month--;
            if (month == 0) {
                year = year - 1;
                month = 12;
            }
        }
        function format(_month) {
            return _month < 10 ? '0' + _month : _month;
        }
        var dateArray = NameSpace.Date.fromNowToSomeMonthsAgo(VarMonthCount),
            daysOfCurMonth = new Date(dateArray[0], NameSpace.Format.offFormat(dateArray[1]), 0).getDate(),
            params = {
                //"SessionID": SessionID,
                "CompanyID": sessionCid,
                "VarianceType": "1,2,3",
                "CalcType": "Vt,V20",
                "CalcInterval": "Month",
                "BeginDate": dateArray[0],
                "EndDate": dateArray[1]
            },
            dataOptions = {
                chart: {
                    renderTo: 'subprofit-bar-chart',
                    type: 'column'
                },
                title: {
                    style: {
                        color: '#6b6b6b',
                        fontSize: '24px',
                        fontFamily: 'Microsoft YaHei'
                    },
                    margin: 50
                },
                subtitle: {
                    align: 'center',
                    useHTML: true,
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
                plotOptions: {
                    column: {
                        cursor: 'pointer',
                        events: {
                            click: function (event) {
                                var name = event.point.category.name,
                                    data = JSON.parse($(name).attr('data-msg')),
                                    dateStr = $('.select_subdate .select-title', $typeBut).attr('data-value'),
                                    date = new Date(dateStr),
                                    year = date.getFullYear(),
                                    month = date.getMonth() + 1,
                                    daysOfCurMonth = new Date(year, month, 0).getDate(),
                                    beginDate = year + '-' + NameSpace.Format.addFormat(month) + '-01',
                                    endDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + daysOfCurMonth;

                                if (data.OrgType === 1) {  //油站
                                    top.location.href = '#/Station/ShiftBIRReport?sid=' + data.CompanyID + '&beginDate=' + beginDate + '&endDate=' + endDate;
                                } else if (data.OrgType === 2) { //公司
                                    top.location.href = '#/VarianceIndex?cid=' + data.CompanyID + '&beginDate=' + beginDate + '&endDate=' + endDate;
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    categories: [],
                    labels: {
                        useHTML: true
                    }
                },
                yAxis: {
                    title: {
                        text: '（%）',
                        useHTML: true,
                        align: 'high',
                        rotation: 0,
                        offset: 0,
                        y: -30,
                        style: {
                            color: '#333',
                            fontSize: '14px',
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                },
                tooltip: {
                    valueDecimals: 2
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

        //初始化
        initSubCompanyVariance();

        //更新
        $('.panel-options .update', $box).on('click', function () {
            $('.block-loading', $box).show();
            initSubCompanyVariance();
        });

        function initSubCompanyVariance() {
            //调取数据
            ajaxCall(URL.SubCompanyVariance, params, function (_message) {
                var companyHtml = '<li data-value="">' + getI18n('10102') + '</li>';
                subCompanyVarianceCache = _message;
                console.log(subCompanyVarianceCache);

                /*------------panel heading start------------------------*/

                //subcompany select
                for (var index in _message.CompanyList) {
                    companyHtml = companyHtml + '<li data-value="' + _message.CompanyList[index].CompanyID + '">' + _message.CompanyList[index].CompanyName + '</li>';
                }
                $('.select_subcompany  .select-con', $box).html(companyHtml);

                /*------------panel heading end------------------------*/

                //初始化
                var ctype = $('a.text-active', $typeBut).attr('data-type'),
                    companyID = $('.select_subcompany .select-title', $typeBut).attr('data-value'),
                    selectedDate = $('.select_subdate .select-title', $typeBut).attr('data-value');

                if (subCompanyVarianceCache.CompanyList.length) {
                    tabTitle(subCompanyVarianceCache.CompanyList[0][ctype].SubsetRatio, function () {
                        var vtype = $('a.active', $tabTitle).attr('data-type'),
                            title = $('a.active', $tabTitle).find('p').text();

                        data_call(ctype, vtype, selectedDate, companyID, title);
                    });
                } else {
                    $tabTitle.hide();
                    data_call('', '', selectedDate, companyID, '');
                }

            });
        }

        function tabTitle(_vSubsetRatio, _callback) {
            for (var index = 0; index < _vSubsetRatio.length; index++) {
                $('a', $tabTitle).eq(index).attr('data-type', _vSubsetRatio[index].Identify).find('p').text(_vSubsetRatio[index].DisplayText);
            }
            _callback();
        }
        //下属结构选择
        function filterData(_id, _date) {
            var ctype = $('a.text-active', $typeBut).attr('data-type'),
                vtype = $('a.active', $tabTitle).attr('data-type'),
                title = $('a.active', $tabTitle).find('p').text();

            data_call(ctype, vtype, _date, _id, title);
        }

        //下属机构选择
        NameSpace.Select.select_subcompany = function (_element, _selector) {
            var id = _element.attr('data-value'),
                date = $('.select_subdate .select-title', $typeBut).attr('data-value');

            filterData(id, date);
        };

        //日期选择
        NameSpace.Select.select_subdate = function (_element, _selector) {
            var date = _element.attr('data-value'),
                id = $('.select_subcompany .select-title', $typeBut).attr('data-value');

            filterData(id, date);
        };

        $('a.text', $typeBut).on('click', function () {
            var ctype = $(this).attr('data-type');

            $(this).addClass('text-active').siblings('.text').removeClass('text-active');
            $('a', $tabTitle).eq(0).addClass('active').siblings().removeClass('active');

            tabTitle(subCompanyVarianceCache.CompanyList[0][ctype].SubsetRatio, function () {
                var vtype = $('a.active', $tabTitle).attr('data-type'),
                    title = $('a.active', $tabTitle).find('p').text(),
                    date = $('.select_subdate .select-title', $typeBut).attr('data-value'),
                    company = $('.select_subcompany .select-title', $typeBut).attr('data-value');

                data_call(ctype, vtype, date, company, title);
            });

        });

        $tabTitle.on('click', 'a', function () {
            var vtype = $(this).attr('data-type'),
                title = $(this).find('p').text(),
                ctype = $('a.text-active', $typeBut).attr('data-type'),
                date = $('.select_subdate .select-title', $typeBut).attr('data-value'),
                company = $('.select_subcompany .select-title', $typeBut).attr('data-value');

            $(this).addClass('active').siblings().removeClass('active');
            data_call(ctype, vtype, date, company, title);
        });

        function data_call(_ctype, _vtype, _date, _id, _title) {
            var companyList = subCompanyVarianceCache.CompanyList,
                productList = subCompanyVarianceCache.ProductList,
                oldDate = _date.split('-'),
                newDate = oldDate[0] + '.' + oldDate[1],
                color = ['#edab41', '#e3f79b', '#a2d200'],
                title = {
                    text: ''
                },
                subCompanyName;

            title.text = _title + getI18n('10104');
            dataOptions.xAxis.categories = []; //清空X轴坐标
            if (_id == '') {
                subCompanyName = sessionCompanyName ? sessionCompanyName : $('#company-name').text();
                for (var i in companyList) {
                    var companyData = {
                        'CompanyID': companyList[i].CompanyID,
                        'CompanyName': companyList[i].CompanyName,
                        'OrgType': companyList[i].OrgType
                    }
                    companyData = JSON.stringify(companyData);
                    dataOptions.xAxis.categories.push('<span data-msg=\'' + companyData + '\'>' + companyList[i].CompanyName + '</span>');
                }
            } else {
                subCompanyName = $('.select_subcompany .select-title', $typeBut).text();
                for (var i in companyList) {
                    if (companyList[i].CompanyID == arguments[3]) {
                        var companyData = {
                            'CompanyID': companyList[i].CompanyID,
                            'CompanyName': companyList[i].CompanyName,
                            'OrgType': companyList[i].OrgType
                        }
                        companyData = JSON.stringify(companyData);
                        dataOptions.xAxis.categories.push('<span data-msg=\'' + companyData + '\'>' + companyList[i].CompanyName + '</span>');
                    }
                }
            }

            var subtitle = {
                text: '<h3>' + subCompanyName + '</h3><p>' + newDate + '</p>'
            };
            for (var index in productList) {
                var seriesData = [];

                dataOptions.series[index] = {},
                dataOptions.series[index].data = [];
                dataOptions.series[index]['name'] = productList[index].Name;
                dataOptions.series[index]['color'] = color[index];
                for (var i in companyList) {
                    var dataElement;
                    if (_id == '') {
                        dataElement = data(companyList[i][_ctype][_vtype], productList[index].ID);
                        seriesData.push(dataElement);
                    } else {
                        if (companyList[i].CompanyID == arguments[3]) {
                            dataElement = data(companyList[i][_ctype][_vtype], productList[index].ID);
                            seriesData.push(dataElement);
                            break;
                        }
                    }
                }
                dataOptions.series[index].data = seriesData;
            }
            function data(_data, _id) {
                var temp;
                for (var j in _data) {
                    var dateArray = _data[j].BeginDate.split('-'),
                        year = dateArray[0],
                        month = dateArray[1],
                        date = year + '-' + month;

                    if (_data[j].ProductID == _id) {
                        if (date == _date) temp = parseFloat(_data[j].Ratio); //dataOptions.series[index].data.push(Number(_data[j].Variance));
                    }
                }
                return temp;
            }
            if ($('#subprofit-bar-chart').length) {
                var chart = new Highcharts.Chart(dataOptions);
                chart.setTitle(title, subtitle, true);
                $('#subprofit-bar-chart').data('api',chart);
            }
            $('.block-loading', $box).hide();
        }
    })();

    //配送
    (function () {
        var $box = $('.panel-distribution'),
            params = {
                //"SessionID": SessionID,
                "CompanyID": sessionCid
            };

        //初始化
        initDeliverySummary();

        //更新
        $('.panel-options .update', $box).on('click', function () {
            $('.block-loading', $box).show();
            initDeliverySummary();
        });

        function initDeliverySummary() {
            ajaxCall(URL.DeliverySummary, params, function (_message) {
                console.log(_message);
                var data = [_message.TodayPlanned, _message.TodayFinished, _message.TodayInProgress, _message.UnfinishedToday, _message.MonthPlanned, _message.MonthErrorDelivery, _message.YesterdayPlannedVolume, _message.YesterdayDeliveredVolume, _message.TodayPlannedVolume, _message.TodayDeliveredVolume],
                index = 0,
                $tr = $box.find('table tr');

                for (var i = 0; i < $tr.length; i++) {
                    var $td = $tr.eq(i).find('td');
                    for (var j = 0; j < $td.length - 1; j++) {
                        if (j == 0) $tr.eq(i).find('td').eq(j).find('em').text(Math.round(data[index]));
                        else $tr.eq(i).find('td').eq(j).find('span').text(Math.round(data[index]));
                        index++;
                    }
                }
                $('.block-loading', $box).hide();
            });
        }
    })();

    //设备
    (function () {
        var $box = $('.panel-equipment'),
            params = {
                //"SessionID": SessionID,
                "CompanyID": sessionCid
            };

        //初始化
        initDeviceSummary();

        //更新
        $('.panel-options .update', $box).on('click', function () {
            $('.block-loading', $box).show();
            initDeviceSummary();
        });

        function initDeviceSummary() {
            ajaxCall(URL.DeviceSummary, params, function (_message) {
                console.log(_message);
                var data = [_message.TotalStation, _message.OnlineStation, _message.CalibrateTank, _message.DataCollecting, _message.NewCharts, _message.Accepted, _message.LeakDetectTank, _message.ReportedTank],
                index = 0,
                $tr = $box.find('table tr');

                for (var i = 0; i < $tr.length; i++) {
                    var $td = $tr.eq(i).find('td');
                    for (var j = 0; j < $td.length - 1; j++) {
                        if (j == 0) $tr.eq(i).find('td').eq(j).find('em').text(data[index]);
                        else $tr.eq(i).find('td').eq(j).find('span').text(data[index]);
                        index++;
                    }
                }
                $('.block-loading', $box).hide();
            });
        }

    })();

    //损益
    (function () {
        var $box = $('.panel-profit'),
            $typeBut = $('.panel-options', $box),
            $tabTitle = $('.tab-title', $box),
            dateArray = NameSpace.Date.fromNowToSomeMonthsAgo(VarMonthCount),
            dataOptions = {
                chart: {
                    renderTo: 'profit-bar-chart',
                    type: 'column'
                },
                title: {
                    style: {
                        color: '#6b6b6b',
                        fontSize: '24px',
                        fontFamily: 'Microsoft YaHei'
                    },
                    margin: 50
                },
                subtitle: {
                    align: 'center',
                    useHTML: true,
                    style: {
                        color: '#a1a1a1',
                        fontSize: '14px',
                        fontFamily: 'Microsoft YaHei'
                    },
                    y: 40
                },
                plotOptions: {
                    column: {
                        cursor: 'pointer',
                        events: {
                            click: function (event) {
                                var date = new Date(event.point.category.name),
                                    year = date.getFullYear(),
                                    month = date.getMonth() + 1,
                                    daysOfCurMonth = new Date(year, month, 0).getDate(),
                                    beginDate = year + '-' + NameSpace.Format.addFormat(month) + '-01',
                                    endDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + daysOfCurMonth;

                                top.location.href = '#/VarianceIndex?cid=' + sessionCid + '&beginDate=' + beginDate + '&endDate=' + endDate;
                            }
                        }
                    }
                },
                xAxis: {
                    categories: []
                },
                yAxis: {
                    title: {
                        text: '（%）',
                        useHTML: true,
                        align: 'high',
                        rotation: 0,
                        offset: 0,
                        y: -30,
                        style: {
                            color: '#333',
                            fontSize: '14px',
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                },
                tooltip: {
                    valueDecimals: 2
                },
                credits: {
                    enabled: false
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    backgroundColor: '#fff'
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
            dataLineOptions = {
                chart: {
                    renderTo: 'profit-line-chart',
                    type: 'line'
                },
                title: {
                    style: {
                        color: '#333',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        fontFamily: 'Microsoft YaHei'
                    },
                    align: 'left',
                    margin: 45
                },
                xAxis: {
                    categories: []
                },
                yAxis: {
                    title: {
                        text: '（%）',
                        align: 'high',
                        rotation: 0,
                        offset: 0,
                        y: -30,
                        style: {
                            color: '#333',
                            fontSize: '14px',
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                },
                tooltip: {
                    valueDecimals: 2
                },
                credits: {
                    enabled: false
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    backgroundColor: '#fff'
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
            params = {
                //"SessionID": SessionID,
                "CompanyID": sessionCid,
                "VarianceType": "1,2,3",
                "CalcType": "Vt,V20",
                "CalcInterval": "Month",
                "BeginDate": dateArray[0],
                "EndDate": dateArray[1]
            };

        //初始化
        initTotalVariance(false);
        //更新
        $('.panel-options .update', $box).on('click', function () {
            $('.block-loading', $box).show();
            initTotalVariance(true);
        });

        function initTotalVariance(_isUpdate) {
            ajaxCall(URL.TotalVariance, params, function (_message) {
                totalVarianceCache = _message;
                varianceDataList = _message.Variance;
                console.log(_message);

                //初始化
                var ctype = $('a.text-active', $typeBut).attr('data-type'),
                    vtSubsetRatio = totalVarianceCache.Variance[ctype].SubsetRatio; //init tab-title

                tabTitle(vtSubsetRatio, function () {
                    var vtype = $('a.active', $tabTitle).attr('data-type'),
                        title = $('a.active', $tabTitle).find('p').text();

                    data_call(ctype, vtype, title);
                });

                //损溢加载完后加载库存
                //indexInventoryInit(_message[ctype]);
                if (!_isUpdate) indexInventoryInit(false);
            });
        }

        //填充title
        function tabTitle(_vtSubsetRatio, _callback) {
            for (var index = 0; index < _vtSubsetRatio.length; index++) {
                var $a = $('.tab-title a', $box).eq(index);

                $a.attr('data-type', _vtSubsetRatio[index].Identify);
                $a.find('p').text(_vtSubsetRatio[index].DisplayText);
            }
            _callback();
        }

        //VT、V20切换
        $('a.text', $typeBut).on('click', function () {
            var ctype = $(this).attr('data-type');

            $(this).addClass('text-active').siblings('.text').removeClass('text-active');
            $('a', $tabTitle).eq(0).addClass('active').siblings().removeClass('active');

            tabTitle(totalVarianceCache.Variance[ctype].SubsetRatio, function () {
                var vtype = $('a.active', $tabTitle).attr('data-type'),
                    title = $('a.active', $tabTitle).find('p').text();

                data_call(ctype, vtype, title);
            });
        });

        //损溢率种类切换
        $box.find('.tab-title a').on('click', function () {
            var vtype = $(this).attr('data-type'),
                ctype = $('a.text-active', $typeBut).attr('data-type'),
                title = $(this).find('p').text();

            $(this).addClass('active').siblings().removeClass('active');
            data_call(ctype, vtype, title);
        });

        function data_call(_ctype, _vtype, _title) {
            var color = ['#edab41', '#e3f79b', '#a2d200'],  //定义每个产品的颜色，插件提供自带的
                title = {
                    text: _title + getI18n('10104')
                },
                lineChartTitle = {
                    text: _title
                },
                xarr = [],
                temp_categories = [],
                data = totalVarianceCache.Variance[_ctype][_vtype];

            //原始数据排序
            data.sort(function (a, b) {
                return Date.parse(a.BeginDate) - Date.parse(b.BeginDate);
            });
            dataLineOptions.series = [];
            for (var index in totalVarianceCache.ProductList) {
                var temp_data = [];

                //柱状图
                dataOptions.series[index] = {},
                dataOptions.series[index].data = [];
                dataOptions.series[index]['name'] = totalVarianceCache.ProductList[index].Name;
                dataOptions.series[index]['color'] = color[index];

                //折线
                dataLineOptions.series[index] = {},
                dataLineOptions.series[index].data = [];
                dataLineOptions.series[index]['name'] = totalVarianceCache.ProductList[index].Name;

                if (data.length) {
                    for (var i in data) {
                        if (data[i].ProductID == totalVarianceCache.ProductList[index].ID) {
                            if (index == 0) temp_categories.push(data[i].BeginDate.split('-')[0] + '-' + data[i].BeginDate.split('-')[1]);
                            temp_data.push(parseFloat(data[i].Ratio));
                        }
                    }
                    dataOptions.series[index].data = temp_data;
                    dataLineOptions.series[index].data = temp_data;
                }
            }
            //每个月的数据
            var sumRatio = [];
            for (var i in temp_categories) {
                var varianceData = [],
                    salesData = [],
                    ratio,
                    varianceSum = 0,
                    salesSum = 0;

                for (var j in data) {
                    if (data[j].BeginDate.slice(0, -3) == temp_categories[i]) {
                        //varianceData.push(data[j].Variance);
                        varianceSum = varianceSum + Number(data[j].Variance);
                        //salesData.push(data[j].SalesOrDepot);
                        salesSum = salesSum + Number(data[j].SalesOrDepot);
                    }
                }
                /*
                var varianceSum = varianceData.reduce(function (a, b) {
                return parseFloat(a) + parseFloat(b);
                });*/
                console.log(varianceSum);

                /*var salesSum = salesData.reduce(function (a, b) {
                return parseFloat(a) + parseFloat(b);
                });*/
                console.log(salesSum);
                if (salesSum == 0) {
                    ratio = 0;
                } else {
                    ratio = (varianceSum / salesSum) * 100;
                }
                sumRatio.push(NameSpace.Number.keepTwoDecimal(ratio));
            }
            dataLineOptions.series.push({ name: getI18n('10702'), data: sumRatio });
            /*------------------------end--------------------------------------*/

            temp_categories.sort(function (a, b) {
                return Date.parse(a) - Date.parse(b);
            });
            dataOptions.xAxis.categories = temp_categories;
            dataLineOptions.xAxis.categories = temp_categories;
            sessionCompanyName = sessionCompanyName || $('#company-name').text();

            var lastDate = dateArray[0].split('-'),
                curDate = dateArray[1].split('-'),
                timeInterval = lastDate[0] + '.' + lastDate[1] + '-' + curDate[0] + '.' + curDate[1],
                subtitle = {
                    text: '<h3>' + sessionCompanyName + '</h3><p>' + timeInterval + '</p>'
                };

            if ($('#profit-bar-chart').length) {
                var chart = new Highcharts.Chart(dataOptions);
                chart.setTitle(title, subtitle, true);
                $('#profit-bar-chart').data('api',chart);
            }
            if ($('#profit-line-chart').length) {
                var lineChart = new Highcharts.Chart(dataLineOptions);
                lineChart.setTitle(lineChartTitle);
                $('#profit-line-chart').data('api',lineChart);
            }
            $('.block-loading', $box).hide();
        }
    })();

    //库存
    (function () {
        var $panel = $('.panel-inventory');

        //更新
        $('.panel-options .update', $panel).on('click', function () {
            $('.block-loading', $panel).show();
            indexInventoryInit(true);
        });

    })();

    //总览
    (function () {
        var $panel = $('.panel-overview');

        //更新
        $('.panel-options .update', $panel).on('click', function () {
            $('.block-loading', $panel).show();
            var dateArray = NameSpace.Date.getCurrentMonth(),
                varianceParams = {
                    //"SessionID": SessionID,
                    "CompanyID": sessionCid,
                    "VarianceType": "1,2,3",
                    "CalcType": "Vt,V20",
                    "CalcInterval": "Month",
                    "BeginDate": dateArray[0],
                    "EndDate": dateArray[1]
                },
                inventoryParams = {
                    //"SessionID": SessionID,
                    "CompanyID": sessionCid,
                    "BeginDate": dateArray[0],
                    "EndDate": dateArray[1],
                    "CalcType": "Vt,V20"
                };
            ajaxCall(URL.TotalVariance, varianceParams, function (_message) {
                varianceDataList = _message.Variance;
                ajaxCall(URL.InventorySummary, inventoryParams, function (_message) {
                    inventorySummaryList = _message;
                    indexOverView();
                });
            });
        });
    })();

    //库存初始化
    function indexInventoryInit(_isUpdate) {
        var date = NameSpace.Date.getCurrentMonth(),
            summaryList,
            inventoryList,
            params = {
                //"SessionID": SessionID,
                "CompanyID": sessionCid,
                "BeginDate": date[0],
                "EndDate": date[1],
                "CalcType": "Vt,V20"
            };

        ajaxCall(URL.InventorySummary, params, function (_message) {
            console.log(_message);
            summaryList = _message;
            inventorySummaryList = _message;
            var productList = indexInventorySummary(summaryList);

            //库存明细
            var dateArray = NameSpace.Date.get30DaysFromNow(),
                params01 = {
                    //"SessionID": SessionID,
                    "CompanyID": sessionCid,
                    "BeginDate": dateArray[0],
                    "EndDate": dateArray[1],
                    "CalcType": "Vt,V20"
                }
            ajaxCall(URL.Inventory, params01, function (_message) {
                console.log(_message);
                inventoryList = _message
                indexInventory(inventoryList, productList);

                //损溢和库存加载完后再加载总览
                if (!_isUpdate) indexOverView(); //总览初始化
            });
        });

        //总览VT、V20切换
        var $panelOverview = $('.panel-overview'),
            $typeBut1 = $('.panel-options', $panelOverview);

        $('a.text', $typeBut1).on('click', function () {
            var ctype = $(this).attr('data-type');

            $(this).addClass('text-active').siblings('.text').removeClass('text-active');
            indexOverView();
        });

        //库存VT、V20切换
        var $panelInventory = $('.panel-inventory'),
            $typeBut2 = $('.panel-options', $panelInventory);

        $('a.text', $typeBut2).on('click', function () {
            var ctype = $(this).attr('data-type');

            $(this).addClass('text-active').siblings('.text').removeClass('text-active');
            var productList = indexInventorySummary(summaryList);
            indexInventory(inventoryList, productList);
        });
    }

    //库存摘要
    function indexInventorySummary(_summary) {
        var $box = $('.panel-inventory'),
            $stock = $('.stock-title', $box),
            $totalInventory = $stock.find('.totalInventory'),
            $totalUllage = $stock.find('.totalUllage'),
            $typeBut = $('.panel-options', $box),
            cType = $('a.text-active', $typeBut).attr('data-type'),
            summaryType;

        if (cType == 'VT') {
            summaryType = 'VtInventory';
        } else if (cType == 'V20') {
            summaryType = 'V20Inventory';
        }

        var summaryList = _summary[summaryType],
            productList = summaryList.ProductList,
            inventoryHtml = '',
            ullageHtml = '';

        $('.select-title span:not([data-i18n])', $totalInventory).text(Math.round(summaryList.TotalInventory));
        $('.select-title span:not([data-i18n])', $totalUllage).text(Math.round(summaryList.TotalUllage));

        for (var index in productList) {
            inventoryHtml = inventoryHtml + '<li><a href="javascript:;">' + productList[index].Name + '(' + Math.round(productList[index].Inventory) + getRelatedMeasure('Volume', false) + ')</a></li>';
            ullageHtml = ullageHtml + '<li><a href="javascript:;">' + productList[index].Name + '(' + Math.round(productList[index].Ullage) + getRelatedMeasure('Volume', false) + ')</a></li>';
        }
        $totalInventory.find('.select-con').html(inventoryHtml);
        $totalUllage.find('.select-con').html(ullageHtml);
        return productList;
    }

    //库存明细
    function indexInventory(_inventory, _productList) {
        var $box = $('.panel-inventory'),
            $typeBut = $('.panel-options', $box),
            cType = $('a.text-active', $typeBut).attr('data-type'),
            inventoryType,
            dataOptions = {
                chart: {
                    renderTo: 'inventory-chart',
                    type: 'spline'
                },
                title: {
                    text: getI18n('10103'),
                    useHTML: true,
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
            };

        if (cType == 'VT') {
            inventoryType = 'VtInventoryList';
        } else if (cType == 'V20') {
            inventoryType = 'V20InventoryList';
        }

        var color = ['#edab41', '#e3f79b', '#a2d200'],
            data = _inventory[inventoryType],
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
        //dataOptions.subtitle.text = sessionCompanyName || $('#company-name').text();
        sessionCompanyName = sessionCompanyName || $('#company-name').text();
        var subTitle = {
            text: sessionCompanyName
        }
        if ($('#inventory-chart').length) {
            var chart = new Highcharts.Chart(dataOptions);

            chart.setTitle(null, subTitle, true);
            $('#inventory-chart').data('api',chart);
        }
        $('.block-loading', $box).hide();
    }

    //总览
    function indexOverView() {
        var $box = $('.panel-overview'),
            $stock = $('.stock-title', $box),
            $totalInventory = $stock.find('.totalInventory'),
            $totalSales = $stock.find('.totalSales'),
            $typeBut = $('.panel-options', $box),
            cType = $('a.text-active', $typeBut).attr('data-type'),
            curDate = new Date(),
            curMonth = NameSpace.Format.addFormat(curDate.getMonth() + 1),
            overViewData = [],
            inventoryHtml = '',
            salesHtml = '',
            inventoryType,
            varianceType,
            _dataList = inventorySummaryList;

        if (cType == 'VT') {
            inventoryType = 'VtInventory';
            varianceType = 'VtVariance';
        } else if (cType == 'V20') {
            inventoryType = 'V20Inventory';
            varianceType = 'V20Variance';
        }

        var productList = _dataList[inventoryType].ProductList;

        _varianceData = varianceDataList[varianceType];
        $('.select-title span:not([data-i18n])', $totalInventory).text(Math.round(_dataList[inventoryType].TotalInventory));
        $('.select-title span:not([data-i18n])', $totalSales).text(Math.round(_dataList[inventoryType].TotalSales));

        for (var index in productList) {

            inventoryHtml = inventoryHtml + '<li><a href="javascript:;">' + productList[index].Name + '(' + Math.round(productList[index].Inventory) + getRelatedMeasure('Volume', false) + ')</a></li>';
            salesHtml = salesHtml + '<li><a href="javascript:;">' + productList[index].Name + '(' + Math.round(productList[index].Sales) + getRelatedMeasure('Volume', false) + ')</a></li>';

            //总览表格
            var temp = {};
            temp['Name'] = productList[index].Name;
            temp['Sales'] = productList[index].Sales;
            temp['Inventory'] = productList[index].Inventory;
            for (var i in _varianceData.OperationVariance) {
                var ele_date = _varianceData.OperationVariance[i].BeginDate.split('-');
                if (ele_date[1] == curMonth && _varianceData.OperationVariance[i].ProductID == productList[index].ID) {
                    temp['OperationVariance'] = {};
                    temp['OperationVariance']['Ratio'] = _varianceData.OperationVariance[i].Ratio;
                    temp['OperationVariance']['Variance'] = _varianceData.OperationVariance[i].Variance;
                    temp['OperationVariance']['SalesOrDepot'] = _varianceData.OperationVariance[i].SalesOrDepot;
                }
            }
            for (var i in _varianceData.SalesVariance) {
                var ele_date = _varianceData.SalesVariance[i].BeginDate.split('-');
                if (ele_date[1] == curMonth && _varianceData.SalesVariance[i].ProductID == productList[index].ID) {
                    temp['SalesVariance'] = {};
                    temp['SalesVariance']['Ratio'] = _varianceData.SalesVariance[i].Ratio;
                    temp['SalesVariance']['Variance'] = _varianceData.SalesVariance[i].Variance;
                    temp['SalesVariance']['SalesOrDepot'] = _varianceData.SalesVariance[i].SalesOrDepot;
                }
            }
            for (var i in _varianceData.DeliveryVariance) {
                var ele_date = _varianceData.DeliveryVariance[i].BeginDate.split('-');
                if (ele_date[1] == curMonth && _varianceData.DeliveryVariance[i].ProductID == productList[index].ID) {
                    temp['DeliveryVariance'] = {};
                    temp['DeliveryVariance']['Ratio'] = _varianceData.DeliveryVariance[i].Ratio;
                    temp['DeliveryVariance']['Variance'] = _varianceData.DeliveryVariance[i].Variance;
                    temp['DeliveryVariance']['SalesOrDepot'] = _varianceData.DeliveryVariance[i].SalesOrDepot;
                }
            }
            overViewData.push(temp);
        }
        $totalInventory.find('.select-con').html(inventoryHtml);
        $totalSales.find('.select-con').html(salesHtml);

        $('#index-overview-table').dataTable({
            'lengthChange': false,
            'searching': false,
            'paging': false,
            'info': false,
            'ordering': false,
            'destroy': true,
            'data': overViewData,
            'columns': [
                {
                    'data': 'Name',
                    'width': 80
                },
                {
                    'data': 'Sales',
                    'render': function (_data, _type, _full) {
                        return Math.round(_data);
                    }
                },
                {
                    'data': 'Inventory',
                    'render': function (_data, _type, _full) {
                        return Math.round(_data);
                    }
                },
                {
                    'data': 'OperationVariance',
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': 'SalesVariance',
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': 'DeliveryVariance',
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                }
            ],
            'language': {
                'emptyTable': getI18n('11901')
            },
            'footerCallback': function (tfoot, data, start, end, display) {
                var api = this.api(),
                    $con = $box.find('.operationRatio');

                for (var i = 1; i < 6; i++) {
                    if (i < 3) column_sum1(i);
                    else column_sum2(i);
                }

                function column_sum1(_column) {
                    var sum = api.column(_column, { page: 'current' }).data().reduce(function (a, b) {
                        return a + b;
                    }, 0);
                    $(api.column(_column).footer()).html(Math.round(sum));
                }

                function column_sum2(_column) {
                    var nodes = api.column(_column, { page: 'current' }).nodes(),
                        varianceSum = 0,
                        salesSum = 0,
                        ratio;

                    $(nodes).each(function () {
                        var $span = $(this).find('span');
                        varianceSum = varianceSum + parseFloat($span.attr('data-variance'));
                        salesSum = salesSum + parseFloat($span.attr('data-sales'));
                    });
                    if (salesSum == 0) {
                        ratio = 0;
                    } else {
                        ratio = (varianceSum / salesSum) * 100;
                    }
                    $(api.column(_column).footer()).html(ratio.toFixed(2) + '%');

                    if (_column == 3) {
                        var operationHtml = '';
                        $('.select-title span', $con).text(ratio.toFixed(2) + '%');
                        for (var i in overViewData) {
                            operationHtml = operationHtml + '<li><a href="javascript:;">' + overViewData[i].Name + '(' + overViewData[i].OperationVariance.Ratio + ')</a></li>';
                        }
                        $con.find('.select-con').html(operationHtml);
                    }
                }
            }
        });
        $('.block-loading', $box).hide();
    }
});

