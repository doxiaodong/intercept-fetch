import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src/index'
import { url } from '../../mock/github'

const interceptor = new Interceptor({
  req: {
    id: 1,
    request(url, config) {
      return Promise.reject(url)
    }
  }
})

const fetchClient = new FetchClient()

describe('request get test', () => {
  test('url without ?', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(url, {
        a: 1
      })
    } catch (error) {
      expect(error).toBe(url + '?a=1')
    }
  })

  test('url with ?', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(url + '?a=1', {
        b: 1
      })
    } catch (error) {
      expect(error).toBe(url + '?a=1&b=1')
    }
  })

  test('object with undefined or null', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(url, {
        a: null
      })
    } catch (error) {
      expect(error).toBe(url)
    }
    try {
      await fetchClient.get(url, {
        a: undefined
      })
    } catch (error) {
      expect(error).toBe(url)
    }

    try {
      await fetchClient.get(url, {
        a: 'null'
      })
    } catch (error) {
      expect(error).toBe(url + '?a=null')
    }
    try {
      await fetchClient.get(url, {
        a: 'undefined'
      })
    } catch (error) {
      expect(error).toBe(url + '?a=undefined')
    }
  })

  test('object with 0 or ""', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(url, {
        a: 0
      })
    } catch (error) {
      expect(error).toBe(url + '?a=0')
    }
    try {
      await fetchClient.get(url, {
        a: ''
      })
    } catch (error) {
      expect(error).toBe(url + '?a=')
    }
  })
})
