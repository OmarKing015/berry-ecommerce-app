import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { categoryType } from './categoryType'
import { orderType } from './orderType'
import { salesType } from './salesType'
import { logoType } from './logoType'
import { colorSwatchType } from './colorSwatchType'

export const schemaTypes = [salesType, productType, categoryType, orderType, logoType, colorSwatchType]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [salesType, productType, categoryType, orderType, logoType, colorSwatchType],
}
