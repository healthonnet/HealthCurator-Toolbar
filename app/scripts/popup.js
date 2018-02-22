'use strict';

var currentTab;
var query = {active: true, currentWindow: true};
var langNav = navigator.language.substring(0,2);

moment.locale(langNav);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == "loginToken") {
      if (request.token !== undefined
        && request.userid !== undefined
        && request.username !== undefined) {
        if (request.user_review) {
          curator.showEditReviewForm(request.user_review);
        } else {
          curator.showReviewForm();
        }
        curator.showLoginHeader(request.username, request.userid);
      }
    }
    if (request.msg == "requireLogin") {
      curator.clearLoginHeader();
      curator.showLoginForm(request.reason);
    }
    if (request.msg == "successLogin") {
      window.location = ''; // Refresh
    }
    if (request.msg == "reviewSuccess") {
      // Toast ?
      curator.showEditReviewForm(request.user_review)
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

    const prettyLink = curator.getDomainFromUrl(currentTab.url);
    if (prettyLink !== 'null.null') {
      chrome.storage.local.get('token', function(item) {
        curator.setBadges(prettyLink, item.token);
      });
    }
    recoverPopup();
  });

});

function recoverPopup() {
  // Popup must persist (re open without reset )
  setTimeout(()=> {
    chrome.storage.local.get(
      ['review-title','review-rate', 'review-comment', 'signin-email'],
      function(items) {
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
        'review-rate': $('input[name=global_rate]:checked').val(),
        'signin-email': $('#signin-email').val()
      });
    },1000);
  }, 300);
}

function initEvents() {
  $('body').on('submit', '#loginForm', (e) => {
    e.preventDefault();

    chrome.runtime.sendMessage({
      msg: "requestLogin",
      form: $('#loginForm').serialize()
    });
  });

  $('body').on('submit', '#reviewForm', (e) => {
    e.preventDefault();

    chrome.runtime.sendMessage({
      msg: "requestReview",
      form: $('#reviewForm').serialize(),
      url: currentTab.url
    });
  });

  $('body').on('submit', '#editReviewForm', (e) => {
    e.preventDefault();

    chrome.runtime.sendMessage({
      msg: "requestReview",
      form: $('#editReviewForm').serialize(),
      review_id: $('#editReviewForm #edit_id').val(),
      url: currentTab.url
    });
  });


  $('body').on('click', '#user-logout', (e) => {
    e.preventDefault();

    chrome.runtime.sendMessage({
      msg: "requestLogout",
    });
  });

}
