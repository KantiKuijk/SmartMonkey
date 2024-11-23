// ==UserScript==
// @name         SmartMonkey
// @namespace    http://tampermonkey.net/
// @version      v0.1
// @description  Voegt functionaliteit toe aan Smartschool
// @author       Kanti Kuijk
// @match        https://*.smartschool.be/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smartschool.be
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==
GM_xmlhttpRequest({
  method: "GET",
  url: "https://raw.githubusercontent.com/KantiKuijk/SmartMonkey/refs/heads/main/dist/SmartMonkey.js",
  onload: function (response) {
    eval(response.responseText);
  },
});
