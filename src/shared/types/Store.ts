export type AssetMeta = {
  game: string
  assetId: number
  fileName: string
  fileCount: number
}

export type Asset = AssetMeta & {
  data: ArrayBuffer
}