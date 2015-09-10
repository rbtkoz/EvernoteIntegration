/**
 * Created by alex.kozovski on 9/10/15.
 */
app.controller('EvernoteCtrl',function($scope, EvernoteFactory, $stateParams){

    $scope.getEvernote = function(){
        EvernoteFactory.getNote();
    }
});