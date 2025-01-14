export type Satisfies<U, T extends U> = T;
export function addCSS(css: string) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
