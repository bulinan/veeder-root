$(function () {
    var cid = stateman.current.param['cid'];

    //鹤位历史维护
    (function () {
        //init
        var params = {
            //"SessionID": SessionID,
            "CompanyID": cid
        }
        ajaxCall(URL.QueryLastDpCalibrationRecord, params, function (_message) {
            console.log(_message);
            init_depotHistory(_message.DepotPositionList);
        });
    })();

    //查询
    (function () {
        $('.inner').on('click', '#depot-query', function () {
            var params = {
                //"SessionID": SessionID,
                "CompanyID": cid
            }
            params = NameSpace.String.getFormParams('#depot-history-form', params);
            if (params === false) {
                return false;
            }
            $('#depotPositionHistory').find('tbody').html('<tr class="loading"><td colspan="9">'+getI18n('10801')+'</td></tr>');
            ajaxCall(URL.QueryDpCalibrationRecord, params, function (_message) {
                console.log(_message);
                init_depotHistory(_message.DepotPositionList);
            });
        });
    })();

    //鹤位历史维护表格初始化
    function init_depotHistory(_depotPositionList) {
        $('#depotPositionHistory').show().dataTable({
            'lengthChange': [10, 20, 50, 75, 100],
            'processing': true,
            'info': false,
            'searching': false, //searching
            'paging': false,
            'ordering': false,
            'destroy': true,
            'data': _depotPositionList,
            "drawCallback": function(settings) {
                var api = this.api();
                var rows = api.rows({
                    page: 'current'
                }).nodes();
                var last = null;
 
                api.column(0, {
                    page: 'current'
                }).data().each(function(group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before('<tr class="group"><td colspan="9">' + group + '</td></tr>');
 
                        last = group;
                    }
                });
            },
            'columns': [
                {
                    'data': 'spShortName',
                    'visible': false
                },
                {
                    'data': 'dpDes'
                },
                {
                    'width': '80px',
                    'data': 'otShortName'
                },
                {
                    'data': 'meterType'
                },
                {
                    'data': 'meterModel'
                },
                {
                    'data': 'manufactureNum'
                },
                {
                    'data': 'accuracy',
                    'width': '140px',
                    'render': function (_data, _type, _full) {
                        if (_data === null) return '';
                        else return _data.toFixed(2);
                    }
                },
                {
                    'data': 'variant',
                    'width': '140px',
                    'render': function (_data, _type, _full) {
                        if (_data === null) return '';
                        else return _data.toFixed(2);
                    }
                },
                {
                    'data': 'calibrationDate',
                    'width': '170px',
                    'render': function (_data, _type, _full) {
                        if (_data) return '<span class="date">' + _data.split(' ')[0] + '</span><span class="time">' + _data.split(' ')[1] + '</span>';
                        else return '';
                    }
                },
                {
                    'data': 'certificateNum'
                }
            ],
            'language': {
                'emptyTable': getI18n('18902')
            }
        });

        //鹤位数
        var count = _depotPositionList.length,
            up2 = 0,
            below2 = 0;

        for (var i in _depotPositionList) {
            if (_depotPositionList[i].variant != null) {
                if (_depotPositionList[i].variant > 0.2) up2++;
                else below2++;
            }
        }
        var data = {
            'count': count,
            'below2': below2,
            'up2': up2
        }
        $('body').find('.irregular-group-list input[name]').each(function () {
            var name = $(this).attr('name');
            $(this).val(data[name]);
        });
    }
});