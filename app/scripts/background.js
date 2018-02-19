'use strict';

function init() {
  // TODO Remove if not
}
init();

if (chrome.omnibox) {
  chrome.omnibox.onInputEntered.addListener(function(text) {
    var url = 'https://www.hon.ch/HONcode/Search/search.html';
    if (text) {
      url += '?siteurl=&cref=http%3A%2F%2Fwww.hon.ch' +
      '%2FCSE%2FHONCODE%2Fcontextlink.xml&sa=Search&hl=en&cof=FORID%3A11&q=' +
      encodeURIComponent(text);
    }
    chrome.tabs.query({active: true}, function(tab) {
      chrome.tabs.update(tab.id, {url: url});
    });
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {

});

var loginState = function() {
  // TODO Get stored Token
  var token = undefined;
  if (!token) {
    return chrome.runtime.sendMessage({
      msg: 'requireLogin',
      reason: 'logout'
    });
  }

  // TODO Try token validity
  var isValid = true;

  if (isValid) {
    return chrome.runtime.sendMessage({
      msg: "loginToken",
      token: token,
    });
  } else {
    return chrome.runtime.sendMessage({
      msg: 'requireLogin',
      reason: 'expired'
    });
  }

};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.msg == "checkLogin") {
      loginState();
    }
  }
);
