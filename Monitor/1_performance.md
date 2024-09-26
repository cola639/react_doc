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
  console.log("First Contention Paint:", performanceTiming.startTime)
  console.log("Largest Contention Paint:", performanceTiming.responseEnd)
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

FCP（**First Contentful Paint**）、LCP（**Largest Contentful Paint**）、FID（**First Input Delay**）和 CLS（**Cumulative Layout Shift**）是 Web Vitals 中用于衡量网页性能的关键指标。每个指标都有标准的评分区间，基于这些区间，你可以判断页面的用户体验表现是否良好。以下是这些指标的最佳性能范围（衡量标准），根据 Google 提供的 Web Vitals 指南：

### 1. **FCP (First Contentful Paint)**

**FCP** 测量的是页面首次绘制内容到屏幕上的时间，包括文本、图像、背景图或 SVG 等。它是衡量加载速度的一个重要指标。

- **优秀**：小于 1.8 秒
- **需要改进**：1.8 - 3 秒
- **较差**：大于 3 秒

**解释**：

- **优秀**：用户在 1.8 秒内能看到页面内容，加载体验较好。
- **较差**：如果加载时间超过 3 秒，用户可能会觉得页面过慢。

### 2. **LCP (Largest Contentful Paint)**

**LCP** 测量的是页面的主要内容（通常是最大的图像或文本块）完全加载完成的时间，衡量页面的加载感知速度。

- **优秀**：小于 2.5 秒
- **需要改进**：2.5 - 4 秒
- **较差**：大于 4 秒

**解释**：

- **优秀**：用户能在 2.5 秒内看到页面的主要内容加载完成，感知加载时间较短。
- **较差**：超过 4 秒会显得加载较慢，影响用户体验。

### 3. **FID (First Input Delay)**

**FID** 测量用户与页面首次交互（如点击、按键）到页面响应这次交互的延迟时间。它衡量的是页面的交互性能。

- **优秀**：小于 100 毫秒
- **需要改进**：100 毫秒 - 300 毫秒
- **较差**：大于 300 毫秒

**解释**：

- **优秀**：当用户第一次尝试与页面互动（如点击按钮）时，响应时间在 100 毫秒内，体验非常流畅。
- **较差**：超过 300 毫秒的延迟，用户会感觉到明显的卡顿。

### 4. **CLS (Cumulative Layout Shift)**

**CLS** 衡量的是页面视觉内容的稳定性，尤其是在加载过程中。较大的布局偏移会影响用户体验，导致用户误操作或混淆。

- **优秀**：小于 0.1
- **需要改进**：0.1 - 0.25
- **较差**：大于 0.25

**解释**：

- **优秀**：页面内容几乎没有视觉上的意外跳动，用户体验稳定。
- **较差**：如果页面内容频繁移动（例如图像、广告加载后导致页面跳动），用户体验会受到很大影响。

### 总结的最佳标准：

- **FCP**：1.8 秒内
- **LCP**：2.5 秒内
- **FID**：100 毫秒内
- **CLS**：0.1 以下

### 如何达到这些标准？

1. **优化图片和资源加载**：
   - 使用现代图片格式（如 WebP）和懒加载策略。
   - 压缩 JavaScript 和 CSS，减少资源体积。
2. **提高服务器响应速度**：

   - 使用 CDN 缓存静态资源。
   - 减少服务器请求次数和资源重定向。

3. **减少主线程阻塞**：

   - 优化 JavaScript 执行，避免长任务。
   - 将非关键资源延迟加载，使用 `async` 和 `defer` 来加载非关键的 JavaScript 文件。

4. **避免布局偏移**：
   - 为图片、视频、广告等预留固定空间，避免页面加载过程中布局突然变化。

### 参考工具

- **Lighthouse**（Google 提供的网页性能检测工具）：可以帮助你在开发过程中实时监测 FCP、LCP、FID 和 CLS 的表现。
- **Web Vitals 库**：可以通过 JavaScript 收集 Web Vitals 指标并发送到你的监控工具。
