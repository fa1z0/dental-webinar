/* =============================================================
   AIMST · Faculty of Dentistry — shared behaviours
   ============================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  var THEME_KEY = "fod-theme";
  var themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      var dark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light theme" : "Switch to dark theme"
      );
      themeToggle.title = dark ? "Switch to light theme" : "Switch to dark theme";
    }
  }

  if (themeToggle) {
    applyTheme(root.getAttribute("data-theme") || "light");
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (err) {
        /* storage unavailable — theme still applies for this page */
      }
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (event) {
      var stored = null;
      try {
        stored = localStorage.getItem(THEME_KEY);
      } catch (err) {}
      if (!stored) applyTheme(event.matches ? "dark" : "light");
    });
  }

  /* ---------- Mobile navigation ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var mobileNav = document.getElementById("mobileNav");

  function closeMenu() {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    mobileNav.hidden = false;
    document.body.style.overflow = "hidden";
    var firstLink = mobileNav.querySelector("a, button");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var expanded = menuBtn.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });

    mobileNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuBtn.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  /* ---------- Header & scroll progress ---------- */
  var navShell = document.querySelector(".nav-shell");
  var progress = document.querySelector(".scroll-progress");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navShell) navShell.classList.toggle("is-scrolled", y > 12);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Countdown ---------- */
  var countdown = document.getElementById("countdown");
  var inlineEl = document.querySelector("[data-countdown-inline]");
  var pad = function (n) {
    return String(n).padStart(2, "0");
  };

  if (inlineEl) {
    var inlineDeadline = new Date("2026-09-19T08:00:00+08:00");
    var inlineTick = function () {
      var diff = inlineDeadline.getTime() - Date.now();
      if (diff <= 0) {
        inlineEl.textContent = "2026 edition archive";
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      inlineEl.textContent = days + "d " + pad(hours) + "h " + pad(minutes) + "m";
    };
    inlineTick();
    setInterval(inlineTick, 30000);
  }

  if (countdown) {
    var deadline = new Date(countdown.getAttribute("data-deadline") || "2026-09-19T08:00:00+08:00");
    var label = document.querySelector("[data-countdown-label]");
    var note = document.querySelector("[data-countdown-note]");
    var cta = document.querySelector("[data-countdown-cta]");
    var units = {
      days: countdown.querySelector("[data-days]"),
      hours: countdown.querySelector("[data-hours]"),
      minutes: countdown.querySelector("[data-minutes]"),
      seconds: countdown.querySelector("[data-seconds]")
    };

    var tick = function () {
      var diff = deadline.getTime() - Date.now();
      if (diff <= 0) {
        if (!countdown.dataset.ended) {
          countdown.dataset.ended = "true";
          countdown.innerHTML =
            '<div class="countdown__ended"><strong>The 2026 edition has concluded</strong>' +
            "Explore the programme and speaker line-up from both days.</div>";
          if (label) label.textContent = "Edition archive";
          if (note) {
            note.innerHTML =
              '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>' +
              "<span>Registration for the 2026 edition is now closed. The programme and speaker line-up remain available to explore.</span>";
          }
          if (cta) {
            cta.setAttribute("href", "program.html");
            cta.innerHTML = 'Explore the programme <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
          }
        }
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      var seconds = Math.floor((diff % 60000) / 1000);

      if (units.days) units.days.textContent = pad(days);
      if (units.hours) units.hours.textContent = pad(hours);
      if (units.minutes) units.minutes.textContent = pad(minutes);
      if (units.seconds) units.seconds.textContent = pad(seconds);
    };

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Tabs (speakers & programme) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll("[data-tab]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));

    function activate(target) {
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-tab") === target;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      panels.forEach(function (panel) {
        var show = target === "all" || panel.getAttribute("data-panel") === target;
        panel.hidden = !show;
        panel.classList.toggle("is-active", show);
      });

      var counter = document.querySelector("[data-visible-count]");
      if (counter) {
        var visibleCards = Array.prototype.filter.call(
          document.querySelectorAll(".speaker-card"),
          function (card) {
            var panel = card.closest("[data-panel]");
            return !panel || !panel.hidden;
          }
        ).length;
        counter.textContent = String(visibleCards);
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab"));
      });

      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = tabs[(index + 1) % tabs.length];
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = tabs[(index - 1 + tabs.length) % tabs.length];
        } else if (event.key === "Home") {
          next = tabs[0];
        } else if (event.key === "End") {
          next = tabs[tabs.length - 1];
        }
        if (next) {
          event.preventDefault();
          next.focus();
          activate(next.getAttribute("data-tab"));
        }
      });
    });

    var counter = document.querySelector("[data-visible-count]");
    if (counter) {
      counter.textContent = String(document.querySelectorAll(".speaker-card").length);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var groupCounts = new Map();
      revealItems.forEach(function (el) {
        if (el.dataset.delay) return;
        var parent = el.parentElement;
        var index = groupCounts.get(parent) || 0;
        groupCounts.set(parent, index + 1);
        el.style.setProperty("--delay", Math.min(index * 65, 390) + "ms");
      });

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );

      revealItems.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* ---------- Count-up stats ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          var duration = 1200;
          var start = null;

          function step(timestamp) {
            if (!start) start = timestamp;
            var progressValue = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progressValue, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progressValue < 1) {
              window.requestAnimationFrame(step);
            }
          }

          window.requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute("data-count") || "") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("formStatus");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setStatus(type, message) {
      if (!status) return;
      status.className = "form__status form__status--" + type + " is-visible";
      status.innerHTML =
        '<i class="fa-solid ' +
        (type === "success" ? "fa-circle-check" : "fa-circle-exclamation") +
        '"></i><span>' +
        message +
        "</span>";
    }

    function validateField(field) {
      var wrapper = field.closest(".field");
      var value = field.value.trim();
      var valid = true;

      if (field.hasAttribute("required") && !value) valid = false;
      if (field.type === "email" && value && !emailPattern.test(value)) valid = false;

      if (wrapper) wrapper.classList.toggle("has-error", !valid);
      field.setAttribute("aria-invalid", String(!valid));
      return valid;
    }

    form.querySelectorAll(".input, .select, .textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("has-error")) validateField(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fields = Array.prototype.slice.call(
        form.querySelectorAll(".input, .select, .textarea")
      );
      var valid = fields.map(validateField).every(Boolean);

      if (!valid) {
        setStatus("error", "Please review the highlighted fields and try again.");
        var firstError = form.querySelector(".has-error .input, .has-error .select, .has-error .textarea");
        if (firstError) firstError.focus();
        return;
      }

      var name = form.querySelector("#name").value.trim();
      var email = form.querySelector("#email").value.trim();
      var topic = form.querySelector("#topic").value;
      var message = form.querySelector("#message").value.trim();

      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Topic: " + topic + "\n\n" +
        message;
      var mailto =
        "mailto:aimstdentalcareer@gmail.com?subject=" +
        encodeURIComponent("[Webinar enquiry] " + topic) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;
      setStatus(
        "success",
        "Your email app is opening with the message ready to send. If nothing happens, write to aimstdentalcareer@gmail.com."
      );
      /* Keep the values so the message can be copied or resent if the
         device has no mail client configured. */
    });
  }

  /* ---------- Back to top ---------- */
  document.querySelectorAll("[data-to-top]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
