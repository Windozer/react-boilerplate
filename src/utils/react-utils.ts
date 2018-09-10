import {BaseComponent} from '../components/base-component';

export function safeSetState<P, S>(component: BaseComponent<P, S>, state: Pick<S, keyof S>)
{
    if (component.isMounted) // Internal API, if true, we're in the constructor
    {
        component.setState(state);
    }
    else
    {
        if (component.state)
            Object.assign(component.state, state);
        else
            component.state = state;
    }
}