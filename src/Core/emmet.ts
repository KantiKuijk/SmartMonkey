export type SplitString<
  S extends string,
  D extends string = ","
> = string extends S
  ? string[]
  : S extends ""
  ? []
  : S extends `${infer H1}${D}${infer H2}${D}${infer H3}${D}${infer H4}${D}${infer Tail}`
  ? [H1, H2, H3, H4, ...SplitString<Tail, D>] // 4x recursion avoidance
  : S extends `${infer Head}${D}${infer Tail}`
  ? [Head, ...SplitString<Tail, D>]
  : [S];

const htmlAttrRE = new RegExp(
  /(^\[([^\]=]*)(='([^]*))?'\]$)|(^\[([^\]=]*)(="([^]*))?"\]$)|(^\[([^\]=]*)(=([^]*))?\]$)|(^([^\]=]*)(='([^]*))?'$)|(^([^\]=]*)(="([^]*))?"$)|(^([^\]=]*)(=([^]*))?$)/
);

export type ApplyAttributeObject = {
  name: string;
  value?: string | boolean;
};
export type DirtyApplyAttribute = ApplyAttributeObject | string;
export type DirtyApplyAttrs = DirtyApplyAttribute | DirtyApplyAttribute[];
function attributeStringToObject(atts: string): ApplyAttributeObject {
  const name = atts.replace(htmlAttrRE, "$2$6$10$14$18$22");
  const value = atts.replace(htmlAttrRE, "$4$8$12$16$20$24");
  return { name, value };
}
function attributeObjectToString(att: ApplyAttributeObject): `[${string}]` {
  return `[${att.name}${att.value ? "=" + att.value : ""}]`;
}
export function attributes2Emmet(atts: DirtyApplyAttrs): `[${string}]` {
  if (typeof atts === "string") {
    //! the regex makes sure of it
    if (htmlAttrRE.test(atts)) {
      return `${atts.startsWith("[") ? "" : "["}${atts}${
        atts.endsWith("]") ? "" : "]"
      }` as `[${string}]`;
    } else throw new Error("Invalid attribute string: " + atts);
  }
  if (Array.isArray(atts)) {
    return (
      atts
        .map((att) =>
          typeof att === "string"
            ? attributes2Emmet(att)
            : attributeObjectToString(att)
        )
        //! joining of `[${string}]` ltierals will again be a `[${string}]` literal
        .join("") as `[${string}]`
    );
  }
  return attributeObjectToString(atts);
}
export function applyAttributes(
  elem: HTMLElement,
  atts: string | ApplyAttributeObject | (string | ApplyAttributeObject)[]
) {
  /* apply attributes to an element
   * either a single attribute is given as an object:
   * {name: <attribute name>[, value: <attribute value>]}
   * if the value is ommitted or boolean, it is assumed
   * it is a boolean attribute (set if true or ommitted, remove when false)
   *
   * if atts is an array of those objects to apply multiple attributes
   * the elem is returned
   *
   * if atts is a string, it is processed as emmet-like with or without the
   * surrounding square brackets
   */
  if (typeof atts === "string") atts = attributeStringToObject(atts);
  if (Array.isArray(atts)) {
    atts.forEach((att) => {
      if (typeof att === "string") att = attributeStringToObject(att);
      applyAttributes(elem, att);
    });
  } else {
    if (atts.value === false) {
      elem.removeAttribute(atts.name);
    } else if (atts.value === true || atts.value == undefined) {
      elem.setAttribute(atts.name, atts.name);
    } else {
      elem.setAttribute(atts.name, atts.value);
    }
  }
  return elem;
}

