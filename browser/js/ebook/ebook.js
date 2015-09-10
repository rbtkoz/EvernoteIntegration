/**
 * Created by alex.kozovski on 9/9/15.
 */
app.config(function ($stateProvider) {
    $stateProvider.state('ebook', {
        url: '/ebook',
        templateUrl: 'js/ebook/ebook.html',
        controller:'EvernoteCtrl'
    });
});