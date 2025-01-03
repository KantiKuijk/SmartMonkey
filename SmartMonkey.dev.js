// ==UserScript==
// @name         SmartMonkey
// @namespace    http://tampermonkey.net/
// @version      v0.1
// @description  Voegt functionaliteit toe aan Smartschool
// @author       Kanti Kuijk
// @match        https://*.smartschool.be/*
// @icon         https://raw.githubusercontent.com/KantiKuijk/SmartMonkey/refs/heads/main/img/smk_gradient_256.png
// @connect      raw.githubusercontent.com
// @connect      127.0.0.1
// @grant        GM_xmlhttpRequest
// ==/UserScript==
GM_xmlhttpRequest({
  method: "GET",
  // ts param is for TamperMonkey cache busting
  url: `http://127.0.0.1:8080/SmartMonkey.js?ts=${Date.now()}`,
  onload: (response) => {
    console.warn("SMK: In dev mode");
    eval(response.responseText);
  },
  timeout: 50,
  ontimeout: (to) => {
    GM_xmlhttpRequest({
      method: "GET",
      // ts param is for TamperMonkey cache busting
      url: `https://raw.githubusercontent.com/KantiKuijk/SmartMonkey/refs/heads/main/dist/SmartMonkey.js?ts=${Date.now()}`,
      onload: (response) => {
        console.warn("SMK: In prod mode");
        eval(response.responseText);
      },
      timeout: 30_000,
      ontimeout: () => {
        console.error("Couldn't load SmartMonkey: timeout.");
      },
    });
  },
});
