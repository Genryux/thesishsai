import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface SubmitDocumentPayload {
  fileUri: string;
  fileName: string;
  paperId: number;
  remarks: string;
}

export const useSubmitDocument = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitDocumentPayload) => {
      return await apiService.submitResearchDocument(
        payload.fileUri,
        payload.fileName,
        payload.paperId,
        payload.remarks
      );
    },
    onSuccess: () => {
      // Invalidate both submissions and papers so everything refreshes seamlessly
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      console.error("Failed to submit document:", error);
      alert("Failed to submit document. Please try again.");
    }
  });
};
