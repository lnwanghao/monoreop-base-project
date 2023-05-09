import { Callback } from '../types';

// 获取当前的时间戳
export function getTimestamp(): number {
  return Date.now();
}

// 添加事件监听器
export function on(
  target: any,
  eventName: string,
  handler: Callback,
  opitons = false,
) {
  target.addEventListener(eventName, handler, opitons);
}

// 是否为safari浏览器
export function isSafari(): boolean {
  return (
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  );
}

const _global = window;

export { _global };
