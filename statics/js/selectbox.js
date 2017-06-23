$('body').delegate('.select-box .select-con li', 'click', function (_e) {
    var selector = $(this).closest('.select-box');

    if (!selector.hasClass('drop-down')) {
        var value = $(this).attr('data-value'),
            $con = $(this).closest('.select-box').find('.select-title'),
		    $text = $(this).text();

        if(selector.attr('data-type') !='drop-down'){
            $con.attr('data-value', value).find('span').html($text);
            $con.attr('data-value', value).find('input').val($text);
        }
        $(this).parent().hide();
        $(this).closest('.select-box').attr('data-open', false);
        if (selector.hasClass('select-callback')) {
            var action_name = selector.attr('class').split(' ')[1];
            eval('NameSpace.Select.' + action_name + '($(this), selector)');
        }
    }
});
$('body').delegate('.select-box .select-title', 'click', function () {
    var $self = $(this),
        $selectBox = $('.select-box');

    if (!$(this).closest('.select-box').hasClass('disabled')) {
        var isOpen = $(this).parent().attr('data-open');
        if (isOpen == 'false') {
            $selectBox.attr('data-open', false).find('.select-con').hide();
            $(this).parent().attr('data-open', true);
            $(this).next().show();
        } else {
            $(this).next().hide();
            $(this).parent().attr('data-open', false);
        }
    }
});
$('body').delegate('.select-input .icon', 'click', function () {
    var $self = $(this),
        $parent = $(this).closest('.select-box'),
        $selectBox = $('.select-box');

    if (!$parent.hasClass('disabled')) {
        var isOpen = $parent.attr('data-open');
        if (isOpen == 'false') {
            $selectBox.attr('data-open', false).find('.select-con').hide();
            $parent.attr('data-open', true);
            $parent.find('.select-con').show();
        } else {
            $parent.find('.select-con').hide();
            $parent.attr('data-open', false);
        }
    }
});

