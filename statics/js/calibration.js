/*
    校罐管理
*/
$(function () {
    var typeStr, verifyMethodList;

    for (var key in stateman.current.param) {
        typeStr = key;
    }

    //查询基础数据
    (function () {
        var params;

        if (typeStr == 'sid') {
            $('#station-group').hide();
            $('#startCalibration').show();
            params = {
                'StationID': stateman.current.param[typeStr]
            };
        } else if (typeStr == 'cid') {
            $('#station-group').show();
            $('#startCalibration').hide();
            params = '{}';
        }

        ajaxCall(URL.ChartCalibrationMeta, params, function (_message) {
            console.log(_message);

            var $alarmBox = $('#CalibrationAlarmList'),
                $statusBox = $('#CalibrationStatusList'),
                alarmHtml = '',
                statusHtml = '';

            if (_message.EnableBatchStarting) $('#startCalibration').removeClass('btn-disabled');
            else $('#startCalibration').addClass('btn-disabled');

            var calibrationStatusList = _message.CalibrationStatusList;
            verifyMethodList = _message.VerifyMethodList;
            for (var i in _message.CalibrationAlarmList) {
                alarmHtml = alarmHtml + '<li data-value="' + _message.CalibrationAlarmList[i].AlarmID + '">' + _message.CalibrationAlarmList[i].DisplayName + '</li>';
            }
            for (var i in calibrationStatusList) {
                if (i < 4) statusHtml = statusHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + calibrationStatusList[i].StatusID + '" checked>' + calibrationStatusList[i].DisplayName + '</label>';
                else statusHtml = statusHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + calibrationStatusList[i].StatusID + '">' + calibrationStatusList[i].DisplayName + '</label>';
            }
            $alarmBox.find('.select-con').html(alarmHtml);
            $statusBox.html(statusHtml);
            NameSpace.Select.firstSelected($alarmBox);
            NameSpace.Select.firstSelected($statusBox);
            $('.condition-list').find('.block-loading').hide();
        });
    })();

    //查询
    (function () {
        var $table = $('#calibrateTank');

        $('#chartCalibration-query').on('click', function () {
            var status = [],
                params = {
                    //"SessionID": SessionID,
                    "StationQueryText": $('input[name=station]').val(),
                    "CalibrationAlarm": $('#CalibrationAlarmList').find('.select-title').attr('data-value')
                };

            $('#CalibrationStatusList').find('input[type=checkbox]:checked').each(function () {
                var value = $(this).val();
                status.push(value);
            });
            if (status.length == 0) {
                alert(getI18n('15908'));
                return false;
            }

            params['CalibrationStatus'] = status.join();

            if (typeStr == 'sid') {
                params['StationID'] = stateman.current.param['sid'];
                params['CompanyID'] = '-1';
            } else if (typeStr == 'cid') {
                params['StationID'] = '-1';
                params['CompanyID'] = stateman.current.param['cid'];
            }

            var pagelen = $('.record-box input[type=hidden]').val(),
                conditionHeight = $('.condition-list').outerHeight();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            $('.record-box').css('top', conditionHeight).show();
            $table.show();
            var table = $table.DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false, //searching
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'order': [],
                'dom': 'lfrt<"dataTables_bottom"pi>',
                'destroy': true,
                'sAjaxSource': URL.ChartCalibration,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);
                    console.log(oSettings);
                    ajaxCall(sSource, params, function (_message) {
                        console.log(_message);
                        if (_message.EnableBatchStarting) $('#startCalibration').removeClass('btn-disabled');
                        else $('#startCalibration').addClass('btn-disabled');

                        total = _message.ChartCalibrationList.length;
                        fnCallback(format(_message, total));
                    });
                },
                'createdRow': function (_row, _data, _dataIndex) {
                    var data = JSON.stringify(_data);
                    $(_row).attr('data-value', data);
                },
                /*buttons: [
                {
                extend: 'remove',
                editor: myEditor,
                formButtons: [
                {
                label: 'Cancel',
                fn: function () { this.close(); }
                },
                'Delete data'
                ]
                }
                ],*/
                'columns': [
                    {
                        'data': 'GsShortName'
                    },
                    {
                        'width': '70px',
                        'data': 'TankID'
                    },
                    {
                        'data': 'CCMethodName' //校罐方式
                    },
                    {
                        'data': 'CcStatusDisplayName'
                    },
                    {
                        'data': 'VerifyMethod',
                        'render': function (_data, _type, _full, _meta) {
                            for (var i in verifyMethodList) {
                                if (_data == verifyMethodList[i].MethodID) return verifyMethodList[i].DisplayName;
                            }
                        }
                    },
                    {
                        'width': '12.3%',//180px
                        'data': 'VerifyTime',
                        'render': function (_data, _type, _full, _meta) {
                            if (_data == "0001-01-01 00:00:00") return 'N/A';
                            else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'data': 'VerifyPerson'
                    },
                    {
                        'width': '12.3%',
                        'data': 'StartTime',
                        'render': function (_data, _type, _full, _meta) {
                            if (_data == "0001-01-01 00:00:00") return 'N/A';
                            else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'width': '12.3%',
                        'data': 'SubmitTime',
                        'render': function (_data, _type, _full, _meta) {
                            if (_data == "0001-01-01 00:00:00") return 'N/A';
                            else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'orderable': false,
                        'width': '80px',
                        'render': function (_data, _type, _full, _meta) {
                            return '<a href="javascript:;" class="tankChart-edit" data-status="' + _full.CcStatus + '"><i class="fa fa-edit"></i></a>';
                        }
                    },
                    {
                        'orderable': false,
                        'width': '80px',
                        'render': function (_data, _type, _full, _meta) {
                            if (_full.CcStatus == 0 || _full.CcStatus == -1) return '<a href="javascript:;" class="currentTank-view disabled"><i class="fa fa-search"></i></a>';
                            else return '<a href="javascript:;" class="currentTank-view"><i class="fa fa-search"></i></a>';
                        }
                    },
                    {
                        'data': 'AlarmSeverity',
                        'width': '90px',
                        'render': function (_data, _type, _full, _meta) {
                            var className = '';
                            switch (_data) {
                                case -1:
                                    return '<a href="javascript:;" class="point" title="' + getI18n('15055') + '"><img src="statics/img/green_point.jpg"></a>';
                                case 1:
                                    return '<a href="javascript:;" class="point calibrationAlarm-view" title="' + getI18n('17006') + '"><img src="statics/img/yellow_point.jpg"></a>';
                                case 3:
                                    return '<a href="javascript:;" class="point calibrationAlarm-view" title="' + getI18n('17008') + '"><img src="statics/img/red_point.jpg"></a>';
                                default:
                                    return getI18n('15056'); //'' + getI18n('15056') + ''
                            }
                        }
                    },
                {
                    'orderable': false,
                    'width': '80px',
                    'render': function (_data, _type, _full, _meta) {
                        if (_full.CcStatus !== 2 && _full.CcStatus !== 3) return '<a href="javascript:;" class="fa-font-16 disabled"><i class="fa fa-file-text-o"></i></a>';
                        else return '<a href="report/index.html#/tankChartCalibration/' + _full.GsID + '/' + _full.TankID + '"target="_blank" class="fa-font-16"><i class="fa fa-file-text-o"></i></a>';
                    }
                }
                ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('15901'),
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

            //动态隐藏显示列
            var column = table.column(0);
            if (typeStr == 'sid') {
                column.visible(!column.visible());
                //table.column(1).order('asc');
            } else if (typeStr == 'cid') column.visible(column.visible());

            function format(_data, _total) {
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.ChartCalibrationList
                };
            }

        });

        //查看当前罐表
        $('.station-con').delegate('.currentTank-view', 'click', function () {
            var $elem = $(this);
            if (!$elem.hasClass('disabled')) {
                var //ccID = $elem.closest('tr').attr('data-ccID'),
                    $tr = $elem.closest('tr'),
                    data = JSON.parse($tr.attr('data-value')),
                    params = {
                        //"SessionID": SessionID,
                        "MethodType": "1",
                        "ChartCalibrationID": data.CcID
                    };

                ajaxCall(URL.GetChartCalibrationChartId, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        var title = '20018',
                            chartID = _message.ChartID,
                            params02 = {
                                //"SessionID": SessionID,
                                "MethodType": "1",    //1：查看全罐表；2：查看具体的罐表
                                "ChartID": chartID
                            };
                        modal_tankChart(params02, title, '', '', false);
                        //tankChartView(params02, title, '', '', false);
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();

    //批量开启校罐 - 弹出
    (function () {
        $('#startCalibration').on('click', function () {
            if (!$(this).hasClass('btn-disabled')) {
                var params = {
                    //"SessionID": SessionID,
                    "StationID": stateman.current.param['sid']
                }
                var tankUrl = 'Station/TankChartFinishedStatus?StationID=' + params.StationID;
                modal_calibrationStatus(tankUrl);
            }
        });
    })();

    //校罐报警查询
    (function () {
        $('.station-con').delegate('.calibrationAlarm-view', 'click', function () {
            var $elem = $(this),
                $tr = $elem.closest('tr'),
                data = JSON.parse($tr.attr('data-value')),
                params = {
                    //"SessionID": SessionID,
                    "ChartCalibrationID": data.CcID
                },
                $modal = $('.modal-alarmChart');

            modal_show($modal);
            $modal.attr('data-CcId', params.ChartCalibrationID);
            ChartCalibrationAlarmTable(params, $modal);
        });
    })();

    //校罐报警编辑
    (function () {
        var $modal = $('#modal-calibrationAlarm-edit');

        $('.modal-alarmChart').on('click', '.calibration-alarm-edit', function () {
            var $row = $(this).closest('tr'),
                rowData = $row.data('rowData'),
                params = {
                    //"SessionID": SessionID,
                    "TrackID": rowData.TrackID,
                    "AlarmID": rowData.Alarmid
                }
            ajaxCall(URL.EditAlarmMeta, params, function (_message) {
                console.log(_message);
                var processTypeHtml = '';

                $('input[name=UserName]', $modal).val(_message.UserName);
                $('input[name=AlarmID]', $modal).val(params.AlarmID);
                $('textarea[name=Remark]', $modal).val(_message.Remark);
                $('input[name=AlarmState]', $modal).prop('checked', _message.RelieveChecked);
                if (_message.RelieveEnable) $('input[name=AlarmState]', $modal).removeAttr('disabled');
                else $('input[name=AlarmState]', $modal).attr('disabled', 'disabled');

                for (var index in _message.AlarmProcessTypeList) {
                    processTypeHtml = processTypeHtml + '<li data-value="' + _message.AlarmProcessTypeList[index].AlarmProcessType + '">' + _message.AlarmProcessTypeList[index].DisplayName + '</li>';
                }
                $('#processTypeList').find('.select-con').html(processTypeHtml);
                NameSpace.Select.selectedByParam($('#processTypeList'), _message.ProcessType);
                $modal.addClass('layered-modal');
                modal_show($modal);
            });
        });

        //提交
        $modal.on('click', '#calibrationAlarm-edit-save', function () {
            var params = {
                //"SessionID": SessionID
            };

            params = NameSpace.String.getFormParams('#calibrationAlarm-edit-form', params);
            if (params === false) {
                return false;
            }

            ajaxCall(URL.EditAlarm, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    var $parentModal = $('.modal-alarmChart'),
                        CcId = $parentModal.attr('data-CcId');
                    modal_hide($modal);
                    ChartCalibrationAlarmTable({ /* "SessionID": SessionID,*/"ChartCalibrationID": CcId }, $parentModal);
                }
                else alert(_message.Description);
            });
        });
    })();

    //校罐状态
    (function () {
        $('.station-con').delegate('.tankChart-edit', 'click', function () {
            $('.main-box').addClass('modal-scroll');
            var $tr = $(this).closest('tr'),
                data = JSON.parse($tr.attr('data-value')),
                status = data.CcStatus,
                beginDate = data.StartTime.split(' ')[0],
                params = {
                    //"SessionID": SessionID,
                    "ChartCalibrationID": data.CcID,
                    "StationID": data.GsID,
                    "TankID": data.TankID,
                    "CcStatus": data.CcStatus
                };

            switch (status) {
                case 1:
                    var tankUrl = 'Station/TankChartGetDataStatus?StationID=' + data.GsID + '&TankID=' + data.TankID + '&ChartCalibrationID=' + data.CcID + '&CcStatus=' + data.CcStatus;
                    modal_calibrationStatus(tankUrl);
                    break;
                case 5:
                    var tankUrl = 'Station/TankChartNewChartStatus?StationID=' + data.GsID + '&TankID=' + data.TankID + '&ChartCalibrationID=' + data.CcID + '&CcStatus=' + data.CcStatus + '&NewChartID=' + data.NewChartID + '&BeginDate=' + beginDate;

                    modal_calibrationStatus(tankUrl);
                    break;
                case 2:
                    var tankUrl = 'Station/TankChartSubmittedStatus?StationID=' + data.GsID + '&TankID=' + data.TankID + '&ChartCalibrationID=' + data.CcID + '&CcStatus=' + data.CcStatus + '&NewChartID=' + data.NewChartID + '&BeginDate=' + beginDate;

                    modal_calibrationStatus(tankUrl);
                    break;
                default:
                    var tankUrl = 'Station/TankChartFinishedStatus?StationID=' + data.GsID + '&TankID=' + data.TankID;
                    modal_calibrationStatus(tankUrl);
                    break;
            }
        });
    })();

    //关闭
    (function () {
        $('#modal-commonPage').off().on('click', '.modal-close', function () {
            $('#chartCalibration-query').trigger('click');
        });
    })();

    function ChartCalibrationAlarmTable(_params, _modal) {
        $('.table-result', _modal).find('tbody').html('<tr class="loading"><td colspan="11">' + getI18n('10801') + '</td></tr>');
        ajaxCall(URL.ChartCalibrationAlarm, _params, function (_message) {
            console.log(_message);
            $('.table-result', _modal).dataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false,
                'paging': false,
                'scrollY': 360,
                "scrollCollapse": true,
                'info': false,
                'ordering': false,
                'destroy': true,
                'data': _message.ChartCalibrationAlarmList,
                'createdRow': function (_row, _data, _dataIndex) {
                    $(_row).data('rowData', _data);
                },
                'columns': [
                        {
                            'width': '200px',
                            'data': 'AlarmDescription'
                        },
                        {
                            'data': 'AlarmLevel'
                        },
                        {
                            'width': '140px',
                            'data': 'GsShortName'
                        },
                        {
                            'width': '140px',
                            'data': 'AlarmDateTime',
                            'render': function (_data, _type, _full, _meta) {
                                return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                            }
                        },
                        {
                            'width': '55px',
                            'data': 'TankID'
                        },
                        {
                            'width': '120px',
                            'data': 'AlarmTypeName'
                        },
                        {
                            'width': '110px',
                            'data': 'AlarmStateName'
                        },
                        {
                            'data': 'AlarmSeverity'
                        },
                        {
                            'data': 'AlarmRemark'
                        },
                        {
                            'data': 'AlarmHandlePeople'
                        },
                        {
                            'width': '50px',
                            'render': function (_data, _type, _full, _meta) {
                                return '<a href="javascript:;" class="calibration-alarm-edit"><i class="fa fa-edit"></i></a>';
                            }
                        }
                    ],
                'language': {
                    'emptyTable': getI18n('15902')
                }
            });
        });
    }
});