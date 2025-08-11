import { type SchemaTypeDefinition } from "sanity";
import { productType } from "./productType";
import { categoryType } from "./categoryType";
import { orderType } from "./orderType";
import { salesType } from "./salesType";
import { templeteLogos } from "./templeteLogosType";
import { colorSwatches } from "./colorSwatchesType";

export const schemaTypes = [
  salesType,
  productType,
  categoryType,
  orderType,
  templeteLogos,
  colorSwatches,
];
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    salesType,
    productType,
    categoryType,
    orderType,
    templeteLogos,
    colorSwatches,
  ],
};
