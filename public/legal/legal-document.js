(function () {
  var params = new URLSearchParams(window.location.search);
  var theme = params.get("theme");

  if (theme !== "dark" && theme !== "light" && window.localStorage) {
    var seeker = window.localStorage.getItem("jobswipe-seeker-theme");
    var staff = window.localStorage.getItem("jobswipe-staff-theme");
    if (seeker === "dark" || staff === "dark") {
      theme = "dark";
    }
  }

  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
})();