type KnownEmmetTags2Elem = {
  div: HTMLDivElement;
  span: HTMLSpanElement;
  p: HTMLParagraphElement;
  h1: HTMLHeadingElement;
  h2: HTMLHeadingElement;
  h3: HTMLHeadingElement;
  h4: HTMLHeadingElement;
  h5: HTMLHeadingElement;
  h6: HTMLHeadingElement;
  a: HTMLAnchorElement;
  b: HTMLElement;
  i: HTMLElement;
  u: HTMLElement;
  s: HTMLElement;
  br: HTMLBRElement;
  em: HTMLElement;
  strong: HTMLElement;
  small: HTMLElement;
  big: HTMLElement;
  sub: HTMLElement;
  sup: HTMLElement;
  pre: HTMLElement;
  img: HTMLImageElement;
  ul: HTMLUListElement;
  ol: HTMLOListElement;
  li: HTMLLIElement;
  table: HTMLTableElement;
  thead: HTMLTableSectionElement;
  tbody: HTMLTableSectionElement;
  tfoot: HTMLTableSectionElement;
  tr: HTMLTableRowElement;
  th: HTMLTableCellElement;
  td: HTMLTableCellElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  textarea: HTMLTextAreaElement;
  select: HTMLSelectElement;
  option: HTMLOptionElement;
  button: HTMLButtonElement;
  label: HTMLLabelElement;
  fieldset: HTMLFieldSetElement;
  legend: HTMLLegendElement;
  iframe: HTMLIFrameElement;
  script: HTMLScriptElement;
  template: HTMLTemplateElement;
  section: HTMLElement;
  code: HTMLElement;
  progress: HTMLProgressElement;
  picture: HTMLPictureElement;
  source: HTMLSourceElement;
  details: HTMLDetailsElement;
  embed: HTMLEmbedElement;
  object: HTMLObjectElement;
  head: HTMLHeadElement;
  header: HTMLElement;
  footer: HTMLElement;
  main: HTMLElement;
  article: HTMLElement;
  aside: HTMLElement;
  nav: HTMLElement;
  "{": Text;
  "(": NodeList;
  element: HTMLElement;
  "": HTMLElement;
  dialog: HTMLDialogElement;
};
type knownElement = KnownEmmetTags2Elem[keyof KnownEmmetTags2Elem];
// These type tags won't be assumed for emmets for which just 'string' is the type
type NonAssumedEmmetTags = "(";
type AlphaNumericChar = Exclude<
  SplitString<
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    ""
  >[number],
  ""
>;
type ExtractSingleEmmetTag<
  Emmet extends string,
  Prev extends string = ""
> = string extends Emmet
  ? Prev extends ""
    ? Exclude<keyof KnownEmmetTags2Elem, NonAssumedEmmetTags>
    : "element"
  : Emmet extends `${infer First}${infer Rest}`
  ? First extends AlphaNumericChar
    ? ExtractSingleEmmetTag<Rest, `${Prev}${First}`> extends "element"
      ? Lowercase<`${Prev}${First}`>
      : ExtractSingleEmmetTag<Rest, `${Prev}${First}`>
    : Prev extends ""
    ? First extends "{"
      ? "{"
      : First extends "("
      ? "("
      : Lowercase<Prev>
    : Lowercase<Prev>
  : Emmet extends `${infer F}`
  ? F extends AlphaNumericChar
    ? Lowercase<`${Prev}${F}`>
    : Lowercase<Prev>
  : "element";
type ExtractEmmetTag<E extends string> = ExtractSingleEmmetTag<
  SplitString<E>[number]
>;
export type Emmet2Elem<E extends string> =
  KnownEmmetTags2Elem[ExtractEmmetTag<E>];

export function isTextNodeEmmet(emmet: string): emmet is `{${string}` {
  return emmet[0] === "{";
}
export function isNodeListEmmet(emmet: string): emmet is `(${string}` {
  return emmet[0] === "(";
}

