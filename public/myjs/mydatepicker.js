$(function () {

  if (!window['console']) {
    window.console = {};
    window.console.log = function () {
    };
  }

  var date_range_picker_object = {
    inline: true,
    container: '#date-range0-container',
    alwaysOpen: false,
    autoClose: true,
    showShortcuts: false,
    //startOfWeek: 'monday',
    beforeShowDay: function (t) {
      var valid = !(t.getDay() == 0 || t.getDay() == 6);  //disable saturday and sunday
      var _class = '';
      var _tooltip = valid ? '' : 'We are closed on weekends';
      return [true, _class, _tooltip];
    },
    showDateFilter: function (time, date) {
      var dt = new Date(time);
      var date_disabled = (dt.getDay() == 0 || dt.getDay() == 6);
      if (date_disabled) {
        return '<div style="padding:0 5px;pointer-events: none;">\
                 <span style="font-weight:lighter;font-style: oblique; opacity: 0.3">' + date + '</span>\
                </div>';
      } else {
        return '<div style="padding:0 5px;">\
                 <span style="font-weight:normal;">' + date + '</span>\
                </div>';
      }
    },
    getValue: function () {
      return this.innerHTML;
    },
    setValue: function (s) {
      this.innerHTML = s;
    },
    maxDays: 120,
    startDate: new Date(),
    endDate: '2020-12-31'
  }

  $('#date-range0').dateRangePicker(date_range_picker_object)
    .bind('datepicker-first-date-selected', function (event, obj) {
      /* This event will be triggered when first date is selected */
      console.log('first-date-selected', obj);
      // obj will be something like this:
      // {
      // 		date1: (Date object of the earlier date)
      // }
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
      /* This event will be triggered before date range picker open animation */
      console.log('before open');
    })
    .bind('datepicker-opened', function () {
      /* This event will be triggered after date range picker open animation */
      console.log('after open');
    });
});
