import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const Menu = ({tabs}) => (
    <ul>
        {Array.from(tabs.map(tab => (
            <li key={tab.key}>
                <NavLink to={tab.url} activeClassName="active">
                    { tab.name }
                </NavLink>
            </li>
        )))}
    </ul>
);

Menu.PropTypes = {
    tabs: PropTypes.array
};

export default Menu;
