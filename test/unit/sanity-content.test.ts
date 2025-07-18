import { expect, describe, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineAsyncComponent, defineComponent, h, markRaw } from 'vue'
import SanityContent from '../../src/runtime/components/sanity-content'

import * as exampleBlocks from './fixture/portable-text'

const CustomBlockComponent = defineComponent({
  props: { exampleProp: String },
  setup: (props, { slots }) => () => h('div', {}, {
    default: () => [
      props.exampleProp,
      slots.default?.(),
    ],
  }),
})

describe('SanityContent', () => {
  it('should render with no props', () => {
    const wrapper = mount(SanityContent)
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test basic rendering with Vue PortableText
  it('should render with Vue PortableText when usePortableTextVue is true', () => {
    const wrapper = mount(SanityContent, {
      props: {
        usePortableTextVue: true,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test rendering text blocks with marks using Vue PortableText
  it('should render text blocks with marks correctly using Vue PortableText', () => {
    const textBlock = {
      _key: 'test-block',
      _type: 'block',
      children: [
        {
          _key: 'text-1',
          _type: 'span',
          marks: [],
          text: 'Regular text and ',
        },
        {
          _key: 'text-2',
          _type: 'span',
          marks: ['strong'],
          text: 'bold text',
        },
        {
          _key: 'text-3',
          _type: 'span',
          marks: ['em'],
          text: ' and italic text',
        },
      ],
      markDefs: [],
      style: 'normal',
    }

    const wrapper = mount(SanityContent, {
      props: {
        blocks: [textBlock],
        usePortableTextVue: true,
      },
    })

    // Verify content renders with correct HTML elements
    expect(wrapper.html()).toContain('Regular text and')
    expect(wrapper.html()).toContain('<strong>bold text</strong>')
    expect(wrapper.html()).toContain('<em> and italic text</em>')
    expect(wrapper.html()).toMatchSnapshot()
  })

  Object.entries(exampleBlocks).forEach(([component, block]) => {
    // Test with traditional rendering method
    it(`should render ${component} blocks with traditional renderer`, () => {
      const wrapper = mount(SanityContent as any, {
        props: {
          blocks: Array.isArray(block) ? block : [block],
          serializers: markRaw({
            types: {
              customIcon: 'i',
              // This is how to access a component registered by `@nuxt/components`
              customComponent1: CustomBlockComponent,
              // A directly imported component
              customComponent2: CustomBlockComponent,
              // Example of a more complex async component
              customComponent3: defineAsyncComponent({
                loadingComponent: () => h('div', 'Loading...'),
                loader: () => Promise.resolve(CustomBlockComponent),
              }),
            },
            styles: {
              customStyle1: CustomBlockComponent,
            },
          }),
        },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    // Test with Vue PortableText rendering method
    it(`should render ${component} blocks with Vue PortableText`, () => {
      const wrapper = mount(SanityContent as any, {
        props: {
          blocks: Array.isArray(block) ? block : [block],
          serializers: markRaw({
            types: {
              customIcon: 'i',
              customComponent1: CustomBlockComponent,
              customComponent2: CustomBlockComponent,
              customComponent3: defineAsyncComponent({
                loadingComponent: () => h('div', 'Loading...'),
                loader: () => Promise.resolve(CustomBlockComponent),
              }),
            },
            styles: {
              customStyle1: CustomBlockComponent,
            },
          }),
          usePortableTextVue: true,
        },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

// Add specific tests for the Vue PortableText implementation
describe('SanityContent with Vue PortableText', () => {
  // Test custom props are passed correctly
  it('should pass custom props to components correctly', () => {
    const CustomPropsComponent = defineComponent({
      props: {
        customProp: String,
        anotherProp: Number,
      },
      setup: props => () => h('div', { class: 'custom-component' }, `Props: ${props.customProp}, ${props.anotherProp}`),
    })

    const blocks = [{
      _type: 'customBlock',
      _key: 'test123',
      customProp: 'test value',
      anotherProp: 42,
    }] as any[]

    const wrapper = mount(SanityContent, {
      props: {
        blocks,
        serializers: {
          types: {
            customBlock: CustomPropsComponent,
          },
        },
        usePortableTextVue: true,
      },
    })

    expect(wrapper.html()).toContain('Props: test value, 42')
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test for link marks with markDefs
  it('should render link marks with href correctly', () => {
    const linkBlock = {
      _key: 'link-block',
      _type: 'block',
      children: [
        {
          _key: 'text-before',
          _type: 'span',
          marks: [],
          text: 'Visit ',
        },
        {
          _key: 'link-text',
          _type: 'span',
          marks: ['link-1'],
          text: 'our website',
        },
        {
          _key: 'text-after',
          _type: 'span',
          marks: [],
          text: ' for more info.',
        },
      ],
      markDefs: [
        {
          _key: 'link-1',
          _type: 'link',
          href: 'https://example.com',
        },
      ],
      style: 'normal',
    } as any

    const wrapper = mount(SanityContent, {
      props: {
        blocks: [linkBlock],
        usePortableTextVue: true,
      },
    })

    expect(wrapper.html()).toContain('<a href="https://example.com">our website</a>')
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test for compatibility between both rendering methods
  it('should render mixed content blocks consistently with both rendering methods', () => {
    // Create a complex set of blocks with various features
    const complexBlocks = [
      // Custom block type
      {
        _type: 'customBlock',
        _key: 'custom1',
        content: 'Custom block content',
      },
      // Normal text with styles and marks
      {
        _key: 'text1',
        _type: 'block',
        style: 'h2',
        children: [
          {
            _key: 'text1-span1',
            _type: 'span',
            marks: ['strong'],
            text: 'Styled heading with marks',
          },
        ],
        markDefs: [],
      },
      // List block
      {
        _key: 'list1',
        _type: 'block',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _key: 'list1-item1',
            _type: 'span',
            marks: [],
            text: 'List item 1',
          },
        ],
        markDefs: [],
      },
      {
        _key: 'list2',
        _type: 'block',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _key: 'list2-item1',
            _type: 'span',
            marks: ['em'],
            text: 'List item 2 with emphasis',
          },
        ],
        markDefs: [],
      },
    ] as any[]

    const CustomBlock = defineComponent({
      props: ['content'],
      setup: props => () => h('div', { class: 'custom-content' }, props.content),
    })

    const serializers = {
      types: {
        customBlock: CustomBlock,
      },
    }

    // Render with traditional method
    const traditionalWrapper = mount(SanityContent, {
      props: {
        blocks: complexBlocks,
        serializers,
      },
    })

    // Render with Vue PortableText
    const portableTextWrapper = mount(SanityContent, {
      props: {
        blocks: complexBlocks,
        serializers,
        usePortableTextVue: true,
      },
    })

    // Check that both contain the expected content
    expect(traditionalWrapper.html()).toContain('Custom block content')
    expect(portableTextWrapper.html()).toContain('Custom block content')

    expect(traditionalWrapper.html()).toContain('<h2>')
    expect(portableTextWrapper.html()).toContain('<h2>')

    expect(traditionalWrapper.html()).toContain('<strong>Styled heading with marks</strong>')
    expect(portableTextWrapper.html()).toContain('<strong>Styled heading with marks</strong>')

    expect(traditionalWrapper.html()).toContain('<ul>')
    expect(portableTextWrapper.html()).toContain('<ul>')

    expect(traditionalWrapper.html()).toContain('<em>List item 2 with emphasis</em>')
    expect(portableTextWrapper.html()).toContain('<em>List item 2 with emphasis</em>')

    // Save snapshots
    expect(traditionalWrapper.html()).toMatchSnapshot('traditional-rendering')
    expect(portableTextWrapper.html()).toMatchSnapshot('portable-text-rendering')
  })

  // Test for nested block handling
  it('should handle nested blocks correctly', () => {
    const NestedBlockComponent = defineComponent({
      props: ['title', 'content', 'items'],
      setup: props => () => h('div', { class: 'nested-block' }, [
        h('h3', {}, props.title),
        h('p', {}, props.content),
        h('ul', {}, props.items?.map((item: string) => h('li', {}, item))),
      ]),
    })

    const nestedBlock = {
      _type: 'nestedBlock',
      _key: 'nested1',
      title: 'Nested Block Title',
      content: 'Nested block content goes here',
      items: ['Item 1', 'Item 2', 'Item 3'],
    } as any

    const wrapper = mount(SanityContent, {
      props: {
        blocks: [nestedBlock],
        serializers: {
          types: {
            nestedBlock: NestedBlockComponent,
          },
        },
        usePortableTextVue: true,
      },
    })

    // Verify all nested content is present
    expect(wrapper.html()).toContain('Nested Block Title')
    expect(wrapper.html()).toContain('Nested block content goes here')
    expect(wrapper.html()).toContain('Item 1')
    expect(wrapper.html()).toContain('Item 2')
    expect(wrapper.html()).toContain('Item 3')
    expect(wrapper.html()).toMatchSnapshot()
  })
})
