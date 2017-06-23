$(function () {
    var params = {
        //"SessionID" : SessionID,
        "CompanyID": $.cookie('SessionPer'),
        "ReportType": stateman['current']['param']['type']
    }

    ajaxCall(URL.GetCompanyReportUrl, params, function (_message) {
        console.log(_message);
        $('#companyReport').attr('src', _message.ReportUrl);

        $("body").css("overflow-y", "hidden");
        $('#companyReport').attr('height', Math.max(($(window).height() - 50), 300));

        window.onresize = function () {
            var height = Math.max(($(window).height() - 50), 300);
            if (height <= 300) {
                $("body").css("overflow-y", "auto");
            } else {
                if ($("body").css("overflow-y") === "auto") {
                    $("body").scrollTop(0);
                }
                $("body").css("overflow-y", "hidden");
            }
            $('#companyReport').attr('height', height);
        }
    });
});