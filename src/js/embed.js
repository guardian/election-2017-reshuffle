import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
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

    console.log(mode);
    console.log(data);
    console.log(_);
    
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
