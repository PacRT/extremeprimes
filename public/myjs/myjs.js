/*var section = document.getElementById("shop-1-2");
 setTimeout(function () {
 section.style.display = "none";
 }, 1000);*/

var content_right_query_cache = '/content-right?';

$('#groups li').click(function () {
  $('#groups li').removeClass('active');
  $(this).addClass('active');
  //window.location.href ='/index?manufacturer='+this.id;
  var theid = this.id; //e.g mfr:leica, cat:slr_killers
  var idarr = theid.split(':');
  var partone = idarr[0]; //e.g. mfr or cat
  var parttwo = idarr[1]; // e.g. leica or slr_killer
  var id = partone;

  content_right_query_cache = '/content-right?' + partone + '=' + parttwo.toUpperCase();
  $.get(content_right_query_cache, function (data, status) {
    $('#content-right').html(data);
  });
});

var camera_checked = false;
var lens_checked = false;
var accessory_checked = false;
resetTypeCheckBoxes();

function handleTypeClick(cb) {
  var type_checked = $(cb).attr('value');
  if (type_checked == 'camera') {
    camera_checked = cb.checked;
  } else if (type_checked == 'lens') {
    lens_checked = cb.checked;
  } else if (type_checked == 'accessory') {
    accessory_checked = cb.checked;
  } else {
    //what should we handle here?
  }
  var filter = '&camera=' + camera_checked + '&lens=' + lens_checked + '&accessory=' + accessory_checked;
  $.get(content_right_query_cache + filter, function (data, status) {
    $('#content-right').html(data);
    $('#type_camera_cb').prop('checked', camera_checked);
    $('#type_lens_cb').prop('checked', lens_checked);
    $('#type_accessory_cb').prop('checked', accessory_checked);
  });
  resetTypeCheckBoxes();
}

function resetTypeCheckBoxes() {
  $('#type_camera_cb').attr('id', camera_checked);
  $('#type_lens_cb').attr('id', lens_checked);
  $('#type_accessory_cb').attr('id', accessory_checked);
}

$('#header-nav li').click(function () {
  $('#header-nav li').removeClass('active');
  $(this).addClass('active');
});

$('#confirm_order').click(function () {
  $('#confirm_order').prop('disabled', true);
  // check the final availability of the products
  if (cart.length == 0) {
    $('.over_order_warning').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Cart is empty');
    $('.over_order_warning').attr('hidden', false);
  } else {
    $('#shipping_payment').attr('hidden', false);
    preOrderConf()
  }
});

function preOrderConf() {
  var warning = "";
  preOrderConfirmation(function (_cart) {
    $.post('/pre-order-conf', {data: _cart}, function (data, status, xhr) {
      // update cart if availability has different reality
      if (status == 'success') {
        var bcart = beautifyCart();
        data.map((elem) => {
          if (elem.serialNos.length == 0 && bcart.get(elem.skuid).quantity > 0) {
            warning += warning == "" ? "" : "<br/>"
            warning = warning + " <strong>" + elem.skuid + " is not available for the selected period </strong>";
            //bcart.get(elem.skuid).quantity = 0;
            removeItemFromCart(bcart, elem.skuid);
          } else if (elem.serialNos.length < bcart.get(elem.skuid).quantity) {
            warning += warning == "" ? "" : "<br/>"
            warning = warning + "<strong>Only " + elem.serialNos.length + " of " + elem.skuid + " is/are available for the selected period</strong>";
            bcart.get(elem.skuid).quantity = elem.serialNos.length;
          } else {
            //alert('This item is available during selected period: ' +elem.skuid);
          }
        });
        if (warning != "") {
          warning = '<a href="#over_order_warning" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + warning;
          $('.over_order_warning').html(warning);
          $('.over_order_warning').attr('hidden', false);
        } else {
          $('.over_order_warning').attr('hidden', true);
        }
        refreshCartArrFromMap(bcart);
        loadCartTable(); // redraw the carttable
        $('#cart_item_count').html(cart.length);
      } else {
        alert('failed');
      }
    }, 'json');
  });
}

var cart = [];

