$(function () {
    var typeStr, claimStateList, claimCompensationMethodList, ticketTable, isShowCustomizedReports;

    for (var key in stateman.current.param) {
        if (key == 'cid') {
            typeStr = key;
        } else if (key == 'sid') {
            typeStr = key;
        }
    }
    $(window).scrollTop(0);
    var documentTitle = document.title;
    //查询所需基础数据
    (function () {
        var params = {
            //"SessionID": SessionID
        },
        $buttons = $('#ticket-btn-group');

        if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
        else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];

        ajaxCall(URL.TicketDeliveryQueryMeta, params, function (_message) {
            console.log(_message);

            var craneList = [];
            claimStateList = _message.ClaimStateList;
            claimCompensationMethodList = _message.ClaimCompensationMethodList;

            //是否显示月度索赔、单车索赔、配送统计、详情打印、索赔、索赔打印这六个字段
            isShowCustomizedReports = _message.IsShowCustomizedReports;
            if (isShowCustomizedReports == '1') {
                $('[data-type]', $buttons).show();
            } else {
                $('[data-type]', $buttons).hide();
            }

            //发出库
            for (var i in _message.OilDepotList) {
                $('#OilDepotList').find('.select-con').append('<li data-value=' + _message.OilDepotList[i].DepotID + '>' + _message.OilDepotList[i].DisplayName + '</li>');
                craneList = craneList.concat(_message.OilDepotList[i].CraneList);
            }
            for (var i in craneList) {
                $('#CraneList').find('.select-con').append('<li data-value=' + craneList[i].CraneID + '>' + craneList[i].DisplayName + '</li>');
            }
            //发出库、发油鹤位联动
            NameSpace.Select.select_oilDepot = function (_element, _selector) {
                var depotID = _element.attr('data-value'),
                    $con = $('#CraneList').find('.select-con');

                $con.html('');
                $con.append('<li data-value="">' + getI18n('09001') + '</li>');
                if (depotID) {
                    var data = load_craneList(_message.OilDepotList, depotID);
                    for (var i in data) {
                        $con.append('<li data-value=' + data[i].CraneID + '>' + data[i].DisplayName + '</li>');
                    }
                } else {
                    for (var i in craneList) {
                        $con.append('<li data-value=' + craneList[i].CraneID + '>' + craneList[i].DisplayName + '</li>');
                    }
                }
                var selectedText = $con.find('li').eq(0).text(),
                    selectedId = $con.find('li').eq(0).attr('data-value');
                $('#CraneList').find('.select-title').attr('data-value', selectedId).find('span').text(selectedText);
            }

            //到站点
            var receiveStationHtml = '';
            if (typeStr == 'sid') {
                if (_message.ReceiveStationList.length) {
                    receiveStationHtml = receiveStationHtml + '<li data-value=' + _message.ReceiveStationList[0].StationID + '>' + _message.ReceiveStationList[0].DisplayName + '</li>';
                } else {
                    receiveStationHtml = '<li data-value="">' + getI18n('09001') + '</li>';
                }
                $('#ReceiveStationList').addClass('disabled');

            } else if (typeStr == 'cid') {
                receiveStationHtml = '<li data-value="">' + getI18n('09001') + '</li>';
                for (var i in _message.ReceiveStationList) {
                    receiveStationHtml = receiveStationHtml + '<li data-value=' + _message.ReceiveStationList[i].StationID + '>' + _message.ReceiveStationList[i].DisplayName + '</li>';
                }
            }
            $('#ReceiveStationList').find('.select-con').html(receiveStationHtml);
            NameSpace.Select.firstSelected($('#ReceiveStationList'));

            //油品
            for (var i in _message.ProductList) {
                $('#ProductList').find('.select-con').append('<li data-value=' + _message.ProductList[i].ProductID + '>' + _message.ProductList[i].DisplayName + '</li>');
            }

            //索赔状态
            for (var i in claimStateList) {
                $('#ClaimStateList').find('.select-con').append('<li data-value=' + claimStateList[i].StateID + '>' + claimStateList[i].DisplayName + '</li>');
            }

            $('.condition-list').find('.block-loading').hide();

            //判断参数
            var urlBeginDate = stateman.current.param['beginDate'];
            if (urlBeginDate) {
                $('#ticket-query').trigger('click');
            }

        });

        function load_craneList(_data, _id) {
            for (var index in _data) {
                if (_id == _data[index].DepotID) {
                    return _data[index].CraneList; //根据DepotID，返回相应的CraneList
                }
            }
        }
    })();

    //配送单查询
    (function () {
        $('.station').find('.station-con').on('click', '#ticket-query', function () {
            var params = {
                //'SessionID': SessionID,
                'PageInfo': {}
            },
            total,
            ticketDeliveryList,
            isShow = false;

            if (isShowCustomizedReports == '1') isShow = true;
            else isShow = false;

            if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
            else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];

            params = NameSpace.String.getFormParams('#delivery-query-form', params);
            NameSpace.String.ifEmptyDelete(params);

            if (params === false) return false;

            $('.record-box').show();
            var $table = $('.delivery-station-con table'),
                pagelen = $('.record-box input[type=hidden]').val();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            ticketTable = $table.show().DataTable({
                //'lengthChange': false,
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false, //searching
                'pagingType': 'full_numbers',
                'order': [],
                'pageLength': pagelen,
                'dom': 'Blfrt<"dataTables_bottom"pi>',
                'destroy': true,
                'autoWidth': false,
                'sAjaxSource': URL.TicketDelivery,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);
                    //aoData = params; //aoData跟params不一样，它包含params和其他参数

                    params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1; // 请求的开始记录编号
                    //params['PageInfo'].RequestCount = oSettings._iDisplayLength; // 请求记录数量
                    params['PageInfo'].RequestCount = '';

                    ajaxCall(sSource, params, function (_message) {
                        console.log(_message);
                        ticketDeliveryList = _message.DeliveryList;

                        if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                        fnCallback(format(_message, total));
                        //alert(document.title+'2');
                    });
                },
                'createdRow': function (_row, _data, _dataIndex) {
                    $(_row).attr({ 'data-id': _data.Ticketid, 'data-stationName': _data.SiteName });
                    $(_row).data('stationID', _data.Gsid);
                },
                'buttons': [
                    {
                        extend: 'excel',
                        text: getI18n('09902'),
                        className: 'btn-export',
                        footer: true,
                        enabled: false,
                        exportOptions: {
                            modifier: {
                                page: 'all'
                            }
                        },
                        title: getI18n('00000') + '-' + getI18n('14050'),
                        customize: function (xls) {
                            document.title = documentTitle;
                            var sheetData = xls.xl.worksheets['sheet1.xml'];

                            for (var i in ticketDeliveryList) {
                                var $row = $('row[r=' + (parseInt(i) + 2) + ']', sheetData);

                                if (ticketDeliveryList[i].DepottcVolume === 0) {
                                    $('c[r=E' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (ticketDeliveryList[i].DepotVolume === 0) {
                                    $('c[r=F' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (ticketDeliveryList[i].TankDeliveryVolume === 0) {
                                    $('c[r=G' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (ticketDeliveryList[i].TicketVariance === 0) {
                                    $('c[r=H' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                            }
                        }
                        /*filename: 'test'*///给保存的文件命名
                    }
                ],
                'columns': [
                    {
                        'data': 'RcvDateTime',
                        'render': function (_data, _type, _full) {
                            return _data.split(' ')[0];
                        }
                    },
                    {
                        'data': 'SiteName',
                        'width': '150px', //180
                        'render': function (_data, _type, _full) {
                            return '<a href="#/Station?sid=' + _full.Gsid + '" class="text-style01">' + _data + '</a>';
                        }
                    },
                    {
                        'data': 'OtShortName'
                    },
                    {
                        'data': 'TankList'
                    },
                    {
                        'data': 'DepottcVolume',
                        'render': function (_data, _type, _full) {
                            return Math.round(_data);
                        }
                    },
                    {
                        'data': 'DepotVolume',
                        'render': function (_data, _type, _full) {
                            return Math.round(_data);
                        }
                    },
                    {
                        'data': 'TankDeliveryVolume',
                        'render': function (_data, _type, _full) {
                            return Math.round(_data);
                        }
                    },
                    {
                        'data': 'TicketVariance',
                        'render': function (_data, _type, _full) {
                            return Math.round(_data);
                        }
                    },
                    {
                        'data': 'TicketVarianceRatio',
                        'render': function (_data, _type, _full) {
                            //return NameSpace.Number.keepTwoDecimal(_data);
                            return _data.toFixed(2);
                        }
                    },
                    {
                        'data': 'SpSysID'
                    },
                    {
                        'data': 'VehicleNumber'
                    },
                    {
                        'data': 'Escort',
                        'render': function (_data, _type, _full) {
                            if (_data) return getI18n('09002');
                            else return getI18n('09003');
                        }
                    },
                    {
                        'data': 'TankTransFlag',
                        'render': function (_data, _type, _full) {
                            if (_data) return getI18n('09002');
                            else return getI18n('09003');
                        }
                    },
                    {
                        'data': 'ClaimState',
                        'render': function (_data, _type, _full, _meta) {
                            if (_data) return claim_match(_data, claimStateList);
                            else return '';
                        }
                    },
                    {
                        'data': 'ClaimMethod',
                        'render': function (_data, _type, _full, _meta) {
                            if (_data) return claim_match(_data, claimCompensationMethodList);
                            else return '';
                        }
                    },
                    {
                        'orderable': false,
                        'render': function (_data, _type, _full, _meta) {
                            return '<a href="javascript:;" class="ticket-deliveryDetail"><i class="fa fa-search"></i></a>';
                        }
                    },
                    {
                        'orderable': false,
                        'visible': isShow,
                        'render': function (_data, _type, _full) {
                            return '<a href="' + _full.DetailPrintUrl + '" class="icon-detail" target="_blank"></a>';
                        }
                    },
                    {
                        'data': 'ClaimEnable',
                        'visible': isShow,
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="javascript:;" class="create-ticketClaim"><i class="fa fa-rmb"></i></a>';
                            else return '<a href="javascript:;" class="create-ticketClaim disabled"><i class="fa fa-rmb"></i></a>';
                        }
                    },
                    {
                        'data': 'ClaimPrintEnable',
                        'width': '45px',
                        'visible': isShow,
                        'orderable': false,
                        'render': function (_data, _type, _full) {
                            if (_data) return '<a href="' + _full.ClaimPrintUrl + '" target="_blank"><i class="fa fa-download"></i></a>';
                            else return '<a href="javascript:;" class="disabled"><i class="fa fa-download"></i></a>';
                        }
                    }
                ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'), //加载数据时的提示信息 - 当 Ajax请求数据时显示
                    'infoEmpty': getI18n('10802'),  //当表格没有数据时，汇总地方显示的字符串
                    'emptyTable': getI18n('14914'), //当表格没有数据时，表格所显示的字符串
                    //'zeroRecords': getI18n('14914'), //当搜索结果为空时，显示的信息
                    'paginate': {
                        'first': '<i class="fa fa-angle-double-left"></i>',
                        'last': '<i class="fa fa-angle-double-right"></i>',
                        'previous': '<i class="fa fa-angle-left"></i>',
                        'next': '<i class="fa fa-angle-right"></i>'
                    }
                },
                'footerCallback': function (tfoot, data, start, end, display) {
                    var api = this.api();

                    for (var i = 4; i < 8; i++) {
                        column_sum(i);
                    }
                    function column_sum(_column) {
                        $(api.column(_column).footer()).html(api.column(_column, { page: 'current' }).data().reduce(function (a, b) {
                            return Math.round(a + b);
                        }, 0));
                    }
                    var volume,
                        ticketVarianceRatio,
                        transVariance = $(api.column(7).footer()).text(); //配送损益

                    if ($('input[name=UseV20]').prop('checked')) volume = $(api.column(4).footer()).text(); //出库量V20
                    else volume = $(api.column(5).footer()).text(); //出库量Vt

                    if (volume == 0) volume = 1;
                    ticketVarianceRatio = NameSpace.Number.keepTwoDecimal((transVariance / volume) * 100);

                    $(api.column(8).footer()).text(ticketVarianceRatio);
                },
                'initComplete': function (settings, json) {
                    if (ticketTable.data().length == 0) ticketTable.buttons().enable(false);
                    else ticketTable.buttons().enable(true);

                    //$(this.api().table().container()).find('.dataTables_info,.dataTables_paginate').show();
                    $(this.api().table().container()).find('.dataTables_bottom').slideDown(function(){
                        document.title = documentTitle;
                    });
                }
            });

            function format(_data, _total) {
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.DeliveryList
                };
            }
        });
        function claim_match(_id, _data) {
            for (var i in _data) {
                if (_id == _data[i].StateID) return _data[i].DisplayName;
            }
        }
    })();

    //索赔按钮跳转
    (function () {
        var $buttons = $('#ticket-btn-group');

        $('[data-type]', $buttons).on('click', function () {
            var type = $(this).attr('data-type'),
                params = {
                    //"SessionID": SessionID,
                    "MethodType": type
                }
            if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
            else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];

            params = NameSpace.String.getFormParams('#delivery-query-form', params);
            NameSpace.String.ifEmptyDelete(params);

            if (params === false) return false;
            ajaxCall(URL.GetTicketDeliveryReportUrl, params, function (_message) {
                if (_message.Result == 'Success') window.open(_message.TicketDeliveryReportUrl);
            });
        });
    })();

    //配送单详情
    (function () {
        var $modal = $('#modal-deliveryDetail'),
            $buttons = $('.btn-submit', $modal),
            $relatedBox = $('.relate-query', $modal),
            ticketID,
            gsShortName,
            stationID,
            reportList,
            deliveryReportList; //之前定义在GasStationLatestDeliveryReport ajaxCall中

        //点击出现详情弹框
        $('.station-con').on('click', '.ticket-deliveryDetail', function () {
            var $tr = $(this).closest('tr');

            ticketID = $tr.attr('data-id');
            gsShortName = $tr.attr('data-stationName');
            stationID = $tr.data('stationID');

            $('.main-box').addClass('modal-scroll');
            $('#deliveryDetail-list').show();
            $('#editDetail-list').hide();
            $relatedBox.hide();
            $('.btn-delete,.btn-edit', $modal).show();
            $('.btn-save', $modal).hide();

            var params = {
                //"SessionID": SessionID,
                "TicketID": ticketID
            };
            ajaxCall(URL.TicketDeliveryDetail, params, function (_message) {
                console.log(_message);

                reportList = _message.DeliveryReportList;
                report_detail(_message);
                $('.btn-edit', $buttons).data('msg', JSON.stringify(_message));
            });
        });

        //详情编辑
        $('.btn-edit', $buttons).on('click', function () {
            var message = $(this).data('msg'),
                $editBox = $('#editDetail-list');

            $('#deliveryDetail-list').hide();
            $editBox.show();
            $('#btn-oilRelated').text($('#btn-oilRelated').attr('data-title'));
            $(this).prev().hide();
            $(this).next().show();
            $(this).hide();

            edit_report(message);

            //原发v20计算
            var defaultTcValue = $('input[name=DepottcVolume]', $editBox).val(),
                defaultWeightValue = $('input[name=DepotWeight]', $editBox).val();

            $('input[name=DepottcVolume]', $editBox).on('change', function () {
                defaultTcValue = $(this).val().trim();
            });

            $('input[name=manualFlag]:radio', $editBox).on('click', function () {
                var value = $(this).val();

                if (value == '0') {
                    $('input[name=DepotWeight]', $editBox).val(defaultWeightValue).attr('disabled', false);
                    $('input[name=DepotVolume]', $editBox).attr('disabled', true);
                    $('input[name=DepottcVolume]', $editBox).val('');
                    $('#btn-depotWeight').removeClass('btn-disabled');
                } else {
                    defaultTcValue = $('input[name=DepottcVolume]', $editBox).val(),
                    $('input[name=DepotWeight]', $editBox).val('').attr('disabled', true);
                    $('input[name=DepotVolume]', $editBox).attr('disabled', false);
                    $('input[name=DepottcVolume]', $editBox).val(defaultTcValue);
                    $('#btn-depotWeight').addClass('btn-disabled');
                }
            });

            //计算-流量计交接质量
            $('#btn-depotWeight').on('click', function () {
                if (!$(this).hasClass('btn-disabled')) {
                    var $editBox = $('#editDetail-list'),
                        density = $('input[name=DepotDensity]', $editBox),
                        weight = $('input[name=DepotWeight]', $editBox),
                        domArray = [density, weight];

                    var bool = NameSpace.String.validateSomeField(domArray);
                    if (!bool) return false;

                    if (density.val() > 0) {
                        var depottcVolume;
                        if (density.val() == 1.1) {
                            depottcVolume = 0;
                        } else {
                            var val = weight.val() / (density.val() - 1.1);
                            depottcVolume = (val * 1000).toFixed(0);
                        }

                        defaultTcValue = depottcVolume;
                        $('input[name=DepottcVolume]', $editBox).val(depottcVolume);
                    } else {
                        alert(getI18n('14923'));
                    }
                }
            });
        });


        //是否隐藏关联
        $('#btn-oilRelated').on('click', function () {
            var title = $(this).attr('data-title'),
                subtitle = $(this).attr('data-subtitle');

            $('.dataTables_wrapper', $relatedBox).hide();
            if ($(this).text() == title) {
                $(this).text(subtitle);
                $relatedBox.show();
                $('input[name=DeliveryDate]', $relatedBox).val(NameSpace.Date.getCurDateTime('YYYY-mm-dd'));
            } else {
                $(this).text(title);
                $relatedBox.hide();
            }
        });

        //关联查询
        $('#deliveryReport-query').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": stationID,
                "DeliveryDate": $('input[name=DeliveryDate]', $relatedBox).val()
            }

            ajaxCall(URL.GasStationLatestDeliveryReport, params, function (_message) {
                console.log(_message);
                var $table = $modal.find('.table-sub');

                deliveryReportList = _message.DeliveryReportList;
                for (var i in deliveryReportList) {
                    deliveryReportList[i].GsShortName = gsShortName;
                }
                $table.show().dataTable({
                    'lengthChange': false,
                    'processing': true,
                    'searching': false, //searching
                    'paging': false,
                    'info': false,
                    'ordering': false,
                    'destroy': true,
                    'scrollY': 140,
                    "scrollCollapse": true,
                    'data': deliveryReportList,
                    'createdRow': function (_row, _data, _dataIndex) {
                        var rowData = {
                            "GsID": _data.GsID,
                            "TankID": _data.TankID,
                            "DeliveryDate": _data.DeliveryDate.split(' ')[0],
                            "StartDateTime": _data.StartDateTime
                        }
                        rowData = JSON.stringify(rowData);
                        $(_row).attr('data-value', rowData);
                    },
                    'columns': [
                            {
                                'orderable': false,
                                'width': '50',
                                'render': function (_data, _type, _full) {
                                    return '<input type="checkbox" checked>';
                                }
                            },
                            {
                                'data': 'TankID'
                            },
                            {
                                'data': 'DeliveryDate',
                                'width': '100',
                                'render': function (_data, _type, _full) {
                                    return _data.split(' ')[0];
                                }
                            },
                            {
                                'data': 'StartDateTime',
                                'width': '100',
                                'render': function (_data, _type, _full) {
                                    return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time-block">' + _data.split(' ')[1] + '</span>';
                                }
                            },
                            {
                                'data': 'EndDateTime',
                                'width': '100',
                                'render': function (_data, _type, _full) {
                                    return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time-block">' + _data.split(' ')[1] + '</span>';
                                }
                            },
                            {
                                'data': 'StartTCVolume',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'StartHeight',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'StartTemperature',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'EndTCVolume',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'EndHeight',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'EndTemperature',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'DeliveryTCVolume',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            },
                            {
                                'data': 'DeliveryVolume',
                                'render': function (_data, _type, _full) {
                                    return NameSpace.Number.keepTwoDecimal(_data);
                                }
                            }
                        ],
                    'language': {
                        'emptyTable': getI18n('14915'),
                        'paginate': {
                            'first': '<i class="fa fa-angle-double-left"></i>',
                            'last': '<i class="fa fa-angle-double-right"></i>',
                            'previous': '<i class="fa fa-angle-left"></i>',
                            'next': '<i class="fa fa-angle-right"></i>'
                        }
                    }
                });
            });
        });

        //确认关联
        $('#deliveryReport-related').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "TicketID": ticketID,
                "DeliveryReportList": []
            },
                reportList = [];

            if ($('.dataTables_wrapper', $relatedBox).css('display') == 'block') {
                console.log('show');
                $('table input[type=checkbox]:checked', $relatedBox).each(function () {
                    var data = JSON.parse($(this).closest('tr').attr('data-value'));

                    for (var i in deliveryReportList) {
                        if (data.TankID == deliveryReportList[i].TankID) reportList.push(deliveryReportList[i]);
                    }
                    params.DeliveryReportList.push(data);
                });
            }

            if (!params.DeliveryReportList.length) alert(i18n['14916']);
            else {
                ajaxCall(URL.ReassociationDeliveryReport, params, function (_message) {
                    if (_message.Result == 'Success') {
                        var $btn = $('#btn-oilRelated'),
                                text = $btn.attr('data-title');

                        $relatedBox.hide();
                        $btn.text(text);
                        //从新关联table-main表格
                        getDeliveryReport(reportList, true, false);
                    }
                    else alert(_message.Description);
                });
            }
        });

        //配送单保存
        $('.btn-save', $buttons).on('click', function () {
            var $box = $('#editDetail-list'),
                params = {
                    //"SessionID": SessionID
                };

            var innerParams = NameSpace.String.getFormParams('#editDetail-list');
            if (innerParams === false) return false;

            NameSpace.String.ifEmptyDelete(innerParams);
            params['TicketDelivery'] = innerParams;

            ajaxCall(URL.UpdateTicketDelivery, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    var params = {
                        //"SessionID": SessionID,
                        "TicketID": ticketID
                    }
                    $('#deliveryDetail-list').show();
                    $box.hide();
                    $('.btn-delete,.btn-edit', $modal).show();
                    $('.btn-save', $modal).hide();
                    ajaxCall(URL.TicketDeliveryDetail, params, function (_message) {
                        console.log(_message);
                        var oilDepotList = _message.OilDepotList;
                        report_detail(_message);
                        //var table = getDeliveryReport(_message.DeliveryReportList, false, true);
                        $('.btn-edit', $buttons).data('msg', JSON.stringify(_message));
                        $relatedBox.hide();
                        $('#ticket-query').trigger('click');
                    });
                } else {
                    alert(_message.Description);
                }
            });
        });

        //配送单删除
        $('.btn-delete', $buttons).on('click', function () {
            if (confirm(getI18n('14917'))) {
                var $table = $('.delivery-station-con table'),
                    params = {
                        //"SessionID": SessionID,
                        "TicketID": ticketID
                    };

                ajaxCall(URL.DeleteTicketDelivery, params, function (_message) {
                    if (_message.Result == 'Success') {
                        var target = $table.find('tbody tr[data-id=' + params['TicketID'] + ']')
                        modal_hide($modal);
                        ticketTable.row(target).remove().draw();
                    }
                });
            }
        });

        //编辑进油报告
        $('#modal-deliveryDetail').on('click', '.report_edit', function () {
            var $modal = $('.modal-manualReport'),
                $form = $('#report-edit-form'),
                $tr = $(this).closest('tr'),
                index = $tr.attr('data-index'),
                data = $tr.data('value');

            $modal.addClass('layered-modal');
            $modal.data('rowData', data);
            modal_show($modal);

            NameSpace.Format.formDetail('#report-edit-form', data);
            $modal.find('input[name=trIndex]').val(index);
        });

        //计算进油量V20
        $('#calculate-TCVolume').on('click', function () {
            var startTCVolume = $('input[name=StartTCVolume]', $modal), //卸前体积V20
                endTCVolume = $('input[name=EndTCVolume]', $modal),
                domArray = [startTCVolume, endTCVolume];

            var bool = NameSpace.String.validateSomeField(domArray);
            if (!bool) return false;

            var value = startTCVolume - endTCVolume;
            $('.msg-tip', $modal).hide();
            $('input[name=DeliveryTCVolume]', $modal).val(value);
        });

        //保存手工进油报告
        $('#manualReport-save').on('click', function () {
            var $modal = $('.modal-manualReport'),
                data = $modal.data('rowData'),
                index = $modal.find('input[name=trIndex]').val(),
                params = {
                    //"SessionID": SessionID,
                    "IsUpdate": true
                }

            console.log(index);
            var innerParams = NameSpace.String.getFormParams('#report-edit-form');
            if (innerParams === false) return false;

            NameSpace.String.ifEmptyDelete(innerParams);
            params['AutoDeliveryReport'] = innerParams;

            for (var i in data) {
                if (i in innerParams) data[i] = innerParams[i];
            }

            ajaxCall(URL.ManualDeliveryReportSave, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    modal_hide($modal);
                    console.log(reportList);
                    var table = getDeliveryReport(reportList, true, false);
                    table.row(index).data(data).draw();
                } else {
                    alert(_message.Description);
                }

            });
        });

        function report_detail(_message) {
            var $box = $('#deliveryDetail-list'),
                ticketDeliveryDetail = _message.TicketDeliveryDetail;

            ticketDeliveryDetail['GsShortName'] = gsShortName;

            if (ticketDeliveryDetail.OilDepot == 0) ticketDeliveryDetail.OilDepot = '';
            if (ticketDeliveryDetail.DepotPosition == 0) ticketDeliveryDetail.DepotPosition = '';

            NameSpace.Format.formDetail('#deliveryDetail-list', ticketDeliveryDetail);

            modal_show($modal);
            for (var i in _message.DeliveryReportList) {
                _message.DeliveryReportList[i].GsShortName = gsShortName;
            }
            var table = getDeliveryReport(_message.DeliveryReportList, false, true);
        }

        function edit_report(_message) {
            var _message = JSON.parse(_message),
                ticketDeliveryDetail = _message.TicketDeliveryDetail,
                oilDepotList = _message.OilDepotList,
                $editBox = $('#editDetail-list');

            //input框
            NameSpace.Format.formDetail('#editDetail-list', ticketDeliveryDetail);
            $('input[name=manualFlag]:radio', $editBox).prop('checked', false);
            $('input[name=DepotWeight]', $editBox).attr('disabled', false);
            $('input[name=DepotVolume]', $editBox).attr('disabled', false);
            $('#btn-depotWeight').addClass('btn-disabled');
            getDeliveryReport(_message.DeliveryReportList, true, false);
            //select
            var craneList = [];
            if (!oilDepotList.length) {
                for (var i in oilDepotList) {
                    if (oilDepotList[i].DepotID == ticketDeliveryDetail.OilDepot) craneList = oilDepotList[i].CraneList;
                    $('#modal-oilDepotList').find('.select-con').append('<li data-value=' + oilDepotList[i].DepotID + '>' + oilDepotList[i].DisplayName + '</li>');
                }
                for (var i in craneList) {
                    $('#modal-craneList').find('.select-con').append('<li data-value=' + craneList[i].CraneID + '>' + craneList[i].DisplayName + '</li>');
                }
                $('#modal-oilDepotList .select-title').attr('data-value', ticketDeliveryDetail.OilDepot).find('span').text(NameSpace.Data.data_match(ticketDeliveryDetail.OilDepot, oilDepotList, 'DepotID'));
                $('#modal-craneList .select-title').attr('data-value', ticketDeliveryDetail.DepotPosition).find('span').text(NameSpace.Data.data_match(ticketDeliveryDetail.DepotPosition, craneList, 'CraneID'));
            }
        }

        //进油报告表格
        function getDeliveryReport(_dataList, _bool, _flag) {
            var $modal = $('#modal-deliveryDetail');
            var table = $modal.find('.table-main').DataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false, //searching
                'paging': false,
                'info': false,
                'ordering': false,
                'destroy': true,
                'scrollY': 140,
                "scrollCollapse": true,
                'data': _dataList,
                'createdRow': function (_row, _data, _dataIndex) {
                    $(_row).data('value', _data);
                    $(_row).attr('data-index', _dataIndex);
                },
                'columns': [
                    {
                        'visible': _bool,
                        'render': function (_data, _type, _full) {
                            return '<a href="javascript:;" class="report_edit"><i class="fa fa-edit"></i></a>';
                        }
                    },
                    {
                        'data': 'GsShortName'
                    },
                    {
                        'data': 'TankID'
                    },
                    {
                        'data': 'StartTCVolume',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'StartHeight',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'StartWater',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'StartTemperature',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'EndTCVolume',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'EndHeight',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'EndWater',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'EndTemperature',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Number(_data).toFixed(2);
                        }
                    },
                    {
                        'data': 'DeliveryVolume',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'DeliveryTCVolume',
                        'render': function (_data, _type, _full) {
                            if (_data === null) return '';
                            else return Math.round(_data);
                        }
                    },
                    {
                        'data': 'DeliveryDate',
                        'width': '80px',
                        'render': function (_data, _type, _full) {
                            return _data.split(' ')[0];
                        }
                    },
                    {
                        'data': 'StartDateTime',
                        'width': '80px',
                        'render': function (_data, _type, _full) {
                            return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time-block">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'data': 'EndDateTime',
                        'width': '80px',
                        'render': function (_data, _type, _full) {
                            return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time-block">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'data': 'RecTime',
                        'width': '80px',
                        'render': function (_data, _type, _full) {
                            return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time-block">' + _data.split(' ')[1] + '</span>';
                        }
                    },
                    {
                        'data': 'ManualFlag',
                        'visible': _flag,
                        'width': '50px',
                        'render': function (_data, _type, _full) {
                            if (_data == '1') return getI18n('14110');
                            else return getI18n('14111');
                        }
                    }
                ],
                'language': {
                    'emptyTable': getI18n('14918'),
                    'paginate': {
                        'first': '<i class="fa fa-angle-double-left"></i>',
                        'last': '<i class="fa fa-angle-double-right"></i>',
                        'previous': '<i class="fa fa-angle-left"></i>',
                        'next': '<i class="fa fa-angle-right"></i>'
                    }
                }
            });
            return table;
        }
    })();

    //创建索赔单
    (function () {
        var $modal = $('#modal-ticketClaim');

        $('.station-con').on('click', '.create-ticketClaim', function () {
            if (!$(this).hasClass('disabled')) {
                var ticketID = $(this).closest('tr').attr('data-id'),
                    params = {
                        //"SessionID": SessionID,
                        "TicketID": ticketID
                    }

                ajaxCall(URL.TicketDeliveryClaim, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        var data = _message.TicketDeliveryClaim,
                            claimMethodHtml = '';

                        modal_show($modal);
                        data['TicketId'] = ticketID;

                        $('input', $modal).val('');
                        NameSpace.Format.formDetail('#ticketClaim-form', data);

                        for (var i in claimCompensationMethodList) {
                            claimMethodHtml = claimMethodHtml + '<li data-value="' + claimCompensationMethodList[i].StateID + '">' + claimCompensationMethodList[i].DisplayName + '</li>';
                        }
                        $('#ClaimCompensationMethodList').find('.select-con').html(claimMethodHtml);
                        //NameSpace.Select.firstSelected($('#ClaimCompensationMethodList'));
                        $('#ClaimCompensationMethodList').find('.select-con li').eq(0).trigger('click');

                        if (data.ShowHint) $('.msg-tip', $modal).show();
                        else $('.msg-tip', $modal).hide();
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });

        $('#modal-ticketClaim').on('click', '.btn-save', function () {
            var params = {
                //"SessionID": SessionID,
                //"TicketDate": $('input[name=TicketDate]', $modal).val(),
                "TankID": $('input[name=TankID]', $modal).val(),
                "DeliveryClaim": {}
            },
            ticketDate = $('input[name=TicketDate]', $modal).val(),
            ticketDateTitle = $('input[name=TicketDate]', $modal).attr('data-title');

            if (ticketDate == '' || ticketDate.replace(/(^\s*)|(\s*$)/g, '').length == 0) {
                alert(ticketDateTitle + getI18n('09013'));
                return false;
            }
            params['TicketDate'] = ticketDate;
            var innerParams = NameSpace.String.getFormParams('#ticket-delivery-claim');
            console.log(innerParams);
            if (innerParams === false) return false;

            NameSpace.String.ifEmptyDelete(innerParams);
            params['DeliveryClaim'] = innerParams;

            ajaxCall(URL.CreateTicketDeliveryClaim, params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    alert(getI18n('14919'));
                    modal_hide($modal);
                    $('#ticket-query').click();
                }
            });
        });
        NameSpace.Select.select_claimMethodList = function (_element, _selector) {
            if (_element.attr('data-value') == '1') $('input[name=CompstMoney]').closest('li').show();
            else if (_element.attr('data-value') == '2') $('input[name=CompstMoney]').closest('li').hide();
        }
    })();
});
