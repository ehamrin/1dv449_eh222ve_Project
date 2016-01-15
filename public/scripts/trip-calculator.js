Date.prototype.formattedDateString = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

var products = localStorage.getItem('rawProducts') ? JSON.parse(localStorage.getItem('rawProducts')) : {};
var distances = localStorage.getItem('distances') ? JSON.parse(localStorage.getItem('distances')) : {};

var distanceXHR;

var AlcoholTrip = {
    Init: function(){

        //Lets add all the events
        AlcoholTrip.AddEvents();

        //And draw the UI
        AlcoholTrip.Cart.draw();
        AlcoholTrip.Locator.draw();
        AlcoholTrip.Gas.Consumption.draw();
        AlcoholTrip.Distance.update();
    },

    Container: {
        //Store these so we don't have to call them multiple times
        result: $('#search_result'),
        searchBar: $("#product_search"),
        cart: $("#cart"),
        clearHelper: $(".clear-helper")
    },

    AddEvents: function(){

        /*
         * Search functionality
         */

        var xhr;

        AlcoholTrip.Container.searchBar.focus();
        AlcoholTrip.Container.searchBar.keyup(function(e){
            if(xhr){
                xhr.abort();
            }

            //User probably typed something, so let them clear it again easily
            AlcoholTrip.Container.clearHelper.show();


            if(e.target.value.length >= 3){
                //User typed something long enough that we want to search for it
                xhr = $.ajax({
                    type: "GET",
                    url: "/json/AlcoholTrip/products.json?search=" + encodeURI(e.target.value),
                    success: AlcoholTrip.Search.add,
                    error: function(xhr, status, error) {
                        //If user didn't abort we weren't able to get to the server
                        if(xhr.statusText != "abort"){
                            AlcoholTrip.Container.result.html("<p class='network-error'>Kunde inte ansluta till servern</p>")
                        }
                    }
                });

            }else if(e.target.value.length == 0){
                //User manually cleared the search box
                AlcoholTrip.Container.result.empty();
                AlcoholTrip.Container.clearHelper.hide();
            }

        });

        //Empty results if user "clears" search-box
        AlcoholTrip.Container.clearHelper.click(function(){
            if(xhr){
                xhr.abort();
            }
            AlcoholTrip.Container.searchBar.val("");
            AlcoholTrip.Container.result.empty();
            AlcoholTrip.Container.clearHelper.hide();
        });

        $("#search_form").submit(function(e){
            e.preventDefault();
        });

        /*
         * End search functionality
         */


        /*
         * Cart functionality
         */

        //Lets user remove items from cart
        AlcoholTrip.Container.cart.on("click", ".remove", function(e){
            var element = $(this);
            if(!element.hasClass("remove")){
                element = element.closest(".remove");
            }

            var id = element.data("remove");
            AlcoholTrip.Cart.remove(id);
        });

        //Lets user edit items in cart be re-adding them
        AlcoholTrip.Container.cart.on('click', '.product', function(e){
            var element = $(this);
            if(!element.hasClass("product")){
                element = element.closest(".product");
            }

            var id = element.data("id");
            AlcoholTrip.Cart.add(id);
        });

        //Lets user add items to cart from search-result
        AlcoholTrip.Container.result.on('click', 'li', function(e){
            var id = $(this).data("id");
            AlcoholTrip.Cart.add(id);
        });

        /*
         * End cart functionality
         */

        //Update users gas consumption
        $("#gasConsumption").on("change",function(){
            AlcoholTrip.Gas.Consumption.set($(this).val());
            AlcoholTrip.Gas.Consumption.update();
        });

        //User updated their location or the destination
        $("#location").on("change", AlcoholTrip.Distance.update);
        $("#destination").on("change", AlcoholTrip.Distance.update);

        //User updated their gas type
        $("#gas_type").on("change", AlcoholTrip.Result.calculate);

        //User wants to inspect the results
        $("#view_results").on("click", AlcoholTrip.Result.showDetails);

        //User is on mobile and views/hides the menu
        $('#cart_menu').click(function(e){
            $('body').toggleClass('active');
        });
    },

    Search: {
        add: function(json){

            var html = "";
            AlcoholTrip.Container.result.empty();

            json.forEach(function(el){
                products[el.id] = el;
                localStorage.setItem('rawProducts', JSON.stringify(products));

                html += '<li class="product" data-id="' + el.id + '">' +
                    '<span class="title">' + el.name + ' (' + el.alcohol + ')</span>' +
                    '<span class="producer">Producerad av:' + el.producer + '</span>' +
                    '<span class="price">' + el.price + 'kr</span>' +
                    '<span class="container">' + el.volume + 'ml (' + el.container + ')</span>' +
                    '</li>';
            });

            if(html != ""){
                AlcoholTrip.Container.result.html("<ul>" + html + "</ul>")
            }
        }
    },

    Result: {
        showDetails: function () {

            var localCost = AlcoholTrip.Cart.total;
            var borderCost = AlcoholTrip.Cart.borderPrice + (AlcoholTrip.Gas.Consumption.liter * 12.48 * 2);

            var html = '<div id="result_details">';
            html += "<span><strong>Bensinförbrukning:</strong> " + parseFloat(AlcoholTrip.Gas.Consumption.get()) + "</span>";
            html += "<span><strong>Avstånd:</strong> " + Math.round(AlcoholTrip.Distance.mile) + " mil</span>";
            html += "<span><strong>Literförbrukning:</strong> " + Math.round(AlcoholTrip.Gas.Consumption.liter * 2) + " liter</span>";
            html += "<span><strong>" + AlcoholTrip.Gas.Price.getText() + "pris:</strong> " + AlcoholTrip.Gas.Price.getPrice().toFixed(2) + "kr/liter</span>";
            html += "<span><strong>Total resekostnad:</strong> " + Math.round(AlcoholTrip.Gas.Consumption.liter * AlcoholTrip.Gas.Price.getPrice() * 2) + "kr</span>";
            html += "<span><strong>Alkoholpris:</strong> " + Math.round(AlcoholTrip.Cart.borderPrice) + "kr</span>";
            html += "<span><strong>Systemetpris:</strong> " + Math.round(AlcoholTrip.Cart.total) + "kr</span>";
            html += "</div>";

            var type = borderCost < localCost ? "success" : "error";

            swal({
                title: "Detaljer",
                text: html,
                html: true,
                type: type
            });
        },

        calculate: function () {
            var localCost = AlcoholTrip.Cart.total;
            var borderCost = AlcoholTrip.Cart.borderPrice + (AlcoholTrip.Gas.Consumption.liter * AlcoholTrip.Gas.Price.getPrice() * 2);
            var resultContainer = $("#result");

            if (localCost) {
                var html;

                if (borderCost < localCost) {
                    html = '<p class="success">Du sparar ' + Math.round(localCost - borderCost) + 'kr på att åka iväg</p>';
                } else if (borderCost == localCost) {
                    html = '<p class="error">Du går jämt upp på åka iväg,<br/> är det värt det?</p>';
                } else {
                    html = '<p class="error">Du sparar ' + Math.round(borderCost - localCost) + 'kr<br/>på att stanna hemma</p>';
                }

                $("#result_banner").html(html);
                resultContainer.show();
            } else {
                resultContainer.hide();
            }

        }
    },

    Gas: {
        Price: {
            isValid: function () {
                var cache = localStorage.getItem('gasPrice');
                cache = JSON.parse(cache);

                if (!cache) {
                    return false;
                }

                var currentDate = new Date();
                return cache != currentDate.formattedDateString();

            },

            get: function () {
                if (AlcoholTrip.Gas.Price.isValid()) {
                    return JSON.parse(localStorage.getItem('gasPrice'));
                } else {
                    var currentDate = new Date();
                    $.ajax({
                        type: "GET",
                        url: "/json/AlcoholTrip/gas_price.json?version=" + currentDate.formattedDateString(),
                        success: function (response) {
                            console.log("got new price", response);
                            localStorage.setItem('gasPrice', JSON.stringify(response));
                            return JSON.parse(localStorage.getItem('gasPrice'));
                        }
                    });
                }
            },
            getPrice: function () {
                var prices = AlcoholTrip.Gas.Price.get();
                var selected = $("#gas_type").val();
                return prices[selected];
            },
            getText: function () {
                return $("#gas_type option:selected").text();
            }
        },

        Consumption: {
            liter: 0,
            update: function () {
                AlcoholTrip.Gas.Consumption.liter = AlcoholTrip.Distance.mile * parseFloat(AlcoholTrip.Gas.Consumption.get());
                AlcoholTrip.Result.calculate();
            },
            get: function () {
                if (!localStorage.getItem('gasConsumption')) {
                    AlcoholTrip.Gas.Consumption.set($("#gasConsumption").val());
                }
                return localStorage.getItem('gasConsumption')
            },

            set: function (consumption) {
                localStorage.setItem('gasConsumption', consumption);
            },

            draw: function () {
                var consumption = AlcoholTrip.Gas.Consumption.get();
                if (consumption) {
                    $("#gasConsumption").val(consumption);
                }
            }
        }
    },

    Distance: {
        mile: 0,
        update: function () {
            var from = $("#location").val();
            var to = $("#destination").val();

            if (from && to) {
                if (!distances[from]) {
                    distances[from] = {};
                }

                if (distances[from][to]) {
                    AlcoholTrip.Distance.mile = distances[from][to];
                    AlcoholTrip.Gas.Consumption.update();
                } else {
                    distanceXHR = $.ajax({
                        type: "GET",
                        url: "/json/AlcoholTrip/distance.json?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to),
                        success: function (distance) {
                            AlcoholTrip.Distance.mile = parseInt(distance) / 10000;
                            AlcoholTrip.Gas.Consumption.update();
                            distances[from][to] = AlcoholTrip.Distance.mile;
                            localStorage.setItem('distances', JSON.stringify(distances));
                        }
                    });
                }
            }
        },
        has: function (trip) {
            return !!distances[trip];
        }
    },

    Locator: {
        has: function () {
            var city = localStorage.getItem('userCity');

            return city != null;
        },

        update: function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
            }

            // Get the latitude and the longitude;
            function successFunction(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                $.ajax({
                    type: "GET",
                    url: "/json/AlcoholTrip/location.json?lat=" + lat + "&long=" + lng,
                    success: function (city) {
                        AlcoholTrip.Locator.set(city);
                        AlcoholTrip.Locator.draw();
                    }
                });
            }

            function errorFunction() {
                console.error('Could not retrieve location');
            }
        },

        set: function (city) {
            localStorage.setItem('userCity', city);
        },

        get: function () {
            if (!AlcoholTrip.Locator.has()) {
                AlcoholTrip.Locator.update();
            }

            return localStorage.getItem('userCity');
        },

        draw: function () {
            var location = AlcoholTrip.Locator.get();
            var locationSelect = $("#location");

            if (!$("#location option[value='" + location + "']").length && location) {
                locationSelect.append('<option value="' + location + '">' + location + '</option>');
                locationSelect.val(location).change();
            }
        }
    },
    Cart: {
        total: 0,
        borderPrice: 0,

        get: function () {
            var cart = sessionStorage.getItem("products");
            return cart ? JSON.parse(cart) : {};
        },
        add: function (id) {

            swal({
                title: "Steg 1(2)",
                text: 'Hur många vill du köpa av "' + products[id].name + '"?',
                type: "input",
                inputType: "number",
                inputValue: (AlcoholTrip.Cart.get()[id] ? AlcoholTrip.Cart.get()[id].qty : null),
                showCancelButton: true,
                confirmButtonColor: "#5dc2f1",
                confirmButtonText: "Gå vidare",
                cancelButtonText: "Avbryt",
                closeOnConfirm: false,
                closeOnCancel: true
            }, function (qty) {
                if (qty === false) return false;
                if (qty <= 0) {
                    swal.showInputError("Du måste lägga till minst en vara!");
                    return false;
                }

                swal({
                    title: "Steg 2(2)",
                    text: "Hur mycket kostar det i bordershoppen? På systemet kostar det " + (Math.round(products[id].price) * qty) + "kr",
                    type: "input",
                    inputType: "number",
                    inputValue: (AlcoholTrip.Cart.get()[id] ? AlcoholTrip.Cart.get()[id].price : null),
                    showCancelButton: true,
                    confirmButtonColor: "#5dc2f1",
                    confirmButtonText: "Lägg till",
                    cancelButtonText: "Avbryt",
                    closeOnConfirm: false,
                    closeOnCancel: true
                }, function (cost) {
                    if (cost === false) return false;
                    if (cost <= 0) {
                        swal.showInputError("Det kan inte vara gratis!");
                        return false;
                    }

                    var cart = AlcoholTrip.Cart.get();

                    cart[id] = {
                        item: products[id],
                        qty: qty,
                        price: cost,
                        localPrice: qty * products[id].price
                    };

                    sessionStorage.setItem("products", JSON.stringify(cart));
                    AlcoholTrip.Cart.draw();
                    AlcoholTrip.Result.calculate();

                    swal.close();
                });

            });
        },

        draw: function () {
            var html = "";

            AlcoholTrip.Cart.total = 0;
            AlcoholTrip.Cart.borderPrice = 0;

            $.each(AlcoholTrip.Cart.get(), function (id, product) {
                var el = product.item;
                AlcoholTrip.Cart.total += parseFloat(el.price) * parseFloat(product.qty);
                AlcoholTrip.Cart.borderPrice += parseFloat(product.price);

                html += '<li class="cart-item" data-id="' + id + '">' +
                    '<div class="remove" data-remove="' + id + '"><i class="fa fa-times-circle"></i></div>' +
                    '<div class="product" data-id="' + id + '">' +
                    '<span class="title">' + el.name + ' (' + el.alcohol + ')</span>' +
                    '<span class="price">' + product.qty + 'st á ' + el.price + 'kr (' + Math.round(product.localPrice, 2) + 'kr)</span>' +
                    '<span class="borderprice">' + product.price + 'kr på bordershop</span>' +
                    '</div>' +
                    '</li>';
            });

            if (html != "") {
                html = "<ul>" + html + "</ul><p>Totalt på systembolaget:" + Math.round(AlcoholTrip.Cart.total, 2) + "kr</p><p>Totalt på bordershop:" + AlcoholTrip.Cart.borderPrice + "kr</p>";
            } else {
                html = "<p>Din varukorg är tom...</p>"
            }

            $("#cart").html(html);
        },

        remove: function (id) {
            var cart = AlcoholTrip.Cart.get();

            if (cart[id]) {
                delete cart[id];
            }

            sessionStorage.setItem("products", JSON.stringify(cart));
            AlcoholTrip.Cart.draw();
            AlcoholTrip.Result.calculate();
        },

        empty: function (id) {
            var cart = {};
            sessionStorage.setItem("products", JSON.stringify(cart));
            AlcoholTrip.Cart.draw();
        }
    }
};


$(document).ready(AlcoholTrip.Init);