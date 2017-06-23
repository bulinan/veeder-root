/*
    油站一览
*/
$(function () {
    var CompanyID = stateman.current.param['cid'],
        $box = $('.station .station-overview'),
        StationOverviewMsg, productList;

    init();
    $('.back-to-top').show();
    function init() {
        var params = {
            //"SessionID": SessionID,
            "CompanyID": CompanyID
        };
        ajaxCall(URL.ProductList, params, function (_message) {
            productList = _message.ProductList;

            ajaxCall(URL.StationOverview, params, function (_message) {
                console.log(_message);
                StationOverviewMsg = _message;
                var stationList = _message.StationList,
                    stationListHtml = '';

                for (var index = 0; index < stationList.length; index++) {
                    stationListHtml = stationListHtml + '<li data-value="' + stationList[index].StationID + '">' + stationList[index].StationName + '</li>';
                }
                $('#stationList').find('.select-con').html(stationListHtml);
                getPageContent(_message);

                //输入框
                $('input[name=companyName-search]').autocomplete(_message.StationList, {
                    width: 220,
                    scrollHeight: 300,
                    matchContains: true,
                    clickFire: true,
                    mustMatch: true,
                    highlight: false,
                    //multiple: true,
                    //multipleSeparator: ',',
                    formatItem: function (row, i, max) {
                        if (row == 'No Records.') {
                            return getI18n('07007');
                        } else {
                            return '<a href="javascript:;">' + row.StationName + '</a>';
                        }
                    },
                    formatMatch: function (row) {
                        return row.StationName;
                    },
                    formatResult: function (row) {
                        if (row[0] == 'No Records.') {
                            return getI18n('07007');
                        } else {
                            return row.StationName;
                        }

                    }
                }).result(function (event, data, formatted) {
                    if (data && data != 'No Records.') {
                        var top = $('#' + data.StationID).offset().top;

                        $(this).attr('data-id', data.StationID);
                        console.log(top);
                        setTimeout(function () {
                            $('body,html').animate({ scrollTop: top - 45 }, 500);
                            //$(window).scrollTop(top - 45);
                        }, 100);
                    }
                });

                NameSpace.Select.select_getStation = function (_element, _selector) {
                    var id = _element.attr('data-value'),
                        top = $('#' + id).offset().top;

                    _selector.find('input[name=companyName-search]').val(_element.text());
                    setTimeout(function () {
                        $('body,html').animate({ scrollTop: top - 45 }, 500);
                    }, 100);
                }

                //查询按钮
                $('.inner').on('click', '#company-query', function () {
                    var id = $('input[name=companyName-search]').attr('data-id');

                    if (id) {
                        var top = $('#' + id).offset().top;
                        $('body,html').animate({ scrollTop: top - 45 }, 500);
                    }
                });
            });
        });
    }

    function getPageContent(_message) {
        var html = $('#tpl').html(),
            template = Handlebars.compile(html);

        Handlebars.registerHelper("calculateHeight", function (_data) {
            if (_data.Diameter == 0) return 0;
            else return (_data.FuelHeight / _data.Diameter) * 100 + '%';
        });
        Handlebars.registerHelper("keepDecimal", function (_data) {
            return _data.toFixed(2);
        });
        Handlebars.registerHelper("calculateStyle", function (_data) {
            for (var i in productList) {
                if (productList[i].DisplayName == _data) return productList[i].Color;
            }
        });
        $box.html(template(_message));
        language_init();
        measureMatch();
        tank_scroll();

        $('.item-chart-group', $box).hover(function () {
            $(this).parent().next().show();
        }, function () {
            $(this).parent().next().hide();
        });

        $('#page-loading').hide();
    }

    function tank_scroll() {
        $('.tank-scroll').owlCarousel({
            items: 4, 
            itemsDesktop: [1199, 4],
            itemsDesktopSmall: [979, 4],
            itemsTablet: [768, 4],
            itemsMobile: [479, 4],
            slideSpeed: 1000,
            rewindNav: false,
            pagination: false,
            navigation: true,
            navigationText: ['<i class="fa fa-arrow-circle-o-left"></i>', '<i class="fa fa-arrow-circle-o-right"></i>']
        });
    }

    //排序
    (function () {
        $('#station-sort').on('click', function () {
            $('#page-loading').show();
            
            var mark = $(this).attr('data-mark'),
                NewData = { 'StationList': [] },
                onlineArray = [],
                offlineArray = [];
            
            for (var i in StationOverviewMsg.StationList) {
                if (StationOverviewMsg.StationList[i].Online) { //在线
                    onlineArray.push(StationOverviewMsg.StationList[i]);
                } else {
                    offlineArray.push(StationOverviewMsg.StationList[i]);
                }
            }
            if (mark === undefined || mark == 'up') {
                NewData['StationList'] = onlineArray.concat(offlineArray);
                $(this).attr('data-mark', 'dowm').find('i:last').removeClass().addClass('fa fa-sort-desc');
            } else {
                NewData['StationList'] = offlineArray.concat(onlineArray);
                $(this).attr('data-mark', 'up').find('i:last').removeClass().addClass('fa  fa-sort-asc');
            }
            getPageContent(NewData);
        });

    })();

    //更新
    (function () {
        $('.inner').on('click', '#station-overview-update', function () {
            $('#page-loading').show();
            init();
            $('#station-sort').removeAttr('data-mark').find('i:last').removeClass() ;
        });
    })();

    //状态
    (function () {
        var $box = $('body').find('.station-overview');

        $box.delegate('.icon-list-collapse', 'click', function () {
            var $itemBox = $(this).closest('.status-list'),
                isOpen = $itemBox.attr('data-open');

            if (!isOpen || isOpen == 'false') {
                $(this).parent().next().slideUp(500);
                $itemBox.attr('data-open', true);
            } else {
                $(this).parent().next().slideDown(500);
                $itemBox.attr('data-open', false);
            }
        });
        $box.delegate('.icon-info-collapse', 'click', function () {
            var $body = $(this).closest('.panel').find('.panel-body'),
                $itemBox = $body.find('.station-info'),
                height = $itemBox.outerHeight(),
                isOpen = $itemBox.attr('data-open');

            console.log(height);
            if (isOpen == 'false') {
                $body.animate({ 'top': -height });
                $itemBox.attr('data-open', true);
            } else {
                $body.animate({ 'top': 0 });
                $itemBox.attr('data-open', false);
            }
        });
    })();
});