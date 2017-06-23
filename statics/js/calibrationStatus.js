/*校罐状态公用*/
var pageParam = stateman.current.param;
(function () {
    var stateName = stateman.current.currentName,
        curDate = new Date(),
        endDate = curDate.getFullYear() + '-' + NameSpace.Format.addFormat(curDate.getMonth() + 1) + '-' + NameSpace.Format.addFormat(curDate.getDate());

    switch (stateName) {
        case 'TankChartFinishedStatus':
            var params = {
                //"SessionID": SessionID,
                "StationID": pageParam.StationID,
                "TankID": pageParam.TankID
            };

            if(pageParam['TankID']) params['TankID'] = pageParam.TankID;
            tankChartFinishedStatus(params);
            break;
        case 'TankChartGetDataStatus':
            var params = {
                //"SessionID": SessionID,
                "ChartCalibrationID": pageParam.ChartCalibrationID,
                "StationID": pageParam.StationID,
                "TankID": pageParam.TankID
            }
            tankChartGetDataStatus(params);
            break;
        case 'TankChartNewChartStatus':
            var params = {
                //"SessionID": SessionID,
                "ChartCalibrationID": pageParam.ChartCalibrationID,
                "StationID": pageParam.StationID,
                "TankID": pageParam.TankID,
                "NewChartID": pageParam.NewChartID,
                "BeginDate": pageParam.BeginDate,
                "EndDate": endDate
            };
            tankChartNewChartStatus(params);
            break;
        case 'TankChartSubmittedStatus':
            var params = {
                //"SessionID": SessionID,
                "ChartCalibrationID": pageParam.ChartCalibrationID,
                "StationID": pageParam.StationID,
                "TankID": pageParam.TankID,
                "NewChartID": pageParam.NewChartID,
                "BeginDate": pageParam.BeginDate,
                "EndDate": endDate
            }
            tankChartSubmittedStatus(params,false);
            break;
        default:
            break;
    }
})();

