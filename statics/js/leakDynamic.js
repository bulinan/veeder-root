/*
    测漏管理
*/
var StationID = stateman.current.param['sid'];

$(function () {

    //初始化状态
    (function () {
        $('#stop-dynamic-leak').hide();
        $('#open-dynamic-leak').hide();
        $("#dynamic-leak-chart-panel").hide();

        getTankListStatus($('#dynamic-tank-list'));

        $('#stop-dynamic-leak').on('click', function () {
            openOrStopTankClick(URL.StopCSLDLeakTest)
        });

        $('#open-dynamic-leak').on('click', function () {
            openOrStopTankClick(URL.StartCSLDLeakTest);
        });
    })();

    //开启停止测漏
    function openOrStopTankClick(urlLink) {
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID
        }
        params = NameSpace.String.getFormParams('#dynamic-start-leak-form', params);

        var paramsTime = new Date(params["StartDate"].replace("-", "/").replace("-", "/"));
        if (paramsTime < new Date()) {
            params["StartDate"] = NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss');
        }

        if (params === false) {
            return false;
        }
        ajaxCall(urlLink, params, function (_message) {
            //openOrStopTankCallback(_message);
            alert(_message.Description);
            if (_message.Result != 'Failure') {
                var $modal = $('.leak-tab-dynamic .modal-leak');
                modal_hide($modal, function () {
                    $('#leak-query').trigger('click');
                });
            }
        });
    }

});

//油罐列表html
function tank_list_html(_data, _box) {
    tankHtml = ''
    for (var i in _data) {
        tankHtml = tankHtml + '<li data-value=' + _data[i].TankID + ' data-state=' + _data[i].EnableFlag + '>' + _data[i].TankID + '</li>';
    }
    _box.find('.select-con').html(tankHtml);
    NameSpace.Select.firstSelected(_box);

}

// 侧漏管理查询
function leakDynamicSearchBtn() {
    $('#dynamic-leak-chart-panel .block-loading').show();

    var params = {
        //"SessionID": SessionID,
        "StationID": StationID,
        "PageInfo": {}
    }

    params = NameSpace.String.getFormParams('#leak-management-query', params);
    if (params === false) {
        return false
    }
    $('.leak-tab-dynamic .record-box').show();
    var pagelen = $('.leak-tab-dynamic .record-box input[type=hidden]').val();

    if (pagelen == '') pagelen = 10; //把需要默认显示的记录数写在这就可以了
    else pagelen = parseInt(pagelen);

    $('.leak-tab-dynamic .record-box input[type=hidden]').val(pagelen); //添加这句代码

    var $table = $('body').find('#dynamicLeakQueryTable');
    $table.show().find('tbody').html('');
    $table.dataTable({
        'lengthMenu': [10, 20, 50, 75, 100],
        'searching': false, //searching
        'pagingType': 'full_numbers',
        'pageLength': pagelen,
        'dom': 'lfrt<"dataTables_bottom"pi>',
        'order': [],
        'destroy': true,
        'sAjaxSource': URL.SelectCSLDReport,
        'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
            var table = $(this);
            //params['tankIdList'] = arrTankIdList.join(',');
            ajaxCall(sSource, params, function (_message) {
                console.log(_message);
                fnCallback(format(_message));
            });
        },
        'createdRow': function (_row, _data, _dataIndex) {
            var data = JSON.stringify(_data);
            $(_row).attr('data-value', data);
        },
        'columns': [
            {
                'data': 'TankId',
                'width': '70px'
            },
             {
                 'data': 'LeakTestType'
             },
             {
                 'data': 'LeakTestMethod'
             },
             {
                 'data': 'EvaluationTime',
                 'width': '13%',
                 'render': function (_data, _type, _full, _meta) {
                     if (_data == "0001-01-01 00:00:00") return 'N/A';
                     else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1].slice(0,-3) + '</span>';
                 }
             },
             {
                 'data': 'Status'
             },
             {
                 'data': 'CompensatedLeakRate',
                 'render': function (_data, _type, _full) {
                     if (_data === null) return '';
                     else return Number(_data).toFixed(2);
                 }
             },
             {
                 'data': 'TestHours'
             }

        ],
        'language': {
            'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
            'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
            'loadingRecords': getI18n('10801'),
            'infoEmpty': getI18n('10802'),
            'emptyTable': getI18n('26901'),
            'paginate': {
                'first': '<i class="fa fa-angle-double-left"></i>',
                'last': '<i class="fa fa-angle-double-right"></i>',
                'previous': '<i class="fa fa-angle-left"></i>',
                'next': '<i class="fa fa-angle-right"></i>'
            }
        },
        'initComplete': function (settings, json) {
            //$(this.api().table().container()).find('.dataTables_info,.dataTables_paginate').show();

            $(this.api().table().container()).find('.dataTables_bottom').slideDown();
        }
    });
    function format(_data, _total) {
        var chartData = $.parseJSON(_data.CSLDReport).CSLDLeakRateReportDatas;
        if (chartData != null && chartData.length != 0) {
            $("#dynamic-leak-chart-panel").show();
            dynamic_leak_chart_data(chartData);
        }
        else {
            $("#dynamic-leak-chart-panel").hide();
            $('#dynamic-leak-chart-panel .block-loading').hide();
        }
        return {
            recordsTotal: _total,
            recordsFiltered: _total,
            data: $.parseJSON(_data.CSLDReport).CSLDRateTestTableDatas
        };
    }
}

