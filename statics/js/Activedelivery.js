/*
    主动配送
*/
$(function () {
    var deliveryDemandStatusList,
        typeStr;

    for (var key in stateman.current.param) {
        typeStr = key;
    }
    //查询基础数据
    (function () {
        var params = {
            //"SessionID": SessionID
        }
        if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
        else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];
        ajaxCall(URL.ActiveDeliveryMeta, params, function (_message) {
            var $statusBox = $('#DeliveryDemandStatusList'),
                alarmHtml = '',
                statusHtml = '';

            deliveryDemandStatusList = _message.DeliveryDemandStatusList;
            for (var i in deliveryDemandStatusList) {
                statusHtml = statusHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + deliveryDemandStatusList[i].StatusID + '">' + deliveryDemandStatusList[i].DisplayName + '</label>';
            }
            $statusBox.html(statusHtml);
            NameSpace.Select.firstSelected($statusBox);
            $('.condition-list').find('.block-loading').hide();
        });
    })();

    //查询
    (function () {
        var $table = $('#activeQueryTable');

        $('.inner').on('click', '#activeDelivery-query', function () {
            var status = [],
                params = {
                    //"SessionID": SessionID
                };

            params = NameSpace.String.getFormParams('#active-delivery-query', params);
            if (params === false) {
                return false
            }

            $('#DeliveryDemandStatusList input[type=checkbox]:checked').each(function () {
                var value = $(this).val();
                status.push(value);
            });
            params['DeliveryDemandStatus'] = status.join();

            if (typeStr == 'sid') {
                params['StationID'] = stateman.current.param['sid'];
            } else if (typeStr == 'cid') {
                params['CompanyID'] = stateman.current.param['cid'];
            }
            var pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            $('.record-box').show();
            $table.show();
            var table = $table.DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false, //searching
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'order': [],
                'dom': 'lfrt<"dataTables_bottom"pi>',
                'destroy': true,
                'sAjaxSource': URL.ActiveDelivery,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);
                    ajaxCall(sSource, params, function (_message) {
                        console.log(_message);
                        total = _message.ActiveDeliveryList.length;
                        fnCallback(format(_message, total));
                    });
                },
                'createdRow': function (_row, _data, _dataIndex) {
                    var data = JSON.stringify(_data);
                    $(_row).attr('data-value', data);
                },
                'columns': [
                    {
                        'data': 'GsShortName'
                    },
                    {
                        'data': 'TankID',
                        'width': '80px'
                    },
                    {
                        'data': 'OtName',
                        'width': '10%'
                    },
                    {
                        'data': 'StatusName',
                        'width': '110px'
                    },
                    {
                        'data': 'DemandVol',
                        'width': '140px',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            return Math.round(_data); 
                        }
                    },
                    {
                        'data': 'CurVolume',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            return Math.round(_data); 
                        }
                    },
                    {
                        'data': 'CurUllage',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            return Math.round(_data); 
                        }
                    },
                    {
                        'data': 'LastDeliveryTime',
                        'width': '13%',
                        'render': function (_data, _type, _full, _meta) {
                            if (_data == "0001-01-01 00:00:00") return 'N/A';
                            else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'data': 'LastDeliveryVol',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            return Math.round(_data); 
                        }
                    },
                    {
                        'width': '80px',
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            if (_full.LinkVisible == true)
                                return '<a href="javascript:;" class="activeDelivery-edit"><i class="fa fa-edit"></i></a>';
                            else
                                return '<a href="javascript:;" class="activeDelivery-edit disabled"><i class="fa fa-edit"></i></a>';
                        }
                    }
                ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('16901'),
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
            } else if (typeStr == 'cid') column.visible(column.visible());

            function format(_data, _total) {
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.ActiveDeliveryList
                };
            }
        });
    })();

    //编辑
    (function () {
        $('.inner').on('click', '.activeDelivery-edit:not(.disabled)', function () {
            var $box = $('#active-delivery-edit'),
                $this = $(this),
                data = $this.parents('tr').data('value');

            $box.children().hide();
            $('.linktext', $box).text(data.LinkText);
            modal_show($box);
            if (data.ApplyVisible) {
                modal_show($box);
                $box.children('[data-status="apply"]').attr('data-value', JSON.stringify(data))
                    .show()
                    .find('[name="Volume"]').val(data.Volume);
            } else if (data.ApproveVisible) {
                modal_show($box);
                $box.children('[data-status="approve"]').attr('data-value', JSON.stringify(data))
                    .show()
                    .find('[name="Volume"]').val(Math.round(data.Volume));
            }
        });
        // 提交
        $('.inner').on('click', '#active-delivery-edit .btn-save', function () {
            var $modal = $(this).parents('.modal-dialog'),
                data = JSON.parse($(this).parents('.modal-dialog').attr('data-value')),
                MethodType = $modal.data('status') == 'apply' ? "1" : "2",
                params = {
                    //"SessionID": SessionID,
                    "RID": data.RID,
                    "Status": data.Status,
                    "MethodType": MethodType
                };

            if ($modal.data('status') == 'apply') params = NameSpace.String.getFormParams('[data-status="apply"]', params);
            else params = NameSpace.String.getFormParams('[data-status="approve"]', params);

            if (params == false) {
                return false;
            } else if (params.Volume <= 0) {
                alert(getI18n('16902'));
                return false;
            }
            ajaxCall(URL.ActiveDeliveryStatusChange, params, function (_message) {
                if (_message.IsUpdateSuccess == true) {
                    var $box = $('#active-delivery-edit');
                    modal_hide($box);
                    alert(getI18n('07001'));
                    $('.inner').find('#activeDelivery-query').click();
                } else {
                    alert(getI18n('07002') + ":" + _message.Description);
                }
            });
        });
        // 拒绝
        $('.inner').on('click', '#active-delivery-edit .btn-default', function () {
            var data = $(this).parents('.modal-dialog').data('value');
            params = {
                //"SessionID": SessionID,
                "RID": data.RID,
                "Volume": 0,
                "Status": data.Status,
                "MethodType": "3"
            };
            ajaxCall(URL.ActiveDeliveryStatusChange, params, function (_message) {
                if (_message.IsUpdateSuccess == true) {
                    var $box = $('#active-delivery-edit');
                    modal_hide($box);
                    alert(getI18n('07001'));
                    $('.inner').find('#activeDelivery-query').click();
                } else {
                    alert(getI18n('07002') + ":" + _message.Description);
                }
            });
        })
    })();
});