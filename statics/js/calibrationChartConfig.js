var rateCommonOptions = {
    chart: {
        type: 'scatter',
        zoomType: 'xy'
    },
    legend: {
        itemStyle: {
            fontSize: '14px',
            fontFamily: 'Microsoft YaHei',
            fontWeight: 'normal'
        }
    },
    xAxis: {
        title: {
            style: {
                color: '#5a9fd7'
            }
        },
        labels: {
            rotation: 270
        }
    },
    tooltip: {
        enabled: false
    },
    yAxis: {
        title: {
            text: null
        },
        labels: {
            style: {
                color: '#333'
            }
        },
        max: 1.8,
        min: -1.8,
        tickInterval: 0.3,
        showFirstLabel: false,
        showLastLabel: false,
        plotLines: [{
            label: {
                text: 0.3,
                y: -5
            },
            color: 'red',
            dashStyle: 'solid',
            value: 0.3,
            width: 1,
            zIndex: 6
        }, {
            label: {
                text: -0.3,
                y: -5
            },
            color: 'red',
            dashStyle: 'solid',
            value: -0.3,
            width: 1,
            zIndex: 6
        }],
        gridLineColor: '#f7f7f7',
        lineWidth: 1,
        lineColor: '#999'
    },
    credits: {
        enabled: false
    },
    series: [{
        color: '#fbb440',
        stickyTracking: false,
        data: []
    }, {
        color: '#418cf1',
        stickyTracking: false,
        data: []
    }],
    noData: {
        style: {
            fontFamily: 'Microsoft YaHei',
            fontWeight: 'bold',
            fontSize: '20px',
            color: '#6b6b6b'
        }
    }
};