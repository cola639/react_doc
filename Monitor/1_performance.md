在代码中进行性能监控时，可以在多个关键点进行数据采集。对于前端应用，常见的做法是将性能监控集成在以下几种方式中：

### 1. **在页面加载完成时进行监控**

- 这主要用于监控页面加载时的关键性能指标（如 FCP、LCP、CLS 等）。
- 可以直接在页面初始化时使用 **Performance API** 获取相关性能数据。

### 2. **在用户交互时进行监控**

- 用于监控用户交互时的延迟和响应性能（如 FID）。

### 3. **在路由切换时进行监控**

- 对于单页面应用（SPA），路由切换是重要的时机，可以用来监控导航性能（如 TTI）。

### 具体实现方式：

#### 1. **在 `window.onload` 或框架生命周期事件中监控性能**

这是最基本的方式，适用于全局页面加载完成时监控性能。你可以通过 `window.onload` 事件，或者在 React/Vue 等框架中的 `useEffect` 或 `mounted` 钩子中捕获页面加载完成后的性能数据。

```javascript
window.addEventListener("load", (event) => {
  // 获取页面加载完成时的性能指标
  const performanceTiming = performance.getEntriesByType("navigation")[0]
  console.log("First Contentful Paint:", performanceTiming.startTime)
  console.log("Largest Contentful Paint:", performanceTiming.responseEnd)
})
```

#### 2. **通过 Web Vitals 获取核心性能数据**

对于 FCP、LCP、FID 和 CLS 等关键性能指标，使用 [Web Vitals](https://github.com/GoogleChrome/web-vitals) 库可以简化获取这些数据的过程。

**安装 Web Vitals 库：**

```bash
npm install web-vitals
```

**代码集成：**

```javascript
import { getCLS, getFID, getLCP, getFCP, getTTFB } from "web-vitals"

function sendToAnalytics(metric) {
  // 将性能数据发送到后端服务器或日志服务
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getLCP(sendToAnalytics)
getFCP(sendToAnalytics)
getTTFB(sendToAnalytics) // Time to First Byte
```

#### 3. **在路由拦截器中监控性能**

对于单页面应用（SPA），路由切换是监控性能的关键点之一。你可以在路由切换时记录页面渲染和交互的性能数据（如 TTI）。

**以 React 的 `react-router-dom` 为例：**

```javascript
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function PerformanceTracker() {
  const location = useLocation()

  useEffect(() => {
    // 每次路由切换时，记录性能
    const start = performance.now()

    return () => {
      const duration = performance.now() - start
      console.log(`Page load time for ${location.pathname}: ${duration}ms`)
      // 将数据发送到服务器
    }
  }, [location])

  return null
}

export default PerformanceTracker
```

**在 Vue.js 中通过路由守卫：**

```javascript
router.beforeEach((to, from, next) => {
  const start = performance.now()

  router.afterEach(() => {
    const duration = performance.now() - start
    console.log(`Page load time for ${to.path}: ${duration}ms`)
    // 将数据发送到服务器
  })

  next()
})
```

#### 4. **监听用户交互事件获取 FID**

用户首次交互到页面响应的延迟 (FID) 是衡量用户体验的关键指标之一。你可以通过监听用户事件来捕获这些数据。

```javascript
window.addEventListener("click", () => {
  const fid = performance.now() // 计算首次交互到响应的时间
  console.log(`First Input Delay: ${fid}ms`)
  // 发送数据
})
```

#### 5. **使用 PerformanceObserver 动态监控资源加载和布局偏移**

使用 `PerformanceObserver` API 可以动态监听特定类型的性能事件，如 `layout-shift`（布局偏移，用于 CLS 监控）和 `largest-contentful-paint`（用于 LCP 监控）。

```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === "largest-contentful-paint") {
      console.log("Largest Contentful Paint:", entry.startTime)
    }
    if (entry.entryType === "layout-shift") {
      console.log("Cumulative Layout Shift:", entry.value)
    }
  }
})

observer.observe({ type: "largest-contentful-paint", buffered: true })
observer.observe({ type: "layout-shift", buffered: true })
```

### 6. **收集数据并上报到后端**

为了对性能进行有效监控，性能数据需要发送到后端进行汇总和分析。可以使用 `fetch` 或者通过某些监控工具提供的 API 将数据上报到服务端。

```javascript
function sendPerformanceData(data) {
  fetch("https://your-server.com/api/performance", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// 使用上面的 PerformanceObserver 或 Web Vitals 获取数据并上报
```

### 总结：

1. **全局页面加载**：使用 `window.onload` 或框架的生命周期钩子（如 React 的 `useEffect`）来监控首次加载的性能。
2. **路由切换**：在 SPA 应用中，使用路由拦截器（如 React Router、Vue Router）在每次页面跳转时监控性能。
3. **用户交互**：监听用户交互事件（如点击、输入）以捕捉首次输入延迟（FID）等交互性能。
4. **资源监控**：使用 `PerformanceObserver` 动态监控资源加载、布局偏移等重要性能指标。

你可以结合这些方法，根据不同的场景来实现全面的前端性能监控。
