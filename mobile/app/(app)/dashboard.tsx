import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, ScrollView, Text, Pressable, Animated, StyleSheet, Easing, ActivityIndicator, Modal, PanResponder, TextInput, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Bell, Settings, FileText, Plus, FilePlus, FileUp, X, UploadCloud, ChevronDown, Check } from 'lucide-react-native';
import Svg, { Rect, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlurView, BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { Colors, ModalMotion, ScreenSlideMotion, createScreenSlideAnimation, ModalStyles } from '../../constants/designTokens';
import * as DocumentPicker from 'expo-document-picker';
import { useSubmitDocument } from '../../hooks/useSubmitDocument';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();

  const [testState, setTestState] = useState<0 | 1 | 2>(2);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const contentRef = useRef(null);

  // Submit Revision Modal States
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const modalSlideAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          modalSlideAnim.setValue(1 - (gestureState.dy / (SCREEN_HEIGHT * 0.6)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          handleCloseModal();
        } else {
          Animated.spring(modalSlideAnim, ScreenSlideMotion.spring.slideEnter).start();
        }
      },
    })
  ).current;

  const handleOpenModal = () => {
    setRemarksModalVisible(true);
  };

  const handleCloseModal = () => {
    createScreenSlideAnimation.close(modalSlideAnim, undefined, () => {
      setRemarksModalVisible(false);
      setSelectedFile(null);
      setRemarks('');
      setSelectedProjectId(null);
      setIsDropdownOpen(false);
    });
  };

  const submitMutation = useSubmitDocument(() => {
    handleCloseModal();
    Alert.alert('Success', 'Revision submitted successfully!');
  });

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled) return;
      setSelectedFile(result.assets[0]);
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !selectedProjectId) {
      Alert.alert('Error', 'Please select a research project and a PDF file.');
      return;
    }
    submitMutation.mutate({
      fileUri: selectedFile.uri,
      fileName: selectedFile.name,
      paperId: selectedProjectId,
      remarks,
    });
  };

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
    queryKey: ['user', groupData?.adviserId as number],
    enabled: !!groupData?.adviserId,
    queryFn: () => apiService.getUser(groupData?.adviserId as number)
  });

  const getProjectStatusInfo = (project: any) => {
    const submissions = project.submissions || [];
    if (submissions.length === 0) return { text: 'Draft', color: '#64748B', bg: '#F1F5F9' };
    const latestSubmission = submissions[0];
    const hasFeedback = latestSubmission.feedbacks && latestSubmission.feedbacks.length > 0;
    
    if (!hasFeedback) {
      if (latestSubmission.status === 'Submitted') return { text: 'Submitted', color: '#0284C7', bg: '#E0F2FE' };
      return { text: 'Draft', color: '#64748B', bg: '#F1F5F9' };
    }
    
    const latestFeedback = latestSubmission.feedbacks[latestSubmission.feedbacks.length - 1];
    const decision = latestFeedback?.decision;
    
    if (decision === 'Under Review') return { text: 'Under Review', color: '#D97706', bg: '#FEF3C7' };
    if (decision === 'Revise Required' || decision === 'Revision Required') return { text: 'Revise Required', color: '#DC2626', bg: '#FEF2F2' };
    if (decision === 'Approved') return { text: 'Approved', color: '#059669', bg: '#D1FAE5' };
    
    return { text: 'Submitted', color: '#0284C7', bg: '#E0F2FE' };
  };

  const mockGroup = groupData ? {
    name: groupData.groupName,
    strand: groupData.strand,
    section: groupData.section,
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
            <TouchableOpacity className="bg-white p-2.5 rounded-full shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline }}>
              <Bell size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-white p-2.5 rounded-full shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline }}
              onPress={() => router.push({ pathname: '/settings', params: { userId: currentUserId } })}
            >
              <Settings size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>

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
              <Text className="font-m-medium text-[14px] text-gray-500 mb-3 ml-1">Assigned Group</Text>
              
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
                      <Text className="text-white/80 font-sans text-sm">{mockGroup.strand} - {mockGroup.section}</Text>
                    </View>
                    <Text className="text-white/70 font-m-medium text-[11px]">{mockGroup.schoolYear}</Text>
                  </View>
                </View>
              </View>

              <Text className="font-m-medium text-[14px] text-gray-500 mb-4 ml-1">Research Projects</Text>

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
                    className="bg-white p-5 rounded-[20px] mb-3 shadow-sm" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline }}
                    onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })}
                  >
                    <Text className="text-[15px] font-m-bold text-gray-900 mb-1">{project.title || 'Untitled Project'}</Text>
                    <Text className="text-[13px] font-sans text-gray-400 leading-5 mb-5" numberOfLines={2}>
                      {project.abstract || 'No abstract provided for this research project.'}
                    </Text>
                    
                    <View className="h-[1px] bg-gray-100 w-full mb-4" />
                    
                    <View className="flex-row justify-between items-center">
                      {(() => {
                        const statusInfo = getProjectStatusInfo(project);
                        return (
                          <View style={{ backgroundColor: statusInfo.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: statusInfo.color, fontSize: 11, fontFamily: 'Manrope_700Bold' }}>{statusInfo.text}</Text>
                          </View>
                        );
                      })()}
                      
                      <Text className="text-gray-400 font-m-medium text-[13px]">
                        Version {project.version || project.latestVersion || 'v1'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

        </ScrollView>
      </BlurTargetView>

      {/* Action Sheet Overlay */}
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
                  setTimeout(() => handleOpenModal(), 200);
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
            className="w-[64px] h-[64px] bg-[#2D60E8] rounded-full items-center justify-center border border-[#5C88FF]/30"
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

      {/* Submit Revision Modal */}
      <Modal 
        visible={remarksModalVisible} 
        transparent 
        animationType="none" 
        onRequestClose={handleCloseModal}
        onShow={() => createScreenSlideAnimation.open(modalSlideAnim)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalSlideAnim }]}>
          <BlurView 
            intensity={40} 
            tint="dark" 
            style={StyleSheet.absoluteFill}
            blurMethod="dimezisBlurView"
            blurTarget={contentRef}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseModal} />
          <Animated.View 
            style={[
              ModalStyles.sheetContainer,
              { 
                marginHorizontal: 16,
                marginBottom: 16,
                borderRadius: 32,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                paddingBottom: 0,
                paddingHorizontal: 24,
                maxHeight: SCREEN_HEIGHT * 0.85,
                transform: [{ translateY: modalSlideAnim.interpolate(ScreenSlideMotion.interpolation.sheetTranslateY(SCREEN_HEIGHT)) }] 
              }
            ]}
          >
            <View {...panResponder.panHandlers} style={{ backgroundColor: 'transparent' }}>
              <View style={ModalStyles.grabber} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit Revision</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.modalClose}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Research Project</Text>
              
              <View style={{ zIndex: 50, marginBottom: 16 }}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={styles.dropdownSelector}
                >
                  <Text style={[styles.dropdownSelectedText, !selectedProjectId && { color: '#9CA3AF' }]}>
                    {selectedProjectId 
                      ? mockProjects.find((p: any) => p.id === selectedProjectId)?.title || 'Selected Project'
                      : 'Select a research project to revise...'}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>

              </View>

              <Text style={styles.modalLabel}>Selected File</Text>
              
              {selectedFile ? (
                <View style={styles.modalFileItem}>
                  <FileText size={20} color="#2D60E8" />
                  <Text style={styles.modalFileName} numberOfLines={1}>{selectedFile?.name}</Text>
                  <TouchableOpacity onPress={handleSelectFile} style={styles.modalChangeFileBtn}>
                    <Text style={styles.modalChangeFileText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handleSelectFile} style={styles.modalUploadZone}>
                  <UploadCloud size={32} color="#94A3B8" />
                  <Text style={styles.modalUploadText}>Tap to select a PDF file</Text>
                  <Text style={styles.modalUploadSubText}>Maximum file size 10MB</Text>
                </TouchableOpacity>
              )}

              <Text style={[styles.modalLabel, { marginTop: 24 }]}>Remarks (Optional)</Text>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Add a note to your adviser about this revision..."
                  placeholderTextColor="#94A3B8"
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  textAlignVertical="top"
                />
              </KeyboardAvoidingView>

              <TouchableOpacity 
                style={[styles.modalSubmitBtn, (!selectedFile || !selectedProjectId) && styles.modalSubmitBtnDisabled]}
                disabled={!selectedFile || !selectedProjectId}
                onPress={handleSubmit}
              >
                <Text style={styles.modalSubmitBtnText}>Submit Revision</Text>
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {(() => {
                      const eligibleProjects = mockProjects.filter((proj: any) => {
                        const statusInfo = getProjectStatusInfo(proj);
                        return statusInfo.text === 'Draft' || statusInfo.text === 'Revise Required';
                      });

                      if (eligibleProjects.length === 0) {
                        return (
                          <View style={{ padding: 16, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Manrope_500Medium', color: '#64748B', fontSize: 13 }}>
                              No eligible projects found.
                            </Text>
                          </View>
                        );
                      }

                      return eligibleProjects.map((proj: any) => {
                        const statusInfo = getProjectStatusInfo(proj);
                        return (
                          <TouchableOpacity
                            key={proj.id}
                            style={styles.dropdownOption}
                            onPress={() => {
                              setSelectedProjectId(proj.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <View style={{ flex: 1, paddingRight: 10 }}>
                              <Text style={styles.dropdownOptionTitle} numberOfLines={1}>{proj.title || 'Untitled'}</Text>
                              <Text style={styles.dropdownOptionSub}>Version {proj.version || proj.latestVersion || 'v1'}</Text>
                            </View>
                            <View style={{ backgroundColor: statusInfo.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: statusInfo.color, fontSize: 10, fontFamily: 'Manrope_700Bold' }}>{statusInfo.text}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      });
                    })()}
                  </ScrollView>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  modalTitle: { fontFamily: 'Manrope_700Bold', fontSize: 20, color: '#111827' },
  modalClose: { padding: 4 },
  modalBody: { paddingBottom: 32 },
  modalLabel: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#374151', marginBottom: 12 },
  modalUploadZone: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 24, alignItems: 'center', backgroundColor: '#F8FAFC' },
  modalUploadText: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: '#475569', marginTop: 8, marginBottom: 4 },
  modalUploadSubText: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#94A3B8' },
  modalFileItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E0E7FF' },
  modalFileName: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#1E40AF', marginLeft: 12, marginRight: 12 },
  modalChangeFileBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  modalChangeFileText: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#1D4ED8' },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, height: 100, fontFamily: 'Manrope_500Medium', fontSize: 15, color: '#111827' },
  modalSubmitBtn: { backgroundColor: '#2D60E8', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  modalSubmitBtnDisabled: { backgroundColor: 'rgba(45, 96, 232, 0.5)' },
  modalSubmitBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#fff' },
  dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', borderRadius: 12, padding: 16 },
  dropdownSelectedText: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: '#111827' },
  dropdownList: { position: 'absolute', top: 76, left: 0, right: 0, zIndex: 50, backgroundColor: 'white', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', borderRadius: 12, marginTop: 4, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' },
  dropdownOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  dropdownOptionTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#111827', marginBottom: 2 },
  dropdownOptionSub: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#64748B' },
});



