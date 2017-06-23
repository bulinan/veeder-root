$(function () {
    var pageParam = stateman.current.param,
        StationID = pageParam['sid'],
        claimStateList, claimCompensationMethodList;


    function intervalMatch(_param) {
        for (var i in timeMap) {
            if (i == _param) return timeMap[i];
        }
        return '';
    }

    (function () {
        //油罐
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID
        }
        ajaxCall(URL.TankList, params, function (_message) {
            for (var index in _message.TankList) {
                $('#tank-list').find('.select-con').append('<li data-value=' + _message.TankList[index].TankID + '>' + _message.TankList[index].DisplayName + '</li>');
            }
            if (pageParam['tankID']) {
                console.log(pageParam['tankID']);
                NameSpace.Select.selectedByParam($('#tank-list'), pageParam['tankID']);
                $('#param-submit').trigger('click');
            }
            $('.condition-list').find('.block-loading').hide();
        });
    })();

    // 油品参数列表
    (function () {
        $('.station-body').find('.station-con').on('click', '#param-submit', function () {
            var params = {
                //"SessionID": SessionID,
                'StationID': StationID
            }

            params = NameSpace.String.getFormParams('#tank-param-query', params);
            if (params === false) {
                return false
            }

            var pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            var $table = $('.station-body').find('.tank-param-con table');
            $table.show().find('tbody').html('');
            $('body').find('.record-box').show();
            $table.DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false, //searching
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'dom': 'lfrt<"dataTables_bottom"pi>',
                'ordering': false,
                'destroy': true,
                'sAjaxSource': URL.TankParam,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);
                    //aoData = params; //aoData跟params不一样，它包含params和其他参数
                    ajaxCall(sSource, params, function (_message) {
                        var total = _message.TankParamList.length;
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
                            'width': '100px',
                            'render': function (_data, _type, _full) {
                                if (params.TankID == '0') {
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
                            'render': function (_data, _type, _full) {
                                if (_data == '') {
                                    return '';
                                } else {
                                    if (_full.ViewEnable == true) return '<a href="javascript:;" class="tank-param-view text-style01">' + getI18n('09908') + '</a>';
                                    else {
                                        if (aryEditIds3.indexOf(_full.Paramid) !== -1  && _data === disabledStatusCons.key)
                                        {
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
                        },
                        {
                            'data': 'RecTime',
                            'render': function (_data, _type, _full) {
                                if (_data == "0001-01-01 00:00:00") return 'N/A';
                                else if (_data == '' || _data == null || _data == undefined) return 'N/A';
                                else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                            }
                        },
                        {
                            'width': '100px',
                            'render': function (_data, _type, _full) {
                                if (_full.EditEnable == true) return '<a href="javascript:;" class="icon-edit tank-param-edit"><i class="fa fa-edit"></i></a>';
                                else return '<a href="javascript:;" class="icon-edit disabled"><i class="fa fa-edit "></i></a>';
                            }
                        }
                    ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('28901'),
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
                    data: _data.TankParamList
                };
            }
        });

        //关闭弹窗
        $('#modal-tank-param-edit').on('click', '.modal-close', function () {
            $('#param-submit').trigger('click');
        });
    })();

    //详情
    (function () {
        $('.station-body').find('.station-con').delegate('.tank-param-edit', 'click', function () {
            var data = JSON.parse($(this).closest('tr').attr('data-value')),
                $modal = $('#modal-tank-param-edit');

            $modal.find('.main-content').attr('data-value', $(this).closest('tr').attr('data-value'));
            $modal.find('[name="paramName"]').val(data.ParamName);
            
            if (aryEditIds3.indexOf(data.Paramid) !== -1 && data.ActiveValue === disabledStatusCons.key) {
                data.ActiveValue = disabledStatusCons.value;
            }
            $modal.find('[name="paramValue"]').val(data.ActiveValue);
             
            $modal.find('[name="paramValue"]').parent().parent().show();
            $modal.find('[name="ModifiedValue"]').attr('disabled', false);
            $modal.find('.tank-param-edit-list').hide();
            $modal.find('.forbidden').show().find('input.do-forbidden').prop('checked', false);

            if (aryEditIds1.indexOf(data.Paramid) !== -1) {
                if (data.Paramid == 121) $modal.find('.forbidden').hide();
                $modal.find('[name="ModifiedValue"]').val('');
                $modal.find('#tank-param-edit-list-1').show();
            } else if (aryEditIds2.indexOf(data.Paramid) !== -1) {
                $modal.find('[name="ModifiedValue"]').val('');
                $modal.find('#tank-param-edit-list-2').show();
            } else if (data.Paramid == 101) {
                var params = {
                    //"SessionID": SessionID
                }
                ajaxCall(URL.ProductList, '{}', function (_message) {
                    var productList = _message.ProductList;
                    $modal.find('#tank-param-edit-list-101').find('#ProductList').find('.select-con').html('');
                    for (var index in productList) {
                        $modal.find('#tank-param-edit-list-101').find('#ProductList').find('.select-con').append('<li data-value=' + productList[index].ProductID + '>' + productList[index].DisplayName + '</li>');
                    }
                });
                $modal.find('#tank-param-edit-list-101').show();
            } else if (data.Paramid == 122) {
                $modal.find('#tank-param-edit-list-122').show();
                $modal.find('[name="paramValue"]').val(intervalMatch(data.ActiveValue));
            } else if (data.Paramid == 203) {
                $modal.find('[name="paramValue"]').parent().parent().hide();
                $modal.find('[name="ModifiedValue"]').val('');
                $modal.find('#tank-param-edit-list-203').show();
            } else {
                alert(getI18n('28902'));
                return;
            }
            $('.select-box', $modal).find('.select-title').attr('data-value', '').find('span').text(getI18n('20024'));
            modal_show($modal);
        });

        $('#modal-tank-param-edit').on('click', '.tank-param-edit-submit', function () {
            var $list = $(this).parents('.main-content').children('.tank-param-edit-list:visible'),
                data = JSON.parse($list.parent().attr('data-value')),
                params = {
                    //"SessionID": SessionID,
                    "StationID": StationID,
                    "TankID": data.Tankid,
                    "ParamID": data.Paramid
                };

            params = NameSpace.String.getFormParams('#' + $list.attr('id'), params);
            if (params === false) {
                return false
            }

            if (data.Paramid == 101) {
                //params.ProductName = $list.find('[name="ModifiedValue"]').text();
                params.ModifiedValue = $list.find('[name="ModifiedValue"]').text();
            } else {
                params.ProductName = '';
            }

            // 验证
            if (params.ModifiedValue == data.ActiveValue || Number(params.ModifiedValue) == Number(data.ActiveValue)) {
                if (data.Paramid != 101 && data.Paramid != 122) {
                    alert(getI18n('28903'));
                    return false;
                }
            }
            if (aryEditIds1.indexOf(data.Paramid) !== -1) {
                if (data.Paramid !== 121 && $("#modal-tank-param-edit .do-forbidden")[0].checked)
                {
                    params.ModifiedValue = disabledStatusCons.key;
                    if(params.ModifiedValue === data.ActiveValue)
                    {
                        alert(getI18n('28903'));
                        return false;
                    }
                }
                if (params.ModifiedValue != disabledStatusCons.key || data.Paramid == 121) {
                    if (params.ModifiedValue.length !== 4 || parseInt(params.ModifiedValue) != params.ModifiedValue) {
                        alert(getI18n('20025'));
                        return false;
                    }

                    if (params.ModifiedValue.slice(0, 2) > 23 || params.ModifiedValue.slice(0, 2) < 0) {
                        alert(getI18n('20025'));
                        return false;
                    }

                    if (params.ModifiedValue.slice(2) > 59 || params.ModifiedValue.slice(2) < 0) {
                        alert(getI18n('20025'));
                        return false;
                    }
                }
            } else if (aryEditIds2.indexOf(data.Paramid) !== -1) {
                if (parseFloat(params.ModifiedValue) != params.ModifiedValue) {
                    alert(getI18n('20008'));
                    return false;
                }
                //if (data.Paramid == 128) {
                //    console.log(params.ModifiedValue);
                //    if (params.ModifiedValue < 19.05 || params.ModifiedValue > 127) {
                //        alert(getI18n('28010'));
                //        return false;
                //    }
                //}
            } else if (data.Paramid == 203) {
                if (params.ModifiedValue.length < 3 || params.ModifiedValue.length > 10) {
                    alert(getI18n('28009'));
                    return false;
                }
            } else if (data.Paramid == 101) {
                if (params.ModifiedValue == data.ActiveValue) {
                    alert(getI18n('27905') + params.ModifiedValue);
                    return false;
                }
            } else if (data.Paramid == 122) {
                var newValue = $('#' + $list.attr('id')).find('.select-title').attr('data-value'),
                    oldValue = data.ActiveValue;

                if (newValue === oldValue) {
                    alert(getI18n('28903'));
                    return false;
                }
            }

            ajaxCall(URL.TankParamSet, params, function (_message) {
                if (_message.Result == 'Success') {
                    alert(_message.Description);
                    modal_hide($('#modal-tank-param-edit'));
                    $('#param-submit').trigger('click');
                } else {
                    alert(_message.Description);
                }
            });
        });

        $('#modal-tank-param-edit').on('click', '.do-forbidden', function () {
            var $this = $(this);
            if ($this.is(':checked')) {
                $this.parent().prev().val(disabledStatusCons.value).attr('disabled', true);
            } else {
                $this.parent().prev().val('').attr('disabled', false);
            }
        });

        $('.station-con').on('click', '.tank-param-view', function () {
            var data = JSON.parse($(this).closest('tr').attr('data-value')),
                params = {
                    //"SessionID": SessionID,
                    "MethodType": 2,
                    "ChartID": data.ActiveValue
                },
                title = '20023';

            modal_tankChart(params, '', title, title, false);
            //tankChartView(params, '', title2, title1, false);
        });
    })();
});
