# High Performance React Boilerplate

A react boilerplate aiming to achieve best loading performance possible while also providing necessary tools needed for developing a website.

Features
-
**So Meta**
- [React Helmet](https://github.com/nfl/react-helmet) to manipulate meta information of the page.

**Not Now**
- [async](https://github.com/avcs06/react-bp/blob/master/app/lib/async.js) HOC to fetch asynchronous data on component load.


**Size Matters**
- Minification and gzip [compression](https://www.npmjs.com/package/compression) for **css**, **js**, **html** and **static** files.


**Quality over Quantity**
- [PurgeCSS](https://github.com/FullHuman/purgecss) to get rid of all unused css from the bundled css files.
  - If you are using `React components` from `node_modules`, you might need to whitelist those.
- Load js plugins in such a way that, unwanted js files are not imported in the bundled js files.
  - Using `import Router from 'react-router/Router';` instead of `import { Router } from 'react-router';` ensures that all the modules required inside `index.js` of `react-router` are not included in bundled js files.

**Strength in Numbers**
- [getLoadableComponent](https://github.com/avcs06/react-bp/blob/master/app/lib/getLoadableComponent.js), a wrapper over [React Loadable](https://github.com/jamiebuilds/react-loadable) for code splitting.
  - Two priority levels for rendering loadable components in server side.
  - Add `!` at the beginning of component path to defer the loading of component to client side. If there is component in page which is not needed immediately and you dont to wait until server renders it, you can defer it to client side.

**Let's share the work**
- Render initial page on **Server side** and all consecutive pages on **Client side**.
  - Server side rendering supports **helmet**, **async** and **loadable** components seamlessly.

**Other Information**
- Uses [webpack](https://webpack.js.org/) for building files.
- Uses [redux](https://redux.js.org/) for state management.
- Uses [react-router](https://github.com/ReactTraining/react-router) for routing.
- Uses [Immutable.js](https://facebook.github.io/immutable-js/) inside async HOC.
- Utility methods [get](https://github.com/avcs06/react-bp/blob/master/common/get.js) and [post](https://github.com/avcs06/react-bp/blob/master/common/post.js), both are isomorphic.
- **get** caches the response unless asked to update by force.
- Utility React Component [ImmutablePureComponent](https://github.com/avcs06/react-bp/blob/master/app/lib/ImmutablePureComponent.js).
- Loads styles from css chunks inside **style** tags while rendering on server side.
- Easy server setup using [pm2](https://www.npmjs.com/package/pm2).
