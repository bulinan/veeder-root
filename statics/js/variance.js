$(function () {

    var $page = $('body .variance'),
        cid = stateman.current.param['cid'];


    sessionCompanyName = sessionCompanyName || $('#company-name').text();
    //年份切换
    (function () {
        var $con = $('#tab-year', $page),
            date = new Date(),
            year = date.getFullYear(),
            lastYear = year - 1,
            beforeLastYear = year - 2,
            yearObj = {
                'year': year,
                'lastYear': lastYear,
                'beforeLastYear': beforeLastYear
            }

        $('[data-name]', $con).each(function () {
            var name = $(this).attr('data-name');

            if (name == 'year') $(this).text(getI18n('02001'));
            else $(this).text(yearObj[name] + getI18n('01004'));

            $(this).attr('data-year', yearObj[name]);
        });
        //判断url参数中是否有日期
        var urlDate = stateman.current.param['endDate'];

        if (urlDate) {
            var urlYear = urlDate.split('-')[0];
            $con.find('a[data-year="' + urlYear + '"]').addClass('active').siblings().removeClass('active');
        } else {
            $con.find('a[data-year="' + year + '"]').addClass('active').siblings().removeClass('active');
        }
    })();

    //第二栏
    (function () {
        var urlBeginDate = stateman.current.param['beginDate'],
            urlEndDate = stateman.current.param['endDate'],
            $box = $('#sub-commpany-variance', $page),
            beginDate, endDate;

        if (urlEndDate) {
            beginDate = urlBeginDate;
            endDate = urlEndDate;
        } else {
            var date = NameSpace.Date.fromNowToSixMonthsAgo();

            beginDate = date[0];
            endDate = date[1];
        }
        $('input[name=BeginDate]', $box).val(beginDate);
        $('input[name=EndDate]', $box).val(endDate);

    })();

    //公司总体损溢
    (function () {
        var $tab_year = $('#tab-year', $page),
            $inner_title_tab = $('.inner-title-tab', $page),
            $calc_type = $('.inner-options .btn-group', $page),
            $subbox = $('#sub-commpany-variance', $page),
            totalVarianceCache,
            productVariance,
            companyListTable,
            companyListChart,
            typeTitle,
            cType = $('a.active', $calc_type).attr('data-type'),
            data, subsetRatio, _displayText, _ratio,
            totalVarianceParams = {
                //"SessionID": SessionID,
                "CompanyID": cid,
                "VarianceType": "1,2,3",
                "CalcType": "Vt,V20",
                "CalcInterval": "Month"
            },
            commonVarianceParams = {
                //"SessionID": SessionID,
                "CompanyID": cid,
                "VarianceType": "1,2,3",
                "CalcType": "Vt,V20",
                "BeginDate": $('input[name=BeginDate]', $subbox).val(),
                "EndDate": $('input[name=EndDate]', $subbox).val()
            };

        init();
        //初始化
        function init() {
            var year = $('a.active', $tab_year).attr('data-year'),
                date = new Date(),
                curYear = date.getFullYear(),
                varianceType = $('a.active', $inner_title_tab).attr('data-name'),
                calcType = $('a.active', $calc_type).attr('data-name');

            totalVarianceParams['BeginDate'] = year + '-01-01';
            if (year == curYear) {
                totalVarianceParams['EndDate'] = NameSpace.Date.getCurDateTime('YYYY-mm-dd');
            } else {
                totalVarianceParams['EndDate'] = year + '-12-31';
            }


            //总体损溢api调用
            ajaxCall(URL.TotalVariance, totalVarianceParams, function (_message) {
                console.log(_message);
                totalVarianceCache = _message;
                getChart(calcType, varianceType, year);
                getTable(calcType, varianceType, year);
                $('.company-variance .block-loading').hide();
                subCompanyVarianceInit(calcType, varianceType);
            });
        }

        //时间切换 此时需要再次调用api
        $tab_year.on('click', 'a', function () {
            var year = $(this).attr('data-year'),
                date = new Date(),
                curYear = date.getFullYear(),
                varianceType = $('a.active', $inner_title_tab).attr('data-name'),
                calcType = $('a.active', $calc_type).attr('data-name');

            $(this).addClass('active').siblings().removeClass('active');
            $('.company-variance .block-loading').show();
            totalVarianceParams['BeginDate'] = year + '-01-01';
            if (year == curYear) {
                totalVarianceParams['EndDate'] = NameSpace.Date.getCurDateTime('YYYY-mm-dd');
            } else {
                totalVarianceParams['EndDate'] = year + '-12-31';
            }

            ajaxCall(URL.TotalVariance, totalVarianceParams, function (_message) {
                console.log(_message);
                totalVarianceCache = _message;
                getChart(calcType, varianceType, year);
                getTable(calcType, varianceType, year);
                $('.company-variance .block-loading').hide();
            });
        });

        //VarianceType切换
        $inner_title_tab.on('click', 'a', function () {
            var varianceType = $(this).attr('data-name'),
                year = $('a.active', $tab_year).attr('data-year'),
                calcType = $('a.active', $calc_type).attr('data-name');

            $(this).addClass('active').siblings().removeClass('active');
            getChart(calcType, varianceType, year);
            getTable(calcType, varianceType, year);
            //subCompanyVarianceInit(calcType, varianceType);
            //下属机构
            getProductVarianceTable(calcType, varianceType);
            getSubCompanyVarianceChart(calcType, varianceType, companyListTable);  //下属机构损益统计
            getSubCompanyVarianceTable(calcType, varianceType);  //下属机构损溢报表
        });

        //CalcType切换
        $calc_type.on('click', '.btn', function () {
            var calcType = $(this).attr('data-name'),
                year = $('a.active', $tab_year).attr('data-year'),
                varianceType = $('a.active', $inner_title_tab).attr('data-name');

            cType = $(this).attr('data-type');
            $(this).addClass('active').siblings().removeClass('active');
            getChart(calcType, varianceType, year);
            getTable(calcType, varianceType, year);
            //subCompanyVarianceInit(calcType, varianceType);
            //下属机构
            getProductVarianceTable(calcType, varianceType);
            getSubCompanyVarianceChart(calcType, varianceType, companyListTable);  //下属机构损益统计
            getSubCompanyVarianceTable(calcType, varianceType);  //下属机构损溢报表
        });

        //第二栏时间切换
        $subbox.on('click', '.btn', function () {
            var varianceType = $('a.active', $inner_title_tab).attr('data-name'),
                calcType = $('a.active', $calc_type).attr('data-name');

            //commonVarianceParams['BeginDate'] = $('input[name=BeginDate]', $subbox).val();
            //commonVarianceParams['EndDate'] = $('input[name=EndDate]', $subbox).val();
            commonVarianceParams = {
                //"SessionID": SessionID,
                "CompanyID": cid,
                "VarianceType": "1,2,3",
                "CalcType": "Vt,V20"
            };
            commonVarianceParams = NameSpace.String.getFormParams('#subcompany-query-form', commonVarianceParams);
            if (commonVarianceParams === false) {
                return false;
            }
            $('#sub-commpany-variance .block-loading').show();
            subCompanyVarianceInit(calcType, varianceType);
        });

        function subCompanyVarianceInit(_ctype, _vtype) {
            //各个油品损溢api调用
            ajaxCall(URL.ProductVariance, commonVarianceParams, function (_message) {
                console.log(_message);
                productVariance = _message;
                //getProductVarianceTable(_ctype, _vtype);

                //下属机构损溢损溢统计、报表共用一个api
                ajaxCall(URL.SubCompanyVarianceReport, commonVarianceParams, function (_message) {
                    console.log(_message);

                    var companyHtml = '<li data-value="">' + getI18n('10102') + '</li>';

                    companyListTable = _message.CompanyList;
                    for (var i in companyListTable) {
                        companyHtml = companyHtml + '<li data-value="' + companyListTable[i].CompanyID + '">' + companyListTable[i].CompanyName + '</li>';
                    }
                    $('#companyList').find('.select-con').html(companyHtml);

                    getProductVarianceTable(_ctype, _vtype); //为了实现加载中，挪下来
                    getSubCompanyVarianceChart(_ctype, _vtype, companyListTable);  //下属机构损益统计
                    getSubCompanyVarianceTable(_ctype, _vtype);  //下属机构损溢报表
                    $('#sub-commpany-variance .block-loading').hide();
                });
            });
        }

        //下属机构选择
        NameSpace.Select.select_subCompany_change = function (_element, _selector) {
            var id = _element.attr('data-value'),
                varianceType = $('a.active', $inner_title_tab).attr('data-name'),
                calcType = $('a.active', $calc_type).attr('data-name'),
                data = [];

            if (id == '') {
                data = companyListTable;
            } else {
                for (var i in companyListTable) {
                    if (companyListTable[i].CompanyID == id) {
                        data.push(companyListTable[i]);
                        break;
                    }
                }
            }

            getSubCompanyVarianceChart(calcType, varianceType, data);
        };

        //更新
        $('.update', $calc_type).on('click', function () {
            $('.company-variance .block-loading').show();
            $('#sub-commpany-variance .block-loading').show();
            init();
        });

        //总体损溢某个状态下的数据
        function getData(_ctype, _vtype) {
            data = totalVarianceCache.Variance[_ctype][_vtype];
            subsetRatio = totalVarianceCache.Variance[_ctype]['SubsetRatio'];
            _displayText = getTitle(subsetRatio, _vtype);
            _ratio = getRatio(subsetRatio, _vtype);

            //原始数据排序
            data.sort(function (a, b) {
                a.BeginDate = a.BeginDate.replace(/-/g, "/");
                b.BeginDate = b.BeginDate.replace(/-/g, "/");
                return Date.parse(a.BeginDate) - Date.parse(b.BeginDate);
            });
        }

        //损溢率走势图
        function getChart(_ctype, _vtype, _year) {
            var $ratioBox = $('.company-variance .panel-options', $page),
                dataOptions = {
                    chart: {
                        renderTo: 'variance-rate-bar',
                        type: 'column'
                    },
                    title: {
                        style: {
                            color: '#333',
                            fontSize: '24px',
                            fontFamily: 'Microsoft YaHei'
                        },
                        margin: 55
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
                                        daysOfCurMonth = new Date(year, month, 0).getDate();    //当月的天数

                                    $('input[name=BeginDate]', $subbox).val(year + '-' + NameSpace.Format.addFormat(month) + '-01');
                                    $('input[name=EndDate]', $subbox).val(year + '-' + NameSpace.Format.addFormat(month) + '-' + daysOfCurMonth);
                                    $('.btn', $subbox).trigger('click');
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
                            y: -50,
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
                };

            getData(_ctype, _vtype);
            $('span.text', $ratioBox).html(getI18n('02002') + $('a.active', $inner_title_tab).text() + getI18n('01007') + '<em>' + _ratio + '</em>');
            dataOptions.xAxis.categories = [];

            for (var index in totalVarianceCache.ProductList) {
                var temp_data = [];
                dataOptions.series[index] = {},
                dataOptions.series[index].data = [];
                dataOptions.series[index]['name'] = totalVarianceCache.ProductList[index].Name;

                if (data.length) {
                    for (var i in data) {
                        if (data[i].ProductID == totalVarianceCache.ProductList[index].ID) {
                            if (index == 0) dataOptions.xAxis.categories.push(data[i].BeginDate.split('/')[0] + '-' + data[i].BeginDate.split('/')[1]);
                            temp_data.push(parseFloat(data[i].Ratio));
                        }
                    }
                    dataOptions.series[index].data = temp_data;
                }
            }
            var title = {
                text: _displayText + getI18n('10104')
            },
                subtitle = {
                    text: '<h3>' + sessionCompanyName + '</h3><p>' + _year + getI18n('01004') + '</p>'
                };
            var chart = new Highcharts.Chart(dataOptions);
            chart.setTitle(title, subtitle);
        }

        //损溢率报表
        function getTable(_ctype, _vtype, _year) {
            var $chartCon = $('#variance-ratio-table', $page),
                dataList = [],
                length;

            getData(_ctype, _vtype);
            for (var index in totalVarianceCache.ProductList) {
                var temp = {},
                    key = 1;

                temp['ProductID'] = totalVarianceCache.ProductList[index].ID;
                temp['ProductName'] = totalVarianceCache.ProductList[index].Name;
                if (data.length) {
                    for (var i in data) {
                        if (data[i].ProductID == totalVarianceCache.ProductList[index].ID) {
                            temp[key] = {};
                            temp[key]['Ratio'] = data[i].Ratio;
                            temp[key]['Variance'] = data[i].Variance;
                            temp[key]['SalesOrDepot'] = data[i].SalesOrDepot;
                            key++;
                        }
                    }
                }
                length = key;
                dataList.push(temp);
            }

            $('.chart-heading .title', $chartCon).text(_displayText + getI18n('10111'));
            $('.chart-heading .subtitle', $chartCon).text(sessionCompanyName);

            //动态生成table
            var tableHtml = '<table class="table" width="100%"><tfoot class="tfoot"><tr><td>小计</td>'
            for (var i = 0; i < length; i++) {
                tableHtml = tableHtml + '<td></td>'
            }
            tableHtml = tableHtml + '</tr></tfoot></table>';
            $('.chart-body', $chartCon).html(tableHtml);

            var columns = [
                {
                    'data': 'ProductName',
                    'title': getI18n('10008'),
                    'className': 'first',
                    'width': 180
                },
                {
                    'data': '1',
                    'title': getI18n('02003'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '2',
                    'title': getI18n('02004'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '3',
                    'title': getI18n('02005'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '4',
                    'title': getI18n('02006'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '5',
                    'title': getI18n('02007'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '6',
                    'title': getI18n('02008'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '7',
                    'title': getI18n('02009'),
                    'render': function (_data, _type, _full) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '8',
                    'title': getI18n('02010'),
                    'render': function (_data, _type, _full, _meta) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '9',
                    'title': getI18n('02011'),
                    'render': function (_data, _type, _full, _meta) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '10',
                    'title': getI18n('02012'),
                    'render': function (_data, _type, _full, _meta) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '11',
                    'title': getI18n('02013'),
                    'render': function (_data, _type, _full, _meta) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                },
                {
                    'data': '12',
                    'title': getI18n('02014'),
                    'render': function (_data, _type, _full, _meta) {
                        return '<span data-variance="' + _data.Variance + '" data-sales="' + _data.SalesOrDepot + '">' + _data.Ratio + '</span>';
                    }
                }
            ],
            yearData = {
                'title': _year + getI18n('01004'),
                'className': 'last',
                'width': '120',
                'render': function (_data, _type, _full, _meta) {
                    var varianceSum = 0,
                        salesSum = 0,
                        ratio;

                    for (var i in _full) {
                        if (i == 'ProductID') break;
                        varianceSum = varianceSum + parseFloat(_full[i]['Variance']);
                        salesSum = salesSum + parseFloat(_full[i]['SalesOrDepot']);
                    }
                    if (salesSum == 0) {
                        ratio = 0;
                    } else {
                        ratio = (varianceSum / salesSum) * 100;
                    }
                    return ratio.toFixed(2) + '%';
                }
            };

            var newColumns = columns.slice(0, length);
            newColumns.push(yearData);

            var table = $('table', $chartCon).DataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false,
                'paging': false,
                'info': false,
                'ordering': false,
                'destroy': true,
                'data': dataList,
                'columns': newColumns,
                'language': {
                    'emptyTable': getI18n('13902')
                },
                'footerCallback': function (tfoot, data, start, end, display) {
                    var api = this.api();

                    for (var i = 1; i < length; i++) {
                        column_sum(i);
                    }
                    function column_sum(_column) {
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
                    }
                    $(api.column(length).footer()).addClass('sum').text(_ratio);
                }
            });
            table.draw();
        }

        //获取第二栏各个板块的头部信息
        function getCommonInfo() {
            var varianceText = $('a.active', $inner_title_tab).text(),
                calcText = $('a.active', $calc_type).attr('data-type'),
                length = arguments.length;

            if (length == 1) {
                var beginDate = $('input[name=BeginDate]', $subbox).val().replace(/-/g, "."),
                    endDate = $('input[name=EndDate]', $subbox).val().replace(/-/g, "."),
                    _dom = arguments[0];

                $('.chart-heading .subtitle', _dom).text(sessionCompanyName);
                $('.chart-heading .date', _dom).text(beginDate.slice(0, -3) + '—' + endDate.slice(0, -3));
            }
            typeTitle = varianceText + calcText;
        }

        //各油品损溢统计
        function getProductVarianceTable(_ctype, _vtype) {
            var $chartCon = $('#product-variance-table', $page);

            getCommonInfo($chartCon);
            $('.chart-heading .title', $chartCon).text(getI18n('13023') + _displayText + getI18n('10106'));

            var _dataList = productVariance[_ctype][_vtype];
            $('table', $chartCon).hide();
            if (_vtype == 'OperationVariance' || _vtype == 'SalesVariance') {
                $('table', $chartCon).eq(0).show().dataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': _dataList,
                    'columns': [
                        {
                            'data': 'ProductID',
                            'width': 80,
                            'render': function (_data, _type, _full) {
                                return getProductName(_data);
                            }
                        },
                        {
                            'data': 'StartInventory',
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
                            'data': 'EndInventory',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Adjustment',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VtVolume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'V20Volume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Variance',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VarianceRatio',
                            'render': function (_data, _type, _full) {
                                return _data.toFixed(2);
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('13903')
                    },
                    'footerCallback': function (tfoot, data, start, end, display) {
                        var api = this.api();

                        for (var i = 1; i <= 7; i++) {
                            column_sum(i);
                        }
                        function column_sum(_column) {
                            $(api.column(_column).footer()).html(api.column(_column, { page: 'current' }).data().reduce(function (a, b) {
                                return Math.round(parseFloat(a) + parseFloat(b));
                            }, 0));
                        }

                        var variance = cType == 'Vt' ? $(api.column(5).footer()).text() : $(api.column(6).footer()).text(),
                            ratio = ($(api.column(7).footer()).text() / variance) * 100;

                        ratio = ratio.toFixed(2);
                        $(api.column(8).footer()).text(ratio);
                    }
                });
            } else {
                $('table', $chartCon).eq(1).show().dataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': _dataList,
                    'columns': [
                        {
                            'data': 'ProductID',
                            'width': 80,
                            'render': function (_data, _type, _full) {
                                return getProductName(_data);
                            }
                        },
                        {
                            'data': 'DepotVolume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'RcvVolume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Variance',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VarianceRatio',
                            'render': function (_data, _type, _full) {
                                return _data.toFixed(2);
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('13903')
                    },
                    'footerCallback': function (tfoot, data, start, end, display) {
                        var api = this.api();

                        for (var i = 1; i <= 3; i++) {
                            column_sum(i);
                        }
                        function column_sum(_column) {
                            $(api.column(_column).footer()).html(api.column(_column, { page: 'current' }).data().reduce(function (a, b) {
                                return (parseFloat(a) + parseFloat(b)).toFixed(2);
                            }, 0));
                        }

                        var variance = $(api.column(1).footer()).text(),
                            ratio = ($(api.column(3).footer()).text() / variance) * 100;

                        ratio = ratio.toFixed(2);
                        $(api.column(4).footer()).text(ratio);
                    }
                });
            }
        }

        //下属机构损溢统计
        function getSubCompanyVarianceChart(_ctype, _vtype, _companyListTable) {
            var dataOptions = {
                chart: {
                    renderTo: 'variance-subcompany-bar',
                    type: 'column'
                },
                title: {
                    style: {
                        color: '#333',
                        fontSize: '24px',
                        fontFamily: 'Microsoft YaHei'
                    },
                    margin: 55
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
                        y: -50,
                        style: {
                            color: '#333',
                            fontSize: '14px',
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        events: {
                            click: function (event) {
                                var name = event.point.category.name,
                                    data = JSON.parse($(name).attr('data-msg')),
                                    beginDate = $('input[name=BeginDate]', $subbox).val(),
                                    endDate = $('input[name=EndDate]', $subbox).val();

                                if (data.OrgType === 1) {  //油站
                                    top.location.href = '#/Station/ShiftBIRReport?sid=' + data.CompanyID + '&beginDate=' + beginDate + '&endDate=' + endDate;
                                } else if (data.OrgType === 2) { //公司
                                    top.location.href = '#/VarianceIndex?cid=' + data.CompanyID + '&beginDate=' + beginDate + '&endDate=' + endDate;
                                }
                            }
                        }
                    }
                },
                series: [
                    {
                        name: getI18n('10905'),
                        data: []
                    }
                ],
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
                subCompanyID = $('#companyList').find('.select-title').attr('data-value'),
                subCompanyName;

            dataOptions.xAxis.categories = [];
            for (var i in _companyListTable) {
                var data = _companyListTable[i][_ctype][_vtype],
                    companyData = {
                        'CompanyID': _companyListTable[i].CompanyID,
                        'CompanyName': _companyListTable[i].CompanyName,
                        'OrgType': _companyListTable[i].OrgType
                    }
                companyData = JSON.stringify(companyData);

                //data
                if (_vtype == 'OperationVariance' || _vtype == 'SalesVariance') {
                    var sumVolume = 0,
                        sumVariance = 0,
                        ratio;
                    for (var j in data) {
                        var temp = cType == 'Vt' ? data[j].VtVolume : data[j].V20Volume;
                        sumVolume = sumVolume + temp;
                        sumVariance = sumVariance + data[j].Variance;
                    }
                    if (sumVolume == 0) ratio = 0;
                    else ratio = (sumVariance / sumVolume) * 100;

                    ratio = NameSpace.Number.keepTwoDecimal(ratio);
                    //横坐标，公司
                    dataOptions.xAxis.categories.push('<span data-msg=\'' + companyData + '\'>' + _companyListTable[i].CompanyName + '</span>');
                    dataOptions.series[0].data.push(ratio);
                } else {
                    var sumVariance = 0,
                        sumDepotVolume = 0,
                        ratio;

                    if (data.length) {
                        for (var j in data) {
                            sumVariance = sumVariance + data[j].Variance;
                            sumDepotVolume = sumDepotVolume + data[j].DepotVolume;
                        }
                        ratio = (sumVariance / sumDepotVolume) * 100;
                        ratio = NameSpace.Number.keepTwoDecimal(ratio);
                        //横坐标，公司
                        //dataOptions.xAxis.categories.push(_companyListTable[i].CompanyName);
                        dataOptions.xAxis.categories.push('<span data-msg=\'' + companyData + '\'>' + _companyListTable[i].CompanyName + '</span>');
                    } else {
                        //ratio = 0;
                        continue;
                    }
                    dataOptions.series[0].data.push(ratio);
                }
            }
            getCommonInfo();
            if (subCompanyID == '') subCompanyName = sessionCompanyName;
            else subCompanyName = $('#companyList').find('.select-title').text();

            var beginDate = $('input[name=BeginDate]', $subbox).val().replace(/-/g, "."),
                endDate = $('input[name=EndDate]', $subbox).val().replace(/-/g, "."),
                title = {
                    text: getI18n('10107') + _displayText + getI18n('10106')
                },
                subtitle = {
                    text: '<h3>' + subCompanyName + '</h3><p>' + beginDate.slice(0, -3) + '—' + endDate.slice(0, -3) + '</p>'
                };
            console.log(dataOptions.series);
            var chart = new Highcharts.Chart(dataOptions);
            chart.setTitle(title, subtitle);
        }

        //下属机构损溢报表
        function getSubCompanyVarianceTable(_ctype, _vtype) {
            var $chartCon = $('#sub-company-table', $page),
                dataList = [];

            getCommonInfo($chartCon);
            $('.chart-heading .title', $chartCon).text(getI18n('10107') + _displayText + getI18n('10111'));
            for (var i in companyListTable) {
                var data = companyListTable[i][_ctype][_vtype];

                for (var j in data) {
                    var temp = {};

                    temp = data[j];
                    temp['CompanyID'] = companyListTable[i]['CompanyID'];
                    temp['CompanyName'] = companyListTable[i]['CompanyName'];
                    dataList.push(temp);
                }
            }
            $('table', $chartCon).hide();
            if (_vtype == 'OperationVariance' || _vtype == 'SalesVariance') {
                var $table = $('table', $chartCon).eq(0);

                $table.show().dataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': dataList,
                    'createdRow': function (_row, _data, _dataIndex) {
                        $(_row).attr('data-id', _data.CompanyID);
                    },
                    'drawCallback': function (settings) {
                        var api = this.api();

                        var rows = api.rows({
                            page: 'current'
                        }).nodes();
                        var last = null;

                        api.column(0, {
                            page: 'current'
                        }).data().each(function (group, i) {
                            if (last !== group) {
                                var data = api.row(i, { page: 'current' }).data(),
                                    bool = false;

                                if (i == 0) bool = true;
                                $(rows).eq(i).before('<tr class="tfoot" data-id="' + data.CompanyID + '" data-open="' + bool + '"><td><a href="javascript:;"><strong>' + group + '</strong><i class="fa fa-angle-down"></i></a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');

                                last = group;
                            }
                        });
                    },
                    'initComplete': function (settings, json) {
                        var $box = $table,
                            api = this.api();

                        $('.tfoot', $box).each(function () {
                            var isOpen = $(this).attr('data-open'),
                                id = $(this).attr('data-id');

                            if (isOpen == 'true') {
                                $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
                                $(this).siblings('tr[data-id=' + id + ']').show();
                            } else {
                                $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
                                $(this).siblings('tr[data-id=' + id + ']').hide();
                            }
                        });
                        $('.tfoot a', $box).on('click', function () {
                            var $tr = $(this).closest('tr'),
                                $i = $(this).find('i'),
                                id = $tr.attr('data-id'),
                                isOpen = $tr.attr('data-open');

                            $i.removeClass('fa-angle-up fa-angle-down');
                            if (isOpen == 'false') {
                                $i.addClass('fa-angle-up');
                                $tr.siblings('tr[data-id=' + id + ']').slideDown(200);
                                $tr.attr('data-open', true);
                            } else {
                                $i.addClass('fa-angle-down');
                                $tr.siblings('tr[data-id=' + id + ']').slideUp(200);
                                $tr.attr('data-open', false);
                            }
                        });
                        for (var index in companyListTable) {
                            var $group = $('tr.tfoot[data-id=' + companyListTable[index].CompanyID + ']', $table).eq(0);

                            for (var i = 1; i <= 7; i++) {
                                var data = 0;
                                $('tr[data-id=' + companyListTable[index].CompanyID + ']', $table).each(function () {
                                    data = data + Number($(this).find('td').eq(i).text());
                                });
                                $group.find('td').eq(i).text(Math.round(data));
                            }
                            var sales = cType == 'Vt' ? $group.find('td').eq(5).text() : $group.find('td').eq(6).text(),
                                variance = $group.find('td').eq(7).text(),
                                ratio;

                            if (parseFloat(sales) == 0) ratio = 0;
                            else ratio = (variance / sales) * 100;

                            ratio = ratio.toFixed(2);
                            $group.find('td').eq(8).text(ratio);
                        }
                    },
                    'columns': [
                        {
                            'data': 'CompanyName',
                            'visible': false
                        },
                        {
                            'data': 'ProductID',
                            'width': 250,
                            'render': function (_data, _type, _full) {
                                return getProductName(_data);
                            }
                        },
                        {
                            'data': 'StartInventory',
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
                            'data': 'EndInventory',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Adjustment',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VtVolume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'V20Volume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Variance',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VarianceRatio',
                            'render': function (_data, _type, _full) {
                                return _data.toFixed(2);
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('13904')
                    }
                });
            } else {
                var $table = $('table', $chartCon).eq(1);

                $table.show().dataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': dataList,
                    'createdRow': function (_row, _data, _dataIndex) {
                        $(_row).attr('data-id', _data.CompanyID);
                    },
                    'drawCallback': function (settings) {
                        var api = this.api();

                        var rows = api.rows({
                            page: 'current'
                        }).nodes();
                        var last = null;

                        api.column(0, {
                            page: 'current'
                        }).data().each(function (group, i) {
                            if (last !== group) {
                                var data = api.row(i, { page: 'current' }).data(),
                                    bool = false;

                                if (i == 0) bool = true;
                                $(rows).eq(i).before('<tr class="tfoot" data-id="' + data.CompanyID + '" data-open="' + bool + '"><td><a href="javascript:;"><strong>' + group + '</strong><i class="fa fa-angle-down"></i></a></td><td></td><td></td><td></td><td></td></tr>');

                                last = group;
                            }
                        });
                    },
                    'initComplete': function (settings, json) {
                        var $box = $table,
                            api = this.api();

                        $('.tfoot', $box).each(function () {
                            var isOpen = $(this).attr('data-open'),
                                id = $(this).attr('data-id');

                            if (isOpen == 'true') {
                                $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
                                $(this).siblings('tr[data-id=' + id + ']').show();
                            } else {
                                $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
                                $(this).siblings('tr[data-id=' + id + ']').hide();
                            }
                        });
                        $('.tfoot a', $box).on('click', function () {
                            var $tr = $(this).closest('tr'),
                                $i = $(this).find('i'),
                                id = $tr.attr('data-id'),
                                isOpen = $tr.attr('data-open');

                            $i.removeClass('fa-angle-up fa-angle-down');
                            if (isOpen == 'false') {
                                $i.addClass('fa-angle-up');
                                $tr.siblings('tr[data-id=' + id + ']').slideDown(200);
                                $tr.attr('data-open', true);
                            } else {
                                $i.addClass('fa-angle-down');
                                $tr.siblings('tr[data-id=' + id + ']').slideUp(200);
                                $tr.attr('data-open', false);
                            }
                        });
                        for (var index in companyListTable) {
                            var $group = $('tr.tfoot[data-id=' + companyListTable[index].CompanyID + ']', $table).eq(0);

                            for (var i = 1; i <= 3; i++) {
                                var data = 0;
                                $('tr[data-id=' + companyListTable[index].CompanyID + ']', $table).each(function () {
                                    data = data + Number($(this).find('td').eq(i).text());
                                });
                                $group.find('td').eq(i).text(Math.round(data));
                            }
                            var depot = $group.find('td').eq(1).text(),
                                variance = $group.find('td').eq(3).text(),
                                ratio;

                            if (parseFloat(depot) == 0) ratio = 0;
                            else ratio = (variance / depot) * 100;

                            ratio = ratio.toFixed(2);
                            $group.find('td').eq(4).text(ratio);
                        }

                    },
                    'columns': [
                        {
                            'data': 'CompanyName',
                            'visible': false
                        },
                        {
                            'data': 'ProductID',
                            'width': 250,
                            'render': function (_data, _type, _full) {
                                return getProductName(_data);
                            }
                        },
                        {
                            'data': 'DepotVolume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'RcvVolume',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'Variance',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'VarianceRatio',
                            'render': function (_data, _type, _full) {
                                return _data.toFixed(2);
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('13904')
                    }
                });
            }

        }

        function getTitle(_data, _vtype) {
            for (var i in _data) {
                if (_data[i].Identify == _vtype) return _data[i].DisplayText;
            }
        }

        function getRatio(_data, _vtype) {
            for (var i in _data) {
                if (_data[i].Identify == _vtype) return _data[i].Ratio;
            }
        }

        function getProductName(_id) {
            for (var i in SessionProductList) {
                if (SessionProductList[i].ProductID == _id) {
                    return SessionProductList[i].DisplayName;
                }
            }
        }
    })();
});