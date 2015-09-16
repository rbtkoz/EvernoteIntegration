/**
 * Created by alexanderkozovski on 9/16/15.
 */
app.directive('myNotes', function () {

    return {
        restrict: 'E',
        templateUrl: "js/mynotes/mynotes.html",
        replace: true,
        transclude: false,
        scope: {
            aCard: '=mynote'
        }
    };



});