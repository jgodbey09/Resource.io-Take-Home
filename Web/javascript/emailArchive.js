/*
 * JavaScript for emailArchive project at Resource.io
 * By John Godbey 2018
 */

// Parse the URL parameter
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Load page contents
$(document).ready(function(){
	requestEmailArchive();
});

// Variables
var serverAddress = "http://127.0.0.1:3000";
var tokenURL = "archive";
var serverCannotFindEmailError = 500;

// The header fields that will be pulled from the email data
var headerFields = [
	"Date",
	"To",
	"From",
	"Subject",
];

/*
 * A recursive function to search the email for plain text and html data
 * takes the message payload as the seed
 */
function crawlMIME(payload){
	for (var part in payload.parts){
		var partName = payload.parts[part];
		for (var header in partName.headers){
		var headerEntry = partName.headers[header];
			// This logic could perhaps be more succinct
			if (headerEntry.name == "Content-Type" && headerEntry.value == "text/plain; charset=\"UTF-8\""){
				$("#plain").append("<textarea readonly>" + base64_decode(partName.body.data.replace(/['"]+/g, '')) + "<\/textarea>");
			}			
			if (headerEntry.name == "Content-Type" && headerEntry.value == "text/html; charset=\"UTF-8\""){
				$("#html").append("<div id=\"htmlcontent\">" + base64_decode(partName.body.data.replace(/['"]+/g, '')) + "<\/div>");
			}
		}
		// recurse
		crawlMIME(partName);
	}
}

/*
 * A function to communicate with the email server
 */
function requestEmailArchive(){

// Pull the UUID of the email from the URL
var fileRequest = new Object();
var archiveUUID = getParameterByName(tokenURL);
if (!archiveUUID) return;

// Set the filename
fileRequest.filename = archiveUUID + '.json';

// requestEmailArchive
$.ajax({
	type: "POST",
	url: serverAddress + "/requestEmailArchive",
	dataType: "json",
	contentType: "application/json; charset=utf-8",
	data: JSON.stringify(fileRequest),
	success: function(response) {
		
		// Display the parsed email content
		$("#emailContent").show();
		// Search the headers
		for (var pair in response.payload.headers) {
			for (var field in headerFields){
				var fieldName = headerFields[field];
				// Add items from the Header List to the displayed email content
				if (response.payload.headers[pair].name == fieldName){
					$("#emailHeaders").append("<tr><td>" + fieldName + ": " + "<\/td><td id=\"" + fieldName + "\"><\/td><\/tr>");
					// Replace unicode escape characters in the meta data
					$("#" + fieldName).html(response.payload.headers[pair].value.replace("\u003c", "\"").replace("\u003e", "\""));
				}
			}
		}
		
		// Recursively populate the body of the email
		crawlMIME(response.payload);
		
	},
	// Handle errors from the server
	error: function(response) {
		var error = JSON.parse(JSON.stringify(response));
		if (error['status'] == serverCannotFindEmailError){
			$("#errormsg").show();
			$("#errormsg").html(error.responseJSON);
		}
		else {
			alert(response);
		}
	}
});
}