//各个操作按钮
(function(){
    //查看新罐表
    $('.detailTank-view').on('click', function () {
        var params01 = {
            //"SessionID": SessionID,
            "MethodType": "2",
            "ChartCalibrationID": pageParam.ChartCalibrationID
        };
        ajaxCall(URL.GetChartCalibrationChartId, params01, function (_message) {
            console.log(_message);
            if (_message.Result == 'Success') {
                var title = '20021',
                    chartID = _message.ChartID,
                    params02 = {
                        //"SessionID": SessionID,
                        "MethodType": "1",    //1：查看全罐表；2：查看具体的罐表
                        "ChartID": chartID
                    };

                modal_tankChart(params02, title, '', '', true);
                //tankChartView(params02, title, '', '', true);
            } else {
                alert(_message.Description);
            }
        });
    });

    //选择其他罐表
    $('#manual-chart').off().on('click', function () {
        var $modal = $('#tankChart-manualRecommend');

        $modal.addClass('layered-modal');
        $('.input-box', $modal).val('');
        $('.multi-tank', $modal).show();
        $('.dataTables_wrapper', $modal).hide();
        modal_show($modal);

        //查询
        $('#manualRecommend-query').off().on('click', function () {
            $('.dataTables_wrapper', $modal).hide();

            if (chartID_verif()) {
                var params01 = chartID_verif();

                ajaxCall(URL.ManualRecommendTankChart, params01, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {

                        if (_message.HeightVolPair) {
                            $('.multi-tank', $modal).show();

                            $('.multi-tank .table-result').show().dataTable({
                                'lengthChange': false,
                                'processing': true,
                                'searching': false,
                                'paging': false,
                                'scrollY': 140,
                                "scrollCollapse": true,
                                'info': false,
                                'ordering': false,
                                'dom': 'rtpi',
                                'destroy': true,
                                'data': _message.HeightVolPair,
                                'columns': [
                                    {
                                        'data': 'height1'
                                    },
                                    {
                                        'data': 'volume1'
                                    },
                                    {
                                        'data': 'height2'
                                    },
                                    {
                                        'data': 'volume2'
                                    },
                                    {
                                        'data': 'height3'
                                    },
                                    {
                                        'data': 'volume3'
                                    },
                                    {
                                        'data': 'height4'
                                    },
                                    {
                                        'data': 'volume4'
                                    }
                                ],
                                'language': {
                                    'emptyTable': getI18n('20019')
                                }
                            });
                        } else {
                            $('.multi-tank', $modal).hide();
                        }
                        $('input[name=diameter]', $modal).val(_message.Diameter);

                        for (var i in _message.HeightList) {
                            $('.form-list input.input-box', $modal).eq(i).val(_message.HeightList[i].Height);
                        }
                    } else {
                        alert(_message.Description);
                        $('.twenty-tank .input-box').val('');
                    }
                });
            }
        });

        //多点罐表转换20点罐表
        $('#multiToTwentyPt').off().on('click', function () {
            if (chartID_verif()) {
                var params01 = chartID_verif();

                ajaxCall(URL.ConvertMultiToTwentyPt, params01, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') {
                        $('input[name=diameter]', $modal).val(_message.Diameter);

                        for (var i in _message.HeightList) {
                            $('.form-list input.input-box', $modal).eq(i).val(_message.HeightList[i].Height);
                        }
                        $('input[name=chartID]', $modal).val('');
                    } else {
                        alert(_message.Description);
                        $('.twenty-tank .input-box').val('');
                    }
                });
            }
        });

        //转换罐表 - 由前台转换
        $('#tank-convert').off().on('click', function () {
            var diameter = $('input[name=diameter]', $modal).val(),
                twentyPtVolume = $('input[name=TwentyPtVolume]', $modal).val(),
                volumeArray = twentyPtVolume.split(','),
                temp = volumeArray.slice(0),
                bool = true;

            if (bool && !/^\d+(\.\d+)?$/.test(diameter)) {
                bool = false;
                alert(getI18n('15903'));
            }
            if (bool) {
                /*20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20*/
                temp.sort(function (a, b) {
                    return b - a;
                });
                if (volumeArray.length != 20 || !NameSpace.Array.isTwoArrayEquals(volumeArray, temp)) {
                    bool = false;
                    alert(getI18n('15904'));
                    $('.form-list input.input-box', $modal).val('');
                }
            }

            if (bool) {
                $('input[name=chartID]', $modal).val('');
                for (var i in volumeArray) {
                    $('.form-list input.input-box', $modal).eq(i).val(volumeArray[i]);
                }
            }

        });

        //锁定罐表
        $('#tankChart-lock').off().on('click', function () {
            var params01 = {
                //"SessionID": SessionID,
                "StationID": pageParam.StationID, //data.GsID
                "TankID": pageParam.TankID//data.TankID
            },
                volumeArray = [],
                chartID = $('input[name=chartID]', $modal).val(),
                diameter = $('input[name=diameter]', $modal).val(),
                fieldObj = [
                    {
                        'value': diameter,
                        'text': getI18n('10052')
                    }
                ],
                bool = true;

            $('.form-list input.input-box', $modal).each(function () {
                if($(this).val() !== '') volumeArray.push($(this).val());
            });

            bool = NameSpace.String.someFieldRequired(bool, fieldObj, 'isAlert');
            bool = NameSpace.String.digitalControl(bool, $modal, 'isAlert');
            if (bool && volumeArray.length != 20) {
                bool = false;
                alert(getI18n('15053'));
            }
            if (bool) {
                params01['ChartID'] = chartID;
                params01['Diameter'] = diameter;
                params01['Volume'] = volumeArray.join();
                ajaxCall(URL.LockTankChart, params01, function (_message) {
                    console.log(_message);
                    if (_message.Result == 'Success') alert(getI18n('15905'));
                    else alert(_message.Description);
                });
            }
        });

        function chartID_verif() {
            var params01 = {
                //"SessionID": SessionID,
                "StationID": pageParam.StationID, //data.GsID
                "TankID": pageParam.TankID//data.TankID
            },
            chartID = $('input[name=chartID]', $modal).val(),
            arrayObj = [
                {
                    'value': chartID,
                    'text': getI18n('15023')
                }
            ],
            bool = true;

            bool = NameSpace.String.someFieldRequired(bool, arrayObj, 'isAlert');
            bool = NameSpace.String.digitalControl(bool, $modal, 'isAlert');
            if (bool) {
                params01['ChartID'] = chartID;
                return params01;
            } else {
                return false;
            }
        }
    });

    //取消锁定罐表
    $('#cancelManual-chart').on('click', function () {
        var params01 = {
            //"SessionID": SessionID,
            "StationID": pageParam.StationID, //data.GsID
            "TankID": pageParam.TankID//data.TankID
        }
        ajaxCall(URL.CancelManualRecommendTankChart, params01, function (_message) {
            console.log(_message);
            alert(_message.Description);
        });
    });

    //批量开启校罐
    $('#btn-startCalibration').on('click',function(){
        if(!$(this).hasClass('btn-disabled')){
            var $modal = $('#tankChart-finishedChart'),
                tankList = [];

            $('.tank-list',$modal).find('input[type=checkbox]:checked').each(function () {
                    var value = $(this).val();
                    tankList.push(value);
                });
            if (tankList.length == 0) {
                alert(getI18n('14907'));
                return false;
            }
            btnStartChartCalib_click(tankList);
        }
    });

    //取消校罐
    $('#btn-cancelCalibration').on('click',function(){
        var $modal = $(this).closest('.modal-tankStatus'),
            params = {
	            //"SessionID" : SessionID,
                "StationID" : pageParam.StationID,
                "TankID" : pageParam.TankID,
                "ChartCalibrationID" : pageParam.ChartCalibrationID,  //CCID
                "CcStatus" : pageParam.CcStatus,
                "Remark" : $('textarea[name=Remark]',$modal).val()
            },
        messageCode = $(this).attr('data-confirm');
        if(messageCode){
            if(confirm(getI18n(messageCode))){
                ajaxCall(URL.CancelCalibration,params,function(_message){
                    if(_message.Result == 'Success'){
                        alert(_message.Description);

                        var state = stateman.decode(window.top.location.hash.replace('#',''));
                        if(state.currentName == 'ChartCalibration') window.parent.document.getElementById('chartCalibration-query').click();
                        parentModal_hide();
                    }else{
                        alert(_message.Description);
                    }
                });
            }
        }else{
            ajaxCall(URL.CancelCalibration,params,function(_message){
                if(_message.Result == 'Success'){
                    alert(_message.Description);
                    
                    var state = stateman.decode(window.top.location.hash.replace('#',''));
                    if(state.currentName == 'ChartCalibration') window.parent.document.getElementById('chartCalibration-query').click();
                    parentModal_hide();
                }else{
                    alert(_message.Description);
                }
            });
        }
    });

    //提交验收
    $('#btn-tankChartSubmit').on('click',function(){
        var $modal = $('#tankChart-newChart'),
            params = {
	            //"SessionID" : SessionID,
                "StationID" : pageParam.StationID,
                "TankID" : pageParam.TankID,
                "Remark" : $('textarea[name=Remark]',$modal).val()
            }
        ajaxCall(URL.TankChartSubmit,params,function(_message){
            if(_message.Result == 'Success'){
                alert(getI18n('15922'));

                var state = stateman.decode(window.top.location.hash.replace('#',''));
                if(state.currentName == 'ChartCalibration') window.parent.document.getElementById('chartCalibration-query').click();
                parentModal_hide();
            }else{
                alert(_message.Description);
            }
        });
    });

    //继续校罐
    $('#btn-resumeCalibration').on('click',function(){
        var $modal = $('#tankChart-submittedChart'),
            params = {
	        //"SessionID" : SessionID,
            "StationID" : pageParam.StationID,
            "TankID" : pageParam.TankID,
            "ChartCalibrationID" : pageParam.ChartCalibrationID,  //CCID
            "CcStatus" : pageParam.CcStatus,
            "Remark": $('textarea[name=Remark]',$modal).val()
        }
        ajaxCall(URL.ResumeCalibration,params,function(_message){
            if(_message.Result == 'Success'){
                alert(_message.Description);

                var state = stateman.decode(window.top.location.hash.replace('#',''));
                if(state.currentName == 'ChartCalibration') window.parent.document.getElementById('chartCalibration-query').click();
                parentModal_hide();
            }else{
                alert(_message.Description);
            }
        });
    });

    //下发罐表
    $('#btn-downloadChart').on('click',function(){
        var $btn = $(this);
         
        if(!$btn.hasClass('btn-disabled')){
            var params = {
	            //"SessionID" : SessionID,
                "StationID" : pageParam.StationID,
                "TankID" : pageParam.TankID,
                "ChartCalibrationID" : pageParam.ChartCalibrationID,  //CCID
                "CcStatus" : pageParam.CcStatus
            }

            ajaxCall(URL.DownloadChart,params,function(_message){
                if(_message.Result == 'Success'){
                    alert(_message.Description);
                    $btn.addClass('btn-disabled');
                }else{
                    alert(_message.Description);
                }
            });
        }
    });

    //验收完成
    $('#btn-tankChartSubmitComplete').on('click',function(){
        var verifyMethodValue = $('#verifyMethodList').find('.select-title').attr('data-value');

        if(verifyMethodValue == '' || verifyMethodValue === '0'){
            alert(getI18n('15920'));
            return false;
        }
        var downloadedParams = {
            //"SessionID" : SessionID,
            "ChartCalibrationID": pageParam.ChartCalibrationID
        }
        ajaxCall(URL.IsNewChartDownloaded,downloadedParams,function(_message){
            if(_message.Result == 'Success'){
                var $modal = $('#tankChart-submittedChart'),
                    params = {
	                    //"SessionID" : SessionID,
                        "StationID" : pageParam.StationID,
                        "TankID" : pageParam.TankID,
                        "VerifyMethod" : verifyMethodValue,  //验收方法
                        "CcStatus" : pageParam.CcStatus,
                        "Remark": $('textarea[name=Remark]',$modal).val()
                    },
                    bool = true;
                if(!_message.IsNewChartDownloaded){
                   if(!confirm(getI18n('15921'))){
                        bool = false;
                    }
                }
                if(bool){
                    ajaxCall(URL.StopCalibration,params,function(_message){
                        if(_message.Result == 'Success'){
                            alert(_message.Description);

                            var state = stateman.decode(window.top.location.hash.replace('#',''));
                            if(state.currentName == 'ChartCalibration') window.parent.document.getElementById('chartCalibration-query').click();
                            parentModal_hide();
                        }else{
                            alert(_message.Description);
                        }
                    });
                }
            }else{
                alert(_message.Description);
            }
        });
    });

})();

