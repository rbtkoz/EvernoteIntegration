/**
 * Created by alex.kozovski on 9/10/15.
 */

app.controller('EvernoteCtrl',function($scope, EvernoteFactory,AuthService, AUTH_EVENTS,$rootScope,$stateParams) {
    //$scope.getEvernote = function () {
    //    EvernoteFactory.authEvernote();
    //};

    //gets triggered to populate notebooks
    EvernoteFactory.getNotebooks().then(function (data) {
        console.log(data, "getnotebook");
        $scope.notebooks = data;
        $scope.findNotes;
    });


    $scope.split ="notsplit";
    $scope.selected ="notselected";
    $scope.showNotes ="notshownotes";

    $scope.toSplit = function() {

        if ($scope.split === "split") {
            $scope.split = "notsplit";
            $scope.selected = "notselected";
            $scope.showNotes ="notshownotes"
        } else {
            $scope.split = "split";
            $scope.selected = "selected";
            $scope.showNotes ="shownotes"
        };
    };


    //debugging
    //console.log($rootScope);
    //console.log(AUTH_EVENTS);
    //console.log(AuthService)

    //authentication
    $scope.user = null;
    $scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
    };

    $scope.check = 1;
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

    //find the notes based on id, run through regex and return.
    $scope.findNotes = function(id) {
        EvernoteFactory.getNotes(id).then(function(notes){
            console.log(notes, "notes");
            notes.note = reXML(notes.note);
            console.log(notes, "notesssssss");
            $scope.notes =notes;
        })
    };

    //parse the xml coming from request, extract the text using regex.
    function reXML(data){
        //return data;
        //console.log(data, "typeofdata!")
        //var xmlmatch = /<div>([^<]+?)<\/div>/igm;
        var xmlmatch = /<en-note>(.*?)<\/en-note>/igm;
        var xmlmatch2 = /(<en-note><div>|<\/div><\/en-note>)/igm;
        var xmlmatch3 = /(])\s*([^<]*)/igm;
        //var parsed = xmlmatch.exec(data);
        console.log(xmlmatch, "xmlmatch");
        var parsed =data.match(xmlmatch3)[0].substring(1);
        //var parsed2 = parsed[0].replace(xmlmatch2,"");
        console.log(parsed[0].substring(1), "PARSED");
        return parsed;
        //return data[0];
    };

});
