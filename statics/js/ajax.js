
//ajax请求地址列表
var URL = {
	Login : '/vrapi/Common/Login',							  //登录
    Logout: '/vrapi/Common/Logout',                           //退出
    ChangePassword: '/vrapi/Common/ChangePassword',                   //修改密码

    //公用
    MeasureText: '/vrapi/Common/MeasureText',                 //度量衡单位文本
    CompanySummary: '/vrapi/Company/Summary',                 //读取下属油站摘要信息

    AlarmSummary: '/vrapi/Alarm/AlarmSummary',                //报警
    TotalVariance: '/vrapi/Company/TotalVariance',            //损益
    SubCompanyVariance: '/vrapi/Company/SubCompanyVariance',  //下属机构损益
    DeliverySummary: '/vrapi/Company/DeliverySummary',        //配送
    DeviceSummary: '/vrapi/Company/DeviceSummary',            //设备

    //站级操作栏
    StationMenu: '/vrapi/Station/StationMenu',                //站级操作栏

    //库存
    InventorySummary: '/vrapi/Company/InventorySummary',      //库存摘要
    Inventory: '/vrapi/Company/Inventory',                    //库存明细
    StationRealTimeInventory: '/vrapi/Company/StationRealTimeInventory',   //油站实时库存

    VarianceRank: '/vrapi/Company/VarianceRank',              //本月损益率排行
    AlarmRank: '/vrapi/Company/AlarmRank',                    //报警排行
    StationList: '/vrapi/Company/StationList',                //油站直通车
    StationSummary: '/vrapi/Station/Summary',                 //站点信息
    CurrentInventory: '/vrapi/Station/CurrentInventory',      //站点当前库存
    StationLatestBIR: '/vrapi/Station/LatestBIR',             //站点进销存
    HistoryInventory: '/vrapi/Station/HistoryInventory',      //站点历史库存
    ProductVariance: '/vrapi/Company/ProductVariance',        //各油品损益统计
    DeliveryVarianceRank: '/vrapi/Company/DeliveryVarianceRank', //司机、车辆、发油鹤位、小量进油损益率排行
    ProductList: '/vrapi/Common/ProductList',                     //油品列表

    //报警
    AlarmQueryMeta: '/vrapi/Alarm/AlarmQueryMeta',                //报警查询所需基础数据
    AlarmList: '/vrapi/Alarm/AlarmList',                          //报警查询
    EditAlarmMeta: '/vrapi/Alarm/EditAlarmMeta',                  //告警编辑基础数据
    EditAlarm: '/vrapi/Alarm/EditAlarm',                          //告警编辑

    //油枪精度管理
    NozzleCheck: '/vrapi/Station/NozzleCheck',                    //油枪精度管理
    NozzleCheckEdit: '/vrapi/Station/NozzleCheckEdit',            //油枪精度增删改

    //配送单
    TicketDeliveryQueryMeta: '/vrapi/Delivery/TicketDeliveryQueryMeta',          //配送单查询所需基础数据

    //配送单录入
    LatestDeliveryReport: '/vrapi/Delivery/LatestDeliveryReport', //油罐最新进油报告查询
    TicketDeliveryExtract: '/vrapi/Delivery/TicketDeliveryExtract',   //配送单提取
    TicketDeliveryV20Calculate: '/vrapi/Delivery/TicketDeliveryV20Calculate',  //配送单V20计算
    TankList: '/vrapi/Common/TankList',                                   //油罐下拉列表
    VarianceOverview: '/vrapi/Delivery/VarianceOverview',                 //损益预览更新
    TicketDeliverySave: '/vrapi/Delivery/TicketDeliverySave',             //配送单保存
    ManualDeliveryReport: '/vrapi/Delivery/ManualDeliveryReport',          //手工进油报告
    ManualDeliveryReportDelete: '/vrapi/Delivery/ManualDeliveryReportDelete',  //手工进油报告删除
    ManualDeliveryReportSave: '/vrapi/Delivery/ManualDeliveryReportSave',       //手工进油报告保存
    UnloadingOilMeta: '/vrapi/Delivery/UnloadingOilMeta',                        //一车分卸查询所需基础数据
    UnloadingOilDeliveryReport: '/vrapi/Delivery/UnloadingOilDeliveryReport',     //一车分卸进油报告查询

    //校罐管理
    ChartCalibrationMeta: '/vrapi/Station/ChartCalibrationMeta',                   //校罐管理所需基础数据
    ChartCalibration: '/vrapi/Station/ChartCalibration',                            //校罐管理
    GetChartCalibrationChartId: '/vrapi/Station/GetChartCalibrationChartId', //获取液位仪当前罐表id
    ViewTankChart: '/vrapi/Station/ViewTankChart',                                         //查看当前罐表
    ChartCalibrationAlarm: '/vrapi/Station/ChartCalibrationAlarm',                         //校罐报警查询
    TankChartFinishedStatus: '/vrapi/Station/TankChartFinishedStatus',                     // 未开启校罐/验收完成/默认
    TankChartGetDataStatus: '/vrapi/Station/TankChartGetDataStatus',                       //数据采集状态
    TankChartNewChartStatus: '/vrapi/Station/TankChartNewChartStatus',                     //新建罐表状态
    TankChartSubmittedStatus: '/vrapi/Station/TankChartSubmittedStatus',                   //提交验收状态
    GetTankChartBir: '/vrapi/Station/GetTankChartBir',                                      //新旧罐表损溢率
    ManualRecommendTankChart: '/vrapi/Station/ManualRecommendTankChart',                    //选择其他罐表
    ConvertMultiToTwentyPt: '/vrapi/Station/ConvertMultiToTwentyPt',                        //多点罐表转换20点罐表
    LockTankChart: '/vrapi/Station/LockTankChart',                                          //锁定罐表
    CancelManualRecommendTankChart: '/vrapi/Station/CancelManualRecommendTankChart',         //取消锁定罐表
    GetNewAndOldChartDrawTankChartData: '/vrapi/Station/GetNewAndOldChartDrawTankChartData',  //获取新旧罐表圆滑度图形数据
    StartCalibration: '/vrapi/Station/StartCalibration',                                      //批量开启校罐
    CancelCalibration: '/vrapi/Station/CancelCalibration',                                    //取消校罐
    TankChartSubmit: '/vrapi/Station/TankChartSubmit',                                        //提交验收
    ResumeCalibration: '/vrapi/Station/ResumeCalibration',                                    //继续校罐
    DownloadChart: '/vrapi/Station/DownloadChart',                                            //下发罐表
    IsNewChartDownloaded: '/vrapi/Station/IsNewChartDownloaded',                              //新罐表是否下发到液位仪
    StopCalibration: '/vrapi/Station/StopCalibration',                                        //停止校罐

    //调整损溢
    AdjustedVariance: '/vrapi/Station/AdjustedVariance',                                      //调整损溢查询
    AdjustedVarianceMeta: '/vrapi/Station/AdjustedVarianceMeta',                              //调整损溢所需基础数据
    EditAdjustedVariance: '/vrapi/Station/EditAdjustedVariance',                              //调整损溢修改

    //配送单查询
    TicketDelivery: '/vrapi/Delivery/TicketDelivery',                            //配送单查询
    TicketDeliveryDetail: '/vrapi/Delivery/TicketDeliveryDetail',                 //配送单详情
    GasStationLatestDeliveryReport: '/vrapi/Delivery/GasStationLatestDeliveryReport',   //油站最新进油报告查询
    ReassociationDeliveryReport: '/vrapi/Delivery/ReassociationDeliveryReport',   //重新关联进油报告
    UpdateTicketDelivery: '/vrapi/Delivery/UpdateTicketDelivery',                //配送单更新
    DeleteTicketDelivery: '/vrapi/Delivery/DeleteTicketDelivery',                //配送单删除
    GetTicketDeliveryReportUrl: '/vrapi/Delivery/GetTicketDeliveryReportUrl',    //获取配送单查询帆软报表Url
    TicketDeliveryClaim: '/vrapi/Delivery/TicketDeliveryClaim',                  //创建配送索赔单基础数据
    CreateTicketDeliveryClaim: '/vrapi/Delivery/CreateTicketDeliveryClaim',      //保存创建配送索赔单
    ActiveDelivery: '/vrapi/Station/ActiveDelivery', //主动配送
    ActiveDeliveryMeta: '/vrapi/Station/ActiveDeliveryMeta',
    ActiveDeliveryStatusChange: '/vrapi/Station/ActiveDeliveryStatusChange',

    //进油报告
    DeliveryReport: '/vrapi/Delivery/DeliveryReport',

    //侧漏管理
    LeakDetect: '/vrapi/Station/LeakDetect',                                     //开启测漏查询
    StartLeakDetectMeta: '/vrapi/Station/StartLeakDetectMeta',                   //开启测漏所需基础数据
    StartLeakDetect: '/vrapi/Station/StartLeakDetect',                           //开启测漏保存
    SelectCSLDState: '/vrapi/Station/SelectCSLDState',                           //动态测漏每个罐的状态查询
    StartCSLDLeakTest: '/vrapi/Station/StartCSLDLeakTest',                       //开启动态测漏
    StopCSLDLeakTest: '/vrapi/Station/StopCSLDLeakTest',                         //停止动态测漏
    SelectCSLDReport: '/vrapi/Station/SelectCSLDReport',                         //动态测漏查询
    SelectSensorOverview: '/vrapi/Station/SelectSensorOverview',

    //油罐参数列表
    TankParam: '/vrapi/Station/TankParam',
    //油罐参数远程设置
    TankParamSet: '/vrapi/Station/TankParamSet',

    //鹤位维护
    DepotPositionMeta: '/vrapi/Station/DepotPositionMeta',                      //油库鹤位维护基础数据
    DepotPosition: '/vrapi/Station/DepotPosition',                              //油库鹤位维护
    AddDepotPosition: '/vrapi/Station/AddDepotPosition',                        //添加油库鹤位
    DepotPositionManagement: '/vrapi/Station/DepotPositionManagement',          //油库鹤位管理
    QueryLastDpCalibrationRecord: '/vrapi/Station/QueryLastDpCalibrationRecord',   //油站鹤位历史查询[第首次加载调用]
    QueryDpCalibrationRecord: '/vrapi/Station/QueryDpCalibrationRecord',          //油站鹤位历史查询[根据时间范围查询调用]

    //ATG设备参数管理
    TankParamManagement: '/vrapi/Station/TankParamManagement',
    TankParamView: '/vrapi/Station/TankParamView',                                //油罐参数查询
    TankParamAlarmRefresh: '/vrapi/Station/TankParamAlarmRefresh',                //油罐参数报警信息刷新
    TankParamAlarmEdit: '/vrapi/Station/TankParamAlarmEdit',                      //油罐参数报警信息恢复、认可

    //罐表管理
    TankChartSummary: '/vrapi/Station/TankChartSummary',                                 //油罐概览
    HistoryTankChart: '/vrapi/Station/HistoryTankChart',                                 //油罐历史详情
    TankChartType: '/vrapi/Station/TankChartType',                                       //二十点、多点罐表类型
    UploadMultiPointTankChart: '/vrapi/Station/UploadMultiPointTankChart',               //上传多点罐表
    CreateTankChart: '/vrapi/Station/CreateTankChart',                                   //创建罐表
    GetAtgOperation: '/vrapi/Station/GetAtgOperation',                                   //获取ATG指令
    InitAtgOperationExecution: '/vrapi/Station/InitAtgOperationExecution',               //初始化ATG指令执行
    AtgOperationCallback: '/vrapi/Station/AtgOperationCallback',                         //ATG操作指令回调事件
    CreateAndStartAtgOperation: '/vrapi/Station/CreateAndStartAtgOperation',             //创建操作指令
    GetAtgOperationExecutionState: '/vrapi/Station/GetAtgOperationExecutionState',       //查询操作指令的执行状态
    AtgOperationFinishEvent: '/vrapi/Station/AtgOperationFinishEvent',                   //ATG操作执行完成
    TankChartAmendment: '/vrapi/Station/TankChartAmendment',                             //修正罐表
    CreateTankChartCmd: '/vrapi/Station/CreateTankChartCmd',                             //创建罐表（ATG指令）

    //损溢
    ProductVariance: '/vrapi/Company/ProductVariance',                                   //各油品损益统计
    SubCompanyVarianceReport: '/vrapi/Company/SubCompanyVarianceReport',                 //下属机构损益报表

    //油站一览
    StationOverview: '/vrapi/Station/StationOverview',                                   //油站一览

    //小时BIR
    HourlyBIR: '/vrapi/Station/HourlyBIR',                                               //小时BIR
    ShiftBIRReport: '/vrapi/Station/ShiftBIRReport',                                     //销售损溢

    //报表
    GetCompanyReportUrl: '/vrapi/Company/GetCompanyReportUrl',                           //公司报表

    //地图
    Map: '/vrapi/Common/MapVisibleStation',

    RefreshAtgTankInventory: '/vrapi/Station/RefreshAtgTankInventory' //更新液位仪
}

