import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import personHTML from './text/person.html!text'
import _ from 'underscore'

var mode = null, data = null;
var eventTimeout, totalOut = 0, outButton, element, outClicked = false;

// breakpoints

// 0    3-in-row
// 400  4-in-row
// 520  6-in-row
// 620  3-in-row
// 860  4-in-row

/**
 * The function that runs the event actions
 */
var checkOutButton = function () {  //Toggle show button visibility for "Leaving" group depending on viewport width

    var maxToShow = null;

    var pageWidth = element.offsetWidth;
	// handle the event...

    // get width of page;

    // get total of outs
  

    if (pageWidth < 400 ) {
        maxToShow = 6; // was 9
    } else if (pageWidth >= 400 && pageWidth < 520) {
        maxToShow = 8;  // was 12
    } else if (pageWidth >= 520 && pageWidth < 620) {
         maxToShow = 12; // was 18
         
    } else if (pageWidth >= 620 && pageWidth < 860) {
         maxToShow = 6; // was 9
         
    } else {
        maxToShow = 9999999;
    }

    if (totalOut > maxToShow && !outClicked) {
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
        url: 'https://interactive.guim.co.uk/docsdata/1hklQ69aVug1qAWIiKCBaWmucNd625V-IGMKh8LTh1D4.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => buildApp(resp)
    });
};

function buildApp(resp) {

    mode = getParameterByName("mode");
    data = resp.sheets.Sheet1;

    // if (mode === null) {
    //     mode = "full";
    // }

    //console.log(mode);
    //console.log(data);
    //console.log(_);

    var i, html = "", leaveHtml = "", personHtml, personTemplate = _.template(personHTML), personGroup = document.getElementById("person-group"), leaveGroup = document.getElementById("leaving-group"), status, title, name, previousTitle, creditHtml = "PA, AFP, Getty, PA, REX, News Pictures, Guardian";

    for (i = 0; i < data.length; i++) {

        status = getStatusClass(data[i]["Status"]);
        previousTitle = "";
        title = data[i]["Title"];
        name = data[i]["Name"];

        if ( name == "Photo credit") {
            creditHtml = title;
            continue;
        }

        if ( name == "Main heading") {
            document.getElementById("main-heading").innerHTML = title;
            continue;
        }

        if ( name == "Out heading") {
            document.getElementById("out-heading").innerHTML = title;
            continue;
        }

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
            personName: name,
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

    if (leaveHtml == "") {
         document.getElementById("out-section").style.display = 'none';
         document.getElementById("out-key").style.display = 'none';
    }
    document.getElementById("gv-cabinet-footer").innerHTML = creditHtml;

    if (mode != "full") {

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

} else { // mode == full
    document.getElementById("leaving-group").className = "person-group expanded";
    document.getElementById("person-group").className = "person-group expanded";
    document.getElementById("show-more-leaving-button").style.display = 'none';
    document.getElementById("show-more-person-button").style.display = 'none';
}

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

        case "new dup":
            return "new-dup";
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






