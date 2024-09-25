在 React 中使用 Sentry 进行错误监控，可以通过 Sentry 的官方 React SDK 快速集成。Sentry 能够捕获 JavaScript 错误、未处理的 Promise 错误、性能问题等。以下是如何在 React 中集成 Sentry 的详细步骤：

### 1. **安装 Sentry React SDK**

首先，通过 npm 或 yarn 安装 Sentry SDK：

```bash
npm install @sentry/react @sentry/tracing
```

或者使用 yarn：

```bash
yarn add @sentry/react @sentry/tracing
```

### 2. **初始化 Sentry**

在你的项目入口文件（例如 `src/index.js` 或 `src/main.js`）中，初始化 Sentry。

```javascript
import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"

// 初始化 Sentry
Sentry.init({
  dsn: "https://<your-dsn>@sentry.io/<project-id>", // 替换成你在 Sentry 项目中的 DSN
  integrations: [new BrowserTracing()],

  // 配置要采样的事务（比如加载页面、用户导航等）以捕获性能问题
  tracesSampleRate: 1.0, // 你可以设置为 0.2 以减少采样率
})

// 渲染应用
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)
```

### 3. **捕捉 JavaScript 错误**

Sentry 会自动捕捉未处理的 JavaScript 错误，包括未捕获的 Promise 错误和一般的运行时异常。你可以在组件中使用 `Sentry.ErrorBoundary` 包装应用，这样可以捕获特定组件树中的错误。

```javascript
import * as Sentry from "@sentry/react"

function MyApp() {
  return (
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      <App />
    </Sentry.ErrorBoundary>
  )
}
```

在这个例子中，如果 `App` 组件或它的子组件抛出错误，它们将被 Sentry 捕获，并且错误信息会被上报到 Sentry，显示自定义的 fallback UI。

### 4. **捕获特定操作中的错误**

除了自动捕获全局错误，你还可以手动在特定的代码块中捕获错误并发送到 Sentry：

```javascript
import * as Sentry from "@sentry/react"

try {
  // 某些可能抛出异常的操作
} catch (error) {
  Sentry.captureException(error) // 手动上报错误
}
```

### 5. **捕捉未处理的 Promise 错误**

Sentry 也可以自动捕捉未处理的 Promise 错误，但如果你需要手动处理这些错误，可以像下面这样使用：

```javascript
window.addEventListener("unhandledrejection", (event) => {
  console.log("Unhandled Promise rejection:", event.reason)
  Sentry.captureException(event.reason) // 捕获并上报 Promise 错误
})
```

### 6. **Sentry 中的性能监控**

Sentry 还可以捕获性能问题。通过 `BrowserTracing` 集成，Sentry 将自动记录页面加载时间、路由变更、HTTP 请求等性能相关的数据。

在初始化时已经添加了 `BrowserTracing` 集成，你可以配置 `tracesSampleRate` 来控制采样率。值越高，捕获的性能数据越多，1.0 表示捕获所有的性能数据，通常你可以根据需求设置较低的值（例如 `0.2`）。

### 7. **Sentry 捕获的错误示例**

在 Sentry 仪表盘中，捕获的错误包括以下信息：

- **Error Message**：错误消息。
- **Stack Trace**：错误发生时的堆栈跟踪。
- **Breadcrumbs**：用户在错误发生之前的交互记录（如点击、页面跳转等）。
- **环境信息**：浏览器、操作系统、用户代理等详细信息。

### 8. **配置自定义标签和上下文信息**

你还可以向 Sentry 上报自定义的标签和上下文信息，帮助你更好地分析错误。

```javascript
Sentry.setTag("user_role", "admin")
Sentry.setContext("user_info", { id: 123, name: "John Doe" })
```

### 9. **测试 Sentry 是否正常工作**

你可以通过手动抛出一个错误，测试 Sentry 是否正常捕获并上报错误：

```javascript
Sentry.captureMessage("Test message") // 测试信息
Sentry.captureException(new Error("Test error")) // 测试错误
```

### 10. **在生产环境下配置采样率和忽略错误**

在生产环境下，你可能需要限制 Sentry 捕获的错误量，避免捕获一些不必要的错误。你可以设置 `sampleRate` 来限制错误的采样频率，或者使用 `ignoreErrors` 来忽略某些特定的错误。

```javascript
Sentry.init({
  dsn: "https://<your-dsn>@sentry.io/<project-id>",
  tracesSampleRate: 0.1, // 仅捕获 10% 的性能数据
  ignoreErrors: [
    "ResizeObserver loop limit exceeded", // 忽略特定的错误信息
  ],
})
```

### 总结

1. **集成 Sentry React SDK**：通过安装 `@sentry/react` 和 `@sentry/tracing`，你可以在 React 中自动捕捉错误、Promise 异常和性能问题。
2. **使用 `ErrorBoundary`**：使用 `Sentry.ErrorBoundary` 捕获组件中的错误。
3. **手动捕捉异常**：通过 `Sentry.captureException` 手动上报特定代码块的错误。
4. **性能监控**：通过 `BrowserTracing` 捕捉性能数据。
5. **测试并调优**：在开发和生产环境中测试错误捕捉，并根据需要设置采样率和忽略特定错误。

通过以上步骤，你就可以在 React 项目中成功集成 Sentry，实时监控应用中的错误和性能问题。
