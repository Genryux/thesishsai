import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, AlignLeft, Tag, Hash } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenSlideMotion, createScreenSlideAnimation } from '../../constants/designTokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

import { apiService } from '../../services/api';

export default function CreateResearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');

  // Use a 0-to-1 animation value as expected by Mento's design tokens
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    
    // Exact 1:1 close animation from design tokens
    createScreenSlideAnimation.close(slideAnim, undefined, () => {
      router.back();
    });
  }, [router, slideAnim]);

  useEffect(() => {
    // Exact 1:1 open animation from design tokens
    createScreenSlideAnimation.open(slideAnim);

    const onBackPress = () => {
      handleClose();
      return true; // prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      backHandler.remove();
    };
  }, [handleClose, slideAnim]);

  const createProjectMutation = useMutation({
    mutationFn: async (newProject: any) => {
      return await apiService.createPaper(newProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please make sure the JSON Server is running on port 3000.");
    }
  });

  const { groupId } = useLocalSearchParams();
  const currentGroupId = groupId ? parseInt(groupId as string, 10) : 101;

  const handleCreate = () => {
    createProjectMutation.mutate({
      title,
      abstract,
      category,
      keywords,
      status: 'Draft',
      groupId: currentGroupId,
    });
  };

  // Interpolate opacity directly from the 0-to-1 slideAnim for perfect sync
  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  // Generate perfect translateY using the design token helper
  const translateY = slideAnim.interpolate(
    ScreenSlideMotion.interpolation.sheetTranslateY(SCREEN_HEIGHT)
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Dimmed Backdrop synced 1:1 to slide physics */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: backdropOpacity }]} />

      <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white relative justify-center">
            <TouchableOpacity 
              onPress={handleClose}
              className="absolute left-4 z-10 w-10 h-10 bg-[#F3F4F6] rounded-full items-center justify-center"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-m-bold text-gray-900">New Research</Text>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#EDF1F5]"
          >
            <ScrollView className="flex-1 px-5 pt-6 pb-8" contentContainerStyle={{ flexGrow: 1 }}>
              
              <Text className="text-[13px] font-sans text-gray-500 mb-6 leading-5">
                Fill in the details below to create a new research project. You can update these details later before publishing.
              </Text>

              {/* Title Input */}
              <View className="mb-5">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Research Title <Text className="text-red-500">*</Text></Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-1 h-14">
                  <BookOpen size={20} color="#9CA3AF" className="mr-3" />
                  <TextInput
                    className="flex-1 font-m-medium text-[15px] text-gray-900 h-full"
                    placeholder="e.g. The Impact of AI on Education"
                    placeholderTextColor="#9CA3AF"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={200}
                  />
                </View>
              </View>

              {/* Abstract Input */}
              <View className="mb-5">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Abstract <Text className="text-red-500">*</Text></Text>
                <View className="flex-row items-start bg-white rounded-2xl border border-gray-200 px-4 py-4 min-h-[140px]">
                  <AlignLeft size={20} color="#9CA3AF" className="mr-3 mt-0.5" />
                  <TextInput
                    className="flex-1 font-m-medium text-[15px] text-gray-900 leading-6"
                    placeholder="Brief summary of your research methodology and expected outcomes..."
                    placeholderTextColor="#9CA3AF"
                    value={abstract}
                    onChangeText={setAbstract}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Category Input */}
              <View className="mb-5">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Category</Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-1 h-14">
                  <Tag size={20} color="#9CA3AF" className="mr-3" />
                  <TextInput
                    className="flex-1 font-m-medium text-[15px] text-gray-900 h-full"
                    placeholder="e.g. Technology, Social Science"
                    placeholderTextColor="#9CA3AF"
                    value={category}
                    onChangeText={setCategory}
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Keywords Input */}
              <View className="mb-8">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Keywords</Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-1 h-14">
                  <Hash size={20} color="#9CA3AF" className="mr-3" />
                  <TextInput
                    className="flex-1 font-m-medium text-[15px] text-gray-900 h-full"
                    placeholder="e.g. AI, Education, Machine Learning"
                    placeholderTextColor="#9CA3AF"
                    value={keywords}
                    onChangeText={setKeywords}
                  />
                </View>
                <Text className="text-[11px] font-sans text-gray-400 mt-2 ml-1">Separate multiple keywords with commas</Text>
              </View>

            </ScrollView>
            
            {/* Bottom Actions Wrapper */}
            <View 
              className="bg-white border-t border-gray-200 flex-row gap-3"
              style={{
                paddingTop: 12,
                paddingHorizontal: 20,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 32
              }}
            >
              <TouchableOpacity 
                onPress={handleClose}
                className="bg-[#F3F4F6] py-3.5 rounded-[18px] items-center"
                style={{ flex: 3 }}
              >
                <Text className="text-gray-700 font-m-semibold text-[15px]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreate}
                disabled={!title || !abstract || createProjectMutation.isPending}
                className={`py-3.5 rounded-[18px] items-center justify-center flex-row ${title && abstract ? 'bg-[#2D60E8]' : 'bg-[#D1D8E0]'}`}
                style={{ flex: 7 }}
              >
                {createProjectMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className={`font-m-semibold text-[15px] ${title && abstract ? 'text-white' : 'text-gray-500'}`}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
