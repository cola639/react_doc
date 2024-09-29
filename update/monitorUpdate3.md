在 `create-react-app`（CRA） 中实现无感刷新，可以使用 Service Worker 来缓存资源并在后台静默更新。`create-react-app` 默认配置了 Service Worker，但需要手动启用并进行一些自定义调整来实现无感更新。

以下是一个完整的实践示例，演示如何在 `CRA` 中实现无感刷新：

### 1. 创建 React 应用并启用 Service Worker

首先，创建一个新的 React 应用，并启用 Service Worker：

```bash
npx create-react-app my-app
cd my-app
```

在 `CRA` 中，Service Worker 默认是处于禁用状态的。要启用 Service Worker，打开 `src/index.js`，并替换 `serviceWorkerRegistration.unregister()` 为 `serviceWorkerRegistration.register()`。

#### `src/index.js`：

```jsx
import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)

// 启用 Service Worker
serviceWorkerRegistration.register()
```

### 2. 修改 `serviceWorkerRegistration.js` 实现无感更新

`create-react-app` 提供了一个默认的 `serviceWorkerRegistration.js` 文件。为了实现无感更新，我们需要自定义该文件，以便当 Service Worker 安装新版本时静默缓存新资源，并让用户在后台自动获得更新内容。

#### `src/serviceWorkerRegistration.js`：

```js
// 这是 create-react-app 提供的默认 Service Worker 文件
const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      return
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config)

        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://cra.link/PWA"
          )
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // 静默更新缓存内容，但不立即应用新版本
              console.log(
                "New content is available and will be used when all tabs for this page are closed."
              )

              if (config && config.onUpdate) {
                config.onUpdate(registration)
              }
            } else {
              console.log("Content is cached for offline use.")

              if (config && config.onSuccess) {
                config.onSuccess(registration)
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error)
    })
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      const contentType = response.headers.get("content-type")
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
    .catch(() => {
      console.log("No internet connection found. App is running in offline mode.")
    })
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
```

### 3. 添加无感更新逻辑

为了实现无感更新，我们在用户没有操作时静默地更新缓存内容，并在下次用户关闭或重新打开页面时使用新内容，而不强制用户立即刷新页面。

我们可以在 `App.js` 中加入一个监听器来处理 `serviceWorker` 的更新消息。我们不提示用户立即刷新，而是等待用户下次自然刷新或重启时加载新内容。

#### `src/App.js`：

```jsx
import React, { useEffect } from "react"
import "./App.css"

function App() {
  useEffect(() => {
    // 监听 Service Worker 更新
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("New content is available; will be used after this tab is closed.")
      })
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>This app will automatically update in the background.</p>
      </header>
    </div>
  )
}

export default App
```

### 4. 使用 `stale-while-revalidate` 策略进行无感更新

为了实现无感刷新，我们可以使用 `stale-while-revalidate` 策略，这种策略会立即返回缓存中的资源，同时在后台获取新资源并缓存下来，下次页面加载时使用新资源。

在 `service-worker.js` 中（默认由 `CRA` 自动生成的 `service-worker.js`），已经实现了缓存优先的策略。如果你需要更精细的控制，可以使用 Workbox 来自定义缓存策略。

### 5. 测试无感更新

1. **启动应用：**

   - 在开发模式下运行应用：
     ```bash
     npm start
     ```

2. **构建生产版本：**

   - 运行 `npm run build` 构建生产版本，生成的 `service-worker.js` 文件会被自动添加到 `build` 目录中。

3. **服务生产版本：**

   - 你可以通过 `serve` 或任何静态文件服务器来提供生产版本：
     ```bash
     npm install -g serve
     serve -s build
     ```

4. **验证无感更新：**
   - 打开应用，确保 Service Worker 已经成功注册。
   - 修改代码，并重新构建应用。
   - 再次访问应用，检查控制台输出。旧内容会被展示，而新的内容会被后台缓存。下次页面重新加载时，新的内容会生效。

### 总结

在 `create-react-app` 中实现无感刷新可以通过启用并自定义 `Service Worker` 来完成。通过 `Service Worker` 在后台缓存新资源，用户可以在不打扰当前操作的情况下静默更新应用内容，并在下次访问时获得最新版本。
