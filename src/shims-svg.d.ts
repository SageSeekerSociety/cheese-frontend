// src/svg.d.ts

declare module '*.svg?component' {
  import type { DefineComponent, SVGAttributes } from 'vue';
  const component: DefineComponent<SVGAttributes>;
  export default component;
}