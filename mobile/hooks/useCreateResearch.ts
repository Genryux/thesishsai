import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface CreateResearchPayload {
  title: string;
  abstract: string;
  category: string;
  keywords: string;
  groupId: number;
}

export const useCreateResearch = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: CreateResearchPayload) => {
      // We pass 'Draft' as a default status along with the payload to the API service
      return await apiService.createPaper({
        ...newProject,
        status: 'Draft',
      });
    },
    onSuccess: () => {
      // Invalidate the 'papers' query to refetch updated data in the background
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      
      // Execute any additional callback (e.g. closing the modal/screen)
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please make sure the server is running.");
    }
  });
};
