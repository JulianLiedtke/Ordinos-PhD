// default src/store/index.js content:
import { createStore } from 'vuex'
// import example from './module-example'
import storeConfig from "./store-config";
import VuexPersistence from 'vuex-persist';

export default function (/* { ssrContext } */) {
  const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
  })

  const Store = createStore({
    modules: {
      // example
      storeConfig
    },

    plugins: [vuexLocal.plugin],

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEV
  })

  return Store
}
