//多语言
var language = $.cookie('language');
var sensorTimer, curStationID, scrollFlag = true;;

language_load();
function language_load() {
    i18n = Lan[language];
    language_init();
}

function pageTimerClear() {
    if (sensorTimer) {
        clearInterval(sensorTimer);
    }
}
var config = {
    enter: function (option) {
        console.log(option);
        console.log(this);
        initCommonPage(this, option);
    },
    leave: function (option) {
        pageTimerClear();
        console.log("leave: " + this.name + "; param: " + JSON.stringify(option.param));
        $("body").css("overflow-y", "auto");
    },
    update: function (option) {
        console.log("update: " + this.name + "; param: " + JSON.stringify(option.param));
        initCommonPage(this, option);
    }
}
var subConfig = {
    enter: function (option) {
        console.log(option);
        console.log(this);
        if (!option.current.param['page']) {
            if (option.current.param['sid'] != curStationID) {
                console.log('调用station.html');
                curStationID = option.current.param['sid'];
                $.get('uc/Station.html', function (_data) {
                    $('.index .main-con').html(_data);
                    stationSummary(option.param['sid']);
                    stationNav(option.param['sid'], option.path);
                    stationAlarmInfoInit(option.param['sid']);
                });
            }
            stationMenuActive('#' + option.path); //stationMenuActive('a[href="#' + option.path + '"]');
            $('.station .main-body-loading').show();
        }
        initStationPage(this, option);
    },
    leave: function (option) {
        pageTimerClear();
        $("body").css("overflow-y", "auto");
        console.log("leave: " + this.name + "; param: " + JSON.stringify(option.param));
    },
    update: function (option) {
        console.log(this);
        console.log(option);
        console.log("update: " + this.name + "; param: " + JSON.stringify(option.param));
        if (!option.current.param['page']) {
            if (option.current.param['sid'] != curStationID) {
                curStationID = option.current.param['sid'];
                $.get('uc/Station.html', function (_data) {
                    $('body').find('.main-con').html(_data);
                    stationSummary(option.param['sid']);
                    stationNav(option.param['sid'], option.path);
                    stationAlarmInfoInit(option.param['sid']);
                });
            }
        }
        initStationPage(this, option);
    }
}
function initStationPage(_this, _option) {
    var stateName = _this.name,
        stateNameArray = stateName.split('.'),
        page = stateNameArray[1];

    if (_option.param['page'] == 'modalDialog' || _option.param['page'] == 'innerDialog') {
        //页面以弹窗形式出现
        $('body').find('.index').addClass('page-dialog');
        $('body').find('#page-loading').hide();
    } else {
        modal_index_data();
        //$.cookie('actionPage',_option.path);
    }
    $('.back-to-top').hide();
    $.get(page + '.html', function (_data) {
        $('.station .station-body').html(_data);
        $('.station .main-body-loading').hide();
        if (!$.isEmptyObject(i18n)) {
            language_init();
        }
        $(window).scrollTop(0);
        $(window).scrollLeft(0);
        var $selectBox = $('body').find('.select-box');
        $selectBox.each(function () {
            var selector = $(this),
                init_value = selector.find('.select-title').attr('data-value');

            selector.attr('data-open', false);
            if (!init_value) selector.find('.select-title').attr('data-value', '');
        });
        commonDate();
        dataTimePicker();
        pageRecord();
        measureMatch();

        //判断参数
        var urlBeginDate = stateman.current.param['beginDate'],
            urlEndDate = stateman.current.param['endDate'];

        if (urlEndDate && (page === 'ShiftBIRReport' || page === 'TicketDelivery')) {
            $('input[name=BeginDate]').val(urlBeginDate);
            $('input[name=EndDate]').val(urlEndDate);
        }
    });
}

//既存在油站下又存在公司下的页面
var stationPageInCompany = ['ChartCalibration', 'TicketDelivery', 'ActiveDelivery'];

