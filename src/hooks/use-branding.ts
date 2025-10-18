import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import type { UpdateBrandingData } from "@/lib/schemas/branding"

interface BrandingData {
  id: string
  organizationId: string | null
  name: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  sidebarColor: string
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
    details?: string | string[]
  }
}

export const useBranding = () => {
  return useQuery<BrandingData>({
    queryKey: ["branding"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<BrandingData>>("/api/branding")
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to fetch branding")
      }
      return data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useUpdateBranding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateBrandingData) => {
      const response = await axios.patch<ApiResponse<BrandingData>>(
        "/api/branding",
        data
      )
      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Failed to update branding")
      }
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] })
    },
  })
}

export const useUploadLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post<ApiResponse<{ logoUrl: string }>>(
        "/api/branding/upload-logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Failed to upload logo")
      }

      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] })
    },
  })
}

export const useDeleteLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete<ApiResponse<null>>(
        "/api/branding/upload-logo"
      )

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Failed to delete logo")
      }

      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] })
    },
  })
}
