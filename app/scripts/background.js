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

function checkLogin () {
  chrome.storage.local.get(['token', 'username', 'userid'], function(items) {
    if (!items.token || !items.username || !items.userid) {
      return chrome.runtime.sendMessage({
        msg: 'requireLogin',
        reason: 'logout'
      });
    }
    return chrome.runtime.sendMessage({
      msg: "loginToken",
      token: items.token,
      username: items.username,
      userid: items.userid
    });
  });
};

function requestLogin (form) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:8888/hon-curator-website/api/login", true);

  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var user = JSON.parse(xhr.response);
      if(user.token) {
        console.log(user);
        chrome.storage.local.set({
          token: user.token,
          username: user.user.name,
          userid: user.user.id,
        }, function() {

          return chrome.runtime.sendMessage({
            msg: 'loginToken',
            token: user.token,
            username: user.user.name,
            userid: user.user.id,
          });
        });
      } else {
        // Handle error
        return chrome.runtime.sendMessage({
          msg: 'requireLogin',
          reason: 'fail'
        });
      }
    }
  }
  xhr.send(form);
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.msg == "checkLogin") {
      checkLogin();
    }
    if(request.msg == "requestLogin") {
      requestLogin(request.form);

    }
  }
);
