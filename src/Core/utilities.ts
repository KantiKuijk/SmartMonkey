export type Satisfies<U, T extends U> = T;

export function array2NodeList(a: Node[]) {
  const fragment = document.createDocumentFragment();
  a.forEach((n) => fragment.appendChild(n));
  return fragment.childNodes;
}

export function addCSS(css: string) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