function initCommonPage(_this, _option) {
    var page = _this.name;

    console.log(page);
    modal_index_data();
    if (window.location.href.indexOf('cid') > 0) {
        var cid = _option.param['cid'];

        $.cookie('SessionPer', cid);
        sideMenu(cid);
        topCompanyData(cid);
    }
    //$.cookie('actionPage',_option.path);
    $('.back-to-top').hide();

    $.get(page + '.html', function (_data) {
        if (NameSpace.Array.ifContains(stationPageInCompany, page)) {
            $('.index .main-con').html('<div class="inner station"><div class="col-lg-12">' + _data + '</div></div>');
        } else {
            $('.index .main-con').html(_data);
        }

        if (Permission == 'cid') {
            var $box = $('.sidebar-menu .main-menu');
            $('a', $box).removeClass('active');
            //$('a[data-model=' + page + ']', $box).addClass('active');
            $('a[href="#' + _option.path + '"]', $box).addClass('active');
        }
        console.log(i18n);
        if (!$.isEmptyObject(i18n)) {
            language_init();
            //language_load();
        }
        $(window).scrollTop(0);
        $(window).scrollLeft(0);
        var $selectBox = $('body').find('.select-box');
        $selectBox.each(function () {
            var selector = $(this),
                init_value = selector.find('.select-title').attr('data-value');

            selector.attr('data-open', false);
            if (!init_value) selector.find('.select-title').attr('data-value', '');
        });
        commonDate();
        dataTimePicker();
        pageRecord();
        measureMatch();
    });
}
function cfg(o) {
    o.enter = o.enter || config.enter
    o.leave = o.leave || config.leave
    o.update = o.update || config.update
    return o;
}
function subCfg(o) {
    o.enter = o.enter || subConfig.enter
    o.leave = o.leave || subConfig.leave
    o.update = o.update || subConfig.update
    return o;
}

