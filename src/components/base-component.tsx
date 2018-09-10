import {Subject, Subscription, from, ObservableInput} from 'rxjs';
import {safeSetState} from '../utils/react-utils';
import {PureComponent} from 'react';

export abstract class BaseComponent<TProps = Dictionary<any>, TState = Dictionary<any>> extends PureComponent<TProps, TState>
{
    public state: TState = {} as TState;
    public isMounted: boolean;

    public didChange: Subject<{ prevProps: TProps, prevState: TState, props: TProps, state: TState }> = new Subject;

    protected subscriptions: Map<keyof TState, Subscription> = new Map();
    public didUpdate: Subject<{ props: TProps, state: TState, prevProps: TProps, prevState: TState }> = new Subject;
    protected willUnmount: Subject<boolean> = new Subject;

    public constructor(props: TProps, context: any)
    {
        super(props, context);
        // nix built in deprecated warning throwing property with our own
        Object.defineProperty(this, 'isMounted', { writable: true, value: false });
    }

    protected addObservable<TKey extends keyof TState>(key: TKey, obs: ObservableInput<TState[TKey]>, defaultValue?: TState[TKey]): void
    {
        this.removeObservable(key);

        if (undefined !== defaultValue)
            safeSetState(this, { [key]: defaultValue } as any);

        this.subscriptions.set(key, from(obs).subscribe({
            next: value => {
                safeSetState<TProps, TState>(this as any, { [key]: value } as any);
            },
            error: error => {
                console.error(error);
                this.removeObservable(key);
            },
            complete: () => {
                console.log(`'${key}' observable completed`);
                this.removeObservable(key)
            }
        }));
    }

    protected removeObservable(key: keyof TState): void
    {
        const prevSubscription = this.subscriptions.get(key);

        if (prevSubscription)
            prevSubscription.unsubscribe();
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

        this.triggerDidChange(prevProps, prevState);
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

        // Cleanup event handlers
        this.didChange.complete();
        this.didUpdate.complete();
        this.willUnmount.complete();
    }

    public componentDidMount(): void
    {
        this.isMounted = true;

        this.triggerDidChange();
    }

    protected triggerDidChange(prevProps?: TProps, prevState?: TState): void
    {
        this.didChange.next({
            prevProps: prevProps || ({} as any),
            prevState: prevState || ({} as any),
            props: this.props,
            state: this.state
        });
    }
}