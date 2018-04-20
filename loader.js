const path = require('path');

module.exports = function(content) {
    let output = content;

    if (/import\s+getComponent\s+from\s+/.test(content)) {
        const directory = this.resourcePath.split(path.sep).slice(0, -1).join('/');
        const loaderPath = path.relative(directory, path.resolve('./app/components/Loader'));
        output = output.replace(/import\s+getComponent\s+from\s+[^;]+;/, `import Loader from './${loaderPath}';\nimport Loadable from 'react-loadable';`);

        const getComponentRegex = /getComponent\('([^']+?)'\)/;
        while (getComponentRegex.test(output)) {
            output = output.replace(getComponentRegex, (...args) => {
                const name = args[1].split('/').join('-').toLowerCase();
                return `(
    Loadable({
        loader: () => import(/* webpackChunkName: "${name}" */ './${path.relative(directory, path.resolve(`./app/${args[1]}`))}'),
        loading: () => <Loader />,
        modules: ['${name}']
    })
)`;
            });
        }
    }

    return output;
};
