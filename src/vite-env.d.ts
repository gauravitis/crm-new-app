/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vuetify/components' {
  import * as components from 'vuetify/components'
  export default components
}

declare module 'vuetify/directives' {
  import * as directives from 'vuetify/directives'
  export default directives
}
