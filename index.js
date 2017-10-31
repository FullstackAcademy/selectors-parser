const fs = require('fs')
const peg = require('pegjs')

const grammar = fs.readFileSync('./grammar.pegjs').toString()
const parser = peg.generate(grammar)

function visitSelector(element, selector) {
  switch (selector.type) {
    case 'class':
      return element.classList.contains(selector.name)
    case 'id':
      return element.getAttribute('id') === selector.id
    case 'tag':
      return element.tagName === selector.name.toUpperCase()
    default: return false
  }
}

function visitAST (element, ast) {
  switch (ast.type) {
    case 'selector':
      return ast.selectors.every(selector => visitSelector(element, selector))
    case 'descendant':
      const elementMatches = ast.right.selectors.every(selector =>
        visitSelector(element, selector)
      )
      let parentMatches = false;
      let parent = element.parentElement

      while (!parentMatches && parent) {
        parentMatches = ast.left.selectors.every(selector =>
          visitSelector(parent, selector)
        )
        parent = parent.parentElement
      }

      return elementMatches && parentMatches

    case 'child': throw 'child operator unimplemented'
    case 'adjacent': throw 'adjacent operator unimplemented'
    case 'sibling': throw 'sibling operator unimplemented'
    default: return false
  }
}

function applyAST (element, ast) {
  const document = element.ownerDocument
  const walker = document.createTreeWalker(element)
  const matches = new Set
  let node
  while (node = walker.nextNode()) {
    ast.forEach(item => {
      if (visitAST(node, item)) {
        matches.add(node)
      }
    })
  }
  return [...matches]
}

function dollar (root, selector) {
  const ast = parser.parse(selector)
  return applyAST(root, ast)
}

module.exports = dollar
