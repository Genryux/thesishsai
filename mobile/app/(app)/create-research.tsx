import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, AlignLeft, Tag, Hash } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ScreenSlideMotion, createScreenSlideAnimation } from '../../constants/designTokens';
import { useCreateResearch } from '../../hooks/useCreateResearch';
import { useUpdateResearch } from '../../hooks/useUpdateResearch';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. Define the validation schema using Zod
const researchSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  abstract: z.string().min(20, "Abstract must be at least 20 characters"),
  category: z.string().optional(),
  keywords: z.string().optional(),
});
type ResearchFormValues = z.infer<typeof researchSchema>;

export default function CreateResearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { groupId, editId, title, abstract, category, keywords } = params;
  const currentGroupId = groupId ? parseInt(groupId as string, 10) : 101;
  const isEditMode = !!editId;

  // 2. Initialize React Hook Form with Zod resolver
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: { 
      title: isEditMode && title ? String(title) : '', 
      abstract: isEditMode && abstract ? String(abstract) : '', 
      category: isEditMode && category ? String(category) : '', 
      keywords: isEditMode && keywords ? String(keywords) : '' 
    },
    mode: 'onChange', // Trigger validation on change so the button unlocks instantly
  });

  // Mento Design Token Animation setup
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    createScreenSlideAnimation.close(slideAnim, undefined, () => {
      router.back();
    });
  }, [router, slideAnim]);

  useEffect(() => {
    createScreenSlideAnimation.open(slideAnim);
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => backHandler.remove();
  }, [handleClose, slideAnim]);

  // 3. Use our newly refactored custom hooks
  const createProjectMutation = useCreateResearch(() => handleClose());
  const updateProjectMutation = useUpdateResearch(() => handleClose());

  const isPending = createProjectMutation.isPending || updateProjectMutation.isPending;

  const onSubmit = (data: ResearchFormValues) => {
    if (isEditMode) {
      updateProjectMutation.mutate({
        id: editId as string,
        title: data.title,
        abstract: data.abstract,
        category: data.category || '',
        keywords: data.keywords || '',
      });
    } else {
      createProjectMutation.mutate({
        title: data.title,
        abstract: data.abstract,
        category: data.category || '',
        keywords: data.keywords || '',
        groupId: currentGroupId,
      });
    }
  };

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const translateY = slideAnim.interpolate(
    ScreenSlideMotion.interpolation.sheetTranslateY(SCREEN_HEIGHT)
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: backdropOpacity }]} />

      <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
        <SafeAreaView className="flex-1 bg-[#EDF1F5]" edges={['top']}>
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 bg-[#EDF1F5] relative justify-center">
            <TouchableOpacity 
              onPress={handleClose}
              className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2
              }}
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-m-bold text-gray-900">{isEditMode ? 'Edit Research' : 'New Research'}</Text>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#EDF1F5]"
          >
            <ScrollView className="flex-1 px-5 pt-6 pb-8" contentContainerStyle={{ flexGrow: 1 }}>
              <Text className="text-[13px] font-sans text-gray-500 mb-6 leading-5">
                {isEditMode 
                  ? "Update the details of your research project below."
                  : "Fill in the details below to create a new research project. You can update these details later before publishing."}
              </Text>

              {/* Title Input */}
              <View className="mb-5">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Research Title <Text className="text-red-500">*</Text></Text>
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <View 
                        className={`flex-row items-center bg-white rounded-2xl ${errors.title ? 'border-red-500' : 'border-gray-200'} px-4 py-1 h-14`}
                        style={{ borderWidth: StyleSheet.hairlineWidth }}
                      >
                        <BookOpen size={20} color={errors.title ? "#EF4444" : "#9CA3AF"} className="mr-3" />
                        <TextInput
                          className="flex-1 font-m-medium text-[15px] text-gray-900 h-full"
                          placeholder="e.g. The Impact of AI on Education"
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          maxLength={200}
                        />
                      </View>
                      {errors.title && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.title.message}</Text>}
                    </>
                  )}
                />
              </View>

              {/* Abstract Input */}
              <View className="mb-5">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Abstract <Text className="text-red-500">*</Text></Text>
                <Controller
                  control={control}
                  name="abstract"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <View 
                        className={`flex-row items-start bg-white rounded-2xl ${errors.abstract ? 'border-red-500' : 'border-gray-200'} px-4 py-4 min-h-[140px]`}
                        style={{ borderWidth: StyleSheet.hairlineWidth }}
                      >
                        <AlignLeft size={20} color={errors.abstract ? "#EF4444" : "#9CA3AF"} className="mr-3 mt-0.5" />
                        <TextInput
                          className="flex-1 font-m-medium text-[15px] text-gray-900 leading-6"
                          placeholder="Brief summary of your research methodology and expected outcomes..."
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          multiline
                          textAlignVertical="top"
                        />
                      </View>
                      {errors.abstract && <Text className="text-[12px] font-sans text-red-500 mt-2 ml-1">{errors.abstract.message}</Text>}
                    </>
                  )}
                />
              </View>

              {/* Category Input */}
              <View className="mb-5">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Category</Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View 
                      className="flex-row items-center bg-white rounded-2xl border-gray-200 px-4 py-1 h-14"
                      style={{ borderWidth: StyleSheet.hairlineWidth }}
                    >
                      <Tag size={20} color="#9CA3AF" className="mr-3" />
                      <TextInput
                        className="flex-1 font-m-medium text-[15px] text-gray-900 h-full"
                        placeholder="e.g. Technology, Social Science"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        maxLength={100}
                      />
                    </View>
                  )}
                />
              </View>

              {/* Keywords Input */}
              <View className="mb-8">
                <Text className="text-[13px] font-m-bold text-gray-700 mb-2 ml-1">Keywords</Text>
                <Controller
                  control={control}
                  name="keywords"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <View 
                        className="flex-row items-center bg-white rounded-2xl border-gray-200 px-4 py-1 h-14"
                        style={{ borderWidth: StyleSheet.hairlineWidth }}
                      >
                        <Hash size={20} color="#9CA3AF" className="mr-3" />
                        <TextInput
                          className="flex-1 font-m-medium text-[15px] text-gray-900 h-full"
                          placeholder="e.g. AI, Education, Machine Learning"
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                      <Text className="text-[11px] font-sans text-gray-400 mt-2 ml-1">Separate multiple keywords with commas</Text>
                    </>
                  )}
                />
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
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isPending}
                className={`py-3.5 rounded-[18px] items-center justify-center flex-row ${isValid ? 'bg-[#2D60E8]' : 'bg-[#2D60E8]/50'}`}
                style={{ flex: 7 }}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className={`font-m-semibold text-[15px] ${isValid ? 'text-white' : 'text-white/70'}`}>
                    {isEditMode ? 'Save Changes' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
