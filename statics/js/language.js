var Lan = {},
    i18n = {};

function language_init() {
    var $page = $('body'),
        $text = $page.find('span[data-i18n]'),
        $title = $page.find('[data-i18n-title]'),
        $placeholder = $page.find('input[data-i18n-placeholder]'),
        $value = $page.find('input[data-i18n-value]'),
        $dataTitle = $page.find('[data-title]'),
        $subtitle = $page.find('[data-subtitle]'),
        $alt = $page.find('img[data-i18n-alt]'),
        $current = $page.find('[data-i18n-current]'),
        length = $text.length + $title.length + $placeholder.length + $value.length + $dataTitle.length + $subtitle.length + $alt.length + $current.length;

    if (i18n.length < length) {
        for (var index in i18n) {
            //1、普通的标签
            $page.find('span[data-i18n="' + index + '"]').replaceWith(i18n[index]);
            //2、标签的title
            $page.find('[data-i18n-title="' + index + '"]').attr('title', i18n[index]);
            //3、input 
            //type=text的placeHolder
            $page.find('input[data-i18n-placeholder="' + index + '"]').attr('placeholder', i18n[index]);
            //value
            $page.find('input[data-i18n-value="' + index + '"]').attr('value', i18n[index]);
            //4、其他自定义属性
            $page.find('[data-title="' + index + '"]').attr('data-title', i18n[index]);
            $page.find('[data-subtitle="' + index + '"]').attr('data-subtitle', i18n[index]);
            //5、img
            $page.find('img[data-i18n-alt="' + index + '"]').attr('alt', i18n[index]);
            //登录页
            $page.find('[data-i18n-current="' + index + '"]').text(i18n[index]);
            //6、js文件中的文字，这个可以直接替代
        }
    } else {
        $text.each(function () {
            $(this).replaceWith(i18n[$(this).attr('data-i18n')]);
        });
        $title.each(function () {
            $(this).attr('title', i18n[$(this).attr('data-i18n-title')]);
        });
        $placeholder.each(function () {
            $(this).attr('placeholder', i18n[$(this).attr('data-i18n-placeholder')]);
        });
        $value.each(function () {
            $(this).attr('value', i18n[$(this).attr('data-i18n-value')]);
        });
        $dataTitle.each(function () {
            $(this).attr('data-title', i18n[$(this).attr('data-title')]);
        });
        $subtitle.each(function () {
            $(this).attr('data-subtitle', i18n[$(this).attr('data-subtitle')]);
        });
        $alt.each(function () {
            $(this).attr('alt', i18n[$(this).attr('data-i18n-alt')]);
        });
        $current.each(function () {
            $(this).text(i18n[$(this).attr('data-i18n-current')]);
        });
    }
}

function getI18n(number) {
    if (i18n[number] == undefined) {
        //console.log(number);
        return '<span data-i18n="' + number + '"></span>';
    } else {
        return i18n[number];
    }
}
if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i) {
        window.console[names[i]] = function () { }
    }
}
/*window.console = window.console || (function(){  
    var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile  
    = c.clear = c.exception = c.trace = c.assert = function(){};  
    return c;  
})();

function log(msg){
	if (window["console"]){
		console.log(msg);
	}
}*/