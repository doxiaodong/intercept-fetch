import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src'
import { url } from '../../mock/github'

const interceptor1 = new Interceptor({
  error: {
    id: 1,
    error(res) {
      return Promise.resolve(res)
    }
  }
})

const interceptor2 = new Interceptor({
  error: {
    id: 2,
    error(res) {
      return Promise.reject('error reject')
    }
  }
})

const fetchClient = new FetchClient()
fetchMock.get('*', {
  body: {
    code: 40100
  },
  status: 401
})

describe('error interceptor test', () => {
  test('resolve', async () => {
    fetchClient.setInterceptors(interceptor1)
    try {
      await fetchClient.get(url)
    } catch (error) {
      expect(error).toEqual({
        code: 40100
      })
    }
  })

  test('reject', async () => {
    fetchClient.clearInterceptors()
    fetchClient.setInterceptors(interceptor2)
    try {
      await fetchClient.get(url)
    } catch (error) {
      expect(error).toBe('error reject')
    }
  })
})
