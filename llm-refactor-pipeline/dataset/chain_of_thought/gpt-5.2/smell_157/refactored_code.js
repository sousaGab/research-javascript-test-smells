it('does not re-render parent child components', async () => {
  const createInputComponent = ({ getListeners, onRender }) => ({
    compatConfig: {
      MODE: 3,
      RENDER_FUNCTION: 'suppress-warning',
      INSTANCE_LISTENERS: 'suppress-warning'
    },
    props: ['value'],
    mixins: getListeners ? [listenersMixin] : [],
    render(h) {
      onRender()
      const listeners = getListeners ? getListeners(this) : this.$listeners
      return h('input', {
        attrs: { value: this.value },
        domProps: { value: this.value },
        on: { ...listeners, input: e => this.$emit('input', e.target.value) }
      })
    }
  })

  const createAppComponent = Input => ({
    components: { Input },
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
      <Input @focus="emit1" />
      <Input @focus="emit2" />
    </div>`
  })

  const assertInitialState = ({ wrapper, inputs, expectedRenderCount }) => {
    expect(inputs.length).toBe(2)
    expect(inputs.at(0)).toBeDefined()
    expect(inputs.at(1)).toBeDefined()
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(expectedRenderCount()).toBe(2)
  }

  const assertNoFocusEmittedAndNoRerender = async ({ wrapper, inputs, expectedRenderCount }) => {
    await inputs.at(0).trigger('focus')
    expect(wrapper.emitted().focus1).not.toBeTruthy()
    await inputs.at(1).trigger('focus')
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(expectedRenderCount()).toBe(2)
  }

  const assertFocus1Enabled = async ({ wrapper, inputs, expectedRenderCount, expectedCountAfter }) => {
    await wrapper.setProps({ listenFocus1: true })
    await inputs.at(0).trigger('focus')
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).not.toBeTruthy()
    expect(expectedRenderCount()).toBe(expectedCountAfter)
  }

  const assertFocus2Enabled = async ({ wrapper, inputs, expectedRenderCount, expectedCountAfter }) => {
    await wrapper.setProps({ listenFocus2: true })
    await inputs.at(1).trigger('focus')
    expect(wrapper.emitted().focus1).toBeTruthy()
    expect(wrapper.emitted().focus2).toBeTruthy()
    expect(expectedRenderCount()).toBe(expectedCountAfter)
  }

  const runScenario = async ({ Input, expectedAfterFocus1, expectedAfterFocus2 }) => {
    const App = createAppComponent(Input)
    const wrapper = mount(App, { attachTo: document.body })
    const inputs = wrapper.findAllComponents(Input)

    const expectedRenderCount = () => Input.__renderCount

    assertInitialState({ wrapper, inputs, expectedRenderCount })
    await assertNoFocusEmittedAndNoRerender({ wrapper, inputs, expectedRenderCount })
    await assertFocus1Enabled({
      wrapper,
      inputs,
      expectedRenderCount,
      expectedCountAfter: expectedAfterFocus1
    })
    await assertFocus2Enabled({
      wrapper,
      inputs,
      expectedRenderCount,
      expectedCountAfter: expectedAfterFocus2
    })

    wrapper.destroy()
  }

  const makeCountedInput = ({ getListeners }) => {
    const Input = createInputComponent({
      getListeners,
      onRender: () => {
        Input.__renderCount++
      }
    })
    Input.__renderCount = 0
    return Input
  }

  const Input1 = makeCountedInput({ getListeners: null })
  const Input2 = makeCountedInput({ getListeners: vm => vm.bvListeners })

  await runScenario({
    Input: Input1,
    expectedAfterFocus1: isVue3 ? 2 : 4,
    expectedAfterFocus2: isVue3 ? 2 : 6
  })

  await runScenario({
    Input: Input2,
    expectedAfterFocus1: 2,
    expectedAfterFocus2: 2
  })
})