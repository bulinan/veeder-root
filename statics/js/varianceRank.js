$(function () {

    var cid = stateman.current.param['cid'],
        $page = $('body .variance');

    //油品列表
    (function () {
        var $box = $('body').find('#product-list'),
            html = '<li data-value="">' + getI18n('09001') + '</li>';

        var params = {
            //"SessionID": SessionID,
            "CompanyID": cid
        }
        ajaxCall(URL.ProductList, params, function (_message) {
            var productList = _message.ProductList;

            for (var i in productList) {
                html = html + '<li data-value="' + productList[i].ProductID + '">' + productList[i].DisplayName + '</li>';
            }
            $box.find('.select-con').html(html);
        });

        //默认V20
        var $typeBut = $page.find('.inner-options .btn-group');

        init(true);

        $('.rank-item .panel-heading').each(function () {
            $(this).on("click", function () {
                headerImgChange(this);
            });
        })


        function init(_bool, _type) {
            var rankParams = {
                //"SessionID": SessionID,
                "CompanyID": cid
            },
                deliveryRankParams = {
                    //"SessionID": SessionID,
                    "CompanyID": cid,
                    "VarianceType": "1,2,3,4",
                    "CalcInterval": "Month"
                };

            if (_bool) {
                var date = NameSpace.Date.getCurrentMonth();

                rankParams['BeginDate'] = date[0];
                rankParams['EndDate'] = date[1];
                deliveryRankParams['BeginDate'] = date[0];
                deliveryRankParams['EndDate'] = date[1];
            } else {
                rankParams = NameSpace.String.getFormParams('#variance-rank-form', rankParams);
                if (rankParams === false) {
                    return false;
                }
                deliveryRankParams = NameSpace.String.getFormParams('#variance-rank-form', deliveryRankParams);
                if (deliveryRankParams === false) {
                    return false;
                }
            }

            if (_type) $typeBut.find('a[data-type="' + _type + '"]').addClass('active').siblings('.btn').removeClass('active');

            var type = $('a.active', $typeBut).attr('data-type');
            rankParams['CalcType'] = type;
            deliveryRankParams['CalcType'] = type;

            $('.panel').find('.block-loading').show();
            //各损益率统计排行
            ajaxCall(URL.VarianceRank, rankParams, function (_message) {
                console.log(_message);
                VarianceRank = _message.Variance;
                initTable(type);
            });

            //司机、车辆、发油鹤位、小量进油损益率排行
            ajaxCall(URL.DeliveryVarianceRank, deliveryRankParams, function (_message) {
                console.log(_message);
                DeliveryVarianceRank = _message;
                initDeliveryTable(type);
            });

            $(".rank-list i.fa").removeClass("fa-sort-desc");
            $(".rank-list i.fa").removeClass("fa-sort-asc");

        }

        function initTable(_type) {
            $('.panel-variance-rank').each(function () {
                var $table = $(this).find('table'),
                    $panelHeader = $(this).find('.panel-heading'),
                    mark = $table.closest('.panel').attr('data-mark'),
                    data;

                if (_type == 'V20') data = VarianceRank.V20VarianceList;
                else data = VarianceRank.VtVarianceList;

                var table = $table.DataTable({
                    'paging': false,
                    'info': false,
                    'searching': false,
                    'destroy': true,
                    'data': data,
                    "rowCallback": function (row, data, index) {
                        // replace the contents of the first column (rowid) with an edit link
                        $('td:first', row).html(index + 1);
                    },
                    'columns': [
                        {
                            'class': 'first',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                return '';
                            }
                        },
                        {
                            'data': 'CompanyName',
                            'orderable': false
                        },
                        {
                            'render': function (_data, _type, _full, meta) {
                                return _full[meta.settings.nTable.id];
                            }
                        },
                        {
                            'class': 'last',
                            'orderable': false,
                            'render': function (_data, _type, _full) {
                                if (_full.OrgType == '2') return '<a href="#/VarianceIndex?cid=' + _full.CompanyID + '"><i class="fa fa-angle-right"></i></a>'; //公司
                                else if (_full.OrgType == '1') return '<a href="#/Station/ShiftBIRReport?sid=' + _full.CompanyID + '"><i class="fa fa-angle-right"></i></a>'; //油站
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('13901')
                    }
                });

                $(this).find('.block-loading').hide();
                table.order.listener($panelHeader, 2);
            });
        }

        function initDeliveryTable(_type) {
            $('.panel-variance02-rank').each(function () {
                var table = $(this).find('table'),
                    $panelHeader = $(this).find('.panel-heading'),
                    mark = table.closest('.panel').attr('data-mark'),
                    data;

                if (_type == 'V20') data = DeliveryVarianceRank.V20Variance[mark];
                else data = DeliveryVarianceRank.VtVariance[mark];

                var dTable = table.DataTable({
                    'paging': false,
                    'info': false,
                    'searching': false,
                    "destroy": true,
                    "data": data,
                    "rowCallback": function (row, data, index) {
                        // replace the contents of the first column (rowid) with an edit link
                        $('td:first', row).html(index + 1);
                    },
                    'columns': [
                        {
                            //'data': 'ID',
                            'class': 'first',
                            'render': function (_data, _type, _full) {
                                return '';
                            }
                        },
                        {
                            'data': 'DisplayText'
                        },
                        {
                            'data': 'Ratio',
                            'render': function (_data, _type, _full) {
                                return _data.toFixed(2);
                            }
                        }
                    ]
                });

                $(this).closest('.panel').find('.block-loading').hide();
                dTable.order.listener($panelHeader, 2);

            });
        }
        function headerImgChange(panelHeader) {
            var $sortimg = $(panelHeader).find("i:last");
            if ($sortimg && $sortimg.hasClass("fa-sort-asc")) {
                $sortimg.removeClass("fa-sort-asc");
                $sortimg.addClass("fa-sort-desc");
            } else {
                $sortimg.removeClass("fa-sort-desc");
                $sortimg.addClass("fa-sort-asc");
            }
        }
        //VT,V20切换
        $typeBut.on('click', '.btn', function () {
            var type = $(this).attr('data-type');

            init(false, type);
            //$(this).addClass('active').siblings('.btn').removeClass('active');

        });

        //更新
        $typeBut.on('click', '.update', function () {
            init(false);

        });
    })();
});