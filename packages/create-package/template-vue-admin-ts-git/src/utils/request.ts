import axios from 'axios'

// create an axios instance
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
})

// request interceptor
request.interceptors.request.use(
  (config) => {
    // do something before request is sent

    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
request.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data as {
      [k: string]: any
      code: number
      msg?: string
    }
    const { code, msg } = res

    // if the custom code is not 20000, it is judged as an error.
    if (code !== 20000) {
      ElMessage.error({
        message: msg,
        duration: 5000,
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (code === 50008 || code === 50012 || code === 50014) {
        // to re-login
        ElMessageBox.confirm(
          'You have been logged out, you can cancel to stay on this page, or log in again',
          'Confirm logout',
          {
            confirmButtonText: 'Re-Login',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }
        ).then(() => {
          const userStore = useUserStore()
          userStore.resetToken()
          location.reload()
        })
      }
      return Promise.reject(new Error(msg))
    } else {
      return response
    }
  },
  (error) => {
    console.log('err' + error) // for debug
    ElMessage.error({
      message: error.response?.data?.msg || error.message,
      duration: 5000,
    })
    return Promise.reject(error)
  }
)

export { request }
