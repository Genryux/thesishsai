import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, User } from '../services/api';

export function useUpdateProfile(userId: number, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => apiService.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      // Invalidate and refetch the user data so UI updates instantly
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    }
  });
}