//验证校罐开启前置条件是否符合校罐
function btnStartChartCalib_click(_tankList) {
    var messageNotStart = ""; //手工选择前置条件时不启动校罐Message提醒
    var messageRemind = ""; //提示会影响校罐的原因，并启动校罐

    //平均日销售量检查
    var ddlSale = $("#ddlSale");
    var ddlSaleValue = ddlSale.find('.select-title').attr('data-value');
    if (ddlSaleValue == 1) {
        messageRemind = "  "+ getI18n('15909') + "\n";
    }
    else if (ddlSaleValue == 3) {
        messageNotStart = "  "+ getI18n('15910');
    }

    if (messageNotStart != "") {
        messageNotStart = messageNotStart + "\n";
    }

    //是否该罐有卡浮子现象
    var ddlFloat = $("#ddlFloat");
    var ddlFloatValue = ddlFloat.find('.select-title').attr('data-value');
    if (ddlFloatValue == 1) {
        messageNotStart = messageNotStart + "  "+ getI18n('15911');
    }

    if (messageNotStart != "") {
        messageNotStart = getI18n('15912') + "\n" + messageNotStart + "\n";
    }

    //油站是24小时运营（夜间停运）
    var ddlBusiness = $("#ddlBusiness");
    var ddlBusinessValue = ddlBusiness.find('.select-title').attr('data-value');
    if (ddlBusinessValue == 0) {
        messageRemind = messageRemind + "  "+ getI18n('15913') + "\n";
    }

    if (messageRemind != "") {
        messageRemind = messageRemind;
    }

    //是否安装防爆阻隔
    var ddlObstruct = $("#ddlObstruct");
    var ddlObstructValue = ddlObstruct.find('.select-title').attr('data-value');
    if (ddlObstructValue == 1) {
        messageRemind = messageRemind + "  "+ getI18n('15914') + "\n";
    }

    if (messageRemind != "") {
        messageRemind = messageRemind;
    }

    //加油机数据是否接入液位仪
    var ddlATG = $("#ddlATG");
    var ddlATGValue = ddlATG.find('.select-title').attr('data-value');
    if (ddlATGValue == 0) {
        messageRemind = messageRemind + "  "+ getI18n('15915') + "\n";
    }

    if (messageRemind != "") {
        messageRemind = messageRemind;
    }

    //集中式油气回收MINI9000
    var ddlMINI = $("#ddlMINI");
    var ddlMINIValue = ddlMINI.find('.select-title').attr('data-value');
    if (ddlMINIValue == 1) {
        messageRemind = messageRemind + "  "+ getI18n('15916') + "\n";
    }

    if (messageRemind != "") {
        messageRemind = getI18n('15917') + "\n" + messageRemind;
    }

    var messageAll = messageNotStart + messageRemind;


    if (messageNotStart != "") {
        alert(messageAll);
        return false;
    }

    if (messageAll != "" && messageNotStart == "") {
        if (confirm(messageAll)) { 
           doStartTankChartCalibration(_tankList); 
        }
    }
    if (messageAll == "") { 
        doStartTankChartCalibration(_tankList);
    } 
}

function doStartTankChartCalibration(_tankList){
    var $modal = $('#tankChart-finishedChart'),
        params = {
	        //"SessionID" : SessionID,
            "StationID" : pageParam['StationID'],
            "Remark" : $('textarea[name=Remark]',$modal).val()   //备注
        },
        tankList = [];

    //前置条件
    var preCheckResultStr = $("#ddlSale").find('label').text().slice(0,-1) + ',' + $("#ddlSale").find('.select-title span').text() + ","
    + $("#ddlBusiness").find('label').text().slice(0,-1) + ',' + $("#ddlBusiness").find('.select-title span').text() + ','
    + $("#ddlObstruct").find('label').text().slice(0,-1) + ',' + $("#ddlObstruct").find('.select-title span').text() + ','
    + $("#ddlATG").find('label').text().slice(0,-1) + ',' + $("#ddlATG").find('.select-title span').text() + ','
    + $("#ddlMINI").find('label').text().slice(0,-1) + ',' + $("#ddlMINI").find('.select-title span').text() + ','
    + $("#ddlFloat").find('label').text().slice(0,-1) + ',' + $("#ddlFloat").find('.select-title span').text();

    params['PreCheckResult'] = preCheckResultStr;
    params['TankID'] = _tankList.join();
    ajaxCall(URL.StartCalibration,params,function(_message){
        console.log(_message);
        if(_message.Result == 'Success'){
            alert(_message.Description);

            var state = stateman.decode(window.top.location.hash.replace('#',''));
            if(state.currentName == 'ChartCalibration') window.parent.document.getElementById('chartCalibration-query').click();
            parentModal_hide();
        }else{
            alert(_message.Description);      
        }
    });
}

