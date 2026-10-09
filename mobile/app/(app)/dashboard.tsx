import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, ScrollView, Text, Pressable, Animated, StyleSheet, Easing, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Bell, Settings, FileText, Plus, FilePlus, FileUp } from 'lucide-react-native';
import Svg, { Rect, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlurView, BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';

export default function DashboardScreen() {
  const router = useRouter();

  const [testState, setTestState] = useState<0 | 1 | 2>(2);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const contentRef = useRef(null);

  // Animations (Fluid iOS-like)
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const buttonRotate = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const buttonAnims = useRef(Array.from({ length: 2 }, () => new Animated.Value(0))).current;

  const handleOpenActions = () => {
    setIsFabOpen(true);
    buttonAnims.forEach(a => a.setValue(0));
    
    Animated.parallel([
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(buttonRotate, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      }),
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ]).start();

    // Stagger buttons up with a snappy spring
    Animated.stagger(50, 
      buttonAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        })
      ).reverse()
    ).start();
  };

  const handleCloseActions = () => {
    // Force snappy deterministic timings on close so shadows don't linger
    Animated.parallel([
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(buttonRotate, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 50,
      }),
      ...buttonAnims.map(anim => 
        Animated.timing(anim, { 
          toValue: 0, 
          duration: 150, 
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true 
        })
      )
    ]).start(({ finished }) => {
      if (finished) setIsFabOpen(false);
    });
  };

  const { userId } = useLocalSearchParams();
  const currentUserId = userId ? parseInt(userId as string, 10) : 2; // Default to John Doe

  // Fetch which group this user belongs to
  const { data: memberData, isLoading: isMemberLoading, error: memberError } = useQuery({
    queryKey: ['membership', currentUserId],
    queryFn: () => apiService.getGroupMembership(currentUserId)
  });

  const currentGroupId = memberData?.groupId;

  // Fetch the active research group and its members
  const { data: groupData, isLoading: isGroupLoading, error: groupError } = useQuery({
    queryKey: ['group', currentGroupId],
    enabled: !!currentGroupId,
    queryFn: () => apiService.getGroup(currentGroupId)
  });

  // Fetch the adviser's name
  const { data: adviserData } = useQuery({
    queryKey: ['user', groupData?.adviserId],
    enabled: !!groupData?.adviserId,
    queryFn: () => apiService.getUser(groupData.adviserId)
  });

  const mockGroup = groupData ? {
    name: groupData.groupName,
    strand: groupData.strand,
    adviser: adviserData ? adviserData.firstName + ' ' + adviserData.lastName : 'Loading...',
    members: groupData.group_members ? groupData.group_members.length : 0,
    schoolYear: groupData.schoolYear
  } : null;

  const { data: mockProjects = [], isLoading: isProjectsLoading, error: projectsError } = useQuery({
    queryKey: ['papers', { groupId: currentGroupId }],
    enabled: !!currentGroupId,
    queryFn: () => apiService.getPapers(currentGroupId)
  });

  // Handle Loading & Error States gracefully
  if (isMemberLoading || (currentGroupId && isGroupLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2D60E8" />
        <Text style={{ marginTop: 10 }}>Loading your workspace...</Text>
      </View>
    );
  }

  if (memberError || groupError || projectsError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          Error loading dashboard: {memberError?.message || groupError?.message || projectsError?.message}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#EDF1F5]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <BlurTargetView ref={contentRef} style={{ flex: 1 }}>
        {/* Custom Header */}
        <View className="flex-row justify-between items-center px-4 py-3 bg-[#EDF1F5] z-10">
          <Text className="font-m-bold text-2xl text-gray-900">Dashboard</Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
              <Bell size={18} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
              <Settings size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ flexGrow: 1 }}>

          {/* State 1: No Group Assigned */}
          {!mockGroup && (
            <View className="flex-1 items-center justify-center pb-24">
              <Text className="text-xl font-m-bold text-gray-900 mb-2">No group assigned yet</Text>
              <Text className="text-[13px] font-sans text-gray-500 text-center px-8 mb-8">
                You haven't been assigned to a group yet. Please contact your adviser for help.
              </Text>
              <TouchableOpacity 
                onPress={() => router.replace('/')}
                className="bg-[#DFE4EA] py-3.5 px-16 rounded-[18px] items-center border border-[#D1D8E0]"
              >
                <Text className="text-gray-900 font-m-semibold text-[15px]">Logout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* State 2 & 3: Have Group Assigned */}
          {mockGroup && (
            <>
              <Text className="text-[13px] font-sans text-gray-500 mb-3 ml-1">Assigned Group</Text>
              
              {/* Blue Group Card */}
              <View className="rounded-[20px] mb-8 shadow-sm overflow-hidden" style={{ backgroundColor: '#2D60E8' }}>
                <View className="absolute top-0 left-0 right-0 bottom-0">
                  <Svg height="100%" width="100%">
                    <Defs>
                      <SvgRadialGradient id="grad" cx="50%" cy="0%" r="80%">
                        <Stop offset="0" stopColor="#5C88FF" stopOpacity="1" />
                        <Stop offset="1" stopColor="#2D60E8" stopOpacity="1" />
                      </SvgRadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                  </Svg>
                </View>
                
                <View className="p-5 z-10">
                  <View className="flex-row justify-between items-start mb-4">
                    <Text className="text-2xl font-m-bold text-white">{mockGroup.name}</Text>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-[11px] font-m-medium">{mockGroup.members} members</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-end mt-1">
                    <View>
                      <Text className="text-white/90 font-sans text-base mb-1">{mockGroup.adviser}</Text>
                      <Text className="text-white/80 font-sans text-sm">{mockGroup.strand}</Text>
                    </View>
                    <Text className="text-white/70 font-m-medium text-[11px]">{mockGroup.schoolYear}</Text>
                  </View>
                </View>
              </View>

              <Text className="text-[13px] font-sans text-gray-500 mb-4 ml-1">Research Projects</Text>

              {/* State 2: No Research Project */}
              {mockProjects.length === 0 && (
                <View className="items-center mt-10">
                  <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                    <FileText size={40} color="#CBD5E1" />
                  </View>
                  <Text className="text-[17px] font-m-bold text-gray-900 mb-2">No research project yet</Text>
                  <Text className="text-[13px] font-sans text-gray-500 mb-8 text-center">
                    Start by creating your first research project
                  </Text>
                  <TouchableOpacity 
                  onPress={() => router.push({ pathname: '/create-research', params: { groupId: currentGroupId } })}
                  className="bg-[#2D60E8] py-3.5 px-8 rounded-2xl flex-row items-center justify-center shadow-sm"
                >
                    <Plus size={16} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white font-m-semibold text-[15px]">Create research</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* State 3: Have Research Project */}
              {Array.isArray(mockProjects) && mockProjects.length > 0 && mockProjects.map((project: any) => {
                if (!project) return null;
                return (
                  <TouchableOpacity 
                    key={project.id || Math.random()} 
                    className="bg-white p-5 rounded-[20px] mb-4 shadow-sm border border-gray-200"
                    onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })}
                  >
                    <Text className="text-[15px] font-m-bold text-gray-900 mb-1">{project.title || 'Untitled Project'}</Text>
                    <Text className="text-[13px] font-sans text-gray-400 leading-5 mb-5" numberOfLines={2}>
                      {project.abstract || 'No abstract provided for this research project.'}
                    </Text>
                    
                    <View className="h-[1px] bg-gray-100 w-full mb-4" />
                    
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-2">
                        <View className="bg-[#EAECEE] px-3 py-1 rounded-md">
                          <Text className="text-gray-500 text-[11px] font-m-bold">{project.status || 'Draft'}</Text>
                        </View>
                        <Text className="text-gray-400 font-sans text-[13px]">({project.version || project.latestVersion || 'v1'})</Text>
                      </View>
                      
                      {/* Overlapping Avatars */}
                      <View className="flex-row">
                        {Array.isArray(project.authors) ? project.authors.map((author: string, index: number) => (
                          <View 
                            key={index} 
                            className="w-7 h-7 rounded-full bg-[#2D60E8] border-2 border-white items-center justify-center"
                            style={{ marginLeft: index === 0 ? 0 : -8 }}
                          >
                            <Text className="text-white text-[10px] font-m-bold">{author || '?'}</Text>
                          </View>
                        )) : (
                          <View className="w-7 h-7 rounded-full bg-[#2D60E8] border-2 border-white items-center justify-center">
                            <Text className="text-white text-[10px] font-m-bold">JD</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

        </ScrollView>
      </BlurTargetView>

      {/* Action Sheet Overlay (Rendered directly in DOM exactly like Skedue, NO Modal) */}
      {mockGroup && isFabOpen && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 40 }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: sheetOpacity }]}>
            <BlurView 
              intensity={40} 
              tint="dark" 
              style={StyleSheet.absoluteFill}
              blurMethod="dimezisBlurView"
              blurTarget={contentRef}
            />
          </Animated.View>
          
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={handleCloseActions} 
          />
          
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 110,
                right: 24,
                alignItems: 'flex-end',
                gap: 16,
                zIndex: 50,
              }
            ]}
          >
            {[
              { 
                label: 'Create new research', 
                icon: FilePlus, 
                onPress: () => {
                  handleCloseActions();
                  setTimeout(() => router.push({ pathname: '/create-research', params: { groupId: currentGroupId } }), 200);
                }
              },
              { 
                label: 'Submit revision', 
                icon: FileUp,
                onPress: () => {
                  handleCloseActions();
                  // TODO: route to submit revision
                }
              },
            ].map((item, index) => {
              const anim = buttonAnims[index];
              const Icon = item.icon;
              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 1],
                    }),
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.01, 1],
                        }),
                      },
                      {
                        translateX: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      },
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }
                    ],
                  }}
                >
                  <Pressable 
                    onPress={item.onPress}
                    className="flex-row items-center bg-white p-2 pr-5 rounded-full shadow-md"
                    style={{
                      shadowColor: '#111827',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    <View className="w-10 h-10 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
                      <Icon size={18} color="#2D60E8" />
                    </View>
                    <Text className="text-gray-900 font-m-semibold text-[15px]">{item.label}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>
        </View>
      )}

      {/* Main Floating Action Button (Always mounted above overlay, zIndex 60) */}
      {mockGroup && (
        <Animated.View style={{
          position: 'absolute',
          bottom: 32,
          right: 24,
          zIndex: 60,
          transform: [{
            scale: buttonScale.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.9],
            })
          }]
        }}>
          <Pressable 
            onPress={isFabOpen ? handleCloseActions : handleOpenActions}
            className="w-[72px] h-[72px] bg-[#2D60E8] rounded-full items-center justify-center border border-[#5C88FF]/30"
            style={{ 
              elevation: 8, 
              shadowColor: '#2D60E8', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.4, 
              shadowRadius: 12 
            }}
          >
            <Animated.View style={{
              transform: [{
                rotate: buttonRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                })
              }]
            }}>
              <Plus size={28} color="white" />
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
