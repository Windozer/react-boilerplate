export class Deferred<T>
{
    public readonly promise: Promise<T>;
    
    public resolve: (value: T) => void;
    public reject: (value: string|Error) => void;

    public constructor()
    {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}