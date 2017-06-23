/*
    油枪精度管理
*/

$(function () {
    var StationID = stateman.current.param['sid'];

    var nozzleList = '',
        nozzleStatusList = '',
        measureMethodList = '',
        nozzleCheckList,
        nozzleTable;

    //新增记录弹窗
    (function () {
        var $box = $('.modal-nozzle');
        $('.station-body').find('.station-con').on('click', '#modal-nozzle', function () {
            if (nozzleList == '') {
                var params = {
                    //"SessionID": SessionID,
                    "StationID": StationID
                };
                ajaxCall(URL.NozzleCheck, params, function (_message) {
                    console.log(_message);
                    nozzleList = _message.NozzleList;
                    nozzleStatusList = _message.NozzleStatusList;
                    measureMethodList = _message.MeasureMethodList;
                    get_list(nozzleList, nozzleStatusList, measureMethodList, $box);
                    modal_new_init($box);
                });
            } else {
                get_list(nozzleList, nozzleStatusList, measureMethodList, $box);
                modal_new_init($box);
            }
            $box.removeAttr('data-id');
            modal_show($box);

            //检测切换
            $('input[name=new-detection-way]:radio', $box).on('click', function () {
                var value = $(this).val();

                if (value == '0') $('.form-list', $box).eq(0).show().siblings('.form-list').hide();
                else $('.form-list', $box).eq(1).show().siblings('.form-list').hide();
            });
        });
    })();

    //保存
    (function () {
        var $box = $('.modal-nozzle');
        $box.on('click', '.btn-save', function () {
            var checkType = $('input[name=new-detection-way]:checked', $box).val(),
                params = {
                    //"SessionID": SessionID,
                    "NozzleDesc": $('#NozzleList').find('.select-title span').text(),   //油枪号
                    //"CheckDate": $('input[name=CheckDate]', $box).val(),                    //检定时间"、"自检时间
                    "NozzleStatus": $('#NozzleStatusList').find('.select-title').attr('data-value')   //油枪状态
                },
                nozzleId = $('#NozzleList').find('.select-title').attr('data-value'),
                checkDate = $('input[name=CheckDate]', $box).val(),
                bool = true;

            if (nozzleId == '' || nozzleId === undefined) {
                alert(getI18n('29903'));
                return false;
            }
            if (checkDate == '' || checkDate.replace(/(^\s*)|(\s*$)/g, '').length == 0) {
                alert(getI18n('10061') + getI18n('09013'));
                return false;
            }
            params['Nozzleid'] = nozzleId; //油枪ID
            params['CheckDate'] = checkDate;
            if ($(this).hasClass('btn-new-save')) params['Operation'] = 'Add';
            else {
                params['Operation'] = 'Update';
                if (checkType == '0') params['Ncoid'] = $box.attr('data-id');
                else params['Ncsid'] = $box.attr('data-id');
            }

            /*---是文本输入框，如果为空传0或者不传这个字段*/

            if (checkType == '0') {
                var variance = $('input[name=Variance]', $box).val(),
                    repeatVariance = $('input[name=RepeatVariance]', $box).val(),
                    expireDate = $('input[name=ExpireDate]', $box).val();

                params['CheckType'] = '0';
                if (bool && (expireDate == '' || expireDate.replace(/(^\s*)|(\s*$)/g, '').length == 0)) {
                    bool = false;
                    alert(getI18n('29015') + getI18n('09013'));
                }
                if (bool && !/^(-?\d*)(\.\d+)?$/.test(variance)) {
                    bool = false;
                    alert(getI18n('10062') + getI18n('09014'));
                }
                if (bool && !/^(-?\d*)(\.\d+)?$/.test(repeatVariance)) {
                    bool = false;
                    alert(getI18n('29016') + getI18n('09014'));
                }
                if (bool && variance != '') params['Variance'] = variance; //示值误差(%) ---
                if (bool && repeatVariance != '') params['RepeatVariance'] = repeatVariance; //(%) ---

                params['ExpireDate'] = expireDate; //有效时间

                if ($('input[name=NozzleAdjusted]').prop('checked')) params['NozzleAdjusted'] = 1;
                else params['NozzleAdjusted'] = 0;

            } else {
                var nozzleValue = $('input[name=NozzleValue]', $box).val(),
                    stdContValue = $('input[name=StdContValue]', $box).val();

                params['CheckType'] = '1';
                if (bool && !/^(-?\d*)(\.\d+)?$/.test(nozzleValue)) {
                    bool = false;
                    alert(getI18n('29021') + getI18n('09014'));
                }
                if (bool && !/^(-?\d*)(\.\d+)?$/.test(stdContValue)) {
                    bool = false;
                    alert(getI18n('29022') + getI18n('09014'));
                }
                if (bool && nozzleValue != '') params['NozzleValue'] = nozzleValue; //加油枪示值 ---
                if (bool && stdContValue != '') params['StdContValue'] = stdContValue; //标准量器示值(L) ----

                params['MeasureRemark'] = $('input[name=MeasureRemark]', $box).val();
                params['MeasureMethod'] = $('#MeasureMethodList').find('.select-title').attr('data-value');
            }
            if (bool) {
                ajaxCall(URL.NozzleCheckEdit, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        $('#overlay').hide();
                        $box.hide();
                        $('#nozzle-query').trigger('click');
                    }
                    else alert(_message.Description);
                });
            }
        });
    })();

    function get_list(nozzleList, nozzleStatusList, measureMethodList, _modal) {
        $('.select-con', _modal).html('');

        for (var i in nozzleList) {
            $('#NozzleList').find('.select-con').append('<li data-value=' + nozzleList[i].NozzleID + '>' + nozzleList[i].DisplayName + '</li>'); //油枪号
        }

        for (var i in nozzleStatusList) {
            $('#NozzleStatusList').find('.select-con').append('<li data-value=' + nozzleStatusList[i].StatusID + '>' + nozzleStatusList[i].DisplayName + '</li>'); //油枪状态
        }

        for (var i in measureMethodList) {
            $('#MeasureMethodList').find('.select-con').append('<li data-value=' + measureMethodList[i].MethodID + '>' + measureMethodList[i].DisplayName + '</li>'); //自检方法
        }
    }

    //新增记录初始化modal
    function modal_new_init(_modal) {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            curDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + NameSpace.Format.addFormat(day),
            checkType = parseInt($('input[name=detection-way]:checked').val());

        $('.modal-title', _modal).text(getI18n('29025'));
        $('.radio-inline', _modal).show();
        $('.form-list', _modal).eq(checkType).show().siblings('.form-list').hide();
        $('.radio-inline', _modal).eq(checkType).find('input').prop('checked', true);
        $('input[type=text]', _modal).val('');
        $('.select-box').removeClass('disabled');
        $('input[name=CheckDate]', _modal).val(curDate);
        $('input[name=ExpireDate]', _modal).val(curDate);
        $('input[name=NozzleAdjusted]').prop('checked', false);

        $('.modal-nozzle .select-con').each(function () {
            var selectedText = $(this).find('li').eq(0).text(),
                selectedId = $(this).find('li').eq(0).attr('data-value');

            $(this).prev().attr('data-value', selectedId).find('span').text(selectedText);
        });
        $('.btn-save', _modal).addClass('btn-new-save').removeClass('btn-edit-save');
    }

    //修改记录初始化modal
    function modal_edit_init(_modal) {
        $('.modal-title', _modal).text(getI18n('29028'));
        $('.btn-save', _modal).addClass('btn-edit-save').removeClass('btn-new-save');
        $('.select-con', _modal).html('');
        $('#NozzleList').addClass('disabled');
        $('#NozzleStatusList').addClass('disabled');
        //填充下拉列表
        for (var i in measureMethodList) {
            $('#MeasureMethodList').find('.select-con').append('<li data-value=' + measureMethodList[i].MethodID + '>' + measureMethodList[i].DisplayName + '</li>'); //自检方法
        }
    }

    //数据匹配
    function data_match(_type, _id) {
        var attr;
        if (_type == '0') attr = 'Ncoid';
        else attr = 'Ncsid';
        for (var i in nozzleCheckList) {
            if (_id == nozzleCheckList[i][attr]) {
                return nozzleCheckList[i];
            }
        }
    }

    function status_macth(_status) {
        for (var i in nozzleStatusList) {
            if (_status == nozzleStatusList[i].StatusID) return nozzleStatusList[i].DisplayName;
        }
    }

    function method_macth(_methodID) {
        for (var i in measureMethodList) {
            if (_methodID == measureMethodList[i].MethodID) return measureMethodList[i].DisplayName;
        }
    }

    //编辑
    (function () {
        $('.station-body').find('.station-con').delegate('.nozzle-edit', 'click', function () {
            //跟新增记录用同一个弹出框
            var $box = $('.modal-nozzle'),
                $elem = $(this),
                checkType = $elem.attr('data-detection'),
                id = $elem.attr('data-id'),
                str = $elem.attr('data-all');
            //data = JSON.parse(str);

            //console.log(str);
            var data = data_match(checkType, id);
            modal_edit_init($box);

            console.log(data);
            //检测方式
            $('.radio-inline', $box).hide();
            var radioObj = document.getElementsByName('new-detection-way');
            for (var i = 0; i < radioObj.length; i++) {
                if (radioObj[i].value == checkType) {
                    radioObj[i].checked = true;
                    $('input[name=new-detection-way]:checked', $box).parent().show();
                }
            }
            //公用部分
            $('#NozzleList').find('.select-title').attr('data-value', data.Nozzleid).find('span').text(data.NozzleDesc);
            $('input[name=CheckDate]', $box).val(data.CheckDate.split(' ')[0]);
            $('#NozzleStatusList').find('.select-title').attr('data-value', data.NozzleStatus).find('span').text(status_macth(data.NozzleStatus));


            if (checkType == '0') {
                $('.form-list', $box).eq(0).show().siblings('.form-list').hide();
                $('input[name=ExpireDate]', $box).val(data.ExpireDate.split(' ')[0]);
                $('input[name=Variance]', $box).val(data.Variance);
                $('input[name=RepeatVariance]', $box).val(data.RepeatVariance);
                if (data.NozzleAdjusted) {
                    $('input[name=NozzleAdjusted]').prop('checked', true);
                } else {
                    $('input[name=NozzleAdjusted]').prop('checked', false);
                }
                $box.attr('data-id', data.Ncoid);
            } else {
                $('.form-list', $box).eq(1).show().siblings('.form-list').hide();
                $('input[name=NozzleValue]', $box).val(data.NozzleValue);
                $('input[name=StdContValue]', $box).val(data.StdContValue);
                $('input[name=MeasureRemark]', $box).val(data.MeasureRemark);
                $('#MeasureMethodList').find('.select-title').attr('data-value', data.MeasureMethod).find('span').text(method_macth(data.MeasureMethod));
                $box.attr('data-id', data.Ncsid);
            }
            modal_show($box);
        });
    })();

    //删除
    (function () {
        $('.station-body').find('.station-con').delegate('.nozzle-remove', 'click', function () {
            var $element = $(this),
                $tr = $element.closest('tr'),
                checkType = $element.attr('data-detection'),
                id = $element.attr('data-id'),
                params = {
                    //"SessionID": SessionID,
                    "Operation": "Delete",
                    "CheckType": checkType
                };
            if (params['CheckType'] == '0') params['Ncoid'] = id;  //外部强检记录号
            else params['Ncsid'] = id; //内部自检记录号

            if (confirm(getI18n('29902'))) {
                ajaxCall(URL.NozzleCheckEdit, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        //$('#nozzle-query').trigger('click'); //重新查询
                        nozzleTable.row($tr).remove().draw();
                    }
                    else alert(_message.Description);
                });
            }

        });
    })();

    //查询
    (function () {
        var $box = $('.station .condition-list');

        $('input[name=query-way]:radio', $box).on('click', function () {
            var value = $(this).val();

            if (value == '1') {
                $('.date-con', $box).show();
                $('.record-box').addClass('date-unfold');
            } else {
                $('.date-con', $box).hide();
                $('.record-box').removeClass('date-unfold');
            }
        });

        $('#nozzle-query').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID,
                "CheckType": $('input[name=detection-way]:checked', $box).val(), //0 外部强检;1 内部自检
                "QueryType": $('input[name=query-way]:checked', $box).val(),     //0 最近两条;1 按时间区域
                "PageInfo": {

                }
            };

            if (params['QueryType'] == '1') {         //按时间区域查询时才需要传值
                //params['BeginDate'] = $('input[name=begindate]').val();
                //params['EndDate'] = $('input[name=enddate]').val();
                params = NameSpace.String.getFormParams('#nozzle-query-form', params);
                if (params === false) {
                    return false
                }
            }

            //显示数据
            var pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            $('.record-box').show();
            $('.legend-demo').show();
            $('.dataTables_wrapper').hide();
            if (params['CheckType'] == '0') {
                var $table = $('#nozzleCheck01');

                $table.show().find('tbody').html('');
                nozzleTable = $table.DataTable({
                    'lengthMenu': [10, 20, 50, 75, 100],
                    'searching': false,
                    'pagingType': 'full_numbers',
                    'pageLength': pagelen,
                    'dom': 'lfrt<"dataTables_bottom"pi>',
                    'destroy': true,
                    'sAjaxSource': URL.NozzleCheck,
                    'fnServerData': function (sSource, aoData, fnCallback, oSettings) {

                        params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1; // 请求的开始记录编号
                        //params['PageInfo'].RequestCount = ''; // 请求记录数量

                        ajaxCall(sSource, params, function (_message) {
                            console.log(_message);
                            nozzleCheckList = _message.NozzleCheckList.Detail; //查询结果赋给全局变量，编辑的时候可以根据唯一属性进行数据匹配
                            nozzleList = _message.NozzleList;
                            nozzleStatusList = _message.NozzleStatusList;
                            measureMethodList = _message.MeasureMethodList;

                            //事例数据
                            var $legendBox = $('.legend-demo'),
                                nozzleCount = [
                                    _message.NozzleCheckList.NozzleTotalCount,
                                    _message.NozzleCheckList.NozzleBelow2Count,
                                    _message.NozzleCheckList.NozzleBelow3Count,
                                    _message.NozzleCheckList.StopNozzleCount
                                ];
                            $('strong', $legendBox).text(_message.NozzleCheckList.StationName);
                            for (var i = 0; i < nozzleCount.length; i++) {
                                $legendBox.find('li').eq(i + 1).find('p').text(nozzleCount[i] + getI18n('01008'));
                            }

                            if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                            fnCallback(format(_message, total));
                        });
                    },
                    'columns': [
                        {
                            'data': 'Ncoid',
                            'width': '60px',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                var str = JSON.stringify(_full);
                                return '<a href="javascript:;" class="nozzle-edit" data-detection="0" data-all=\'' + str + '\' data-id="' + _data + '"><i class="fa fa-edit"></i></a>'; //data-detection表示检测方式
                                //return '<a href="javascript:;" class="nozzle-edit" data-detection="0" data-all=' + str + '><i class="fa fa-edit"></i></a>';
                            }
                        },
                        {
                            'data': 'Ncoid',
                            'width': '60px',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                return '<a href="javascript:;" class="nozzle-remove" data-detection="0" data-id="' + _data + '"><i class="fa fa-remove"></i></a>';
                            }
                        },
                        {
                            'data': 'TankId'
                        },
                        {
                            'data': 'NozzleDesc'
                        },
                        {
                            'data': 'CheckDate',
                            'render': function (_data, _type, _full) {
                                var date = _data.split(' ');
                                return '<span class="date">' + date[0] + '</span>';
                            }
                        },
                        {
                            'data': 'ExpireDate',
                            'render': function (_data, _type, _full) {
                                var date = _data.split(' ');
                                return '<span class="date">' + date[0] + '</span>';
                            }
                        },
                        {
                            'data': 'Variance',
                            'render': function (_data, _type, _full) {
                                var abs = Math.abs(_data); //按照绝对值>0.2 0.3来添加颜色

                                if (abs > 0.2 && abs <= 0.3) return '<span class="text-style03">' + _data + '</span>';
                                else if (abs > 0.3) return '<span class="text-style04">' + _data + '</span>';
                                else return _data;
                            }
                        },
                        {
                            'data': 'RepeatVariance'
                        },
                        {
                            'data': 'NozzleAdjusted',
                            'width': '120px',
                            'render': function (_data, _type, _full) {
                                if (_data == '1') return getI18n('09002');
                                else return getI18n('09003');
                            }
                        },
                        {
                            'data': 'Userid'
                        },
                        {
                            'data': 'NozzleStatus',
                            'render': function (_data, _type, _full) {
                                return status_macth(_data);
                            }
                        }
                    ],
                    'language': {
                        'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                        'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                        'loadingRecords': getI18n('10801'),
                        'infoEmpty': getI18n('10802'),
                        'emptyTable': getI18n('29901'),
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
            } else {
                var $table = $('#nozzleCheck02');

                $table.show().find('tbody').html('');
                nozzleTable = $table.DataTable({
                    'lengthMenu': [10, 20, 50, 75, 100],
                    'searching': false,
                    'pagingType': 'full_numbers',
                    'pageLength': pagelen,
                    'dom': 'lfrt<"dataTables_bottom"pi>',
                    'destroy': true,
                    'sAjaxSource': URL.NozzleCheck,
                    'fnServerData': function (sSource, aoData, fnCallback, oSettings) {

                        params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1; // 请求的开始记录编号
                        //params['PageInfo'].RequestCount = ''; // 请求记录数量

                        ajaxCall(sSource, params, function (_message) {
                            console.log(_message);
                            nozzleCheckList = _message.NozzleCheckList.Detail;
                            nozzleList = _message.NozzleList;
                            nozzleStatusList = _message.NozzleStatusList;
                            measureMethodList = _message.MeasureMethodList;

                            //事例数据
                            var $legendBox = $('.legend-demo'),
                                nozzleCount = [
                                    _message.NozzleCheckList.NozzleTotalCount,
                                    _message.NozzleCheckList.NozzleBelow2Count,
                                    _message.NozzleCheckList.NozzleBelow3Count,
                                    _message.NozzleCheckList.StopNozzleCount
                                ];
                            $('strong', $legendBox).text(_message.NozzleCheckList.StationName);
                            for (var i = 0; i < nozzleCount.length; i++) {
                                $legendBox.find('li').eq(i + 1).find('p').text(nozzleCount[i] + getI18n('01008'));
                            }

                            if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                            fnCallback(format(_message, total));
                        });
                    },
                    'columns': [
                        {
                            'data': 'Ncsid',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                var str = JSON.stringify(_full);
                                return '<a href="javascript:;" class="nozzle-edit" data-detection="1" data-all=' + str + ' data-id="' + _data + '"><i class="fa fa-edit"></i></a>'; //data-detection表示检测方式
                            }
                        },
                        {
                            'data': 'Ncsid',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                return '<a href="javascript:;" class="nozzle-remove"  data-detection="1"  data-id="' + _data + '"><i class="fa fa-remove"></i></a>';
                            }
                        },
                        {
                            'data': 'TankId'
                        },
                        {
                            'data': 'NozzleDesc'
                        },
                        {
                            'data': 'CheckDate',
                            'render': function (_data, _type, _full) {
                                var date = _data.split(' ');
                                return '<span class="date">' + date[0] + '</span>';
                            }
                        },
                        {
                            'data': 'NozzleValue'
                        },
                        {
                            'data': 'StdContValue'
                        },
                        {
                            'data': 'RelativeVar',
                            'render': function (_data, _type, _full) {
                                _data = NameSpace.Number.keepTwoDecimal(_data);
                                var abs = Math.abs(_data); //按照绝对值>0.2 0.3来添加颜色

                                if (abs > 0.2 && abs <= 0.3) return '<span class="text-style03">' + _data + '</span>';
                                else if (abs > 0.3) return '<span class="text-style04">' + _data + '</span>';
                                else return _data;
                            }
                        },
                        {
                            'data': 'Userid'
                        },
                        {
                            'data': 'MeasureMethod',
                            'render': function (_data, _type, _full) {
                                return method_macth(_data);
                            }
                        },
                        {
                            'data': 'MeasureRemark'
                        },
                        {
                            'data': 'NozzleStatus',
                            'render': function (_data, _type, _full) {
                                return status_macth(_data);
                            }
                        }
                    ],
                    'language': {
                        'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                        'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                        'loadingRecords': getI18n('10801'),
                        'infoEmpty': getI18n('10802'),
                        'emptyTable': getI18n('29901'),
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

            function format(_data, _total) {
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.NozzleCheckList.Detail
                };
            }
        });
    })();
});