import {safeSetState} from '../reactUtils';

export function tracked(target: any, propertyKey: string): any
{
    const desc: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
        configurable: false
    };

    desc.get = function(this: Dictionary<any>) { return this.state[propertyKey]; };
    desc.set = function(this: any, value: any) {
        safeSetState(this, { [propertyKey]: value });
    };

    Object.defineProperty(target, propertyKey, desc);
}