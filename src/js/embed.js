import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import personHTML from './text/person.html!text'
import _ from 'underscore'

var mode = null, data = null;

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1lrMs23YPKWxRStLVLiVj407bvIJvlG_WZxBMkVYui6I.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => buildApp(resp)
    });
};

function buildApp(resp) {

    mode= getParameterByName("mode");
    data = resp.sheets.Sheet1;

    if (mode === null) {
        mode = "full";
    }

    //console.log(mode);
    //console.log(data);
    //console.log(_);

    var i, html="", leaveHtml = "", personHtml, personTemplate = _.template(personHTML), personGroup = document.getElementById("person-group"), leaveGroup = document.getElementById("leaving-group"), status;

    for (i = 0; i<data.length; i++) {

        status = getStatusClass(data[i]["Status"]);

        personHtml = personTemplate({ photoSrc: data[i]["Photo"],
								personName: data[i]["Name"],
								personTitle: data[i]["Title"],
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
    
}

function getStatusClass( status ) {

    status=status.toLowerCase();

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
