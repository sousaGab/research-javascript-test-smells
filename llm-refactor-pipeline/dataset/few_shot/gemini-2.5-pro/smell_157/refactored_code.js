describe('parent child component re-rendering', () => {
  let input1RenderCount = 0
  let input2RenderCount = 0

  const Input1 = {
    compatConfig: {
      MODE: 3,
      RENDER_FUNCTION: 'suppress-warning',
      INSTANCE_LISTENERS: 'suppress-warning'
    },
    props: ['value'],
    render(h) {
      input1RenderCount++
      return h('input', {
        attrs: {
          value: this.value
        },
        domProps: {
          value: this.value
        },
        on: { ...this.$listeners,
          input: e => this.$emit('input', e.target.value)
        }
      })
    }
  }
  const Input2 = {
    compatConfig: {
      MODE: 3,
      RENDER_FUNCTION: 'suppress-warning',
      INSTANCE_LISTENERS: 'suppress-warning'
    },
    props: ['value'],
    mixins: [listenersMixin],
    render(h) {
      input2RenderCount++
      return h('input', {
        attrs: {
          value: this.value
        },
        domProps: {
          value: this.value
        },
        on: { ...this.bvListeners,
          input: e => this.$emit('input', e.target.value)
        }
      })
    }
  }

  const App1 = {
    components: {
      Input1
    },
    props: ['listenFocus1', 'listenFocus2'],
    methods: {
      emit1($event) {
        if (this.listenFocus1) {
          this.$emit('focus1', $event)
        }
      },
      emit2($event) {
        if (this.listenFocus2) {
          this.$emit('focus2', $event)
        }
      }
    },
    template: `<div>
        <Input1 @focus="emit1" />
        <Input1 @focus="emit2" />
      </div>`
  }
  const App2 = {
    components: {
      Input2
    },
    props: ['listenFocus1', 'listenFocus2'],
    methods: {
      emit1($event) {
        if (this.listenFocus1) {
          this.$emit('focus1', $event)
        }
      },
      emit2($event) {
        if (this.listenFocus2) {
          this.$emit('focus2', $event)
        }
      }
    },
    template: `<div>
        <Input2 @focus="emit1" />
        <Input2 @focus="emit2" />
      </div>`
  }

  beforeEach(() => {
    input1RenderCount = 0
    input2RenderCount = 0
  })

  it('with listenersMixin does not re-render components', async () => {
    const wrapper = mount(App2, {
      attachTo: document.body
    })
    const $inputs = wrapper.findAllComponents(Input2)

    expect($inputs.length).toBe(2)
    expect($inputs.at(0)).toBeDefined()
    expect($inputs.at(1)).toBeDefined()
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(input2RenderCount).toBe(2)

    await $inputs.at(0).trigger('focus')
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    await $inputs.at(1).trigger('focus')
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(input2RenderCount).toBe(2)

    await wrapper.setProps({
      listenFocus1: true
    })
    await $inputs.at(0).trigger('focus')
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(input2RenderCount).toBe(2)

    await wrapper.setProps({
      listenFocus2: true
    })
    await $inputs.at(1).trigger('focus')
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).toBeTruthy()
    expect(input2RenderCount).toBe(2)

    wrapper.destroy()
  })

  if (isVue3) {
    it('without listenersMixin does not re-render components in Vue 3', async () => {
      const wrapper = mount(App1, {
        attachTo: document.body
      })
      const $inputs = wrapper.findAllComponents(Input1)

      expect($inputs.length).toBe(2)
      expect($inputs.at(0)).toBeDefined()
      expect($inputs.at(1)).toBeDefined()
      expect(wrapper.emitted().focus1).not.toBeTruthy()
      expect(wrapper.emitted().focus2).not.toBeTruthy()
      expect(input1RenderCount).toBe(2)

      await $inputs.at(0).trigger('focus')
      expect(wrapper.emitted().focus1).not.toBeTruthy()
      await $inputs.at(1).trigger('focus')
      expect(wrapper.emitted().focus2).not.toBeTruthy()
      expect(input1RenderCount).toBe(2)

      await wrapper.setProps({
        listenFocus1: true
      })
      await $inputs.at(0).trigger('focus')
      expect(wrapper.emitted().focus1).toBeTruthy()
      expect(wrapper.emitted().focus2).not.toBeTruthy()
      expect(input1RenderCount).toBe(2)

      await wrapper.setProps({
        listenFocus2: true
      })
      await $inputs.at(1).trigger('focus')
      expect(wrapper.emitted().focus1).toBeTruthy()
      expect(wrapper.emitted().focus2).toBeTruthy()
      expect(input1RenderCount).toBe(2)

      wrapper.destroy()
    })
  } else {
    it('without listenersMixin re-renders both components in Vue 2', async () => {
      const wrapper = mount(App1, {
        attachTo: document.body
      })
      const $inputs = wrapper.findAllComponents(Input1)

      expect($inputs.length).toBe(2)
      expect($inputs.at(0)).toBeDefined()
      expect($inputs.at(1)).toBeDefined()
      expect(wrapper.emitted().focus1).not.toBeTruthy()
      expect(wrapper.emitted().focus2).not.toBeTruthy()
      expect(input1RenderCount).toBe(2)

      await $inputs.at(0).trigger('focus')
      expect(wrapper.emitted().focus1).not.toBeTruthy()
      await $inputs.at(1).trigger('focus')
      expect(wrapper.emitted().focus2).not.toBeTruthy()
      expect(input1RenderCount).toBe(2)

      await wrapper.setProps({
        listenFocus1: true
      })
      await $inputs.at(0).trigger('focus')
      expect(wrapper.emitted().focus1).toBeTruthy()
      expect(wrapper.emitted().focus2).not.toBeTruthy()
      expect(input1RenderCount).toBe(4)

      await wrapper.setProps({
        listenFocus2: true
      })
      await $inputs.at(1).trigger('focus')
      expect(wrapper.emitted().focus1).toBeTruthy()
      expect(wrapper.emitted().focus2).toBeTruthy()
      expect(input1RenderCount).toBe(6)

      wrapper.destroy()
    })
  }
})