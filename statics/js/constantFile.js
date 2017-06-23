/*
    在此手动添加内容
*/

//系统语言
/*var SYSTEM_LANGUAGE = {  
    'Chinese': '中文',
    'English': 'English'
}*/

var SYSTEM_LANGUAGE = [ //若后期需要修改，直接在这里添加或修改
    {
        'Vaule': 'Chinese',
        'Name': '中文',
        'ImgUrl': 'statics/img/icon_cn.png'
    },
    {
        'Vaule': 'English',
        'Name': 'English',
        'ImgUrl': 'statics/img/icon_en.png'
    }
];

//系统单位
var SYSTEM_UNITS = {    //若后期需要添加，只需在中英文文件中添加对应的系统单位，然后把中英文对应的编码写在这里
    '03011': 'Metric',
    '03012': 'US'
};

//参数设置页面中paramID=122的时候的时间配置
var timeMap = {
    '00': getI18n('02019'),
    '01': getI18n('02020'),
    '02': getI18n('02021'),
    '03': getI18n('02022'),
    '04': getI18n('02023'),
    '05': getI18n('02024'),
    '06': getI18n('02025'),
    '07': getI18n('02026'),
    '08': getI18n('02027'),
    '09': getI18n('02028'),
    '10': getI18n('02029'),
    '11': getI18n('02030'),
    '12': getI18n('02031'),
    '99': getI18n('28008')
}

var aryEditIds1 = [113, 114, 115, 116, 117, 118, 119, 120, 121],//可以输入时间的ParamID
    aryEditIds2 = [102, 105, 106, 107, 110, 108, 109, 127, 128, 104],
    aryEditIds3 = [113, 114, 115, 116, 117, 118, 119, 120];//可以输入EE00的时间格式的ParamID

var disabledStatusCons = {
    key: "EE00",
    value: getI18n('28008')
};