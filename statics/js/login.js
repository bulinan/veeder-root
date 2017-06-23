$(function () {

    if ($.cookie('LoginStatus') == '1') {
        //如果仍是登录状态就继续跳转到公司首页
        //location.href = 'index.html#/' + $.cookie('RedirectPage') + '?' + $.cookie('Permission') + '=' + $.cookie('SessionPer');
    }

    //语言选择
    (function () {
        var lanHtml = '';
        for (var index in SYSTEM_LANGUAGE) {
            lanHtml = lanHtml + '<li data-value="' + SYSTEM_LANGUAGE[index].Vaule + '" data-img="' + SYSTEM_LANGUAGE[index].ImgUrl + '">' + SYSTEM_LANGUAGE[index].Name + '</li>';
        }
        $('.select_lan').find('.select-con').html(lanHtml);

        var language = $.cookie('language');

        NameSpace.Select.select_lan = function (_element, _selector) {
            var lanText = _element.attr('data-value'),
                imgUrl = _element.attr('data-img'),
                number = _element.attr('data-i18n-current'),
                systemUnit = $('#system-units').find('.select-title').attr('data-value');

            if (lanText == 'English') $('.member-header .subtitle').hide();
            else $('.member-header .subtitle').show();

            _selector.find('.select-title img').attr('src', imgUrl);

            i18n = Lan[lanText];
            language_init();
            NameSpace.Select.selectedByParam($('#system-units'), systemUnit);
        };

        if (language) {
            NameSpace.Select.selectedByParam($('.select_lan'), language);
        } else {
            //读取浏览器语言
            var browerLanguage = navigator.language,
                lang;

            if (!browerLanguage) browerLanguage = navigator.browserLanguage;
            lang = browerLanguage.substr(0, 2);

            var map = {
                'zh': 'Chinese',
                'en': 'English'
            }
            if (map[lang]) {
                NameSpace.Select.selectedByParam($('.select_lan'), map[lang]);
            } else {
                NameSpace.Select.selectedByParam($('.select_lan'), map['en']);
            }
        }
    })();

    $("#submitBut").click(function () {
        var username = $("#username").val().trim(),
            password = $("#password").val(),
            lanText = $('.select_lan .select-title').attr('data-value'),
            systemUnit = $('#system-units').find('.select-title').attr('data-value');

        if (username.length == 0 || password.length == 0) {
            alert(userpassNull);
            return false;
        }
        password = hex_md5(password);
        var _params = {
            "User": username,
            "Password": password,
            "Language": lanText,
            "Unit": systemUnit
        }
        $('.block-loading').show();
        ajaxCall(URL.Login + '?_=' + new Date().getTime(), _params, function (_message) {
            console.log(_message);
            if (_message.Result == 'Failure') {
                $('.block-loading').fadeOut(50, function () {
                    alert(_message.Description);
                });
            } else {
                var param,
                    type,
                    date = new Date();

                date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); //30天后的这个时候过期
                console.log(date);
                if (lanText) $.cookie('language', lanText, { expires: date });
                //else $.cookie('language', 'Chinese', { expires: date });

                if (systemUnit) $.cookie('SystemUnit', systemUnit, { expires: date });
                //else $.cookie('SystemUnit', 'Metric', { expires: date });

                $.cookie('SessionID', _message.SessionID);
                $.cookie('UserName', _message.DisplayName);
                $.cookie('CompanyDashboardVarMonthCount', _message.CompanyDashboardVarMonthCount);
                if (_message.hasOwnProperty('CompanyID')) {
                    type = 'CompanyID';
                    param = 'cid';
                } else {
                    type = 'StationID';
                    param = 'sid';
                }
                $.cookie('Permission', param);
                $.cookie('SessionPer', _message[type]);
                $.cookie('SystemVersion', _message.Version);
                $.cookie('RedirectPage', _message.RedirectPage);
                $.cookie('LoginStatus', 1);
                /*if (self.frameElement && self.frameElement.tagName == "IFRAME") {
                var $modal = $(window.parent.document.getElementsByClassName('modal-page')),
                $overlay = $(window.parent.document.getElementById('overlay'));

                $overlay.hide();
                $modal.hide();
                } else {
                var actionPage = $.cookie('actionPage');
                console.log(actionPage);
                if (actionPage) location.href = 'index.html#' + actionPage;
                else location.href = 'index.html#/' + _message.RedirectPage + '?' + param + '=' + _message[type];
                }*/

                $('.block-loading').hide();
                location.replace('index.html#/' + _message.RedirectPage + '?' + param + '=' + _message[type]);
                //event.returnValue = false;
                //location.href = 'index.html#/' + _message.RedirectPage + '?' + param + '=' + _message[type];
            }
        });
        /*设置ajax同步，虽然可以得到SessionID的值，实现全局变量函数顶部赋值，但是在其他js文件中无法获取SessionID,所以用的cookie保存*/
        /*$.ajax({
        async: false,
        dataType: 'json',
        type: 'post',
        url: '/vrapi/Common/Login',
        data: _params,
        success: function (_message) {
        if (_message.Result == 'Failure') {
        alert(_message.Description);
        } else {
        SessionID = _message.SessionID;
        location.href = _message.RedirectPage
        }
        },
        error: function (_message) {
        alert('暂时无法连接到服务器，请检查您的网络环境。');
        }
        });
        console.log(SessionID);*/
    });

    $('.form').on('keydown ', function (e) {
        if (e.keyCode == 13) $("#submitBut").trigger('click');
    });

    (function () {
        var unitHtml = '';
        for (var i in SYSTEM_UNITS) {
            unitHtml = unitHtml + '<li data-value="' + SYSTEM_UNITS[i] + '" data-i18n-current="' + i + '">' + getI18n(i) + '</li>';
        }
        $('#system-units').find('.select-con').html(unitHtml);

        var systemUnit = $.cookie('SystemUnit');
        if (systemUnit) {
            NameSpace.Select.selectedByParam($('#system-units'), systemUnit);
        } else {
            NameSpace.Select.selectedByParam($('#system-units'), 'Metric');
        }

    })();
});