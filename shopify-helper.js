/**
* shopify helper v2
* for umlaut
* by @aravindanve
* https://github.com/aravindanve
**/

$(function () {

  var SHOPIFY_STOREFRONT_ACCESS_TOKEN = window.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '10bd4f387363aa3cd2fc3de336613378';
  var SHOPIFY_DOMAIN = window.SHOPIFY_DOMAIN || 'umlaut-shop.myshopify.com';
  var x = Object.assign({
    cartQuantityDisplaySelector: '[data-cart-quantity]',
    cartQuantityDisplayEmptyClass: 'cart_empty',
    cartButtonSelector: '[data-cart-button]',
    cartButtonActiveClass: 'cart_active',
    cartSmartButton: '[data-cart-smart-button]',
    cartSmartButtonHiddenClass: 'isHidden',
    cartCheckoutButtonClasses: 'submit-button w-button',
    productIdContainerSelector: '[data-product-id]',
    productVariantsMenuSelector: '[data-product-variants]',
    productPriceDisplaySelector: '[data-product-price]',
    productComparePriceDisplaySelector: '[data-product-compare-price]',
    productAddButtonSelector: '[data-product-add]'

  }, window.SHOPIFY_CONFIG);

  // globals
  var products = [];
  products._productRefs = {};
  products._productIds = [];
  products._productLookup = {};
  products._productIndex = {};
  products._getNewItemRef = function (productId) {
    return {
      productId: productId,
      $variantsMenu: $(),
      $priceDisplay: $(),
      $comparePriceDisplay: $(),
      $addButton: $(),
      $idContainer: $()
    };
  };
  products._addItem = function (item) {
    item.elements = products._productRefs[item.id] || products._getNewItemRef(item.id);
    if (!item.selectedVariant) { // HACK: for storefront api v1
      item.selectedVariant = item.variants && item.variants[0];
    }
    var currentIndex = products._productIndex[item.id];

    if (currentIndex) {
      products[currentIndex] = item;
      products._productLookup[item.id] = item;

    } else {
      products.push(item);
      products._productIndex = products.length - 1;
      products._productLookup[item.id] = item;
    }

    // add product reference to add button
    item.elements.$addButton.each(function () {
      this._product = item;
    });
  }

  var checkout = undefined;
  var checkoutLineItemCount = 0;

  var previousFocusItem = undefined;

  // create shopify client
  var client = ShopifyBuy.buildClient({
    domain: SHOPIFY_DOMAIN,
    storefrontAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN
  });

  function onDOMModificationsLoaded() {
    console.log('onDOMModificationsLoaded');
  }

  function onPageProductsLoaded() {
    console.log('onPageProductsLoaded', products);

    for (var i = 0; i < products.length; i++) {
      // attach add to cart listener
      products[i].elements.$addButton
        .off('click').on('click', addButtonEventHandler);

      // attach on variant select listener
      products[i].elements.$variantsMenu
        .off('change', 'select').on('change', 'select', variantSelectEventHandler);

      // TODO: generate variant selector on page
      // products[i].elements.$variantsMenu
      //   .html(generateOptions(products[i]));

      updateDOMProductPrice(products[i]);
    }
  }

  function onCheckoutLoaded() {
    console.log('onCheckoutLoaded', checkout);

    // setup cart
    $(x.cartButtonSelector).on('click', cartButtonEventHandler);

    // attach cart listeners
    $(document).on('click', function (evt) {
      if ((!$(evt.target).closest('.cart').length) &&
        (!$(evt.target).closest(x.cartButtonSelector).length)) {
        closeCart();
      }
    });

    var ESCAPE_KEYCODE = 27;
    $(document).on('keydown', function (evt) {
      if (evt.which === ESCAPE_KEYCODE) {
        if (previousFocusItem) {
          $(previousFocusItem).focus();
          previousFocusItem = ''
        }
        closeCart();
      }
    });

    $('.cart .btn--close').on('click', closeCart);

    $('.btn--cart-checkout').on('click', function () {
      window.open(checkout.webUrl, '_self');
    });

    $('.cart').on('click', '.quantity-increment', function () {
      var productId = $(this).data('cart-product-id');
      var variantId = $(this).data('cart-variant-id');
      incrementQuantity(productId, variantId);
    });

    $('.cart').on('click', '.quantity-decrement', function () {
      var productId = $(this).data('cart-product-id');
      var variantId = $(this).data('cart-variant-id');
      decrementQuantity(productId, variantId);
    });

    $('.cart').on('keyup', '.cart-item__quantity',
      debounce(fieldQuantityHandler, 250));
  }

  function updateDOMProductPrice(product) {
    console.log('updateDOMProductPrice', product, product.elements.$priceDisplay);

    product.elements.$priceDisplay
      .html('$' + product.selectedVariant.price);
    product.elements.$comparePriceDisplay
      .html(product.selectedVariant.compareAtPrice ?
        '$' + product.selectedVariant.compareAtPrice : '');
  }

  function addButtonEventHandler(e) {
    e.preventDefault();
    if (!e.target._product) return true;
    var product = e.target._product;

    addOrUpdateVariant(product.selectedVariant);
    setPreviousFocusItem(e.target);
    focusCheckout();
    return false;
  }

  function variantSelectEventHandler(e) {
    // TODO: implement variant select
    // set selected variant
    // update product price on page
  }

  function cartButtonEventHandler(e) {
    setPreviousFocusItem(this);
    if ($(x.cartButtonSelector).hasClass(x.cartButtonActiveClass)) {
      closeCart();

    } else {
      openCart();
    }
  }

  function updateVariantInCart(checkoutLineItem, quantity) {
    quantity = +quantity;
    var variantId = checkoutLineItem.variant.id;
    var lineItemsLength = checkout.lineItems.length;

    client.checkout.updateLineItems(checkout.id, [{
      id: checkoutLineItem.id, quantity: quantity

    }]).then(function (updatedCheckout) {
      checkout = updatedCheckout;
      checkoutLineItemCount = checkout.lineItems.length;
      var updatedCheckoutLineItem = findCartItemByVariantId(variantId);
      var $cartItem = $('.cart')
        .find('.cart-item[data-cart-variant-id="' + variantId + '"]');

      if (checkout.lineItems.length >= lineItemsLength) {
        $cartItem
          .find('.cart-item__quantity')
          .val(updatedCheckoutLineItem.quantity);

        $cartItem
          .find('.cart-item__price')
          .text(formatAsMoney(getLineItemPrice(updatedCheckoutLineItem)));

      } else {
        $cartItem
          .addClass('js-hidden')
          .bind(
            'transitionend webkitTransitionEnd ' +
            'oTransitionEnd MSTransitionEnd'

            , function () {
              $cartItem.remove();
            });
      }

      updateCartTabButton();
      updateTotalCartPricing();

      if (checkout.lineItems.length < 1) {
        closeCart();
      }

    }).catch(function (error) {
      console.error('error updating cart', error);
    });
  }

  function addVariantToCart(variant, quantity) {
    openCart();
    client.checkout.addLineItems(checkout.id, [{
      variantId: variant.id,
      quantity: quantity

    }]).then(function (updatedCheckout) {
      checkout = updatedCheckout;
      checkoutLineItemCount = checkout.lineItems.length;
      var cartItem = findCartItemByVariantId(variant.id);
      var $cartItem = makeCartItemFromLineItem(cartItem);
      var $cartItemContainer = $('.cart-item-container');
      // NOTE: clicking on add to cart in quick succession renders
      // multiple cart items for the same product, remove this item
      var $redundantCartItem = $('.cart')
        .find('.cart-item[data-cart-variant-id="' + variant.id + '"]');
      if ($redundantCartItem.length) {
        $redundantCartItem.remove();
      }
      $cartItemContainer.append($cartItem);
      setTimeout(function () {
        $cartItemContainer
          .find('.js-hidden')
          .removeClass('js-hidden');
      }, 0);

      updateTotalCartPricing();
      updateCartTabButton();

    }).catch(function (error) {
      console.error('error updating cart', error);
    });
  }

  function addOrUpdateVariant(variant) {
    openCart();
    var checkoutLineItem = findCartItemByVariantId(variant.id);

    if (checkoutLineItem) {
      updateVariantInCart(
        checkoutLineItem, checkoutLineItem.quantity + 1);

    } else {
      addVariantToCart(variant, 1);
    }
    updateCartTabButton();
  }

  function getVariant(productId, variantId) {
    var product = products._productLookup[productId];
    return product.variants.filter(function (variant) {
      return (variant.id === variantId);
    })[0];
  }

  function updateQuantity(fn, productId, variantId) {
    var variant = getVariant(productId, variantId);
    var quantity;
    var checkoutLineItem = findCartItemByVariantId(variant.id);
    if (checkoutLineItem) {
      quantity = fn(checkoutLineItem.quantity);
      updateVariantInCart(checkoutLineItem, quantity);
    }
  }

  function decrementQuantity(productId, variantId) {
    updateQuantity(function (quantity) {
      return quantity - 1;
    }, productId, variantId);
  }

  function incrementQuantity(productId, variantId) {
    updateQuantity(function (quantity) {
      return quantity + 1;
    }, productId, variantId);
  }

  function fieldQuantityHandler(evt) {
    var productId = $(this).closest('.cart-item')
      .attr('data-cart-product-id');
    var variantId = $(this).closest('.cart-item')
      .attr('data-cart-variant-id');

    var variant = getVariant(productId, variantId);
    var checkoutLineItem = findCartItemByVariantId(variant.id);
    var quantity = evt.target.value;
    if (checkoutLineItem) {
      updateVariantInCart(checkoutLineItem, quantity);
    }
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }

  function focusCheckout() {
    $('#checkout').focus();
  }

  function openCart() {
    $(x.cartButtonSelector).addClass(x.cartButtonActiveClass);
    $('.cart').addClass('js-active');
  }

  function closeCart() {
    $(x.cartButtonSelector).removeClass(x.cartButtonActiveClass);
    $('.cart').removeClass('js-active');
    $('.overlay').removeClass('js-active');
  }

  function findCartItemByVariantId(variantId) {
    return checkout.lineItems.filter(function (item) {
      return (item.variant.id === variantId);
    })[0];
  }

  function getLineItemPrice(lineItem) {
    return lineItem.quantity * lineItem.variant.price;
  }

  function makeCartItemFromLineItem(lineItem) {
    var lineItemEmptyTemplate = $('#CartItemTemplate').html();
    var $lineItemTemplate = $(lineItemEmptyTemplate);
    var itemImage = lineItem.variant.image && lineItem.variant.image.src;
    $lineItemTemplate
      .attr('data-cart-product-id', lineItem.variant.product.id)
      .attr('data-cart-variant-id', lineItem.variant.id);
    $lineItemTemplate
      .addClass('js-hidden');
    if (itemImage) {
      $lineItemTemplate
        .find('.cart-item__img')
        .css('background-image', 'url(' + itemImage + ')');
    }
    $lineItemTemplate
      .find('.cart-item__title')
      .text(lineItem.title);
    if (lineItem.variant_title &&
      lineItem.variant_title != 'Default Title') {
      $lineItemTemplate
        .find('.cart-item__variant-title')
        .text(lineItem.variant_title);
    }
    $lineItemTemplate
      .find('.cart-item__price')
      .text(formatAsMoney(getLineItemPrice(lineItem)));
    $lineItemTemplate
      .find('.cart-item__quantity')
      .attr('value', lineItem.quantity);
    $lineItemTemplate
      .find('.quantity-decrement')
      .attr('data-cart-product-id', lineItem.variant.product.id)
      .attr('data-cart-variant-id', lineItem.variant.id);
    $lineItemTemplate
      .find('.quantity-increment')
      .attr('data-cart-product-id', lineItem.variant.product.id)
      .attr('data-cart-variant-id', lineItem.variant.id);

    return $lineItemTemplate;
  }

  function renderCartItems() {
    var $cartItemContainer = $('.cart-item-container');
    var lineItemEmptyTemplate = $('#CartItemTemplate').html();
    var $checkoutLineItems = checkout.lineItems.map(function (lineItem, index) {
      return makeCartItemFromLineItem(lineItem);
    });

    $cartItemContainer
      .empty()
      .append($checkoutLineItems);

    setTimeout(function () {
      $cartItemContainer
        .find('.js-hidden')
        .removeClass('js-hidden');
    }, 0);

    updateTotalCartPricing();
  }

  function updateTotalCartPricing() {
    $('.cart .pricing').text(formatAsMoney(checkout.totalPrice));
  }

  function formatAsMoney(
    amount, currency, thousandSeparator,
    decimalSeparator, localeDecimalSeparator

  ) {
    currency = currency || '$';
    thousandSeparator = thousandSeparator || ',';
    decimalSeparator = decimalSeparator || '.';
    localeDecimalSeparator = localeDecimalSeparator || '.';
    var regex = new RegExp('(\\d)(?=(\\d{3})+\\.)', 'g');

    return currency + parseFloat(amount, 10).toFixed(2)
      .replace(localeDecimalSeparator, decimalSeparator)
      .replace(regex, '$1' + thousandSeparator)
      .toString();
  }

  function updateCartTabButton() {
    if (checkout.lineItems.length > 0) {
      $(x.cartQuantityDisplaySelector)
        .html(checkout.lineItems.length)
        .removeClass(x.cartQuantityDisplayEmptyClass);

      $(x.cartSmartButton)
        .removeClass(x.cartSmartButtonHiddenClass);

      $('.btn--cart-checkout')
        .removeAttr('disabled');

    } else {
      $(x.cartQuantityDisplaySelector)
        .html(0)
        .addClass(x.cartQuantityDisplayEmptyClass);

      $(x.cartSmartButton)
        .addClass(x.cartSmartButtonHiddenClass);

      $('.btn--cart-checkout')
        .prop('disabled', true);
    }
  }

  function setPreviousFocusItem(item) {
    previousFocusItem = item;
  }

  // apply dom modifications
  setTimeout(function () {
    for (var i = 0; i < SHOPIFY_STYLES.length; i++) {
      $('head').append($(SHOPIFY_STYLES[i]));
    }
    for (var i = 0; i < SHOPIFY_TEMPLATES.length; i++) {
      $('body').append($(SHOPIFY_TEMPLATES[i]));
    }
    var checkoutClasses = x.cartCheckoutButtonClasses ?
      x.cartCheckoutButtonClasses.split(/\s+/g) : [];

    for (var i = 0; i < checkoutClasses.length; i++) {
      $('.btn--cart-checkout')
        .addClass(checkoutClasses[i]);
    }

  }, 0);

  // process products on page
  setTimeout(function () {
    $(x.productIdContainerSelector).each(function () {
      var $elem = $(this);

      var productId = Base64.encode('gid://shopify/Product/' + ($elem.text() + '').trim());
      var $variantsMenu = $elem
        .siblings(x.productVariantsMenuSelector);
      var $priceDisplay = $elem
        .siblings(x.productPriceDisplaySelector);
      var $comparePriceDisplay = $elem
        .siblings(x.productComparePriceDisplaySelector);
      var $addButton = $elem
        .siblings(x.productAddButtonSelector);

      // set product reference
      products._productRefs[productId] = products._productRefs[productId] || products._getNewItemRef(productId);
      products._productRefs[productId].$variantsMenu =
        products._productRefs[productId].$variantsMenu.add($variantsMenu);
      products._productRefs[productId].$priceDisplay =
        products._productRefs[productId].$priceDisplay.add($priceDisplay);
      products._productRefs[productId].$comparePriceDisplay =
        products._productRefs[productId].$comparePriceDisplay.add($comparePriceDisplay);
      products._productRefs[productId].$addButton =
        products._productRefs[productId].$addButton.add($addButton);
      products._productRefs[productId].$idContainer =
        products._productRefs[productId].$idContainer.add($elem);

      // push product id
      if (products._productIds.indexOf(productId) === -1) {
        products._productIds.push(productId);
      }
    });

    // fetch products
    client.product
      .fetchMultiple(products._productIds)
      .then(function (items) {
        for (var i = 0; i < items.length; i++) {
          products._addItem(items[i]);
        }
        // done
        onPageProductsLoaded();
      })
      .catch(function (err) {
        console.error('error loading products', err);
      });

  }, 0);

  // load cart
  setTimeout(function () {
    var lastCheckoutId = localStorage && localStorage.getItem('lastCheckoutId');

    if (lastCheckoutId) {
      client.checkout
        .fetch(lastCheckoutId)
        .then(function (remoteCheckout) {
          checkout = remoteCheckout;
          checkoutLineItemCount = checkout.lineItems.length;

          var extraProductIds = [];
          for (var i = 0; i < checkout.lineItems.length; i++) {
            var productId = checkout.lineItems[i].variant.product.id;
            if (products._productIds.indexOf(productId) === -1) {
              products._productIds.push(productId);
              extraProductIds.push(productId);
            }
          }

          // fetch extra products
          if (extraProductIds.length) {
            client.product
              .fetchMultiple(extraProductIds)
              .then(function (items) {
                for (var i = 0; i < items.length; i++) {
                  products._addItem(items[i]);
                }
                // done
                renderCartItems();
                updateCartTabButton();
                onCheckoutLoaded();
              })
              .catch(function (err) {
                console.error('error loading products', err);
              });

          } else {
            // done
            renderCartItems();
            updateCartTabButton();
            onCheckoutLoaded();
          }
        });

    } else {
      client.checkout
        .create()
        .then(function (newCheckout) {
          checkout = newCheckout;
          checkoutLineItemCount = 0;
          localStorage.setItem('lastCheckoutId', checkout.id);
          // done
          updateCartTabButton();
          onCheckoutLoaded();
        });
    }

  }, 0);

});

