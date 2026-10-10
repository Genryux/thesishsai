import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface UpdateResearchPayload {
  id: string | number;
  title: string;
  abstract: string;
  category?: string;
  keywords?: string;
}

export const useUpdateResearch = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedProject: UpdateResearchPayload) => {
      const { id, ...data } = updatedProject;
      return await apiService.updatePaper(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the 'papers' query and the specific project query
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['paper', variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['paper', Number(variables.id)] });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      alert("Failed to update project. Please make sure the server is running.");
    }
  });
};
