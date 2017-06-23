var SessionID = $.cookie('SessionID'),
    Permission = $.cookie('Permission'),
    UserName = $.cookie('UserName'),
    sessionCompanyName,
    MeasureText;

//日历
function dataTimePicker () {
    if ($('body').find('.ui-datepicker-trigger').size() > 0 || $('body').find('.ui-datetimepicker-trigger').size() > 0 || $('body').find('.ui-dateminutespicker-trigger').size() > 0) {
        $('body').on('focus','.ui-datepicker-trigger', function () {
            WdatePicker({
                autoPickDate: true,
                dateFmt: 'yyyy-MM-dd'
            }
            );
        });
        $('body').on('focus','.ui-datetimepicker-trigger',function () {
            WdatePicker({
                autoPickDate: false,
                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                hmsMenuCfg: {
                    H: [1, 6],
                    m: [1, 10], 
                    s: [1, 6] 
                }
            });
        });
        $('body').on('focus','.ui-dateminutespicker-trigger',function () {
            WdatePicker({
                autoPickDate: false,
                dateFmt: 'yyyy-MM-dd HH:mm',
                hmsMenuCfg: {
                    H: [1, 6],
                    m: [1, 10]
                }
            });
        });
    }
}

//panel heading 小图标功能
(function () {
    var $left_box = $('body').find('.index .col-lg-8');

    $('.panel', $left_box).each(function () {
        $(this).attr('data-open', false);
    });

    //折叠
    $('body').on('click','.panel-options .more',function () {
        var $panel = $(this).closest('.panel'),
            isOpen = $panel.attr('data-open');

        if (isOpen == 'false' || isOpen == undefined) {
            $panel.find('.panel-body').slideUp(500);
            $panel.attr('data-open', true);
        } else {
            $panel.find('.panel-body').slideDown(500,function(){
                /*if($panel.find('.panel-body table').length){
                    var table = $panel.find('.panel-body table').DataTable();

                    $(table.table().node()).width($(table.table().container()).width());
                    table.columns.adjust().draw( false );
                }*/
                if($panel.find('.panel-body [data-chart=true]').length){
                    var $charts = $panel.find('.panel-body [data-chart=true]');

                    $charts.each(function(){
                        var chart = $(this).data('api');
                        chart.reflow();
                    });
                }
            });
            $panel.attr('data-open', false);
        }
    });

    //删除
    $('body').on('click', '.panel-options .delete',function () {
        var $panel = $(this).closest('.panel');
        $panel.remove();
    });
})();

//打开模态框
function modal_show(_modal) {
    $('#overlay').fadeIn(500);
    _modal.fadeIn(500, function () {
        var marginTop;

        if (_modal.hasClass('layered-modal')) {
            var parentModalTop = $('.modal:visible').find('.modal-dialog').css('margin-top');
            console.log(parentModalTop);
            marginTop = parseInt(parentModalTop) + 50;
        } else {
            var height = _modal.find('.modal-dialog').height(),
                winScrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            /*if (!_modal.closest('.index').hasClass('page-dialog') && _modal.parent().hasClass('station-body')) {
            winScrollTop = winScrollTop - 190;
            }*/
            if (winHeight - height > 0) {
                marginTop = winScrollTop + (winHeight - height) / 2;
            }else {
                marginTop = winScrollTop + 43;
                $('.main-box').addClass('modal-scroll');
            }
        }
        $('.modal-dialog', _modal).css('margin-top', marginTop);
    });
}

//关闭模态框
function modal_hide(_modal,_callback) {
   if(!_modal.hasClass('layered-modal')) $('#overlay').fadeOut(500);
   else{
       if(_modal.closest('.index').hasClass('page-dialog')) $('#overlay').fadeOut(500);
   }
   _modal.fadeOut(500);
   $('.main-box').removeClass('modal-scroll');
   if (_callback) _callback();
}
    
//关闭模态框
(function () {
    $('body').delegate('.modal-close,.btn-cancel','click', function () {
        var $modal = $(this).closest('.modal');

        if(!$modal.hasClass('layered-modal')) $('#overlay').fadeOut(500);
        else{
            if($modal.closest('.index').hasClass('page-dialog')) $('#overlay').fadeOut(500);
        }
        $modal.fadeOut(500);
        $('.main-box').removeClass('modal-scroll');
    });
})();

