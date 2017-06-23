/*
    罐表管理
*/
$(function () {
    var StationID = stateman.current.param['sid'],
        chartTypeList;

    //油罐概览
    (function () {
        tankChartSummary();
    })();

    function tankChartSummary() {
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID
        }
        ajaxCall(URL.TankChartSummary, params, function (_message) {
            console.log(_message);

            var tankHtml = '';
            for (var index in _message.TankList) {
                tankHtml = tankHtml + '<li data-value=' + _message.TankList[index].TankID + '>' + _message.TankList[index].DisplayName + '</li>';
            }
            $('#tank-list').find('.select-con').html(tankHtml);
            NameSpace.Select.firstSelected($('#tank-list'));

            $('#tankChart-summary').dataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false,
                'paging': false,
                'info': false,
                'ordering': false,
                'destroy': true,
                'data': _message.TankChartList,
                'createdRow': function (_row, _data, _dataIndex) {
                    _data = JSON.stringify(_data);
                    $(_row).attr('data-value', _data);
                },
                'columns': [
                    {
                        'data': 'TankId'
                    },
                    {
                        'data': 'OilName'
                    },
                    {
                        'data': 'TankChartTypeDesc'
                    },
                    {
                        'data': 'ShowTime',
                        'render': function (_data, _type, _full) {
                            if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                            else return '';
                        }
                    },
                    {
                        'data': 'ChartId',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            return '<a href="javascript:;" class="tankChart-view" data-methodType="1" data-id="' + _data + '"><i class="fa fa-search"></i></a>';
                        }
                    },
                    {
                        'data': 'IsDownLoad',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="tankChart-create"><i class="fa fa-edit"></i></a>';
                            else return '<a href="javascript:;" class="disabled"><i class="fa fa-edit"></i></a>';
                        }
                    },
                    {
                        'data': 'IsAmendment',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="tankChart-correct"><i class="fa fa-edit"></i></a>';
                            else return '<a href="javascript:;" class="disabled"><i class="fa fa-edit"></i></a>';
                        }
                    }
                ],
                'language': {
                    'emptyTable': getI18n('25901')
                }
            });
        });
    }

    //油罐历史详情查询
    (function () {
        $('.station-body').find('.station-con').on('click', '#tankChart-history-query', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID
            }

            params = NameSpace.String.getFormParams('#tankChart-history-form', params);
            if (params === false) return false;

            $('#tankChart-history').show().find('tbody').html('<tr class="loading"><td colspan="4">' + getI18n('10801') + '</td></tr>');

            ajaxCall(URL.HistoryTankChart, params, function (_message) {
                console.log(_message);
                $('#tankChart-history').dataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': _message.TankChartList,
                    'createdRow': function (_row, _data, _dataIndex) {
                        $(_row).data('rowData', _data);
                    },
                    'columns': [
                        {
                            'data': 'TankChartTypeDesc'
                        },
                        {
                            'data': 'ShowTime',
                            'render': function (_data, _type, _full) {
                                if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                                else return '';
                            }
                        },
                        {
                            'data': 'ChartId',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                return '<a href="javascript:;" class="tankChart-view" data-methodType="2" data-id="' + _data + '"><i class="fa fa-search"></i></a>';
                            }
                        },
                        {
                            'data': 'IsDownLoad',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                if (_data) return '<a href="javascript:;" class="tankChart-download"><i class="fa fa-download"></i></a>';
                                else return '<a href="javascript:;" class="disabled"><i class="fa fa-download"></i></a>';
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('25902')
                    }
                });
            });
        });
    })();

    //查看罐表
    (function () {
        $('.station-body').find('.station-con').on('click', '.tankChart-view', function () {
            var $elem = $(this),
                chartId = $elem.attr('data-id'),
                methodType = $elem.attr('data-methodType'),
                title1 = '20017',
                title2 = '20023',
                title3 = '20023';

            var params = {
                //"SessionID": SessionID,
                "MethodType": methodType,
                "ChartID": chartId
            }
            modal_tankChart(params, title1, title2, title3, false);
            //tankChartView(params, title1, title2, title3, false);
        });
    })();

    //创建罐表
    (function () {
        var $modal = $('#modal-manualChart-create'),
            parseFileList;

        $('.station-body').find('.station-con').on('click', '.tankChart-create', function () {
            var data = JSON.parse($(this).closest('tr').attr('data-value'));

            if (!chartTypeList) {
                var params = {
                    //"SessionID": SessionID,
                    "StationID": StationID
                }
                ajaxCall(URL.TankChartType, params, function (_message) {
                    console.log(_message);
                    chartTypeList = _message.ChartTypeList;
                    chartTypeListFill(chartTypeList, data.TankChartType);
                });
            } else {
                chartTypeListFill(chartTypeList, data.TankChartType);
            }
            modal_show($modal);

            $('input[type=text]', $modal).val('');
            $('input[name=TankID]', $modal).val(data.TankId);
            $('input[name=ChartID]', $modal).val(data.ChartId);
        });

        NameSpace.Select.select_chartTypeList = function (_element, _selector) {
            var chartType = _element.attr('data-value'),
                twentyPointHtml = $('.template-twentyPoint-tank').html(),
                multiPointHtml = $('.template-multiPoint-tank').html();

            if (chartType == '4') {
                $('.modal-body', $modal).addClass('multi-point-body');
                $('[data-type=4]', $modal).show();
                $('[data-type=2]', $modal).hide();
                $('.main-content', $modal).html(multiPointHtml);
                $('input[name=fileName]', $modal).val('');
            } else if (chartType == '2') {
                $('.modal-body', $modal).removeClass('multi-point-body');
                $('[data-type=4]', $modal).hide();
                $('[data-type=2]', $modal).show();
                $('.main-content', $modal).html(twentyPointHtml);
            }
        }

        //解析csv格式的文件
        $('#upload-file').change(function () { //去掉body
            var $elem = $(this),
                fileName = $elem.val(),
                reg = /.csv$/;

            if (reg.test(fileName) && fileName.split('.csv').length == 2) {
                $('input[name=fileName]', $modal).val(fileName);
                $elem.parse({
                    config: {
                        complete: function (results) {
                            console.log(results);
                            //上传多点罐表
                            var params = {
                                //"SessionID": SessionID,
                                "HeightVolPair": []
                            }
                            for (var i in results.data) {
                                var obj = {};
                                if (i == 0 || i == results.data.length - 1) continue;
                                obj['height'] = results.data[i][0];
                                obj['volume'] = results.data[i][1];
                                params['HeightVolPair'].push(obj);
                            }
                            ajaxCall(URL.UploadMultiPointTankChart, params, function (_message) {
                                console.log(_message);
                                parseFileList = _message.HeightVolPair;
                                $('input[name=Diameter]', $modal).val(_message.Diameter);
                                $modal.find('.table-result').show().dataTable({
                                    'lengthChange': false,
                                    'processing': true,
                                    'searching': false,
                                    'paging': false,
                                    'scrollY': 360,
                                    "scrollCollapse": true,
                                    'info': false,
                                    'ordering': false,
                                    'dom': 'rtpi',
                                    'destroy': true,
                                    'data': _message.HeightVolPair,
                                    'columns': [
                                        {
                                            'data': 'height1',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'volume1',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'height2',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'volume2',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'height3',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'volume3',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'height4',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        },
                                        {
                                            'data': 'volume4',
                                            'render': function (_data, _type, _full) {
                                                if (_data === null) return '';
                                                else return Number(_data).toFixed(2);
                                            }
                                        }
                                    ],
                                    'language': {
                                        'emptyTable': getI18n('20019')
                                    }
                                });
                            });
                        }
                    },
                    error: function (err, file, inputElem, reason) {
                        alert(err, file);
                    }
                });
            } else {
                alert(getI18n('20013'));
            }
        });

        //创建20点罐表
        $('.modal-manualChart').on('click', '#tankChart-twentyPointCreate', function () {
            var params = {
                //"SessionID": SessionID,
                "MethodType": "1",
                "StationID": StationID,
                "TankID": $('input[name=TankID]', $modal).val(),
                "ChartType": $('#chartType-list', $modal).find('.select-title').attr('data-value')
            },
            volumeArray = [],
            height = $('input[name=TankHeight]', $modal),
            domArray = [height];

            var bool = NameSpace.String.validateSomeField(domArray);
            if (!bool) return false;

            $('.form-list input[name]', $modal).each(function () {
                var $elem = $(this),
                    volume = $elem.val(),
                    title = $elem.attr('data-title');

                if (volume === '' || volume.replace(/(^\s*)|(\s*$)/g, '').length == 0) {
                    if (title) NameSpace.String.alert(title + getI18n('09013'), $elem.attr('data-alert'));
                    bool = false;
                    return false;
                }
                if (!NameSpace.String.isNumber(volume)) {
                    if (title) NameSpace.String.alert(title + getI18n('09014'), $elem.attr('data-alert'));
                    bool = false;
                    return false;
                }
                volumeArray.push(volume);
            });

            var temp = volumeArray.slice(0);
            temp.sort(function (a, b) {
                return b - a;
            });
            if (bool && !NameSpace.Array.isTwoArrayEquals(volumeArray, temp)) {
                alert(getI18n('25903'));
                bool = false;
            }
            if (bool) {
                params['Diameter'] = height.val();
                params['Volume'] = volumeArray.join();
                ajaxCall(URL.CreateTankChart, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        //alert(getI18n('25904'));
                        var subParams = {
                            //"SessionID": SessionID,
                            "StationID": StationID,
                            "TankID": params.TankID,
                            "ChartID": _message.ChartID,
                            "IsDeleteNewChartWhenFail": "1"  //指令失败后是否删除新罐表
                        }
                        ajaxCall(URL.CreateTankChartCmd, subParams, function (_message) {
                            if (_message.Result == 'Success') {
                                alert(_message.Description);
                                modal_hide($modal);
                                tankChartSummary();
                            } else {
                                alert(_message.Description);
                            }
                        });

                    } else alert(_message.Description);
                });
            }

        });

        //创建多点罐表
        $('.modal-manualChart').on('click', '#tankChart-multiPointCreate', function () {
            var params = {
                //"SessionID": SessionID,
                "MethodType": "1",
                "StationID": StationID,
                "TankID": $('input[name=TankID]', $modal).val(),
                "ChartType": $('#chartType-list', $modal).find('.select-title').attr('data-value'),
                "HeightVolPair": []
            },
            diameter = $('input[name=Diameter]', $modal),
            domArray = [diameter];
            var bool = NameSpace.String.validateSomeField(domArray);

            if (bool) params['Diameter'] = diameter.val();
            else return false;

            for (var i in parseFileList) {

                for (var j = 1; j <= 4; j++) {
                    var data = {};
                    if (parseFileList[i]['height' + j] == null) continue;
                    data['height'] = parseFileList[i]['height' + j];
                    data['volume'] = parseFileList[i]['volume' + j];
                    params['HeightVolPair'].push(data);
                }
            }
            ajaxCall(URL.CreateTankChart, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    //alert(getI18n('25905'));
                    var subParams = {
                        //"SessionID": SessionID,
                        "StationID": StationID,
                        "TankID": params.TankID,
                        "ChartID": _message.ChartID,
                        "IsDeleteNewChartWhenFail": "1"  //指令失败后是否删除新罐表
                    }
                    ajaxCall(URL.CreateTankChartCmd, subParams, function (_message) {
                        if (_message.Result == 'Success') {
                            alert(_message.Description);
                            modal_hide($modal);
                            tankChartSummary();
                        } else {
                            alert(_message.Description);
                        }
                    });
                } else alert(_message.Description);
            });
        });

        function chartTypeListFill(_data, _chartType) {
            var chartTypeHtml = '';

            for (var index in _data) {
                chartTypeHtml = chartTypeHtml + '<li data-value=' + _data[index].ChartType + '>' + _data[index].DisplayName + '</li>';
            }
            $('#chartType-list', $modal).find('.select-con').html(chartTypeHtml);
            NameSpace.Select.selectedByParam($('#chartType-list'), _chartType);
        }

    })();

    //修正罐表
    (function () {
        var $modal = $('#modal-correctChart'),
            diameter, heightVolPair;

        $('.station-body').find('.station-con').on('click', '.tankChart-correct', function () {
            var $table = $('#tankChart-beforeCorrect-table', $modal);
                data = JSON.parse($(this).closest('tr').attr('data-value')),
                params = {
                    //"SessionID": SessionID,
                    "MethodType": "2",
                    "ChartID": data.ChartId
                };

            modal_show($modal);
            $table.find('tbody').html('<tr class="loading"><td colspan="8">' + getI18n('10801') + '</td></tr>');

            $('#correctChart-form input[type=hidden]', $modal).each(function () {
                var name = $(this).attr('name');
                $(this).val(data[name]);
            });
            ajaxCall(URL.ViewTankChart, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    tankChartCorrectTable($table, _message.HeightVolPair);
                } else {
                    alert(_message.Description);
                }

            });
            //init dom
            $('input[name=VolumeCorrection]', $modal).val('');
            $('#section-afterCorrect', $modal).hide();
            $('#tankChart-downLoad', $modal).addClass('btn-disabled');
        });

        //生成罐表
        $('#tankChart-amendment').on('click', function () {
            var $elem = $(this),
                params = {
                    //"SessionID": SessionID,
                    "ChartID": $('input[name=ChartId]', $modal).val()
                },
                correction = $('input[name=VolumeCorrection]', $modal).val(),
                title = $('input[name=VolumeCorrection]', $modal).attr('data-title'),
                $table = $('#tankChart-afterCorrect-table', $modal);;

            if (correction === '' || correction.replace(/(^\s*)|(\s*$)/g, '').length == 0) {
                NameSpace.String.alert(title + getI18n('09013'));
                return false;
            }
            if (!NameSpace.String.isNumber(correction)) {
                NameSpace.String.alert(getI18n('25906'));
                return false;
            }
            if (correction >= -0.01 && correction <= 0.01) {
            } else {
                NameSpace.String.alert(getI18n('25907'));
                return false;
            }
            params['VolumeCorrection'] = correction;

            $table.find('tbody').html('<tr class="loading"><td colspan="8">' + getI18n('10801') + '</td></tr>');

            ajaxCall(URL.TankChartAmendment, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    diameter = _message.Diameter;
                    for (var i in _message.HeightVolPairForCreate) {
                        delete _message.HeightVolPairForCreate[i].PId;
                    }
                    heightVolPair = _message.HeightVolPairForCreate;
                    $elem.next().removeClass('btn-disabled');
                    //显示修正后数据
                    $('#section-afterCorrect', $modal).show();
                    tankChartCorrectTable($table, _message.HeightVolPair);
                    $('.main-box').addClass('modal-scroll');
                } else {
                    alert(_message.Description);
                }

            });
        });

        //下发罐表
        $('#tankChart-downLoad').on('click', function () {
            if (!$(this).hasClass('btn-disabled')) {
                var params = {
                    //"SessionID": SessionID,
                    "MethodType": "2",
                    "StationID": StationID,
                    "TankID": $('input[name=TankId]', $modal).val(),
                    "ChartType": $('input[name=TankChartType]', $modal).val(),
                    "Diameter": diameter,
                    "HeightVolPair": heightVolPair
                }
            }
            ajaxCall(URL.CreateTankChart, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    //alert(getI18n('25908'));
                    var subParams = {
                        //"SessionID": SessionID,
                        "StationID": StationID,
                        "TankID": $('input[name=TankId]', $modal).val(),
                        "ChartID": _message.ChartID,
                        "IsDeleteNewChartWhenFail": "1"  //指令失败后是否删除新罐表
                    }
                    ajaxCall(URL.CreateTankChartCmd, subParams, function (_message) {
                        if (_message.Result == 'Success') {
                            alert(_message.Description);
                            modal_hide($modal);
                            tankChartSummary();
                        } else {
                            alert(_message.Description);
                        }
                    });
                } else alert(_message.Description);
            });
        });

        //HeightVolPair格式表格
        function tankChartCorrectTable(_table, _dataList) {
            _table.dataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false,
                'paging': false,
                'scrollY': 360,
                "scrollCollapse": true,
                'info': false,
                'ordering': false,
                'dom': 'rtpi',
                'destroy': true,
                'data': _dataList,
                'columns': [
                    {
                        'data': 'height1',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'volume1',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'height2',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'volume2',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'height3',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'volume3',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'height4',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'volume4',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    }
                ],
                'language': {
                    'emptyTable': getI18n('20019')
                }
            });
        }
    })();

    //下发罐表
    (function () {
        $('.station-body').find('.station-con').on('click', '.tankChart-download', function () {
            var row = $(this).closest('tr').data('rowData'),
                params = {
                    //"SessionID": SessionID,
                    "StationID": StationID,
                    "TankID": $('#tank-list').find('.select-title').attr('data-value'),
                    "ChartID": row.ChartId,
                    "IsDeleteNewChartWhenFail": "0"  //指令失败后是否删除新罐表
                }
            ajaxCall(URL.CreateTankChartCmd, params, function (_message) {
                if (_message.Result == 'Success') {
                    alert(_message.Description);
                    tankChartSummary();
                    $('#tankChart-history-query').click();
                } else {
                    alert(_message.Description);
                }
            });
        });
    })();
});