import {first} from 'rxjs/operators';
import {BaseComponent} from '../../components/base-component';
import {safeSetState} from '../react-utils';

export function tracked(target: any, propertyKey: string): any
{
    const desc: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
        configurable: false
    };

    desc.get = function(this: Dictionary<any>) {
        return this._tempValues && this._tempValues.has(propertyKey)
            ? this._tempValues.get(propertyKey)
            : this.state[propertyKey];
    };
    desc.set = function(this: BaseComponent, value: any) {
        // Only use tempValues if we're using setState(). When not yet mounted, we directly manipulate state, so
        // no need for this.
        if (this.isMounted)
        {
            const tempValues = (this as any)._tempValues || ((this as any)._tempValues = new Map());

            if (!tempValues.has(propertyKey))
            {
                this.didChange.pipe(
                    first(() => true, null)
                ).subscribe(() => tempValues.clear());
            }

            tempValues.set(propertyKey, value);
        }

        // This may trigger a synchronous render(), so call this AFTER the tempValue has been updated
        safeSetState(this, { [propertyKey]: value });
    };

    Object.defineProperty(target, propertyKey, desc);
}