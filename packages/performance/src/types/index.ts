export interface Callback {
  (...args: any[]): any;
}

export interface SdkBase {
  transportData: any; // 数据上报
  breadcrumb: any; // 用户行为
  options: any; // 公共配置
  notify: any; // 发布消息
}

export abstract class BasePlugin {
  public type: string; // 插件类型
  constructor(type: string) {
    this.type = type;
  }
  abstract bindOptions(options: object): void; // 校验参数
  abstract core(sdkBase: SdkBase): void; // 核心方法
  abstract transform(data: any): void; // 数据转化
}

/**
 * 状态
 */
export enum STATUS_CODE {
  ERROR = 'error',
  OK = 'ok',
}

/**
 * 事件类型
 */
export enum EVENTTYPES {
  PERFORMANCE = 'performance',
}