var stateman = new StateMan();
stateman.state({
    'CompanyDashboard': cfg({
        url: "/CompanyDashboard",
        title: getI18n('00000') + '-' + getI18n('06001')
    }),
    'CompanyReport': cfg({
        url: "/CompanyReport",
        title: getI18n('00000') + '-' + getI18n('06002')
    }),
    'CompanyInventory': cfg({
        url: "/CompanyInventory",
        title: getI18n('00000') + '-' + getI18n('06003')
    }),
    'VarianceRank': cfg({
        url: "/VarianceRank",
        title: getI18n('00000') + '-' + getI18n('00011')
    }),
    'VarianceIndex': cfg({
        url: "/VarianceIndex",
        title: getI18n('00000') + '-' + getI18n('00010')
    }),
    'Alarm': cfg({
        url: "/Alarm",
        title: getI18n('00000') + '-' + getI18n('00008')
    }),
    'StationOverview': cfg({
        url: "/StationOverview",
        title: getI18n('00000') + '-' + getI18n('00009')
    }),
    'ActiveDelivery': cfg({
        url: "/ActiveDelivery",
        title: getI18n('00000') + '-' + getI18n('16001')
    }),
    'TicketDelivery': cfg({
        url: "/TicketDelivery",
        title: getI18n('00000') + '-' + getI18n('14050')
    }),
    'DepotPosition': cfg({
        url: "/DepotPosition",
        title: getI18n('00000') + '-' + getI18n('18011')
    }),
    'DepotPositionHistory': cfg({
        url: "/DepotPositionHistory",
        title: getI18n('00000') + '-' + getI18n('18016')
    }),
    'ChartCalibration': cfg({ //公司下的校罐
        url: "/ChartCalibration",
        title: getI18n('00000') + '-' + getI18n('15001')
    }),
    'Map': cfg({
        url: "/Map",
        title: '地图'
    }),
    //油站级页面
    'Station': cfg({
        url: "/Station",
        title: getI18n('00000') + '-' + getI18n('06004'),
        enter: function (option) {
            console.log('Station');
            console.log(option);
            console.log(this);
            curStationID = option.current.param['sid'];
            if (!option.current.param['page']) {
                var done = option.async();
                $('.sidebar-menu').find('.main-menu a').removeClass('active');
                $.get('uc/' + this.name + '.html', function (_data) {
                    $('.index .main-con').html(_data);
                    stationSummary(option.param['sid']);
                    stationNav(option.param['sid'], option.path);
                    stationAlarmInfoInit(option.param['sid']);
                    setTimeout(done, 1000);
                });
            }
        },
        update: function (option) {
            console.log(this);
            console.log("update: " + this.name + "; param: " + JSON.stringify(option.param));
            //this.enter(option);
            $('#overlay').hide();
            $('.modal').hide();
        }
    }),
    'Station.StationDashboard': subCfg({
        url: "",
        title: getI18n('00000') + '-' + getI18n('06004')
    }),
    'Station.HistoryInventory': subCfg({
        url: "/HistoryInventory",
        title: getI18n('00000') + '-' + getI18n('22001')
    }),
    'Station.DeliveryReport': subCfg({
        url: "/DeliveryReport",
        title: getI18n('00000') + '-' + getI18n('23001')
    }),
    'Station.TicketDeliveryInput': subCfg({
        url: "/TicketDeliveryInput",
        title: getI18n('00000') + '-' + getI18n('14002')
    }),
    'Station.LeakManagement': subCfg({
        url: "/LeakManagement",
        title: getI18n('00000') + '-' + getI18n('26001')
    }),
    'Station.NozzleCheck': subCfg({
        url: "/NozzleCheck",
        title: getI18n('00000') + '-' + getI18n('29001')
    }),
    'Station.TankChart': subCfg({
        url: "/TankChart",
        title: getI18n('00000') + '-' + getI18n('25001')
    }),
    'Station.ChartCalibration': subCfg({
        url: "/ChartCalibration",
        title: getI18n('00000') + '-' + getI18n('15001')
    }),
    'Station.TankParam': subCfg({
        url: "/TankParam",
        title: getI18n('00000') + '-' + getI18n('28001')
    }),
    'Station.TankParamManagement': subCfg({
        url: "/TankParamManagement",
        title: getI18n('00000') + '-' + getI18n('27001')
    }),
    'Station.AdjustedVariance': subCfg({
        url: "/AdjustedVariance",
        title: getI18n('00000') + '-' + getI18n('30001')
    }),
    'Station.TicketDelivery': subCfg({
        url: "/TicketDelivery",
        title: getI18n('00000') + '-' + getI18n('14050')
    }),
    'Station.ShiftBIRReport': subCfg({
        url: "/ShiftBIRReport",
        title: getI18n('00000') + '-' + getI18n('24001')
    }),
    'Station.Alarm': subCfg({ //油站下的报警
        url: "/Alarm",
        title: getI18n('00000') + '-' + getI18n('00008')
    }),
    'Station.ActiveDelivery': subCfg({ //油站下在主动配送
        url: "/ActiveDelivery",
        title: getI18n('00000') + '-' + getI18n('16001')
    }),
    'Station.TankChartFinishedStatus': subConfig,
    'Station.TankChartGetDataStatus': subConfig,
    'Station.TankChartNewChartStatus': subConfig,
    'Station.TankChartSubmittedStatus': subConfig,
    'Station.ChartViewer': subCfg({
        url: "/ChartViewer"
    })

}).on("notfound", function () {
    var currentCid = $.cookie('SessionPer');

    console.log('执行notfound');
    this.go('CompanyDashboard', { param: { cid: currentCid } });

}).on('begin', function (evt) {

}).start();

//站级菜单添加active状态
function stationMenuActive(_dom) {
    var $stationNav = $('.station .station-nav');

    $stationNav.find('a').each(function () {
        var href = $(this).attr('href');

        if (_dom.indexOf(href) > -1) {
            //$(this).addClass('active').siblings().removeClass('active');
            $(".station-nav-horizontal a").removeClass('active');
            $(this).addClass('active');
            return false;
        }
    });

}

//概况信息
function stationSummary(_sid) {
    if (_sid) {
        var params = {
            //"SessionID": SessionID,
            'StationID': _sid
        },
        $stationHeader = $('.station-header');

        ajaxCall(URL.StationSummary, params, function (_message) {
            console.log(_message);
            if (_message.Online) $('.line-status', $stationHeader).html('<i class="online"></i>' + getI18n('21002'));
            else $('.line-status', $stationHeader).html('<i class="off-line"></i>' + getI18n('21003'));

            $('#station-name').html(_message.StationName);
            $('#station-id').html(getI18n('10112') + '：' + _sid);
            $('#station-mode').html(getI18n('10113') + '：' + _message.TlgModeName);
            $('#station-officer').html(getI18n('10108') + '：' + _message.Officer);
            $('#station-telphone').html(getI18n('10109') + '：' + _message.Telephone);
            $('#station-address').html(getI18n('10110') + '：' + _message.Address);
        });
    }
}

