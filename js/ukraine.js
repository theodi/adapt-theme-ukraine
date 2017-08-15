var theme="ukraine";
define(function(require) {
	
	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	var ThemeBlock = require('theme/adapt-theme-ukraine/js/theme-block');
	var msjquery = require('theme/adapt-theme-ukraine/js/jquery.dd.js');
	var emailPresent = false;

	// Block View
	// ==========

	Adapt.on('blockView:postRender', function(view) {
		var theme = view.model.get('_theme');
		
		if (theme) {
			new ThemeBlock({
				model: new Backbone.Model({
					_themeBlockConfig: theme
				}),
				el: view.$el
			});
		}
	});

	Adapt.on('pageView:ready', function(view) {
		$('.intro-logo .graphic-widget img').attr('src','adapt/css/assets/intro-logo.png');
		$('.intro-logo .graphic-widget img').attr('data-large','adapt/css/assets/intro-logo.png');
		$('.intro-logo .graphic-widget img').attr('data-small','adapt/css/assets/intro-logo.png');
		try {
			theme = view.model.get('_theme');
			console.log(theme);
			email = Adapt.course.get('_globals')._theme._ukraine.contactEMail;
			text = Adapt.course.get('_globals')._theme._ukraine.contactLinkText;
			if( $('.about-links').size() > 0) {
            	$('.about-links').append(' | ');
        	} 
        	$('.about-links').append('<a class="contact" href="mailto:'+email+'">'+text+'</a>');
		} catch (err) {}
	});

	Adapt.on('userDetails:updated', function(user) {
		emailSave(user);
		emailPresent = true;
	});

	Adapt.on('trackingHub:saving', function() {
		if (!emailPresent) { return; }
		$('#save-section').addClass('saving');
		var sl = document.getElementById('save-section');
		var toClass = "cloud_saving";
		$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
	});

	Adapt.on('trackingHub:success', function() {
		if (!emailPresent) { return; }
		$('#save-section').addClass('success');
		var sl = document.getElementById('save-section');
		var toClass = "cloud_success";
		$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
	});
	
	Adapt.on('trackingHub:failed', function() {
		if (!emailPresent) { return; }
		$('#save-section').addClass('failed');
		var sl = document.getElementById('save-section');
		var toClass = "cloud_failed";
		$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
	});

	Adapt.on('trackingHub:getUserDetails', function(user) {
		checkState(user);
	});


	// Custom bits
	// ============
	var click_bind = false;

	function showMessage(phraseId) {
		console.log("In show message");
		
		var alertObject = {
            title: "Save your progress, learn anywhere...",
            body: "<p>Please enter your details below.<br/>You will receive an email linking to your unique profile so you can save your progress and resume your learning on any device.</p><br/><div align='center'><input type='email' id='email' class='email-input' placeholder='Email address' required></input><br/><button type='input' id='email_submit' value='Submit' style='padding: 10px; border-radius: 0;' class='notify-popup-done' role='button' aria-label='submit email' onClick='getUser();'>Submit</button></div>"
        };
        
        Adapt.once("notify:closed", function() {
            Adapt.trigger("tutor:closed");
        });

        Adapt.trigger('notify:popup', alertObject);

        Adapt.trigger('tutor:opened');

        $("#countries").msDropdown();
	}

	function addListeners() {
		if (!click_bind) {
			$('.save-section-outer').click(function() {
				$('#cloud-status').slideToggle();
			});
			click_bind = true;
		}
		$('#saveSession').click(function() {
			showMessage();
		});
	}

	function emailSave() {
		$('#save-section').fadeOut( function() {
    		var sl = document.getElementById('save-section');
			var ss = document.getElementById('cloud-status-text');
			$(sl).html("");
			$(sl).addClass('saving');
			var toClass = "cloud_saving";
			$(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
			$(sl).fadeIn();
		});
	}


	function checkWelcome(user) {
		if (!user.email && !localStorage.getItem("ODI_Welcome_Done")) {
			showMessage('enter_email');
			localStorage.setItem("ODI_Welcome_Done",true);
		}
	}

	function checkState(user) {
		if (user) { 
			var sessionEmail = user.email || false; 
			var lastSave = user.lastSave;	
		}
		if (!sessionEmail) {
			emailPresent = false;
			checkWelcome(user);
			$('#save-section').html("<button class='slbutton' id='saveSession'>Save progress</button>");
			$('#save-section').fadeIn();
			click_bind = false;
			$('.save-section-outer').unbind('click');
			addListeners();
		} else {
			emailPresent = true;
			$('#save-section').fadeIn();
			addListeners();
		}
	}

});

function validateInput(user) {
	valid = true;
	if (!validateEmail(user.email)) {
		valid = false;
	}
	if (!user.firstname || !user.lastname || !user.country || !user.gender) {
		valid = false;
	}
	return valid;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getUser() {
	var Adapt = require('coreJS/adapt');
	user = {};
	user.email = $("input[id='email']").val();
	user.firstname = $("input[id='firstname']").val();
	user.lastname = $("input[id='lastname']").val();
	user.country = $("#countries").val();
	user.region = $("#region").val();
	user.gender = $("#gender").val();
	if (validateInput(user)) {
		Adapt.trigger('userDetails:updated',user);
	}
}
