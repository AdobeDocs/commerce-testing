/**
 * GitHub Pages Path Interceptor for AEM Edge Delivery
 * 
 * This script fixes path issues when hosting an AEM Edge Delivery site on GitHub Pages.
 * GitHub Pages serves the site at /<repo-name>/ but the AEM framework expects paths
 * to start from the domain root.
 * 
 * Features:
 * 1. URL normalization - Removes /index.html suffix for cleaner URLs
 * 2. fetch() interception - Rewrites API calls to include base path
 * 3. XMLHttpRequest interception - Same for XHR requests
 * 4. DOM element fixing - Fixes src/href attributes on dynamically added elements
 * 5. Side navigation fix - Removes 'no-sidenav' class on documentation pages
 * 6. TOC filtering - Shows only relevant section items in table of contents
 * 7. Superhero background fix - Ensures background images load correctly
 */
(function() {
  var BASE = "/commerce-testing";
  var ORIGIN = location.origin;

  // 1. URL Normalization - Remove /index.html suffix
  if (location.pathname.endsWith("/index.html")) {
    history.replaceState(
      null,
      "",
      location.pathname.replace(/\/index\.html$/, "/") + location.search + location.hash
    );
  }

  /**
   * Fix a URL by adding the base path if needed
   * @param {string} url - The URL to fix
   * @returns {string|null} - Fixed URL or null if no fix needed
   */
  function fix(url) {
    if (!url || typeof url !== "string") return null;

    // Handle full URLs (e.g., https://adobedocs.github.io/commerce/testing/config)
    if (url.startsWith(ORIGIN) && !url.includes(BASE)) {
      var path = url.substring(ORIGIN.length);
      if (
        path.startsWith("/hlx_statics") ||
        path.startsWith("/franklin_assets") ||
        path.startsWith("/commerce")
      ) {
        return ORIGIN + BASE + path;
      }
    }

    // Handle relative paths (e.g., /commerce/testing/config)
    if (
      url.startsWith("/") &&
      !url.startsWith(BASE) &&
      (url.startsWith("/hlx_statics") ||
        url.startsWith("/franklin_assets") ||
        url.startsWith("/commerce"))
    ) {
      return BASE + url;
    }

    return null;
  }

  // 2. Intercept fetch() calls
  var originalFetch = window.fetch;
  window.fetch = function(input, options) {
    var fixed;
    if (typeof input === "string") {
      fixed = fix(input);
      if (fixed) input = fixed;
    } else if (input instanceof Request) {
      fixed = fix(input.url);
      if (fixed) input = new Request(fixed, input);
    }
    return originalFetch.call(this, input, options);
  };

  // 3. Intercept XMLHttpRequest
  var originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    var fixed = fix(url);
    if (fixed) url = fixed;
    return originalXHROpen.apply(this, [method, url].concat([].slice.call(arguments, 2)));
  };

  /**
   * Fix src/href attributes on a DOM element and its children
   * @param {Element} el - The element to fix
   */
  function fixElement(el) {
    if (!el || !el.getAttribute) return;

    ["src", "href", "xlink:href"].forEach(function(attr) {
      var value = el.getAttribute(attr);
      var fixed = fix(value);
      if (fixed) el.setAttribute(attr, fixed);
    });

    if (el.querySelectorAll) {
      el.querySelectorAll("[src],[href]").forEach(fixElement);
    }
  }

  // 4. Watch for dynamically added DOM elements
  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) fixElement(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Also fix elements on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function() {
    fixElement(document.body);
  });

  // 5. Fix side navigation visibility
  function fixSideNav() {
    var main = document.querySelector("main");
    var template = document.querySelector('meta[name="template"]');
    if (
      main &&
      main.classList.contains("no-sidenav") &&
      template &&
      template.content === "documentation"
    ) {
      main.classList.remove("no-sidenav");
    }
  }

  // Watch for class changes on main element
  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.target.tagName === "MAIN" && mutation.attributeName === "class") {
        fixSideNav();
      }
    });
  }).observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"]
  });

  document.addEventListener("DOMContentLoaded", fixSideNav);
  setTimeout(fixSideNav, 500);
  setTimeout(fixSideNav, 1500);

  // 6. Filter TOC to show only current section items
  function filterToc() {
    var nav = document.querySelector("#navigation-links");
    if (!nav) return;

    var currentPath = location.pathname.replace(/\/$/, "");
    var bestMatch = null;
    var bestLength = 0;

    // Find the best matching top-level nav item
    nav.querySelectorAll("a").forEach(function(anchor) {
      if (anchor.getAttribute("fullPath")) return; // Skip items with fullPath attr
      var href = new URL(anchor.href).pathname.replace(/\/$/, "");
      if (currentPath === href) {
        bestMatch = anchor;
        bestLength = 999;
      } else if (currentPath.startsWith(href + "/") && href.length > bestLength) {
        bestMatch = anchor;
        bestLength = href.length;
      }
    });

    if (!bestMatch) return;

    var topPath = new URL(bestMatch.href).pathname;
    var toc = document.querySelector(".side-nav-subpages-section");
    if (!toc) return;

    // Hide items that don't belong to current section
    toc.querySelectorAll(":scope > ul li").forEach(function(li) {
      var link = li.querySelector(":scope > a");
      if (!link) {
        li.classList.add("hidden");
        return;
      }
      var linkPath = new URL(link.href, ORIGIN).pathname;
      if (!linkPath.startsWith(topPath)) {
        li.classList.add("hidden");
      }
    });
  }

  setTimeout(filterToc, 1000);
  setTimeout(filterToc, 2000);
  setTimeout(filterToc, 3000);

  // 7. Fix superhero background image
  function fixSuperheroBackground() {
    var superhero = document.querySelector(".superhero");
    if (!superhero) return;

    // Check if background is undefined or missing
    var style = window.getComputedStyle(superhero);
    if (style.backgroundImage.includes("undefined")) {
      // Find the img element that should be the background
      var img = superhero.querySelector("img");
      if (img && img.src) {
        var existingBg = superhero.style.background || "";
        superhero.style.background =
          "url(" + img.src + ") center center / cover no-repeat" +
          (existingBg ? ", " + existingBg : ", rgb(29, 125, 238)");
        // Hide the img element since it's now a background
        img.style.display = "none";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", fixSuperheroBackground);
  setTimeout(fixSuperheroBackground, 500);
  setTimeout(fixSuperheroBackground, 1500);
})();