//初始罐表 - 0
function tankChartFinishedStatus(_params){
    var $modal = $('#tankChart-finishedChart');

    ajaxCall(URL.TankChartFinishedStatus, _params, function (_message) {
        console.log(_message);
        var calibrationMethodList = _message.CalibrationMethodList,
            $methodList = $('#calibrationMethodList'),
            methodHtml = '';

        /*选择校罐方式*/
        for (var i in calibrationMethodList) {
            methodHtml = methodHtml + '<li data-value="' + calibrationMethodList[i].MethodID + '">' + calibrationMethodList[i].DisplayName + '</li>';
        }
        $('.select-con', $methodList).html(methodHtml);
        //初始化
        NameSpace.Select.firstSelected($methodList);
        calibrationMethodList_match($('.select-title', $methodList).attr('data-value'), calibrationMethodList);

        NameSpace.Select.select_calibrationMethodList = function (_element, _selector) {
            var value = _element.attr('data-value');
            calibrationMethodList_match(value, calibrationMethodList);
        }
        $('.block-loading',$modal).hide();
    });

    function calibrationMethodList_match(_methodID, _list) {
        for (var i in _list) {
            if (_methodID == _list[i].MethodID) {
                var itemData = _list[i];

                if (itemData.Visible) {
                    var $salesList = $('#averageSalesList'),
                        tankHtml = '',
                        salesHtml = ''
                        tankListEnable = false;

                    $('.message-show', $modal).text('');
                    for(var i = 0; i < itemData.TankList.length;i++){
                        if(itemData.TankList[i].Enable) {
                            tankListEnable = true;
                            if(itemData.TankList[i].Message == ''){
                                tankHtml = tankHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + itemData.TankList[i].TankID + '">'+itemData.TankList[i].TankID+'</label>';
                            }else{
                                tankHtml = tankHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + itemData.TankList[i].TankID + '">'+itemData.TankList[i].TankID+'('+itemData.TankList[i].Message+')'+'</label>';
                            }
                            
                        }else{
                            if(itemData.TankList[i].Message == ''){
                                tankHtml = tankHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + itemData.TankList[i].TankID + '" disabled>'+itemData.TankList[i].TankID+'</label>';
                            }else{
                                tankHtml = tankHtml + '<label class="checkbox-inline"><input type="checkbox" value="' + itemData.TankList[i].TankID + '" disabled>'+itemData.TankList[i].TankID+'('+itemData.TankList[i].Message+')'+'</label>';
                            }
                            
                        }
                    }
                    $('#tankList').show().find('.checkbox-list').html(tankHtml);

                    $('.message-box', $modal).find('p').remove();
                    if (itemData.UnmatchedCondition.length) {
                        var html = '';
                        for (var index in itemData.UnmatchedCondition) {
                            html = html + '<p>' + itemData.UnmatchedCondition[index] + '</p>';
                        }
                        $('#UnmatchedCondition', $modal).append(html).show();
                    } else {
                        $('#UnmatchedCondition', $modal).hide();
                    }
                    if(tankListEnable){
                        $('.form-list', $modal).find('.select-box').removeClass('disabled');
                        $('#btn-startCalibration').removeClass('btn-disabled');
                    }else{
                        $('.form-list', $modal).find('.select-box').addClass('disabled');
                        $('#btn-startCalibration').addClass('btn-disabled');
                    }
                    if(itemData.FailReason.length){
                        var html = '';
                        for (var index in itemData.FailReason) {
                            html = html + '<p>' + itemData.FailReason[index] + '</p>';
                        }
                        $('#FailReason', $modal).append(html).show();
                    }else{
                        $('#FailReason', $modal).hide();
                    }
                    for (var i in itemData.AverageSalesList) {
                        salesHtml = salesHtml + '<li data-value="' + itemData.AverageSalesList[i].ID + '">' + itemData.AverageSalesList[i].DisplayName + '</li>';
                    }
                    $('.select-con', $salesList).html(salesHtml);
                    NameSpace.Select.firstSelected($salesList);

                    $('.form-list', $modal).show();
                    $('.remark-box', $modal).show();
                    $('.btn-submit', $modal).show();
                } else {
                    $('.message-show', $modal).text(itemData.Message);
                    $('.init-hide', $modal).hide();
                }
            }
        }
    }
}

//数据采集 - 1
function tankChartGetDataStatus(_params){
    var $modal = $('#tankChart-getData');

    ajaxCall(URL.TankChartGetDataStatus, _params, function (_message) {
        console.log(_message);
        var oilInletRangeList = _message.OilInletRangeList,
            deliveryHeight = _message.DeliveryHeight,
            tankChartDataSuff = _message.TankChartDataSuff,
            chartCalibrationAlarmList = _message.ChartCalibrationAlarmList;

        //进油范围
        oilInletRangeChart('oil-range-chart', oilInletRangeList);

        //进油详情
        oilDetailChart('oil-detail-chart', deliveryHeight, '#plotLine-text');

        if (tankChartDataSuff.IsShow) {
            $('#tankChartDataSuff', $modal).show();
            //校罐数据充足率
            dataRateChart('tank-dataRate-chart', tankChartDataSuff.ACDataSuffHistogramList);

            //表格数据
            dataRateTable('#dataRate-table', tankChartDataSuff.ACDataSuffList);

            //校罐数据充足率历史曲线
            dataHistoryChart('tank-dataHistory-chart', tankChartDataSuff.ACDataSuffHistoryList, '#plotLine-text02');
        } else {
            $('#tankChartDataSuff', $modal).hide();
        }

        //历史报警信息
        historyAlarmTable('#historyAlarm', chartCalibrationAlarmList);

        if (_message.Remark === null) $('textarea[name=Remark]', $modal).val('');
        else $('textarea[name=Remark]', $modal).val(_message.Remark);

        $('.block-loading', $modal).hide();
    });
}

//新罐表 - 5
function tankChartNewChartStatus(_params){
    var $modal = $('#tankChart-newChart');

    ajaxCall(URL.TankChartNewChartStatus, _params, function (_message) {
        console.log(_message);
        var tankChartBirList = _message.TankChartBirList,
            oilInletRangeList = _message.OilInletRangeList,
            deliveryHeight = _message.DeliveryHeight,
            tankChartDataSuff = _message.TankChartDataSuff,
            chartCalibrationAlarmList = _message.ChartCalibrationAlarmList;


        if (_message.IsShowManualRecommend) $('.header-nav .isShow', $modal).show();
        else $('.header-nav .isShow', $modal).hide();

        $('input[name=BeginDate]', $modal).val(_params['BeginDate']);
        $('input[name=EndDate]', $modal).val(_params['EndDate']);

        $('#TankChartBirList').show();
        GetTankChartBirTable($('#TankChartBirList'), tankChartBirList);

        //新旧罐表损益率对比表格
        $('#TankChartBir-get').off().on('click', function () {
            var subParams = {
                //"SessionID": SessionID,
                "NewChartID": _params.NewChartID
            }
            subParams = NameSpace.String.getFormParams('#tankChartBir-query-form', subParams);
            if (subParams === false) {
                return false;
            }
            $('#TankChartBirList').find('tbody').html('<tr class="loading"><td colspan="13">' + getI18n('10801') + '</td></tr>');
            ajaxCall(URL.GetTankChartBir, subParams, function (_message) {
                console.log(_message);

                //新旧罐表损溢率对比表格
                GetTankChartBirTable($('#TankChartBirList'), _message.TankChartBirList);
                //新旧罐表损溢率对比图
                varianceRateChart(_message.TankChartBirList, 'tank-varianceRate-chart', '#plotLine-text03');
                //新旧罐表损溢高度对比图
                avgHeightChart(_message.TankChartBirList, 'tank-avgHeight-chart', '#plotLine-text04');
            });
        });

        //新旧罐表损溢率对比图
        varianceRateChart(tankChartBirList, 'tank-varianceRate-chart', '#plotLine-text03');

        //新旧罐表损溢高度对比图
        avgHeightChart(tankChartBirList, 'tank-avgHeight-chart', '#plotLine-text04');

        //新旧罐表圆滑度图形对比图
        getNewAndOldChart(_params.ChartCalibrationID, 'draw-tank-chart');

        //进油范围
        oilInletRangeChart('oil-range-chart02', oilInletRangeList);

        //进油详情
        oilDetailChart('oil-detail-chart02', deliveryHeight, '#plotLine-text05');

        if (tankChartDataSuff.IsShow) {
            $('#tankChartDataSuff', $modal).show();
            //校罐充足率
            dataRateChart('tank-dataRate-chart02', tankChartDataSuff.ACDataSuffHistogramList);

            //表格数据
            dataRateTable('#dataRate-table02', tankChartDataSuff.ACDataSuffList);

            //校罐数据充足率历史曲线
            dataHistoryChart('tank-dataHistory-chart02', tankChartDataSuff.ACDataSuffHistoryList, '#plotLine-text06');
        } else {
            $('#tankChartDataSuff', $modal).hide();
        }
        //历史报警信息
        historyAlarmTable('#historyAlarm02', chartCalibrationAlarmList);

        if (_message.Remark === null) $('textarea[name=Remark]', $modal).val('');
        else $('textarea[name=Remark]', $modal).val(_message.Remark);

        $('.block-loading', $modal).hide();
    });
}

