import $ from 'jquery';
import React from 'react';

const metaInfo = {
    title: {
        name: 'id'
    },
    link: {
        name: 'rel',
        content: 'href'
    },
    meta: {
        name: 'name',
        content: 'content'
    }
};

class Component extends React.Component {

    componentWillMount() {
        this.generateMetaTags(this.getMetaData());
    }

    getMetaData() {
        return {};
    }

    generateMetaTags(metaData) {
        Object.keys(metaData).forEach(key => {
            const [tag, name = 'title'] = key.split(':');
            const info = metaInfo[tag];

            let $element = $(`${tag}[${info.name}=${name}]`);
            if (!$element.length) {
                $element = $(`<${tag} ${info.name}="${name}" />`);
                $('head').append($element);
            }
            (info.content && $element.attr(info.content, metaData[key])) || $element.html(metaData[key]);
        });
    }
}

export default Component;
