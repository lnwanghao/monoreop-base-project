import { Callback } from '../types';
import { onLCP, onFID, onCLS, onFCP, onTTFB } from 'web-vitals';
import { _global, on } from '../utils';

// firstScreenPaint为首屏加载时间
let firstScreenPaint = 0;
// 页面是否渲染完成
let isOnLoaded = false;
let timer: number;
let observer: MutationObserver;
let entries: any[] = [];

const viewportWidth = _global.innerWidth;
const viewportHeight = _global.innerHeight;

// 定时器循环监听dom的变化，当document.readyState === 'complete'时，停止监听
function checkDOMChange(callback: Callback) {
  cancelAnimationFrame(timer);
  timer = requestAnimationFrame(() => {
    if (document.readyState === 'complete') {
      isOnLoaded = true;
    }
    if (isOnLoaded) {
      // 取消监听
      observer?.disconnect();
      // document.readyState === 'complete'时，计算首屏渲染时间
      firstScreenPaint = getRenderTime();
      entries = [];
      callback && callback(firstScreenPaint);
    } else {
      checkDOMChange(callback);
    }
  });
}
function getRenderTime(): number {
  let startTime = 0;
  entries.forEach((entry) => {
    if (entry.startTime > startTime) {
      startTime = entry.startTime;
    }
  });
  // performance.timeOrigin 页面的起始时间
  return startTime - performance.timeOrigin;
}

// dom 对象是否在屏幕内
function isInScreen(dom: HTMLElement): boolean {
  const rectInfo = dom.getBoundingClientRect();
  if (rectInfo.left < viewportWidth && rectInfo.top < viewportHeight) {
    return true;
  }
  return false;
}

// 外部通过callback 拿到首屏加载时间
export function observeFirstScreenPaint(callback: Callback): void {
  const ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK'];
  observer = new MutationObserver((mutationList: any) => {
    checkDOMChange(callback);
    const entry = { children: [], startTime: 0 };
    for (const mutation of mutationList) {
      // 存在且在可视范围内
      if (mutation.addedNodes.length && isInScreen(mutation.target)) {
        for (const node of mutation.addedNodes) {
          // 忽略掉以上标签的变化
          if (
            node.nodeType === 1 &&
            !ignoreDOMList.includes(node.tagName) &&
            isInScreen(node)
          ) {
            // eslint-disable-next-line
            //@ts-ignore
            entry.children.push(node);
          }
        }
      }
    }

    if (entry.children.length) {
      entries.push(entry);
      entry.startTime = new Date().getTime();
    }
  });
  observer.observe(document, {
    childList: true, // 监听添加或删除子节点
    subtree: true, // 监听整个子树
    characterData: true, // 监听元素的文本是否变化
    attributes: true, // 监听元素的属性是否变化
  });
}

export function getResource(): PerformanceResourceTiming[] {
  const entries = performance.getEntriesByType('resource');
  // 过滤掉非静态资源的 fetch、 xmlhttprequest、beacon
  let list = entries.filter((entry) => {
    return (
      ['fetch', 'xmlhttprequest', 'beacon'].indexOf(entry.initiatorType) === -1
    );
  });

  if (list.length) {
    list = JSON.parse(JSON.stringify(list));
    list.forEach((entry: any) => {
      entry.isCache = isCache(entry);
    });
  }
  return list;
}

// 判断资料是否来自缓存
export function isCache(entry: PerformanceResourceTiming): boolean {
  return (
    entry.transferSize === 0 ||
    (entry.transferSize !== 0 && entry.encodedBodySize === 0)
  );
}

// First Contentful Paint 首次内容绘制 (FCP)
// https://web.dev/fcp/#%E5%9C%A8-javascript-%E4%B8%AD%E6%B5%8B%E9%87%8F-fcp
export function getFCP(callback: Callback): void {
  const entryHandler = (list: any) => {
    for (const entry of list.getEntriesByName('first-contentful-paint')) {
      observer.disconnect();
      callback({
        name: 'FCP',
        value: entry.startTime,
        rating: entry.startTime > 1800 ? 'poor' : 'good',
      });
    }
  };
  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: 'paint', buffered: true });
}

// Largest Contentful Paint 最大内容绘制 (LCP)
// https://web.dev/lcp/#%E5%9C%A8-javascript-%E4%B8%AD%E6%B5%8B%E9%87%8F-lcp
export function getLCP(callback: Callback): void {
  const entryHandler = (list: any) => {
    for (const entry of list.getEntries()) {
      observer.disconnect();
      callback({
        name: 'LCP',
        value: entry.startTime,
        rating: entry.startTime > 2500 ? 'poor' : 'good',
      });
    }
  };
  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

// First Input Delay 首次输入延迟 (FID)
// https://web.dev/fid/#%E5%9C%A8-javascript-%E4%B8%AD%E6%B5%8B%E9%87%8F-fid
export function getFID(callback: Callback): void {
  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      observer.disconnect();
      const value = entry.processingStart - entry.startTime;
      callback({
        name: 'FID',
        value,
        rating: value > 100 ? 'poor' : 'good',
      });
    }
  };
  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: 'first-input', buffered: true });
}

// Cumulative Layout Shift 累积布局偏移 (CLS)
// https://web.dev/cls/#%E5%9C%A8-javascript-%E4%B8%AD%E6%B5%8B%E9%87%8F-cls
export function getCLS(callback: Callback): void {
  let clsValue = 0;

  let sessionValue = 0;
  let sessionEntries: any[] = [];

  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      // 只将不带有最近用户输入标志的布局偏移计算在内。
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
        // 如果条目与上一条目的相隔时间小于 1 秒且
        // 与会话中第一个条目的相隔时间小于 5 秒，那么将条目
        // 包含在当前会话中。否则，开始一个新会话。
        if (
          sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000
        ) {
          sessionValue += entry.value;
          sessionEntries.push(entry);
        } else {
          sessionValue = entry.value;
          sessionEntries = [entry];
        }

        // 如果当前会话值大于当前 CLS 值，
        // 那么更新 CLS 及其相关条目。
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          observer.disconnect();

          callback({
            name: 'CLS',
            value: clsValue,
            rating: clsValue > 0.1 ? 'poor' : 'good',
          });
        }
      }
    }
  };

  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: 'layout-shift', buffered: true });
}

// Time to First Byte 第一字节时间 (TTFB)
export function getTTFB(callback: Callback): void {
  on(_global, 'load', function () {
    const { responseStart, activationStart } =
      performance.getEntriesByType('navigation')[0];
    const value = responseStart - (activationStart || 0);
    callback({
      name: 'TTFB',
      value,
      rating: value > 800 ? 'poor' : 'good',
    });
  });
}

export function getWebVitals(callback: Callback): void {
  onLCP((res) => {
    callback(res);
  });
  onFID((res) => {
    callback(res);
  });
  onCLS((res) => {
    callback(res);
  });
  onFCP((res) => {
    callback(res);
  });
  onTTFB((res) => {
    callback(res);
  });
  // 首屏加载时间
  observeFirstScreenPaint((res) => {
    callback({
      name: 'FSP',
      value: res,
      rating: res > 2500 ? 'poor' : 'good',
    });
  });
}