if (typeof(Storage) != undefined && localStorage.getItem('cart') != null) {
  console.log("Here .... non empty local storage .. ")
  cart = JSON.parse(localStorage.getItem('cart'));
  console.log("Cart from local storage: " + JSON.stringify(cart));
  $('#cart_item_count').html(cart.length);
}

$("#add2cart").click(function () {
  console.debug("add to cart has been called ...");
  var cart_item = {
    sku_id: $('#sku_id').text(),
    sku_name: $('#sku_name').text(),
    no_of_days: $('#no_of_days').text(),
    date_range: $('#date_range').text(),
    you_pay: $('#you_pay').text(),
    delivery_mechanism: $('#delivery_mechanism').text()
  }
  if (cart_item.no_of_days == "NO") {
    // no duration is selected
  }
  else
    cart.push(cart_item)
  beautifyCart();
  $('#cart_item_count').html(cart.length);
  console.log('cart: ', JSON.stringify(cart))
  console.log($("#date-range0").text())
  putInLocalStorage('cart', JSON.stringify(cart));
  preOrderConf();
});

function putInLocalStorage(key, value) {
  if (typeof(Storage) !== undefined) {
    // Code for localStorage/sessionStorage.
    localStorage.setItem(key, value);
  } else {
    // Sorry! No Web Storage support..
    console.log("Sorry no local storage support")
  }
}

function beautifyCart() {
  var cartmap = new Map();
  cart.map(function (el) {
    var mapItem = cartmap.get(el.sku_id);
    if (mapItem == null) {
      if (el.quantity == null)
        el.quantity = 1;
      cartmap.set(el.sku_id, el);
    }
    else {
      el.quantity = mapItem.quantity + 1;
      cartmap.set(el.sku_id, el);
    }
  });
  refreshCartArrFromMap(cartmap);
  return cartmap;
}

function refreshCartArrFromMap(cartmap) {
  var arrcart = [];
  cartmap.forEach(function (val, key) {
    arrcart.push(val);
  });
  cart = arrcart;
  if (typeof(Storage) !== undefined) {
    localStorage.setItem('cart', JSON.stringify(arrcart));
  } else {
    console.log("Sorry no local storage support")
  }
}

var uniquePackages = new Set

function loadCartTable() {
  var bcart = beautifyCart();
  var html_fragment = "";
  var subtotal = 0;
  bcart.forEach(function (elem, key) {
    var lineTotal = Number(Number(elem.you_pay) * elem.quantity).toFixed(2);
    subtotal = Number(subtotal) + Number(lineTotal);
    if (elem.quantity != 0) {
      if(elem.delivery_mechanism != 'PICKUP') {
        uniquePackages.add(elem.date_range.trim())
      }
      html_fragment += "<tr><td>" +
        "<a href='#' class='remove' title='Remove this item' data-toggle='tooltip' data-placement='top'><i class='fa fa-trash'>" +
        "<span hidden='hidden'>" + elem.sku_id + "</span></i>" +
        "</a>" +
        "</td>" +
        "<td><a href='#'>" + elem.sku_name + "</a></td>" +
        "<td>" + elem.date_range + "</td>" +
        "<td>" + elem.no_of_days + "</td>" +
        "<td>$" + Number(elem.you_pay).toFixed(2) + "</td>" +
        "<td>" +
        "<form class='form-inline'>" +
        "<div class='form-group'>" +
        "<label class='sr-only' for='exampleInputAmount'>Quantity</label>" +
        "<div class='input-group'>" +
        "<span class='input-group-btn'>" +
        "<button class='btn btn-default dcr-btn' type='button' style='outline: none; cursor: inherit;'>-</button>" +
        "</span>" +
        "<input type='text' skku_idd='" + elem.sku_id + "' size='2' class='form-control quantity-class' placeholder='1' value='" + elem.quantity + "'>" +
        //elem.quantity +
        "<span class='input-group-btn'>" +
        "<button class='btn btn-default incr-btn' type='button' style='outline: none; cursor: inherit;'>+</button>" +
        "</span>" +
        "</div> </div> </form>" +
        "</td>" +
        "<td><strong>$" + lineTotal + "</strong></td>" +
        "<td><strong>" + elem.delivery_mechanism + "</strong></td>" +
        "</tr>";
    }
  });
  $('#cart_table').html(html_fragment);
  $('#cart_sub_total').html(Number(subtotal).toFixed(2));
  var big_total = Number(subtotal) + uniquePackages.size * 25;

  if(uniquePackages.size > 1) {
    $('.imp-info').html('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;' +
      '</a>There will be multiple shipments due to different dates. Shipping Chargess will be more accordingly');
    $('.imp-info').attr('hidden', false);
  }

  putInLocalStorage('number_of_packages', uniquePackages.size);

  $('.number_of_packages').html(uniquePackages.size + 'X ')
  $('.g_total').html(Number(big_total).toFixed(2));
  putInLocalStorage('charge_amount', Number(big_total).toFixed(2));
  $('.remove').click(function (evt) {
    var skkuu_id = evt.target.getElementsByTagName("span")[0].textContent;
    removeItemFromCart(bcart, skkuu_id);
  });
  //$('.quantity-class').change(function() {alert('change')});
  //$('.quantity-class').focusout(function() {alert('focus out')});
  $('.quantity-class').keyup(function () {
    var the_sku_id = $(this).attr('skku_idd');
    //if(Number($(this).val()) == 0) removeItemFromCart(bcart, the_sku_id)
    updateQuantity(bcart, the_sku_id, Number($(this).val()));
  });
  $('.incr-btn').click(function () {
    var the_sku_id = $(this).parent().prev().attr('skku_idd');
    updateQuantity(bcart, the_sku_id, Number($(this).parent().prev().val()) + 1);
  });
  $('.dcr-btn').click(function () {
    var the_sku_id = $(this).parent().next().attr('skku_idd');
    updateQuantity(bcart, the_sku_id, Number($(this).parent().next().val()) - 1);
  });
}
function updateQuantity(bcart, skuid, quantity) {
  bcart.get(skuid).quantity = quantity;
  refreshCartArrFromMap(bcart);
  $('#cart_item_count').html(cart.length);
  loadCartTable();
}
function removeItemFromCart(bcart, skuid) {
  bcart.delete(skuid.trim());
  refreshCartArrFromMap(bcart);
  $('#cart_item_count').html(cart.length);
  loadCartTable();
}

