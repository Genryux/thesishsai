import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useColorScheme } from 'nativewind';
import { Colors } from '../../constants/designTokens';
import { useChangePassword } from '../../hooks/useChangePassword';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { userId } = useLocalSearchParams();
  const currentUserId = userId ? parseInt(userId as string, 10) : 2;
  const changePasswordMutation = useChangePassword();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { 
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onChange',
  });

  const onSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate({
      userId: currentUserId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-800"
          style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline }}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-m-bold text-gray-900 dark:text-white ml-4">Change Password</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 px-5 pt-6 pb-8" contentContainerStyle={{ flexGrow: 1 }}>
          <Text className="text-[13px] font-sans text-gray-500 dark:text-gray-400 mb-6 leading-5">
            Your new password must be at least 6 characters long. We recommend using a mix of letters, numbers, and symbols.
          </Text>

          {/* Current Password Input */}
          <View className="mb-5">
            <Text className="text-[13px] font-m-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Current Password <Text className="text-red-500">*</Text></Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: errors.currentPassword ? '#F87171' : Colors.borderHairline }}>
                    <Lock size={18} color={errors.currentPassword ? '#F87171' : '#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3 font-sans text-[15px] text-gray-900 dark:text-white"
                      placeholder="Enter current password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showCurrent}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} className="p-1">
                      {showCurrent ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                  {errors.currentPassword && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.currentPassword.message}</Text>}
                </>
              )}
            />
          </View>

          {/* New Password Input */}
          <View className="mb-5">
            <Text className="text-[13px] font-m-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">New Password <Text className="text-red-500">*</Text></Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: errors.newPassword ? '#F87171' : Colors.borderHairline }}>
                    <Lock size={18} color={errors.newPassword ? '#F87171' : '#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3 font-sans text-[15px] text-gray-900 dark:text-white"
                      placeholder="Enter new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showNew}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-1">
                      {showNew ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                  {errors.newPassword && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.newPassword.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Confirm Password Input */}
          <View className="mb-5">
            <Text className="text-[13px] font-m-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Confirm New Password <Text className="text-red-500">*</Text></Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: errors.confirmPassword ? '#F87171' : Colors.borderHairline }}>
                    <Lock size={18} color={errors.confirmPassword ? '#F87171' : '#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3 font-sans text-[15px] text-gray-900 dark:text-white"
                      placeholder="Confirm your new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirm}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                      {showConfirm ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.confirmPassword.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Read Only Field Note */}
          <View className="flex-row items-center bg-blue-50 px-4 py-3 rounded-2xl mt-2" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#BFDBFE' }}>
            <ShieldCheck size={18} color="#2D60E8" />
            <Text className="flex-1 ml-3 text-[12px] font-sans text-blue-800 leading-4">
              Changing your password will sign you out of all other active sessions across your devices.
            </Text>
          </View>

        </ScrollView>
        
        {/* Bottom Actions */}
        <View className="px-5 pb-8 pt-4 bg-white dark:bg-gray-800 border-t border-gray-100" style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderHairline }}>
          <View className="flex-row items-center justify-between gap-3">
            <TouchableOpacity 
              onPress={() => router.back()}
              disabled={changePasswordMutation.isPending}
              className="py-3.5 rounded-[18px] items-center justify-center bg-gray-100 dark:bg-gray-800"
              style={{ flex: 3 }}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-m-semibold text-[15px]">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || changePasswordMutation.isPending}
              className={`py-3.5 rounded-[18px] items-center justify-center flex-row ${isValid ? 'bg-[#2D60E8]' : 'bg-[#D1D8E0]'}`}
              style={{ flex: 7 }}
            >
              {changePasswordMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`font-m-semibold text-[15px] ${isValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
