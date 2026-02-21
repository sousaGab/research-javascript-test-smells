const response1 = await client('abc')
expect(response1.statusCode).to.equal(307)
expect(response1.body).to.equal('served from our mock')
expect(scope.isDone()).to.equal(false)

const response2 = await client('not/available')
expect(response2.statusCode).to.equal(404)
expect(scope.isDone()).to.equal(false)

const response3 = await client('')
expect(response3.statusCode).to.equal(200)
expect(response3.body).to.equal('server served a response')
expect(scope.isDone()).to.equal(false)