export function emmet<First extends string | knownElement>(
  strings: TemplateStringsArray,
  ...emmetsOrElems: (string | knownElement)[]
): First extends string ? Emmet2Elem<First> : First;
export function emmet(
  strings: TemplateStringsArray,
  ...emmetsOrElems: (string | knownElement)[]
): knownElement {
  // keep special characters for ourselves to consume, make mutable
  const baseEmmet = [...strings.raw];
  if (baseEmmet.length === 0) throw new Error("Emmet: No emmet given");
  for (let i = emmetsOrElems.length; i >= 0; i--) {
    // string expressions are assumed to be emmets and can thus be joined with its surroundings
    const maybeEmmet = emmetsOrElems[i];
    if (typeof maybeEmmet === "string") {
      baseEmmet[i] = `${baseEmmet[i]}${maybeEmmet}${baseEmmet[i + 1]}`;
      baseEmmet.splice(i + 1, 1);
      emmetsOrElems.splice(i, 1);
    }
  }
  if (baseEmmet.some((bEmmet) => bEmmet === undefined))
    throw new Error(
      "Emmet: Cannot have consecutive pre-existing elements without emmet inbetween"
    );
  const choppeds = baseEmmet.map((emmet) =>
    emmet.replace(/\n\s*/g, "").split(/(?=[#.{|[()+>)|\\])/gm)
  );
  if (choppeds.length - 1 !== emmetsOrElems.length)
    throw new Error("Emmet-internal: mismatched strings and emmetsOrElems");
  const zipped = choppeds
    .flatMap((chopped, i) => [...chopped, emmetsOrElems[i]])
    .slice(0, -1)
    .filter((x): x is knownElement | Exclude<string, ""> => Boolean(x));
  // close separated {} and [] brackets due to special characters in the text
  let closingCurlyIndex = -1;
  [
    ["{", "}", "text"],
    ["[", "]", "attribute"],
  ].forEach(([opening, closing, name]) => {
    for (let i = zipped.length - 1; i >= 0; i--) {
      const chop = zipped[i];
      if (typeof chop === "string") {
        const [firstIsCurly, lastIsCurly] = [
          chop[0] === opening,
          chop[chop.length - 1] === closing,
        ];
        if (lastIsCurly) {
          if (closingCurlyIndex !== -1)
            throw new Error(
              `Emmet: Unbalanced ${opening}${closing} brackets, ${name} brackets cannot be nested`
            );
          else if (!firstIsCurly) closingCurlyIndex = i;

          // if first and last are curly, nothing needs to be done
        } else if (firstIsCurly) {
          if (closingCurlyIndex === -1 && chop !== opening)
            throw new Error(
              `Emmet: Unbalanced ${opening}${closing} brackets, ${name} brackets cannot be nested`
            );
          else {
            if (closingCurlyIndex === -1 && chop === opening)
              closingCurlyIndex = i + 1;
            const newChop = zipped.slice(i, closingCurlyIndex + 1).join("");
            zipped.splice(i, closingCurlyIndex - i + 1, newChop);
            closingCurlyIndex = -1;
          }
        }
      } else if (closingCurlyIndex !== -1)
        throw new Error(
          `Emmet: ${name} brackets ${opening}${closing} can only contain text`
        );
    }
    if (closingCurlyIndex !== -1)
      throw new Error(
        `Emmet: Unbalanced ${opening}${closing} brackets, ${name} brackets cannot be nested`
      );
  });
  return emmetCore(zipped);
}
/**
 * Given an emmet Text like "{foobar}", returns a TextNode with the text "foobar"
 * Given a non-emmet looking string, returns a TextNode with the text of the string
 * The distinction between the two is made by checking if the first character is "{"
 * Backslashes in front of special characters are removed
 * @param emmetText
 * @returns Text Node
 */
export function makeEmmetText(emmetText: string) {
  return document.createTextNode(
    emmetText[0] === "{"
      ? emmetText.slice(1, -1).replace(/\\([[\](){}|\\])/g, "$1")
      : emmetText
  );
}

function emmetCore(chopped: (string | knownElement)[]) {
  chopped = chopped.filter((x): x is Exclude<string, ""> | knownElement =>
    Boolean(x)
  );
  const zeroChop = chopped.shift();
  if (!zeroChop) throw new Error("Emmet: no content provided for emmet");
  if (typeof zeroChop === "string" && zeroChop[0] === "|")
    throw new Error(
      "Emmet: Invalid syntax, cannot begin with operator (|), consider using round brackets"
    );

  // Pre process chops to replace specific operations with same-result counterparts
  while (chopped.includes("|")) {
    // replace p|a{foo}| with p>(a{foo})
    const startIndex = chopped.findIndex(
      (chop) => typeof chop === "string" && chop.startsWith("|")
    );
    const endIndex = chopped.findIndex(
      (chop, i) => chop === "|" && i > startIndex
    );
    if (startIndex === -1) throw new Error("Emmet: Unbalanced | markers");
    chopped.splice(endIndex, 1, ")");
    // ! we found it before, so we know it's in range and it is a string
    chopped.splice(
      startIndex,
      1,
      (chopped[startIndex] as string).replace("|", "(")
    );
    chopped.splice(startIndex, 0, ">");
  }
  // Make main element
  let mainElem: knownElement;
  let returnNodeList = false;
  let parent: HTMLElement | undefined = undefined;
  let cwe: Exclude<knownElement, NodeList | Text>;
  if (typeof zeroChop === "string") {
    // mainElem is emmet
    const [chip, chap] = [zeroChop[0], zeroChop.slice(1)];
    switch (chip) {
      case ">":
      case "+":
        throw new Error(
          `Emmet: Invalid syntax, cannot begin with operator (${chip})`
        );
      case ")":
        throw new Error(`Emmet: Invalid syntax at first character (${chip})`);
      case "{":
        // exception to create text node
        if (chopped.length > 1)
          throw new Error("Emmet: Can't add anything to text node");
        return makeEmmetText(zeroChop);
      case "(":
        // exception to create a Nodelist
        returnNodeList = true;
        mainElem = document.createElement("template");
        parent = mainElem;
        const nextChop = chopped[0];
        if (chap) {
          // first node is emmet
          cwe = document.createElement(chap);
          mainElem.appendChild(cwe);
        } else {
          // first node should be pre-existing
          if (nextChop === ")")
            throw new Error("Emmet: Empty nodelist not allowed");
          chopped.unshift(">");
          cwe = mainElem;
        }
        break;
      default:
        mainElem = document.createElement(zeroChop);
        cwe = mainElem;
    }
  } else {
    // mainElem is pre-existing
    if (zeroChop instanceof Text) {
      if (chopped.length)
        throw new Error("Emmet: Can't add anything to text node");
      return zeroChop;
    } else if (zeroChop instanceof NodeList) {
      returnNodeList = true;
      mainElem = document.createElement("template");
      mainElem.append(...zeroChop);
      cwe = mainElem;
    } else {
      mainElem = zeroChop;
      cwe = mainElem;
    }
  }
  // Loop through all the other chops and process
  while (chopped.length) {
    // ! non-truthy values have been filtered out as the first step, while loop guarantees in range
    const chop = chopped.shift()!;
    if (typeof chop === "string") {
      // chop is emmet
      // ! non-truthy values have been filtered out as the first step, so string has at least one character
      const [chip, chap] = [chop[0]!, chop.slice(1)];
      switch (chip) {
        case ".":
        case "[":
        case "#":
        case "{":
          // application
          if (!chap) throw new Error("Emmet: Empty applications not allowed");
          switch (chip) {
            case ".":
              cwe.classList.add(chap);
              break;
            case "#":
              cwe.id = chap;
              break;
            case "{":
              cwe.appendChild(makeEmmetText(chop));
              break;
            case "[":
              applyAttributes(cwe, chop);
              break;
          }
          break;
        case ">":
        case "+":
          // operator
          // first make the subject of the operation (second operand)
          let subject: knownElement;
          let nextChop = chopped[0];
          if (chap) {
            // subject is emmet
            subject = document.createElement(chap);
          } else if (!nextChop) {
            throw new Error(
              "Emmet: Invalid syntax, operator cannot be last character"
            );
          } else if (typeof nextChop === "string") {
            // subject should be NodeList of Text
            // ! non-truthy values have been filtered out as the first step, so string has at least one character
            const nextChip = nextChop[0]!;
            switch (nextChip) {
              case "{":
                subject = makeEmmetText(nextChop);
                break;
              case "(":
                let depth = 0;
                const endIndex = chopped.findIndex((chop) => {
                  if (typeof chop === "string") {
                    const c = chop[0];
                    if (c === undefined) return false;
                    if (c === ")") depth--;
                    else if (c === "(") depth++;
                    return depth === 0;
                  } else return false;
                });
                subject = emmetCore(chopped.splice(0, endIndex + 1));
                break;
              default:
                throw new Error(
                  `Emmet: Invalid syntax, expected NodeList or Text but got other emmet (${nextChop})`
                );
            }
          } else {
            subject = nextChop;
            chopped.shift();
          }

          // then apply the operation (first operand)
          switch (chip) {
            case ">":
              if (subject instanceof Text)
                throw new Error(
                  "Emmet: Invalid syntax, Text nodes should be added without > operator"
                );
              else if (subject instanceof NodeList) {
                cwe.append(...subject);
                parent = cwe;
              } else {
                cwe.appendChild(subject);
                [parent, cwe] = [cwe, subject];
              }
              break;
            case "+":
              if (!parent)
                throw new Error(
                  "Emmet: cannot add siblings to top-level element, consider surrounding with () to make a NodeList"
                );
              if (subject instanceof NodeList) parent.append(...subject);
              else {
                parent.appendChild(subject);
                if (!(subject instanceof Text)) cwe = subject;
              }
              break;
          }
          break;
        case "|":
          throw new Error("Emmet: Unbalanced | markers");
      }
    } else {
      // chop is pre-existing element
      if (chop instanceof Text) cwe.appendChild(chop);
      else
        throw new Error(
          "Emmet: Invalid syntax, missing operator for pre-existing element"
        );
    }
  }
  return returnNodeList ? mainElem.childNodes : mainElem;
}
