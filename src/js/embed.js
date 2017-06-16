import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import personHTML from './text/person.html!text'
import _ from 'lodash'
import {
    nest
} from 'd3-collection'

var mode = null,
    data = null;
var eventTimeout, totalOut = 0,
    outButton, element, outClicked = false;

// breakpoints

// 0    3-in-row
// 400  4-in-row
// 520  6-in-row
// 620  3-in-row
// 860  4-in-row

/**
 * The function that runs the event actions
 */
var checkOutButton = function() { //Toggle show button visibility for "Leaving" group depending on viewport width

    var maxToShow = null;

    var pageWidth = element.offsetWidth;
    // handle the event...

    // get width of page;

    // get total of outs


    if (pageWidth < 400) {
        maxToShow = 6; // was 9
    } else if (pageWidth >= 400 && pageWidth < 520) {
        maxToShow = 8; // was 12
    } else if (pageWidth >= 520 && pageWidth < 620) {
        maxToShow = 12; // was 18

    } else if (pageWidth >= 620 && pageWidth < 860) {
        maxToShow = 12; // was 9

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
var eventThrottler = function() {
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if (!eventTimeout) {
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
        url: 'https://interactive.guim.co.uk/docsdata/13i0JiOkbejMkclrLy39kNCK2no2cvgSBiUQL8GzjBq4.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => buildApp(resp)
    });
};

function buildApp(resp) {

    mode = getParameterByName("mode");
    data = resp.sheets.Sheet1;

    // group data by floor
    let nested = nest()
        .key(function(d) {
            return d.Floor;
        })
        .entries(data)
        .sort((a, b) => {
            if(Number(a.key)) {
                return Number(b.key) - Number(a.key)
            } else {
                return true;
            }
        });

    // if (mode === null) {
    //     mode = "full";
    // }

    //console.log(mode);
    //console.log(data);
    //console.log(_);

    var i, html = "",
        leaveHtml = "",
        headlineHtml, floor, personHtml, personTemplate = _.template(personHTML),
        personGroup = document.getElementById("person-group"),
        leaveGroup = document.getElementById("leaving-group"),
        status, age, name, previousTitle, creditHtml = "PA, AFP, Getty, PA, REX, News Pictures, Guardian";

    nested.forEach((floorData) => {
        if (floorData.key) {
            html += `<div class="floor-group"><h3>Floor ${floorData.key}</h3>`;
        }
        let people = floorData.values;
        for (i = 0; i < people.length; i++) {
            age = people[i]["Age"];
            name = people[i]["Name"];
            floor = people[i]["Floor"];

            if (name == "Photo credit") {
                creditHtml = age;
                continue;
            }

            if (name === "Title") {
                headlineHtml = age;
                continue;
            }

            if (status == "change") {
                previousTitle = " was " + people[i]["Previous title"];
            }
            if (status == "leaving") {
                //previousTitle = "Was " + data[i]["Previous title"];
                previousTitle = "was " + people[i]["Previous title"] + "";
                title = "";
                totalOut++;
            }

            personHtml = personTemplate({
                photoSrc: people[i]["Photo"],
                personName: name,
                personAge: age,
                personFloor: floor
            });

            html += personHtml;
        }

        if(floorData.key) {
            html += `</div>`;
        }
    });

    personGroup.innerHTML = html;
    document.getElementById("gv-cabinet-footer").innerHTML = creditHtml;
    document.querySelector(".gv-cabinet-header h2").innerHTML = headlineHtml;

    if (mode != "full") {

        document.getElementById("show-more-person-button").addEventListener("click", function() {
            this.style.display = 'none';
            document.getElementById("person-group").className = "person-group expanded";
        });

        document.getElementById("show-more-leaving-button").addEventListener("click", function() {
            this.style.display = 'none';
            document.getElementById("leaving-group").className = "person-group expanded";
            outClicked = true;
        });

        outButton = document.getElementById("show-more-leaving-button");
        checkOutButton();

        // Run the event listener
        window.addEventListener('resize', eventThrottler, false);

    } else { // mode == full
        document.getElementById("leaving-group").className = "person-group expanded";
        document.getElementById("person-group").className = "person-group expanded";
        document.getElementById("show-more-leaving-button").style.display = 'none';
        document.getElementById("show-more-person-button").style.display = 'none';
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
