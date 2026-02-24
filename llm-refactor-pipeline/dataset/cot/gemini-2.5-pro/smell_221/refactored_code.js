it('updates currentPage based on the router path when use-router is enabled', async () => {
    // Arrange
    const linkGen = page => (page === 2 ? '/' : `/${page}`)

    const RouteComponent = {
      compatConfig: { MODE: 3, RENDER_FUNCTION: 'suppress-warning' },
      render(h) {
        return h('div', { class: 'route-content' }, ['stub'])
      }
    }

    const TestApp = {
      compatConfig: { MODE: 3, COMPONENT_FUNCTIONAL: 'suppress-warning' },
      components: { BPaginationNav },
      methods: { linkGen },
      template: `
        <div>
          <b-pagination-nav :number-of-pages="3" :link-gen="linkGen" use-router></b-pagination-nav>
          <router-view></router-view>
        </div>
      `
    }

    const router = new VueRouter({
      routes: [{ path: '/', component: RouteComponent }, { path: '/:page', component: RouteComponent }]
    })

    const wrapper = mount(TestApp, { router })

    const waitForPaginationUpdate = async () => {
      await waitNT(wrapper.vm)
      await waitRAF()
      await waitNT(wrapper.vm)
    }

    // Act & Assert: Initial render reflects the current route
    await new Promise(resolve => router.onReady(resolve))
    await waitForPaginationUpdate()

    const paginationNav = wrapper.findComponent(BPaginationNav)
    expect(paginationNav.exists()).toBe(true)
    expect(paginationNav.vm.currentPage).toBe(2) // Initial path '/' maps to page 2

    // Act & Assert: Component updates when the route changes
    await wrapper.vm.$router.push('/3')
    await waitForPaginationUpdate()

    expect(paginationNav.vm.currentPage).toBe(3) // New path '/3' maps to page 3

    wrapper.destroy()
})