//异步调用
function ajaxCall(_url, _params, _callback) {
    $.ajax({
        dataType: 'json',
        type: 'post',
        url: _url,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: _params,
        success: function (_message) {
            if (_message.Description == 'Invalid session.') {
                $.cookie('LoginStatus', 0);
                top.location.href = 'Login.html';
            }
            else if (_message.Result == 'Failed') alert(_message.Description);
            else _callback(_message);
        },
        error: function (_message, a, b) {
            console.log(_message);
            if (_message.status == 500) {
                alert('服务器错误，请联系管理员');
                parentModal_hide();
            }
            //alert('暂时无法连接到服务器，请检查您的网络环境。');
            //$('#page-loading').show();
        }
    });
};

//同步调用
function ajaxSyncCall(_url, _params, _callback) {
    $.ajax({
        dataType: 'json',
        type: 'post',
        url: _url,
        data: _params,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        async: false,
        success: function (_message) {
            if (_message.Description == 'Invalid session.') {
                top.location.href = 'Login.html';
            }
            else if (_message.Result == 'Failed') alert(_message.Description);
            else _callback(_message);
        },
        error: function (_message) {
            //alert('暂时无法连接到服务器，请检查您的网络环境。');
            $('#page-loading').show();
        }
    });
};

//关闭父页面弹出框
function parentModal_hide(){
    var $commonModal = $(window.parent.document.getElementById('modal-commonPage')),
        $innerModal = $(window.parent.document.getElementById('modal-innerPage')),
        $overlay = $(window.parent.document.getElementById('overlay'));

    $overlay.hide();
    $commonModal.hide();
    $innerModal.hide();
}