// other
var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = (n & 3) << 4 | r >> 4;
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64
      } else if (isNaN(i)) {
        a = 64
      }
      t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
    }
    return t
  },
  decode: function (e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = s << 2 | o >> 4;
      r = (o & 15) << 4 | u >> 2;
      i = (u & 3) << 6 | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r)
      }
      if (a != 64) {
        t = t + String.fromCharCode(i)
      }
    }
    t = Base64._utf8_decode(t);
    return t
  },
  _utf8_encode: function (e) {
    e = e.replace(/rn/g, "n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r)
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128)
      } else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128)
      }
    }
    return t
  },
  _utf8_decode: function (e) {
    var t = "";
    var n = 0;
    var r = c1 = c2 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
        n += 2
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        n += 3
      }
    }
    return t
  }
};

var SHOPIFY_STYLES = [
  '<style>\
.shopify-buy input {\
  -webkit-appearance: textfield;\
  margin: 0;\
}\
\
.clearfix:after {\
  content: "";\
  display: table;\
  clear: both;\
}\
\
.visuallyhidden {\
  border: 0;\
  height: 1px;\
  margin: -1px;\
  overflow: hidden;\
  padding: 0;\
  position: absolute;\
  width: 1px;\
}\
\
.btn {\
  max-width: 100%;\
  width: 100%;\
  text-align: center;\
}\
\
.btn--test {\
  position: absolute;\
  top: 50%;\
  left: 50%;\
  transform: translate(-50%);\
}\
\
.btn--cart-tab {\
  padding: 5px 11px;\
  border-radius: 3px 0 0 3px;\
  position: fixed;\
  right: 0;\
  top: 50%;\
  transform: translate(100%, -50%);\
  opacity: 0;\
  min-width: inherit;\
  width: auto;\
  height: auto;\
  z-index: 2;\
}\
.btn--cart-tab.js-active {\
  transform: translateY(-50%);\
  opacity: 1;\
}\
\
.btn__counter {\
  display: block;\
  margin: 0 auto 10px auto;\
  font-size: 18px;\
}\
\
.icon-cart--side {\
  height: 20px;\
  width: 20px;\
}\
\
.cart {\
  position: fixed;\
  width: 100%;\
  max-width: 350px;\
  height: 100%;\
  right: 0;\
  top: 0;\
  z-index: 3;\
  background: white;\
  border-radius: 1px;\
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);\
  transform: translateX(100%);\
  transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;\
}\
.cart.js-active {\
  transform: translateX(0);\
  box-shadow: -5px 0 5px rgba(0, 0, 0, 0.1);\
}\
\
.cart-section {\
  position: relative;\
  padding: 20px;\
}\
\
.cart-section--top {\
  z-index: 5;\
}\
\
.cart-title {\
  color: #767676;\
  display: inline-block;\
  font-weight: 400;\
  font-size: 18px;\
  line-height: 1.5;\
  overflow: hidden;\
  white-space: nowrap;\
  text-overflow: ellipsis;\
  max-width: 90%;\
}\
\
.btn--close {\
  position: absolute;\
  right: 18px;\
  top: 20px;\
  margin-top: 20px;\
  margin-bottom: 10px;\
  font-size: 20px;\
  color: #767676;\
  border: none;\
  background: transparent;\
  transition: transform 100ms ease;\
  cursor: pointer;\
}\
.btn--close:hover {\
  transform: scale(1.2);\
  color: dimgray;\
}\
\
.cart-form {\
  position: absolute;\
  height: 100%;\
  width: 100%;\
  top: 0;\
  padding: 70px 0 140px 0;\
}\
\
.cart-item-container {\
  height: 100%;\
  position: relative;\
  overflow-x: hidden;\
  overflow-y: auto;\
  -webkit-overflow-scrolling: touch;\
  perspective: 400px;\
  perspective-origin: 50% 0px;\
}\
\
.cart-item {\
  margin-bottom: 20px;\
  overflow: hidden;\
  backface-visibility: visible;\
  min-height: 65px;\
  position: relative;\
  opacity: 1;\
  transition: opacity 0.2s ease-in-out;\
}\
.cart-item.js-hidden {\
  opacity: 0;\
}\
.cart-item.js-working:after {\
  content: "";\
  position: absolute;\
  top: 0;\
  left: 0;\
  width: 100%;\
  height: 100%;\
  background: rgba(255, 255, 255, 0.5);\
  z-index: 2;\
}\
\
.cart-item__img {\
  width: 65px;\
  height: 65px;\
  border-radius: 3px;\
  background-size: contain;\
  background-repeat: no-repeat;\
  background-position: center center;\
  background-color: #e5e5e5;\
  position: absolute;\
}\
\
.cart-item__content {\
  width: 100%;\
  padding-left: 75px;\
}\
\
.cart-item__content-row {\
  margin-bottom: 5px;\
}\
\
.cart-item__variant-title {\
  float: right;\
  font-weight: bold;\
  font-size: 11px;\
  line-height: 17px;\
  color: #767676;\
}\
\
.cart-item__quantity-container {\
  border: 1px solid #767676;\
  float: left;\
  border-radius: 3px;\
}\
\
.quantity-decrement, .quantity-increment {\
  color: #767676;\
  display: block;\
  float: left;\
  height: 21px;\
  line-height: 16px;\
  font-family: monospace;\
  width: 25px;\
  padding: 0;\
  border: none;\
  background: transparent;\
  box-shadow: none;\
  cursor: pointer;\
  font-size: 18px;\
  text-align: center;\
}\
\
.cart-item__quantity {\
  color: black;\
  width: 38px;\
  height: 21px;\
  font-size: inherit;\
  border: none;\
  text-align: center;\
  -moz-appearance: textfield;\
  background: transparent;\
  border-left: 1px solid #767676;\
  border-right: 1px solid #767676;\
  display: block;\
  float: left;\
  padding: 0;\
  border-radius: 0;\
}\
\
input[type=number]::-webkit-inner-spin-button,\
input[type=number]::-webkit-outer-spin-button {\
  -webkit-appearance: none;\
  margin: 0;\
}\
\
.cart-item__price {\
  line-height: 23px;\
  float: right;\
  font-weight: bold;\
}\
\
.cart-bottom {\
  border-top: 1px solid #a5a5a5;\
}\
\
.cart-info {\
  padding: 15px 20px 10px;\
}\
\
.cart-info__total {\
  float: left;\
  text-transform: uppercase;\
}\
\
.cart-info__small {\
  font-size: 11px;\
}\
\
.cart-info__pricing {\
  float: right;\
}\
\
.cart-discount-notice {\
  color: #767676;\
  margin-bottom: 10px;\
}\
\
.cart-actions-container {\
  padding-top: 5px;\
}\
\
.pricing {\
  margin-left: 5px;\
  font-size: 16px;\
  color: black;\
}\
\
.product-title,\
.variant-title,\
.variant-image,\
.variant-price {\
  margin-bottom: 20px;\
}\
\
.variant-selectors {\
  margin-bottom: 20px;\
}\
.variant-selectors label {\
  display: block;\
  margin-bottom: 5px;\
}\
\
.shopify-select {\
  border: 1px solid #d3dbe2;\
  border-radius: 3px;\
  box-sizing: border-box;\
  position: relative;\
  background: #ffffff;\
  overflow: hidden;\
  vertical-align: bottom;\
}\
\
.shopify-select select {\
  padding: 15px 10px;\
}\
\
.shopify-select-icon {\
  cursor: pointer;\
  display: block;\
  fill: #798c9c;\
  position: absolute;\
  right: 10px;\
  top: 50%;\
  margin-top: -6px;\
  pointer-events: none;\
  width: 12px;\
  height: 12px;\
  vertical-align: middle;\
}\
\
.select {\
  font-size: 16px;\
  padding: 7px 10px;\
  padding-right: 32px;\
  border: 0;\
  width: 100%;\
  background: transparent;\
  -webkit-appearance: none;\
  -moz-appearance: none;\
}\
\
.type--center {\
  text-align: center;\
}\
</style>'
];