//油站导航
function stationNav(_sid, _current) {
    var $stationNav = $('.station .station-nav'),
        $stationHorizontal = $(".station-nav .station-nav-horizontal"),
        $stationHamburger = $(".station-nav .station-box-hamburger"),
        htmlHamburger = $stationHamburger.html(),
        stationArrLi = [],
        stationWidthArr = [],
        stationNavHtml = '<li><a href="#/Station?sid=' + _sid + '" class="index"><i class="fa fa-home"></i>' + getI18n('20000') + '</a></li>',
        params = {
            //"SessionID": SessionID,
            "StationID": _sid,
            "LastRequestTime": NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss')
        };
    console.log($.cookie('language'));
    if ($.cookie('language') == 'English') $stationNav.addClass('station-nav-en');
    else $stationNav.removeClass('station-nav-en');

    $stationHorizontal.prepend(stationNavHtml);

    //stationLiSumWidth=$(".station-nav .station-nav-horizontal li")[0].clientWidth; 
    stationWidthArr.push($(".station-nav .station-nav-horizontal li")[0].clientWidth);

    ajaxCall(URL.StationMenu, params, function (_message) {
        console.log(_message);
        for (var i in _message.ActionBarList) {
            //_message.ActionBarList[i].PopupMethod = '2';
            stationNavHtml = "<li>";
            if (_message.ActionBarList[i].PopupMethod == '1') {
                if (_current.indexOf(_message.ActionBarList[i].URL) > -1) {
                    stationNavHtml = stationNavHtml + '<a href="#/' + _message.ActionBarList[i].URL + '" class="active">' + _message.ActionBarList[i].DisplayName + '</a>';
                } else {
                    stationNavHtml = stationNavHtml + '<a href="#/' + _message.ActionBarList[i].URL + '">' + _message.ActionBarList[i].DisplayName + '</a>';
                }
            } else if (_message.ActionBarList[i].PopupMethod == '2') {
                stationNavHtml = stationNavHtml + '<a href="javascript:;" data-url="' + _message.ActionBarList[i].URL + '">' + _message.ActionBarList[i].DisplayName + '</a>';
            } else if (_message.ActionBarList[i].PopupMethod == '3') {
                if (_current.indexOf(_message.ActionBarList[i].URL) > -1) {
                    stationNavHtml = stationNavHtml + '<a href="#/' + _message.ActionBarList[i].URL + '" class="active" target="_blank">' + _message.ActionBarList[i].DisplayName + '</a>';
                } else {
                    stationNavHtml = stationNavHtml + '<a href="#/' + _message.ActionBarList[i].URL + '" target="_blank">' + _message.ActionBarList[i].DisplayName + '</a>';
                }
            }

            stationNavHtml = stationNavHtml + "<span>|</span></li>";
            $($stationHorizontal).find(".select-box").before(stationNavHtml);
            stationWidthArr.push($($stationHorizontal).find("li")[$($stationHorizontal).find("li").length - 2].clientWidth);
        }

        stationArrLi = $($stationHorizontal).find("li");
        resizeStationNav(); 
    });
    $(window).resize(resizeStationNav)

    function resizeStationNav() {
        var isHamburger = false,
            isHambIndex = 0;
        stationLiSumWidth = 0;
        $($stationHorizontal).html();
        $(htmlHamburger).appendTo($stationHorizontal);
        for (var i = 0; i < stationWidthArr.length; i++) {
            stationLiSumWidth += stationWidthArr[i];
            if (stationLiSumWidth < ($($stationHorizontal).width())) {
                $($stationHorizontal).find(".select-box").before(stationArrLi[i]);
                isHambIndex = i;
            }
            else {
                isHamburger = true;
                $(stationArrLi[i]).appendTo($stationHamburger);
            }
        }
        if (isHamburger) {
            if($(stationArrLi[isHambIndex]) )
            {
                $($(stationArrLi[isHambIndex])).remove();
                $($(stationArrLi[isHambIndex])).prependTo($stationHamburger);
            }
            //if($(stationArrLi[isHambIndex-1]))
            //{
            //    $($(stationArrLi[isHambIndex-1])).remove();
            //    $($(stationArrLi[isHambIndex-1])).prependTo($stationHamburger);
            //}
            $($stationHamburger).closest(".select-box").show();
        }
        else {
            $($stationHamburger).closest(".select-box").hide();
        }
    }
}

