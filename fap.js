/*	
 *	FurAffinity Previewer for Firefox
 * 	Version 1.0
 * 	draconigen@gmail.com
 *  inspired by the original for Chrome: FA Previewer by Serofox
 */

/*
 *	debug console output true|false for url detection and data retrieval
 */
var debug = false;

/*
 *	debug console output true|false for preview display positioning
 */
var debugPos = false;

/*
 *	$(thumbnailLinkSelector) should select all submission links in a gallery / fav / submission view.
 */
var thumbnailLinkSelector = 'a[href^="/view/"]'; 

/*
 *	$(string).match(idRegex) should extract the number from http://www.furaffinity.net/12345678.
 */
var idRegex = '[0-9]+';

/*
 *	$(downloadSelector) should select the download link on a submission page.
 */
var downloadSelector = '.actions > :nth-of-type(2) > a, a.button.download-logged-in';

/*
 *	Reading material and interesting resources for further development:
 *	[0] about:debugging#addons
 *	[1] https://developer.mozilla.org/en-US/Add-ons/WebExtensions
 *	[2] https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea/set
 *	[3] https://hacks.mozilla.org/2012/02/saving-images-and-files-in-localstorage/
 *	[4] https://stackoverflow.com/a/19183658
 */

// append a container to the document; we'll set its dimensions and position later and add the preview image.
$(document.body).append($('<div id="fap-container"></div>'));
var popup_div = $('#fap-container');

// on each thumbnail, add an event to display the preview
$(thumbnailLinkSelector).mouseenter(function() {
	
	// read the submission page url from the thumbnail link
	var submissionUrl = $(this).prop('href');
	if (debug) console.log('[FAP DEBUG] submissionUrl:', submissionUrl);

	// from that submission page url, extract the id (for later identification)
	var submissionId = submissionUrl.match(idRegex)[0];
	// if (debug) console.log('[FAP DEBUG] submissionId:', submissionId);

	// stash this id globally to help avoid showing the preview in case the cursor has moved on to another image in the meanwhile
	window.submissionId = submissionId;

	// retrieve the submission page for that image
	$.ajax({
		url: submissionUrl,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('[FAP ERROR] Ajax failed. Details:', {jqXHR, textStatus, errorThrown});
		},
		success: function(data, textStatus, jqXHR) {
			if (debug) console.log('[FAP DEBUG] Ajax OK, data:', data);

			// on the submission page, look for the download link and extract the full image url
			var imageUrl = $(data).find(downloadSelector).prop('href');
			if (debug) console.log('[FAP DEBUG] imageUrl:', imageUrl);

			// create an image dom object, set its' src attribute to the full image url, and, as soon as the image is loaded...
			var img = $("<img />").attr('src', imageUrl).on('load', function() {
				if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
					console.log('[FAP ERROR] Failed to load image.');
				} else {
					if (debug) console.log('[FAP DEBUG] Image loaded; result:', img);
					
					// ... place that image object into the preview container
					$('#fap-container').html(img);
					if (debugPos) console.log("[FAP DEBUG] MouseEnter");
					
					// set the containers dimensions, position and the image object's position according to mouse position
					setDimensions();

					// and finally display the preview container, if the cursor still hovers over the loaded image
					if (window.submissionId == submissionId)
						$('#fap-container').fadeIn(80);

					// TODO: download the image and save it to local storage for later retrieval.

					// prepare dataset
					// var dataset = {
					// 	"submissionId": submissionId,		// submission id
					// 	"submissionUrl": submissionUrl,		// url of submission page
					// 	"timestamp": new Date(),			// timestamp of retrieval
					// 	"imageUrl": imageUrl				// image url
					//	"image": image						// image file as blob / base64 (?) 
					// }
					// if (debug) console.log('[FAP DEBUG] dataset:', dataset);
				}
			});
		}
	})
})

// hide the preview container as soon as the mouse pointer hits anything other than a thumbnail
$('*:not('+thumbnailLinkSelector+'):not(#fap-container)').mouseenter(function() {
	if (debugPos) console.log("[FAP DEBUG] MouseLeave");
	$('#fap-container').hide();
})

// on each mouse move, save mouse position globally to be used in setDimensions()
$(document).mousemove(function(event) {
	window.posx = event.clientX;
	window.posy = event.clientY;
	setDimensions();
})

// set the preview container's position, dimension and the image position according to mouse position
function setDimensions() {
	var display = $('#fap-container');

	// read mouse position from previously saved global variables
	var posx = window.posx;
	var posy = window.posy;
	if (debugPos) console.log('[FAP DEBUG] Mouse position:', {posx, posy});

	// get the initial image dimensions
	var width = display.outerWidth();
	var height = display.outerHeight();
	if (debugPos) console.log('[FAP DEBUG] Preview dimensions:', {width, height});

	// get the viewport's dimensions
	var vpWidth = $(window).width();
	var vpHeight = $(window).height();
	//if (debugPos) console.log('[FAP DEBUG] ViewPort dimensions:', {vpWidth, vpHeight}); // 1903 x 957

	// calculate dimensions for the preview container according to given space
	width = vpWidth - posx - 20;
	height = vpHeight - posy - 20;
	
	// set the image within the preview container to stick to the upper left corner
	$('#fap-container > img').css({
		'top': 0,
		'left': 0,
		'bottom': 'auto',
		'right': 'auto'
	});
	
	// if the mouse pointer is on the right half of the viewport, switch the preview to the left side of the pointer
	// and set the image object to stick to the right within the preview container
	if (posx > vpWidth / 2) {
		width = posx;
		posx = 0;
		width = width - 20;
		$('#fap-container > img').css({
			'left': 'auto',
			'right': 0
		});
	}

	// if the mouse pointer is on the lower half of the viewport, switch the preview to above the pointer
	// and set the image object to stick to the bottom of the preview container
	if (posy > vpHeight / 2) {
		height = posy;
		posy = 0;
		height = height - 20;
		$('#fap-container > img').css({
			'top': 'auto',
			'bottom': 0
		});
	}

	// now that all calculations are complete, apply dimensions and position to the preview container
	display.css({
		'top': posy + 10,
		'left': posx + 10,
		'width': width,
		'height': height
	})
}