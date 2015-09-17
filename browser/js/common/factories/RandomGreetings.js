app.factory('RandomGreetings', function () {

    var getRandomFromArray = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = [
        'Hello, world!',
        'At long last, I'm live!',
        'Hello, simple human.',
        'What a beautiful day!',
        'Ebooks need friends too :)',
        'I like to take notes with my ebook',
        'こんにちは、ユーザー様。',
        'I can haz evernote integration.',
        ':D',
        'Yes, I think we\'ve met before.'
    ];

    return {
        greetings: greetings,
        getRandomGreeting: function () {
            return getRandomFromArray(greetings);
        }
    };

});
