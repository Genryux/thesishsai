import { View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Pressable, Modal, TextInput, KeyboardAvoidingView, Animated, Dimensions, PanResponder, Platform } from 'react-native';
import { Text } from '../../../components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../services/api';
import { Colors, ModalMotion, ScreenSlideMotion, createScreenSlideAnimation, ModalStyles } from '../../../constants/designTokens';
import { ArrowLeft, Eye, Upload, FileText, History, Users, Plus, X, UploadCloud } from 'lucide-react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useSubmitDocument } from '../../../hooks/useSubmitDocument';
import { BlurView, BlurTargetView } from 'expo-blur';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { BASE_URL } from '../../../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const projectId = parseInt(id as string, 10);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['paper', projectId],
    queryFn: () => apiService.getPaperById(projectId)
  });

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['submissions', projectId],
    queryFn: () => apiService.getSubmissions(projectId)
  });

  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const contentRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
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

  const versionPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          versionModalSlideAnim.setValue(1 - (gestureState.dy / (SCREEN_HEIGHT * 0.6)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          handleCloseVersionModal();
        } else {
          Animated.spring(versionModalSlideAnim, ScreenSlideMotion.spring.slideEnter).start();
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
    });
  };

  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [isVersionModalVisible, setVersionModalVisible] = useState(false);
  const versionModalSlideAnim = useRef(new Animated.Value(0)).current;

  const handleOpenVersionModal = (submission: any) => {
    setSelectedVersion(submission);
    setVersionModalVisible(true);
  };

  const handleCloseVersionModal = () => {
    createScreenSlideAnimation.close(versionModalSlideAnim, undefined, () => {
      setVersionModalVisible(false);
      setSelectedVersion(null);
    });
  };

  const submitMutation = useSubmitDocument(() => {
    handleCloseModal();
    Alert.alert('Success', 'Document submitted successfully!');
  });

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Selection Failed', error?.message || 'Something went wrong');
    }
  };

  const confirmSubmit = () => {
    if (!selectedFile) return;
    submitMutation.mutate({
      fileUri: selectedFile.uri,
      fileName: decodeURIComponent(selectedFile.name),
      paperId: projectId,
      remarks: remarks
    });
  };

  const [activeTab, setActiveTab] = useState<'research' | 'versions' | 'members'>('research');

  if (isLoading || isLoadingSubmissions) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2D60E8" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load project details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnError}>
          <Text style={styles.backBtnErrorText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Parse keywords safely
  const keywords = project.keywords ? project.keywords.split(',').map((k: string) => k.trim()) : ['Technology', 'Social Science'];

  const latestSubmission = submissions.length > 0 ? submissions[0] : null;

  const handleViewDocument = async (submission: any) => {
    if (!submission?.fileUrl) return;
    try {
      const rawUrl = submission.fileUrl.startsWith('http') 
        ? submission.fileUrl 
        : `${BASE_URL}${submission.fileUrl}`;
        
      const fileUrl = encodeURI(rawUrl);
      const fileName = submission.fileUrl.split('/').pop() || 'document.pdf';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      let finalUri = fileUri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
        finalUri = uri;
      }

      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(finalUri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          });
        } catch (intentErr) {
          await Sharing.shareAsync(finalUri);
        }
      } else {
        await Sharing.shareAsync(finalUri);
      }
    } catch (e) {
      console.error('Failed to view document:', e);
      Alert.alert('Error', 'Could not open the document.');
    }
  };

  const DocumentItem = ({ submission, isWhiteBg = false, noMargin = false }: { submission: any, isWhiteBg?: boolean, noMargin?: boolean }) => {
    return (
      <View style={[styles.docItem, isWhiteBg ? styles.docItemWhite : styles.docItemGray, noMargin && { marginBottom: 0 }]}>
        <View style={styles.pdfIconContainer}>
          <FileText size={22} color="#94A3B8" strokeWidth={1.5} />
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeText}>PDF</Text>
          </View>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docName} numberOfLines={1} ellipsizeMode="tail">
            {decodeURIComponent(submission?.fileUrl?.split('/').pop()?.replace(/^\d+-/, '') || 'Document.pdf')}
          </Text>
          <Text style={styles.docSubmitter}>Submitted on: {new Date(submission?.submittedAt).toLocaleDateString()}</Text>
        </View>
      </View>
    );
  };

  const VersionItem = ({ submission, isActive, isLast, isFirst }: { submission: any, isActive?: boolean, isLast?: boolean, isFirst?: boolean }) => (
    <View style={styles.timelineItemNew}>
      <View style={[
        styles.timelineLineContinuous, 
        isFirst && { top: 26 }, // Start exactly from the first circle
        isLast && { bottom: 34, height: 'auto' } // Stop exactly at the last circle
      ]} />

      <Text style={styles.timelineDateNew}>Submitted on {new Date(submission?.submittedAt).toLocaleDateString()}</Text>
      <TouchableOpacity 
        style={styles.timelineCardWrapperNew} 
        activeOpacity={0.7}
        onPress={() => handleOpenVersionModal(submission)}
      >
        <View style={[styles.versionCircleNew, isActive && styles.versionCircleActive]}>
          <Text style={[styles.versionTextNew, isActive && styles.versionTextActive]}>{submission?.version}</Text>
        </View>
        <DocumentItem submission={submission} isWhiteBg={true} noMargin={true} />
      </TouchableOpacity>
    </View>
  );

  const MemberItem = ({ name, email, initials, isLeader = false }: { name: string, email: string, initials: string, isLeader?: boolean }) => {
    return (
      <View style={[styles.memberCard, isLeader && styles.memberCardLeader]}>
        {isLeader && (
          <View style={StyleSheet.absoluteFill}>
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
        )}
        <View style={styles.memberContent}>
          <View style={[styles.memberAvatar, isLeader ? styles.memberAvatarLeader : styles.memberAvatarNormal]}>
            <Text style={[styles.memberInitials, isLeader ? styles.memberInitialsLeader : styles.memberInitialsNormal]}>{initials}</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, isLeader && styles.memberNameLeader]}>{name}</Text>
            <Text style={[styles.memberEmail, isLeader && styles.memberEmailLeader]}>{email}</Text>
          </View>
          {isLeader && (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderBadgeText}>Group Leader</Text>
            </View>
          )}
        </View>
      </View>
    );
  };


  return (
    <BlurTargetView style={styles.container} ref={contentRef}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Current version: {latestSubmission?.version || 'v1'}</Text>
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>{project.status || 'Draft'}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'research' && (
          <>
            {/* Card 1: Details */}
            <View style={styles.card}>
          <Text style={styles.projectTitle}>{project.title || 'Untitled Project'}</Text>
          <Text style={styles.projectAbstract}>
            {project.abstract || 'A study on how AI tools affect student learning outcomes.'}
          </Text>
          <View style={styles.divider} />
          <View style={styles.tagsContainer}>
            {keywords.map((kw: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{kw}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Card 2: Latest Submission */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Latest submission</Text>
          
          {!latestSubmission ? (
            <View style={styles.emptySubmission}>
               <View style={styles.emptyIconPlaceholder}>
                 <FileText size={48} color="#E5E7EB" />
               </View>
               <Text style={styles.emptyTitle}>No research documents yet</Text>
               <Text style={styles.emptySub}>Submit your first research document to get started.</Text>
               <TouchableOpacity style={styles.submitBtn} onPress={handleOpenModal}>
                 <Plus size={16} color="white" style={{ marginRight: 6 }} />
                 <Text style={styles.submitBtnText}>Submit document</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.submissionContent}>
               <TouchableOpacity activeOpacity={0.7} onPress={() => handleOpenVersionModal(latestSubmission)}>
                 <DocumentItem submission={latestSubmission} noMargin={true} />
               </TouchableOpacity>

               <Text style={[styles.feedbackLabel, { marginTop: 12, marginBottom: 6 }]}>Adviser's Feedback:</Text>
               <View style={styles.feedbackBox}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                   <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FEE2E2' }}>
                     <Text style={{ fontSize: 10, fontWeight: '600', color: '#DC2626' }}>
                       Revision Required
                     </Text>
                   </View>
                   <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                     {new Date().toLocaleDateString()}
                   </Text>
                 </View>
                 <Text style={styles.feedbackText}>
                   Great start, but the methodology needs more citations and a clearer explanation of the data collection process. Please revise and resubmit.
                 </Text>
               </View>
            </View>
          )}
        </View>

        {/* Section: Recent versions */}
        <View>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent versions</Text>
            <TouchableOpacity onPress={() => setActiveTab('versions')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {!latestSubmission ? (
            <View style={styles.emptyRecentCard}>
              <Text style={styles.emptyRecentText}>Submit your first research document to start tracking versions.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {submissions.slice(0, 3).map((sub: any, index: number) => (
                <VersionItem 
                  key={sub.id} 
                  submission={sub} 
                  isActive={index === 0} 
                  isFirst={index === 0} 
                  isLast={index === Math.min(submissions.length, 3) - 1} 
                />
              ))}
            </View>
          )}
        </View>

          </>
        )}

        {activeTab === 'versions' && (
          <View style={styles.tabContainer}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.tabMainTitle}>Version History</Text>
              {submissions.length > 0 && (
                <View style={styles.membersCountBadge}>
                  <Text style={styles.membersCountText}>{submissions.length} versions</Text>
                </View>
              )}
            </View>
            
            {submissions.length === 0 ? (
              <View style={styles.emptyTabState}>
                <History size={48} color="#9CA3AF" strokeWidth={1.5} />
                <Text style={styles.emptyTabTitle}>No versions to track yet</Text>
                <Text style={styles.emptyTabSub}>Submit a document to start tracking its versions.</Text>
              </View>
            ) : (
              <View style={styles.timelineWrapper}>
                {submissions.map((sub: any, index: number) => (
                  <VersionItem 
                    key={sub.id} 
                    submission={sub} 
                    isActive={index === 0} 
                    isFirst={index === 0} 
                    isLast={index === submissions.length - 1} 
                  />
                ))}
                
                <View style={styles.noFurtherVersions}>
                  <View style={styles.noFurtherLine} />
                  <Text style={styles.noFurtherText}>No further versions.</Text>
                  <View style={styles.noFurtherLine} />
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabContainer}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.tabMainTitle}>Group members</Text>
              <View style={styles.membersCountBadge}>
                <Text style={styles.membersCountText}>6 members</Text>
              </View>
            </View>
            
            <View style={styles.membersList}>
              <MemberItem name="Juan Delacruz" email="delacruzjuan@gmail.com" initials="JD" isLeader={true} />
              <MemberItem name="Juan Delacruz" email="delacruzjuan@gmail.com" initials="JD" />
              <MemberItem name="Juan Delacruz" email="delacruzjuan@gmail.com" initials="JD" />
              <MemberItem name="Juan Delacruz" email="delacruzjuan@gmail.com" initials="JD" />
              <MemberItem name="Juan Delacruz" email="delacruzjuan@gmail.com" initials="JD" />
              <MemberItem name="Juan Delacruz" email="delacruzjuan@gmail.com" initials="JD" />
            </View>
          </View>
        )}

      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.navPill}>
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'research' && styles.navItemActive]}
            onPress={() => setActiveTab('research')}
          >
            <FileText size={20} color={activeTab === 'research' ? "#2D60E8" : "#6B7280"} strokeWidth={activeTab === 'research' ? 2.5 : 2} />
            <Text style={activeTab === 'research' ? styles.navItemTextActive : styles.navItemText}>Research</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'versions' && styles.navItemActive]}
            onPress={() => setActiveTab('versions')}
          >
            <History size={20} color={activeTab === 'versions' ? "#2D60E8" : "#6B7280"} strokeWidth={activeTab === 'versions' ? 2.5 : 2} />
            <Text style={activeTab === 'versions' ? styles.navItemTextActive : styles.navItemText}>Versions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'members' && styles.navItemActive]}
            onPress={() => setActiveTab('members')}
          >
            <Users size={20} color={activeTab === 'members' ? "#2D60E8" : "#6B7280"} strokeWidth={activeTab === 'members' ? 2.5 : 2} />
            <Text style={activeTab === 'members' ? styles.navItemTextActive : styles.navItemText}>Members</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fabBtn} onPress={handleOpenModal} disabled={submitMutation.isPending}>
          {submitMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Upload size={24} color="#fff" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
      {/* Remarks Modal */}
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
                borderTopLeftRadius: 32, // Force override design token
                borderTopRightRadius: 32, // Force override design token
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
                <Text style={styles.modalTitle}>Submit Document</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.modalClose}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalBody}>
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
                <TouchableOpacity style={styles.modalSelectFileBtn} onPress={handleSelectFile}>
                  <UploadCloud size={24} color="#6B7280" />
                  <Text style={styles.modalSelectFileText}>Tap to select a PDF document</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Remarks (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Add any notes or context about this submission..."
                placeholderTextColor="#9CA3AF"
                value={remarks}
                onChangeText={setRemarks}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalSubmitBtn, !selectedFile && styles.modalSubmitBtnDisabled]}
                  onPress={confirmSubmit}
                  disabled={submitMutation.isPending || !selectedFile}
                >
                  {submitMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={[styles.modalSubmitText, !selectedFile && styles.modalSubmitTextDisabled]}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      {/* Version Details Modal */}
      <Modal 
        visible={isVersionModalVisible} 
        transparent 
        animationType="none" 
        onRequestClose={handleCloseVersionModal}
        onShow={() => createScreenSlideAnimation.open(versionModalSlideAnim)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: versionModalSlideAnim }]}>
          <BlurView 
            intensity={40} 
            tint="dark" 
            style={StyleSheet.absoluteFill}
            blurMethod="dimezisBlurView"
            blurTarget={contentRef}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseVersionModal} />
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
                transform: [{ translateY: versionModalSlideAnim.interpolate(ScreenSlideMotion.interpolation.sheetTranslateY(SCREEN_HEIGHT)) }] 
              }
            ]}
          >
            <View {...versionPanResponder.panHandlers} style={{ backgroundColor: 'transparent' }}>
              <View style={ModalStyles.grabber} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Version {selectedVersion?.version}</Text>
                <TouchableOpacity onPress={handleCloseVersionModal} style={styles.modalClose}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Student's Remarks</Text>
              <View style={styles.feedbackBox}>
                {!selectedVersion?.remarks ? (
                  <Text style={styles.noFeedback}>No remarks provided.</Text>
                ) : (
                  <Text style={styles.feedbackText}>{selectedVersion.remarks}</Text>
                )}
              </View>

              <Text style={[styles.modalLabel, { marginTop: 24 }]}>Adviser's Feedback</Text>
              <View style={styles.feedbackBox}>
                {!selectedVersion?.feedbacks || selectedVersion.feedbacks.length === 0 ? (
                  <Text style={styles.noFeedback}>No feedback from adviser yet.</Text>
                ) : (
                  selectedVersion.feedbacks.map((fb: any) => (
                    <View key={fb.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ backgroundColor: fb.decision === 'Approved' ? '#ECFDF5' : '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: fb.decision === 'Approved' ? '#D1FAE5' : '#FEE2E2' }}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: fb.decision === 'Approved' ? '#059669' : '#DC2626' }}>
                            {fb.decision}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.feedbackText}>{fb.comments}</Text>
                    </View>
                  ))
                )}
              </View>
              
              <View style={[styles.modalFooter, { marginTop: 32 }]}>
                <TouchableOpacity 
                  style={styles.modalSubmitBtn}
                  onPress={() => handleViewDocument(selectedVersion)}
                >
                  <Text style={styles.modalSubmitText}>View Document</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
      </SafeAreaView>
    </BlurTargetView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF1F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDF1F5' },
  errorText: { color: 'red', fontFamily: 'Manrope_600SemiBold', marginBottom: 16 },
  backBtnError: { backgroundColor: '#2D60E8', padding: 12, borderRadius: 8 },
  backBtnErrorText: { color: 'white', fontFamily: 'Manrope_700Bold' },
  
  devToggle: { position: 'absolute', top: 50, right: 20, zIndex: 100, backgroundColor: 'black', padding: 8, borderRadius: 8 },
  devToggleText: { color: 'white', fontSize: 10, fontFamily: 'Manrope_700Bold' },

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: '#6B7280' },
  draftBadge: { backgroundColor: '#DFE4EA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  draftText: { color: '#64748B', fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140, gap: 16, flexGrow: 1 },
  
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderHairline
  },
  
  projectTitle: { fontFamily: 'Manrope_700Bold', fontSize: 17, color: '#111827', marginBottom: 8 },
  projectAbstract: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#6B7280', lineHeight: 22 },
  
  divider: { height: 1, backgroundColor: Colors.borderHairline, marginVertical: 16 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  tagText: { color: '#475569', fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  
  sectionTitle: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#6B7280', marginBottom: 16 },
  
  // Empty State
  emptySubmission: { alignItems: 'center', paddingVertical: 10 },
  emptyIconPlaceholder: { marginBottom: 16, opacity: 0.7 },
  emptyTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#111827', marginBottom: 8 },
  emptySub: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  submitBtn: { backgroundColor: '#2D60E8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  submitBtnText: { color: '#fff', fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  
  // Doc Item
  submissionContent: { marginTop: -4 },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 16 },
  docItemGray: { backgroundColor: '#F8FAFC', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  docItemWhite: { backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  pdfIconContainer: { width: 36, height: 40, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pdfBadge: { position: 'absolute', bottom: 4, backgroundColor: '#EF4444', paddingHorizontal: 4, borderRadius: 2 },
  pdfBadgeText: { color: '#fff', fontSize: 7, fontFamily: 'Manrope_700Bold' },
  docInfo: { flex: 1 },
  docName: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#111827', marginBottom: 2 },
  docSubmitter: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#9CA3AF' },
  eyeBtn: { padding: 4 },
  
  // Feedback
  feedbackLabel: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#6B7280', marginBottom: 10 },
  feedbackBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, minHeight: 80, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  noFeedback: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  feedbackText: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#475569', lineHeight: 22 },
  
  // Recent Versions (in Research tab)
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 4, marginBottom: 16 },
  recentTitle: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#6B7280' },
  viewAll: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#2D60E8' },
  
  emptyRecentCard: { backgroundColor: '#fff', padding: 24, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline, alignItems: 'center' },
  emptyRecentText: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  
  // Timeline (Used in both)
  timeline: { marginTop: 12 },
  timelineItemNew: {
    position: 'relative',
    paddingLeft: 44,
    marginBottom: 12, // reduced spacing between items
  },
  timelineLineContinuous: {
    position: 'absolute',
    left: 16,
    top: -12, // match marginBottom to connect items
    bottom: 0,
    width: 1,
    backgroundColor: '#CBD5E1',
    zIndex: 1,
  },
  timelineDateNew: {
    fontFamily: 'Manrope_600SemiBold', // increased font weight
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  timelineCardWrapperNew: {
    position: 'relative',
    justifyContent: 'center',
    zIndex: 2,
  },
  versionCircleNew: {
    position: 'absolute',
    left: -44, // puts the 32px circle's center exactly at x=16 (left: -44 relative to x=44 padding)
    top: '50%', // vertically aligned to center of the CARD
    marginTop: -16, // half height
    width: 32, // slightly increased size
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  versionCircleActive: {
    backgroundColor: '#CBD5E1',
    borderWidth: 0,
  },
  versionTextNew: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
  },
  versionTextActive: {
    color: '#fff',
  },
  
  // Versions Tab
  tabContainer: { flex: 1 },
  tabHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  tabMainTitle: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#111827' },
  emptyTabState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyTabTitle: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyTabSub: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  
  // Member List Styles
  membersCountBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  membersCountText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: '#64748B' },
  membersList: { paddingHorizontal: 4, gap: 8 },
  memberCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  memberCardLeader: { borderWidth: 0 },
  memberContent: { flexDirection: 'row', alignItems: 'center', padding: 16, zIndex: 10 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  memberAvatarLeader: { backgroundColor: '#fff' },
  memberAvatarNormal: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  memberInitials: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  memberInitialsLeader: { color: '#111827' },
  memberInitialsNormal: { color: '#111827' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#111827', marginBottom: 2 },
  memberNameLeader: { color: '#fff' },
  memberEmail: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#6B7280' },
  memberEmailLeader: { color: 'rgba(255,255,255,0.8)' },
  leaderBadge: { backgroundColor: '#FDE047', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  leaderBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#111827' },
  
  timelineWrapper: { paddingHorizontal: 4 },
  noFurtherVersions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 40 },
  noFurtherLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  noFurtherText: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#9CA3AF', paddingHorizontal: 12 },
  
  // Floating Nav
  floatingNavContainer: {
    position: 'absolute',
    bottom: 32, // Floating height
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50, // ensures it sits above scroll content
  },
  navPill: {
    flex: 1,
    height: 72,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderHairline,
    // Ultra-soft colored outer glow
    shadowColor: '#94A3B8', // Soft slate color instead of harsh black
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navItemActive: {
    backgroundColor: '#EEF2FF', // subtle light blue tint
    borderRadius: 60,
  },
  navItemTextActive: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#2D60E8'
  },
  navItemText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#6B7280'
  },
  fabBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2D60E8',
    borderWidth: 1,
    borderColor: 'rgba(92, 136, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D60E8',
    shadowOffset: { width: 0, height: 0 }, // Center the shadow for a glow effect
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8, // Higher elevation for glow on Android
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0', marginBottom: 16 },
  modalTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#111827' },
  modalClose: { padding: 4, backgroundColor: '#F3F4F6', borderRadius: 20 },
  modalBody: { paddingBottom: 24 }, // Kept sensible padding for the inner body
  modalLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#475569', marginBottom: 8 },
  
  modalSelectFileBtn: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 12 },
  modalSelectFileText: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#6B7280' },
  
  modalFileItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 12, marginBottom: 24 },
  modalFileName: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#2D60E8', marginLeft: 8, flex: 1 },
  modalChangeFileBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 8 },
  modalChangeFileText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: '#2D60E8' },
  
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, minHeight: 120, fontFamily: 'Manrope_400Regular', fontSize: 15, color: '#111827', marginBottom: 24 },
  
  modalFooter: { flexDirection: 'row', gap: 12 },
  modalSubmitBtn: { flex: 1, backgroundColor: '#2D60E8', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  modalSubmitBtnDisabled: { backgroundColor: '#94A3B8' },
  modalSubmitText: { color: '#fff', fontFamily: 'Manrope_600SemiBold', fontSize: 15 },
  modalSubmitTextDisabled: { color: '#F1F5F9' }
});
