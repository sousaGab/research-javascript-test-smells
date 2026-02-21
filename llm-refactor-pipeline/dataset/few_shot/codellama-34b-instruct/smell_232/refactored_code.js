const p = bvModal.msgBoxOk('message', {
  static: true,
  id: 'test2',
  title: 'title'
})
expect(p).toBeDefined()
expect(p).toBeInstanceOf(Promise)