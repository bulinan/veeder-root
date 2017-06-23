$(function () {
    var leakManagementPage = 'static';
    var SLD_CSLD_Date_State = new Array(4);;
    (function () {
        leakMangementPageShowHide("leak-tab-static", 'static-leak-link');

        //load sensor page
        $.get('leakSensorOverview.html', function (data) {
            $(".leak-tab-sensor").html(data);
        });

        leakTabLinkInit();

        leakDataBtnClickInit();

        dateInit();

    })();

    function dateInit() {
        commonDate();
        var tempBeginDate = $('#CSLD-SLD-page input[name=BeginDate]').val();
        var tempEndDate = $('#CSLD-SLD-page input[name=EndDate]').val();
        SLD_CSLD_Date_State[0] = tempBeginDate;
        SLD_CSLD_Date_State[1] = tempEndDate;
        SLD_CSLD_Date_State[2] = tempBeginDate;
        SLD_CSLD_Date_State[3] = tempEndDate;
    }

    function tabChangeToSaveResetDateState() {

        var tempBeginDate = $('#CSLD-SLD-page input[name=BeginDate]').val();
        var tempEndDate = $('#CSLD-SLD-page input[name=EndDate]').val();

        if (leakManagementPage === 'static') {
            $('#CSLD-SLD-page input[name=BeginDate]').val(SLD_CSLD_Date_State[0]);
            $('#CSLD-SLD-page input[name=EndDate]').val(SLD_CSLD_Date_State[1]);
            SLD_CSLD_Date_State[2] = tempBeginDate;
            SLD_CSLD_Date_State[3] = tempEndDate;
        } else if (leakManagementPage === 'dynamic') {
            $('#CSLD-SLD-page input[name=BeginDate]').val(SLD_CSLD_Date_State[2]);
            $('#CSLD-SLD-page input[name=EndDate]').val(SLD_CSLD_Date_State[3]);
            SLD_CSLD_Date_State[0] = tempBeginDate;
            SLD_CSLD_Date_State[1] = tempEndDate;
        }
    }

    function leakMangementPageShowHide(leakId, leakLinkId) {
        $(".leak-tab-static").hide();
        $(".leak-tab-dynamic").hide();
        $(".leak-tab-sensor").hide();

        $("#static-leak-link").removeClass("text-active");
        $("#dynamic-leak-link").removeClass("text-active");
        $("#sensor-leak-link").removeClass("text-active");

        $("." + leakId).show();
        $("#" + leakLinkId).addClass("text-active");

        if (sensorTimer) {
            clearInterval(sensorTimer);
        }
    }

    function leakTabLinkInit() {

        $('#static-leak-link').on('click', function () {
            leakMangementPageShowHide("leak-tab-static", 'static-leak-link');
            leakManagementPage = 'static';
            tabChangeToSaveResetDateState();
            $('#CSLD-SLD-page').show()
            return false;
        });

        $('#dynamic-leak-link').on('click', function () {
            leakMangementPageShowHide("leak-tab-dynamic", 'dynamic-leak-link');
            leakManagementPage = 'dynamic';
            tabChangeToSaveResetDateState();
            $('#CSLD-SLD-page').show();
            return false;
        });
        $('#sensor-leak-link').on('click', function () {
            leakMangementPageShowHide("leak-tab-sensor", 'sensor-leak-link');
            leakManagementPage = 'sensor';
            $('#CSLD-SLD-page').hide();
            sensorTimer = setInterval(sensorPageInit, leakSensorInterval);
            return false;
        });

    }

    function leakDataBtnClickInit() {
        $('#leak-query').on('click', function () {
            if (leakManagementPage === 'static') {
                leakStaticSearchBtn();
            }
            else if (leakManagementPage === 'dynamic') {
                leakDynamicSearchBtn();
            }
        });

        $('#modal-leak').on('click', function () {
            if (leakManagementPage === 'static') {
                modalLeakStaticBtn();
            }
            else if (leakManagementPage === 'dynamic') {
                modalLeakDynamicBtn();
            }
        });
    }

});