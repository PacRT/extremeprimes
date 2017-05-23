$(function () {

  if (!window['console']) {
    window.console = {};
    window.console.log = function () {
    };
  }

  function getDaysInMonth(month, year) {
    switch(month) {
      case 0: return 31; break;
      case 1:
        return (year%4 == 0)? 29 : 28;
        break;
      case 2: return 31; break;
      case 3: return 30; break;
      case 4: return 31; break;
      case 5: return 30; break;
      case 6: return 31; break;
      case 7: return 31; break;
      case 8: return 30; break;
      case 9: return 31; break;
      case 10: return 30; break;
      case 11: return 31; break;
    }
  }
  
  // Get the value of the supplied URL parameter - the URL is the current URL shown on 
  // Browser
  var getUrlParameter = function getUrlParameter(sParam) {
      var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	  sURLVariables = sPageURL.split('&'), sParameterName, i;

      for (i = 0; i < sURLVariables.length; i++) {
          sParameterName = sURLVariables[i].split('=');
          if (sParameterName[0] === sParam) {
              return sParameterName[1] === undefined ? true : sParameterName[1];
          }
      }
  };
  

  function effectiveToday() {
    var today = new Date();
    var effective_today = new Date();
    var hour_now = (today.getUTCHours() - 7 + 24)%24;
    if(hour_now >= 17) effective_today.setDate(today.getDate()+1);
    $.post('/new-item-availability-date', {sku: getUrlParameter('sku')}, function (data, status) {
		//alert('lala' + data)
		return effective_today;
    }); //work on it
    return effective_today;
  }

  var date_range_picker_object = {
    inline: true,
    container: '#date-range0-container',
    alwaysOpen: false,
    autoClose: true,
    showShortcuts: false,
    //startOfWeek: 'monday',
    beforeShowDay: function(t)
		{
			//Change the configuration here.
			var dateRange = 'May 04 2017,May 09 2017,May 15 2017-May 30 2017,Jun 5 2017-Jun 09 2017';
			//Get the data from html page of input-date id.
			//var dateRange = $('#input-date').text();
			var dateArray = dateRange.split(",");	//Split the data separated by coma and store in array.
			var disabledDateArray = [];
			var disabledDateArrayList = [];
			//alert(1);
			
			//Find if the element of the array is a single date or date range.
			$.each(dateArray, function( index, date ) {
					//If hyphen(-) is not there in the data that means it is a single date. Store it in disabledDateArray
					if(date.search("-")<0) {
						disabledDateArray.push(new Date(date).getTime());
					}
					//If hyphen(-) is there in the data that means it is date range. Store it in disabledDateArrayList
					else {
						disabledDateArrayList.push(date);
					}
			});
			
			var valid = true;

			var theDate = new Date(t.setHours(0,0,0,0));
			//If the date is in disabledDateArray then the disable the date.
			if ($.inArray(theDate.getTime(), disabledDateArray) > -1) {
				valid = false;
			}
			//Loop for every date range data list.
			$.each(disabledDateArrayList, function( index, date1 ) {
					var dateL = date1.split("-");
					//If the date is in between date range then disable the date.
					if(theDate >= new Date(dateL[0]) && theDate <= new Date(dateL[1])) {
							valid = false;
					} 
			});
			
			if(valid) {
					valid = !(t.getDay() == 0 || t.getDay() == 6);  //disable saturday and sunday
			}
	
			var _class = '';
			var _tooltip = valid ? '' : 'not available';
			return [valid,_class,_tooltip];
		},
    /*showDateFilter: function (time, date) {
      var dt = new Date(time);
      var date_disabled = (dt.getDay() == 0 || dt.getDay() == 6);
      if (date_disabled) {
        return '<div style="padding:0 5px;pointer-events: none; cursor: none">\
                 <span style="font-weight:lighter;font-style: oblique; opacity: 0.3">' + date + '</span>\
                </div>';
      } else {
        return '<div style="padding:0 5px;">\
                 <span style="font-weight:normal;">' + date + '</span>\
                </div>';
      }
    },*/
    getValue: function () {
      return this.innerHTML;
    },
    setValue: function (s) {
      this.innerHTML = s;
    },
    maxDays: 120,
    startDate: effectiveToday(), //new Date(),
    endDate: '2030-12-31'
  }

  $('#date-range0').dateRangePicker(date_range_picker_object)
    .bind('datepicker-first-date-selected', function (event, obj) {
      /* This event will be triggered when first date is selected */
      console.log('first-date-selected', obj);
      // obj will be something like this:
      // {
      // 		date1: (Date object of the earlier date)
      // }
      var today = effectiveToday(); // After 5 PM is practically next day

      var month_offset = (today.getMonth == obj.date1.getMonth) ? 0 : getDaysInMonth(today.getMonth(), today.getYear())
      var day_offset = (today.getDay() == 6) ? 1 : 0; // other days does not matter as they are not weekends
      if(today.getDay() == 0 | today.getDay() == 6) {
        if(month_offset + obj.date1.getDate() - today.getDate() < 3 + day_offset) {
          //alert('We do not ship in the weekends. Please allow at least 2 working days for shipping OR pick up from store');
          $('#delivery_mechanism').text('YES')
        }
      } else if(month_offset + obj.date1.getDate() - today.getDate() < 2) {
        //alert('Please allow at least 2 working days for shipping OR pick up from store');
        $('#delivery_mechanism').text('PICKUP')
      } else {
        $('#delivery_mechanism').text('MAIL')
      }

      if(new Date(obj.date1).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)) {
        //alert('you selected today\'s date')
        $('#delivery_mechanism').text('PICKUP')
      } else if(new Date(obj.date1).setHours(0,0,0,0) == new Date().setHours(0,0,0,0) + 86400000) {
        //alert('you selected tomorrow\'s date')
        $('#delivery_mechanism').text('PICKUP')
      } else {
        $('#delivery_mechanism').text('MAIL')
      }
    })
    .bind('datepicker-change', function (event, obj) {
      /* This event will be triggered when second date is selected */
      console.log('change', obj);
      // obj will be something like this:
      // {
      // 		date1: (Date object of the earlier date),
      // 		date2: (Date object of the later date),
      //	 	value: "2013-06-05 to 2013-06-07"
      // }
      var days = Math.round((obj.date2 - obj.date1) / 1000 / 60 / 60 / 24 + 1)
      $('#no_of_days').html(days);
      $('#date_range').html(obj.value);
      var sku_price = Number($('#sku_price').text());
      console.log('sku_price: ', sku_price);
      var sqrt_15 = 3.873;
      var rental_price = Math.round(sku_price / sqrt_15 / 10 * Math.sqrt(days));
      console.log('renatl price: ', rental_price);
      $('#you_pay').html('<strong>' + rental_price + '</strong>');
    })
    .bind('datepicker-apply', function (event, obj) {
      /* This event will be triggered when user clicks on the apply button */
      console.log('apply', obj);
    })
    .bind('datepicker-close', function () {
      /* This event will be triggered before date range picker close animation */
      console.log('before close');
    })
    .bind('datepicker-closed', function () {
      /* This event will be triggered after date range picker close animation */
      console.log('after close');
    })
    .bind('datepicker-open', function () {
      $('.over_order_warning').attr('hidden', true); //Clear up the previous warning
      /* This event will be triggered before date range picker open animation */
      console.log('before open');
    })
    .bind('datepicker-opened', function () {
      /* This event will be triggered after date range picker open animation */
      console.log('after open');
    });
});





