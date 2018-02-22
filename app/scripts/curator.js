'use strict';
var FEWCOOKIES = 10;
var MORECOOKIES = 20;
var HEALTHCURATOR_ROOT = "http://localhost:8888/hon-curator-website";
var curator = {

  getDomainFromUrl: function(link) {
    var domain = tldjs.getDomain(link);
    var subdomain = tldjs.getSubdomain(link);
    if (subdomain === 'www') {
      subdomain = '';
    }

    return subdomain !== '' ? subdomain + '.' + domain : domain;
  },

  getServiceById: (id, token) => {
    return $.ajax({
      beforeSend: function(request) {
        if (token) {
          request.setRequestHeader("Authorization", "Bearer " + token);
        }
      },
      url: HEALTHCURATOR_ROOT + '/api/v1/service/' + id
    });
  },

  getServiceByDomain: (domain) => {
    console.log(domain);
  },

  setBadges: function(prettyLink, token) {
      $('#certification-header').text(prettyLink);

      // Get website infos on curator
      curator.getServiceById(2, token).then((response) => {

        $('#certification').removeClass('certification-grey');
        $('#certification').addClass('certification-orange');
        $('#certification .known').css('display', 'block');
        $('#certification .unknown').css('display', 'none');

        const infos = response.data;
        $('#curator-link').attr('href', HEALTHCURATOR_ROOT + '/browser/' + infos.id);
        if (infos.ratings !== undefined && infos.ratings !== '0') {
          $('#certification-domain span').text(infos.ratings);
          $('#certification-header').text(infos.name);
          const starPercentage = (infos.ratings / 5) * 100;
          document.querySelector('#certification-domain .stars-inner')
            .style.width = `${(Math.round(starPercentage / 10) * 10)}%`;
        } else {
          $('#certification-domain span').text('No Rates');
        }

        chrome.runtime.sendMessage({
          msg: 'checkLogin',
          user_review: infos.user_review
        });
      });

      /*curator.getServiceByDomain(prettyLink).then((response) => {
       console.log(response);
       });*/

      if (true) {

      } else {
        $('#certification .known').css('display', 'none');
        $('#certification .unknown').css('display', 'block');
      }
  },

  clearLoginHeader:() => {
    $('#view-certificate').text('You\'re not logged in');
  },

  showLoginHeader:(username, userid) => {
    $('#view-certificate').html(
      $('<span>').text('You\'re logged as ').append(
        $('<a>', {
          target: '_blank',
          href: HEALTHCURATOR_ROOT + '/account/' + userid
        }).text(username)
      ).append(' | ').append(
        $('<a>', {
          id:'user-logout',
          href: '#',
        }).text('logout')
      )
    )
  },

  showReviewForm: () => {
    $('#mainPopup').html(
      $('<form>', {
        id: 'reviewForm',
        class: 'col-xs-10 center-block'
      }).append(
        $('<div>', {class: 'form-group'}).append(
          $('<label>', {
            for: 'review-title'
          }).text('Title of the review')
        ).append(
          $('<input>', {
            class: 'form-control review-field',
            name: 'title',
            type: 'text',
            required: '',
            placeholder: 'Your review title',
            id: 'review-title'
          })
        )
      ).append(
        $('<div>', {class: 'form-group rate-group'}).append(
          $('<label>', {
            for: 'review-rate'
          }).text('Global appreciation')
        ).append(
          $('<span>', {
            class: 'row review-field star-cb-group',
          }).append(
            $('<input>', {
              type: 'radio',
              id: 'review-rate-5',
              name: 'global_rate',
              value: 5
            })
          ).append(
            $('<label>', {
              for: 'review-rate-5'
            }).text('5')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'review-rate-4',
              name: 'global_rate',
              value: 4
            })
          ).append(
            $('<label>', {
              for: 'review-rate-4'
            }).text('4')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'review-rate-3',
              name: 'global_rate',
              value: 3
            })
          ).append(
            $('<label>', {
              for: 'review-rate-3'
            }).text('3')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'review-rate-2',
              name: 'global_rate',
              value: 2
            })
          ).append(
            $('<label>', {
              for: 'review-rate-2'
            }).text('2')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'review-rate-1',
              name: 'global_rate',
              value: 1
            })
          ).append(
            $('<label>', {
              for: 'review-rate-1'
            }).text('1')
          )
        )
      ).append(
        $('<div>', {class: 'form-group'}).append(
          $('<label>', {
            for: 'review-comment'
          }).text('Review')
        ).append(
          $('<textarea>', {
            class: 'form-control',
            rows: 4,
            required: '',
            cols:50,
            id: 'review-comment',
            name: 'global_comment',
          })
        )
      ).append(
        $('<button>', {
          class: 'btn btn-primary btn-lg btn-block',
          type: 'submit',
        }).text('Send my review')
      )
    );
  },

  showEditReviewForm: (review) => {
    console.log(review);
    $('#mainPopup').html(
      $('<form>', {
        id: 'editReviewForm',
        class: 'col-xs-10 center-block'
      }).append(
        $('<div>', {class: 'form-group'}).append(
          $('<label>', {
            for: 'edit-title'
          }).text('Title of the review')
        ).append(
          $('<input>', {
            class: 'form-control review-field col-xs-11',
            name: 'title',
            type: 'text',
            required: '',
            value: review.title,
            placeholder: 'Your review title',
            id: 'edit-title'
          })
        )
      ).append(
        $('<div>', {class: 'form-group rate-group'}).append(
          $('<label>', {
            for: 'edit-rate'
          }).text('Global appreciation')
        ).append(
          $('<span>', {
            class: 'row review-field star-cb-group',
          }).append(
            $('<input>', {
              type: 'radio',
              id: 'edit-rate-5',
              name: 'global_rate',
              value: 5
            })
          ).append(
            $('<label>', {
              for: 'edit-rate-5'
            }).text('5')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'edit-rate-4',
              name: 'global_rate',
              value: 4
            })
          ).append(
            $('<label>', {
              for: 'edit-rate-4'
            }).text('4')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'edit-rate-3',
              name: 'global_rate',
              value: 3
            })
          ).append(
            $('<label>', {
              for: 'edit-rate-3'
            }).text('3')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'edit-rate-2',
              name: 'global_rate',
              value: 2
            })
          ).append(
            $('<label>', {
              for: 'edit-rate-2'
            }).text('2')
          ).append(
            $('<input>', {
              type: 'radio',
              id: 'edit-rate-1',
              name: 'global_rate',
              value: 1
            })
          ).append(
            $('<label>', {
              for: 'edit-rate-1'
            }).text('1')
          )
        )
      ).append(
        $('<div>', {class: 'form-group'}).append(
          $('<label>', {
            for: 'edit-comment'
          }).text('Review')
        ).append(
          $('<textarea>', {
            class: 'form-control',
            rows: 4,
            required: '',
            cols:50,
            id: 'edit-comment',
            name: 'global_comment',
          })
        ).append(
          $('<input>', {
            type: 'hidden',
            name: 'review_id',
            id: 'edit_id',
            value: review.id
          })
        )
      ).append(
        $('<button>', {
          class: 'btn btn-primary btn-lg btn-block',
          type: 'submit',
        }).text('Edit my review')
      )
    );
    $('#edit-rate-'+ review.global_rate).attr('checked', true);
    $('#edit-comment').val(review.global_comment);
  },

  showLoginForm: (reason) => {
    var imgURL = chrome.extension.getURL('/images/icon-128.png');

    $('#mainPopup').html(
      $('<form>', {
        id: 'loginForm',
        class: 'col-xs-12'
      }).append(
        $('<img>', {
          class: 'center-block col-xs-4',
          src: imgURL
        })
      ).append(
        $('<div>', {class: 'form-group col-xs-8'}).append(
          $('<label>', {
            class: 'signin-field-icon fui-mail',
            for: 'signin-email'
          }).text('Email')
        ).append(
          $('<input>', {
            class: 'form-control signin-field',
            name: 'email',
            type: 'text',
            placeholder: 'Enter your email',
            id: 'signin-email'
          })
        )
      ).append(
        $('<div>', {class: 'form-group col-xs-8'}).append(
          $('<label>', {
            class: 'signin-field-icon fui-lock',
            for: 'signin-email'
          }).text('Password')
        ).append(
          $('<input>', {
            class: 'form-control signin-field',
            name: 'password',
            type: 'password',
            placeholder: 'Password',
            id: 'signin-pass'
          })
        )
      ).append(
        $('<button>', {
          class: 'btn btn-primary btn-lg btn-block',
          type: 'submit',
        }).text('Sign in')
      )
    );
  },

  setCountryBadge: function(data) {
    /*
    if (data.country) {
      $('#country').append(
        $('<div>', {class: 'v-wrapper'}).append(
          $('<span>', {
            class: 'flag flag-' + data.country.toLowerCase() + ' flag-size',
            'data-toggle': 'tooltip',
            'data-placement': 'bottom',
            title: chrome.i18n.getMessage(data.country.toUpperCase()),
          })
        ).append(
          $('<p>', {class: 'sub-wrapper'}).text(
            chrome.i18n.getMessage('country')
          )
        )
      );
    }
    */
  },
};
