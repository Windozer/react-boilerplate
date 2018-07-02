import {Subscription, Observable, Subject} from 'rxjs';
import {safeSetState} from '../utils/reactUtils';
import {PureComponent} from 'react';

export abstract class BaseComponent<TProps = Dictionary<any>, TState = Dictionary<any>> extends PureComponent<TProps, TState>
{
    public state: TState = {} as TState;
    public isMounted: boolean;

    protected subscriptions: Map<string, Subscription> = new Map();
    protected didUpdate: Subject<{ props: TProps, state: TState, prevProps: TProps, prevState: TState }> = new Subject;
    protected willUnmount: Subject<boolean> = new Subject;

    public constructor(props: TProps, context: any)
    {
        super(props, context);
        // nix built in deprecated warning throwing property with our own
        Object.defineProperty(this, 'isMounted', { writable: true, value: false });
    }

    protected addObservable<T>(key: string, obs: Observable<T>, defaultValue?: T): void
    {
        const prevSubscription = this.subscriptions.get(key);

        if (prevSubscription)
            prevSubscription.unsubscribe();

        if (undefined !== defaultValue)
            safeSetState(this, { [key]: defaultValue } as any);

        this.subscriptions.set(key, obs.subscribe(value => {
            safeSetState<TProps, TState>(this as any, { [key]: value } as any);
        }));
    }

    protected clearObservables(): void
    {
        for (const value of this.subscriptions.values())
        {
            value.unsubscribe();
        }

        this.setState(Array.from(this.subscriptions.keys()).reduce((acc, keyName) => {
            acc[keyName] = null;
            return acc;
        }, {} as any));

        this.subscriptions.clear();
    }

    public componentDidUpdate(prevProps: Readonly<TProps>, prevState: Readonly<TState>, prevContext: any): void
    {
        this.didUpdate.next({ props: this.props, state: this.state, prevProps, prevState });
    }

    public componentWillUnmount(): void
    {
        this.isMounted = false;

        for (const subsciption of this.subscriptions.values())
        {
            subsciption.unsubscribe();
        }

        this.subscriptions.clear();
        this.willUnmount.next(true);
    }

    public componentDidMount(): void
    {
        this.isMounted = true;
    }
}