// Your COMPLETE refactored test code here

it('Emits the expected event sequence when `write` is called on an aborted request', async () => {
    const scope = nock('http://example.test').get('/').reply()

    const req = http.request('http://example.test')
    const emitSpy = sinon.spy(req, 'emit')
    req.abort()
    req.write('foo')

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(emitSpy).to.have.been.calledTwice()
    expect(emitSpy.firstCall).to.have.been.calledWith('close')
    expect(emitSpy.secondCall).to.have.been.calledWith('abort')
    expect(scope.isDone()).to.be.false()
});