//油站级页面头部报警信息
function stationAlarmInfoInit(_sid) {
    var params = {
        //'SessionID': SessionID,
        'LastRequestTime': NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'),
        'StationID': _sid
    };
    stationAlarmInfo(params, _sid);
}

function stationAlarmInfo(_params, _sid) {
    if (!$.isEmptyObject(i18n)) {
        language_init();
    }
    ajaxCall(URL.AlarmSummary, _params, function (_message) {
        console.log(_message);
        var $box = $('#alarm-collapse'),
            length = _message.AlarmLevels.length,
            alarmHtml = '',
            className = '';

        $('.alarm-con', $box).find('.item').remove();
        for (var i = length - 1; i >= 0; i--) {
            if (_message.AlarmLevels[i].ID == '1') className = 'bg-tip';
            else if (_message.AlarmLevels[i].ID == '2') className = 'bg-warning';
            else if (_message.AlarmLevels[i].ID == '3') className = 'bg-danger';
            alarmHtml = alarmHtml + '<li class="item ' + className + '"><a href="#/Alarm?sid=' + _sid + '&alarmLevel=' + _message.AlarmLevels[i].ID + '&alarmState=0" target="_blank""><h3>' + _message.AlarmLevels[i].Count + '</h3><span>' + _message.AlarmLevels[i].Display + '</span></a></li>';
        }
        $('.alarm-con', $box).append(alarmHtml);
        $('.alarm-count', $box).attr('href', '#/Alarm?sid=' + _sid + '&alarmState=0').find('h3').text(_message.AlarmCount);

        //报警动画效果
        var flag = false,
            lastWidth = $('.bg-primary', $box).outerWidth(),
            temp = 0;

        setTimeout(function () {
            $('.alarm-con li', $box).each(function () {
                var width = $(this).outerWidth();
                temp = temp + width;
            });
            temp = temp + 1;
            $('.alarm-con', $box).width(temp).css('left', parseInt(temp) - 10);
            console.log(lastWidth);
            $box.width(temp + lastWidth);
        }, 500);
        $('.btn', $box).on('click', function () {
            var $i = $(this).find('i');

            if (!flag) {
                $('.alarm-con', $box).animate({ 'left': 0 }, 500, function () {
                    $i.removeClass('fa-angle-left').addClass('fa-angle-right');
                    flag = true;
                });
            } else {
                $('.alarm-con', $box).animate({ 'left': temp - 10 }, 500, function () {
                    $i.removeClass('fa-angle-right').addClass('fa-angle-left');
                    flag = false;
                });
            }
        });
    });
}

////header、footer部分数据填充
(function () {
    if (!stateman.current.param['page']) {
        var $header = $('.header'),
            cid = $.cookie('SessionPer'),
            alarmParams = {
                //"SessionID": SessionID,
                "LastRequestTime": NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss')
            };

        topCompanyData(cid);
        $('#user-name', $header).text(UserName);
        ajaxCall(URL.AlarmSummary, alarmParams, function (_message) {
            console.log(_message);
            $('.warning .number', $header).attr('href', '#/Alarm?cid=' + cid + '&alarmState=0').text(_message.AlarmCount);
        });
        $('.footer .curYear').text(new Date().getFullYear());
        $('.footer .version').text($.cookie('SystemVersion'));
    }
})();

