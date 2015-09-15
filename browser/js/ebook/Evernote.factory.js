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
        return $http.get('note/'+id).then(function(response){
            return response.data;
        })
    }

    function updateNote(id, title, text){


        return $http.get('update/',{params:{"id":id,"text":text, "title":title}}).then(function(response){
            console.log(response, "factory")

            return response.data;
        })
    }

    return {
        getNotebooks: getNotebooks,
        getNotes: getNotes,
        updateNote: updateNote
    }

});