const fs = require('fs')
const peg = require('pegjs')
const { assert } = require('chai')
const { JSDOM } = require('jsdom')
const dollar = require('.')

let grammar
let parser

beforeEach(() => {
  grammar = fs.readFileSync('./grammar.pegjs').toString()
  parser = peg.generate(grammar)
})

function assertParses(selector, ...ast) {
  assert.deepEqual(parser.parse(selector), ast)
}

function assertQueries(root, query, ...elements) {
  assert.deepEqual(dollar(root, query), elements)
}

describe('dollar function', () => {
  let document
  let body

  beforeEach(() => {
    document = (new JSDOM()).window.document
    body = document.body
  })

  it('finds elements by class', () => {
    let element = document.createElement('div')
    element.classList.add('with-class')
    body.appendChild(element)
    assertQueries(document.body, '.with-class', element)
  })

  it('finds elements by tag', () => {
    let element = document.createElement('div')
    body.appendChild(element)
    assertQueries(document.body, 'div', element)
  })

  it('finds element by id', () => {
    let element = document.createElement('div')
    element.setAttribute('id', 'dom')
    body.appendChild(element)
    assertQueries(document.body, '#dom', element)
  })

  describe('operators', () => {
    it('matches according to the descendent operator', () => {
      let parent = document.createElement('div')
      parent.classList.add('parent')

      let child = document.createElement('div')
      child.classList.add('child')

      let notChild = document.createElement('div')
      notChild.classList.add('child')

      parent.appendChild(child)
      body.appendChild(parent)
      body.appendChild(notChild)

      assertQueries(document.body, '.parent .child', child)
    })

    it('matches according to the child operator')

    it('matches according to the sibling operator')

    it('matchs according to the adjacent operator')
  })

  describe('finds by group selector', () => {
    it('finds elements once and only once', () => {
      let one = document.createElement('div')
      let two = document.createElement('div')
      let three = document.createElement('div')

      one.classList.add('one')
      two.classList.add('two')
      three.classList.add('three')

      document.body.appendChild(one)
      document.body.appendChild(two)
      document.body.appendChild(three)

      assertQueries(document.body, 'div, .one, .two', one, two, three)
    })
  })

  describe('finds element by compound selectors', () => {
    it('finds by multiple classes', () => {
      let element = document.createElement('div')
      element.classList.add('one', 'two', 'three')
      body.appendChild(element)

      let notElement = document.createElement('div')
      notElement.classList.add('one', 'two')
      body.appendChild(notElement)

      assertQueries(document.body, '.one.two.three', element)
    })

    it('finds by multiple selector types', () => {
      let div = document.createElement('div')
      div.classList.add('one')
      body.appendChild(div)

      let span = document.createElement('span')
      span.classList.add('one')
      body.appendChild(span)

      assertQueries(document.body, 'div.one', div)
    })
  })
})

describe('selector parser', () => {
  it('parses tags', () => {
    assertParses('body', {
      type: 'selector',
      selectors: [{
        type: 'tag',
        name: 'body',
      }]
    })
  })

  it('parses ids', () => {
    assertParses('#cool-thing', {
      type: 'selector',
      selectors: [{
        type: 'id',
        id: 'cool-thing',
      }]
    })
  })

  it('parses classes', () => {
    assertParses('.cool-class', {
      type: 'selector',
      selectors: [
        { type: 'class', name: 'cool-class' },
      ]
    })
  })

  it('parses compound selectors', () => {
    assertParses('img#nice.cool', {
      type: 'selector',
      selectors: [
        { type: 'tag', name: 'img' },
        { type: 'id', id: 'nice' },
        { type: 'class', name: 'cool' },
      ]
    })
  })

  it('parses comma separated selectors', () => {
    assertParses('.what.is.up, select, #dang', {
      type: 'selector',
      selectors: [
        { type: 'class', name: 'what' },
        { type: 'class', name: 'is' },
        { type: 'class', name: 'up' },
      ],
    }, {
      type: 'selector',
      selectors: [
        { type: 'tag', name: 'select' },
      ],
    }, {
      type: 'selector',
      selectors: [
        { type: 'id', id: 'dang' },
      ],
    })
  })

  it('parses descendant combinator', () => {
    assertParses('.parent #child', {
      type: 'descendant',
      left: {
        type: 'selector',
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
        type: 'selector',
        selectors: [
          { type: 'id', id: 'child' }
        ]
      }
    })
  })

  it('parses child combinator', () => {
    assertParses('.parent > #child', {
      type: 'child',
      left: {
        type: 'selector',
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
        type: 'selector',
        selectors: [
          { type: 'id', id: 'child' }
        ]
      }
    })
  })

  it('parses sibling combinator', () => {
    assertParses('.parent  ~ #child', {
      type: 'sibling',
      left: {
        type: 'selector',
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
        type: 'selector',
        selectors: [
          { type: 'id', id: 'child' }
        ]
      }
    })
  })

  it('parses adjacent combinator', () => {
    assertParses('.parent  + #child', {
      type: 'adjacent',
      left: {
        type: 'selector',
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
        type: 'selector',
        selectors: [
          { type: 'id', id: 'child' }
        ]
      }
    })
  })
})
