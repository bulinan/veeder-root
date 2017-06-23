/*
    配送单输入
*/

$(function () {
    var StationID = stateman.current.param['sid'];

    var oilDepotList,
        otId, //提取到的进油单,默认undefined
        productId, //提取进油报告或者损益预览刷新返回的productID,两者返回来的一样
        isSave,
        autoTicketControl,
        lastestDeliveryReport,
        productIdList = [],
        $tips = $('.station-panel .tips'),
        MESSAGE = getI18n('14043');

    //发出库、发油鹤位级联
    (function () {
        var params = {
            //'SessionID': SessionID,
            'StationID': StationID
        };

        ajaxCall(URL.TicketDeliveryQueryMeta, params, function (_message) {
            console.log(_message);

            autoTicketControl = _message.AutoTicketControl;
            if (autoTicketControl) {
                $('input[data-control="auto"]').removeClass('disabled').removeAttr('disabled');
                $('.select-box[data-control="auto"]').removeClass('disabled');
            } else {
                $('input[data-control="auto"]').addClass('disabled').attr('disabled', true);
                $('.select-box[data-control="auto"]').addClass('disabled');
            }

            if (_message.TDAutoDelivery) $('#tank-list').closest('.form-group').find('.auto-delivery').show();
            else $('#tank-list').closest('.form-group').find('.auto-delivery').hide();

            var craneList = [];
            //发出库
            oilDepotList = _message.OilDepotList;
            for (var i in _message.OilDepotList) {
                $('#OilDepotList').find('.select-con').append('<li data-value=' + _message.OilDepotList[i].DepotID + '>' + _message.OilDepotList[i].DisplayName + '</li>');
                craneList = craneList.concat(_message.OilDepotList[i].CraneList);
            }
            for (var i in craneList) {
                $('#CraneList').find('.select-con').append('<li data-value=' + craneList[i].CraneID + '>' + craneList[i].DisplayName + '</li>');
            }

            //加载油品
            ajaxCall(URL.ProductList, '{}', function (_message) {
                var productHtml = '';
                if (_message.ProductList.length) {
                    for (var i in _message.ProductList) {
                        productIdList.push(_message.ProductList[i].ProductID);
                        productHtml = productHtml + '<li data-value=' + _message.ProductList[i].ProductID + '>' + _message.ProductList[i].DisplayName + '</li>';
                    }
                }
                $('#productList').find('.select-con').html(productHtml);
                NameSpace.Select.firstSelected($('#productList'));
                $('.col-info-2').find('.block-loading').hide();
            });

            //发出库、发油鹤位联动
            NameSpace.Select.select_oilDepot = function (_element, _selector) {
                var depotID = _element.attr('data-value'),
                    $con = $('#CraneList').find('.select-con');

                $con.html('');
                $con.append('<li data-value="">' + getI18n('09001') + '</li>');
                if (depotID) {
                    var data = craneList_load(_message.OilDepotList, depotID);
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
        });
    })();

    function craneList_load(_data, _id) {
        for (var index in _data) {
            if (_id == _data[index].DepotID) {
                return _data[index].CraneList; //根据DepotID，返回相应的CraneList
            }
        }
    }

    function oilDepot_match(_spCode) {
        for (var i in oilDepotList) {
            if (_spCode == oilDepotList[i].DepotID) return oilDepotList[i].DisplayName;
        }
    }

    function crane_match(_spCode, _dpCode) {
        var craneList = craneList_load(oilDepotList, _spCode); /*如果这块确定，可以优化一下这个方法，毕竟oilDepotList写成全局的了*/
        for (var i in craneList) {
            if (_dpCode == craneList[i].CraneID) return craneList[i].DisplayName;
        }
    }

    //配送单提取
    (function () {
        $('#extract-ticket').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "TicketNo": $('input[name=TicketNo]').val()
            }

            if (params['TicketNo'] == '') {
                alert(i18n['14901']);
            } else {
                ajaxCall(URL.TicketDeliveryExtract, params, function (_message) {
                    console.log(_message);
                    var ticketDelivery = _message.TicketDelivery;

                    if (!$.isEmptyObject(ticketDelivery)) {
                        otId = ticketDelivery.OtID; //油品
                        $('input[name=TicketDate]').val(ticketDelivery.TicketDate.split(' ')[0]);
                        $('input[name=DepotTemperature]').val(ticketDelivery.Temperature);
                        $('input[name=VehicleNumber]').val(ticketDelivery.VehicleNumber);
                        $('input[name=Density]').val(ticketDelivery.Density);
                        $('input[name=OilWeight]').val(ticketDelivery.OilWeight);
                        //发出库
                        $('#OilDepotList').find('.select-title').attr('data-value', ticketDelivery.SpCode).find('span').text(oilDepot_match(ticketDelivery.SpCode));
                        $('#OilDepotList li[data-value="' + ticketDelivery.SpCode + '"]').trigger('click');
                        //发油鹤位
                        $('#CraneList').find('.select-title').attr('data-value', ticketDelivery.DpCode).find('span').text(crane_match(ticketDelivery.DpCode, ticketDelivery.DpCode));

                        //油品
                        if (NameSpace.Array.ifContains(productIdList, ticketDelivery.OtID)) {
                            NameSpace.Select.selectedByParam($('#productList'), ticketDelivery.OtID);
                        } else {
                            alert(i18n['14924']);
                        }

                        $('input[name=DepotVolume]').val(ticketDelivery.Volume);
                        $('input[name=DepottcVolume]').val(Math.round(ticketDelivery.VolumeTC));
                        $('input[name=Carrier]').val(ticketDelivery.Carrier);
                    } else {
                        alert(i18n['14902']);
                        $('.panel-inputbox input:not([name=TicketNo])').val('');
                        $('.panel-inputbox .select-box').find('.select-con li:eq(0)').trigger('click');
                    }
                });
            }
        });
    })();

    //计算流量计交接V20
    (function () {
        $('#calculateV20,#afreshCalculateV20').on('click', function () {

            //根据发油温度(℃)和流量计交接Vt(L)计算 流量计交接V20(L)
            var params = {
                //"SessionID": SessionID
            },
            bool = true,
            temperature = $('input[name=DepotTemperature]').val(),
            volume = $('input[name=DepotVolume]').val(),
            productIdSelected = $('#productList').find('.select-title').attr('data-value');

            if (bool && temperature == '') {
                bool = false;
                alert(i18n['14903']);
            }
            if (bool && volume == '') {
                bool = false;
                alert(i18n['14904']);
            }
            if (bool && !/^[-+]?([1-9]\d*(\.\d+)?|0\.\d*[1-9]\d*|0?\.0+|0?\s*)$/.test(temperature)) {
                bool = false;
                alert(i18n['14905']);
            }
            if (bool && !/^[-+]?([1-9]\d*(\.\d+)?|0\.\d*[1-9]\d*|0?\.0+|0?\s*)$/.test(volume)) {
                bool = false;
                alert(i18n['14906']);
            }
            if (productIdSelected === undefined || productIdSelected == '') {
                bool = false;
                alert(i18n['14925']);
            }
            if (bool) {
                params['ProductID'] = productIdSelected;
                params['Temperature'] = temperature;
                params['Volume'] = volume;

                ajaxCall(URL.TicketDeliveryV20Calculate, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        $('input[name=DepottcVolume]').val(Math.round(_message.VolumeTC));
                    } else {
                        alert(_message.Description);
                    }
                });
            }

        });
    })();

    //进油时间、油罐列表
    (function () {
        var $box = $('.station-panel .operate-area');

        $('input[name=DeliveryDateFlag]', $box).on('click', function () {
            var isChecked = $(this).prop('checked');

            if (isChecked) $('.input-date', $box).removeAttr('disabled');
            else $('.input-date', $box).attr('disabled', true);
        });

        //油罐
        var params = {
            //"SessionID": SessionID,
            "StationID": StationID
        }
        ajaxCall(URL.TankList, params, function (_message) {
            console.log(_message);
            if (_message.Result == 'Success') tank_list(_message.TankList, $('#tank-list'));
            else alert(_message.Description);

            $box.prev('.block-loading').hide();
        });

    })();

    //油罐列表
    function tank_list(_data, _box) {
        var html = '';
        for (var i in _data) {
            html = html + '<label class="checkbox-inline"><input type="checkbox" value="' + _data[i].TankID + '">' + _data[i].DisplayName + '</label>';
        }
        _box.html(html);
    }

    //提取进油报告
    (function () {
        $('.station-body').find('.station-con').on('click', '#extract-report', function () {
            var tank = [],
                $con = $('.station-panel .col-info-3');
            $('#tank-list input').each(function () {
                if ($(this).prop('checked')) tank.push($(this).val());
            });
            if (!tank.length) alert(i18n['14907']);
            else {
                var $table_report = $('#DeliveryReportList'),
                    tankId = tank.join(),
                    params = {
                        //"SessionID": SessionID,
                        "StationID": StationID,
                        "TankID": tankId,  //多个TankID用,分割
                        //"DeliveryDate": $('input[name=DeliveryDate]').val(),
                        "TicketDelivery":
                        {
                            "RcvVolumem": NameSpace.String.isEmpty($('input[name=RcvVolumem]', $con).val()),  //人工计量实收量Vt
                            "RcvtcVolumem": NameSpace.String.isEmpty($('input[name=RcvtcVolumem]', $con).val()),  //人工计量实收量V20
                            "DepotVolumem": NameSpace.String.isEmpty($('input[name=DepotVolumem]', $con).val()),  //人工计量数Vt
                            "DepottcVolumem": NameSpace.String.isEmpty($('input[name=DepottcVolumem]', $con).val()),  //人工计量数V20
                            "DepotVolume": NameSpace.String.isEmpty($('input[name=DepotVolume]', $con).val()),  //流量计交接Vt
                            "DepottcVolume": NameSpace.String.isEmpty($('input[name=DepottcVolume]', $con).val())  //流量计交接V20
                        }
                    };

                $table_report.show().find('tbody').html('<tr class="loading"><td colspan="17">' + getI18n('10801') + '</td></tr>');
                $('#VarianceOverview').find('tbody').html('<tr class="loading"><td colspan="6">' + getI18n('10801') + '</td></tr>');
                if (!$('input[name=DeliveryDate]').attr('disabled')) {
                    var deliveryDate = $('input[name=DeliveryDate]').val();
                    if (deliveryDate == '' || deliveryDate.replace(/(^\s*)|(\s*$)/g, '').length == 0) {
                        alert(getI18n('14920'));
                        return false;
                    }
                    params['DeliveryDate'] = deliveryDate;
                }

                if (otId) params['ProductID'] = otId; //如果提取到了进油单，则传返回的配送单OtID，否则传"-1"
                else params['ProductID'] = '-1';

                ajaxCall(URL.LatestDeliveryReport, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        lastestDeliveryReport = _message.DeliveryReportList;
                        var varianceOverview = _message.VarianceOverview;

                        productId = _message.ProductID;
                        isSave = _message.IsSave;
                        if (_message.EnableUnloadingOil) $('#modal-oilReport').removeClass('btn-disabled');
                        else $('#modal-oilReport').addClass('btn-disabled');

                        fill_deliveryReport($table_report, lastestDeliveryReport);
                        //损益预览
                        if (varianceOverview) {
                            variance_overview(varianceOverview);
                        }

                        //checkbox
                        $('input[type=checkbox]', $table_report).on('click', function () {
                            var length = $('input[type=checkbox]:checked', $table_report).length;
                            if (length == 0) {
                                $('#modal-oilReport').addClass('btn-disabled');
                            } else {
                                $('#modal-oilReport').removeClass('btn-disabled');
                            }
                        });
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });
    })();

    //填充提取进油报告表格
    function fill_deliveryReport(_table, _lastestDeliveryReport) {
        _table.dataTable({
            'lengthChange': false,
            'processing': true,
            'searching': false, //searching
            'paging': false,
            'info': false,
            'ordering': false,
            'destroy': true,
            'data': _lastestDeliveryReport,
            'createdRow': function (_row, _data, _dataIndex) {
                var rowData = {
                    "GsID": _data.GsID,
                    "TankID": _data.TankID,
                    "DeliveryVolume": _data.DeliveryVolume,
                    "DeliveryTCVolume": _data.DeliveryTCVolume,
                    "AdjReportFlagShow": _data.AdjReportFlagShow,
                    "DeliveryDate": _data.DeliveryDate,
                    "StartDateTime": _data.StartDateTime
                }
                rowData = JSON.stringify(rowData);
                $(_row).attr('data-value', rowData);
            },
            'columns': [
                {
                    'data': '',
                    'width': '35px',
                    'render': function (_data, _type, _full) {
                        return '<input type="checkbox" checked>';
                    }
                },
                {
                    'data': 'GsShortName'
                },
                {
                    'data': 'TankID',
                    'width': '32px'
                },
                {
                    'data': 'DeliveryDate',
                    'render': function (_data, _type, _full) {
                        var date = _data.split(' ');
                        return '<span class="date">' + date[0] + '</span>';
                    }
                },
                {
                    'data': 'StartDateTime',
                    'render': function (_data, _type, _full) {
                        var date = _data.split(' ');
                        return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                    }
                },
                {
                    'data': 'EndDateTime',
                    'render': function (_data, _type, _full) {
                        var date = _data.split(' ');
                        return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                    }
                },
                {
                    'data': 'StartVolume',
                    'render': function (_data, _type, _full) {
                        if (_data === null) return '';
                        else return Math.round(_data);
                    }
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
                        else return _data.toFixed(2);
                    }
                },
                {
                    'data': 'StartTemperature',
                    'render': function (_data, _type, _full) {
                        if (_data === null) return '';
                        else return _data.toFixed(2);
                    }
                },
                {
                    'data': 'EndVolume',
                    'render': function (_data, _type, _full) {
                        if (_data === null) return '';
                        else return Math.round(_data);
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
                        else return _data.toFixed(2);
                    }
                },
                {
                    'data': 'EndTemperature',
                    'render': function (_data, _type, _full) {
                        if (_data === null) return '';
                        else return _data.toFixed(2);
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
                    'width': '80',
                    'data': 'AdjReportFlagShow'
                }
            ],
            'language': {
                'emptyTable': getI18n('14908')
            }
        });
    }

    //损益预览
    function variance_overview(_data) {
        var $table_overview = $('#VarianceOverview');

        if (_data.Message == '') {
            $tips.hide();
            $('.template-overview-table').find('tbody td').each(function () {
                var name = $(this).attr('data-name'),
                    type = $(this).parent().attr('data-type'),
                    text;

                if (name == 'Var') {
                    $(this).text(_data[type][name]);
                    return true;
                }
                if (_data[type][name] === '') {
                    text = '-';
                } else {
                    if (name == 'TicketVariance') text = Math.round(_data[type][name]) + _data[type]['TicketVarianceRatio'];
                    else text = Math.round(_data[type][name]);
                }
                $(this).text(text);
            });
            var templateTable = $('.template-overview-table').find('tbody').html();
            $table_overview.show().find('tbody').html(templateTable);
        } else {
            $table_overview.hide();
            $tips.show().html(_data.Message);
        }
    }

    //损益预览更新
    (function () {
        $('#variance-update').on('click', function () {
            var $con = $('.station-panel .col-info-3'),
                $table_report = $('#DeliveryReportList'),
                params = {
                    //"SessionID": SessionID,
                    "TicketDelivery":
                    {
                        "RcvVolumem": NameSpace.String.isEmpty($('input[name=RcvVolumem]', $con).val()),  //人工计量实收量Vt
                        "RcvtcVolumem": NameSpace.String.isEmpty($('input[name=RcvtcVolumem]', $con).val()),  //人工计量实收量V20
                        "DepotVolumem": NameSpace.String.isEmpty($('input[name=DepotVolumem]', $con).val()),  //人工计量数Vt
                        "DepottcVolumem": NameSpace.String.isEmpty($('input[name=DepottcVolumem]', $con).val()),  //人工计量数V20
                        "DepotVolume": NameSpace.String.isEmpty($('input[name=DepotVolume]', $con).val()),  //流量计交接Vt
                        "DepottcVolume": NameSpace.String.isEmpty($('input[name=DepottcVolume]', $con).val())  //流量计交接V20
                    },
                    "DeliveryReportList": []
                };
            $('#VarianceOverview').find('tbody').html('<tr class="loading"><td colspan="6">' + getI18n('10801') + '</td></tr>');
            $table_report.find('input[type=checkbox]:checked').each(function () {
                var data = JSON.parse($(this).closest('tr').attr('data-value'));

                delete data['DeliveryDate'];
                delete data['StartDateTime'];
                params.DeliveryReportList.push(data);
            });

            if (params.DeliveryReportList.length == 0) {
                $tips.show().html(i18n['14909']);
            } else {
                ajaxCall(URL.VarianceOverview, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        productId = _message.ProductID;
                        isSave = _message.IsSave;

                        if (_message.EnableUnloadingOil) $('#modal-oilReport').removeClass('btn-disabled');
                        else $('#modal-oilReport').addClass('btn-disabled');
                        variance_overview(_message.VarianceOverview);
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });

    })();

    //配送单保存
    (function () {
        $('#ticketDelivery-save').on('click', function () {
            var ticketDate = $('input[name=TicketDate]').val(),
                params = {
                    //"SessionID": SessionID,
                    "TicketDelivery":
                    {
                        "Gsid": StationID,
                        "TicketDate": ticketDate,   //开单日期
                        "VehicleNumber": $('input[name=VehicleNumber]').val(),   //罐车车牌号
                        //"OilDepot": $('#OilDepotList').find('.select-title').attr('data-value'),   //发出库
                        "DepotWeight": NameSpace.String.isEmpty($('input[name=OilWeight]').val()),   //流量计交接质量(kg)
                        "DepotVolume": NameSpace.String.isEmpty($('input[name=DepotVolume]').val()),   //流量计交接Vt(L)
                        "DepottcVolume": NameSpace.String.isEmpty($('input[name=DepottcVolume]').val()),   //流量计交接V20(L)
                        "DepotTemperature": NameSpace.String.isEmpty($('input[name=DepotTemperature]').val()),   //发油温度(℃)
                        "DepotDensity": NameSpace.String.isEmpty($('input[name=Density]').val()),   //计重标密(kg/m³)
                        "DepotVolumem": NameSpace.String.isEmpty($('input[name=DepotVolumem]').val()),   //人工计量数Vt(L)
                        "DepottcVolumem": NameSpace.String.isEmpty($('input[name=DepottcVolumem]').val()),   //人工计量原发V20(L)
                        //"DepotPosition": $('#CraneList').find('.select-title').attr('data-value'),   //发油鹤位
                        "RcvTemperature": NameSpace.String.isEmpty($('input[name=RcvTemperature]').val()),   //实收罐车温度(℃)
                        "RcvVolumem": NameSpace.String.isEmpty($('input[name=RcvVolumem]').val()),   //人工计量实收量Vt(L)
                        "RcvtcVolumem": NameSpace.String.isEmpty($('input[name=RcvtcVolumem]').val()),   //人工计量实收V20(L)
                        "Escort": $('input[name=Escort]:checked', $box).val(),   //是否跟车
                        "EscortPerson": $('input[name=EscortPerson]').val(),   //押运人
                        "Carrier": $('input[name=Carrier]').val(),   //司机
                        "Remark": $('input[name=Remark]').val(),   //损溢原因分析
                        "TankTransFlag": $('input[name=TankTransFlag]:checked', $box).val(),   //是否地罐交接
                        "SpSysID": $('input[name=TicketNo]').val()   //进油单号
                    },
                    "DeliveryReportList": []
                },
            $box = $('.station-panel .panel-inputbox')
            bool = true;

            var oilDepot = $('#OilDepotList').find('.select-title').attr('data-value'),
                depotPosition = $('#CraneList').find('.select-title').attr('data-value');

            if (oilDepot != '') params['OilDepot'] = oilDepot;
            if (depotPosition != '') params['DepotPosition'] = depotPosition;

            if (!autoTicketControl) {
                if (bool && (params['TicketDelivery']['SpSysID'] == '' || params['TicketDelivery']['SpSysID'].replace(/(^\s*)|(\s*$)/g, '').length == 0)) {
                    bool = false;
                    alert(getI18n('14901'));
                }
            }

            bool = NameSpace.String.fieldRequired(bool, $box, 'isAlert');
            bool = NameSpace.String.digitalControl(bool, $box, 'isAlert');

            //判断是否选中油罐进油报告
            $('#DeliveryReportList').find('input[type=checkbox]:checked').each(function () {
                var data = JSON.parse($(this).closest('tr').attr('data-value')),
                    object = {
                        "GsID": data.GsID,
                        "TankID": data.TankID,
                        "DeliveryDate": data.DeliveryDate.split(' ')[0],
                        "StartDateTime": data.StartDateTime
                    };
                params.DeliveryReportList.push(object);
            });

            if (bool && params.DeliveryReportList.length == 0) {
                bool = false;
                alert(i18n['14910']);
            }
            if (bool && isSave != '') {
                if (confirm(isSave + ',' + i18n['14911'])) {
                    ajaxCall(URL.TicketDeliverySave, params, function (_message) {
                        if (_message.Result == 'Success') {
                            alert(i18n['14912']);
                            top.location.href = '#/Station/TicketDelivery?sid=' + StationID + '&beginDate=' + ticketDate + '&endDate=' + ticketDate;
                        }
                        else alert(_message.Description);
                    });
                }
            }
            if (bool && isSave == '') {
                ajaxCall(URL.TicketDeliverySave, params, function (_message) {
                    if (_message.Result == 'Success') {
                        alert(i18n['14912']);
                        top.location.href = '#/Station/TicketDelivery?sid=' + StationID + '&beginDate=' + ticketDate + '&endDate=' + ticketDate;
                    }
                    else alert(_message.Description);
                });
            }
        });
    })();

    //手工进油报告
    (function () {
        var $modal = $('.modal-manualReport'),
            $table_manualReport = $modal.find('.table-result'),
            deliveryDate = '',
            autoDeliveryReportList;

        //弹出
        $('.station-body').find('.station-con').on('click', '#modal-manualReport', function () {
            var params = {
                //"SessionID": SessionID,
                "StationID": StationID
            }
            if (!$('input[name=DeliveryDate]').attr('disabled')) {
                params['DeliveryDate'] = $('input[name=DeliveryDate]').val();
                deliveryDate = $('input[name=DeliveryDate]').val();
            }
            $table_manualReport.find('tbody').html('<tr class="loading"><td colspan="14">' + getI18n('10801') + '</td></tr>');
            ajaxCall(URL.ManualDeliveryReport, params, function (_message) {
                console.log(_message);

                if (_message.Result == 'Success') {
                    var $tank = $('#TankList', $modal),
                        tankHtml = '';

                    autoDeliveryReportList = _message.AutoDeliveryReportList;

                    $('.msg-tip', $modal).find('p').text('');
                    for (var i in _message.TankList) {
                        tankHtml = tankHtml + '<li data-value=' + _message.TankList[i].TankID + '>' + _message.TankList[i].DisplayName + '</li>'
                    }
                    $tank.find('.select-con').html(tankHtml);

                    //NameSpace.Select.firstSelected($tank);

                    //根据TankId,填充input
                    NameSpace.Select.select_autoReport = function (_element, _selector) {
                        var tankId = _element.attr('data-value'),
                            autoDeliveryReport;
                        for (var i in autoDeliveryReportList) {
                            if (tankId == autoDeliveryReportList[i].TankID) {
                                autoDeliveryReport = autoDeliveryReportList[i];
                            }
                        }
                        /*if (autoDeliveryReport.Message === '') $('.msg-tip', $modal).find('p').text('');
                        else $('.msg-tip', $modal).find('p').text(autoDeliveryReport.Message);*/

                        fill_textBox(autoDeliveryReport);
                    }
                    $tank.find('.select-con li:first').trigger('click');
                    //fill_textBox(autoDeliveryReportList[0]);

                    //表格
                    modal_show($modal);
                    fill_table(_message.ManualDeliveryReportList);
                } else {
                    alert(_message.Description);
                }

            });
        });

        //计算进油量V20
        $('#calculate-TCVolume').on('click', function () {
            var startTCVolume = $('input[name=StartTCVolume]', $modal).val(), //卸前体积V20
                endTCVolume = $('input[name=EndTCVolume]', $modal).val(),
                arrayObj = [
                    {
                        'value': startTCVolume,
                        'text': getI18n('10043')
                    },
                    {
                        'value': endTCVolume,
                        'text': getI18n('10044')
                    }
                ],
                bool = true;

            bool = NameSpace.String.someFieldRequired(bool, arrayObj, $('.msg-tip', $modal));
            bool = NameSpace.String.someDigitalControl(bool, arrayObj, $('.msg-tip', $modal));

            if (bool) {
                var value = endTCVolume - startTCVolume;
                $('.msg-tip', $modal).find('p').text('');
                $('input[name=DeliveryTCVolume]', $modal).val(value);
            }
        });

        //删除手工进油报告
        $('.modal-manualReport').delegate('.manualReport-delete', 'click', function () {
            if (confirm(getI18n('14922'))) {
                var $tr = $(this).closest('tr'),
                    $table = $('.table-result', $modal),
                    data = JSON.parse($tr.attr('data-value')),
                    params = {
                        //"SessionID": SessionID,
                        "StationID": StationID,
                        "TankID": data.TankID,
                        "DeliveryDate": data.DeliveryDate,
                        "StartDateTime": data.StartDateTime
                    };

                ajaxCall(URL.ManualDeliveryReportDelete, params, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        var tankId = parseInt($('#TankList').find('.select-title').attr('data-value'));

                        alert(i18n['07003']);
                        autoDeliveryReportList = _message.AutoDeliveryReportList;
                        $tr.remove();
                        if ($table.find('tbody tr').length == 0) $table.hide();
                        else fill_table(_message.ManualDeliveryReportList); //重新绑定table
                        fill_textBox(autoDeliveryReportList[tankId - 1]); //重新绑定textbox
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        });

        //保存手工进油报告
        $('#manualReport-save').on('click', function () {
            var params = {
                //"SessionID": SessionID,
                "IsUpdate": false,
                "AutoDeliveryReport": //共13个参数
                {
                "GsID": StationID
            }
        };

        params['AutoDeliveryReport'] = NameSpace.String.getFormParams('#manualReport-form', params['AutoDeliveryReport']);
        if (params['AutoDeliveryReport'] === false) return false;

        NameSpace.String.ifEmptyDelete(params['AutoDeliveryReport']);

        if (deliveryDate != '') params['DeliveryDate'] = deliveryDate;

        $('.msg-tip', $modal).find('p').text('');
        $table_manualReport.find('tbody').html('<tr class="loading"><td colspan="14">' + getI18n('10801') + '</td></tr>');
        ajaxCall(URL.ManualDeliveryReportSave, params, function (_message) {
            console.log(_message);
            if (_message.Result == 'Success') {
                var tankId = parseInt($('#TankList').find('.select-title').attr('data-value'));

                autoDeliveryReportList = _message.AutoDeliveryReportList;
                fill_table(_message.ManualDeliveryReportList);
                fill_textBox(autoDeliveryReportList[tankId - 1]);
            } else {
                alert(_message.Description);
            }

        });
    });

    //填充手工进油报告表格
    function fill_table(_data) {
        if (!_data.length) {
            $table_manualReport.hide();
        } else {
            $table_manualReport.show().dataTable({
                'lengthChange': false,
                'processing': true,
                'searching': false,
                'paging': false,
                'scrollY': 135,
                "scrollCollapse": true,
                'info': false,
                'ordering': false,
                'destroy': true,
                'data': _data,
                'createdRow': function (_row, _data, _dataIndex) {
                    var rowData = {
                        "TankID": _data.TankID,
                        "DeliveryDate": _data.DeliveryDate,
                        "StartDateTime": _data.StartDateTime
                    }
                    rowData = JSON.stringify(rowData);
                    $(_row).attr('data-value', rowData);
                },
                'columns': [
                            {
                                'width': '45px',
                                'data': '',
                                'render': function (_data, _type, _full) {
                                    return '<a href="javascript:;" class="manualReport-delete"><i class="fa fa-remove"></i></a>';
                                }
                            },
                            {
                                'width': '40px',
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
                                    else return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'StartWater',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'StartTemperature',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return _data.toFixed(2);
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
                                    else return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'EndWater',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'EndTemperature',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return _data.toFixed(2);
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
                                'width': '100px',
                                'data': 'DeliveryDate',
                                'render': function (_data, _type, _full) {
                                    var date = _data.split(' ');
                                    return date[0];
                                }
                            },
                            {
                                'width': '150px',
                                'data': 'StartDateTime',
                                'render': function (_data, _type, _full) {
                                    var date = _data.split(' ');
                                    return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                                }
                            }
                        ],
                'language': {
                    'emptyTable': getI18n('14913')
                }
            });
        }
    }

    //填充textbox
    function fill_textBox(_data) {

        $('.msg-tip', $modal).find('p').text(_data.Message);

        if (_data.EnableStartDateTime) $('input[name=StartDateTime]', $modal).removeAttr('disabled');
        else $('input[name=StartDateTime]', $modal).attr('disabled', true);

        if (_data.EnableEndDateTime) $('input[name=EndDateTime]', $modal).removeAttr('disabled');
        else $('input[name=EndDateTime]', $modal).attr('disabled', true);

        $('input', $modal).val('');
        $('input[name=StartDateTime]', $modal).val(_data.StartDateTime.slice(0, -3));
        $('input[name=EndDateTime]', $modal).val(_data.EndDateTime.slice(0, -3));
        $('input[name=StartTemperature]', $modal).val(_data.StartTemperature === '' ? '' : _data.StartTemperature.toFixed(2));
        $('input[name=EndTemperature]', $modal).val(_data.EndTemperature === '' ? '' : _data.EndTemperature.toFixed(2));
        $('input[name=StartWater]', $modal).val(_data.StartWater === '' ? '' : _data.StartWater.toFixed(2));
        $('input[name=EndWater]', $modal).val(_data.EndWater === '' ? '' : _data.EndWater.toFixed(2));
    }

})();

//一车分卸
(function () {
    var $modal = $('.modal-oilReport'),
                $table = $('.table-result', $modal),
                $table_report = $('#DeliveryReportList'),
                $btnSubmit = $('.btn-submit', $modal);

    //弹出一车分卸
    $('.station-body').find('.station-con').on('click', '#modal-oilReport', function () {
        if (!$(this).hasClass('btn-disabled')) {
            var params = {
                //"SessionID": SessionID,
                "ProductID": productId, //提取进油报告或者刷新损益预览返回的productID
                'StationID': StationID
            }

            $table.hide();
            $('.dataTables_wrapper', $modal).hide();
            $btnSubmit.hide();

            var tankList = [];
            $('input[type=checkbox]', $table_report).each(function () {
                var row = JSON.parse($(this).closest('tr').attr('data-value'));
                if ($(this).prop('checked')) tankList.push(row.TankID);
            });
            params['TankID'] = tankList.join();

            ajaxCall(URL.UnloadingOilMeta, params, function (_message) {
                console.log(_message);

                if (_message.Result == 'Success') {
                    var stationList = _message.StationList,
                                html = '';

                    $('#stationList').find('.select-title').removeAttr('data-value').find('span').text('');
                    for (var i in stationList) {
                        html = html + '<li data-value="' + stationList[i].StationID + '">' + stationList[i].DisplayName + '</li>'
                    }
                    $('#stationList').find('.select-con').html(html);

                    //油站、油罐级联
                    NameSpace.Select.select_tankList = function (_element, _selector) {
                        var stationId = _element.attr('data-value'),
                                    data = tankList_load(stationList, stationId);

                        if (data.length) tank_list(data, $('#modal-tank-list'));
                        else {
                            $('#modal-tank-list').html('');
                            $('#extract-unloadingOilReport').addClass('btn-disabled');
                        }

                    }
                    if (stationList.length) {
                        $('#stationList').find('.select-con li').eq(0).trigger('click');
                        $('#extract-unloadingOilReport').removeClass('btn-disabled');
                    }
                    else {
                        $('#modal-tank-list').html('');
                        $('#extract-unloadingOilReport').addClass('btn-disabled');
                    }

                    modal_show($modal);
                } else {
                    alert(_message.Description);
                }
            });
        }
    });

    //提取进油报告
    $('#extract-unloadingOilReport').on('click', function () {
        if (!$(this).hasClass('btn-disabled')) {
            var tank = [];

            $('#modal-tank-list input').each(function () {
                if ($(this).prop('checked')) tank.push($(this).val());
            });
            if (!tank.length) alert(i18n['14907']);
            else {
                $table.show().find('tbody').html('<tr class="loading"><td colspan="17">' + getI18n('10801') + '</td></tr>');
                var tankId = tank.join(),
                        params = {
                            //"SessionID": SessionID,
                            "TankID": tankId  //多个TankID用,分割
                        };

                params = NameSpace.String.getFormParams('#oil-report-form', params);
                if (params === false) {
                    return false;
                }
                ajaxCall(URL.UnloadingOilDeliveryReport, params, function (_message) {
                    console.log(_message);

                    if (_message.Result == 'Success') {
                        var deliveryReportList = _message.DeliveryReportList;

                        $btnSubmit.show();
                        $table.dataTable({
                            'lengthChange': false,
                            'processing': true,
                            'searching': false, //searching
                            'paging': false,
                            'scrollY': 135,
                            'scrollCollapse': true,
                            'info': false,
                            'ordering': false,
                            'destroy': true,
                            'data': deliveryReportList,
                            'createdRow': function (_row, _data, _dataIndex) {
                                var rowData = JSON.stringify(_data);
                                $(_row).attr('data-value', rowData);
                            },
                            'columns': [
                                    {
                                        'data': '',
                                        'render': function (_data, _type, _full) {
                                            return '<input type="checkbox" checked>';
                                        }
                                    },
                                    {
                                        'data': 'GsShortName'
                                    },
                                    {
                                        'data': 'TankID'
                                    },
                                    {
                                        'data': 'DeliveryDate',
                                        'render': function (_data, _type, _full) {
                                            var date = _data.split(' ');
                                            return '<span class="date">' + date[0] + '</span>';
                                        }
                                    },
                                    {
                                        'data': 'StartDateTime',
                                        'render': function (_data, _type, _full) {
                                            var date = _data.split(' ');
                                            return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                                        }
                                    },
                                    {
                                        'data': 'EndDateTime',
                                        'render': function (_data, _type, _full) {
                                            var date = _data.split(' ');
                                            return '<span class="date">' + date[0] + '</span><span class="time">' + date[1] + '</span>';
                                        }
                                    },
                                    {
                                        'data': 'StartVolume',
                                        'render': function (_data, _type, _full) {
                                            if (_data === null) return '';
                                            else return Math.round(_data);
                                        }
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
                                            else return _data.toFixed(2);
                                        }
                                    },
                                    {
                                        'data': 'StartTemperature',
                                        'render': function (_data, _type, _full) {
                                            if (_data === null) return '';
                                            else return _data.toFixed(2);
                                        }
                                    },
                                    {
                                        'data': 'EndVolume',
                                        'render': function (_data, _type, _full) {
                                            if (_data === null) return '';
                                            else return Math.round(_data);
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
                                            else return _data.toFixed(2);
                                        }
                                    },
                                    {
                                        'data': 'EndTemperature',
                                        'render': function (_data, _type, _full) {
                                            if (_data === null) return '';
                                            else return _data.toFixed(2);
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
                                        'width': '80',
                                        'data': 'AdjReportFlagShow'
                                    }
                                ],
                            'language': {
                                'emptyTable': getI18n('14908')
                            }
                        });
                    } else {
                        alert(_message.Description);
                    }
                });
            }
        }
    });

    //保存
    $('#unloadingOil-save').on('click', function () {
        var reportListChecked = 0, tableHtml = '';

        $table.find('input[type=checkbox]:checked').each(function () {
            var value = $(this).closest('tr').attr('data-value'),
                        html = $(this).closest('tr').html();

            reportListChecked++;
            tableHtml = tableHtml + '<tr data-value=\'' + value + '\'>' + html + '</tr>'
        });

        console.log(tableHtml);
        if (reportListChecked == 0) {
            alert(i18n['14909']);
        } else {
            var $table_report = $('#DeliveryReportList');

            //fill_deliveryReport($table_report, lastestDeliveryReport);
            $table_report.find('tbody').append(tableHtml);
            $('#variance-update').trigger('click');
            $('#overlay').fadeOut(500);
            $modal.fadeOut(500);
        }
    });
    function tankList_load(_data, _id) {
        for (var i in _data) {
            if (_id == _data[i].StationID) return _data[i].TankList;
        }
    }
})();
});