//开启测漏基础数据Modal
function modalLeakDynamicBtn() {
    datetimePicketerReset();

    var $modal = $('.leak-tab-dynamic .modal-leak');

    modal_show($modal);


    NameSpace.Select.select_tankLeakMethod = function (_element, _selector) {
        var tankId = _element.attr('data-value');
        var tankState = _element.attr('data-state');
        tankStateToShowBtn(tankState);
    }

    getTankListStatus($('#dynamic-TankList'));

    function datetimePicketerReset() {
        var lang = $.cookie('language');
        var lan = "zh-cn";
        if (lang == "English") {
            lan = 'en';
        }
        $('#model-date-time-picker').unbind("focus");
        $('body').on('focus', '#model-date-time-picker', function () {
            WdatePicker({
                autoPickDate: false,
                lang: lan,
                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                minDate: '%y-%M-%d %H:#{%m-3}:%s',
                hmsMenuCfg: {
                    H: [1, 6],
                    m: [1, 10],
                    s: [1, 6]
                }
            });
        });

        $("#model-date-time-picker").val(NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'));
    }
}

//得到动态测漏每个罐的状态
function getTankListStatus(_tankBox) {
    var params = {
        //"SessionID": SessionID,
        "StationID": StationID
    }

    ajaxCall(URL.SelectCSLDState, params, function (_message) {
        if (_message.Result == 'Success') {
            var CSLDState = jQuery.parseJSON(_message.CSLDState);
            tank_list_html(CSLDState, _tankBox);//$('#dynamic-tank-list')

            if (CSLDState != null && CSLDState.length > 0) {
                tankStateToShowBtn(CSLDState[0].EnableFlag);
            }
        }
        else {
            alert(_message.Description);
        }
    });

}

//开启Modal--按钮状态
function tankStateToShowBtn(tankState) {
    $("dynamic-msg-tip").html("");
    if (parseInt(tankState) === 1) {
        $('#stop-dynamic-leak').show();
        $('#open-dynamic-leak').hide();
        $('#dynamic-modal-date-box').hide();
    }
    else {
        $('#stop-dynamic-leak').hide();
        $('#open-dynamic-leak').show();
        $('#dynamic-modal-date-box').show();
    }
    if (parseInt(tankState) === 0) {
        $(".dynamic-msg-tip").html(getI18n('26035'));
    }
    else {
        $(".dynamic-msg-tip").html("");
    }
}

//折线图
function dynamic_leak_chart_data(chartData) {
    $('#dynamic-leak-chart-panel .block-loading').show();
    var dataOptions = {
        title: {
            text: getI18n('26028'),
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
            type: 'datetime',
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%y-%m-%d %H:%M', this.value);
                },
                rotation: -45
            },
            tickColor: '#FF0000',
            tickWidth: 1,
            tickLength: 10
        },
        yAxis: {
            title: {
                text: getI18n('26029')
            }
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
        tooltip: {
            formatter: function () {
                //return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.key) + '<br/>' + '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ':' + this.y.toFixed(2);
                return Highcharts.dateFormat('%Y-%m-%d %H:%M', this.key) + '<br/>' + '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ':' + this.y.toFixed(2);
            }
        },
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
    }
    if (chartData != null && chartData.length > 0) {
        dataSeriesDeal(chartData[0].CompensatedLeakRates, 'scatter', getI18n('26030'));
        dataSeriesDeal(chartData[0].FourteenPerAvgs, 'line', getI18n('26032'));
        dataSeriesDeal(chartData[0].SevenPerAvgs, 'line', getI18n('26031'));
    }

    $('#dynamic-leak-chart-panel .block-loading').hide();
    $('#dynamic-leak-test-chart').highcharts(dataOptions);
    //处理chart中的数据格式
    function dataSeriesDeal(dataPointArr, type, name) {
        var tempObjArr = [];
        $.each(dataPointArr, function (index, item) {
            if (item === null) {
                tempObjArr.push(item);
            }
            else {
                tempObjArr.push([dataConvertUTC(item.Item2), item.Item1]);
                //tempObjArr.push([item.Item2, item.Item1]);
            }
        });
        dataOptions.series.push({
            type: type,
            name: name,
            data: tempObjArr
        });
    }
    //横坐标数据显示时间需要UTC格式-处理横坐标数据格式
    function dataConvertUTC(strDate) {
        var myDate = new Date(strDate.replace(/-/gm, '/'));
        var dateUTC = Date.UTC(myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), myDate.getHours(), myDate.getMinutes(), myDate.getSeconds());
        return dateUTC;
    }
}
