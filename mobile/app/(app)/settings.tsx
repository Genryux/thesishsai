import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Lock, LogOut, Moon, Trash2, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { Paths } from 'expo-file-system';
import { Colors } from '../../constants/designTokens';
import { apiService } from '../../services/api';

import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const currentUserId = userId ? parseInt(userId as string, 10) : 2;
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => apiService.getUser(currentUserId),
  });

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        await SecureStore.deleteItemAsync('authToken');
        router.replace('/(auth)/login');
      }}
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will remove temporarily downloaded PDF documents from your device to free up space. Your projects will remain safe on the cloud.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear', 
        style: 'destructive', 
        onPress: () => {
          try {
            const cacheDir = Paths.cache;
            const items = cacheDir.list();
            for (const item of items) {
              item.delete();
            }
            Alert.alert('Success', 'Cache cleared successfully.');
          } catch (error) {
            console.error('Failed to clear cache:', error);
            Alert.alert('Error', 'Failed to clear cache.');
          }
        } 
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-800"
          style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: isDarkMode ? '#374151' : Colors.borderHairline }}
        >
          <ArrowLeft size={18} color={isDarkMode ? '#E5E7EB' : '#374151'} />
        </TouchableOpacity>
        <Text className="text-lg font-m-bold text-gray-900 dark:text-white ml-4">Settings</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Profile Section */}
        <View className="items-center py-8">
          <View className="mb-4">
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center border-4 border-white dark:border-gray-900 shadow-sm overflow-hidden">
              <Text className="font-m-bold text-3xl text-[#2D60E8]">
                {isLoading ? '' : `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text className="text-xl font-m-bold text-gray-900 dark:text-white">
            {isLoading ? 'Loading...' : `${user?.firstName} ${user?.lastName}`}
          </Text>
          <Text className="text-[13px] font-sans text-gray-500 dark:text-gray-400 mt-1">
            {user?.roleId === 1 ? 'Adviser' : 'Student'}
          </Text>
        </View>

        {/* Account Settings */}
        <View className="px-5 mb-6">
          <Text className="text-[13px] font-m-bold text-gray-500 dark:text-gray-400 mb-3 ml-2">Account</Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: isDarkMode ? '#374151' : Colors.borderHairline }}>
            <TouchableOpacity 
              onPress={() => router.push({ 
                pathname: '/edit-profile', 
                params: { 
                  userId: currentUserId,
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                  email: user?.email
                } 
              })}
              className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700"
            >
              <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                <User size={16} color="#2D60E8" />
              </View>
              <Text className="flex-1 font-m-semibold text-[15px] text-gray-800 dark:text-gray-100">Edit Profile</Text>
              <ChevronRight size={18} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/change-password', params: { userId: currentUserId } })}
              className="flex-row items-center px-4 py-4"
            >
              <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Lock size={16} color="#2D60E8" />
              </View>
              <Text className="flex-1 font-m-semibold text-[15px] text-gray-800 dark:text-gray-100">Change Password</Text>
              <ChevronRight size={18} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View className="px-5 mb-6">
          <Text className="text-[13px] font-m-bold text-gray-500 dark:text-gray-400 mb-3 ml-2">Preferences</Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: isDarkMode ? '#374151' : Colors.borderHairline }}>
            <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100 dark:border-gray-700">
              <View className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center mr-3">
                <Moon size={16} color={isDarkMode ? "#D1D5DB" : "#4B5563"} />
              </View>
              <Text className="flex-1 font-m-semibold text-[15px] text-gray-800 dark:text-gray-100">Dark Mode</Text>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleColorScheme}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={isDarkMode ? '#2D60E8' : '#fff'}
              />
            </View>
            
            <TouchableOpacity onPress={handleClearCache} className="flex-row items-center px-4 py-4">
              <View className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center mr-3">
                <Trash2 size={16} color={isDarkMode ? "#D1D5DB" : "#4B5563"} />
              </View>
              <View className="flex-1">
                <Text className="font-m-semibold text-[15px] text-gray-800 dark:text-gray-100">Clear Cache</Text>
                <Text className="font-sans text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Free up storage from downloaded PDFs</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 mt-2">
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center py-4 bg-red-50 dark:bg-red-900/20 rounded-2xl"
            style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: isDarkMode ? '#7F1D1D' : '#FEE2E2' }}
          >
            <LogOut size={18} color="#EF4444" className="mr-2" />
            <Text className="font-m-bold text-[15px] text-red-500">Log Out</Text>
          </TouchableOpacity>
          <Text className="text-center font-sans text-[11px] text-gray-400 mt-6">
            ThesiSHS AI App v1.0.0
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
