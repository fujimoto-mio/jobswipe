(function () {
  var HEADER_OFFSET = 88;
  var SECTION_IDS = ["top", "why", "plan", "case", "comparison", "voice", "service", "faq", "contact"];
  var SUPPORT_EMAIL = "support@jobswipe.app";

  function smoothScrollTo(top) {
    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: Math.max(0, top), behavior: behavior });
  }

  function scrollToSection(id) {
    if (id === "top") {
      smoothScrollTo(0);
      window.history.replaceState(null, "", "./index.html");
      return;
    }
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    smoothScrollTo(top);
    window.history.replaceState(null, "", "#" + id);
  }

  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToSection(btn.getAttribute("data-scroll"));
    });
  });

  function scrollToHash() {
    var hash = window.location.hash.replace("#", "");
    if (SECTION_IDS.indexOf(hash) === -1) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrollToSection(hash);
      });
    });
  }

  scrollToHash();
  window.addEventListener("hashchange", scrollToHash);

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var company = form.elements.namedItem("company").value;
      var name = form.elements.namedItem("name").value;
      var email = form.elements.namedItem("email").value;
      var body = form.elements.namedItem("message").value;
      var subject = encodeURIComponent("【JobSwipe】お問い合わせ（" + company + "）");
      var text = encodeURIComponent(
        "会社名: " + company + "\nお名前: " + name + "\nメール: " + email + "\n\n" + body
      );
      window.location.href = "mailto:" + SUPPORT_EMAIL + "?subject=" + subject + "&body=" + text;
    });
  }
})();
