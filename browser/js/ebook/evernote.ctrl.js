/**
 * Created by alex.kozovski on 9/10/15.
 */

var hello =window.getSelection().toString();
console.log(hello);

app.controller('EvernoteCtrl',function($scope, EvernoteFactory,AuthService, AUTH_EVENTS,$rootScope,$stateParams) {
    //$scope.getEvernote = function () {
    //    EvernoteFactory.authEvernote();
    //};

    EvernoteFactory.getNotebooks().then(function (data) {
        //console.log(data)
        $scope.notebooks = data;
    });
    console.log($rootScope);
    console.log(AUTH_EVENTS);
    console.log(AuthService)
    $scope.user = null;
    $scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
    };

    $scope.check = 0;

    $scope.checkFn = function ($index) {
        $scope.check = $index;
    };

    $scope.syncText = function (searchText) {
        EvernoteFactory.updateNote($scope.notes.guid, $scope.notes.title, searchText).then(function(note){
            $scope.notes =note;
        });
        //console.log(searchText);
        //console.log($scope.check);
        //console.log($scope.notes.guid);
    };

    //$scope.$watch('variable', function (value) {
    //    if (value) {
    //        console.log(value,"controller");
    //    }
    //});

    $scope.findNotes = function(id) {

        EvernoteFactory.getNotes(id).then(function(notes){
            console.log(notes);
            $scope.notes = notes;
        })
    };




});