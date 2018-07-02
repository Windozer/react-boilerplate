import './index.scss';

import * as React from 'react';
import ReactDOM from 'react-dom';
import {MainPage} from './components/main-page/main-page';

const appElement = document.createElement('div');

ReactDOM.render(
    <MainPage />,
    document.body.appendChild(appElement)
);