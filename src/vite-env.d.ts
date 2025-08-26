/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_POSTGRES: string
  readonly DATABASE_URL: string
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}