import { Model, IListModel } from './model'
import { default as DBClient } from './postgres-client'

type IDBModel<T> = new (data: any) => T

export abstract class DBModel<T extends Record<string, any>> extends Model<T> {

  public items: string[] = []

  public static async fetchOne<T extends DBModel<any> = DBModel<any>>(query: string, model: IDBModel<T>): Promise<T | undefined> {
    const [items] = (await DBClient.query(query)).rows
    return items ? new model(items) : undefined
  }

  public static async query<T extends DBModel<any> = DBModel<any>>(query: string, model: IDBModel<T>): Promise<IListModel<T>> {
    const items = (await DBClient.query(query)).rows
    return {
      items: (items.map((item: any) => new model(item)))
    }
  }

  public static async create<T extends DBModel<any> = DBModel<any>>(query: string, model: IDBModel<T>): Promise<T> {
    const [items] = (await DBClient.query(`${query} RETURNING *`)).rows
    return new model(items)
  }

  public async edit<T extends DBModel<any> = DBModel<any>>(query: string, model: IDBModel<T>): Promise<T> {
    const [items] = (await DBClient.query(`${query} RETURNING *`)).rows
    return new model(items)
  }

}