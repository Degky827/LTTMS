import { apiClient } from '../src/lib/api/client'

// Legacy API export backed by the centralized ApiClient
const API = apiClient.getRawInstance()

export { API }
export default API
