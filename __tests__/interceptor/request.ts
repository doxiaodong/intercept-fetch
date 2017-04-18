import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src/index'
import { url, user } from '../../mock/github'

const interceptor1 = new Interceptor({
  req: {
    id: 1,
    request(url, config) {
      return Promise.resolve([url, config])
    }
  }
})

const interceptor2 = new Interceptor({
  req: {
    id: 2,
    request(url, config) {
      return Promise.reject('req reject')
    }
  }
})

const fetchClient = new FetchClient()
fetchMock.get('*', user)

describe('request interceptor test', () => {
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
      expect(error).toBe('req reject')
    }
  })
})
