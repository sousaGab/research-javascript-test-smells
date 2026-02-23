it('updates currentPage based on router path when use-router is enabled', async () => {
  const App = {
    compatConfig: {
      MODE: 3,
      COMPONENT_FUNCTIONAL: 'suppress-warning'
    },
    components: {
      BPaginationNav
    },
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
    compatConfig: {
      MODE: 3,
      RENDER_FUNCTION: 'suppress-warning'
    },
    render(h) {
      return h('div', {
        class: 'foo-content'
      }, ['stub'])
    }
  }

  const router = new VueRouter({
    routes: [{
      path: '/',
      component: FooRoute
    }, {
      path: '/:page',
      component: FooRoute
    }]
  })

  const wrapper = mount(App, {
    router
  })

  expect(wrapper).toBeDefined()

  await new Promise(resolve => router.onReady(resolve))
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)

  const paginationNav = wrapper.findComponent(BPaginationNav)
  expect(paginationNav.exists()).toBe(true)
  expect(paginationNav.vm.currentPage).toBe(2)

  wrapper.vm.$router.push('/3')

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)

  expect(paginationNav.exists()).toBe(true)
  expect(paginationNav.vm.currentPage).toBe(3)

  wrapper.destroy()
})