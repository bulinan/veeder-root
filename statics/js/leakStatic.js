/*
    测漏管理
*/
$(function () {
    var StationID = stateman.current.param['sid'],
        $modal = $('.leak-tab-static .modal-leak');
    //开始测漏保存
    (function () {
        $('#open-static-leak').on('click', function () {
            if (!$(this).hasClass('btn-disabled')) {
                var params = {
                    //"SessionID": SessionID,
                    "StationID": StationID
                }
                params = NameSpace.String.getFormParams('#start-leak-form', params);
                if (params === false) {
                    return false;
                }

                ajaxCall(URL.StartLeakDetect, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        alert(_message.Description);
                        modal_hide($modal, function () {
                            $('#leak-query').trigger('click');
                        });
                    }
                    else alert(_message.Description);
                });
            }
        });
    })();
});

//开始测漏基础数据
function modalLeakStaticBtn() {
    var StationID = stateman.current.param['sid'],
        $modal = $('.leak-tab-static .modal-leak');

    var params = {
        //"SessionID": SessionID,
        "StationID": StationID
    }

    modal_show($modal);
    $('input[name=BeginDate]', $modal).val(NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm'));
    ajaxCall(URL.StartLeakDetectMeta, params, function (_message) {
        console.log(_message);
        var $tankList = $('.leak-tab-static #TankList'),
            tankHtml = '';

        for (var i in _message.TankList) {
            tankHtml = tankHtml + '<li data-value=' + _message.TankList[i].TankID + '>' + _message.TankList[i].DisplayName + '</li>';
        }
        $tankList.find('.select-con').html(tankHtml);

        NameSpace.Select.firstSelected($tankList);
        leakMethodByTankID(_message.TankList[0].LeakMethod);

        NameSpace.Select.select_tankLeakMethod = function (_element, _selector) {
            var tankId = _element.attr('data-value'),
                leakMethod;

            for (var i in _message.TankList) {
                if (tankId == _message.TankList[i].TankID) {
                    leakMethod = _message.TankList[i].LeakMethod;
                }
            }
            leakMethodByTankID(leakMethod);
        }
    });

    function leakMethodByTankID(_data) {
        var StationID = stateman.current.param['sid'],
            $modal = $('.leak-tab-static .modal-leak');

        console.log(_data);
        var $leakMethod = $('.leak-tab-static #LeakMethod'),
            methodHtml = '';

        if (!_data.length) {
            $('.btn-save', $modal).addClass('btn-disabled');
            NameSpace.String.alert(getI18n('26016'), 'show', $('.leak-tab-static .msg-tip'));
        } else {
            for (var i in _data) {
                methodHtml = methodHtml + '<li data-value=' + _data[i].LeakMethod + '>' + _data[i].DisplayName + '</li>';
            }
            $('.leak-tab-static .msg-tip').hide();
            $('.btn-save', $modal).removeClass('btn-disabled');
        }
        $leakMethod.find('.select-con').html(methodHtml);
        NameSpace.Select.firstSelected($leakMethod);
    }
}

// 侧漏管理查询
function leakStaticSearchBtn() {

    var StationID = stateman.current.param['sid'];

    var params = {
        //"SessionID": SessionID,
        "StationID": StationID,
        "PageInfo": {}
    }

    params = NameSpace.String.getFormParams('#leak-management-query', params);
    if (params === false) {
        return false
    }
    $('.leak-tab-static .record-box').show();
    var pagelen = $('.leak-tab-static .record-box input[type=hidden]').val();

    if (pagelen == '') pagelen = 20;
    else pagelen = parseInt(pagelen);
    $('.leak-tab-static .record-box input[type=hidden]').val(pagelen);

    var $table = $('body').find('.leak-tab-static #leakQueryTable');
    $table.show().find('tbody').html('');
    $table.dataTable({
        'lengthMenu': [10, 20, 50, 75, 100],
        'searching': false, //searching
        'pagingType': 'full_numbers',
        'pageLength': pagelen,
        'dom': 'lfrt<"dataTables_bottom"pi>',
        'order': [],
        'destroy': true,
        'sAjaxSource': URL.LeakDetect,
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
        'createdRow': function (_row, _data, _dataIndex) {
            var data = JSON.stringify(_data);
            $(_row).attr('data-value', data);
        },
        'columns': [
            {
                'data': 'Tankid',
                'width': '70px'
            },
            {
                'data': 'TestRate'
            },
            {
                'data': 'Method'
            },
            {
                'data': 'TestStartTime',
                'width': '13%',
                'render': function (_data, _type, _full, _meta) {
                    if (_data == "0001-01-01 00:00:00") return 'N/A';
                    else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1].slice(0,-3) + '</span>';
                }
            },
            {
                'data': 'Duration',
                'render': function (_data, _type, _full) {
                    return Math.round(_data);
                }
            },
            {
                'data': 'StartingVolume',
                'render': function (_data, _type, _full) {
                    return Math.round(_data);
                }
            },
            {
                'data': 'StartingTemp',
                'render': function (_data, _type, _full) {
                    return Math.round(_data);
                }
            },
            {
                'data': 'EndingTemp',
                'render': function (_data, _type, _full) {
                    return Math.round(_data);
                }
            },
            {
                'data': 'TestResultDesc'
            },
            {
                'data': 'EndingRate',
                'render': function (_data, _type, _full) {
                    return Math.round(_data);
                }
            },
            {
                'data': 'Changes'
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
        return {
            recordsTotal: _total,
            recordsFiltered: _total,
            data: _data.LeakDetectList
        };
    }
}