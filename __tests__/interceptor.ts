import { Interceptor } from '../src'

const interceptor = new Interceptor({
  a: {
    id: 1
  }
})

describe('Interceptor test', () => {
  test('get', () => {
    expect(interceptor.get('a')).toEqual({ id: 1 })
    expect(interceptor.get('b')).toEqual(null)
  })
  test('forEach', () => {
    let tmpArray = []
    interceptor.forEach((value, key, target) => {
      tmpArray.push({ value, key, target })
    })
    expect(tmpArray[0]).toEqual({ value: { id: 1 }, key: 'a', target: interceptor })

    tmpArray = []
    interceptor.forEach(function(value, key, target) {
      tmpArray.push(this)
    }, 2)
    expect(tmpArray[0]).toEqual(2)
  })
  test('has', () => {
    expect(interceptor.has('a')).toEqual(true)
    expect(interceptor.has('b')).toEqual(false)
  })
  test('delete', () => {
    expect(interceptor.get('a')).toEqual({ id: 1 })
    interceptor.delete('a')
    expect(interceptor.get('a')).toEqual(null)
  })
  test('set', () => {
    interceptor.set('a', { id: 2 })
    expect(interceptor.get('a')).toEqual({ id: 2 })
  })
  test('merge', () => {
    interceptor.merge(new Interceptor({
      b: {
        id: 3
      }
    })).merge(new Interceptor({
      b: {
        id: 4
      }
    }))
    expect(interceptor.get('a')).toEqual({ id: 2 })
    expect(interceptor.get('b')).toEqual({ id: 3 })
  })

})
