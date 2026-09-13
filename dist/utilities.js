export function array2NodeList(a) {
    const fragment = document.createDocumentFragment();
    a.forEach((n) => fragment.appendChild(n));
    return fragment.childNodes;
}
export function addCSS(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}
//# sourceMappingURL=utilities.js.map