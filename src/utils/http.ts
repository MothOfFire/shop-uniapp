import { useMemberStore } from '@/stores'

// 请求基地址
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 添加拦截器
// 拦截器的配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 1. 非 http 开头需要拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2. 请求超时设置为 10s
    options.timeout = 10000
    // 3. 添加小程序端请求头标识
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 4. 添加 token 请求头标识
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

/*
 * 请求函数
 * @Param UniApp.RequestOptions
 * @return Promise
 * 1. 返回 Promise 对象
 * 2. 请求成功
 *  2.1 提取核心数据 res.data
 *  2.2 添加类型，支持泛型
 * 3. 请求失败
 *  3.1 网络错误
 *  3.2 401 错误
 *  3.3 其他错误
 */
// 服务端返回值类型
interface ResData<T> {
  code: string
  msg: string
  result: T
}
// 请求函数
export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<ResData<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 响应成功
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 获取数据成功
          resolve(res.data as ResData<T>)
        } else if (res.statusCode === 401) {
          // 401 错误 清理用户信息，跳转到登入页面
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          // 跳转页面
          uni.navigateTo({
            url: '/pages/login/login',
          })
          reject(res)
        } else {
          // 其他错误
          uni.showToast({
            icon: 'none',
            title: (res.data as ResData<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        // 网络错误
        uni.showToast({
          icon: 'none',
          title: '网络错误，请换个网络试试',
        })
        reject(err)
      },
    })
  })
}
