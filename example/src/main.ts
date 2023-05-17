import Vue from 'vue';
import App from './App.vue';

import './assets/main.css';
import { webPerformance } from '@whjs/performance';

webPerformance.getPerformanceDetail((...params) => {
  console.log(...params);
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
