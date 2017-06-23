$(function () {
    var pageParam = stateman.current.param;

    var params = {
        //'SessionID': SessionID,
        'MethodType': pageParam.MethodType,
        'ChartID': pageParam.chartID
    };
    console.log(pageParam);
    if (pageParam['page'] == 'modalDialog') {
        var title = '20017';
        tankChartView(params, title, '', '');
    } else if (pageParam['page'] == 'innerDialog') {
        var title1 = pageParam['title1'],
            title2 = pageParam['title2'],
            title3 = pageParam['title3'];

        tankChartView(params, title1, title2, title3);
    }
});