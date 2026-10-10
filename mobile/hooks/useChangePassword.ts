import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

interface ChangePasswordParams {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ userId, currentPassword, newPassword }: ChangePasswordParams) => 
      apiService.changePassword(userId, currentPassword, newPassword),
    onSuccess: async () => {
      // Clear cache to wipe sensitive data if necessary
      queryClient.clear();
      
      // Perform the logout
      await apiService.logout();
      
      Alert.alert(
        'Password Changed',
        'Your password was changed successfully. Please log in again with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to change password. Please verify your current password.');
    }
  });
}