//提交验收 - 2
function tankChartSubmittedStatus(_params, _isLayered) {
    var $modal = $('#tankChart-submittedChart');

    if (_isLayered) $modal.addClass('layered-modal');
    else $modal.removeClass('layered-modal');
    //ajaxCall(URL.ChartCalibrationMeta, {"SessionID": SessionID}, function (_message) {
    ajaxCall(URL.ChartCalibrationMeta, '{}', function (_message) {
        var verifyMethodList = _message.VerifyMethodList;

        ajaxCall(URL.TankChartSubmittedStatus, _params, function (_message) {
            console.log(_message);
            var tankChartBirList = _message.TankChartBirList,
                oilInletRangeList = _message.OilInletRangeList,
                deliveryHeight = _message.DeliveryHeight,
                tankChartDataSuff = _message.TankChartDataSuff,
                chartCalibrationAlarmList = _message.ChartCalibrationAlarmList,
                methodHtml = '',
                $verifyMethodList = $('#verifyMethodList');

            if (_message.ResumeCalibrationVisible) $('#btn-resumeCalibration', $modal).show();
            else $('#btn-resumeCalibration', $modal).hide();

            if (_message.DownloadEnable) $('#btn-downloadChart', $modal).removeClass('btn-disabled');
            else $('#btn-downloadChart', $modal).addClass('btn-disabled');

            //验收方法
            for (var i in verifyMethodList) {
                methodHtml = methodHtml + '<li data-value="' + verifyMethodList[i].MethodID + '">' + verifyMethodList[i].DisplayName + '</li>';
            }
            $('.select-con', $verifyMethodList).html(methodHtml);
            NameSpace.Select.firstSelected($verifyMethodList);

            /*$('input[name=verifyDate]', $modal).val(_params['EndDate']);
            $('#verifyPerson').text(_message.VerifyPerson);*/

            $('input[name=BeginDate]', $modal).val(_params['BeginDate']);
            $('input[name=EndDate]', $modal).val(_params['EndDate']);

            $('#TankChartBirList02').show();
            GetTankChartBirTable($('#TankChartBirList02'), tankChartBirList);

            //新旧罐表损益率对比表格
            $('#TankChartBir-get02').off().on('click', function () {
                var subParams = {
                    //"SessionID": SessionID,
                    "NewChartID": _params.NewChartID
                }
                subParams = NameSpace.String.getFormParams('#tankChartBir02-query-form', subParams);
                if (subParams === false) {
                    return false;
                }
                $('#TankChartBirList02').find('tbody').html('<tr class="loading"><td colspan="13">' + getI18n('10801') + '</td></tr>');
                ajaxCall(URL.GetTankChartBir, subParams, function (_message) {
                    console.log(_message);

                    //新旧罐表损溢率对比表格
                    GetTankChartBirTable($('#TankChartBirList02'), _message.TankChartBirList);
                    //新旧罐表损溢率对比图
                    varianceRateChart(_message.TankChartBirList, 'tank-varianceRate-chart02', '#plotLine-text07');
                    //新旧罐表损溢高度对比图
                    avgHeightChart(_message.TankChartBirList, 'tank-avgHeight-chart02', '#plotLine-text08');
                });
            });

            //新旧罐表损溢率对比图
            varianceRateChart(tankChartBirList, 'tank-varianceRate-chart02', '#plotLine-text07');

            //新旧罐表损溢高度对比图
            avgHeightChart(tankChartBirList, 'tank-avgHeight-chart02', '#plotLine-text08');

            //新旧罐表圆滑度图形对比图
            getNewAndOldChart(_params.ChartCalibrationID, 'draw-tank-chart02');

            //进油范围
            oilInletRangeChart('oil-range-chart03', oilInletRangeList);

            //进油详情
            oilDetailChart('oil-detail-chart03', deliveryHeight, '#plotLine-text09');

            if (tankChartDataSuff.IsShow) {
                $('#tankChartDataSuff', $modal).show();
                //校罐数据充足率历史曲线
                dataHistoryChart('tank-dataHistory-chart03', tankChartDataSuff.ACDataSuffHistoryList, '#plotLine-text10');
            } else {
                $('#tankChartDataSuff', $modal).hide();
            }

            //历史报警信息
            historyAlarmTable('#historyAlarm03', chartCalibrationAlarmList);

            if (_message.Remark === null) $('textarea[name=Remark]', $modal).val('');
            else $('textarea[name=Remark]', $modal).val(_message.Remark);

            $('.block-loading',$modal).hide();
        });
    });
}

/*-----------------------数据调取方法----------------------------------*/

//损溢率对比表格
function GetTankChartBirTable(_table, _dataList) {
    _table.dataTable({
        'lengthChange': false,
        'processing': true,
        'searching': false,
        'paging': false,
        'scrollY': 135,
        "scrollCollapse": true,
        'info': false,
        'ordering': false,
        'destroy': true,
        'data': _dataList,
        'columns': [
            {
                'width': '80px',
                'data': 'ShowBirType'
            },
            {
                'width': '150px',
                'data': 'CloseShortDateTime'
            },
            {
                'data': 'Delivery',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'PreProbeHeight',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return _data.toFixed(2);
                }
            },
            {
                'data': 'CloProbeHeight',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return _data.toFixed(2);
                }
            },
            {
                'data': 'PreProbeInventory',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'CloProbeInventory',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'Variance',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'VarianceRate',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return _data.toFixed(2);
                }
            },
            {
                'data': 'EvalBegInventory',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'EvalEndInventory',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'EvalVariance',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return Math.round(_data);
                }
            },
            {
                'data': 'EvalVarianceRate',
                'render': function (_data, _type, _full, _meta) {
                    if (_data === null) return '';
                    else return _data.toFixed(2);
                }
            }

        ],
        'language': {
            'emptyTable': getI18n('15906')
        }
    });
}

