import { getWebVitals, getResource } from './core';
import { EVENTTYPES } from './types';
import { _global, on } from './utils';

export default class WebPerformance {
  type: string;
  constructor() {
    this.type = EVENTTYPES.PERFORMANCE;
  }
  core() {
    getWebVitals((res: any) => {
      // name指标名称、rating 评级、value数值
      const { name, rating, value } = res;
      console.log(name, rating, value);
    });

    on(_global, 'load', function () {
      // 上报资源列表
      const res = getResource();
      console.log(res);
    });
  }
}
