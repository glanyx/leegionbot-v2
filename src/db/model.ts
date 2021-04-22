export interface IListModel<T extends any> {
  items: T[]
}

export abstract class Model<T extends Record<string, any>> {

  protected data: T;

  constructor(data: Partial<T>) {
    this.data = data as T
  }

  public get(_: any, prop: string) {
    const self = this as any
    return self[prop] || self.data[prop]
  }
}