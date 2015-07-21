"use strict";

var user = localStorage.getItem("userId");
var otherUser = localStorage.getItem("otherUserId");
var first = localStorage.getItem("first");
var second = localStorage.getItem("second");

$(".userId").html(user);
$(".otherUserId").html(otherUser);

var sphero = require("sphero");
var	orb    = sphero("com4");

$(".connect").click(function() {
	orb.connect(function() {
		var message = "";
		var letter = "";

		// Shows the message on the sphero
		var code = "";
		var show = function() {
			var time = 1000;
			var c = code.charAt(0);
			if (c === "_")
				time = 2500;
			code = code.substring(1);
			if (code.length == 0)
				return;
			orb.color(0x00FF00);
			setTimeout(hide, time);
		};
		var hide = function() {
			orb.color(0x00000);
			setTimeout(show, 1200);
		};

		// Checks collisions to check for end of letter
		orb.detectCollisions();
		orb.on("collision", function(data){
			var l = decode(letter);

			// If invalid letter reset message box
			if (l === "null") {
				alert(l + " isn't a valid morse code letter");
				$(".message").text(message);	
			} else { // If valid letter update message
					 // and add letter to decoded
				message += (message.length == 0 ? "" : " ") + letter;
				$(".message").append(" ");
				$(".decoded").append(l);
			}

			// Reset letter variable
			letter = "";
		});

		// Check for . or _
		var neutral = true;
		orb.startCalibration();
		orb.command(0x02 , 0x02 , [ 0x00 ], function() {});
		orb.streamImuAngles();
		orb.on("imuAngles", function(data) {
			var roll = data.rollAngle.value[0];

			if (neutral) {
				// If rolled to the left its a .
				if (roll < -25) {
					letter += ".";
					$(".message").append(".");
				// If rolled to the right its a _
				} else if (roll > 25) {
					letter += "_";
					$(".message").append("_");
				}
			} else if (roll < 25 && roll > -25) {
				neutral = true;	
			}
		});

		$(".send").click(function(){
			alert("hello");
			send(message, first, second, otherUser);
			clear();
		});
		$(".clear").click(clear);
		var clear = function() {
			message = "";
			letter = "";
			$(".message").html("");
			$(".decoded").html("");
		};
	});
});

var send = function(message, first, second, to) {
	// Connects to Azure
	var client = new WindowsAzure.MobileServiceClient(
	    "AppKey",
	    "AppUrl"
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

var check = function(first, second, user) {
	var time = 300;

	// Connects to Azure
	var client = new WindowsAzure.MobileServiceClient(
	    "AppKey",
	    "AppUrl"
	);
	var messages = client.getTable("Messages");	

	messages.where({
		first: first,
		second: second,
		to: user,
		read: false
	}).read().done(function (results){
		if (results.length > 0) {
			$(".othermessage").html(results[0].message);

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

$(".otherdecode").click(function(){
	var morse = $(".otherMessage").html();
	var decoded = decode(morse);
	$(".otherdecoded").html(decoded);
});