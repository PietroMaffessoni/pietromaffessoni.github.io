/* =========================================================================
   Pietro Maffessoni - portfolio
   Three jobs: the language switch, the light coming up on the work,
   and knowing where you are on the page. Nothing listens to scroll.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     0. Where the page opens. The browser restores the old scroll position
        on a reload, which dropped the visitor into the middle of the page
        instead of on the name. A reload now always opens at the top; a
        link someone shared with a #section still lands on that section.
     --------------------------------------------------------------------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  var navEntry = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || null;
  var reloaded = navEntry ? navEntry.type === "reload" : false;

  function toTop() {
    // inline auto beats the stylesheet smooth, so the jump is instant
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = prev;
  }

  if (reloaded && location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  if (reloaded || !location.hash) {
    toTop();
    window.addEventListener("load", function () {
      if (!location.hash) toTop();
    }, { once: true });
  }

  /* ---------------------------------------------------------------------
     1. Language. PT is what ships in the HTML, EN rides in data attributes.
     --------------------------------------------------------------------- */
  var STORE_KEY = "pm-lang";
  var textNodes = document.querySelectorAll("[data-en]");
  var altNodes = document.querySelectorAll("[data-en-alt]");
  var ariaNodes = document.querySelectorAll("[data-en-aria]");
  var langButtons = document.querySelectorAll(".lang button");

  // keep the Portuguese original before anything is swapped
  textNodes.forEach(function (el) {
    if (!el.hasAttribute("data-pt")) el.setAttribute("data-pt", el.textContent.trim());
  });
  altNodes.forEach(function (el) {
    if (!el.hasAttribute("data-pt-alt")) el.setAttribute("data-pt-alt", el.getAttribute("alt") || "");
  });
  ariaNodes.forEach(function (el) {
    if (!el.hasAttribute("data-pt-aria")) el.setAttribute("data-pt-aria", el.getAttribute("aria-label") || "");
  });

  function setLang(lang) {
    var en = lang === "en";

    textNodes.forEach(function (el) {
      el.textContent = en ? el.getAttribute("data-en") : el.getAttribute("data-pt");
    });
    altNodes.forEach(function (el) {
      el.setAttribute("alt", en ? el.getAttribute("data-en-alt") : el.getAttribute("data-pt-alt"));
    });
    ariaNodes.forEach(function (el) {
      el.setAttribute("aria-label", en ? el.getAttribute("data-en-aria") : el.getAttribute("data-pt-aria"));
    });

    root.setAttribute("lang", en ? "en" : "pt-BR");
    langButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* private mode */ }
  }

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  // Portuguese is the default. Only a choice the visitor made before switches it.
  var saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) { saved = null; }
  if (saved === "en") setLang("en");

  /* ---------------------------------------------------------------------
     2. The lamp comes up on the first viewport, once.
     --------------------------------------------------------------------- */
  var stage = document.querySelector(".stage");
  if (stage) {
    if (reduced) {
      stage.classList.add("is-lit");
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { stage.classList.add("is-lit"); });
      });
    }
  }

  /* ---------------------------------------------------------------------
     3. Work rises into the light as it arrives. Once per element.
     --------------------------------------------------------------------- */
  var risers = document.querySelectorAll(".rise");

  if (reduced || !("IntersectionObserver" in window)) {
    risers.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var riseObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    risers.forEach(function (el) { riseObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     4. Where you are: the rail marks the section crossing the middle.
     --------------------------------------------------------------------- */
  var railLinks = Array.prototype.slice.call(document.querySelectorAll(".rail__link"));

  if (railLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    var watched = [];

    railLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      byId[id] = link;
      watched.push(section);
    });

    var current = null;
    function mark(id) {
      if (current === id) return;
      if (current && byId[current]) byId[current].removeAttribute("aria-current");
      current = id;
      if (byId[id]) byId[id].setAttribute("aria-current", "true");
    }

    var railObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) mark(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    watched.forEach(function (s) { railObserver.observe(s); });
  }

  /* ---------------------------------------------------------------------
     4b. The year in the footer writes itself, so the page does not go stale.
     --------------------------------------------------------------------- */
  var yearEl = document.querySelector(".js-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------
     5. Mobile menu.
     --------------------------------------------------------------------- */
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");

  if (menuBtn && menu) {
    var openMenu = function (open) {
      menu.dataset.open = String(open);
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };

    menuBtn.addEventListener("click", function () {
      openMenu(menu.dataset.open !== "true");
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) openMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.dataset.open === "true") {
        openMenu(false);
        menuBtn.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 720 && menu.dataset.open === "true") openMenu(false);
    });
  }
})();
