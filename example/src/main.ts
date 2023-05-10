import Vue from 'vue';
import App from './App.vue';

import './assets/main.css';
import WebPerformance from '@whjs/performance';

const webPerformace = new WebPerformance();
console.log(webPerformace);
webPerformace.getPerformanceDetail((...params) => {
  console.log(...params);
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