var calicationChartOptions = {
    title: {
        align: 'left',
        margin: 50,
        style: {
            color: '#555',
            fontSize: '18px',
            fontFamily: 'Microsoft YaHei'
        }
    },
    subtitle: {
        text: '（%）',
        align: 'left',
        style: {
            color: '#5a9fd7',
            fontSize: '14px',
            fontFamily: 'Microsoft YaHei'
        },
        floating: true,
        y: 35
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        floating: true,
        backgroundColor: '#fff'
    }, 
    lang: {
        noData: getI18n('10803')
    },
    series: [{
        name: getI18n('15005')
    }, {
        name: getI18n('15058')
    }]
};

//新旧罐表损溢率对比图
function varianceRateChart(_data, _box, _plotLine) {
    var tankChartBirListByDate = _data.slice(0);

    //tankChartBirList按时间排序
    for (var i in tankChartBirListByDate) {
        tankChartBirListByDate[i].CloseShortDateTimeStamp = Date.parse(new Date(tankChartBirListByDate[i].CloseShortDateTime)) / 1000;
    }
    tankChartBirListByDate.sort(function (a, b) {
        return a.CloseShortDateTimeStamp - b.CloseShortDateTimeStamp;
    });

    var varianceRateOptions = $.extend(true, {
        chart: {
            renderTo: _box
        },
        title: {
            text: getI18n('15057')
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: getI18n('10012') + '(' + getI18n('01009') + ')'
            },
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%Y-%m-%d', this.value); //Highcharts.dateFormat('%Y/%m/%d %H:%M', this.value);
                }
            }
        },
        yAxis: {
            plotLines: [{
                events: {
                    mouseover: function () {
                        var x = arguments[0].clientX,
                            y = arguments[0].clientY + 10;

                        $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('20028'));
                    },
                    mouseout: function () {
                        $(_plotLine).hide();
                    }
                }
            }, {
                events: {
                    mouseover: function () {
                        var x = arguments[0].clientX,
                            y = arguments[0].clientY + 10;

                        $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('20029'));
                    },
                    mouseout: function () {
                        $(_plotLine).hide();
                    }
                }
            }]
        }
    },rateCommonOptions, calicationChartOptions);

    for (var i in tankChartBirListByDate) {
        var evalVarianceRate = tankChartBirListByDate[i].EvalVarianceRate,
            varianceRate = tankChartBirListByDate[i].VarianceRate;
            temp1 = [],
            temp2 = [],
            tempDate = tankChartBirListByDate[i].CloseDateTime.split(' '),
            date = tempDate[0].split('-'),
            time = tempDate[1].split(':');

        if (evalVarianceRate > 1.5) evalVarianceRate = 1.6;
        if (varianceRate > 1.5) varianceRate = 1.6;

        if (evalVarianceRate < -1.5) evalVarianceRate = -1.6;
        if (varianceRate < -1.5) varianceRate = -1.6;

        temp1.push(Date.UTC(date[0], date[1] - 1, date[2], time[0]));
        temp1.push(evalVarianceRate);
        temp2.push(Date.UTC(date[0], date[1] - 1, date[2], time[0]));
        temp2.push(varianceRate);

        varianceRateOptions.series[0].data.push(temp1);
        varianceRateOptions.series[1].data.push(temp2);
    }
    var chartVarianceRate = new Highcharts.Chart(varianceRateOptions);
}

//新旧罐表损溢高度对比图
function avgHeightChart(_data, _box, _plotLine) {
    var tankChartBirListByHeight = _data.slice(0);

    //tankChartBirList按高度排序
    tankChartBirListByHeight.sort(function (a, b) {
        return a.AvgHeight - b.AvgHeight;
    });

    var avgHeightOptions = $.extend(true, {
        chart: {
            renderTo: _box
        },
        title: {
            text: getI18n('15065')
        },
        xAxis: {
            title: {
                text: getI18n('10006') + getRelatedMeasure('Height')
            },
            labels: {
                y: 10
            },
            categories: [],
            tickInterval: 2
        },
        yAxis: {
            plotLines: [{
                events: {
                    mouseover: function () {
                        var x = arguments[0].clientX,
                            y = arguments[0].clientY + 10;

                        $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('20028'));
                    },
                    mouseout: function () {
                        $(_plotLine).hide();
                    }
                }
            }, {
                events: {
                    mouseover: function () {
                        var x = arguments[0].clientX,
                            y = arguments[0].clientY + 10;

                        $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('20029'));
                    },
                    mouseout: function () {
                        $(_plotLine).hide();
                    }
                }
            }]
        }
    },rateCommonOptions, calicationChartOptions);

    for (var i in tankChartBirListByHeight) {
        var evalVarianceRate = tankChartBirListByHeight[i].EvalVarianceRate,
            varianceRate = tankChartBirListByHeight[i].VarianceRate;

        avgHeightOptions.xAxis.categories.push(tankChartBirListByHeight[i].AvgHeight);

        if (evalVarianceRate > 1.5) evalVarianceRate = 1.6;
        if (varianceRate > 1.5) varianceRate = 1.6;

        if (evalVarianceRate < -1.5) evalVarianceRate = -1.6;
        if (varianceRate < -1.5) varianceRate = -1.6;

        avgHeightOptions.series[0].data.push(evalVarianceRate);
        avgHeightOptions.series[1].data.push(varianceRate);
    }
    var chartAvgHeight = new Highcharts.Chart(avgHeightOptions);
}

//新旧罐表圆滑度图形对比图
function getNewAndOldChart(_ccId, _box) {
    var params = {
        //"SessionID": SessionID,
        "ccId": _ccId
    }
    ajaxCall(URL.GetNewAndOldChartDrawTankChartData, params, function (_message) {
        console.log(_message);
        var drawTankChartData = JSON.parse(_message.DrawTankChartData),
            tankChartShowLegend = JSON.parse(_message.TankChartShowLegend);

        var dataOptions = {
            chart: {
                renderTo: _box,
                type: 'line'
            },
            title: {
                align: 'left',
                margin: 50,
                text: getI18n('15069'),
                style: {
                    color: '#555',
                    fontSize: '18px',
                    fontFamily: 'Microsoft YaHei'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                floating: true,
                backgroundColor: '#fff',
                itemStyle: {
                    fontSize: '14px',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'normal'
                }
            },
            xAxis: {
                //categories: drawTankChartData.xAxis,
                labels: {
                    enabled: false
                },
                tickInterval: 1
            },
            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                }
            },
            tooltip: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [],
            lang: {
                noData: getI18n('10803')
            },
            noData: {
                style: {
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    color: '#6b6b6b'
                }
            }
        };
        var colors = ['#fbb440', '#418cf1'];
        for (var index in drawTankChartData.series) {
            var element = {
                name: getLegendName(drawTankChartData.series[index].chartId),
                color: colors[index],
                stickyTracking: false,
                data: drawTankChartData.series[index].data
            }
            dataOptions.series.push(element);
        }
        var chart = new Highcharts.Chart(dataOptions);
        function getLegendName(_chartId) {
            for (var i in tankChartShowLegend) {
                if (tankChartShowLegend[i].chartId == _chartId) return tankChartShowLegend[i].chartLegend;
            }
        }
    });
}

