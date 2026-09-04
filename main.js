/* =========================================================================
   Portfólio, Pietro Maffessoni
   Quatro coisas: idioma, a luz que sobe no topo, saber em que seção você
   está e copiar o e-mail. Nada aqui escuta o scroll.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     0. Onde a página abre. Por padrão o navegador guarda a posição da
        rolagem e devolve ela no reload, o que jogava a pessoa no meio da
        página em vez do nome. Agora o reload sempre abre no topo, mas um
        link com #secao continua caindo na seção certa.
     --------------------------------------------------------------------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  var navEntry = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || null;
  var reloaded = navEntry ? navEntry.type === "reload" : false;

  function toTop() {
    // o auto inline ganha do smooth do CSS, então o salto é instantâneo
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
     1. Idioma. O português está no HTML, o inglês vem nos data-en.
     --------------------------------------------------------------------- */
  var STORE_KEY = "pm-lang";
  var textNodes = document.querySelectorAll("[data-en]");
  var altNodes = document.querySelectorAll("[data-en-alt]");
  var ariaNodes = document.querySelectorAll("[data-en-aria]");
  var langButtons = document.querySelectorAll(".lang button");

  // guarda o português antes de qualquer troca
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

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* aba anônima */ }
  }

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  // português é o padrão, só troca se a pessoa já tiver escolhido inglês antes
  var saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) { saved = null; }
  if (saved === "en") setLang("en");

  /* ---------------------------------------------------------------------
     2. A luz sobe no topo, uma vez só.
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
     3. Cada bloco entra na luz quando chega na tela, uma vez por elemento.
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
     4. O trilho marca a seção que está passando pelo meio da tela.
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
     4b. O ano do rodapé se escreve sozinho, para o site não envelhecer.
     --------------------------------------------------------------------- */
  var yearEl = document.querySelector(".js-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------
     4c. O e-mail. O mailto: só abre alguma coisa em quem tem aplicativo de
         e-mail configurado, e muita gente não tem, então dá para copiar.
     --------------------------------------------------------------------- */
  var copyBtn = document.querySelector(".copy");
  var said = document.querySelector(".copy__said");

  if (copyBtn && said) {
    var saidTimer = null;

    // último recurso: deixar o e-mail selecionado, aí basta o Ctrl+C
    var selectAddress = function () {
      var link = document.querySelector(".mailto");
      if (!link || !window.getSelection || !document.createRange) return;
      var range = document.createRange();
      range.selectNodeContents(link);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };

    var tell = function (ok) {
      var en = root.getAttribute("lang") === "en";
      if (ok) {
        said.textContent = en ? "copied" : "copiado";
      } else {
        selectAddress();
        said.textContent = en ? "selected, just copy it" : "selecionei, é só copiar";
      }
      said.classList.add("is-on");
      clearTimeout(saidTimer);
      saidTimer = setTimeout(function () { said.classList.remove("is-on"); }, 2800);
    };

    var legacyCopy = function (text) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(field);
      return ok;
    };

    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy");
      // a API de clipboard precisa de contexto seguro, e file:// não é
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { tell(true); },
          function () { tell(legacyCopy(text)); }
        );
      } else {
        tell(legacyCopy(text));
      }
    });
  }

  /* ---------------------------------------------------------------------
     5. Menu do celular.
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
