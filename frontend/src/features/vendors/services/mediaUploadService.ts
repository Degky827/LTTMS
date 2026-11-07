import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface UploadResult {
  success: boolean
  data: {
    filename: string
    url: string
  }
}

export const mediaUploadService = {
  async uploadImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('image', file)

    return apiClient.upload<UploadResult>(
      API_ENDPOINTS.UPLOADS.IMAGE,
      formData,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    )
  },
}
