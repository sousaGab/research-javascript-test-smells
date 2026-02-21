// It appears that vue-test-utils does not run unbind when the directive is
// removed from the element. Only when the component is destroyed... unlike Vue
// Our directive instance should not exist
// let observer = wrapper.element.__bv__visibility_observer
// expect(observer).toBeUndefined()