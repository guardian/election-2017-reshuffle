import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import personHTML from './text/person.html!text'
import _ from 'underscore'

var mode = null, data = null;
var eventTimeout, totalOut = 0, outButton, element, outClicked = false;

/**
 * The function that runs the event actions
 */
var checkOutButton = function () {

    var numShowing = null;

    var pageWidth = element.offsetWidth;
	// handle the event...

    // get width of page;

    // get total of outs

  

    if (pageWidth < 400 ) {
        numShowing = 9;
    } else if (pageWidth >= 400 && pageWidth < 520) {
        numShowing = 12;
    } else if (pageWidth >= 520 && pageWidth < 860) {
         numShowing = 18; // 18 - 5;
         
    } else {
        numShowing = 9999999;
    }

    if (totalOut > numShowing && !outClicked) {
        outButton.style.display = 'inline-block';
    } else {
        outButton.style.display = 'none';
    }

    //console.log(pageWidth + "    "  + numShowing + "   " + totalOut);

};

/**
 * Throttle events to only run at 15fps
 */
var eventThrottler = function () {
	// ignore resize events as long as an actualResizeHandler execution is in the queue
	if ( !eventTimeout ) {
		eventTimeout = setTimeout(function() {
			eventTimeout = null;
			checkOutButton();
		 }, 66);
	}
}; 

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;
    element = el;

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1lrMs23YPKWxRStLVLiVj407bvIJvlG_WZxBMkVYui6I.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => buildApp(resp)
    });
};

function buildApp(resp) {

    mode = getParameterByName("mode");
    data = resp.sheets.Sheet1;

    if (mode === null) {
        mode = "full";
    }

    //console.log(mode);
    //console.log(data);
    //console.log(_);

    var i, html = "", leaveHtml = "", personHtml, personTemplate = _.template(personHTML), personGroup = document.getElementById("person-group"), leaveGroup = document.getElementById("leaving-group"), status, title, previousTitle;

    for (i = 0; i < data.length; i++) {

        status = getStatusClass(data[i]["Status"]);
        previousTitle = "";
        title = data[i]["Title"];

        if (status == "change") {
            previousTitle = " was " + data[i]["Previous title"];
        }
        if (status == "leaving") {
            //previousTitle = "Was " + data[i]["Previous title"];
            previousTitle = "was " + data[i]["Previous title"] + "";
            title = "";
            totalOut ++;
        }

        personHtml = personTemplate({
            photoSrc: data[i]["Photo"],
            personName: data[i]["Name"],
            personTitle: title,
            personPreviousTitle: previousTitle,
            status: status
        });

        if (status == "leaving") {
            leaveHtml += personHtml;
        } else {
            html += personHtml;
        }

    }

    personGroup.innerHTML = html;
    leaveGroup.innerHTML = leaveHtml;

    document.getElementById("show-more-person-button").addEventListener("click", function(){
    this.style.display = 'none';
    document.getElementById("person-group").className = "person-group expanded";
});

 document.getElementById("show-more-leaving-button").addEventListener("click", function(){
     this.style.display = 'none';
    document.getElementById("leaving-group").className = "person-group expanded";
    outClicked = true;
});

outButton = document.getElementById("show-more-leaving-button");
checkOutButton();
// Run the event listener
window.addEventListener( 'resize', eventThrottler, false );

}

function getStatusClass(status) {

    status = status.toLowerCase().trim();

    switch (status) {

        case "change":
            return "change";
            break;

        case "new":
            return "new";
            break;

        case "leaving":
            return "leaving";
            break;

        default:
            return "no-change";
            break;

    }
}

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}




