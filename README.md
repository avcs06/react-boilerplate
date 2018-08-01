# High Performance React Boilerplate

A react boilerplate aiming to achieve best loading performance possible while also providing necessary tools needed for developing a website.

Features
-
**So Meta**
- [React Helmet](https://github.com/nfl/react-helmet) to manipulate meta information of the page.

**Not Now**
- [async](https://github.com/avcs06/react-boilerplate/blob/master/app/lib/async.js) HOC to fetch asynchronous data on component load.


**Size Matters**
- Minification and gzip [compression](https://www.npmjs.com/package/compression) for **css**, **js**, **html** and **static** files.


**Quality over Quantity**
- [PurgeCSS](https://github.com/FullHuman/purgecss) to get rid of all unused css from the bundled css files.
  - If you are using `React components` from `node_modules`, you might need to whitelist those.
- Load js plugins in such a way that, unwanted js files are not imported in the bundled js files.
  - Using `import Router from 'react-router/Router';` instead of `import { Router } from 'react-router';` ensures that all the modules required inside `index.js` of `react-router` are not included in bundled js files.

**Divided we Stand**
- [getLoadableComponent](https://github.com/avcs06/react-boilerplate/blob/master/app/lib/getLoadableComponent.js), a wrapper over [React Loadable](https://github.com/jamiebuilds/react-loadable) for code splitting.
  - Two priority levels for rendering loadable components in server side.
  - Add `!` at the beginning of component path to defer the loading of component to client side. If there is component in page which is not needed immediately and you dont to wait until server renders it, you can defer it to client side.

**Divide and rule policy**
- Render initial page on **Server side** but all consecutive pages on **Client side**.
  - Server side rendering supports **helmet**, **async** and **loadable** components seamlessly.

**Other Information**
- Uses [webpack](https://webpack.js.org/) for building files.
- Uses [redux](https://redux.js.org/) for state management.
- Uses [react-router](https://github.com/ReactTraining/react-router) for routing.
- Uses [Immutable.js](https://facebook.github.io/immutable-js/) inside async HOC.
- Utility methods [get](https://github.com/avcs06/react-boilerplate/blob/master/common/get.js) and [post](https://github.com/avcs06/react-boilerplate/blob/master/common/post.js).
- [get](https://github.com/avcs06/react-boilerplate/blob/master/common/get.js) is isomorphic and caches the response unless asked to update by force.
- Utility React Component [ImmutablePureComponent](https://github.com/avcs06/react-boilerplate/blob/master/app/lib/ImmutablePureComponent.js).
- Loads styles from css chunks inside **style** tags while rendering on server side.
- Easy server setup using [pm2](https://www.npmjs.com/package/pm2).

Code Splitting
-
This boilerplate supports **component based code splitting** using [React Loadable](https://github.com/jamiebuilds/react-loadable). Refer the link for documentation on how component based code splitting works and how to use React Loadable. You can use React Loadable directly or you can use the following wrapper module.

### [getLoadableComponent](https://github.com/avcs06/react-boilerplate/blob/master/app/lib/getLoadableComponent.js)
*getLoadableComponent* accepts module path as first argument and other options as second parameter. The first parameter is replaced with respective options for React Loadable by babel plugin.
```
getLoadableComponent('/path/to/module', extraOptions);
```
is replaced with
```
getLoadableComponent({
    loader: () => import('/path/to/module'),
    webpack: () => require.resolveWeak('/path/to/module'),
    modules: ['/path/to/module']
}, extraOptions);
```

### Multi level code splitting on server side rendering
If the module path starts with `!`, it will not be preloaded while rendering on server side, giving you two level code splitting.


**Example Use Case:**

In a page with heavy graphs or table or svg, you can render surrounding content in SSR and the heavy part can be rendered on client side. This won't affect the modules when rendering on client side.

### Loadable by Comment
If you like clean code and you don't want to call _React Loadable_ or _getLoadableComponent_ everywhere, you can make a component Loadable by just adding a comment in the first line.

If you write a comment with `@loadable` in the first line of a component, all import statements importing this component will be converted to React Loadable Components by babel plugin. You can add keyword `low` after a space if you do not want to render it on the server side.
