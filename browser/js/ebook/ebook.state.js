/**
 * Created by alex.kozovski on 9/11/15.
 */
'use strict'

app.config(function ($stateProvider) {
    $stateProvider.state('ebook', {
        url: '/ebook',
        templateUrl: 'js/ebook/ebook.html',
        controller:'EvernoteCtrl'
    });
});