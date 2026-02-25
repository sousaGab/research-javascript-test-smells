it('should be triggered after add', function (done) {
    list.on('updated', function (list) {
        expect(list.items.length).toBe(1);
        expect(list.items[0].name).toBe('Hej');
        done();
    });
    list.add({ name: 'Hej' });
});