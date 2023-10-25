// default src/store/index.js content:
import { createStore } from 'vuex'
import storeConfig from "./store-config";

export default function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      // example
      storeConfig
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEV
  })

  return Store
}