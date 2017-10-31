start = selectorGroup

selectorGroup
  = selector:( combinator )
    selectors:(_ "," _ aselector:( combinator ) { return aselector })*
  {
    return [selector, ...selectors]
  }

combinator
  = aCombinator / selector

selector
  = selectors:( classSelector / idSelector / tagSelector )+
  { return { selectors } }

aCombinator
  = left:selector operator:operator right:selector
  { return { type: operator, left, right } }

operator
  = operator:( child / sibling / adjacent / descendant )
  { return operator }

descendant = " " { return 'descendant' }
child = _ ">" _ { return 'child' }
sibling = _ "~" _ { return 'sibling' }
adjacent = _ "+" _ { return 'adjacent' }

tagSelector
 = identifier:identifier
  {
    return { type: 'tag', name: identifier }
  }

idSelector
 = "#" identifier:identifier
  {
    return { type: 'id', id: identifier }
  }

classSelector
 = "." identifier:identifier
  {
    return { type: 'class', name: identifier }
  }

identifier
 = chars:[a-zA-Z\-_0-9]+
  {
    return chars.join('')
  }

_  = [ \t\r\n]*

spaces = [ \t\r\n]+
