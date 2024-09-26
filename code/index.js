/**
 * throttle 节流
 * 定义：当持续触发事件时，保证满足时间间隔才触发事件。
 * 场景: 1 图片懒加载 滚动加载 2 防止高频点击 频繁提交表单
 * 对比debounce行为结束后  throttle需要定期执行 如滚动加载体验感好过debounce
 * @param {Function} fn 需要被节流的函数
 * @param {number} delay 延迟的毫秒数，表示fn函数再次执行之前的等待时间
 * @returns {Function} 返回一个被节流的函数
 */
function throttle(fn, delay) {
  let begin = 0

  return function (...args) {
    const now = Date.now()

    if (now - begin > delay) {
      fn.apply(this, args)
      begin = now
    }
  }
}

/**
 * debounce 防抖
 * 触发事件后在n秒内函数只能执行一次，如果在n秒内又触发了事件，则会重新计算函数执行时间。
 * 场景: 1 防止搜索框频繁请求 2 手机号,邮箱频繁验证 3 window.resize
 * Example1 window.addEventListener('resize', debounce(function, 3 * 1000))
 * @param {*} fn
 * @param {*} delay
 * @returns
 */
function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
