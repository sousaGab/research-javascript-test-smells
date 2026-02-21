it('does not re-render parent child components', async () => {
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
        attrs: { value: this.value },
        domProps: { value: this.value },
        on: { ...this.$listeners, input: e => this.$emit('input', e.target.value) }
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
        attrs: { value: this.value },
        domProps: { value: this.value },
        on: { ...this.bvListeners, input: e => this.$emit('input', e.target.value) }
      })
    }
  }

  const createApp = (Component, componentName) => ({
    components: { [componentName]: Component },
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
      <${componentName} @focus="emit1" />
      <${componentName} @focus="emit2" />
    </div>`
  })

  const App1 = createApp(Input1, 'Input1')
  const App2 = createApp(Input2, 'Input2')

  const wrapper1 = mount(App1, { attachTo: document.body })
  const wrapper2 = mount(App2, { attachTo: document.body })

  // --- Shared test logic ---
  const runTests = async (wrapper, inputs, renderCount, componentName) => {
    // Initial state checks
    expect(inputs.length).toBe(2)
    expect(inputs.at(0)).toBeDefined()
    expect(inputs.at(1)).toBeDefined()
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(renderCount).toBe(2)

    // Trigger focus events without listeners enabled
    await inputs.at(0).trigger('focus')
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    await inputs.at(1).trigger('focus')
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(renderCount).toBe(2)

    // Enable first listener and trigger
    await wrapper.setProps({ listenFocus1: true })
    await inputs.at(0).trigger('focus')
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    
    // Check re-render count based on Vue version
    expect(renderCount).toBe(isVue3 ? 2 : componentName === 'Input1' ? 4 : 2)

    // Enable second listener and trigger
    await wrapper.setProps({ listenFocus2: true })
    await inputs.at(1).trigger('focus')
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).toBeTruthy()
    
    // Check re-render count based on Vue version
    expect(renderCount).toBe(isVue3 ? 2 : componentName === 'Input1' ? 6 : 2)
  }

  // --- `Input1` tests ---
  const $inputs1 = wrapper1.findAllComponents(Input1)
  await runTests(wrapper1, $inputs1, input1RenderCount, 'Input1')

  // --- `Input2` tests ---
  const $inputs2 = wrapper2.findAllComponents(Input2)
  await runTests(wrapper2, $inputs2, input2RenderCount, 'Input2')

  wrapper1.destroy()
  wrapper2.destroy()
})