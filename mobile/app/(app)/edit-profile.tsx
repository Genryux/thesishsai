import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, Mail, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useColorScheme } from 'nativewind';
import { Colors } from '../../constants/designTokens';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { userId, firstName, lastName, email } = useLocalSearchParams();
  const currentUserId = userId ? parseInt(userId as string, 10) : 2;

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      firstName: firstName ? String(firstName) : '',
      lastName: lastName ? String(lastName) : '',
      email: email ? String(email) : ''
    },
    mode: 'onChange',
  });

  const updateProfileMutation = useUpdateProfile(currentUserId, () => {
    router.back();
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
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
        <Text className="text-lg font-m-bold text-gray-900 dark:text-white ml-4">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 px-5 pt-6 pb-8" contentContainerStyle={{ flexGrow: 1 }}>
          <Text className="text-[13px] font-sans text-gray-500 dark:text-gray-400 mb-6 leading-5">
            Update your personal information. Changes will be reflected across all your research projects.
          </Text>

          {/* First Name Input */}
          <View className="mb-5">
            <Text className="text-[13px] font-m-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">First Name <Text className="text-red-500">*</Text></Text>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: errors.firstName ? '#F87171' : Colors.borderHairline }}>
                    <User size={18} color={errors.firstName ? '#F87171' : '#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3 font-sans text-[15px] text-gray-900 dark:text-white"
                      placeholder="Enter your first name"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                  {errors.firstName && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.firstName.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Last Name Input */}
          <View className="mb-5">
            <Text className="text-[13px] font-m-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Last Name <Text className="text-red-500">*</Text></Text>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: errors.lastName ? '#F87171' : Colors.borderHairline }}>
                    <User size={18} color={errors.lastName ? '#F87171' : '#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3 font-sans text-[15px] text-gray-900 dark:text-white"
                      placeholder="Enter your last name"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                  {errors.lastName && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.lastName.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Email Input */}
          <View className="mb-5">
            <Text className="text-[13px] font-m-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email Address <Text className="text-red-500">*</Text></Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: errors.email ? '#F87171' : Colors.borderHairline }}>
                    <Mail size={18} color={errors.email ? '#F87171' : '#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3 font-sans text-[15px] text-gray-900 dark:text-white"
                      placeholder="john.doe@example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                  {errors.email && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.email.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Read Only Field Note */}
          <View className="flex-row items-center bg-blue-50 px-4 py-3 rounded-2xl mt-2" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#BFDBFE' }}>
            <ShieldCheck size={18} color="#2D60E8" />
            <Text className="flex-1 ml-3 text-[12px] font-sans text-blue-800 leading-4">
              Your role (Student) cannot be changed from this screen. Contact your administrator to request a role change.
            </Text>
          </View>

        </ScrollView>
        
        {/* Bottom Actions */}
        <View className="px-5 pb-8 pt-4 bg-white dark:bg-gray-800 border-t border-gray-100" style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderHairline }}>
          <View className="flex-row items-center justify-between gap-3">
            <TouchableOpacity 
              onPress={() => router.back()}
              disabled={updateProfileMutation.isPending}
              className="py-3.5 rounded-[18px] items-center justify-center bg-gray-100 dark:bg-gray-800"
              style={{ flex: 3 }}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-m-semibold text-[15px]">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || updateProfileMutation.isPending}
              className={`py-3.5 rounded-[18px] items-center justify-center flex-row ${isValid ? 'bg-[#2D60E8]' : 'bg-[#D1D8E0]'}`}
              style={{ flex: 7 }}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`font-m-semibold text-[15px] ${isValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
