/**
* shopify helper
* for umlaut
* by @aravindanve
* https://github.com/aravindanve
**/

var SHOPIFY_API_KEY = '32c5736a21d91d340e9134c5e879618a';
var SHOPIFY_CONFIG = {
    cartQuantityDisplaySelector: '[data-cart-quantity]',
    cartQuantityDisplayEmptyClass: 'cart_empty',
    cartButtonSelector: '[data-cart-button]',
    cartButtonActiveClass: 'cart_active',
    cartCheckoutButtonClasses: 'submit-button w-button',
    productIdContainerSelector: '[data-product-id]',
    productVariantsMenuSelector: '[data-product-variants]',
    productPriceDisplaySelector: '[data-product-price]',
    productComparePriceDisplaySelector: '[data-product-compare-price]',
    productAddButtonSelector: '[data-product-add]'
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
</script>',
'<script id="ShopifySelectTemplate" type="text/template">\
    <div class="shopify-select">\
        <select class="select" name="%NAME%">%OPTIONS%</select>\
        <svg class="shopify-select-icon" viewBox="0 0 24 24"><path d="M21 5.176l-9.086 9.353L3 5.176.686 7.647 12 19.382 23.314 7.647 21 5.176z"></path></svg>\
    </div>\
</script>'
];

$(function () {

    var DEBUG = false;

    var client;
    var products;
    var cart;
    var cartLineItemCount;
    var previousFocusItem;

    var alreadyInCart = [];

    var x = SHOPIFY_CONFIG;

    function log() {
        if (DEBUG) console.log.apply(console, arguments);
    }

    function init() {
        for (var i = 0; i < SHOPIFY_STYLES.length; i++) {
            $('head').append($(SHOPIFY_STYLES[i]));
        }
        for (var i = 0; i < SHOPIFY_TEMPLATES.length; i++) {
            $('body').append($(SHOPIFY_TEMPLATES[i]));
        }
        var checkoutClasses = x.cartCheckoutButtonClasses?
            x.cartCheckoutButtonClasses.split(/\s+/g) : [];

        for (var i = 0; i < checkoutClasses.length; i++) {
            $('.btn--cart-checkout')
                .addClass(checkoutClasses[i]);
        }

        log('init done');
        setupCart();
    }

    function setupCart() {
        function done() {
            $(x.cartButtonSelector)
                .on('click', cartButtonEventHandler);
            log('setupCart done');
            loadProducts();
        }
        client = ShopifyBuy.buildClient({
            domain: 'umlaut-shop.myshopify.com',
            apiKey: SHOPIFY_API_KEY,
            appId: '6',
        });

        if (localStorage && 
            localStorage.getItem('lastCartId')) {
            client
                .fetchCart(localStorage
                    .getItem('lastCartId'))
                    .then(function(remoteCart) {
                        cart = remoteCart;
                        cartLineItemCount = cart.lineItems.length;
                        alreadyInCart = [];
                        if (cart.lineItems.length) {
                            for (var i = 0; i < cart.lineItems.length; i++) {
                                alreadyInCart.push(
                                cart.lineItems[i].product_id);
                            }
                        }
                        renderCartItems();
                        done();
                    });

        } else {
            client
                .createCart()
                .then(function (newCart) {
                    cart = newCart;
                    localStorage.setItem('lastCartId', cart.id);
                    cartLineItemCount = 0;
                    done();
                });
        }
    }
    
    function loadProducts() {
        products = [];
        products._productRefs = {};
        products._productIds = [].concat(alreadyInCart);
        products._productLookup = {};

        $(x.productIdContainerSelector).each(function () {
            var $elem = $(this);

            var productId = ($elem.text()+'').trim();
            var $variantsMenu = $elem
                .siblings(x.productVariantsMenuSelector);
            var $priceDisplay = $elem
                .siblings(x.productPriceDisplaySelector);
            var $comparePriceDisplay = $elem
                .siblings(x.productComparePriceDisplaySelector);
            var $addButton = $elem
                .siblings(x.productAddButtonSelector);

            products._productRefs[productId] = {
                productId: productId,
                $variantsMenu: $variantsMenu,
                $priceDisplay: $priceDisplay,
                $comparePriceDisplay: $comparePriceDisplay,
                $addButton: $addButton,
                $idContainer: $elem
            };
            products._productIds.push(productId);
        });

        client.fetchQueryProducts({ 
            product_ids: products._productIds.length? 
                products._productIds : undefined

        }).then(function (items) {
            for (var i = 0; i < items.length; i++) {
                items[i].elements = products._productRefs[items[i].id] || {
                    productId: items[i].product_id,
                    $variantsMenu: $(),
                    $priceDisplay: $(),
                    $comparePriceDisplay: $(),
                    $addButton: $(),
                    $idContainer: $()
                };
                products.push(items[i]);
                products._productLookup[items[i].id] = items[i];
                items[i].elements.$addButton.each(function () {
                    this._product = items[i];
                });
            }
            log('loadProducts done');
            setupProducts();
        });
    }

    function setupProducts() {
        for (var i = 0; i < products.length; i++) {
            // attach add to cart listener
            products[i].elements.$addButton
                .on('click', addButtonEventHandler);

            products[i].elements.$variantsMenu
                .html(generateSelectors(products[i]));

            updatePrice(products[i]);
            attachOnVariantSelectListeners(products[i]);
        }
        updateCartTabButton();
        bindEventListeners();
        log('setupProducts done');
    }

    function updatePrice(product) {
        product.elements.$priceDisplay
            .html('$' + product.selectedVariant.price);
        product.elements.$comparePriceDisplay
            .html(product.selectedVariant.compareAtPrice?
                '$' + product.selectedVariant.compareAtPrice : '');
    }

    function bindEventListeners() {
        $('.cart .btn--close').on('click', closeCart);

        $(document).on('click', function(evt) {
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

        $('.btn--cart-checkout').on('click', function () {
            window.open(cart.checkoutUrl, '_self');
        });

        $('.cart').on('click', '.quantity-increment', function () {
            var productId = $(this).data('product-id');
            var variantId = $(this).data('variant-id');
            incrementQuantity(productId, variantId);
        });

        $('.cart').on('click', '.quantity-decrement', function() {
            var productId = $(this).data('product-id');
            var variantId = $(this).data('variant-id');
            decrementQuantity(productId, variantId);
        });

        $('.cart').on(
            'keyup', '.cart-item__quantity'

        , debounce(fieldQuantityHandler, 250));
    }

    function cartButtonEventHandler(e) {
        setPreviousFocusItem(this);
        if ($(x.cartButtonSelector).hasClass(x.cartButtonActiveClass)) {
            closeCart();

        } else {
            openCart();
        }
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

    function addOrUpdateVariant(variant) {
        openCart();
        var cartLineItem = findCartItemByVariantId(variant.id);

        if (cartLineItem) {
            updateVariantInCart(
                cartLineItem, cartLineItem.quantity + 1);

        } else {
            addVariantToCart(variant, 1);
        }
        updateCartTabButton();
    }

    function generateSelectors(product) {
        var variantCount = 0;
        var elements = product.options.map(function(option) {
            var optionsHtml = option.values.map(function(value) {
                variantCount++;
                return '<option value="' + value + '">' + value + '</option>';
            });

            return $('#ShopifySelectTemplate').html()
                .replace(/%NAME%/g, option.name)
                .replace(/%OPTIONS%/g, optionsHtml);
        });

        if (variantCount <= 1) {
            return '';
        }

        return elements;
    }

    function attachOnVariantSelectListeners(product) {
        product.elements.$variantsMenu.on(
            'change', 'select'

        , function(event) {
            var $element = $(event.target);
            var name = $element.attr('name');
            var value = $element.val();

            product.options.filter(function(option) {
                return option.name === name;
            })[0].selected = value;

            updatePrice(product);
        });
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
        var cartLineItem = findCartItemByVariantId(variant.id);
        if (cartLineItem) {
            quantity = fn(cartLineItem.quantity);
            updateVariantInCart(cartLineItem, quantity);
        }
    }

    function decrementQuantity(productId, variantId) {
        updateQuantity(function(quantity) {
            return quantity - 1;
        }, productId, variantId);
    }

    function incrementQuantity(productId, variantId) {
        updateQuantity(function(quantity) {
            return quantity + 1;
        }, productId, variantId);
    }

    function fieldQuantityHandler(evt) {
        var productId = parseInt(
            $(this).closest('.cart-item')
                .attr('data-product-id'), 10);
        var variantId = parseInt(
            $(this).closest('.cart-item')
                .attr('data-variant-id'), 10);

        var variant = getVariant(productId, variantId);
        var cartLineItem = findCartItemByVariantId(variant.id);
        var quantity = evt.target.value;
        if (cartLineItem) {
            updateVariantInCart(cartLineItem, quantity);
        }
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
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
        return cart.lineItems.filter(function (item) {
            return (item.variant_id === variantId);
        })[0];
    }

    function updateVariantInCart(cartLineItem, quantity) {
        var variantId = cartLineItem.variant_id;
        var cartLength = cart.lineItems.length;

        cart.updateLineItem(
            cartLineItem.id, quantity

        ).then(function(updatedCart) {
            var $cartItem = $('.cart')
                .find('.cart-item[data-variant-id="' + variantId + '"]');

            if (updatedCart.lineItems.length >= cartLength) {
                $cartItem
                    .find('.cart-item__quantity')
                    .val(cartLineItem.quantity);

                $cartItem
                    .find('.cart-item__price')
                    .text(formatAsMoney(cartLineItem.line_price));

            } else {
                $cartItem
                    .addClass('js-hidden')
                    .bind(
                        'transitionend webkitTransitionEnd ' + 
                        'oTransitionEnd MSTransitionEnd'

                    , function() {
                        $cartItem.remove();
                    });
            }

            updateCartTabButton();
            updateTotalCartPricing();

            if (updatedCart.lineItems.length < 1) {
                closeCart();
            }

        }).catch(function (errors) {
            console.log('error updating cart');
            console.error(errors);
        });
    }

    function addVariantToCart(variant, quantity) {
        openCart();
        cart.createLineItemsFromVariants({ 
            variant: variant, 
            quantity: quantity 

        }).then(function() {
            var cartItem = findCartItemByVariantId(variant.id);
            var $cartItem = renderCartItem(cartItem);
            var $cartItemContainer = $('.cart-item-container');
            $cartItemContainer.append($cartItem);
            setTimeout(function () {
                $cartItemContainer
                    .find('.js-hidden')
                    .removeClass('js-hidden');
            }, 0)

        }).catch(function (errors) {
            console.log('error updating cart');
            console.error(errors);
        });

        updateTotalCartPricing();
        updateCartTabButton();
    }

    function renderCartItem(lineItem) {
        var lineItemEmptyTemplate = $('#CartItemTemplate').html();
        var $lineItemTemplate = $(lineItemEmptyTemplate);
        var itemImage = lineItem.image && lineItem.image.src;
        $lineItemTemplate
            .attr('data-product-id', lineItem.product_id)
            .attr('data-variant-id', lineItem.variant_id);
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
            .text(formatAsMoney(lineItem.line_price));
        $lineItemTemplate
            .find('.cart-item__quantity')
            .attr('value', lineItem.quantity);
        $lineItemTemplate
            .find('.quantity-decrement')
            .attr('data-product-id', lineItem.product_id)
            .attr('data-variant-id', lineItem.variant_id);
        $lineItemTemplate
            .find('.quantity-increment')
            .attr('data-product-id', lineItem.product_id)
            .attr('data-variant-id', lineItem.variant_id);

        return $lineItemTemplate;
    }

    function renderCartItems() {
        var $cartItemContainer = $('.cart-item-container');
        $cartItemContainer.empty();
        var lineItemEmptyTemplate = $('#CartItemTemplate').html();
        var $cartLineItems = cart.lineItems.map(function (lineItem, index) {
            return renderCartItem(lineItem);
        });
        $cartItemContainer.append($cartLineItems);

        setTimeout(function () {
            $cartItemContainer
                .find('.js-hidden')
                .removeClass('js-hidden');
        }, 0)
        updateTotalCartPricing();
    }

    function updateTotalCartPricing() {
        $('.cart .pricing').text(formatAsMoney(cart.subtotal));
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
        if (cart.lineItems.length > 0) {
            $(x.cartQuantityDisplaySelector)
                .html(cart.lineItemCount)
                .removeClass(x.cartQuantityDisplayEmptyClass);

        } else {
            $(x.cartQuantityDisplaySelector)
                .html(0)
                .addClass(x.cartQuantityDisplayEmptyClass);
        }
    }

    function setPreviousFocusItem(item) {
        previousFocusItem = item;
    }

    init();

});