//公司、油站浮层数据填充
function modal_index_data(){
    var params = {
	        //"SessionID" : SessionID,
	        "LastRequestTime" : NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'),
	        "CompanyID" : stateman.current.param['cid']
        },
        $box = $('.modal-station'),
        $company = $('.modal-company'),
        companyList,
        stationList;

        ajaxCall(URL.StationList, params, function (_message) {
            console.log(_message);
            var temp = [],
            group = [],
            companyData = [];

            companyList = _message.CompanyList.Children;
            stationList = _message.StationList;
            //公司
            var parent = {
                'OrgID': _message.CompanyList.OrgID,
                'OrgName': _message.CompanyList.OrgName
            };
            companyData.push(parent);

            var html = '<div class="company-list"><div class="parent-name"><a href="#' + company_url(_message.CompanyList.OrgID) + '" name="' + _message.CompanyList.OrgID + '" id="' + _message.CompanyList.OrgID + '">' + _message.CompanyList.OrgName + '</a></div>';
            for (var i in companyList) {
                var temp1 = {
                    'OrgID': companyList[i].OrgID,
                    'OrgName': companyList[i].OrgName
                }
                companyData.push(temp1);
                if (companyList[i].Children.length) {
                    var subList = companyList[i].Children;
                    html = html + '<dl data-open="false" class="clearfix"><dt><a href="#' + company_url(companyList[i].OrgID) + '" name="' + companyList[i].OrgID + '" id="' + companyList[i].OrgID + '" class="pull-left">' + companyList[i].OrgName + '</a><i class="fa fa-angle-down"></i></dt><dd>';
                    for (var j in subList) {
                        var temp2 = {
                            'OrgID': subList[j].OrgID,
                            'OrgName': subList[j].OrgName,
                            'ParentID': companyList[i].OrgID
                        }
                        companyData.push(temp2);
                        html = html + '<a href="#' + company_url(subList[j].OrgID) + '" name="' + subList[j].OrgID + '" id="' + subList[j].OrgID + '" data-parent="' + companyList[i].OrgID + '">' + subList[j].OrgName + '</a>';
                    }
                    html = html + '</dd></dl>';
                } else {
                    html = html + '<dl data-open="false" class="clearfix"><dt><a href="#' + company_url(companyList[i].OrgID) + '" name="' + companyList[i].OrgID + '" id="' + companyList[i].OrgID + '" class="pull-left">' + companyList[i].OrgName + '</a></dt></dl>';
                }
            }
            html = html + '</div>';
            $('.main-content', $company).html(html);

            //油站
            $('.station-list ul', $box).html('');
            $('.letter-list', $box).html('');

            for (var index in stationList) {
                $('.station-list ul', $box).append('<li data-group="' + stationList[index].GroupID + '"><a href="#/Station?sid=' + stationList[index].StationID + '">' + stationList[index].DisplayName + '</a></li>');
                if (index >= 0 && index <= 2) $('.station-list ul', $box).find('li').eq(index).addClass('borderTop');
                temp.push(stationList[index].GroupID);
            }

            group = NameSpace.Array.unique(temp);
            for (i in group) {
                if (group[i] == '-1') group.splice(i, 1);
            }

            /*group = NameSpace.Array.unique(temp).filter(function (n) {
            return n != -1;
            });*/
            //ES5用法

            for (var i = 0; i < group.length; i++) {
                $('.letter-list', $box).append('<a href="javascript:;" data-value="' + group[i] + '">' + group[i] + '</a>');
            }
            modal_station(stationList);
            modal_company(companyData);
        });
    
}

//只有cid是变化的
function company_url(_cid){
    var pageParam = stateman.current.param,
        url = stateman.current.url,
        urlParam = '';

    if(pageParam.hasOwnProperty('sid')){
        urlParam = '/CompanyDashboard?cid='+_cid;
    }else if(pageParam.hasOwnProperty('cid')){
        urlParam = url + '?cid='+_cid;
        for(var index in pageParam){
            if (index != 'cid') urlParam = urlParam + '&' + index + '=' + pageParam[index];
        }
    }

    return urlParam;
}

