$(document).ready(function(){
	// Animates the dots growing
	var dots = 1;
	var showDots = function() {
		// Creates the dots based on length
		var d = "";
		for (var i = 0; i < dots; i++) {
			d += ".";
		};

		// Displays the correct number of dots
		$(".dots").text(d);

		// Increments the length of dots
		// Fixes the length at 3
		dots++;
		if (dots > 3)
			dots = 0;

		// Sets the time between this run and the next run
		// 300 ms
		setTimeout(showDots, 300);
	};
	showDots();

	// Gets a unique user id
	var userId;
	var getUserId = function() {
		// Connects to Azure
		var client = new WindowsAzure.MobileServiceClient(
		    "AppUrl",
		    "AppKey"
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
	setTimeout(getUserId(), 1200);

	// Chat with
	// only numbers
	$(".chatWith").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
             // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
	$(".chatWith").on("input", function() {
		if (this.value.length === 6)
		{
			// Connects to Azure
			var client = new WindowsAzure.MobileServiceClient(
			    "AppUrl",
			    "AppKey"
			);
			var users = client.getTable("Users");

			users.where({
				userId: parseInt(this.value)
			}).read().done(function (results){
				if (jQuery.isEmptyObject(results))
				{
					alert("That user doesn't exist!");
					this.value = "";
				}
				else 
				{
					$(".start").addClass("button-primary");
				}
			}, function(err){
				alert(err);
			});
		}
		else
		{
			$(".start").removeClass("button-primary");
		}
	});

	// Starting
	$(".start").click(function(e){
		if ($(".start").hasClass("button-primary"))
		{
			var first = userId;
			var second = parseInt($(".chatWith").val());
			if (first > second)
			{
				var temp = first;
				first = second;
				second = temp;
			}
			localStorage.setItem("userId", userId);
			localStorage.setItem("otherUserId", parseInt($(".chatWith").val()));
			localStorage.setItem("first", first);
			localStorage.setItem("second", second);
		}
		else
		{
			alert("Make sure you have a user id and have selected someone to chat with!")
			e.preventDefault();
		}
	});	
});
