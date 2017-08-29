import fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src'
import { url, user } from '../../mock/github'

const interceptor1 = new Interceptor({
  res: {
    id: 1,
    response(res) {
      return Promise.resolve(res)
    }
  }
})

const interceptor2 = new Interceptor({
  res: {
    id: 2,
    response(res) {
      return Promise.reject('res reject')
    }
  }
})

const fetchClient = new FetchClient()
fetchMock.get('*', user)

describe('response interceptor test', () => {
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
      expect(error).toBe('res reject')
    }
  })
})
