// Your COMPLETE refactored test code here

it('works with $router to detect path and use-router set and linkGen returns string', async () => {
  const App = {
    compatConfig: { MODE: 3, COMPONENT_FUNCTIONAL: 'suppress-warning' },
    components: { BPaginationNav },
    methods: {
      linkGen(page) {
        return page === 2 ? '/' : `/${page}`
      }
    },
    template: `
      <div>
        <b-pagination-nav :number-of-pages="3" :link-gen="linkGen" use-router></b-pagination-nav>
        <router-view></router-view>
      </div>
    `
  }
  const FooRoute = {
    compatConfig: { MODE: 3, RENDER_FUNCTION: 'suppress-warning' },
    render(h) {
      return h('div', { class: 'foo-content' }, ['stub'])
    }
  }
  const router = new VueRouter({
    routes: [{ path: '/', component: FooRoute }, { path: '/:page', component: FooRoute }]
  })
  const wrapper = mount(App, { router })

  expect(wrapper).toBeDefined()

  // Wait for the router to initialize
  await new Promise(resolve => router.onReady(resolve))

  // Wait for the guessCurrentPage to complete
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)

  // The <pagination-nav> component should exist
  expect(wrapper.findComponent(BPaginationNav).exists()).toBe(true)
  // And should be on page 2
  expect(wrapper.findComponent(BPaginationNav).vm.currentPage).toBe(2)

  // Push router to a new page
  wrapper.vm.$router.push('/3')

  // Wait for the guessCurrentPage to complete
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)

  // The pagination-nav component should exist
  expect(wrapper.findComponent(BPaginationNav).exists()).toBe(true)
  // And should be on page 3
  expect(wrapper.findComponent(BPaginationNav).vm.currentPage).toBe(3)

  wrapper.destroy()
})