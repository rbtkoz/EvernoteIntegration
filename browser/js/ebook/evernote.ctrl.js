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
        console.log($scope.notes.guid, "notesguid");


        EvernoteFactory.updateNote($scope.notes.guid, $scope.notes.title, searchText).then(function(note){

            note.note = reXML(note.note);
            $scope.notes =note;

            console.log(note, "synctext");
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
            //console.log(notes);

            notes.note = reXML(notes.note);
            $scope.notes =notes;
        })
    };

    function reXML(data){

        var xmlmatch = /<en-note>([^<]+?)<\/en-note>/igm;

        var parsed =xmlmatch.exec(data);
        console.log(parsed);
        return parsed[1];
    };




});