function preOrderConfirmation(cb) {
  cart.map(function (elem) {
    elem.linetotal = Number(Number(elem.you_pay) * elem.quantity).toFixed(2);
    var date_range_arr = elem.date_range.split('to').map(function (el) {
      return el.trim();
    });
    elem.startdate = date_range_arr[0];
    elem.enddate = date_range_arr[1];
  });
  cb(cart);
}

function createReceipt() {
  console.log("loading cart table..");
  var bcart = beautifyCart();
  cart = [];
  $('#cart_item_count').html('Empty');
  var html_fragment = "";
  var subtotal = 0;
  bcart.forEach(function (elem, key) {
    var lineTotal = Number(Number(elem.you_pay) * elem.quantity).toFixed(2);
    subtotal += Number(lineTotal);
    console.log('Elem: ' + JSON.stringify(elem));
    html_fragment += "<tr><td><a href='#'>" + elem.sku_name + "</a></td>" +
      "<td>" + elem.date_range + "</td>" +
      "<td>" + elem.no_of_days + "</td>" +
      "<td>$" + Number(elem.you_pay).toFixed(2) + "</td>" +
      "<td>" +
      "<!--form class='form-inline'>" +
      "<div class='form-group'>" +
      "<label class='sr-only' for='exampleInputAmount'>Quantity</label>" +
      "<div class='input-group'>" +
      "<span class='input-group-btn'>" +
      "<button class='btn btn-default' type='button' style='outline: none; cursor: inherit;'>-</button>" +
      "</span -->" +
      "<!-- input type='text' size='2' class='form-control' placeholder='1' value=" + elem.quantity + " -->" +
      elem.quantity +
      "<!-- span class='input-group-btn'>" +
      "<button class='btn btn-default' type='button' style='outline: none; cursor: inherit;'>+</button>" +
      "</span>" +
      "</div> </div> </form -->" +
      "</td>" +
      "<td><strong>$" + lineTotal + "</strong></td></tr>";
  });
  $('#cart_table').html(html_fragment);
  console.log('subtotal: ', subtotal);
  $('#cart_sub_total').html('$' + Number(subtotal).toFixed(2));
  var number_of_packages = Number(localStorage.getItem('number_of_packages'));

  var big_total = Number(subtotal) + number_of_packages * 25;
  $('.number_of_packages').html(number_of_packages + 'X ')
  console.log('big_total: ', big_total);
  $('.g_total').html('$' + Number(big_total).toFixed(2));
  $('.number_of_packages').html(number_of_packages);
  localStorage.clear(); // Clear up the localstorgae -- Very IMPORTANT
}

