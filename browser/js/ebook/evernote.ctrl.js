/**
 * Created by alex.kozovski on 9/10/15.
 */
app.controller('EvernoteCtrl',function($scope, EvernoteFactory, $stateParams) {

    //$scope.getEvernote = function () {
    //    EvernoteFactory.authEvernote();
    //};

    EvernoteFactory.getNotebooks().then(function (data) {
        //console.log(data)
        $scope.notebooks = data;
    });


    $scope.findNotes = function(id) {
        EvernoteFactory.getNotes(id).then(function(notes){
            $scope.notes = notes;
        })
    };
});