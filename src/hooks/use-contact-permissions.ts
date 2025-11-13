"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

interface RequestAccessPayload {
  contactId: string
  reason?: string
}

export function useRequestContactAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RequestAccessPayload) => {
      return await apiClient(`/api/contacts/${data.contactId}/request-access`, {
        method: "POST",
        body: JSON.stringify({ reason: data.reason }),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
    },
  })
}
