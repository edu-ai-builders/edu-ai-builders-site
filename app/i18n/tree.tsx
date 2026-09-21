import {
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
} from "react";
/** Translate React text and accessible labels before rendering, never mutate the DOM.
 * IDs, form values, event handlers, URLs and stored user records are left untouched.
 * Each component owns a boundary so subsequent interactive renders localize too.
 */
export function translateTree(
  node: ReactNode,
  t: (text: string) => string,
): ReactNode {
  if (typeof node === "string") return t(node);
  if (Array.isArray(node))
    return Children.map(node, (child) => translateTree(child, t));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Record<string, unknown>>;
  const props = element.props;
  if (props.translate === "no" || props["data-no-translate"]) return element;
  const next: Record<string, unknown> = {};
  if ("fallback" in props)
    next.fallback = translateTree(props.fallback as ReactNode, t);
  if ("children" in props)
    next.children = translateTree(props.children as ReactNode, t);
  for (const key of [
    "title",
    "aria-label",
    "aria-description",
    "placeholder",
    "alt",
  ])
    if (typeof props[key] === "string") next[key] = t(props[key]);
  return cloneElement(element, next);
}
