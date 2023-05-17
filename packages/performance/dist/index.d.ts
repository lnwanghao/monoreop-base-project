interface Callback {
    (...args: any[]): any;
}

declare class WebPerformance {
    type: string;
    constructor();
    getPerformanceDetail(callback: Callback): void;
}
declare const webPerformance: WebPerformance;

export { webPerformance };
