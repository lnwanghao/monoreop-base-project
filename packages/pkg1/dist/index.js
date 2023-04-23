(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["monorepo-base-project"] = {}));
})(this, (function (exports) { 'use strict';

  function pkg1() {
      console.log("I am pkg1");
  }

  exports.pkg1 = pkg1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
