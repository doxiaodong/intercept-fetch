import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src/index'
import { url, user } from '../../mock/github'

const interceptor1 = new Interceptor({
  success: {
    id: 1,
    success(data) {
      return Promise.resolve(data)
    }
  }
})

const interceptor2 = new Interceptor({
  success: {
    id: 2,
    success(data) {
      return Promise.reject('success reject')
    }
  }
})

const fetchClient = new FetchClient()
fetchMock.get('*', user)

describe('success interceptor test', () => {
  test('resolve', async () => {
    fetchClient.setInterceptors(interceptor1)
    const data = await fetchClient.get(url)
    expect(data).toEqual(user)
  })

  test('reject', async () => {
    fetchClient.clearInterceptors()
    fetchClient.setInterceptors(interceptor2)
    try {
      await fetchClient.get(url)
    } catch (error) {
      expect(error).toBe('success reject')
    }
  })
})
