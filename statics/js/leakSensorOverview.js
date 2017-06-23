var leakSensorInterval = 300000; //5 min
$(function () { 
    (function () {

        sensorPageInit();
        $(".sensor-nodata-block").hide();
        $('#leak-sensor-overview-update').on('click', function () {
            $(".sensor-nodata-block").hide();
            $('.leak-tab-sensor .block-loading').show();
            sensorPageInit();
            return false;
        }); 
        language_init(); 
    })();
});

function sensorPageInit() {

    var deviceArr = [
       { 'ddKey': 0, 'ddValue': 'No Device (cell de-assignment)', 'imgName': '' },
       { 'ddKey': 12, 'ddValue': 'Type-B (3-Wire CL) Sensor', 'imgName': '3-wire' },
       { 'ddKey': 2, 'ddValue': 'Tank', 'imgName': '' },
       { 'ddKey': 3, 'ddValue': 'Liquid Sensor', 'imgName': 'liquid' },
       { 'ddKey': 4, 'ddValue': 'Vapor Sensor', 'imgName': 'vapor' },
       { 'ddKey': 59, 'ddValue': 'MAG Sensor', 'imgName': 'mag' },
       { 'ddKey': 63, 'ddValue': 'Line Pressure Sensor ', 'imgName': 'plld' },
       { 'ddKey': 7, 'ddValue': 'Ground Water Sensor', 'imgName': 'groundwater' },
       { 'ddKey': 8, 'ddValue': 'Type-A (2-Wire CL) Sensor', 'imgName': '2-wire' }
    ];

    var StationID = stateman.current.param['sid'];
    var params = {
        //"SessionID": SessionID,
        "StationID": StationID
    },
    $box = $('.station #leak-sensor-overview-block');

    ajaxCall(URL.SelectSensorOverview, params, function (_message) {

        var objList = { "SensorOverview": jQuery.parseJSON(_message.SensorOverview) },
            html = $('#sensor-tpl').html(),
            tempList = [],
            template = Handlebars.compile(html);
        if (objList != null && objList.SensorOverview.length > 0) {
            $("#sensor-list-update-time").html(objList.SensorOverview[0].StatusTime);
            $(".sensor-nodata-block").hide();
        }else
        {
            $(".sensor-nodata-block").show();
        }
        Handlebars.registerHelper('ishasimagedisplay', function (_data) {
            var deviceId = _data.DeviceTypeId,
                deviceItem = [];

            /*deviceItem = deviceArr.filter(function (item) {
            return item.ddKey === deviceId
            });*/
            for (var i = 0; i < deviceArr.length; i++) {
                if (deviceArr[i].ddKey == deviceId) {
                    deviceItem.push(deviceArr[i]);
                }
            }

            if (deviceItem && deviceItem.length > 0 && deviceItem[0].imgName != "") {
                return " display:block";
            }
            return " display:none";
        });

        Handlebars.registerHelper('imageName', function (_data) {
            var imageName = '',
                deviceId = _data.DeviceTypeId,
                statusId = _data.StatusId,
                deviceItem = [];

            /*deviceItem = deviceArr.filter(function (item) {
            return item.ddKey === deviceId
            });*/
            for (var i = 0; i < deviceArr.length; i++) {
                if (deviceArr[i].ddKey == deviceId) deviceItem.push(deviceArr[i]);
            }
            if (deviceItem && deviceItem.length > 0) {
                imageName = deviceItem[0].imgName;
            }
            if (statusId === 3) {
                imageName = imageName + '_grey'
            }
            if (imageName != "") {
                imageName = imageName + '.jpg';
            }
            return imageName;
        });

        $box.html("");
        $box.append(template(objList));
        language_init();
        $('.leak-tab-sensor .block-loading').hide();
    });
}