function topCompanyData(_cid) {
    var $header = $('.header'),
        companyParams = {
            //"SessionID": SessionID,
            "LastRequestTime": NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'),
            "CompanyID": _cid   //stateman.current.param['cid']
        };

    ajaxCall(URL.CompanySummary, companyParams, function (_message) {
        console.log(_message);

        sessionCompanyName = _message.CompanyName;
        $('#company-name', $header).text(sessionCompanyName);
        $('.header-info', $header).attr('href', '#/StationOverview?cid=' + _cid).html(getI18n('09015') + ' ' + _message.TotalStation + ' ' + getI18n('01003') + getI18n('10001') + '：' + _message.OnlineStation + ' ' + getI18n('01003') + getI18n('21002') + '，' + _message.OfflineStation + ' ' + getI18n('01003') + getI18n('21003'));
    });

}

//侧栏
(function () {
    var mainBox = $('.main-box'),
        width = $(window).width();

    if (Permission == 'cid') {
        var cid = $.cookie('SessionPer');
        $('.header').width(width - 100);
        $('.container').animate({ 'padding-left': '100px' }, 500);
        $('.header').animate({ 'left': '100px' }).find('.logo').hide();
        sideMenu(cid);
    } else if (Permission == 'sid') {
        var $header = $('.header');

        $('.sidebar-menu').remove();
        $header.width('100%');
        $('.container').animate({ 'padding-left': '0' }, 500);
        $header.animate({ 'left': '0' }).find('.logo').show();
        $('.station-hide', $header).hide();
    }
})();

function sideMenu(_cid) {
    console.log(_cid);
    var $box = $('.sidebar-menu .main-menu'),
        parameter = '?cid=' + _cid;

    $('a', $box).each(function () {
        var model = $(this).attr('data-model'),
            url = $(this).attr('href');

        if (url != 'javascript:;') {
            if ($(this).attr('data-type')) $(this).attr('href', '#/' + model + parameter + '&type=' + $(this).attr('data-type'));
            else $(this).attr('href', '#/' + model + parameter);
        }
    });
}

function getRelatedMeasure(_unit) {
    if (MeasureText) {
        if (arguments.length == 2) return MeasureText[_unit];
        else return '(' + MeasureText[_unit] + ')';
    }
}

//注销登录
(function () {
    var $header = $('.header');

    $('.logout', $header).on('click', function () {
        ajaxCall(URL.Logout, '{}', function (_message) {
            if (_message.Result == 'Success') {
                $.cookie('LoginStatus', 0);
                top.location.href = 'Login.html';
            }
        });
    });

    $('.help', $header).on('click', function () {
        alert(getI18n('08001'));
    });
})();

//修改密码
(function () {
    var $modal = $('#modal-edit-pwd');

    $('#edit-pwd').on('click', function () {
        modal_show($modal);
        $('input[type=password]', $modal).val('');
    });

    //提交
    $('#btnSubmit').on('click', function () {
        var oldPwd = $('input[name=OldPassword]', $modal).val(),
            newPwd = $('input[name=NewPassword]', $modal).val(),
            repeatPwd = $('input[name=RepeatNewPassword]', $modal).val(),
            bool = true;

        if (bool && (oldPwd === '' || oldPwd.replace(/(^\s*)|(\s*$)/g, '').length == 0)) {
            alert(getI18n('04001'));
            bool = false;
        }
        if (bool && (newPwd === '' || newPwd.replace(/(^\s*)|(\s*$)/g, '').length == 0)) {
            alert(getI18n('04002'));
            bool = false;
        }
        if (bool && (repeatPwd === '' || repeatPwd.replace(/(^\s*)|(\s*$)/g, '').length == 0)) {
            alert(getI18n('04003'));
            bool = false;
        }
        if (bool && repeatPwd !== newPwd) {
            alert(getI18n('04004'));
            bool = false;
        }
        if (bool && newPwd === oldPwd) {
            alert(getI18n('04005'));
            bool = false;
        }
        if (bool) {
            var params = {
                'OldPassword': hex_md5(oldPwd),
                'NewPassword': newPwd
            }
            ajaxCall(URL.ChangePassword, params, function (_message) {
                if (_message.Result == 'Success') {
                    alert(getI18n('04006'));
                    $.cookie('LoginStatus', 0);
                    top.location.href = 'Login.html';
                }
                else alert(_message.Description);
            });
        }
    });
})();


