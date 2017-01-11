module.exports = function ($container) {
    jQuery($container).each(exerciseLoader);
};

function exerciseLoader(id, $container) {

    var currentExercise = 0;

    $container = jQuery($container);
    var multiExercise = !!$container.data('multiExercise');
    var incrementalExercise = $container.data('incrementalExercise');

    if (incrementalExercise) {
        incrementalExercise = incrementalExercise.split(';').map(function (groups) {
            return parseInt(groups, 10);
        });

        for (var i = 1; i < incrementalExercise.length; i++) {
            jQuery($container).find('.elem').each(function (index, elem) {
                getInputsOfElemForGroup(jQuery(elem), i).hide();
            });
        }
    }

    var $send = $container.find('.send');
    $send.on('click', onSend);

    var $elements = $container.find('table .elem');

    $elements.on('click', onLineClick);

    //prevent double click
    $elements.find('input').on('change', function () {
        jQuery(this).prop('checked', !jQuery(this).prop('checked'));
    });

    if (incrementalExercise || multiExercise) {
        nextExercise();
    }

    function onSend(event) {
        event.preventDefault();
        $elements.each(checkElem);
        checkTotalResult();
    }

    function onLineClick(event) {
        var $this = jQuery(this);
        var $input = $this.find('input:enabled').first();
        var checked = $input.prop('checked');
        $input.prop('checked', !checked);
    }

    function checkElem(id, $elem) {
        $elem = jQuery($elem);
        var $input = getInputsOfElemForGroup($elem, getCurrentGroup(currentExercise));
        var currentState = !!$input.prop('checked');
        var correctState =
            $input.prop('disabled') ||
            $input.data('correctState') === true ||
            $input.data('correctState') === currentExercise;

        setState($elem, currentState === correctState);
        $elem.removeClass('correctChecked wrongChecked');

        if (currentState) {

            // Angekreuzt richtig grüner Haken dahinter und Sperren
            if (currentState === correctState) {
                $input.attr('disabled', true);
                $elem.addClass('correctChecked');
            } else {
                $input.prop('checked', false);
                $elem.addClass('wrongChecked');
            }
        }
    }

    function getInputsOfElemForGroup($elem, groupId) {
        return jQuery($elem.find('.check').get(groupId)).children('input');
    }

    function setState($elem, correct) {
        $elem.toggleClass('wrong', !correct);
    }


    function checkTotalResult() {

        var errors = $elements.filter('.wrong').length;

        //solved correctly
        if (errors) {
            showBadResult();
            return;
        }
        showGoodResult();
    }

    function getCurrentGroup(currentExercise) {
        if (!incrementalExercise) {
            return 0;
        }
        return incrementalExercise.findIndex(function (value) {
            return currentExercise < value;
        });
    }

    function updateProgress() {
        var length = $container.find('.tableHead > span.exercise').length;
        $container.find('.exerciseProgress').html(Math.min(currentExercise + 1, length) + '  / ' + length);
    }

    function nextExercise() {
        var exercises = $container.find('.tableHead > span.exercise');

        //update progress
        updateProgress(currentExercise);

        if (currentExercise < exercises.length) {
            exercises.hide();

            if (incrementalExercise) {
                $container.find('.elem').each(function (index, elem) {
                    getInputsOfElemForGroup(jQuery(elem), getCurrentGroup(currentExercise)).show();
                    getInputsOfElemForGroup(jQuery(elem), getCurrentGroup(currentExercise)).attr('disabled', false);
                    getInputsOfElemForGroup(jQuery(elem), getCurrentGroup(currentExercise)).filter(':checked').attr('disabled', true);
                    for (var i = 0; i < getCurrentGroup(currentExercise); i++) {
                        getInputsOfElemForGroup(jQuery(elem), i).attr('disabled', true);
                    }
                });


            } else if (multiExercise) {
                $container.find('input').attr('checked', false);
            }

            $(exercises.get(currentExercise)).show();
            return true;
        }
        return false;
    }

    function finishedExercise() {
        $container.find('a.send').hide();
        $container.find('input').attr('disabled', true);
    }

    function showGoodResult() {

        var $table = $container.find('table');
        var $goodOverlay = jQuery('<div class="resultOverlay correct">' +
            '<div class="waiter"></div>' +
            '<div class="cup"></div>' +
            '<div class="smoke"></div>' +
            '</div>')
            .on('click', function () {
                var anotherExercise;
                if (incrementalExercise || multiExercise) {
                    currentExercise++;
                    anotherExercise = nextExercise();
                }

                if (!anotherExercise) {
                    finishedExercise();
                }
                $goodOverlay.remove();
            })
            .css({
                height: ($table.height()) + 'px'
            })
            .appendTo($container);
    }

    function showBadResult() {

        var $table = $container.find('table');
        var $badOverlay = jQuery('<div class="resultOverlay wrong">' +
            '<div class="waiter"></div>' +
            '</div>')
            .on('click', function () {
                $badOverlay.remove();
            })
            .css({
                height: ($table.height()) + 'px'
            })
            .appendTo($container);
    }
}