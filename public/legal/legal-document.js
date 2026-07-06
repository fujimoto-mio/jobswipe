(function () {
  var params = new URLSearchParams(window.location.search);
  var theme = params.get("theme");

  if (theme !== "dark" && theme !== "light" && window.localStorage) {
    var unified = window.localStorage.getItem("jobswipe-theme");
    var seeker = window.localStorage.getItem("jobswipe-seeker-theme");
    var staff = window.localStorage.getItem("jobswipe-staff-theme");
    if (unified === "dark" || seeker === "dark" || staff === "dark") {
      theme = "dark";
    }
  }

  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
})();