//进油范围
function oilInletRangeChart(_box, _data) {
    var oilInletRangeOptions = {
        chart: {
            renderTo: _box,
            type: 'column'
        },
        title: {
            align: 'left',
            margin: 50,
            text: getI18n('15059'),
            style: {
                color: '#555',
                fontSize: '18px',
                fontFamily: 'Microsoft YaHei'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function () {
                return this.x + ' : ' + this.y;
            }
        },
        xAxis: {
            categories: [],
            title: {
                align: 'high',
                text: getI18n('15060') + '%',
                style: {
                    color: '#5a9fd7'
                }
            },
            labels: {
                step: 1,
                style: {
                    fontWeight: 'bold'
                }
            },
            tickmarkPlacement: 'on'
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                style: {
                    color: '#333'
                }
            },
            //tickInterval: 12,
            gridLineColor: '#f7f7f7',
            lineWidth: 1,
            lineColor: '#999'
        },
        credits: {
            enabled: false
        },
        series: [{
            name: getI18n('15061'),
            //data: [1,2,3,4,5,6,7,8,8,8,10,11,5,7,7,9,10,12,4,10],
            data: [],
            color: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, Highcharts.Color('#458ef1').setOpacity(0.5).get('rgba')],
                    [1, '#458ef1'] // darken
                ]
            },
            dataLabels: {
                enabled: true,
                formatter: function () {
                    if (this.y == 0) return '';
                    else return this.y + getI18n('01010');
                },
                y: 5,
                style: {
                    color: '#333',
                    fontSize: '12px',
                    fontWeight: 'normal'
                }
            }
        }],
        lang: {
            noData: getI18n('10803')
        },
        noData: {
            style: {
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#6b6b6b'
            }
        }
    };
    for (var per = 5; per <= 100; per = per + 5) {
        oilInletRangeOptions.xAxis.categories.push(per);
        oilInletRangeOptions.series[0].data.push(oilRange_match(per));
    }
    function oilRange_match(_per) {
        for (var i in _data) {
            if (_per == _data[i].Per) {
                return _data[i].Num;
            }
        }
        return 0;
    }
    var chartRange = new Highcharts.Chart(oilInletRangeOptions),
        maxy = chartRange.yAxis[0].max,
        tickInterval = parseInt(maxy / 5);

    chartRange.yAxis[0].update({
        tickInterval: tickInterval
    });
}

//进油详情
function oilDetailChart(_box, _data, _plotLine) {
    var oilDetailOptions = {
        chart: {
            type: 'column',
            renderTo: _box
        },
        title: {
            align: 'left',
            margin: 50,
            text: getI18n('15062'),
            style: {
                color: '#555',
                fontSize: '18px',
                fontFamily: 'Microsoft YaHei'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            backgroundColor: '#fff',
            itemStyle: {
                fontSize: '14px',
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'normal'
            }
        },
        tooltip: {
            //headerFormat: '{series.name}高度: {point.y}<br/>时间:<span style="font-size: 10px">{point.key}</span><br/>',
            //pointFormat: '',
            headerFormat: '',
            pointFormat: '{series.name}' + getI18n('10006') + ': {point.y}<br/>',
            footerFormat: getI18n('10012') + ':<span style="font-size: 10px">{point.key}</span><br/>',
            /*formatter: function(){
            return this.series.name + '高度：' + this.y + '时间:' + this.x
            },*/
            valueDecimals: 2
        },
        xAxis: {
            categories: [],
            title: {
                align: 'high',
                text: getI18n('10012'),
                style: {
                    color: '#5a9fd7'
                }
            },
            tickInterval: 5
        },
        yAxis: {
            title: {
                text: getI18n('15063') + '（㎜）',
                align: 'high',
                rotation: 0,
                offset: -50,
                y: -35,
                style: {
                    color: '#5a9fd7',
                    fontSize: '14px',
                    fontFamily: 'Microsoft YaHei'
                }
            },
            labels: {
                style: {
                    color: '#333'
                }
            },
            tickInterval: 200,
            gridLineColor: '#f7f7f7',
            lineWidth: 1,
            lineColor: '#999'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        series: [{
            name: getI18n('10051'),
            color: '#fbb440',
            data: []
        }, {
            name: getI18n('15064'),
            color: '#418cf1',
            data: []
        }],
        lang: {
            noData: getI18n('10803')
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#6b6b6b'
            }
        }
    };
    for (var i in _data.DeliveryInfoList) {
        var time = _data.DeliveryInfoList[i].EndDateTime.split(' ')[0];

        oilDetailOptions.xAxis.categories.push(time);
        oilDetailOptions.series[0].data.push(_data.DeliveryInfoList[i].EndHeight);
        oilDetailOptions.series[1].data.push(_data.DeliveryInfoList[i].StartHeight);
    }
    var chartDetail = new Highcharts.Chart(oilDetailOptions);
    chartDetail.yAxis[0].addPlotLine({
        label: {
            text: parseInt(_data.Bottom),
            y: -10
        },
        color: 'blue',
        dashStyle: 'longdashdot',
        value: _data.Bottom,
        width: 2,
        zIndex: 3,
        events: {
            mouseover: function () {
                var x = arguments[0].clientX,
                    y = arguments[0].clientY + 10;

                $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('20029'));
            },
            mouseout: function () {
                $(_plotLine).hide();
            }
        }
    });
    chartDetail.yAxis[0].addPlotLine({
        label: {
            text: parseInt(_data.Top),
            y: -10
        },
        color: 'red',
        dashStyle: 'longdashdot',
        value: _data.Top,
        width: 2,
        zIndex: 3,
        events: {
            mouseover: function () {
                var x = arguments[0].clientX,
                    y = arguments[0].clientY + 10;

                $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('20028'));
            },
            mouseout: function () {
                $(_plotLine).hide();
            }
        }
    });

    if (chartDetail.yAxis[0].max < _data.Top) {
        chartDetail.yAxis[0].update({
            max: _data.Top
        });
    }
}

