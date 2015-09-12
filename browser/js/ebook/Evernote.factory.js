/**
 * Created by alex.kozovski on 9/10/15.
 */
app.factory('EvernoteFactory',function($http) {

    //function authEvernote(){
    //    console.log("here");
    //    return $http.get('/auth/evernote').then(function (response) {
    //        //console.log(response);
    //        return response.data;
    //    })
    //
    //}


    function getNotebooks(){
        return $http.get('ebook/:id').then(function(response){
            return response.data;
        })
    }


    function getNotes(id){
        console.log(id, "getting ide in factory");
        return $http.get('note/'+id).then(function(response){
            return response.data;
        })
    }

    return {
        getNotebooks: getNotebooks,
        getNotes: getNotes
    }

});