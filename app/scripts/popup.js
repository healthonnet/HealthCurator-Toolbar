'use strict';

var currentTab;
var query = {active: true, currentWindow: true};
var langNav = navigator.language.substring(0,2);

moment.locale(langNav);

chrome.runtime.sendMessage({ msg: "checkLogin" });



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == "loginToken") {
      if (request.token !== undefined
        && request.userid !== undefined
        && request.username !== undefined) {
        curator.showReviewForm();
        curator.showLoginHeader(request.username, request.userid);
      }
    }
    if (request.msg == "requireLogin") {
      curator.showLoginForm(request.reason);
    }
  }
);

chrome.tabs.query(query, function(tabs) {
  currentTab = tabs[0];
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
      ['review-title','review-rate', 'review-comment', 'signin-email'],
      function(items) {
        console.log(items);
        $('#review-title').val(items['review-title']);
        $('#review-rate-'+ items['review-rate']).attr('checked', true);
        $('#review-comment').val(items['review-comment']);
        $('#signin-email').val(items['signin-email']);
      }
    );
    setInterval(function(){
      console.log('save');
      chrome.storage.local.set({
        'review-title': $('#review-title').val(),
        'review-comment': $('#review-comment').val(),
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

    chrome.runtime.sendMessage({
      msg: "requestLogin",
      form: $('#loginForm').serialize()
    });
  });

  $('body').on('submit', '#reviewForm', (e) => {
    e.preventDefault();
    console.log('submit');

    chrome.runtime.sendMessage({
      msg: "requestReview",
      form: $('#reviewForm').serialize(),
      url: currentTab.url
    });
  });
}