var SHOPIFY_TEMPLATES = [
  '<div class="cart">\
    <!-- .cart-section begin // cart header -->\
    <div class="cart-section cart-section--top">\
        <h2 class="cart-title">Your cart</h2>\
        <button class="btn--close">\
            <span aria-role="hidden">\
                <span class="lnr lnr-cross"></span>\
            </span>\
            <span class="visuallyhidden">Close</span>\
        </button>\
    </div>\
    <!-- .cart-section end -->\
    <!-- .cart-form begin // cart body -->\
    <div class="cart-form">\
        <div class="cart-item-container cart-section"></div>\
        <!-- .cart-bottom begin -->\
        <div class="cart-bottom">\
            <div class="cart-info clearfix cart-section">\
                <div class="type--caps cart-info__total cart-info__small">Total</div>\
                <div class="cart-info__pricing">\
                    <span class="cart-info__small cart-info__total">USD</span>\
                    <span class="pricing pricing--no-padding"></span>\
                </div>\
            </div>\
            <div class="cart-actions-container cart-section type--center">\
                <div class="cart-discount-notice cart-info__small">Shipping and discount codes are added at checkout.</div>\
                <input type="submit" class="btn btn--cart-checkout" id="checkout" name="checkout" value="Checkout">\
            </div>\
        </div>\
        <!-- .cart-bottom end -->\
    </div>\
    <!-- .cart-form end -->\
</div>',
  '<script id="CartItemTemplate" type="text/template">\
    <div class="cart-item">\
        <div class="cart-item__img"></div>\
        <div class="cart-item__content">\
            <div class="cart-item__content-row">\
                <div class="cart-item__variant-title"></div>\
                <span class="cart-item__title"></span>\
            </div>\
            <div class="cart-item__content-row">\
                <div class="cart-item__quantity-container">\
                    <button class="btn--seamless quantity-decrement" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>\
                    <input class="cart-item__quantity" type="number" min="0" aria-label="Quantity">\
                    <button class="btn--seamless quantity-increment" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>\
                </div>\
                <span class="cart-item__price"></span>\
            </div>\
        </div>\
    </div>\
</script>'
];
