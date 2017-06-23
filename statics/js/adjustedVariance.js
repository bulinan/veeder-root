/*
    调整损溢
*/
$(function () {
    var typeStr, varianceTable;

    for (var key in stateman.current.param) {
        typeStr = key;
    }
    if (typeStr == 'sid') $('#variance-new').show();
    else if (typeStr == 'cid') $('#variance-new').hide();


    //新增
    (function () {
        $('#variance-new').on('click', function () {
            //调整损溢所需基础数据
            var $modal = $('#modal-addVariance'),
                date = new Date(),
                curDate = date.getFullYear() + '-' + NameSpace.Format.addFormat(date.getMonth() + 1) + '-' + NameSpace.Format.addFormat(date.getDate()) + ' ' + NameSpace.Format.addFormat(date.getHours()) + ':' + NameSpace.Format.addFormat(date.getMinutes()) + ':' + NameSpace.Format.addFormat(date.getSeconds()),
                params = {
                    //"SessionID": SessionID
                };

            $('input.input-box').val('');
            $('input[name=VarianceTime]').val(curDate);
            params['StationID'] = stateman.current.param[typeStr];
            ajaxCall(URL.AdjustedVarianceMeta, params, function (_message) {
                if (_message.Result == 'Success') {
                    var tankList = _message.TankList,
                        varianceTypeList = _message.VarianceTypeList,
                        tankHtml = '',
                        typeHtml = '';

                    for (var i in tankList) {
                        tankHtml = tankHtml + '<li data-value="' + tankList[i].TankID + '">' + tankList[i].DisplayName + '</li>';
                    }
                    for (var i in varianceTypeList) {
                        typeHtml = typeHtml + '<li data-value="' + varianceTypeList[i].VarianceType + '">' + varianceTypeList[i].DisplayName + '</li>';
                    }
                    $('#tankList').find('.select-con').html(tankHtml);
                    $('#varianceTypeList').find('.select-con').html(typeHtml);
                    NameSpace.Select.firstSelected($('#tankList'));
                    NameSpace.Select.firstSelected($('#varianceTypeList'));

                    modal_show($modal);
                } else {
                    alert(_message.Description);
                }
            });
        });
    })();

    //新增保存
    (function () {
        var $modal = $('#modal-addVariance');

        $('.btn-save', $modal).off().on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "MethodType": "Add",   //Add、Update、Confirm、Return、Delete
                "AdjustedVariance":
                {
                    "Gsid": stateman.current.param[typeStr],
                    "Tankid": $('#tankList').find('.select-title').attr('data-value'),
                    "VarianceTime": $('input[name=VarianceTime]', $modal).val(),
                    "Variance": $('input[name=Variance]', $modal).val(),
                    "VarType": $('#varianceTypeList').find('.select-title').attr('data-value'),
                    "VarReason": $('input[name=VarianceReason]', $modal).val()
                }
            },
            bool = true;
            bool = NameSpace.String.fieldRequired(bool, $modal, 'isAlert');
            bool = NameSpace.String.digitalControl(bool, $modal, 'isAlert');

            if (bool) {
                ajaxCall(URL.EditAdjustedVariance, params, function (_message) {
                    if (_message.Result == 'Success') {
                        modal_hide($modal, function () {
                            $('#variance-query').trigger('click');
                        });
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();

    //查询
    (function () {
        $('#variance-query').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "PageInfo": {}
            }, total;


            if (typeStr == 'cid') {
                params['CompanyID'] = stateman.current.param[typeStr];
                params['StationID'] = '0'; //默认为0，查询所有油站
            } else {
                params['CompanyID'] = '0'; //默认为0，查询用户公司下面所有油站
                params['StationID'] = stateman.current.param[typeStr];
            }

            params = NameSpace.String.getFormParams('#adjust-variance-query', params);
            console.log(params);
            if (params === false) {
                return false
            }

            $('.record-box').show();
            var $table = $('#adjustedVarianceTable'),
                pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            varianceTable = $table.show().DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                //'processing': true,
                'searching': false,
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'order': [['12','desc']],
                'dom': 'lfrt<"dataTables_bottom"pi>',
                'destroy': true,
                'sAjaxSource': URL.AdjustedVariance,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);

                    params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1;
                    params['PageInfo'].RequestCount = '';

                    ajaxCall(sSource, params, function (_message) {
                        console.log(_message);
                        if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                        fnCallback(format(_message, total));
                    });
                },
                'createdRow': function (row, data, dataIndex) {
                    data = JSON.stringify(data);
                    $(row).attr('data-value', data);
                },
                'columns': [
                    {
                        'width': '60px',
                        'orderable': false,
                        'data': 'EditEnable',
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="variance-edit"><i class="fa fa-edit"></i></a>';
                            else return '<a href="javascript:;" class="variance-edit disabled"><i class="fa fa-edit"></i></a>';
                        }
                    },
                    {
                        'width': '60px',
                        'orderable': false,
                        'data': 'ConfirmEnable',
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="variance-confirm text-style01">确认</a>';
                            else return '<a href="javascript:;" class="variance-confirm disabled">确认</a>';
                        }
                    },
                    {
                        'width': '60px',
                        'orderable': false,
                        'data': 'ReturnEnable',
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="variance-return text-style01">重填</a>';
                            else return '<a href="javascript:;" class="variance-return disabled">重填</a>';
                        }
                    },
                    {
                        'width': '60px',
                        'orderable': false,
                        'data': 'DeleteEnable',
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="variance-delete"><i class="fa fa-remove"></i></a>';
                            else return '<a href="javascript:;" class="variance-delete disabled"><i class="fa fa-remove"></i></a>';
                        }
                    },
                    {
                        'data': 'GsID'
                    },
                    {
                        'data': 'Tankid'
                    },
                    {
                        'data': 'OtName'
                    },
                    {
                        'data': 'VarianceTime',
                        'width': '160px',
                        'render': function (_data, _type, _full) {
                            var date = _data.split(' ');
                            return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                        }
                    },
                    {
                        'data': 'Variance',
                        'width': '100px',
                        'render': function (_data, _type, _full) {
                            return Math.round(_data);
                        }
                    },
                    {
                        'data': 'VarName'
                    },
                    {
                        'data': 'VarReason'
                    },
                    {
                        'data': 'Userid'
                    },
                    {
                        'data': 'RecTime',
                        'width': '160px',
                        'render': function (_data, _type, _full) {
                            var date = _data.split(' ');
                            return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                        }
                    },
                    {
                        'data': 'StateName',
                        'render': function (_data, _type, _full) {
                            return '<span class="text-style01">' + _data + '</span>';
                        }
                    }
                ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('30901'),
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
                /*_data.AdjustedVarianceList.sort(function (a, b) {
                    return  Date.parse(b.RecTime) - Date.parse(a.RecTime);
                });*/
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.AdjustedVarianceList
                };
            }
        });
    })();

    //编辑
    (function () {
        $('.station-body').find('.station-con').delegate('.variance-edit', 'click', function () {
            var $elem = $(this);

            if (!$elem.hasClass('disabled')) {
                var $modal = $('#modal-editVariance'),
                    data = JSON.parse($elem.closest('tr').attr('data-value')),
                    params = {
                        //"SessionID": SessionID,
                        "StationID": data.GsID
                    };

                $('input[name=VarianceTime]', $modal).val(data.VarianceTime);
                $('input[name=Variance]', $modal).val(Math.round(data.Variance));
                $('input[name=VarianceReason]', $modal).val(data.VarReason);
                $('input[name=Avid]', $modal).val(data.Avid);
                $('input[name=Gsid]', $modal).val(data.GsID);

                //调整损溢所需基础数据
                ajaxCall(URL.AdjustedVarianceMeta, params, function (_message) {
                    if (_message.Result == 'Success') {
                        var tankList = _message.TankList;

                        $('#tankList02').addClass('disabled').find('.select-title').attr('data-value', data.Tankid).find('span').text(tankName(data.Tankid));
                        $('#varianceTypeList02').addClass('disabled').find('.select-title').attr('data-value', data.VarType).find('span').text(data.VarName);

                        modal_show($modal);
                    } else {
                        alert(_message.Description);
                    }
                    function tankName(_tankId) {
                        for (var i in tankList) {
                            if (_tankId == tankList[i].TankID) return tankList[i].DisplayName;
                        }
                    }
                });
            }
        });
    })();

    //编辑保存
    (function () {
        var $modal = $('#modal-editVariance');

        $('.btn-save', $modal).off().on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "MethodType": "Update",
                "AdjustedVariance":
                {
                    "Avid": $('input[name=Avid]', $modal).val(),
                    "Gsid": $('input[name=Gsid]', $modal).val(),
                    "Tankid": $('#tankList02').find('.select-title').attr('data-value'),
                    "VarianceTime": $('input[name=VarianceTime]', $modal).val(),
                    "Variance": $('input[name=Variance]', $modal).val(),
                    "VarType": $('#varianceTypeList02').find('.select-title').attr('data-value'),
                    "VarReason": $('input[name=VarianceReason]', $modal).val()
                }
            },
            bool = true;
            bool = NameSpace.String.fieldRequired(bool, $modal, 'isAlert');
            bool = NameSpace.String.digitalControl(bool, $modal, 'isAlert');

            if (bool) {
                ajaxCall(URL.EditAdjustedVariance, params, function (_message) {
                    if (_message.Result == 'Success') {
                        modal_hide($modal, function () {
                            $('#variance-query').trigger('click');
                        });
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();

    //确认、重填
    (function () {
        $('.station-body').find('.station-con').delegate('.variance-confirm,.variance-return', 'click', function () {
            if (!$(this).hasClass('disabled')) {
                var data = JSON.parse($(this).closest('tr').attr('data-value')),
                    params = {
                        //"SessionID": SessionID,
                        "AdjustedVariance":
                        {
                            "Avid": data.Avid
                        }
                    }
                if ($(this).hasClass('variance-confirm')) params['MethodType'] = 'Confirm';
                else params['MethodType'] = 'Return';

                ajaxCall(URL.EditAdjustedVariance, params, function (_message) {
                    if (_message.Result == 'Success') {
                        alert(getI18n('07001'));
                        $('#variance-query').trigger('click');
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();

    //删除
    (function () {
        $('.station-body').find('.station-con').delegate('.variance-delete', 'click', function () {
            if (confirm(getI18n('30902'))) {
                var $tr = $(this).closest('tr'),
                    data = JSON.parse($tr.attr('data-value')),
                    params = {
                        //"SessionID": SessionID,
                        "MethodType": "Delete",
                        "AdjustedVariance":
                        {
                            "Avid": data.Avid,
                            "Gsid": data.GsID,
                            "Tankid": data.Tankid,
                            "VarianceTime": data.VarianceTime
                        }
                    }
                ajaxCall(URL.EditAdjustedVariance, params, function (_message) {
                    if (_message.Result == 'Success') {
                        varianceTable.row($tr).remove().draw();
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();
});