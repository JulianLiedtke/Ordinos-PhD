import { boot } from 'quasar/wrappers'
import { installVue3SphinxXml } from 'vue3-sphinx-xml'
import 'vue3-sphinx-xml/dist/style.css'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app, store }) => {
  app.use(installVue3SphinxXml, { store });
})
