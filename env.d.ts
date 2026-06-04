interface ImportMetaEnv {
  readonly API_BASE_URL: string;
  readonly NEW_API_BASE_URL: string;
  /** PDF 上传/解析请求的超时时间（毫秒），默认 600000（10 分钟） */
  readonly VITE_PDF_UPLOAD_TIMEOUT_MS: string;
}
