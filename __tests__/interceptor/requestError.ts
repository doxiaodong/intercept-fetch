import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src'

const interceptor1 = new Interceptor({
  requestError: {
    id: 1,
    requestError(fetchError) {
      return Promise.resolve('requestError resolve')
    }
  }
})

const interceptor2 = new Interceptor({
  requestError: {
    id: 2,
    requestError(fetchError) {
      return Promise.reject('requestError reject')
    }
  }
})

const fetchClient = new FetchClient()

fetchMock.get('*', {
  throws: 'server not found'
})

describe('requestError interceptor test', () => {

  test('resolve', async () => {
    fetchClient.setInterceptors(interceptor1)
    try {
      await fetchClient.get('http://error_url')
    } catch (error) {
      expect(error).toBe('requestError resolve')
    }
  })

  test('reject', async () => {
    fetchClient.clearInterceptors()
    fetchClient.setInterceptors(interceptor2)
    try {
      await fetchClient.get('http://error_url')
    } catch (error) {
      expect(error).toBe('requestError reject')
    }
  })
})
