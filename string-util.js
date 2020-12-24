export { camel2separator, camel2hyphen, camel2underscore };

function camel2separator (camelcase, delimiter)
{
  return camelcase.replace (
    /[A-Z]/g,
    (match, offset) => (offset > 0 ? delimiter : '') + match.toLowerCase());
}

function camel2hyphen (camelcase)
{
  return camel2separator (camelcase, '-');
}

function camel2underscore (camelcase)
{
  return camel2separator (camelcase, '_');
}
