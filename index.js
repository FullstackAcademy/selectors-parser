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
  let elementMatches
  let parentMatches
  let siblingMatches
  let parent
  switch (ast.type) {
    case 'selector':
      return ast.selectors.every(selector => visitSelector(element, selector))
    case 'descendant':
      elementMatches = ast.right.selectors.every(selector =>
        visitSelector(element, selector)
      )
      parentMatches = false;
      parent = element.parentElement

      while (elementMatches && !parentMatches && parent) {
        parentMatches = ast.left.selectors.every(selector =>
          visitSelector(parent, selector)
        )
        parent = parent.parentElement
      }

      return elementMatches && parentMatches

    case 'child':
      elementMatches = ast.right.selectors.every(selector =>
        visitSelector(element, selector)
      )
      parentMatches = false;
      parent = element.parentElement

      if (elementMatches && parent) {
        parentMatches = ast.left.selectors.every(selector =>
          visitSelector(parent, selector)
        )
      }

      return elementMatches && parentMatches

    case 'adjacent':
      elementMatches = ast.right.selectors.every(selector =>
        visitSelector(element, selector)
      )
      let adjacentMatches = false;
      adjacent = element.previousElementSibling

      if (elementMatches && adjacent) {
        adjacentMatches = ast.left.selectors.every(selector =>
          visitSelector(adjacent, selector)
        )
      }

      return elementMatches && adjacentMatches

    case 'sibling':
      elementMatches = ast.right.selectors.every(selector =>
        visitSelector(element, selector)
      )
      let siblingMatches = false;
      sibling = element.previousElementSibling

      while (elementMatches && !siblingMatches && sibling) {
        siblingMatches = ast.left.selectors.every(selector =>
          visitSelector(sibling, selector)
        )
        sibling = sibling.previousElementSibling
      }

      return elementMatches && siblingMatches

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
