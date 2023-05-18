$(document).ready(function () {
  $("#hamburger-icon").click(function () {
    $(this).toggleClass("open");
    if ($(this).hasClass("open")) {
      $("#mobile-nav").css({ width: "auto", "padding-right": "2rem" });
      $("#hamburger-icon").css({ position: "fixed" });
    } else {
      $("#mobile-nav").css({ width: "0", "padding-right": "0" });
      $("#hamburger-icon").css({ position: "absolute" });
    }
    return false;
  });
  // planets slick slider
  $(".planet-info-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 3,
    arrows: false,
    fade: true,
    asNavFor: ".planets-slider",
  });
  // planet detail slider
  $(".planets-slider").slick({
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: true,
    arrows: false,
    initialSlide: 3,
    swipeToSlide: true,
    focusOnSelect: true,
    autoplay: true,
    autoplaySpeed: 3000,
    asNavFor: ".planet-info-slider",
  });
  // setting the height of the aside(same as sibling)
  $("#latest-articles").css({
    height: $("#featured-articles").innerHeight() - "20" + "px",
  });
  $(".scrollbar-custom-home").css({
    height: $("#featured-articles").innerHeight() - 140 + "px",
  });

  /* Index.html Scripts*/
  if ($("#nasa-apod").length > 0) {
    //run only on index.html
    //NASA Apod API
    $.ajax({
      type: "GET",
      url: "https://api.nasa.gov/planetary/apod",
      data: { api_key: "5SfxFTDtPSKk7irzKsaDtEOgqUTneMO5yJLas01k" },
      dataType: "json",
      success: function (data) {
        //parsing the json
        $("#apod-title").html(data.title);
        $("#apod-date").html(data.date);
        // splitting string in paragraphs at third point
        var str = data.explanation;
        var firstPoint = str.indexOf(".");
        var secondPoint = str.indexOf(".", firstPoint + 1);
        var thirdPoint = str.indexOf(".", secondPoint + 1);
        $("#apod-explanation").html(
          str.substring(0, thirdPoint + 1) +
            "<br><br>" +
            str.substring(thirdPoint + 1)
        );
        if (data.hasOwnProperty("copyright")) {
          $("#apod-copy1").css("display", "block");
          $("#apod-copy2").html(data.copyright);
        }
        $(".apod").attr("src", data.url);
      },
    });
  }
  /* Astrodata Scripts*/
  if ($(".live-datas").length > 0) {
    //run only on astrodata.html
    //live-clock-data
    setInterval(function () {
      var date = new Date();
      $("#hour-live").html(
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
      );
    }, 1000);
    //getting the location
    var location = false;
    var lat, long;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getCoords, gotError, {
        timeout: 10000,
      });
    }
    if (!location) {
      //we don't have coords
      $("#sunrise").html("N/A");
      $("#sunset").html("N/A");
    }
    function getCoords(position) {
      lat = position.coords.latitude;
      long = position.coords.longitude;
      //we have coord clear to proceed with the request to the weather API
      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/weather",
        data: {
          lat: lat,
          lon: long,
          lang: "ro",
          units: "metric",
          appid: "3c13e8098fc8c921b36037b5f8b824b4",
        },
        dataType: "json",
        success: function (data) {
          //parsing the weather data
          $(".weather-datas").css("display", "block"); //displaying the html
          var sunriseTime = new Date(data.sys.sunrise * 1000);
          $("#sunrise").html(
            sunriseTime.getHours() + ":" + sunriseTime.getMinutes()
          );
          var sunsetTimet = new Date(data.sys.sunset * 1000);
          $("#sunset").html(
            sunsetTimet.getHours() + ":" + sunsetTimet.getMinutes()
          );
          var temperature = data.main.temp;
          $("#temperature").html(temperature.toFixed(1));
          var feelsLike = data.main.feels_like;
          $("#feels").html(feelsLike.toFixed(1));
          var image_src =
            "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
          $("#weather-img").attr("src", image_src);
          $("#weather-description").html(data.weather[0].description);
          $("#wind-speed").html(data.wind.speed);
          $("#wind-direction").html(data.wind.deg);
        },
      });
    }
    function gotError(error) {
      location = false;
      window.alert(
        "Location data is used for calculating the sunrise and sunset. Also it is used for the weather information. Please greant it and reload this page"
      );
    }
    //number of people in space(open-notify API)
    //todo: future problem for cross-origin (https-to-http request)
    // $.ajax({
    // 	    type: 'GET',
    // 	    url:"http://api.open-notify.org/astros.json",
    // 		dataType: 'json',
    // 	    success: function(data) {
    // 	        //parsing the json
    // 	        $('#people').html(data.number);
    // 	    }
    // });
  }
  // back-to-top button
  var btn = $("#back-to-top");
  $(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
      btn.addClass("show");
    } else {
      btn.removeClass("show");
    }
  });

  btn.on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "300");
  });
});