//公司浮层
function modal_company(_companyList) {
    var $box = $('body').find('.modal-company');

    $box.find('dt i').on('click',function () {
        var isOpen = $(this).closest('dl').attr('data-open');

        $('dl', $box).attr('data-open', false);
        $('dd', $box).slideUp(500);
        if (isOpen == 'false') {
            $(this).parent().next().slideDown(500);
            $(this).closest('dl').siblings().attr('data-open', false).find('dd').slideUp(500);
            $(this).closest('dl').attr('data-open', true);
        } else {
            $(this).parent().next().slideUp(500);
            $(this).closest('dl').attr('data-open', false);
        }
    });
    $('input[name=company-search]', $box).autocomplete(_companyList, {
        width: 288,
        scrollHeight: 120,
        matchContains: true,
        clickFire: true,
        //mustMatch: true,
        highlight: false,
        formatItem: function (row, i, max) {
            if (row == 'No Records.') return getI18n('07007');
            else return '<a href="javascript:;">' + row.OrgName + '</a>';
        },
        formatMatch: function (row) {
            return row.OrgName;
        },
        formatResult: function (row) {
            if (row[0] == 'No Records.') {
                return getI18n('07007');
            } else {
                return row.OrgName;
            }
        }
    }).result(function (event, data, formatted) {
        if (data && data != 'No Records.') {
            if (data.ParentID) {
                var $parent = $box.find('dt a[name=' + data.ParentID + ']');
                if ($parent.closest('dl').attr('data-open') == 'false') $parent.next().click();
            }else{
                $('dl', $box).attr('data-open', false).find('dd').slideUp();
            }
            $('a[name]', $box).removeClass('highlight');
            $('a[name=' + data.OrgID + ']').addClass('highlight');
            var top = $('a[name=' + data.OrgID + ']').position().top;
            console.log(top);
            setTimeout(function () {
                //$box.find('.jspPane').animate({ top: -top }, 500);
                $box.find('.company-list').scrollTop(top - 20);
            }, 100);
        }
    });
    
    /*function scoll() {
        $('.company-list', $box).jScrollPane({
            verticalGutter: 20
        });
    }*/
}

//油站浮层
function modal_station(stationList) {
    var $box = $('.modal-station'),
        $searchBox = $('#search-keyword',$box);

    $('.letter-list', $box).delegate('a', 'click', function () {
        var value = $(this).text();

        $(this).addClass('active').siblings().removeClass('active');
        $('.station-list ul', $box).find('li').removeClass('borderTop').hide();
        $('.station-list ul', $box).find('li[data-group=' + value + ']').show().filter(function (index) {
            if (index < 3) $(this).addClass('borderTop');
        });
        $('.station-list', $box).jScrollPane({
            verticalGutter: 25
        });
    });
    $('input', $searchBox).on('input propertychange', function () {
        var value = $('input', $searchBox).val().trim();

        $('.letter-list', $box).find('a').removeClass('active');
        if (value == '') {
            $('.station-list ul', $box).find('li').removeClass('borderTop').show().filter(function (index) {
                if (index < 3) $(this).addClass('borderTop');
            });
        } else {
            if (/^[A-Za-z]{1}$/.test(value)) {
                var initial = value.toUpperCase();
                console.log(value);
                $('.letter-list', $box).find('a[data-value=' + initial + ']').click();
            } else {
                var num = 0;

                $('.station-list ul', $box).find('li').hide();
                for (var index in stationList) {
                    if (stationList[index].DisplayName.match(value)) {
                        console.log(stationList[index].DisplayName);
                        num++;
                        $('.station-list ul', $box).find('li').filter(function (i) {
                            return $(this).find('a').text().match(stationList[index].DisplayName.trim());
                        }).show();
                    }
                }
                if (!num) {
                    $('.station-list ul', $box).find('li.empty').remove();
                    $('.station-list ul', $box).append('<li class="empty">'+getI18n('09016')+'</li>');
                } else {
                    for (var index = 0; index < 3; index++) {
                        $('.station-list ul', $box).find('li:visible').eq(index).addClass('borderTop');
                    }
                }
            }
            $('.station-list', $box).jScrollPane({
                verticalGutter: 25
            });
        }
    });
}

