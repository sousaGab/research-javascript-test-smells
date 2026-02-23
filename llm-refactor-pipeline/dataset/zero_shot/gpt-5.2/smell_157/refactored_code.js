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

  const createApp = InputComponent => ({
    components: { [InputComponent.name || 'Input']: InputComponent },
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
      <${InputComponent.name || 'Input'} @focus="emit1" />
      <${InputComponent.name || 'Input'} @focus="emit2" />
    </div>`
  })

  const assertNoFocusEmits = wrapper => {
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
  }

  const assertOnlyFocus1Emitted = wrapper => {
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
  }

  const assertBothFocusEmitted = wrapper => {
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).toBeTruthy()
  }

  const assertTwoInputsPresent = (wrapper, InputComponent) => {
    const $inputs = wrapper.findAllComponents(InputComponent)
    expect($inputs.length).toBe(2)
    expect($inputs.at(0)).toBeDefined()
    expect($inputs.at(1)).toBeDefined()
    return $inputs
  }

  const runInput1Assertions = async () => {
    const App1 = createApp(Input1)
    const wrapper1 = mount(App1, { attachTo: document.body })

    const $inputs1 = assertTwoInputsPresent(wrapper1, Input1)
    assertNoFocusEmits(wrapper1)
    expect(input1RenderCount).toBe(2)

    await $inputs1.at(0).trigger('focus')
    expect(wrapper1.emitted().focus1).not.toBeTruthy()
    await $inputs1.at(1).trigger('focus')
    expect(wrapper1.emitted().focus2).not.toBeTruthy()
    expect(input1RenderCount).toBe(2)

    await wrapper1.setProps({ listenFocus1: true })
    await $inputs1.at(0).trigger('focus')
    assertOnlyFocus1Emitted(wrapper1)
    expect(input1RenderCount).toBe(2)

    await wrapper1.setProps({ listenFocus2: true })
    await $inputs1.at(1).trigger('focus')
    assertBothFocusEmitted(wrapper1)
    expect(input1RenderCount).toBe(2)

    wrapper1.destroy()
  }

  const runInput1AssertionsVue2 = async () => {
    const App1 = createApp(Input1)
    const wrapper1 = mount(App1, { attachTo: document.body })

    const $inputs1 = assertTwoInputsPresent(wrapper1, Input1)
    assertNoFocusEmits(wrapper1)
    expect(input1RenderCount).toBe(2)

    await $inputs1.at(0).trigger('focus')
    expect(wrapper1.emitted().focus1).not.toBeTruthy()
    await $inputs1.at(1).trigger('focus')
    expect(wrapper1.emitted().focus2).not.toBeTruthy()
    expect(input1RenderCount).toBe(2)

    await wrapper1.setProps({ listenFocus1: true })
    await $inputs1.at(0).trigger('focus')
    assertOnlyFocus1Emitted(wrapper1)
    expect(input1RenderCount).toBe(4)

    await wrapper1.setProps({ listenFocus2: true })
    await $inputs1.at(1).trigger('focus')
    assertBothFocusEmitted(wrapper1)
    expect(input1RenderCount).toBe(6)

    wrapper1.destroy()
  }

  const runInput2Assertions = async () => {
    const App2 = createApp(Input2)
    const wrapper2 = mount(App2, { attachTo: document.body })

    const $inputs2 = assertTwoInputsPresent(wrapper2, Input2)
    assertNoFocusEmits(wrapper2)
    expect(input2RenderCount).toBe(2)

    await $inputs2.at(0).trigger('focus')
    expect(wrapper2.emitted().focus1).not.toBeTruthy()
    await $inputs2.at(1).trigger('focus')
    expect(wrapper2.emitted().focus2).not.toBeTruthy()
    expect(input2RenderCount).toBe(2)

    await wrapper2.setProps({ listenFocus1: true })
    await $inputs2.at(0).trigger('focus')
    assertOnlyFocus1Emitted(wrapper2)
    expect(input2RenderCount).toBe(2)

    await wrapper2.setProps({ listenFocus2: true })
    await $inputs2.at(1).trigger('focus')
    assertBothFocusEmitted(wrapper2)
    expect(input2RenderCount).toBe(2)

    wrapper2.destroy()
  }

  if (isVue3) {
    await runInput1Assertions()
  } else {
    await runInput1AssertionsVue2()
  }

  await runInput2Assertions()
})