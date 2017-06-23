$(function () {
    var StationID = stateman.current.param['sid'];

    //手动刷新报警信息
    (function () {
        $('.station').on('click', '#alarm-summary-refresh', function () {
            /*
            var params = {
            //"SessionID": SessionID,
            "LastRequestTime": NameSpace.Date.getCurDateTime('YYYY-mm-dd hh:mm:ss'),
            "StationID": StationID,
            "Refresh": true
            }
            stationAlarmInfo(params, StationID);
            */
            var params = {
                "StationID": StationID
            }
            ajaxCall(URL.RefreshAtgTankInventory, params, function (_message) {
                if (_message.Result == 'Success') {
                    alert(_message.Description);
                    if (stateman.current.currentName == 'StationDashboard') {
                        stateman.go('Station.StationDashboard', {param: {sid: StationID}});
                    } else {
                        top.location.href = '#/Station?sid=' + StationID;
                    }

                } else {
                    alert(_message.Description);
                }
            });
        });
    })();
});