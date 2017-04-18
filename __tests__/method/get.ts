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
})
