const fs = require('fs')
const peg = require('pegjs')
const { assert } = require('chai')

let grammar
let parser

beforeEach(() => {
  grammar = fs.readFileSync('./grammar.pegjs').toString()
  parser = peg.generate(grammar)
})

function assertParses(selector, ...ast) {
  assert.deepEqual(parser.parse(selector), ast)
}

describe('selector parser', () => {
  it('parses tags', () => {
    assertParses('body', {
      selectors: [{
        type: 'tag',
        name: 'body',
      }]
    })
  })

  it('parses ids', () => {
    assertParses('#cool-thing', {
      selectors: [{
        type: 'id',
        id: 'cool-thing',
      }]
    })
  })

  it('parses classes', () => {
    assertParses('.cool-class', {
      selectors: [
        { type: 'class', name: 'cool-class' },
      ]
    })
  })

  it('parses compound selectors', () => {
    assertParses('img#nice.cool', {
      selectors: [
        { type: 'tag', name: 'img' },
        { type: 'id', id: 'nice' },
        { type: 'class', name: 'cool' },
      ]
    })
  })

  it('parses comma separated selectors', () => {
    assertParses('.what.is.up, select, #dang', {
      selectors: [
        { type: 'class', name: 'what' },
        { type: 'class', name: 'is' },
        { type: 'class', name: 'up' },
      ],
    }, {
      selectors: [
        { type: 'tag', name: 'select' },
      ],
    }, {
      selectors: [
        { type: 'id', id: 'dang' },
      ],
    })
  })

  it('parses descendant combinator', () => {
    assertParses('.parent #child', {
      type: 'descendant',
      left: {
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
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
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
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
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
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
        selectors: [
          { type: 'class', name: 'parent' },
        ],
      },
      right: {
        selectors: [
          { type: 'id', id: 'child' }
        ]
      }
    })
  })
})
