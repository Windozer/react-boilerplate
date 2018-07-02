export function bind(target: any, propertyKey: string, descriptor: PropertyDescriptor)
{
    return {
        configurable: true,
        get() {
            const value = descriptor.value.bind(this);
            Object.defineProperty(this, propertyKey, {
                value,
                configurable: true,
                writable: true
            });
            return value;
        }
    };
}