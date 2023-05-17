import { getWebVitals, getResource } from './core';
import { Callback, EVENTTYPES } from './types';
import { _global, on } from './utils';

class WebPerformance {
  type: string;
  constructor() {
    this.type = EVENTTYPES.PERFORMANCE;
  }
  getPerformanceDetail(callback: Callback) {
    getWebVitals((res: any) => {
      // name指标名称、rating 评级、value数值
      callback(res);
    });

    on(_global, 'load', function () {
      // 上报资源列表
      const res = getResource();
      callback({ name: 'resoure', value: res });
    });
  }
}

const webPerformance = new WebPerformance();
export { webPerformance };
