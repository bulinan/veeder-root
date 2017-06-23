$(function () {
    var typeStr,
        claimStateList,
        claimCompensationMethodList;

    for (var key in stateman.current.param) {
        typeStr = key;
    }
    var documentTitle = document.title;
    //油品列表
    (function () {
        var params = {
            //"SessionID": SessionID
        }
        if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
        else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];

        ajaxCall(URL.ProductList, params, function (_message) {
            var productList = _message.ProductList;
            for (var index in productList) {
                $('#ProductList').find('.select-con').append('<li data-value=' + productList[index].ProductID + '>' + productList[index].DisplayName + '</li>');
            }
            $('.condition-list').find('.block-loading').hide();
        });
    })();

    // 进油报告查询
    (function () {
        $('.station-body').find('.station-con').on('click', '#report-query', function () {
            var params = {
                //"SessionID": SessionID,
                "LastRequestTime": '',
                "PageInfo": {}
            },
            total,
            reportDeliveryList;

            if (typeStr == 'sid') params['StationID'] = stateman.current.param[typeStr];
            else if (typeStr == 'cid') params['CompanyID'] = stateman.current.param[typeStr];

            params = NameSpace.String.getFormParams('#delivery-report-query', params);
            console.log(params);
            if (params === false) {
                return false
            }

            var pagelen = $('.record-box input[type=hidden]').val(),
                conditionHeight = $('.condition-list').outerHeight();

            if (pagelen == '') pagelen = 20;
            else pagelen = parseInt(pagelen);
            $('.record-box input[type=hidden]').val(pagelen);

            var $table = $('.station-body').find('.delivery-report-con table');
            $table.show();
            $('body').find('.record-box').css('top', conditionHeight).show();
            var table = $table.DataTable({
                'lengthMenu': [10, 20, 50, 75, 100],
                'searching': false, //searching
                'pagingType': 'full_numbers',
                'pageLength': pagelen,
                'dom': 'Blfrt<"dataTables_bottom"pi>',
                'order': [],
                'destroy': true,
                'sAjaxSource': URL.DeliveryReport,
                'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    var table = $(this);
                    //aoData = params; //aoData跟params不一样，它包含params和其他参数

                    params['PageInfo'].RecordOffset = oSettings._iDisplayStart + 1; // 请求的开始记录编号
                    //params['PageInfo'].RequestCount = oSettings._iDisplayLength; // 请求记录数量
                    params['PageInfo'].RequestCount = '';

                    ajaxCall(sSource, params, function (_message) {
                        reportDeliveryList = _message.DeliveryList;

                        if (oSettings._iDisplayStart == 0) total = _message.PageInfo[0].TotalCount;
                        fnCallback(format(_message, total));
                    });
                },
                'createdRow': function (_row, _data, _dataIndex) {
                    var data = JSON.stringify(_data);
                    $(_row).attr('data-value', data);
                },
                'buttons': [
                    {
                        extend: 'excel',
                        text: getI18n('09902'),
                        className: 'btn-export',
                        footer: true,
                        enabled: false,
                        exportOptions: {
                            columns: ':visible',
                            modifier: {
                                page: 'all'
                            }
                        },
                        title: getI18n('00000')+'-' + getI18n('23001'),
                        customize: function (xls) {
                            document.title = documentTitle;
                            var sheetData = xls.xl.worksheets['sheet1.xml'];

                            for (var i in reportDeliveryList) {
                                var $row = $('row[r=' + (parseInt(i) + 2) + ']', sheetData),
                                    beginDate = reportDeliveryList[i].BeginDate.split(' '),
                                    endDate = reportDeliveryList[i].EndDate.split(' ');

                                $('c[r=C' + (parseInt(i) + 2) + '] t', $row).text(beginDate[0] + '  ' + beginDate[1]);
                                $('c[r=D' + (parseInt(i) + 2) + '] t', $row).text(endDate[0] + '  ' + endDate[1]);

                                if (reportDeliveryList[i].StartInventory === 0) {
                                    $('c[r=E' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (reportDeliveryList[i].EndInventory === 0) {
                                    $('c[r=F' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                                if (reportDeliveryList[i].EndUllage === 0) {
                                    $('c[r=G' + (parseInt(i) + 2) + '] v', $row).text('0');
                                }
                            }
                        }
                    }
                ],
                'columns': [
                        {
                            'data': 'StationName',
                            'width': '200px'
                        },
                        {
                            'data': 'TankNo',
                            'render': function (_data, _type, _full, _meta) {
                                if (_data == '0') return '--';
                                else return _data;
                            }
                        },
                        {
                            'data': 'Product'
                        },
                        {
                            'data': 'BeginDate',
                            'render': function (_data, _type, _full, _meta) {
                                if (_data == "0001-01-01 00:00:00") return 'N/A';
                                else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                            }
                        },
                        {
                            'data': 'EndDate',
                            'render': function (_data, _type, _full, _meta) {
                                if (_data == "0001-01-01 00:00:00") return 'N/A';
                                else return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                            }
                        },
                        {
                            'data': 'StartInventory',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'EndInventory',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'EndUllage',
                            'render': function (_data, _type, _full) {
                                return Math.round(_data);
                            }
                        },
                        {
                            'data': 'DeliveryVolume',
                            'render': function (_data, _type, _full) {
                                return '<a href="javascript:;" class="delivery-report-detail text-style01">' + Math.round(_data) + '</a>'
                            }
                        },
                        {
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                return '<a href="javascript:;" class="delivery-report-video"><i class="fa fa-video-camera"></i></a>';
                            }
                        }
                    ],
                'language': {
                    'info': getI18n('10806') + ' _START_ ' + getI18n('10807') + ' _END_ ' + getI18n('10808') + '，' + getI18n('10809') + ' _TOTAL_ ' + getI18n('10810'),
                    'lengthMenu': getI18n('10804') + ' _MENU_ ' + getI18n('10805'),
                    'loadingRecords': getI18n('10801'),
                    'infoEmpty': getI18n('10802'),
                    'emptyTable': getI18n('23901'),
                    'paginate': {
                        'first': '<i class="fa fa-angle-double-left"></i>',
                        'last': '<i class="fa fa-angle-double-right"></i>',
                        'previous': '<i class="fa fa-angle-left"></i>',
                        'next': '<i class="fa fa-angle-right"></i>'
                    }
                },
                'initComplete': function (settings, json) {
                    var api = new $.fn.dataTable.Api(settings);
                    if (api.data().length == 0) api.buttons().enable(false);
                    else api.buttons().enable(true);

                    //$(this.api().table().container()).find('.dataTables_info,.dataTables_paginate').show();
                    $(this.api().table().container()).find('.dataTables_bottom').slideDown(function(){
                        document.title = documentTitle;
                    });
                }
            });

            var column = table.column(0);
            if (typeStr == 'sid') column.visible(!column.visible());
            else if (typeStr == 'cid') column.visible(column.visible());

            function format(_data, _total) {
                return {
                    recordsTotal: _total,
                    recordsFiltered: _total,
                    data: _data.DeliveryList
                };
            }
        });
    })();

    //详情
    (function () {
        $('.station-body').find('.station-con').delegate('.delivery-report-detail', 'click', function () {
            var $modal = $('#modal-delivery-report-detail'),
                detailData = JSON.parse($(this).closest('tr').attr('data-value'));

            $('#delivery-report-detail-list').show();
            NameSpace.Format.detail('#delivery-report-detail-list li', detailData);
            modal_show($modal);
        });

        $('.station-body').find('.station-con').on('click', '.delivery-report-video', function () {
            alert(i18n['23902']);
        });
    })();
});
