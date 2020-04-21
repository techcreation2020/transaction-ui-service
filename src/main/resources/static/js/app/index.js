var host = 'http://localhost:8080';
//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
$(document).ajaxStop($.unblockUI);
$(document).ready(function() {
	getSecurityList();
});

function getSecurityList() {
	$.blockUI({ message: $('<img src="loader/loader.gif"/>') }); 
	$.ajax({
		url: host + "/apiService/api/getFunds",
		type:'GET',		
		dataType:'json',
		success: function(responseData) {
			if(responseData.data) {
				var data = responseData.data;
				var $select = $('#securities'); 
					$select.empty().append('<option value="-1">Select Security</option>');
				for(var i in data){
					var $option = $('<option value="' + data[i].id + '">' + data[i].fundName.toUpperCase() + '</option>');
					$option.data("security-data", data[i]);
					$select.append($option);
				}
			} else if(responseData.messages && responseData.messages.length != 0) {
				var msg = '';
				var messages = responseData.messages;
				for(var i in messages) {
					msg += messages[i].message;
				}
				$('#message').empty().append('<span class="error-message">* '+ msg +'</span>');
			}
			
		}, 
		error:function(error,jqXHR, t) {
			console.log(error);
			console.log(jqXHR);
			console.log(t);
		}
	});
}

$(document).on('blur', '#userName, #transactionUnit, #securities', function(e) {
	if($(this).val() != "" || $(this).val() != "-1") {
		$(this).removeClass('error');
	}
});

function makeTransaction() {	
	var isValid = true;
	var $message = $('#message');
	var userName = $('#userName').val().trim();
	var security = $('#securities').val();
	var transactionUnit = $('#transactionUnit').val().trim();
	
	if(userName == "") {
		isValid = false;
		$('#userName').addClass('error');
		$message.empty().append($('<span class="error-message">* Please fill all fields.</span>'));		
	}
	
	if(security == "-1") {
		isValid = false;
		$('#securities').addClass('error');
		$message.empty().append($('<span class="error-message">* Please fill all fields.</span>'));
	}
	
	if(transactionUnit == "") {
		isValid = false;
		$('#transactionUnit').addClass('error');
		$message.empty().append($('<span class="error-message">* Please fill all fields.</span>'));
	} else if(isNaN(transactionUnit)) {
		var availableUnit = $("#securities option:selected").data("security-data").unit;
		isValid = false;
		$('#transactionUnit').addClass('error');
	} else if(transactionUnit > availableUnit) {
		isValid = false;
		$('#transactionUnit').addClass('error');
	}
	
	setTimeout(function() { 
		$('#message').empty();
    }, 2000);
	
	var transaction = {};
	transaction.user = {
			userName: userName
		};
	transaction.fund = {
			id: security
		};
	transaction.transactionUnit = transactionUnit;
	transaction.transactionType = $('input[name="transactionType"]:checked').val();

	if(isValid) {
		$.blockUI({ message: $('<img src="loader/loader.gif"/>') });
		$.ajax({
			url: host + '/apiService/api/addTransaction',
			type:'POST',
			data: JSON.stringify(transaction),
			contentType:'application/json',
			dataType: 'json',
			success: function(responseData) {
				if(responseData.data) {				
					$('#message').empty().append($('<span class="success-message">*Transaction Completed Successfully.</span>'));					
					setTimeout(function() { 
						$('#message').empty();
				    }, 2000);
					clearForm();
					getSecurityList();
				} else if(responseData.messages && responseData.messages.length != 0) {
					var msg = '';
					var messages = responseData.messages;
					for(var i in messages) {
						msg += messages[i].message;
					}
					$('#message').empty().append('<b><span class="error-message">* '+ msg +'</span></b>');
				} 
			},
			error: function(error,jqXHR, t) {
				console.log(error);
				console.log(jqXHR);
				console.log(t);
			}
		});
	}
}

function clearForm() {
	var $userName = $('#userName').removeClass('error');
	var $security = $('#securities').removeClass('error');
	var $transactionUnit = $('#transactionUnit').removeClass('error');
	
	$userName.val('');
	$security.val("-1");
	$transactionUnit.val('');
	$('#availableUnitsValue').val('');
}

function getAvailableUnits() {
	if($('#securities').val() === "-1") {
		$('#availableUnitsValue').val('');
	} else {
		var securityData = $("#securities option:selected").data("security-data");
		$('#availableUnitsValue').val(securityData.units);
	}
	
}