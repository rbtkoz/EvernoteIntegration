/**
 * Created by alexanderkozovski on 9/13/15.
 */
app.directive('ngGetSelection', function ($timeout) {
    var text = '';

    function getSelectedText() {
        var text = "";
        if (typeof window.getSelection != "undefined") {
            text = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    return {
        restrict: 'A',
        scope: {
            ngGetSelection: '='
        },
        link: function (scope, element, attrs) {

            $timeout(function getSelection() {
                var newText = getSelectedText();


                if (text != newText) {
                    text = newText;
                    element.val(newText);
                    scope.ngGetSelection = newText;

                    //attrs.$observe('ngGetSelection', function (value) {
                    //    if (value) {
                    //        console.log(value, "value directice");
                    //        // pass value to app controller
                    //        scope.variable = value;
                    //    }
                    //});


                }

                $timeout(getSelection, 50);
            }, 50);

        }
    };
});
