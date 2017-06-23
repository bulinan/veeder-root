$(function () {
    var cid = stateman.current.param['cid'];

    //鹤位维护
    (function () {
        init_depot();
    })();

    //添加鹤位
    (function () {
        //基础数据
        var params = {
            //"SessionID": SessionID,
            "CompanyID": cid
        },
        $modal = $('#modal-depotAdd');

        //增加
        $('.inner').on('click', '#depot-add', function () {
            $('input[type=text]', $modal).val('');
            ajaxCall(URL.DepotPositionMeta, params, function (_message) {
                console.log(_message);
                var oilDepotList = _message.OilDepotList,
                productList = _message.ProductList,
                oilHtml = '',
                productHtml = '';

                if (oilDepotList.length) {
                    for (var i in oilDepotList) {
                        oilHtml = oilHtml + '<li data-value="' + oilDepotList[i].OilDepot + '">' + oilDepotList[i].DisplayName + '</li>';
                    }
                } else {
                    oilHtml = '<li data-value="">' + getI18n('09001') + '</li>';
                }

                if (productList.length) {
                    for (var i in productList) {
                        productHtml = productHtml + '<li data-value="' + productList[i].ProductID + '">' + productList[i].DisplayName + '</li>';
                    }
                } else {
                    productHtml = '<li data-value="">' + getI18n('09001') + '</li>';
                }

                $('#OilDepotList').find('.select-con').html(oilHtml);
                $('#ProductList').find('.select-con').html(productHtml);
                NameSpace.Select.firstSelected($('#OilDepotList'));
                NameSpace.Select.firstSelected($('#ProductList'));
                modal_show($modal);
            });
        });

        //保存
        $('.inner').on('click', '#depot-add-save', function () {
            var _params = {
                //"SessionID": SessionID
            }
            _params = NameSpace.String.getFormParams('#depot-add-form', _params);
            if (_params === false) {
                return false;
            }
            ajaxCall(URL.AddDepotPosition, _params, function (_message) {
                console.log(_message);
                if (_message.Result == 'Success') {
                    modal_hide($modal, function () {
                        init_depot();
                    });
                } else {
                    alert(_message.Description);
                }
            });
        });
    })();

    //鹤位管理
    (function () {
        var $modal = $('#modal-depotManage');

        $('.inner').on('click', '.depot-manage', function () {
            var data = $(this).closest('tr').data('value');

            //$('input[name=Positionid]', $modal).val(data.positionID);
            NameSpace.Format.formDetail('#depot-manage-form',data);
            modal_show($modal);
        });

        //保存
        $('.inner').on('click', '#depot-manage-save', function () {
            var params = {
                //"SessionID": SessionID
            }
            params = NameSpace.String.getFormParams('#depot-manage-form', params);
            if (params === false) {
                return false;
            }
            ajaxCall(URL.DepotPositionManagement, params, function (_message) {
                if (_message.Result == 'Success') {
                    modal_hide($modal, function () {
                        init_depot();
                    });
                } else {
                    alert(_message.Description);
                }
            });
        });
    })();

    //鹤位维护主页初始化表格
    function init_depot() {
        var params = {
            //"SessionID": SessionID,
            "CompanyID": cid
        };

        ajaxCall(URL.DepotPosition, params, function (_message) {
            console.log(_message);
            if (_message.Result == 'Success') {
                $('.record-box').show();
                var pagelen = $('.record-box input[type=hidden]').val();

                if (pagelen == '') pagelen = 20;
                else pagelen = parseInt(pagelen);
                $('.record-box input[type=hidden]').val(pagelen);

                $('#depotPosition').show().dataTable({
                    'lengthChange': [10, 20, 50, 75, 100],
                    'processing': true,
                    'searching': false, //searching
                    'pagingType': 'full_numbers',
                    'order': [],
                    'pageLength': pagelen,
                    'dom': 'lfrt<"dataTables_bottom"pi>',
                    'destroy': true,
                    'data': _message.DepotPositionList,
                    'createdRow': function (_row, _data, _dataIndex) {
                        $(_row).data('value', _data);
                    },
                    'columns': [
                        {
                            'width': '100px',
                            'data': 'spShortName'
                        },
                        {
                            'width': '7%',
                            'data': 'dpDes'
                        },
                        {
                            'width': '80px',
                            'data': 'otShortName'
                        },
                        {
                            'data': 'meterType'
                        },
                        {
                            'width': '100px',
                            'data': 'meterModel'
                        },
                        {
                            'width': '8.75%',
                            'data': 'manufactureNum'
                        },
                        {
                            'data': 'accuracy',
                            'width': '11%',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return _data.toFixed(2);
                            }
                        },
                        {
                            'data': 'variant',
                            'width': '11%',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return _data.toFixed(2);
                            }
                        },
                        {
                            'data': 'calibrationDate',
                            'width': '13.2%',
                            'render': function (_data, _type, _full) {
                                if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                                else return '';
                            }
                        },
                        {
                            'width': '100px',
                            'data': 'certificateNum'
                        },
                        {
                            'data': '',
                            'width': '80px',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                return '<a href="javascript:;" class="depot-manage text-style01">' + getI18n('18010') + '</a>'
                            }
                        }
                    ],
                    'language': {
                        'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                        'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                        'infoEmpty': getI18n('10802'),
                        'emptyTable': getI18n('18901'),
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
                $('.block-loading').hide();
            }
        });
    }
});