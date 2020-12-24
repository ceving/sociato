export {text, element, html, svg};

/**
* Create a text node.
*/
function text (text)
{
  return document.createTextNode (text);
}

/**
* Create an element tree with a given namespace.
*/
function element (namespace, name, attributes, ...elements)
{
  const element = document.createElementNS (namespace, name);
  for (let attribute in attributes)
    element.setAttribute (attribute, attributes[attribute]);
  for (let child of elements)
    element.appendChild (child);
  return element;
}

/**
 * Create an element tree with the HTML namespace.
 */
function html (name, attributes, ...elements)
{
  return element ('http://www.w3.org/1999/xhtml', name, attributes, ...elements);
}

/**
 * Create an element tree with the SVG namespace.
 */
function svg (name, attributes, ...elements)
{
  return element ('http://www.w3.org/2000/svg', name, attributes, ...elements);
}

