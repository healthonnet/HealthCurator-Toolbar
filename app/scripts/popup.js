'use strict';

var currentTab;
var query = {active: true, currentWindow: true};
var langNav = navigator.language.substring(0,2);

moment.locale(langNav);

chrome.runtime.sendMessage({ msg: "checkLogin" });



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == "loginToken") {
      if (request.token !== undefined) {
        curator.showReviewForm(request.token);
      }
    }
    if (request.msg == "requireLogin") {
      curator.showLoginForm(request.reason);
    }
  }
);

chrome.tabs.query(query, function(tabs) {
  currentTab = tabs[0];
  $('h1').text(chrome.i18n.getMessage('appName'));
  $('#khresmoi').text(chrome.i18n.getMessage('khresmoiTitle'));
  $('#q').attr('placeholder',
    chrome.i18n.getMessage('khresmoiPlaceholder'));
  $('#searchSubmit').text(chrome.i18n.getMessage('khresmoiSearch'));
  $('#donate').append(
    $('<a>', {
      target: '_blank',
      href: 'https://www.paypal.com/cgi-bin/webscr' +
        '?cmd=_s-xclick&hosted_button_id=YH3ZJP32PN4PS',
    }).text(' ' + chrome.i18n.getMessage('donate')).prepend(
      $('<i>', {class: 'fa fa-heart'})
    )
  );
  $(document).ready(() => {
    initEvents();
    curator.setBadges(currentTab.url);
    $('.search.container form').attr('action', 'https://www.healthcurator.org/' + langNav + '/browser');
    recoverPopup();
  });

});

function recoverPopup() {
  // Popup must persist (re open without reset )
  setTimeout(()=> {
    chrome.storage.local.get(
      ['review-title','review-rate', 'signin-email'],
      function(items) {
        console.log(items);
        $('#review-title').val(items['review-title']);
        $('#review-rate-'+ items['review-rate']).attr('checked', true);
        $('#signin-email').val(items['signin-email']);
      }
    );
    setInterval(function(){
      chrome.storage.local.set({
        'review-title': $('#review-title').val(),
        'review-rate': $('input[name=global-rate]:checked').val(),
        'signin-email': $('#signin-email').val()
    });
    },1000);
  }, 200);
}

function initEvents() {
  console.log("set events");

  $('body').on('submit', '#loginForm', (e) => {
    e.preventDefault();
    console.log('submit');

    chrome.runtime.sendMessage({
      msg: "requestLogin",
      form: $('#loginForm').serialize()
    });
  });
}


function onRequestLogin(email, password) {
  console.log(email, password);
  chrome.runtime.sendMessage({
    msg: "requestLogin",
    email: email,
    password: password
  });
}
