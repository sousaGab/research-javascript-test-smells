it('if focus leaves modal it returns to modal', async () => {
  const modal = createWrapper(BModal, {
    props: { static: true, id: 'test', visible: true },
  });

  const button = modal.find('#button');
  const modalContent = modal.find('div.modal-content');

  expect(button.exists()).toBe(true);
  expect(button.element.tagName).toBe('BUTTON');

  expect(modalContent.exists()).toBe(true);
  expect(modalContent.element.style.display).toEqual('block');
  expect(document.activeElement).not.toBe(document.body);
  expect(document.activeElement).toBe(modalContent.element);

  // Try and focus the external button
  button.element.focus();
  await button.trigger('focusin');
  expect(document.activeElement).not.toBe(button.element);
  expect(document.activeElement).toBe(modalContent.element);

  // Emulate TAB by focusing the `bottomTrap` span element
  // Should focus first button in modal (in the header)
  const bottomTrap = modal.findComponent(BModal).vm.$refs['bottom-trap'];
  expect(bottomTrap.exists()).toBe(true);
  expect(bottomTrap.element.tagName).toBe('SPAN');
  // Find the close (x) button (it is the only one with the `.close` class)
  const closeButton = modal.find('button.close');
  expect(closeButton.exists()).toBe(true);
  expect(closeButton.element.tagName).toBe('BUTTON');
  // Focus the tab trap
  bottomTrap.element.focus();
  await bottomTrap.trigger('focusin');
  expect(document.activeElement).not.toBe(bottomTrap.element);
  expect(document.activeElement).not.toBe(modalContent.element);
  // The close (x) button (first tabable in modal) should be focused
  expect(document.activeElement).toBe(closeButton.element);

  // Emulate CTRL-TAB by focusing the `topTrap` div element
  // Should focus last button in modal (in the footer)
  const topTrap = modal.findComponent(BModal).vm.$refs['top-trap'];
  expect(topTrap.exists()).toBe(true);
  expect(topTrap.element.tagName).toBe('SPAN');
  // Find the OK button (it is the only one with `.btn-primary` class)
  const okButton = modal.find('button.btn.btn-primary');
  expect(okButton.exists()).toBe(true);
  expect(okButton.element.tagName).toBe('BUTTON');
  // Focus the tab trap
  topTrap.element.focus();
  await topTrap.trigger('focusin');
  expect(document.activeElement).not.toBe(topTrap.element);
  expect(document.activeElement).not.toBe(bottomTrap.element);
  expect(document.activeElement).not.toBe(modalContent.element);
  // The OK button (last tabbable in modal) should be focused
  expect(document.activeElement).toBe(okButton.element);

  modal.destroy();
});