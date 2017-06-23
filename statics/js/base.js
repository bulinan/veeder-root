 //下拉选择
var NameSpace = window.NameSpace || {};

NameSpace.Select = new function () {
    var self = this;
    self.firstSelected = function (_selectbox) {
        var selectedText = _selectbox.find('li').eq(0).text(),
            selectedId = _selectbox.find('li').eq(0).attr('data-value');

        _selectbox.find('.select-title').attr('data-value', selectedId).find('span').text(selectedText);
    }
    self.selectedByParam = function (_selectbox, _id) {
        $('.select-con', _selectbox).find('li[data-value=' + _id + ']').trigger('click');
    }
};
NameSpace.Array = new function () {
    this.unique = function (arr) {
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    };
    this.isTwoArrayEquals = function (_arr01, _arr02) {
        var i;
        for (var i = 0; i < _arr01.length; i++) {
            if (_arr01[i] != _arr02[i]) break;
        }
        if (i < _arr01.length) return false;
        else return true;
    }
    this.ifContains = function (_arr, _element) {
        for (i in _arr) {
            if (_arr[i] == _element) {
                return true;
            }
        }
        return false;
    }
    this.indexOf = function (_arr, _ele) {
        for (var i in _arr) {
            if (_arr[i] == _ele) return 0;
        }
        return -1;
    }
    this.sortByKey = function (_name) {
        return function (o, p) {
            var a, b;

            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            } else {
                throw ("error");
            }
        }
    }
};
NameSpace.Date = new function () {
    this.timestamp_to_date = function (_timestamp) {
        return new Date(parseInt(_timestamp) * 1000); //时间戳转换成日期
    }
    this.date_to_timestamp = function (_date) {
        return new Date(_date).getTime() / 1000;
    }
    //即时调用
    this.getCurDateTime = function (_format) { //EndDate
        var date = new Date(),
            year = date.getFullYear(),
            month = NameSpace.Format.addFormat(date.getMonth() + 1),
            day = NameSpace.Format.addFormat(date.getDate()),
            hour = NameSpace.Format.addFormat(date.getHours()),
            minutes = NameSpace.Format.addFormat(date.getMinutes()),
            seconds = NameSpace.Format.addFormat(date.getSeconds());

        if (_format == 'YYYY-mm-dd') return year + '-' + month + '-' + day;
        else if(_format == 'YYYY-mm-dd hh:mm') return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes; //YYYY-mm-dd hh:mm
        else if (_format == 'YYYY-mm-dd hh:mm:ss') return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds; //YYYY-mm-dd hh:mm:ss
    }
    this.getOneMonthAgo = function () {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            daysOfCurMonth = new Date(year, month, 0).getDate(),    //当月的天数
            lastDaysOfMonth, lastYear, lastMonth, lastDday;


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

        return lastYear + '-' + NameSpace.Format.addFormat(lastMonth) + '-' + NameSpace.Format.addFormat(lastDday);
    }
    this.fromNowToSixMonthsAgo = function () {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            daysOfCurMonth = new Date(year, month, 0).getDate(),    //当月的天数
            curDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + daysOfCurMonth,
            lastMonth,
            lastYear,
            lastDate;

        
        lastMonth = month - 5;
        lastYear = year;
        if (lastMonth <= 0) {
            lastMonth = lastMonth + 12;
            lastYear = year - 1;
        }
        lastDate = lastYear + '-' + NameSpace.Format.addFormat(lastMonth) + '-01';
        var dateArray = [lastDate, curDate];
        return dateArray;
    }

    this.fromNowToSomeMonthsAgo = function (_num) {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            daysOfCurMonth = new Date(year, month, 0).getDate(),    //当月的天数
            curDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + daysOfCurMonth,
            lastMonth,
            lastYear,
            lastDate;

        
        lastMonth = month - _num + 1;
        lastYear = year;
        if (lastMonth <= 0) {
            lastMonth = lastMonth + 12;
            lastYear = year - 1;
        }
        lastDate = lastYear + '-' + NameSpace.Format.addFormat(lastMonth) + '-01';
        var dateArray = [lastDate, curDate];
        return dateArray;
    }

    this.get30DaysFromNow = function () {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            curDate = year + '-' + NameSpace.Format.addFormat(month) + '-' + NameSpace.Format.addFormat(day),
            lastDay, lastMonth, lastYear, lastDate;

        lastDay = (day - 30) + 1;
        lastMonth = month;
        lastYear = year;
        if (lastDay <= 0) {
            lastMonth = month - 1;
            if (lastMonth == 0) {
                lastMonth = 12;
                lastYear = lastYear - 1;
            }
            var daysOfLastMonth = new Date(lastYear, lastMonth, 0).getDate(),    //上月的天数
            lastDay = lastDay + daysOfLastMonth;
        }
        lastDate = lastYear + '-' + NameSpace.Format.addFormat(lastMonth) + '-' + NameSpace.Format.addFormat(lastDay);
        return [lastDate, curDate];
    }
    this.getCurrentMonth = function () {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            daysOfCurMonth = new Date(year, month, 0).getDate(),
            curDateFirst = year + '-' + NameSpace.Format.addFormat(month) + '-01',
            curDateLast = year + '-' + NameSpace.Format.addFormat(month) + '-' + daysOfCurMonth;

        return [curDateFirst, curDateLast];
    }
}
NameSpace.Data = new function () {
    this.isNull = function (_object) {
        if (_object == null || _object.length == 0) return false;
        else return true;
    }
    this.data_match = function (_id, _data, _dataID) {
        for (var i in _data) {
            if (_id == _data[i][_dataID]) return _data[i].DisplayName;
        }
    }
}
NameSpace.Format = new function () {
    this.detail = function (_dom, _data) {
        $('body').find(_dom).each(function () {
            var $this = $(this).find('.form-control'), value, key = $this.attr('data-key');

            if ($this.attr('data-type') == 'number') {
                var decimal = !$this.attr('data-round') ? 0 : $this.attr('data-round');
                if (decimal == 0)
                    value = Math.round(_data[key]);
                else if (decimal == 1)
                    value = NameSpace.Number.keepOneDecimal(_data[key]);
                else if (decimal == 2)
                    value = _data[key].toFixed(2);
            } else if ($this.attr('data-type') == 'date') {
                if (_data[key] == "0001-01-01 00:00:00") {
                    value = 'N/A';
                } else if ($this.attr('data-format') == 'YYYY-mm-dd') {
                    value = _data[key].split(' ')[0];
                } else {
                    value = _data[key];
                }
            } else {
                value = _data[key];
            }
            value = value == null ? '' : value;

            $this.text(value);
        });
    }
    this.formDetail = function (_dom, _data) {
        $(_dom).find('input').each(function () {
            var $this = $(this), value, key = $this.attr('name');

            if (key in _data) {
                value = _data[key];
            }else{
                return true;
            }
            if (value === null) {
                $this.val('');
            } else {
                if (Object.prototype.toString.call(value) === "[object String]") {
                    value = value.trim();
                }
                if ($this.attr('data-type') == 'number') {
                    var decimal = !$this.attr('data-round') ? 0 : $this.attr('data-round');
                    if (decimal == 0)
                        value = Math.round(value);
                    else if (decimal == 1)
                        value = NameSpace.Number.keepOneDecimal(value);
                    else if (decimal == 2)
                        value = value.toFixed(2);
                } else if ($this.attr('data-type') == 'date') {
                    if (value == "0001-01-01 00:00:00") {
                        value = 'N/A';
                    } else if ($this.attr('data-format') == 'YYYY-mm-dd') {
                        value = value.indexOf('T') > -1 ? value.split('T')[0] : value.split(' ')[0];
                    }
                } else if ($this.attr('data-type') == 'checkbox') {
                    var type = $this.attr('data-checkbox');

                    if (value == 1) {
                        if (type == 'text') value = getI18n('09002');
                        else if (type == 'checked') {
                            $this.prop('checked', true);
                            return true;
                        }
                    } else {
                        if (type == 'text') value = getI18n('09003');
                        else if (type == 'checked') {
                            $this.prop('checked', false);
                            return true;
                        }
                    }
                }
                $this.val(value);
            }
        });
    }
    this.addFormat = function (_obj) {
        return _obj < 10 ? '0' + _obj : _obj;
    }
    this.offFormat = function (_obj) {
        return _obj.replace(/\b(0+)/gi, '');
    }
}
NameSpace.Number = new function () {
    this.keepOneDecimal = function (_num) {
        _num = Math.round(_num * 10) / 10;
        return _num;
    }
    this.keepTwoDecimal = function (_num) {
        if (Object.prototype.toString.call(_num) === "[object String]" || _num == null) return _num;

        _num = Math.round(_num * 100) / 100;
        var str = _num.toString();
        var pos_decimal = str.indexOf('.');

        if (pos_decimal < 0) {
            pos_decimal = str.length;
            str += '.';
        }
        while (str.length <= pos_decimal + 2) {
            str += '0';
        }
        return parseFloat(str); //一句代码从强制改为自动
    }
    this.formatNum = function (str) {
        var newStr = "";
        var count = 0;

        if (str.indexOf(".") == -1) {
            for (var i = str.length - 1; i >= 0; i--) {
                if (count % 3 == 0 && count != 0) {
                    newStr = str.charAt(i) + "," + newStr;
                } else {
                    newStr = str.charAt(i) + newStr;
                }
                count++;
            }
            str = newStr + ".00"; //自动补小数点后两位
            return str;
        } else {
            for (var i = str.indexOf(".") - 1; i >= 0; i--) {
                if (count % 3 == 0 && count != 0) {
                    newStr = str.charAt(i) + "," + newStr;
                } else {
                    newStr = str.charAt(i) + newStr; //逐个字符相接起来
                }
                count++;
            }
            str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
            return str;
        }
    }
}
NameSpace.String = new function () {
    this.isEmpty = function (_str) {
        //ajax请求参数里面字段如果为空，不传该字段或者传0
        if (_str == '') return 0;
        else return _str;
    }
    this.ifEmptyDelete = function (_obj) {
        for (var i in _obj) {
            if (_obj[i] == '') {
                delete _obj[i];
            }
        }
    }
    this.digitalControl = function (_bool, _box, _display) {
        if (_bool) {
            var flag = true;
            _box.find('input.digital-control').each(function () {
                var value = $(this).val(),
                    text = $(this).parent().prev('label').attr('title');

                if (flag && !/^[-+]?([1-9]\d*(\.\d+)?|0\.\d*[1-9]\d*|0?\.0+|0|\s*)$/.test(value)) { /*/^[-+]?\d*(\.\d+)?$/*/
                    flag = false;
                    if (_display == 'isAlert') alert(text + getI18n('09014'));
                    else _display.show().find('p').html(text + getI18n('09014'));
                }
            });
            return flag;
        }
    }
    // 判断是否为数字
    this.isNumber = function (_value) {
        if (!/^[-+]?([1-9]\d*(\.\d+)?|0\.\d*[1-9]\d*|0?\.0+|0?\s*)$/.test(_value)) { /*/^[-+]?\d*(\.\d+)?$/*/
            return false;
        } else {
            return true;
        }
    }
    this.isPositiveNumber = function (_value) { 
        if (!/^\+?([1-9]\d*(\.\d+)?|0\.\d*[1-9]\d*|0?\.0+|0?\s*)$/.test(_value)) {  /*/^\+?\d*(\.\d+)?$/*/
            return false;
        } else {
            return true;
        }
    }
    //进度、误差验证
    this.digitRegExp = function (_value) {
        var digitRegExp = new RegExp('^[-+]?[0-9]*\.?[0-9]+$');
        if (!digitRegExp.test(_value)) {
            return false;
        } else {
            return true;
        }
    }
    //判断小数点后有几位
    this.getDecimalNum = function (_num) {
        var str = _num.toString();

        if (str.indexOf('.') > -1) {
            var length = str.split('.')[1].length;
            return length;
        }
        return false;
    }
    this.fieldRequired = function (_bool, _box, _display) {
        if (_bool) {
            var flag = true;
            _box.find('span.must').each(function () {
                var value = $(this).parent().next().find('input').val(),
                    text = $(this).parent().attr('title');

                if (flag && value == '') {
                    flag = false;
                    if (_display == 'isAlert') alert(text + getI18n('09013'));
                    else _display.show().find('p').html(text + getI18n('09017'));
                }
            });
            return flag;
        }
    }
    this.someDigitalControl = function (_bool, _arrayObj, _display) {
        if (_bool) {
            for (var i in _arrayObj) {
                if (!/^\d*(\.\d+)?$/.test(_arrayObj[i].value)) {
                    if (_display == 'isAlert') alert(_arrayObj[i].text + getI18n('09014'));
                    else _display.show().find('p').html(_arrayObj[i].text + getI18n('09014'));
                    return false;
                }
            }
            return true;
        }

    }
    this.validateSomeField = function (_doms) {
        var bool = true;

        for (var i in _doms) {
            console.log(i);
            var $elem = _doms[i],
                value = $elem.val(),
                title = $elem.attr('data-title');

            if ($elem.hasClass('digital-control') || NameSpace.String.paramsCheck($elem, 'number')) {
                if (!NameSpace.String.isNumber(value)) {
                    if (title) NameSpace.String.alert(title + getI18n('09014'), $elem.attr('data-alert'));
                    bool = false;
                    return false;
                }
            }
            if ($elem.hasClass('required-control') || NameSpace.String.paramsCheck($elem, 'required')) {
                if (value == '') {
                    if (title) NameSpace.String.alert(title + getI18n('09013'), $elem.attr('data-alert'));
                    bool = false;
                    return false;
                }
            }
        }
        if (bool) return true;
    }
    this.someFieldRequired = function (_bool, _arrayObj, _display) {
        if (_bool) {
            for (var i in _arrayObj) {
                if (_arrayObj[i].value == '') {
                    if (_display == 'isAlert') alert(_arrayObj[i].text + getI18n('09013'));
                    else _display.show().find('p').html(_arrayObj[i].text + getI18n('09017'));
                    return false;
                }
            }
            return true;
        }
    }
    this.getFormParams = function (_dom, _params) {
        var $form = $('body').find(_dom),
            bool = true,
            minmax = {};
        _params = _params || {};

        $form.find('[name]').each(function () {
            var $i = $(this);

            if ($i.closest('.form-group').is(':hidden')) return true;

            var _i = $i.attr('name'),
                _v,
                paramsCheck = $i.attr('data-check') == undefined ? [] : $i.attr('data-check').split(' ');

            if ($.inArray('delete', paramsCheck) > -1) return; //此参数不上传
            if ($.inArray('default', paramsCheck) > -1) {
                if ($i.attr('data-value') === '' || $i.attr('data-value') == null)
                    $i.attr('data-value', $i.attr('data-default'));
            }
            //if (paramsCheck.indexOf('substitute') > -1) _i = $i.attr('data-substitute');
            if ($i.attr('data-substitute')) _i = $i.attr('data-substitute');

            if ($i.attr('data-value') !== undefined)
                _v = $i.attr('data-value');
            else if ($.inArray('checkbox', paramsCheck) > -1) {
                if ($i.prop('checked')) _v = '1';
                else _v = '0';
            } else if ($i.val() || $i.val() === '') {
                _v = $i.val().trim();
            }

            var title = $i.attr('data-title');

            if ($.inArray('required', paramsCheck) > -1) {
                if (_v === '' || _v.replace(/(^\s*)|(\s*$)/g, '').length == 0) {
                    if (title) NameSpace.String.alert(title + getI18n('09013'), $i.attr('data-alert'));
                    bool = false;
                    return false;
                }
            }
            if ($.inArray('min', paramsCheck) > -1) {
                if (minmax[$i.attr('data-name')] == undefined)
                    minmax[$i.attr('data-name')] = {};
                minmax[$i.attr('data-name')]['min'] = _v;
            }
            if ($.inArray('max', paramsCheck) > -1) {
                if (minmax[$i.attr('data-name')] == undefined)
                    minmax[$i.attr('data-name')] = {};
                minmax[$i.attr('data-name')]['max'] = _v;
            }
            if ($.inArray('number', paramsCheck) > -1) {
                if (!NameSpace.String.isNumber(_v)) {
                    if (title) NameSpace.String.alert(title + getI18n('09014'), $i.attr('data-alert'));
                    bool = false;
                    return false;
                }
                if ($.inArray('positive', paramsCheck) > -1) {
                    if (!NameSpace.String.isPositiveNumber(_v)) {
                        if (title) NameSpace.String.alert(title + getI18n('09018'), $i.attr('data-alert'));
                        bool = false;
                        return false;
                    }
                }
                if ($.inArray('int', paramsCheck) > -1) {
                    if (parseInt(_v) != _v) {
                        if (title) NameSpace.String.alert(title + getI18n('09019'), $i.attr('data-alert'));
                        bool = false;
                        return false;
                    }
                }
                if ($.inArray('max', paramsCheck) > -1) {
                    var dataName = $i.attr('data-name');
                    if (Number(minmax[dataName]['max']) < Number(minmax[dataName]['min'])) {
                        if (title) NameSpace.String.alert(title + getI18n('09020'), $i.attr('data-alert'));
                        bool = false;
                        return false;
                    }
                }
            }
            if ($.inArray('regular', paramsCheck) > -1) {
                if (!NameSpace.String.digitRegExp(_v)) {
                    if (title) NameSpace.String.alert(title + getI18n('09020'), $i.attr('data-alert'));
                    bool = false;
                    return false;
                }
                if (NameSpace.String.getDecimalNum(_v)) {
                    if (NameSpace.String.getDecimalNum(_v) > 2) {
                        if (title) NameSpace.String.alert(title + getI18n('09021'), $i.attr('data-alert'));
                        bool = false;
                        return false;
                    }
                }
            }
            if ($.inArray('date', paramsCheck) > -1) {
                if ($.inArray('max', paramsCheck) > -1) {
                    var dataName = $i.attr('data-name');
                    if (NameSpace.Date.date_to_timestamp(minmax[dataName]['max']) < NameSpace.Date.date_to_timestamp(minmax[dataName]['min'])) {
                        NameSpace.String.alert(getI18n('09022'), $i.attr('data-alert'));
                        bool = false;
                        return false;
                    }
                }
            }
            if ($.inArray('merge', paramsCheck) > -1) {
                var mergeValue = [];
                $form.find('[data-name="' + $i.attr('data-name') + '"]').each(function () {
                    mergeValue.push($(this).val());
                });
                _params[$i.attr('data-name')] = mergeValue.join(',');
            } else {
                if (_v === '' || _v.replace(/(^\s*)|(\s*$)/g, '').length == 0) return true; //值为空 不传此参数
                else _params[_i] = _v;
            }
        });
        //处理selectbox
        $form.find('[data-select]').each(function () {

            var $i = $(this),
                _id = $i.find('.select-title').attr('data-value'),
                _display = $i.find('.select-title span').text(),
                _v,
                paramsCheck = $i.attr('data-check') == undefined ? [] : $i.attr('data-check').split(' ');

            var _selectValue = $i.attr('data-select').split(' ');

            if (_selectValue == undefined) return false;
            var _i = _selectValue[0];

            if (_id != '') {
                if ($.inArray('selectText', paramsCheck) > -1) { //select需要id的同时，也上传对应的name值
                    _v = _display;
                } else {
                    _v = _id;
                }
                if ($.inArray('displayName', paramsCheck) > -1) { //select需要id的同时，也上传对应的name值
                    _params[_selectValue[1]] = _display;
                }
            } else return true;
            _params[_i] = _v;
        });

        if (!bool) {
            return false;
        }
        return _params;
    }
    this.alert = function (_validate, _type, _display) {
        var type = _type != undefined && _type ? _type : 'alert';
        if (type == 'alert') {
            alert(_validate);
        } else if (type == 'show') {
            _display.show().find('p').html(_validate);
        } else if (type == 'inner') {
            $('#prompt-message-show').find('p').text(_validate);
        }
    }
    this.paramsCheck = function (_dom, _check) {
        var checkValue = _dom.attr('data-check');
        if (checkValue == undefined) return false;

        var checkAry = checkValue.split(' ');
        if ($.inArray(_check, checkAry) === -1) {
            return false;
        } else {
            return true;
        }
    }
}

$(document).delegate('body', 'click', function (_e) {
    var target = $(_e.target) || $(_e.srcElement);
    if (!target.closest('.select-box').length) {
        $('.select-box').each(function () {
            $(this).attr('data-open', false).find('.select-con').hide();
        });
    }
});


//删除左右两端的空格
String.prototype.trim = function(){  
	return this.replace(/(^\s*)|(\s*$)/g, "");  
}
function getQueryString(name) { 
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg);
	if (r != null) 
		return unescape(r[2]); 
	return null; 
}