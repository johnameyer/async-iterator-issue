# IteratorIssue

This sample illustrates a breaking change in how iterators are handled by the Angular builders.

While the code sample builds and executes fine (`pnpm start`) via `@angular-devkit/build-angular:browser`, it begins failing throwing an unusal exception with `@angular-devkit/build-angular:browser-eslint` or the new application builder.

Strangely, `pnpm test` runs fine.

```
main.ts:5 ERROR TypeError: Cannot convert a Symbol value to a number
    at Object.get (multi-iterator.ts:60:32)
    at __yieldStar (main.js:10:18)
    at wrap (app.component.ts:25:3)
    at wrap.next (<anonymous>)
    at new _AppComponent (app.component.ts:16:51)
    at NodeInjectorFactory.AppComponent_Factory [as factory] (app.component.ts:17:3)
    at getNodeInjectable (core.mjs:5865:38)
    at createRootComponent (core.mjs:16681:31)
    at ComponentFactory.create (core.mjs:16546:21)
    at _ApplicationRef.bootstrap (core.mjs:31772:38)
```

Namely, upon compilation, the builder converts a `yield *` expression into a polyfill [ref](https://github.com/evanw/esbuild/blob/a7fcc43fdb6b6edc58f781fe96328f4867f4b33e/internal/runtime/runtime.go#L392-L393) that attempts to access the `Symbol.asyncIterator` function. However, our proxy, being fully synchronous, only expects to be called using the`Symbol.iterator` property in `multi-iterator.ts`. I am unsure why the code is attempted to be treated as async as it runs within the constructor of the component.