/*$('#search').click(() => {
  //alert('Search button clicked ' +  $('#search_field').val())
  $.post(
    //type: "POST",
    "/search",
    {data: $('#search_field').val()},
  function (result, success) {
      // Should we do anything?
      //alert('Result: ' + result)
      //$(":root").html(result)
    })
}); */

/*function getData() {
 // Grab the template
 $.get('/results.ejs', function (template) {
 // Compile the EJS template.
 var func = ejs.compile(template);

 // Grab the data
 $.get('/data', function (data) {
 // Generate the html from the given data.
 var html = func(data);
 $('#divResults').html(html);
 });
 });
 } */

function onSlrKillerClick(param) {
  $.ajax({
    url: "/skus",
    /*data: {
     zipcode: 97201
     },*/
    success: function (result) {
      var products = result.data.map(function (product) {
        return "<li>" + JSON.stringify(product) + "</li>"
      });
      $("#products").html("<strong>" + products + "</strong>" + param);
    }
  });
}

//Shuvankar
function insertSkus() {
  //Validate the input field
  var error = "";
  if(!$('#skus-id')[0].checkValidity()) { error = error + 'enter id;'; };
  if(!$('#skus-manufacturer')[0].checkValidity()) { error = error + 'enter manufacturer;'; };
  if(!$('#skus-model')[0].checkValidity()) { error = error + 'enter model;'; };
  if(!$('#skus-type')[0].checkValidity()) { error = error + 'enter type;'; };
  if(!$('#skus-totalquantity')[0].checkValidity()) { error = error + 'enter totalquantity;'; };
  if(!$('#skus-quantityavailable')[0].checkValidity()) { error = error + 'enter quantityavailable;'; };
  if(!$('#skus-marketprice')[0].checkValidity()) { error = error + 'enter marketprice;'; };
  if(!$('#skus-text')[0].checkValidity()) { error = error + 'enter text;'; };

  if(error != "") { alert(error); return; }
  console.log('begin insert');
  var jsonString = "{" +
                  "\"id\":\"" + $("#skus-id").val() +  "\"," +
                  "\"manufacturer\":\"" + $("#skus-manufacturer").val() +  "\"," +
                  "\"model\":\"" + $("#skus-model").val() +  "\"," +
                  "\"type\":\"" + $("#skus-type").val() +  "\"," +
                  "\"category\":\"" + $("#skus-category").val() +  "\"," +
                  "\"totalquantity\":\"" + $("#skus-totalquantity").val() +  "\"," +
                  "\"quantityavailable\":\"" + $("#skus-quantityavailable").val() +  "\"," +
                  "\"introdate\":\"" + $("#skus-introdate").val() +  "\"," +
                  "\"marketprice\":\"" + $("#skus-marketprice").val() +  "\"," +
                  "\"links\":\"" + $("#skus-links").val() +  "\"," +
                  "\"relatedskus\":\"" + $("#skus-relatedskus").val() +  "\"," +
                  "\"text\":\"" + $("#skus-text").val() +  "\"," +
                  "\"description\":\"" + $("#skus-description").val() +  "\"," +
                  "\"reviews\":\"" + $("#skus-reviews").val() + "\"" +
                  "}";
  var jsonData = $.parseJSON(jsonString);
  $.ajax({
    url: "skus-create",
    type: "POST",
    dataType: "json",
    data: jsonData,
    success: function (result) {
        console.log(result);
        if(result.status == 200){
            console.log('inserted');
        }
    },
    error: function(result){
        console.log(result);
    }
  });
}

/* TODO
function updateSkus() {
  $ajax({
    url: "skus-insert",
    type: "POST"
  });
}*/

/* TODO
function deleteSkus() {
  $ajax({
    url: "skus-insert",
    type: "POST"
  });
}*/
