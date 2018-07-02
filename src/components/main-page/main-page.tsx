import React from 'react';
import {BaseComponent} from '../base-component';

export class MainPage extends BaseComponent
{
    public render(): React.ReactNode
    {
        return <div className="start-page">
            Hello there
        </div>;
    }
}