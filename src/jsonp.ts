import fetchJsonp from 'fetch-jsonp'
import { dealInterceptors } from './utils'

export default async function jsonp(url: string, config?: fetchJsonp.Options, fetchInterceptor = {}) {
  let newUrl = url
  let newConfig = { ...config }
  let res
  let err
  const ret = await dealInterceptors(fetchInterceptor['jsonpRequest'], newUrl, newConfig)
  newUrl = ret[0]
  newConfig = ret[1]
  try {
    res = await fetchJsonp(newUrl, newConfig)
  } catch (error) {
    err = await dealInterceptors(fetchInterceptor['jsonpError'], error)
    return Promise.reject(err)
  }
  res = await dealInterceptors(fetchInterceptor['jsonpResponse'], res)
  if (res.ok) {
    // TODO: if it's necessary to deal with jsonp parse error ?
    let data = await res.json()
    data = await dealInterceptors(fetchInterceptor['jsonpSuccess'], data)
    return data
  }
  err = await dealInterceptors(fetchInterceptor['jsonpError'], res)
  return Promise.reject(err)
}
