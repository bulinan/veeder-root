/*
 ATG设备参数管理
*/
$(function () {
    var StationID = stateman.current.param['sid'],
        tableAlarm,
        paramAlarm112;

    function intervalMatch(_param) {
        for (var i in timeMap) {
            if (i == _param) return timeMap[i];
        }
        return '';
    }

    //init
    (function () {
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID
        };

        ajaxCall(URL.TankParamManagement, params, function (_message) {
            console.log(_message);

            paramAlarm112 = _message.ParamAlarm112;
            //info
            tankParamInfoList(_message.TankParamInfoList);

            //alarm
            $('.record-box').show();
            tankParamAlarmList(_message.TankParamAlarmList);
        });
    })();

    //显示最近记录数
    (function () {
        $('.station-body').find('.station-con').on('click', '#lastest-records', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "PageInfo":
	                {
	                    "RecordOffset": "1", 		// 请求的开始记录编号
	                    "RequestCount": ''			// 请求记录数量
	                }
            }
            $('#tankParamAlarm').parent().find('.dataTables_info,.dataTables_paginate').hide();
            $('#tankParamAlarm').find('tbody').html('<tr class="loading"><td colspan="7">' + getI18n('10801') + '</td></tr>');
            ajaxCall(URL.TankParamAlarmRefresh, params, function (_message) {
                console.log(_message);
                tankParamAlarmList(_message.TankParamAlarmList);
            });
        });
    })();

    //参数信息表格
    function tankParamInfoList(_dataList) {
        $('#tankParamInfo').DataTable({
            'lengthChange': false,
            'processing': true,
            'searching': false,
            'paging': false,
            'info': false,
            'ordering': false,
            'destroy': true,
            'data': _dataList,
            'createdRow': function (_row, _data, _dataIndex) {
                $(_row).attr('data-tankId', _data.TankId);
            },
            'columns': [
                {
                    'data': 'TankId'
                },
                {
                    'data': 'TStatus'
                },
                {
                    'data': 'AlarmTime',
                    'width': '14%',
                    'render': function (_data, _type, _full) {
                        if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        else return '';
                    }
                },
                {
                    'data': 'ProcessTime',
                    'width': '14%',
                    'render': function (_data, _type, _full) {
                        if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        else return '';
                    }
                },
                {
                    'data': 'ProcessUser'
                },
                {
                    'data': 'AlarmStatus' //处理结果
                },
                {
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        return '<a href="javascript:;" class="tankParam-detail"><i class="fa fa-edit"></i></a>';
                    }
                },
                {
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        var data = JSON.stringify(_full.OilChange);
                        return '<a href="javascript:;" class="oil-change" data-value=\'' + data + '\'><i class="fa fa-exchange"></i></a>';
                    }
                },
                {
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        return '<a href="javascript:;" class="tankParam-history-query"><i class="fa fa-search"></i></a>';
                    }
                }
            ],
            'language': {
                'emptyTable': getI18n('27902')
            }
        });
    }

    //报警信息表格
    function tankParamAlarmList(_dataList) {
        var pagelen = $('.record-box input[type=hidden]').val();

        if (pagelen == '') pagelen = 20;
        else pagelen = parseInt(pagelen);
        $('.record-box input[type=hidden]').val(pagelen);

        tableAlarm = $('#tankParamAlarm').DataTable({
            'lengthMenu': [10, 20, 50, 75, 100],
            'processing': true,
            'searching': false,
            'order': [],
            'pagingType': 'full_numbers',
            'pageLength': pagelen,
            'dom': 'lfrt<"dataTables_bottom"pi>',
            'destroy': true,
            'data': _dataList,
            'createdRow': function (_row, _data, _dataIndex) {
                $(_row).data('value', _data);
            },
            'columns': [
                {
                    'data': 'ResumeEnable',
                    'width': '90px',
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        if (_data) return '<a href="javascript:;" class="tank-alarm-recover text-style01">' + getI18n('27008') + '</a>';
                        else return '<a href="javascript:;" class="disabled">' + getI18n('27008') + '</a>';

                    }
                },
                {
                    'data': 'RecognizeEnable',
                    'width': '90px',
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        if (_data) return '<a href="javascript:;" class="tank-alarm-accept text-style01">' + getI18n('27009') + '</a>';
                        else return '<a href="javascript:;" class="disabled">' + getI18n('27009') + '</a>';
                    }
                },
                {
                    'data': 'TankId',
                    'render': function (_data, _type, _full) {
                        if (_data == '0') {
                            return '--';
                        } else {
                            return _data;
                        }
                    }
                },
                {
                    'data': 'AlarmTime',
                    'width': '15%',
                    'render': function (_data, _type, _full) {
                        if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        else return '';
                    }
                },
                {
                    'data': 'ParamName',
                    'orderable': false
                },
                {
                    'data': 'ValueFrom',
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        if (_full.ViewVisible == true) return '<a href="javascript:;" class="tank-param-view text-style01" data-id="' + _data + '">' + getI18n('09908') + '</a>';
                        else {
                            if (aryEditIds3.indexOf(_full.Paramid) !== -1 && _data === disabledStatusCons.key) {
                                return disabledStatusCons.value;
                            }
                            else if (_full.Paramid == 122) {
                                return intervalMatch(_data);
                            } else {
                                return _data;
                            }
                        }
                    }
                },
                {
                    'data': 'ValueTo',
                    'orderable': false,
                    'render': function (_data, _type, _full) {
                        if (_full.ViewVisible == true) return '<a href="javascript:;" class="tank-param-view text-style01" data-id="' + _data + '">' + getI18n('09908') + '</a>';
                        else {
                            if (aryEditIds3.indexOf(_full.Paramid) !== -1 && _data === disabledStatusCons.key) {
                                return disabledStatusCons.value;
                            }
                            else if (_full.Paramid == 122) {
                                return intervalMatch(_data);
                            } else {
                                return _data;
                            }
                        }
                    }
                }
            ],
            'language': {
                'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                'loadingRecords': getI18n('10801'),
                'infoEmpty': getI18n('10802'),
                'emptyTable': getI18n('27903'),
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
    }

    //全局参数 && 参数详情
    (function () {
        var $modal = $('#modal-tankParam-detail');

        $('.station-body').find('.station-con').on('click', '#global-param', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "TankID": "0",
                "MethodType": "1"
            },
            title = getI18n('20020');

            paramView_call(params, title);
        });
        $('.station-body').find('.station-con').on('click', '.tankParam-detail', function () {
            var tankId = $(this).closest('tr').attr('data-tankId'),
                title = getI18n('27012'),
                params = {
                    //"SessionID": SessionID,
                    "StationID": StationID,
                    "TankID": tankId,
                    "MethodType": "1"
                };

            paramView_call(params, title);
        });
        function paramView_call(_params, _title) {
            modal_show($modal);
            $('.table-result', $modal).find('tbody').html('<tr class="loading"><td colspan="5">' + getI18n('10801') + '</td></tr>');
            ajaxCall(URL.TankParamView, _params, function (_message) {
                console.log(_message);
                $('.modal-title', $modal).text(_title);

                $('.table-result', $modal).DataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false,
                    'paging': false,
                    'scrollY': 360,
                    "scrollCollapse": true,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'data': _message.TankParamList,
                    'createdRow': function (_row, _data, _dataIndex) {
                        $(_row).attr('data-Tankid', _data.TankId);
                    },
                    'columns': [
                        {
                            'data': 'Tankid',
                            'width': '60px',
                            'render': function (_data, _type, _full) {
                                if (_data == '0') {
                                    return '--';
                                } else {
                                    return _data;
                                }
                            }
                        },
                        {
                            'data': 'ParamName'
                        },
                        {
                            'data': 'ActiveValue',
                            'width': '150px',
                            'render': function (_data, _type, _full) {
                                if (_full.ViewVisible == true) return '<a href="javascript:;" class="tank-param-view modal-inner text-style01" data-id="' + _data + '">' + getI18n('09908') + '</a>';
                                else {
                                    if (aryEditIds3.indexOf(_full.Paramid) !== -1 && _data === disabledStatusCons.key) {
                                        return disabledStatusCons.value;
                                    } else if (_full.Paramid == 122) {
                                        return intervalMatch(_data);
                                    } else {
                                        return _data;
                                    }
                                }
                            }
                        },
                        {
                            'data': 'OriginalValue',
                            'width': '150px',
                            'render': function (_data, _type, _full) {
                                if (_full.ViewVisible == true) return '<a href="javascript:;" class="tank-param-view modal-inner text-style01" data-id="' + _data + '">' + getI18n('09908') + '</a>';
                                else {
                                    if (aryEditIds3.indexOf(_full.Paramid) !== -1 && _data === disabledStatusCons.key) {
                                        return disabledStatusCons.value;
                                    } else if (_full.Paramid == 122) {
                                        return intervalMatch(_data);
                                    } else {
                                        return _data;
                                    }
                                }
                            }
                        },
                        {
                            'data': 'RecTime',
                            'width': '180px',
                            'render': function (_data, _type, _full) {
                                if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                                else return '';
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('27902')
                    }
                });
            });
        }
    })();

    //历史查询
    (function () {
        var $modal = $('#modal-tankParam-query');

        $('.station-body').find('.station-con').on('click', '.tankParam-history-query', function () {
            var tankId = $(this).closest('tr').attr('data-tankId'),
                params = {
                    //"SessionID": SessionID,
                    "StationID": StationID,
                    "TankID": tankId,
                    "MethodType": "2",
                    "BeginDate": NameSpace.Date.getOneMonthAgo(),
                    "EndDate": NameSpace.Date.getCurDateTime('YYYY-mm-dd')
                };

            //日期初始化
            $('input[name=BeginDate]', $modal).val(NameSpace.Date.getOneMonthAgo());
            $('input[name=EndDate]', $modal).val(NameSpace.Date.getCurDateTime('YYYY-mm-dd'));

            modal_show($modal);
            $('.table-result', $modal).find('tbody').html('<tr class="loading"><td colspan="5">' + getI18n('10801') + '</td></tr>');

            ajaxCall(URL.TankParamView, params, function (_message) {
                console.log(_message);
                $('input[name=TankID]', $modal).val(tankId);
                tankParamHistory(_message.TankParamTraceList);
            });
        });

        $('#tankParam-query').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "MethodType": "2"
            };
            params = NameSpace.String.getFormParams('#tankParam-query-form', params);
            if (params === false) return false;

            $('.table-result', $modal).find('tbody').html('<tr class="loading"><td colspan="5">' + getI18n('10801') + '</td></tr>');

            ajaxCall(URL.TankParamView, params, function (_message) {
                console.log(_message);
                tankParamHistory(_message.TankParamTraceList);
            });
        });

        function tankParamHistory(_dataList) {
            $('.table-result', $modal).DataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false,
                'paging': false,
                'scrollY': 360,
                'scrollCollapse': true,
                'info': false,
                'destroy': true,
                'data': _dataList,
                'createdRow': function (_row, _data, _dataIndex) {
                    $(_row).attr('data-Tankid', _data.TankId);
                },
                'columns': [
                        {
                            'data': 'Tankid',
                            'orderable': false,
                            'width': '60px'
                        },
                        {
                            'data': 'ParamName',
                            'orderable': false
                        },
                        {
                            'data': 'ValueFrom',
                            'orderable': false,
                            'width': '150px',
                            'render': function (_data, _type, _full) {
                                if (_full.ViewVisible) return '<a href="javascript:;" class="tank-param-view modal-inner text-style01" data-id="' + _data + '">' + getI18n('09908') + '</a>';
                                else return _data;
                            }
                        },
                        {
                            'data': 'ValueTo',
                            'orderable': false,
                            'width': '150px',
                            'render': function (_data, _type, _full) {
                                if (_full.ViewVisible) return '<a href="javascript:;" class="tank-param-view modal-inner text-style01" data-id="' + _data + '">' + getI18n('09908') + '</a>';
                                else return _data;
                            }
                        },
                        {
                            'data': 'RecTime',
                            'render': function (_data, _type, _full) {
                                if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                                else return '';
                            }
                        }
                ],
                'language': {
                    'emptyTable': getI18n('27904')
                }
            });
        }
    })();

    //油品变更
    (function () {
        var $modal = $('#modal-oil-change'),
            tableIndex,
            rowData;

        $('.station-body').find('.station-con').on('click', '.oil-change', function () {
            var tankId = $(this).closest('tr').attr('data-tankId'),
                value = $(this).attr('data-value'),
                data = JSON.parse(value);

            if (data.Message != '') {      //如果message不为空，则直接提示message信息，不弹出页面
                alert(data.Message);
                return false;
            }
            modal_show($modal);
            $('input[name=ProductName]', $modal).val(data.ProductName);
            $('input[name=ParamID]', $modal).val(data.ParamID);
            $('input[name=TankID]', $modal).val(tankId);

            //油品列表
            var params = {
                //"SessionID": SessionID
            }
            ajaxCall(URL.ProductList, '{}', function (_message) {
                var productId,
                    productHtml = '';

                for (var index in _message.ProductList) {
                    if (_message.ProductList[index].DisplayName == data.ProductName) productId = _message.ProductList[index].ProductID;
                    productHtml = productHtml + '<li data-value=' + _message.ProductList[index].ProductID + '>' + _message.ProductList[index].DisplayName + '</li>';
                }
                $('#product-list').find('.select-con').html(productHtml);
                NameSpace.Select.selectedByParam($('#product-list'), productId);
            });
        });

        //确认变更
        $('#oil-change-confirm').on('click', function () {
            var oldValue = $('input[name=ProductName]', $modal).val(),
                newValue = $('#product-list .select-title span').text();

            if (oldValue == newValue) alert(getI18n('27905') + newValue);
            else {
                var params = {
                    //"SessionID": SessionID,
                    "StationID": StationID
                }
                params = NameSpace.String.getFormParams('#oil-change-form', params);
                if (params === false) return false;

                //if (params['ParamID'] == '101') params['ProductName'] = newValue;        //ProductName 只有ParamID=101 时需要，传下拉框的Text

                ajaxCall(URL.TankParamSet, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        alert(_message.Description);
                        modal_hide($modal);
                        tankParamInfoRefresh();
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();

    //查看罐表
    (function () {
        $('.station-con,.modal').on('click', '.tank-param-view', function () {
            var $elem = $(this),
                id = $elem.attr('data-id'),
                title = '20023',
                params = {
                    //"SessionID": SessionID,
                    "MethodType": "2",
                    "ChartID": id
                };

            if ($elem.hasClass('modal-inner')) {
                modal_tankChart(params, '', title, title, true);
                //tankChartView(params,'',title,title,true);
            } else {
                modal_tankChart(params, '', title, title, false);
                //tankChartView(params, '',title,title, false);
            }
        });
    })();

    //恢复、认可
    (function () {
        //恢复
        $('.station-body').find('.station-con').on('click', '.tank-alarm-recover', function () {
            var $tr = $(this).closest('tr'),
                data = $tr.data('value');
            if (data.Paramid != paramAlarm112) {
                if (confirm(getI18n('27906'))) {
                    var params = {
                        //"SessionID": SessionID,
                        "StationID": StationID,
                        "TankID": data.TankID,
                        "AlarmID": data.AlarmId,
                        "ParamID": data.Paramid,
                        "OldValue": data.ValueFrom,
                        "MethodType": "1"
                    }
                    ajaxCall(URL.TankParamAlarmEdit, params, function (_message) {
                        console.log(_message);
                        if (_message.Result == 'Success') {
                            alert(getI18n('27908'));
                            tankParamAlarmRefresh();
                            tankParamInfoRefresh();
                        } else {
                            alert(_message.Description);
                        }
                    });
                }
            } else {
                if (confirm(getI18n('27907'))) {
                    var createTankParams = {
                        //"SessionID": SessionID,
                        "StationID": StationID,
                        "TankID": data.TankID,
                        "ChartID": data.ValueFrom,
                        "IsDeleteNewChartWhenFail": "0"  //指令失败后是否删除新罐表
                    }
                    ajaxCall(URL.CreateTankChartCmd, createTankParams, function (_message) {
                        if (_message.Result == 'Success') {
                            alert(_message.Description);
                            var params = {
                                //"SessionID": SessionID,
                                "AlarmID": data.AlarmId,
                                "MethodType": "2"
                            }
                            ajaxCall(URL.TankParamAlarmEdit, params, function (_message) {
                                console.log(_message);
                                if (_message.IsEliminateSuccess) {
                                    alert(getI18n('27908'));
                                    tankParamAlarmRefresh();
                                    tankParamInfoRefresh();
                                } else {
                                    alert(getI18n('27909'))
                                }
                            });
                        } else {
                            alert(_message.Description);
                        }
                    });
                }
            }
        });

        //认可
        $('.station-body').find('.station-con').on('click', '.tank-alarm-accept', function () {
            var $tr = $(this).closest('tr'),
                data = $tr.data('value');

            if (confirm(getI18n('27910'))) {
                var params = {
                    //"SessionID": SessionID,
                    "AlarmID": data.AlarmId,
                    "MethodType": "2"
                }
                ajaxCall(URL.TankParamAlarmEdit, params, function (_message) {
                    console.log(_message);
                    if (_message.IsEliminateSuccess) {
                        alert(getI18n('27911'));
                        tankParamAlarmRefresh();
                        tankParamInfoRefresh();
                    } else {
                        alert(getI18n('27912'))
                    }
                });
            }
        });
    })();
    function tankParamAlarmRefresh() {
        var page = tableAlarm.page(),
            params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "PageInfo":
	            {
	                "RecordOffset": "1",
	                "RequestCount": ''
	            }
            }
        $('#tankParamAlarm').find('tbody').html('<tr class="loading"><td colspan="7">' + getI18n('10801') + '</td></tr>');
        ajaxCall(URL.TankParamAlarmRefresh, params, function (_message) {
            tankParamAlarmList(_message.TankParamAlarmList);
            tableAlarm.page(page).draw(false); //仍然显示当前页
        });
    }
    function tankParamInfoRefresh() {
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID
        }
        $('#tankParamInfo').find('tbody').html('<tr class="loading"><td colspan="9">' + getI18n('10801') + '</td></tr>');
        ajaxCall(URL.TankParamManagement, params, function (_message) {
            paramAlarm112 = _message.ParamAlarm112;
            tankParamInfoList(_message.TankParamInfoList);
        });
    }
});