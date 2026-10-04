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

export function waitForElement<Elem extends Element>(
  selector: string,
  {
    timeout = 10000,
    root = document,
  }: { timeout?: number; root?: Document | Element } = {},
) {
  return new Promise<Elem>((resolve, reject) => {
    // Already there?
    const existing = root.querySelector<Elem>(selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const el = root.querySelector<Elem>(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);

    observer.observe(root === document ? document.documentElement : root, {
      childList: true,
      subtree: true,
    });
  });
}

export function waitForFrameDocument(
  frame: HTMLIFrameElement,
  timeout = 10000,
): Promise<Document> {
  return new Promise((resolve, reject) => {
    const isReady = () => {
      const doc = frame.contentDocument;
      return (
        doc &&
        doc.readyState === "complete" &&
        doc.location.href !== "about:blank"
      );
    };

    const finish = (doc?: Document, err?: Error) => {
      frame.removeEventListener("load", onLoad);
      clearInterval(poll);
      clearTimeout(timer);
      doc ? resolve(doc) : reject(err);
    };

    const onLoad = () => isReady() && finish(frame.contentDocument!);
    frame.addEventListener("load", onLoad);

    const poll = setInterval(onLoad, 100);
    const timer = setTimeout(
      () => finish(undefined, new Error("iframe document never became ready")),
      timeout,
    );

    if (isReady()) finish(frame.contentDocument!);
  });
}
