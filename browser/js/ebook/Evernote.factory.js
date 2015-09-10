/**
 * Created by alex.kozovski on 9/10/15.
 */
app.factory('EvernoteFactory',function($http) {

    function getNote(){
        return $http.get('/auth/evernote').then(function (response) {
            //console.log(response);
            return response.data;
        })

    }

    return {
        getNote: getNote
    }

});