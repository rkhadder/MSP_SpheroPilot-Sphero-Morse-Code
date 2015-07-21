<a name="title" />
# Sphero Morse Code #
--
<a name="overview" />
## Overview ##

Sphero Morse Code(SMC) is a project where you can communicate with your friends using morse code and a Sphero. Tilting the sphero left or right will result in a dot or dash respectively and tapping the sphero will indicate the end of a letter. Using these mechanics you can construct messages in morse code and send them to your friends.

The SMC project is part of the Microsoft Student Partner(MSP) and Sphero pilot. Check out some of the other projects [here](http://blogs.msdn.com/b/studentdeveloper/archive/2015/06/02/rolling-out-the-msp-sphero-pilot.aspx). Go [here](https://msdn.microsoft.com/en-us/microsoftstudentpartners.aspx) to find out more about the MSP program.

<a name="prerequisites" />
## Prerequisites ##
To get this project to work you need a

- [Sphero](http://store.sphero.com/products/sphero-2-0)
- Azure (if your a student get a free trial fro
m [here](https://www.dreamspark.com/Student/Azure-App-Development.aspx), otherwise you can get a free 30 day trial from [here](https://azure.microsoft.com/en-us/pricing/free-trial/))
- Node.js + Node Webkit

<a name="setting-up-azure" />
## Setting Up Azure ##

Once you register your account with Azure set up a mobile webservice.

![azure-webservice-create](images/azure-webservice-create.png?raw=true)

![azure-webservice-dialog](images/azure-webservice-dialog.png?raw=true)

After creating a mobile webservice we need to create two tables: one for users and one for messages. The users database will store the userId for each user. The messages database will store the message data for every message.

First we'll navigate to _data_ then click _create_. Name the table _Users_ and keep the rest default.

![azure-users-create](images/azure-users-create.png?raw=true)

We'll add columns for _userId_

![azure-users-columns](images/azure-users-columns.png?raw=true)

That's it for the users db. Now we'll create the messages db. Create a table names _Messages_.

![azure-messages-create](images/azure-messages-create.png?raw=true)

We'll add columns for _first_, _second_, _to_, _message_, and _read_. Conversations will be defined by the _first_/_second_ variables. Those will be set based on sorting order, i.e. the lower id is _first_ and the higher id is _second_. Messages will be queried on _first_, _second_, and _to_.

![azure-messages-columns](images/azure-messages-columns.png?raw=true)

That'll be it for setting up Azure.

<a name="setting-up-sphero" />
## Setting Up Sphero ##
This section will cover how to read for tilt changes and how to detect collisions.

After installing the Sphero js [library](https://github.com/orbotix/sphero.js) create a js file. To connect to the sphero we'll find the comm port and request to connect.

````JavaScript
var sphero = require("sphero");
var	 orb    = sphero("com4");
orb.connect(function() {
});
````

Once connected we'll disable stabilization on the Sphero. Doing this will ensure the Sphero doesn't try to fix itself afer we tilt it. There is no command for this so we will have to send our own packet.

````JavaScript
orb.command(0x02 , 0x02 , [ 0x00 ], function() {});
````

Now we set up the sensor stream for IMU variables. The IMU sensor will report the pitch, roll, and yaw (rotations in the xyz axis).

````JavaScript
orb.streamImuAngles();
orb.on("imuAngles", function(data) {
	var roll = data.rollAngle.value[0];
	if (roll < -25) {
		// Roll to the left
	} else if (roll > 25) {
		// Roll to the right
	}
});
````

To check for collisions we'll do something very similar.

````JavaScript
orb.detectCollisions();
orb.on("collision", function(data){
	// Something hit the Sphero
});
````

Now we can use the IMU sensor and the collision sensor to check for dots and dashs and to check for the end of a letter respectively.

<a name="connecting-sphero-azure" />
## Connecting Sphero and Azure ##
This section will cover how to get a unique user id and how to read/write messages.

<a name="unique-user-id" />
### Creating a Unique User Id ###

First let's load the azure javascript library. 

````HTML
<script src="http://ajax.aspnetcdn.com/ajax/mobileservices/MobileServices.Web-1.2.7.min.js"></script>
````

Then we'll create a new object of the client to connect to our mobile service.

````JavaScript
// Connects to Azure
var client = new WindowsAzure.MobileServiceClient(
	 "AppUrl",
	 "AppKey"
);
var users = client.getTable("Users");
````

We wont the userid to be 6 integers long. We can use this math equation to get a random 6 digit integer.

````JavaScript
var userId = Math.floor(Math.random()*900000) + 100000;
````

To check if its unique we have to query the current list of users for another user with the same user id.

````JavaScript
users.where({
	 userId: userId
}).read().done(function (results) {
	// If no user has the same id create a new user
	// with the generated id
	if (jQuery.isEmptyObject(results))
	{
	}
	// If the id is a duplicate try again
	else
	{
	}
}, function (err) {
	 alert("Error: " + err);
});
````

Once we find a unique id we have to create a record in the database so that number doesn't get used again.

````JavaScript
users.insert({userId: userId})
.done(function(result){
	$(".userId").html(result.userId);
}, function(err){
	alert("error: " + err);
});
````


The final snippet will look something like this

````JavaScript
var userId;
var getUserId = function() {
	// Connects to Azure
	var client = new WindowsAzure.MobileServiceClient(
		 "https://your-app-url.azure-mobile.net/",
		 "01234_YOUR_APP_KEY_56789"
	);
	var users = client.getTable("Users");

	// Gets a unique id
	var getId = function(){
					// Creates some 6 character long id
					// 6 characters allows for 500000 possible users
					userId = Math.floor(Math.random()*900000) + 100000;

					// Queries azure to find a user with the same
					// userId
					users.where({
						 userId: userId
					}).read().done(function (results) {
						// If no user has the same id create a new user
						// with the generated id
						if (jQuery.isEmptyObject(results))
						{
							createUser();
						}
						// If the id is a duplicate try again
						else
						{
							getId();
						}
					}, function (err) {
						 alert("Error: " + err);
					});
				};

	// Creates a user with a unique id
	var createUser = function() {
						users.insert({userId: userId})
						 .done(function(result){
							 $(".userId").html(result.userId);
						 }, function(err){
							 alert("error: " + err);
						 });
					};
	
	getId();
};
getUserId();
````

<a name="read-messages" />
### How To Read Messages ###

To read messages we need to connect to the messages database.

````JavaScript
var client = new WindowsAzure.MobileServiceClient(
	 "AppUrl",
	 "AppKey"
);
var messages = client.getTable("Messages");	
````

Now we need to query to find messages with the correct _first_/_second_ key and with the correct _to_ that hasn't been _read_.

````JavaScript
messages.where({
	first: first,
	second: second,
	to: user,
	read: false
}).read().done(function (results){
	if (results.length > 0) {
		alert(results[0].message);
	}
}, function(err) {
	alert("error: " + err);
});
````

We want to periodically be checking for new messages so we can use Javascript's _setTimeout_ method to keep checking for new messages every few hundred milliseconds.

````JavaScript
setTimeout(function() {
	check(first, second, user);
}, time);
````

The final snippet to check for messages will look like this

````JavaScript
var check = function(first, second, user) {
	var time = 300;

	// Connects to Azure
	var client = new WindowsAzure.MobileServiceClient(
	    "https://your-app-url.azure-mobile.net/",
		 "01234_YOUR_APP_KEY_56789"
	);
	var messages = client.getTable("Messages");	

	messages.where({
		first: first,
		second: second,
		to: user,
		read: false
	}).read().done(function (results){
		if (results.length > 0) {
			alert(results[0].message);

			time = 2000;
		}
	}, function(err) {
		alert("error: " + err);
	});

	setTimeout(function() {
		check(first, second, user);
	}, time);
};
check(first, second, user);
````

<a name="send-messages" />
### How To Send Messages ###

To send messages we need to connect to the messages database.

````JavaScript
var client = new WindowsAzure.MobileServiceClient(
	 "AppUrl",
	 "AppKey"
);
var messages = client.getTable("Messages");	
````

Then we'll insert a new message object into the db.

````JavaScript
var message = {
	first: first,
	second: second,
	to: to,
	message: message,
	read: false
};
messages.insert(message);
````

The final snippet should look something like this

````JavaScript
var send = function(message, first, second, to) {
	// Connects to Azure
	var client = new WindowsAzure.MobileServiceClient(
	    "https://sphero-morse-code.azure-mobile.net/",
	    "ZLhciSXInTwUOZcqrhRKkVfjGhofmu65"
	);
	var messages = client.getTable("Messages");

	var message = {
		first: first,
		second: second,
		to: to,
		message: message,
		read: false
	};
	messages.insert(message);
};
````


<a name="conclusion" />
## Conclusion ##

These were the basic components to build a morse code communication app using Azure, Sphero, and Node.js/Node-Webkit.

You can look at the project to see how these all might combine together to create a full application.

If you have any questions please don't hesitate to reach out at ramsey.khadder@studentpartner.com