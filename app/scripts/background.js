'use strict';

function init() {
  // TODO Remove if not
}

init();
var HEALTHCURATOR_ROOT = 'http://dev.healthcurator.org';

if (chrome.omnibox) {
  chrome.omnibox.onInputEntered.addListener(function(text) {
    var url = HEALTHCURATOR_ROOT;
    if (text) {
      url += '/browser?search=' +
      encodeURIComponent(text);
    }
    chrome.tabs.query({active: true}, function(tab) {
      chrome.tabs.update(tab.id, {url: url});
    });
  });
}

function checkLogin(user_review) {
  chrome.storage.local.get(['token', 'username', 'userid'], function(items) {
    if (!items.token || !items.username || !items.userid) {
      return chrome.runtime.sendMessage({
        msg: 'requireLogin',
        reason: 'logout',
      });
    }
    return chrome.runtime.sendMessage({
      msg: 'loginToken',
      token: items.token,
      username: items.username,
      userid: items.userid,
      user_review: user_review,
    });
  });
}

function requestLogin(form) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', HEALTHCURATOR_ROOT + '/api/login', true);

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var user = JSON.parse(xhr.response);
      if (user.token) {
        console.log(user);
        chrome.storage.local.set({
          token: user.token,
          username: user.user.name,
          userid: user.user.id,
        }, function() {

          return chrome.runtime.sendMessage({
            msg: 'successLogin',
          });
        });
      } else {
        // Handle error
        return chrome.runtime.sendMessage({
          msg: 'requireLogin',
          reason: 'fail',
        });
      }
    }
  };
  xhr.send(form);
}

function requestLogout() {
  chrome.storage.local.remove(['token', 'username', 'userid'], function() {
    return chrome.runtime.sendMessage({
      msg: 'requireLogin',
      reason: 'logout',
    });
  });
}

function refreshToken(oldtoken, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', HEALTHCURATOR_ROOT + '/api/refresh', true);

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onload = function() {
    var response = JSON.parse(xhr.response);

    if (response.error) {
      return chrome.runtime.sendMessage({
        msg: 'requireLogin',
        reason: 'token expired',
      });
    }

    chrome.storage.local.set({
      token: response.token,
    }, function() {
      callback(response.token);
    });
  };
  xhr.onerror = function() {
    callback(xhr.response);
  };
  xhr.send('token=' + oldtoken);
}

function postReview(form, url, token, review_id) {

  var pathArray = url.split('/');
  url = pathArray[0] + '//' + pathArray[2];

  var xhr = new XMLHttpRequest();
  if (review_id) {
    xhr.open('POST', HEALTHCURATOR_ROOT + '/api/v1/review/update/' +
      review_id, true);
  } else {
    xhr.open('POST', HEALTHCURATOR_ROOT + '/api/v1/review/create', true);
    form += '&host=' + url;
  }

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var response = JSON.parse(xhr.response);

      if (response.error) {
        refreshToken(token, function(newToken) {
          console.log('retry');
          postReview(form, url, newToken);
        });
      }

      // Success
      return chrome.runtime.sendMessage({
        msg: 'reviewSuccess',
        user_review: response.data,
      });
    }
  };

  xhr.send(form);
}

function requestReview(form, url, review_id) {
  chrome.storage.local.get('token', function(item) {
    postReview(form, url, item.token, review_id);
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === 'checkLogin') {
      checkLogin(request.user_review);
    }
    if (request.msg === 'requestLogin') {
      requestLogin(request.form);
    }
    if (request.msg === 'requestReview') {
      requestReview(request.form, request.url, request.review_id);
    }
    if (request.msg === 'requestLogout') {
      requestLogout();
    }
  }
);
