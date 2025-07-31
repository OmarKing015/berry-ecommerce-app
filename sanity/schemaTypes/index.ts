import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { categoryType } from './categoryType'
import { orderType } from './orderType'
import { salesType } from './salesType'

export const schemaTypes = [salesType, productType,categoryType,orderType]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [salesType,productType,categoryType,orderType],
}
