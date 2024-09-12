/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `` | `/` | `/(protected)` | `/_sitemap` | `/createField` | `/home` | `/indexA` | `/objects` | `/recoveryPassword` | `/register` | `/variables`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
