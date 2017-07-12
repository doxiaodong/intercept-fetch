import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src'
import { url as mockUrl } from '../../mock/github'

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
      await fetchClient.get(mockUrl, {
        a: 1
      })
    } catch (error) {
      expect(error).toBe(mockUrl + '?a=1')
    }
  })

  test('url with ?', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(mockUrl + '?a=1', {
        b: 1
      })
    } catch (error) {
      expect(error).toBe(mockUrl + '?a=1&b=1')
    }
  })

  test('object with undefined or null', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(mockUrl, {
        a: null
      })
    } catch (error) {
      expect(error).toBe(mockUrl)
    }
    try {
      await fetchClient.get(mockUrl, {
        a: undefined
      })
    } catch (error) {
      expect(error).toBe(mockUrl)
    }

    try {
      await fetchClient.get(mockUrl, {
        a: 'null'
      })
    } catch (error) {
      expect(error).toBe(mockUrl + '?a=null')
    }
    try {
      await fetchClient.get(mockUrl, {
        a: 'undefined'
      })
    } catch (error) {
      expect(error).toBe(mockUrl + '?a=undefined')
    }
  })

  test('object with 0 or ""', async () => {
    fetchClient.setInterceptors(interceptor)
    try {
      await fetchClient.get(mockUrl, {
        a: 0
      })
    } catch (error) {
      expect(error).toBe(mockUrl + '?a=0')
    }
    try {
      await fetchClient.get(mockUrl, {
        a: ''
      })
    } catch (error) {
      expect(error).toBe(mockUrl + '?a=')
    }
  })
})
