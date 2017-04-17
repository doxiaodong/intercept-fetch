describe('async test', () => {
  test('callback', (done) => {
    function callback(data) {
      expect(data).toEqual(3)
      done()
    }
    asyncCallback(callback)
  })

  test('async/await', async () => {
    const data = await asyncAwait()
    expect(data).toEqual(3)
  })
})

function asyncAwait() {
  return Promise.resolve(3)
}

function asyncCallback(fn) {
  fn(3)
}
