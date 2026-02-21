expect(container.firstChild.children[0].disabled).toEqual(false);
expect(container.firstChild.children[1].disabled).toEqual(true);

expect(container.firstChild.childNodes[0].innerHTML).toEqual(
  '<option value="foo"></option>',
);
expect(container.firstChild.childNodes[1].innerHTML).toEqual(
  '<option value="bar"></option>',
);

expect(container.firstChild.children[0].children[0].selected).toEqual(true);
expect(container.firstChild.children[1].children[0].selected).toEqual(true);