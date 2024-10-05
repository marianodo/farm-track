/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(protected)` | `/(protected)/attributes` | `/(protected)/attributes/` | `/(protected)/attributes/create` | `/(protected)/attributes/create/styles` | `/(protected)/attributes/edit/styles` | `/(protected)/home` | `/(protected)/objects` | `/_sitemap` | `/attributes` | `/attributes/` | `/attributes/create` | `/attributes/create/styles` | `/attributes/edit/styles` | `/createField` | `/home` | `/indexA` | `/objects` | `/recoveryPassword` | `/register`;
      DynamicRoutes: `/(protected)/attributes/edit/${Router.SingleRoutePart<T>}` | `/attributes/edit/${Router.SingleRoutePart<T>}` | `/editField/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/(protected)/attributes/edit/[attributeId]` | `/attributes/edit/[attributeId]` | `/editField/[id]`;
    }
  }
}
