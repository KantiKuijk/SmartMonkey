// ==UserScript==
// @name         Planner ipv Vakken in topnav
// @namespace    http://tampermonkey.net/
// @version      v0.1
// @description  Vervangt de knop voor "Vakken" met "Planner"
// @author       Kanti Kuijk
// @match        https://sfevergem.smartschool.be/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smartschool.be
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  const plannerLinkHTML =
    '<a href="/planner" class="js-btn-shortcuts topnav__btn">Planner</a>';
  const vakkenButton = Array.from(
    document.querySelectorAll(".topnav__btn")
  ).find(
    (b) =>
      b instanceof HTMLElement && b.innerText && b.innerText.includes("Vakken")
  );
  if (!vakkenButton) console.warn("Kon vakken niet vinden");
  else vakkenButton.outerHTML = plannerLinkHTML;
})();
