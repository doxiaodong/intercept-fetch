export function addQueryString(url: string, param: { [key: string]: any }): string {
  for (const key in param) {
    if (param.hasOwnProperty(key) && param[key] != null) {
      url += url.indexOf('?') === -1 ? '?' : '&'
      url += `${encodeURIComponent(key)}=${encodeURIComponent(param[key])}`
    }
  }
  return url
}

export async function dealInterceptors(interceptors, ...data): Promise<any> {
  let isDoubleParams = false
  const dataLen = data.length
  let copyData
  if (dataLen === 2) {
    isDoubleParams = true
    copyData = data
  } else {
    copyData = data[0]
  }

  const len = interceptors.length
  let current = 0
  copyData = await recursion()
  return copyData

  async function recursion() {
    if (current < len) {
      copyData = isDoubleParams ?
        await interceptors[current](...copyData) :
        await interceptors[current](copyData)
      current++
      return recursion()
    }
    return copyData
  }
}
