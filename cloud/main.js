var Mailgun = require('mailgun');
Mailgun.initialize('sandbox1287a4b2510d4161ba9eb2b8dc0bda53.mailgun.org', 'key-0a5b959ae314679ee1983ab8afccdc05');
// Using Mailgun module to send the notification emails
Parse.Cloud.define("sendMail", function(request, response) {
    Mailgun.sendEmail({
        to: request.params.email,
        from: "postmaster@sandbox1287a4b2510d4161ba9eb2b8dc0bda53.mailgun.org",
        subject: "This is your kris kringle notification",
        text: request.params.message
    }, {
        success: function(httpResponse) {
            console.log(httpResponse);
            response.success("Email sent!");
        },
        error: function(httpResponse) {
            console.error(httpResponse);
            response.error("Uh oh, something went wrong");
        }
    });
    response.success("Email sent!");
});
     
// Create a job that sends out the notification emails
Parse.Cloud.job("runSelection", function(request, response) {
	var array = [];
	//Query the list of gifters
    var Gifter = Parse.Object.extend('Gifter');
    var q = new Parse.Query(Gifter);
    q.find( function(gifters) {
		//Build array of gifters
		for (a=0;a<gifters.length;a++) {
			array[a] = gifters[a].get('Name') + '&' + gifters[a].get('Email');
		}
		//Shuffle the array of gifters
		var currentIndex = array.length, temporaryValue, randomIndex ;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		//Send emails out to each gifter specifying the name of their giftee
        for (i=0;i<gifters.length;i++) {
			var name = array[i].substring(0, array[i].indexOf('&'));
			var email = array[i].substring(array[i].indexOf('&') + 1);
			var nextName;
			if (i == (gifters.length-1)) {
				nextName = array[0].substring(0, array[0].indexOf('&'));
			}
			else {
				nextName = array[i+1].substring(0, array[i+1].indexOf('&'));
			}
			var message = 'Please ignore the previous emails, as not everyone received them.\n This is the one to pay attention to :)\n***************\nHi there ' + name + ',\nYour Kris Kringle is ' + nextName + '!\nRemember, around 10 Euro is enough :) Looking forward to it!';
			console.log(message);
			console.log(email);
			Parse.Cloud.run("sendMail", {email: email, message: message}, {
				success: function(success) {
				}, error: function(error) {
				}
			});
        }
    });
});
