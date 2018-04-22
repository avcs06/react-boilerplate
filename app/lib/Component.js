import $ from 'jquery';
import React from 'react';
import extend from 'extend';
import { withRouter } from 'react-router';

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

const updateDocumentMetaTags = metaData => {
    Object.keys(metaData).forEach(key => {
        const [tag, ...names] = key.split(':');
        const name = names.join(':') || 'title';
        const info = metaInfo[tag];

        let $element = $(`${tag}[${info.name}="${name}"]`);
        if (!$element.length) {
            $element = $(`<${tag} ${info.name}="${name}" />`);
            $('head').append($element);
        }
        (info.content && $element.attr(info.content, metaData[key])) || $element.html(metaData[key]);
    });
};

class Component extends React.Component {
    static _shouldGetComponentWithRouter() {
        return !!this.prototype.hasOwnProperty('getMetaData');
    }

    static getComponent() {
        return this._shouldGetComponentWithRouter() ? withRouter(this) : this;
    }

    componentWillMount() {
        this.generateMetaTags(this.getMetaData());
    }

    getMetaData() {
        return {};
    }

    generateMetaTags(metaData) {
        if (this.props.staticContext) {
            extend(this.props.staticContext.meta, metaData);
        } else {
            updateDocumentMetaTags(metaData);
        }
    }
}

export default Component;