//校罐数据充足率
function dataRateChart(_box, _data) {
    var dataRateOptions = {
        chart: {
            type: 'column',
            renderTo: _box
        },
        title: {
            align: 'left',
            margin: 50,
            text: getI18n('15068'),
            style: {
                color: '#555',
                fontSize: '18px',
                fontFamily: 'Microsoft YaHei'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function () {
                return this.x + ' : ' + this.y;
            }
        },
        xAxis: {
            categories: [],
            title: {
                align: 'high',
                text: getI18n('15060') + '%',
                style: {
                    color: '#5a9fd7'
                }
            },
            reversed: true,
            labels: {
                y: 20,
                rotation: 0,
                style: {
                    fontSize: '10px'
                }
            },
            tickmarkPlacement: 'on'
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                style: {
                    color: '#333'
                }
            },
            gridLineColor: '#f7f7f7',
            lineWidth: 1,
            lineColor: '#999'
        },
        credits: {
            enabled: false
        },
        series: [{
            name: getI18n('15061'),
            data: [],
            color: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, Highcharts.Color('#458ef1').setOpacity(0.5).get('rgba')],
                    [1, '#458ef1'] // darken
                ]
            },
            dataLabels: {
                enabled: true,
                formatter: function () {
                    if (this.y == 0) return '';
                    else return this.y + getI18n('01010');
                },
                y: 5,
                style: {
                    color: '#333',
                    fontSize: '12px',
                    fontWeight: 'normal'
                }
            }
        }],
        lang: {
            noData: getI18n('10803')
        },
        noData: {
            style: {
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#6b6b6b'
            }
        }
    };
    for (var i in _data) {
        dataRateOptions.xAxis.categories.push(_data[i].HeightSrc);
        dataRateOptions.series[0].data.push(_data[i].CountsInBin);
    }
    var chartRate = new Highcharts.Chart(dataRateOptions);
}

//表格数据
function dataRateTable(_box, _data) {
    var dataHtml = '',
        $dateRable = $(_box);

    if (_data) {
        if (_data.length == 0) {
            dataHtml = '<tr class="empty"><td colspan="4">' + getI18n('10803') + '</td></tr>';
        } else {
            for (var index in _data) {
                var stuffList = [
                    _data[index].CurSuff,
                    _data[index].ReqSuff,
                    _data[index].DaysLeft,
                    _data[index].ImproveAct
                ];
                if (index % 2 == 0) dataHtml = dataHtml + '<tr class="odd">';
                else dataHtml = dataHtml + '<tr class="even">';

                for (var i in stuffList) {
                    dataHtml = dataHtml + '<td>' + stuffList[i] + '</td>';
                }
                dataHtml = dataHtml + '</tr>';
            }
        }
    } else {
        dataHtml = '<tr class="empty"><td colspan="4">' + getI18n('10803') + '</td></tr>';
    }

    $dateRable.find('tbody').html(dataHtml);
}

//校罐数据充足率历史曲线
function dataHistoryChart(_box, _data, _plotLine) {
    var aCDataSuffHistoryList = _data;
    if (aCDataSuffHistoryList.length) {
        suffHistoryLength = aCDataSuffHistoryList.length,
        interval = Math.floor(aCDataSuffHistoryList[suffHistoryLength - 1].ChartID / 4);
    } else {
        interval = 1;
    }

    var series = [];
    for (var i in aCDataSuffHistoryList) {
        var temp = [];
        temp.push(aCDataSuffHistoryList[i].ChartID);
        temp.push(aCDataSuffHistoryList[i].CurSuff);
        series.push(temp);
    }
    var dataHistoryOptions = {
        chart: {
            type: 'line',
            renderTo: _box
        },
        title: {
            align: 'left',
            margin: 50,
            text: getI18n('15066'),
            style: {
                color: '#555',
                fontSize: '18px',
                fontFamily: 'Microsoft YaHei'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function () {
                var date = dateMatch(this.x, true);
                return date + ' : <b>' + this.y + '</b>';
            }
        },
        xAxis: {
            title: {
                text: getI18n('10012'),
                style: {
                    color: '#5a9fd7'
                }
            },
            //categories: categories,
            labels: {
                y: 25,
                formatter: function () {
                    return dateMatch(this.value, false);
                }
            },
            tickInterval: interval
        },
        yAxis: {
            title: {
                text: getI18n('20030') + '%',
                align: 'high',
                rotation: 0,
                offset: -10,
                y: -35,
                style: {
                    color: '#5a9fd7',
                    fontSize: '14px',
                    fontFamily: 'Microsoft YaHei'
                }
            },
            labels: {
                style: {
                    color: '#333'
                }
            },
            plotLines: [{
                label: {
                    text: 60,
                    y: -10
                },
                color: 'red',
                dashStyle: 'longdashdot',
                value: 60,
                width: 2,
                zIndex: 3,
                events: {
                    mouseover: function () {
                        var x = arguments[0].clientX,
                        y = arguments[0].clientY + 10;

                        $(_plotLine).show().css({ 'left': x, 'top': y }).text(getI18n('15067'));
                    },
                    mouseout: function () {
                        $(_plotLine).hide();
                    }
                }
            }],
            endOnTick: false,
            min: 0,
            max: 101,
            gridLineColor: '#f7f7f7',
            lineWidth: 1,
            lineColor: '#999'
        },
        credits: {
            enabled: false
        },
        series: [{
            color: '#418cf1',
            stickyTracking: false,
            data: series
        }],
        lang: {
            noData: getI18n('10803')
        },
        noData: {
            style: {
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#6b6b6b'
            }
        }
    };
    function dateMatch(_value, _isFull) {
        for (var i in aCDataSuffHistoryList) {
            if (_value == aCDataSuffHistoryList[i].ChartID) {
                if (_isFull) {
                    return aCDataSuffHistoryList[i].ReportDate;
                } else {
                    return aCDataSuffHistoryList[i].ReportDate.split(' ')[0];
                }
            }
        }
    }
    var chartHistory = new Highcharts.Chart(dataHistoryOptions);
}

//历史报警信息
function historyAlarmTable(_box, _dataList) {
    $(_box).dataTable({
        'lengthChange': false,
        'processing': true,
        'searching': false,
        'paging': false,
        'scrollY': 140,
        "scrollCollapse": true,
        'info': false,
        'ordering': false,
        'destroy': true,
        'data': _dataList,
        'columns': [
            {
                'width': '150px',
                'data': 'AlarmDateTime',
                'render': function (_data, _type, _full, _meta) {
                    if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                    else return '';
                }
            },
            {
                'data': 'AlarmTypeName'
            },
            {
                'width': '250px',
                'data': 'AlarmDescription'
            },
            {
                'data': 'AlarmStateName'
            },
            {
                'data': 'AlarmSeverity'
            },
            {
                'data': 'AlarmRemark'
            },
            {
                'width': '90px',
                'data': 'AlarmHandlePeople'
            },
            {
                'width': '150px',
                'data': 'AlarmHandleDateTime',
                'render': function (_data, _type, _full, _meta) {
                    if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                    else return '';
                }
            }
        ],
        'language': {
            'emptyTable': getI18n('15907')
        }
    });
}