//对所有页面的日期做处理
function commonDate() {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        daysOfCurMonth = new Date(year, month, 0).getDate(),    //当月的天数
        lastDaysOfMonth, lastYear, lastMonth, lastDday, curDate, lastDate;


    //开始日期 默认显示整个自然月
    if (month == 1) {
        lastMonth = 12;
        lastYear = year - 1;
    } else {
        lastMonth = month - 1;
        lastYear = year;
    }
    lastDaysOfMonth = new Date(lastYear, lastMonth, 0).getDate();    //上一个月的天数

    if (day == daysOfCurMonth) lastDday = lastDaysOfMonth;
    else lastDday = day;

    curDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + NameSpace.Format.addFormat(day);
    lastDate = lastYear + '-' + NameSpace.Format.addFormat(lastMonth) + '-' + NameSpace.Format.addFormat(lastDday);
    $('.station input[name=enddate]').val(curDate);
    $('.station input[name=begindate]').each(function () {
        if ($(this).attr('data-curdate')) return true;
        $(this).val(lastDate);
    });
    $('.station input[name=BeginDate]').val(lastDate);
    $('.station input[name=StartDate]').val(lastDate);
    $('.station input[name=BeginDate]').each(function () {
        if ($(this).attr('data-curdate')) return true;
        $(this).val(lastDate);
    });
    $('.station input[name=EndDate]').each(function () {
        if ($(this).attr('data-curdate')) return true;
        $(this).val(curDate);
    });

    //加载页面时就存在（不即时）
    $('[data-curdate]').each(function () {
        var format = $(this).attr('data-curdate'),
            monthF = NameSpace.Format.addFormat(month),
            dayF = NameSpace.Format.addFormat(day),
            hour = NameSpace.Format.addFormat(date.getHours()),
            minutes = NameSpace.Format.addFormat(date.getMinutes()),
            seconds = NameSpace.Format.addFormat(date.getSeconds()),
            formatDate = year + '-' + monthF + '-' + dayF,
            formatDateTime = formatDate + ' ' + hour + ':' + minutes + ':' + seconds;


        if (format == 'date') $(this).val(formatDate); //YYYY-mm-dd
        else if (format == 'datetime') $(this).val(formatDateTime); //YYYY-mm-dd hh:mm:ss
        else if (format == 'first') $(this).val(year + '-' + monthF + '-01');
        else if (format == 'last') $(this).val(year + '-' + monthF + '-' + daysOfCurMonth);
        else if (format == 'week') {
            if (day <= 7) {
                day = (day - 7) + lastDaysOfMonth;
                month = month - 1;
                if (month == 0) {
                    month = 12;
                    year = year - 1;
                }
            } else {
                day = day - 7;
            }
            $(this).val(year + '-' + NameSpace.Format.addFormat(month) + '-' + NameSpace.Format.addFormat(day));
        }
    });
}
//查询表格每页记录数
function pageRecord() {
    var $box = $('body').find('.record-box');

    //常用量
    $('body').find('.record-box').hover(function () {
        var $recordBox = $(this),
            value = $recordBox.find('input[type=hidden]').val(),
            array = [10, 20, 50, 75, 100],
            str;

        if (value == '') str = '20';
        else str = value;

        $('.tab-cont a', $recordBox).removeClass('active').filter(function (index) {
            return $(this).text() == str;
        }).addClass('active');

        $('.tab-trigger', $recordBox).addClass('tab-curr');
        $('.tab-cont', $recordBox).show();
    }, function () {
        var $recordBox = $(this);

        $('.tab-trigger', $recordBox).removeClass('tab-curr');
        $('.tab-cont', $recordBox).hide();
    });
    $('.tab-cont a', $box).on('click', function () {
        var value = $(this).text(),
            $recordBox = $(this).closest('.record-box');

        $(this).addClass('active').siblings().removeClass('active');
        $recordBox.find('input[name=pageLength]').val('');
        $recordBox.find('input[type=hidden]').val(value);
        $recordBox.closest('.station-con').find('.dataTables_length option[value=' + value + ']').prop('selected', true);
        $recordBox.closest('.station-con').find('.dataTables_length select').trigger('change');
    });

    //自定义输入记录数
    $('button', $box).on('click', function () {
        var value = $(this).prev().val(),
            $recordBox = $(this).closest('.record-box'),
            bool = true;

        if (bool && (value === '' || value.replace(/(^\s*)|(\s*$)/g, '').length == 0)) {
            bool = false;
            alert(getI18n('07005'));
        }
        if (bool && !/^\+?[1-9][0-9]*$/.test(value)) {
            bool = false;
            alert(getI18n('07006'));
        }

        if (bool) {
            $('.tab-cont a', $recordBox).removeClass('active');
            $recordBox.find('input[type=hidden]').val(value);
            $('.tab-trigger', $recordBox).removeClass('tab-curr');
            $('.tab-cont', $recordBox).hide();
            $recordBox.closest('.station-con').find('.dataTables_length select').append('<option value=' + value + '></option>');
            $recordBox.closest('.station-con').find('.dataTables_length option[value=' + value + ']').prop('selected', true);
            $recordBox.closest('.station-con').find('.dataTables_length select').trigger('change');
        }
    });

}

