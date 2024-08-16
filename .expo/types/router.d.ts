/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `` | `/` | `/(protected)` | `/..\components\Language\` | `/_sitemap` | `/explore` | `/indexPrueba`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
