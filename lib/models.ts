import type { ObjectId } from "mongodb"

export interface File {
  _id?: ObjectId
  orderNumber: string
  userName: string
  fileName: string
  uploadDate: Date
  fileSize: number
  status: string
  fileData: Buffer
  contentType: string
}

export interface Logo {
  _id?: ObjectId
  name: string
  category: string
  imageUrl: string
  fileName: string
  fileData: Buffer
  contentType: string
  createdAt: Date
}

export interface ColorSwatch {
  _id?: ObjectId
  name: string
  hexCode: string
  imageUrl: string
  fileName: string
  fileData: Buffer
  contentType: string
  createdAt: Date
}