//单位
//ajaxCall(URL.MeasureText, { 'SessionID': SessionID }, function (_message) {
ajaxCall(URL.MeasureText,'{}',function (_message) {
    console.log(_message);
    MeasureText = _message;
    measureMatch();
});

function measureMatch(){
    if(MeasureText){
        $('.measure-volume').text('(' + MeasureText.Volume + ')');
        $('.measure-height').text('(' + MeasureText.Height + ')');
        $('.measure-temperature').text('(' + MeasureText.Temperature + ')');
    }
}

//正在完善中
(function(){
    $('body').on('click','.unfinished-page',function(){
        var title = $(this).attr('data-title'),
            msg = '';
        if(title) msg = msg + title;
        alert(msg + i18n['08001']);
    });
})();

//获取全部油品
(function(){
    //ajaxSyncCall(URL.ProductList,{ 'SessionID': SessionID },function(_message){
    ajaxSyncCall(URL.ProductList,'{}',function(_message){
        $.cookie('SessionProductList',JSON.stringify(_message.ProductList));
    });
})();

var SessionProductList = JSON.parse($.cookie('SessionProductList'));

//查看罐表
function tankChartView(_params,_title1,_title2,_title3){
    var $stationBody = $('#station-body'),
        $header = $('.modal-inner-header',$stationBody),
        $body = $('.modal-inner-body',$stationBody), 
        methodType = _params['MethodType'];

    ajaxCall(URL.ViewTankChart, _params, function (_message) {
        console.log(_message);
        if (_message.Result == 'Success') {

            //标题与导出、打印标题匹配
            var titleMap = {
                '20017': '25005',
                '20018': '15015',
                '20021': '15005',
                '20023': '21006'
            }
            if (methodType == '1') {    //查看全罐表
                var theadHtml_1 = $('.template-chartViewTable01').html();

                $('.header-title h4', $header).html(getI18n(_title1));
                $body.html(theadHtml_1);
                $('.diameter-con dd.value', $body).text(_message.Diameter.toFixed(2));
                $body.find('.table-result').dataTable({
                    'lengthChange': false,
                    'processing': false,
                    'searching': false,
                    'paging': false,
                    'scrollY': 360,
                    "scrollCollapse": true,
                    'info': false,
                    'ordering': false,
                    'dom': 'Brtpi',
                    'destroy': true,
                    'data': _message.HeightVolPair,
                    'buttons': {
                        'buttons': [
                            {
                                extend: 'excel',
                                text: '<i class="fa fa-sign-out"></i>' + getI18n('09902'),
                                className: 'btn-export',
                                exportOptions: {
                                    modifier: {
                                        page: 'all'
                                    }
                                },
                                title: getI18n('00000')+'-' + getI18n(titleMap[_title1]),
                                customize: function (xls) {
                                    var $sheetData = $(xls.xl.worksheets['sheet1.xml']).find('sheetData');
                                    for (var i = 0; i < $sheetData.children('row').length; i++) {
                                        var $this = $sheetData.children('row').eq(i),
                                            row = $this.attr('r'),
                                            newRow = parseInt(row) + 1;
                                        $this.attr('r', newRow);
                                        for (var ii = 0; ii < $this.children('c').length; ii++) {
                                            _v = $this.children('c').eq(ii);
                                            var newR = _v.attr('r').slice(0, -row.length) + newRow;
                                            _v.attr('r', newR);
                                        }
                                    }
                                    $sheetData.prepend('<row r="1"><c t="inlineStr" r="A1" s="2"><is><t>' + getI18n('10052') + getRelatedMeasure('Height') + '：' + _message.Diameter.toFixed(2) + '</t></is></c><c t="inlineStr" r="B1"><is><t/></is></c><c t="inlineStr" r="C1"><is><t/></is></c><c t="inlineStr" r="D1"><is><t/></is></c><c t="inlineStr" r="E1"><is><t/></is></c><c t="inlineStr" r="F1"><is><t/></is></c><c t="inlineStr" r="G1"><is><t/></is></c><c t="inlineStr" r="H1"><is><t/></is></c></row>');
                                }
                            },
                            {
                                extend: 'print',
                                text: '<i class="fa fa-print"></i>' + getI18n('20010'),
                                className: 'btn-print',
                                exportOptions: {
                                    modifier: {
                                        page: 'all'
                                    }
                                },
                                title: getI18n('00000')+'-' + getI18n(titleMap[_title1]),
                                message: '<h2 style="font-size:12px;color: #000;padding-bottom:5px;">' + getI18n('10052') + getRelatedMeasure('Height') + '：' + _message.Diameter.toFixed(2) + '</h2>'
                            }
                        ]
                    },
                    'columns': [
                        {
                            'data': 'height1',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'volume1',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'height2',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'volume2',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'height3',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'volume3',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'height4',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        },
                        {
                            'data': 'volume4',
                            'render': function (_data, _type, _full) {
                                if (_data === null) return '';
                                else return Number(_data).toFixed(2);
                            }
                        }
                    ],
                    'language': {
                        'emptyTable': getI18n('20019')
                    }
                });
            } else if (methodType == '2') {                                                    //查看具体的罐表
                if (_message.HeightVolPair == undefined) {
                    var theadHtml_3 = $('.template-chartViewTable03').html();

                    $('.header-title h4', $header).html(getI18n(_title3));
                    $body.html(theadHtml_3);
                    $body.find('.table-result').dataTable({
                        'lengthChange': false,
                        'processing': true,
                        'searching': false,
                        'paging': false,
                        'scrollY': 360,
                        "scrollCollapse": true,
                        'info': false,
                        'ordering': false,
                        'dom': 'Brtpi',
                        'destroy': true,
                        'data': [_message],
                        'buttons': {
                            'buttons': [
                                {
                                    extend: 'excel',
                                    text: '<i class="fa fa-sign-out"></i>' + getI18n('09902'),
                                    className: 'btn-export',
                                    title: getI18n('00000')+'-' + getI18n(titleMap[_title3])
                                },
                                {
                                    extend: 'print',
                                    text: '<i class="fa fa-print"></i>' + getI18n('20010'),
                                    className: 'btn-print',
                                    title: getI18n('00000')+'-' + getI18n(titleMap[_title3])
                                }
                            ]
                        },
                        'columns': [
                            {
                                'data': 'ChartType'
                            },
                            {
                                'data': 'Diameter',
                                'render': function (_data) {
                                    return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'Capacity',
                                'render': function (_data) {
                                    if (_data === 0) return '0';
                                    else{
                                        return Math.round(_data);
                                    }
                                }
                            },
                            {
                                'data': 'Tilt',
                                'render': function (_data) {
                                    return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'Offset',
                                'render': function (_data) {
                                    return _data.toFixed(2);
                                }
                            },
                            {
                                'data': 'EndShape',
                                'render': function (_data) {
                                    if (_data === 0) return '0';
                                }
                            }
                        ],
                        'language': {
                            'emptyTable': getI18n('20019')
                        }
                    });
                } else {
                    var theadHtml_2 = $('.template-chartViewTable02').html();

                    $('.header-title h4', $header).html(getI18n(_title2));
                    $body.html(theadHtml_2);
                    $('.diameter-con dd.value', $body).eq(0).text(_message.ChartType);
                    $('.diameter-con dd.value', $body).eq(1).text(_message.Diameter.toFixed(2));

                    $body.find('.table-result').dataTable({
                        'lengthChange': false,
                        'processing': true,
                        'searching': false,
                        'paging': false,
                        'scrollY': 360,
                        "scrollCollapse": true,
                        'info': false,
                        'ordering': false,
                        'dom': 'Brtpi',
                        'destroy': true,
                        'data': _message.HeightVolPair,
                        'buttons': {
                            'buttons': [
                                {
                                    extend: 'excel',
                                    text: '<i class="fa fa-sign-out"></i>' + getI18n('09902'),
                                    className: 'btn-export',
                                    exportOptions: {
                                        modifier: {
                                            page: 'all'
                                        }
                                    },
                                    title: getI18n('00000')+'-' + getI18n(titleMap[_title2]),
                                    customize: function (xls) {
                                        var $sheetData = $(xls.xl.worksheets['sheet1.xml']).find('sheetData');
                                        for (var i = 0; i < $sheetData.children('row').length; i++) {
                                            var $this = $sheetData.children('row').eq(i),
                                                row = $this.attr('r'),
                                                newRow = parseInt(row) + 1;
                                            $this.attr('r', newRow);
                                            for (var ii = 0; ii < $this.children('c').length; ii++) {
                                                _v = $this.children('c').eq(ii);
                                                var newR = _v.attr('r').slice(0, -row.length) + newRow;
                                                _v.attr('r', newR);
                                            }
                                        }
                                        $sheetData.prepend('<row r="1"><c t="inlineStr" r="A1" s="2"><is><t>' + getI18n('10049') + '：' + _message.ChartType + '</t></is></c><c t="inlineStr" r="B1" s="2"><is><t>' + getI18n('10052') + getRelatedMeasure('Height') + '：' + _message.Diameter.toFixed(2) + '</t></is></c><c t="inlineStr" r="C1"><is><t/></is></c><c t="inlineStr" r="D1"><is><t/></is></c><c t="inlineStr" r="E1"><is><t/></is></c><c t="inlineStr" r="F1"><is><t/></is></c><c t="inlineStr" r="G1"><is><t/></is></c><c t="inlineStr" r="H1"><is><t/></is></c></row>');
                                    }
                                },
                                {
                                    extend: 'print',
                                    text: '<i class="fa fa-print"></i>' + getI18n('20010'),
                                    className: 'btn-print',
                                    title: getI18n('00000')+'-' + getI18n(titleMap[_title2]),
                                    message: '<h2 style="font-size:12px;color: #000;padding-bottom:5px;">' + getI18n('10049') + '：' + _message.ChartType + '  ' + getI18n('10052') + getRelatedMeasure('Height') + '：' + _message.Diameter.toFixed(2) + '</h2>'
                                }
                            ]
                        },
                        'columns': [
                            {
                                'data': 'height1',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'volume1',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'height2',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'volume2',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'height3',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'volume3',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'height4',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            },
                            {
                                'data': 'volume4',
                                'render': function (_data, _type, _full) {
                                    if (_data === null) return '';
                                    else return Number(_data).toFixed(2);
                                }
                            }
                        ],
                        'language': {
                            'emptyTable': getI18n('20019')
                        }
                    });
                }
            }
        } else {
            alert(_message.Description);
            parentModal_hide();
        }
        $('.block-loading', $stationBody).hide();
    });
}

//油站内页显示查看罐表
function modal_tankChart(_params,_title1,_title2,_title3,_isLayered){
    var $modal = $('#modal-innerPage'),
        iframeHtml = '<iframe frameborder="0" width="800px" height="550" scrolling="yes" src="" name="innerPageIframe" id="innerPageIframe"></iframe>',
        tankUrl = 'Station/ChartViewer?chartID=' + _params.ChartID + '&MethodType='+_params.MethodType;

    if (_isLayered) $modal.addClass('layered-modal');
    else $modal.removeClass('layered-modal');
    $('.main-content', $modal).html(iframeHtml);
    $('#innerPageIframe', $modal).attr('src', 'dialog.html?_='+new Date().getTime()+'#/' + tankUrl + '&title1='+_title1+'&title2='+_title2+'&title3='+_title3+'&page=innerDialog'); //以窗口形式打开页面
    modal_show($modal);
}

function modal_calibrationStatus(_tankUrl){
    var $modal = $('#modal-commonPage'),
        iframeHtml = '<iframe frameborder="0" width="1300px" height="600px" scrolling="yes" src="" name="modalPage-iframe" id="modalPage-iframe"></iframe>';

    $('.main-content', $modal).html(iframeHtml);
    $('#modalPage-iframe', $modal).attr('src', 'dialog.html#/' + _tankUrl + '&page=modalDialog'); //以窗口形式打开页面
    modal_show($modal);
}

function setPosition(event) {
    if (!scrollFlag &&(event && event.type === "scroll")){
        return false;
    }
    if ($(".header").length) {
        var bodyScrollLeft = document.body.scrollLeft,
            width = $(window).width();

        if (!bodyScrollLeft){
            bodyScrollLeft = document.documentElement.scrollLeft;
        } 
        var scroll_Left = bodyScrollLeft;
        if ($(".sidebar-toggle i").hasClass("fa-angle-left")) {
            scroll_Left = bodyScrollLeft - 100;
            $(".header").css('width', width-100);
        }else{
            $(".header").css('width', width);
        }
        $(".header").css('left', ~scroll_Left + 1); 
    }
}