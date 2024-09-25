在 React 项目中，如果你已经使用 `axios` 进行了封装，可以通过添加 `axios` 的请求和响应拦截器来实现网络请求的监控。拦截器允许你在请求发送之前和响应接收到之后执行自定义的逻辑，比如计算请求耗时、监控请求的状态码和处理超时请求等。

下面是一个如何在 `axios` 中实现网络请求监控的示例代码。

### 实现步骤：

#### 1. **封装 Axios 实例**

首先，你需要封装一个 Axios 实例，并在实例中添加请求和响应拦截器。拦截器将帮助你监控每个请求的耗时、状态码以及错误处理等信息。

#### 2. **在拦截器中监控网络请求**

使用 `axios` 的请求和响应拦截器来计算请求的时间，监控状态码并处理失败的请求。

#### 3. **上报网络请求信息**

可以通过自定义逻辑将监控到的信息（如耗时、状态码、错误信息）上报到监控平台（如 Sentry）或者你的后端日志服务。

### 示例代码：

```javascript
import axios from "axios"
import * as Sentry from "@sentry/react"

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: "https://api.example.com", // 替换为你的 API 地址
  timeout: 10000, // 设置超时
})

// 请求拦截器：在请求发出之前
apiClient.interceptors.request.use(
  (config) => {
    // 在请求配置中记录开始时间
    config.metadata = { startTime: new Date() }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：在请求响应之后
apiClient.interceptors.response.use(
  (response) => {
    // 计算请求耗时
    const duration = new Date() - response.config.metadata.startTime
    console.log(`Request to ${response.config.url} took ${duration}ms`)

    // 请求成功时：可以将数据上报到后端或者监控平台
    // 例如上报到 Sentry
    Sentry.captureMessage(`Request to ${response.config.url} succeeded in ${duration}ms`, {
      level: "info",
      extra: {
        url: response.config.url,
        method: response.config.method,
        duration,
        status: response.status,
      },
    })

    return response
  },
  (error) => {
    // 请求失败时：计算耗时并捕捉错误
    if (error.config) {
      const duration = new Date() - error.config.metadata.startTime
      console.error(`Request to ${error.config.url} failed after ${duration}ms`)

      // 将错误上报到 Sentry
      Sentry.captureException(error, {
        extra: {
          url: error.config.url,
          method: error.config.method,
          duration,
          status: error.response ? error.response.status : "Network Error",
          errorMessage: error.message,
        },
      })
    }

    return Promise.reject(error)
  }
)

// 导出封装好的 axios 实例
export default apiClient
```

### 解释：

1. **创建 `axios` 实例**：
   - 我们使用 `axios.create()` 方法创建了一个 Axios 实例，并为其设置了基础 URL 和超时时间。
2. **请求拦截器**：

   - 在请求拦截器中，我们给每个请求配置对象（`config`）增加了一个 `metadata` 属性，用于记录请求开始的时间。这将用于计算请求的总耗时。

3. **响应拦截器**：
   - 在响应拦截器中，我们计算了请求的耗时，并将请求的 URL、HTTP 方法、耗时以及状态码打印到控制台。
   - 我们使用 `Sentry.captureMessage` 将成功的请求信息上报给 Sentry。
4. **错误拦截器**：

   - 如果请求失败（网络问题或服务器错误），我们同样计算请求的耗时，并将错误信息捕获并上报到 Sentry（或其他监控平台）。
   - 在 `error.response` 存在时捕获错误的状态码，如果没有响应则捕获网络错误。

5. **导出 `apiClient`**：
   - 最后，我们将封装好的 `axios` 实例导出，这样可以在项目的各个地方使用这个带有监控功能的 `axios` 实例。

### 使用封装好的 `apiClient`：

在你的 React 组件中，你可以像使用普通 `axios` 一样使用这个封装好的 `apiClient` 来发送请求。

```javascript
import React, { useEffect, useState } from "react"
import apiClient from "./apiClient" // 引入封装好的 Axios 实例

function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 使用封装好的 apiClient 发送请求
    apiClient
      .get("/endpoint")
      .then((response) => {
        setData(response.data)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
  }, [])

  return (
    <div>
      <h1>Data from API</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  )
}

export default MyComponent
```

### 优点：

- **灵活性**：可以很方便地通过拦截器获取请求信息，并在任何地方复用封装好的 `axios` 实例。
- **性能监控**：通过拦截器，能够捕获网络请求的耗时、状态码以及失败原因。
- **错误监控**：如果请求失败，能够捕获异常信息并通过 Sentry 或者其他监控平台上报错误。
- **超时处理**：你可以设置 `axios` 的 `timeout` 配置来处理超时请求，并在错误拦截器中捕捉超时错误。

### 扩展：

- **请求频率监控**：可以在请求拦截器中增加逻辑，统计同一段时间内请求的次数，防止请求过载。
- **上报更多信息**：根据需求，你还可以在拦截器中收集和上报更多的信息，比如请求参数、响应体等。

通过这种方式，你可以有效监控网络请求的性能，捕获失败请求，并根据需要将这些数据上报到后端或者第三方监控平台。
