type Constructable<T = {}> = new (...args: any[]) => T;

interface Dictionary<T = any>
{
    [key: string]: T;
}