//返回顶部
(function () {
    var $backTop = $('.back-to-top');

    $backTop.on('click', 'a', function () {
        $('body,html').animate({ scrollTop: 0 }, 500);
    });
})();

// window width <1280px
(function () {
    /*当小于1280px的时候，出现横向滚动条，header部分可以随滚动条一起拖动*/

    var addEvent = window.attachEvent || window.addEventListener;
    var resize = window.attachEvent ? 'onresize' : 'resize';
    var scroll = window.attachEvent ? 'onscroll' : 'scroll';
    addEvent(resize, setPosition);
    addEvent(scroll, setPosition);

})();

//侧栏事件
(function () {
    var $box = $('.sidebar-menu .main-menu');

    $('li', $box).hover(function () {
        $(this).find('.sub-menu').stop().animate({
            'left': '100%'
        });
    }, function () {
        $(this).find('.sub-menu').stop().animate({
            'left': '0'
        });
    });

    $('a', $box).on('click', function () {
        $box.find('a').removeClass('active');
        $(this).addClass('active');
    });
})();

//侧栏是否展开
(function () {
    var flag = true;

    $('body').delegate('.sidebar-toggle', 'click', function () {
        var $sidebar = $(this).parent(),
            $i = $(this).find('i'),
            width = $(window).width(),
            headerLeft = parseInt($('.header').css("left").replace("px", ""));

        scrollFlag = false;
        if (flag) {
            $sidebar.animate({ 'left': '-100px' }, 500);
            $('.container').animate({ 'padding-left': '0' }, 500);
            $('.header').animate({ 'left': (headerLeft - 100), 'width': '100%' }, 500, function () {
                $i.addClass('fa-angle-right').removeClass('fa-angle-left');
                setPosition();
                scrollFlag = true;
            }).find('.logo').fadeIn();
            flag = false;
        } else {
            $sidebar.animate({ 'left': '0' }, 500);
            $('.container').animate({ 'padding-left': '100px' }, 500);
            $('.header').animate({ 'left': headerLeft + 100, 'width': (width - 100) }, 500, function () {
                $i.addClass('fa-angle-left').removeClass('fa-angle-right');
                setPosition();
                scrollFlag = true;
            }).find('.logo').hide();
            flag = true;
        }
        /*var page = stateman.current.currentName;
        $.getScript('statics/js/companyDashbord.js');*/
    });
})();

(function () {
    var $company = $('.modal-company'),
        $station = $('.modal-station');

    //modal_index_data();
    $('body').on('click', '#modal-company', function () {
        $('dl', $company).attr('data-open', false);
        $('input[name=company-search]', $company).val('');
        $('a[name]', $company).removeClass('highlight');
        $('dd', $company).slideUp();
        modal_show($company);
        /*$('.company-list', $company).jScrollPane({
            verticalGutter: 20
        });*/
    });

    $('body').delegate('#modal-station', 'click', function () {
        modal_show($station);

        $('#search-keyword input').val('');
        $('.letter-list', $station).find('a').removeClass('active');
        $('.station-list ul', $station).find('li').removeClass('borderTop').show().filter(function (index) {
            if (index < 3) $(this).addClass('borderTop');
        });
        $('.station-list', $station).jScrollPane({
            verticalGutter: 25
        });
    });

    $('body').on('click', '.modal-company .company-list a', function () {
        modal_hide($(this).closest('.modal'));
    });

    $('body').on('click', '.modal-station .station-list a', function () {
        modal_hide($(this).closest('.modal'));
    });

})();

//油站导航点击
(function () {
    $('body').on('click', '.station-nav a', function () {
        if ($(this).attr('data-url')) {
            var $modal = $('#modal-commonPage'),
                iframeHtml = '<iframe frameborder="0" width="1300px" height="600px" scrolling="yes" src="" name="modalPage-iframe" id="modalPage-iframe"></iframe>',
                url = $(this).attr('data-url');

            $('.main-content', $modal).html(iframeHtml);
            $('#modalPage-iframe', $modal).attr('src', 'dialog.html#/' + url + '&page=modalDialog');
            modal_show($modal);
        }
    });
})();


