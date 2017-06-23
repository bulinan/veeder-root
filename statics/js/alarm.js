/*
    报警
*/
$(function () {
    var typeStr, isInDialog = false;

    console.log(stateman);
    for (var key in stateman.current.param) {
        if (key == 'cid') {
            typeStr = key;
        } else if (key == 'sid') {
            typeStr = key;
        }
    }

    if ($('body').find('.index').hasClass('page-dialog')) isInDialog = true;
    else isInDialog = false;

    //查询所需基础数据
    (function () {
        var params = {
            //"SessionID": SessionID,
            "LastRequestTime": NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss')
        }
        ajaxCall(URL.AlarmQueryMeta, params, function (_message) {
            console.log(_message);
            //类别
            var categoryList = _message.AlarmCategoryList,
                typeList = [];

            for (var i in categoryList) {
                $('#CategoryList').find('.select-con').append('<li data-value=' + categoryList[i].AlarmCategory + '>' + categoryList[i].DisplayName + '</li>');
                typeList = typeList.concat(categoryList[i].AlarmTypeList);
            }
            for (var i in typeList) {
                $('#TypeList').find('.select-con').append('<li data-value=' + typeList[i].AlarmCode + '>' + typeList[i].DisplayName + '</li>');
            }
            //级别联动
            NameSpace.Select.select_categoryList = function (_element, _selector) {
                var categoryID = _element.attr('data-value'),
                    $con = $('#TypeList').find('.select-con');

                $con.html('');
                $con.append('<li data-value="">' + getI18n('09001') + '</li>');
                if (categoryID != '-1') {
                    var data = load_typeList(_message.AlarmCategoryList, categoryID);
                    for (var i in data) {
                        $con.append('<li data-value=' + data[i].AlarmCode + '>' + data[i].DisplayName + '</li>');
                    }
                } else {
                    for (var i in typeList) {
                        $con.append('<li data-value=' + typeList[i].AlarmCode + '>' + typeList[i].DisplayName + '</li>');
                    }
                }
                var selectedText = $con.find('li').eq(0).text(),
                    selectedId = $con.find('li').eq(0).attr('data-value');
                $('#TypeList').find('.select-title').attr('data-value', selectedId).find('span').text(selectedText);
            }

            //报警状态
            for (var i in _message.AlarmStateList) {
                $('#StateList').find('.select-con').append('<li data-value=' + _message.AlarmStateList[i].AlarmState + '>' + _message.AlarmStateList[i].DisplayName + '</li>');
            }

            //严重性
            for (var i in _message.AlarmLevelList) {
                $('#LevelList').find('.select-con').append('<li data-value=' + _message.AlarmLevelList[i].AlarmLevel + '>' + _message.AlarmLevelList[i].DisplayName + '</li>');
            }

            $('.condition-list').find('.block-loading').hide();

            //判断url参数中是否有报警类别、严重性、状态
            var alarmLevel = stateman.current.param['alarmLevel'],
                alarmType = stateman.current.param['alarmType'],
                alarmState = stateman.current.param['alarmState'],
                bool = false;

            if (alarmLevel) {
                bool = true;
                NameSpace.Select.selectedByParam($('#LevelList'), alarmLevel);
            }
            if (alarmType) {
                bool = true;
                NameSpace.Select.selectedByParam($('#CategoryList'), alarmType);
            }
            if (alarmState) {
                bool = true;
                NameSpace.Select.selectedByParam($('#StateList'), alarmState);
            }

            if (bool) {
                $('#alarm-query-form').find('input[name=BeginDate]').val('1900-01-01');
                $('#alarm-query').trigger('click');
            }
        });
        function load_typeList(_data, _id) {
            for (var index in _data) {
                if (_id == _data[index].AlarmCategory) {
                    return _data[index].AlarmTypeList; //根据AlarmCategory，返回相应的AlarmTypeList
                }
            }
        }
    })();

    //报警查询
    (function () {
        //$('.alarm-con .select-title').attr('data-value', '-1');
        $('#TypeList .select-title').attr('data-value', '');
        $('#alarm-query').on('click', function () {
            var params = {
                //'SessionID': SessionID,
                "LastRequestTime": NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'),
                'PageInfo': {}
            },
            total;

            params = NameSpace.String.getFormParams('#alarm-query-form', params);
            if (params === false) {
                return false;
            }

            if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
            else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];

            if ($('#is-inform').prop('checked')) params['OnlyNotice'] = 1;
            else params['OnlyNotice'] = 0;

            $('.record-box').show();
            var $table = $('#alarmTable'),
                pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            $table.show().find('tbody').html('');
            $table.DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false,
                'order': [],
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'dom': 'lfrt<"dataTables_bottom"pi>',
                'destroy': true,
                'autoWidth': false,
                'sAjaxSource': URL.AlarmList,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);

                    params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1; // 请求的开始记录编号
                    params['PageInfo'].RequestCount = ''; // 请求记录数量

                    ajaxCall(sSource, params, function (_message) {
                        console.log(_message);
                        if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                        fnCallback(format(_message, total));
                    });
                },
                'createdRow': function (_row, _data, _dataIndex) {
                    $(_row).data('rowData', _data);
                },
                'columns': [
                    {
                        'data': 'AlarmNote'
                    },
                    {
                        'width': '8%',
                        'data': 'AlarmCategoryDesc'
                    },
                    {
                        'width': '100px',
                        'data': 'GsShortName',
                        'render': function (_data, _type, _full) {
                            if (isInDialog) {
                                return '<a href="javascript:;" class="station-name text-style01" data-sid="' + _full.StationID + '">' + _data + '</a>';
                            } else {
                                return '<a href="#/Station?sid=' + _full.StationID + '" class="text-style01">' + _data + '</a>';
                            }
                        }
                    },
                    {
                        'width': '13%',
                        'data': 'DateTime',
                        'render': function (_data, _type, _full) {
                            var date = _data.split(' ');
                            return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                        }
                    },
                    {
                        'width': '70px',
                        'data': 'DeviceID'
                    },
                    {
                        'width': '10.5%',
                        'data': 'AlarmName'
                    },
                    {
                        'width': '70px',
                        'data': 'AlarmStateDesc'
                    },
                    {
                        'width': '130px',
                        'data': 'AlarmLevelDesc',
                        'render': function (_data, _type, _full) {
                            var className;
                            switch (_data) {
                                case getI18n('17006'):
                                    className = 'text-tip';
                                    break;
                                case getI18n('17007'):
                                    className = 'text-warning';
                                    break;
                                case getI18n('17008'):
                                    className = 'text-danger';
                                    break;
                                case getI18n('17009'):
                                    className = 'text-primary';
                                    break;
                            }
                            return '<span class="' + className + '">' + _data + '</span>';
                        }
                    },
                    {
                        'width': '13%',
                        'data': 'Remark'
                    },
                    {
                        'width': '100px',
                        'data': 'UserName'
                    },
                    {
                        'width': '60px',
                        'data': '',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            return '<a href="javascript:;" class="alarm-edit"><i class="fa fa-edit"></i></a>';
                        }
                    }
                ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('17901'),
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
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.AlarmList
                };
            }
        });

        $('.alarm-con').on('click', '.station-name', function () {
            var sid = $(this).attr('data-sid');

            parentModal_hide();
            top.location.href = 'index.html#/Station?sid=' + sid;
        });
    })();

    //报警编辑
    (function () {
        var $modal = $('#modal-alarm-edit');

        $('.inner').on('click', '.alarm-edit', function () {
            var $row = $(this).closest('tr'),
                rowData = $row.data('rowData');

            var params = {
                //"SessionID": SessionID,
                "TrackID": rowData.TrackID,
                "AlarmID": rowData.AlarmID
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
                modal_show($modal);
            });
        });

        //提交
        $modal.on('click', '#alarm-edit-save', function () {
            var params = {
                //"SessionID": SessionID
            }

            params = NameSpace.String.getFormParams('#alarm-edit-form', params);
            if (params === false) {
                return false;
            }

            ajaxCall(URL.EditAlarm, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    console.log(params);
                    modal_hide($modal);
                    $('#alarm-query').click();
                } else alert(_message.Description);
            });
        });
    })();
});