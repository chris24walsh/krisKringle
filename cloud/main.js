var Mailgun = require('mailgun');
Mailgun.initialize('sandbox1287a4b2510d4161ba9eb2b8dc0bda53.mailgun.org', 'key-0a5b959ae314679ee1983ab8afccdc05');
// Using Mailgun module to send the notification emails
Parse.Cloud.define("sendMail", function(request, response) {
    Mailgun.sendEmail({
        to: "chris24walsh@gmail.com",
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
		//Keep shuffling until no partner collision detected!
		while (true) {
			var noPartnerCollision = true; //Assume true until proven false
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
			//Done shuffling, check partner collision
			var person1, person2;
			console.log("\nRunning shuffle:");
			for (a=0;a<array.length;a++) {
				var person1 = array[a].substring(0, array[a].indexOf('&'));
				if (a == (array.length-1)) { //If at end of array, go to start of list for person2
					var person2 = array[0].substring(0, array[0].indexOf('&'));
				}
				else {
					var person2 = array[a+1].substring(0, array[a+1].indexOf('&'));
				}
				//Actual check for collision
				if ( (person1 == "JP" && person2 == "Fidelma") || (person1 == "Fidelma" && person2 == "JP") || (person1 == "Steve" && person2 == "Sel") || (person1 == "Sel" && person2 == "Steve") || (person1 == "Phil" && person2 == "Katie") || (person1 == "Katie" && person2 == "Phil") || (person1 == "Chris" && person2 == "Iryna") || (person1 == "Iryna" && person2 == "Chris") ) {
					noPartnerCollision = false; //If collision found, skip next section and keep shuffling/checking
					console.log("Partner Collision detected: " + person1 + " matched with " + person2);
				}
			}
			if (noPartnerCollision) {
				console.log("No partner collsion detected");
				break;
			}
		}
		
		//Send emails out to each gifter specifying the name of their giftee
        //for (i=0;i<gifters.length;i++) {
		for (i=0;i<1;i++) {
			var name = array[i].substring(0, array[i].indexOf('&'));
			var email = array[i].substring(array[i].indexOf('&') + 1);
			var nextName;
			if (i == (gifters.length-1)) {
				nextName = array[0].substring(0, array[0].indexOf('&'));
			}
			else {
				nextName = array[i+1].substring(0, array[i+1].indexOf('&'));
			}
			var message = '***************\nHi there ' + name + ',\nYour Kris Kringle is ' + nextName + '! Looking forward to it!';
			//console.log(message);
			//console.log(email);
			Parse.Cloud.run("sendMail", {email: email, message: message}, {
				success: function(success) {
				}, error: function(error) {
				}
			});
        }
    });
});
