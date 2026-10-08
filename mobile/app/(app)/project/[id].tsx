import { View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { Text } from '../../../components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../services/api';
import { Colors } from '../../../constants/designTokens';
import { ArrowLeft, Eye, Plus, FileText } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const projectId = parseInt(id as string, 10);

  // 0 = no submission, 1 = submitted no feedback, 2 = submitted with feedback
  const [testState, setTestState] = useState<0 | 1 | 2>(0);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['paper', projectId],
    queryFn: () => apiService.getPaperById(projectId)
  });

  if (isLoading) {
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

  const DocumentItem = ({ isWhiteBg = false }) => (
    <View style={[styles.docItem, isWhiteBg ? styles.docItemWhite : styles.docItemGray]}>
      <View style={styles.pdfIconContainer}>
        <FileText size={20} color="#DC2626" />
        <View style={styles.pdfBadge}>
          <Text style={styles.pdfBadgeText}>PDF</Text>
        </View>
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName}>Document.pdf</Text>
        <Text style={styles.docSubmitter}>Submitted by: Juan Dela Cruz</Text>
      </View>
      <TouchableOpacity style={styles.eyeBtn}>
        <Eye size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Dev Toggle (Hidden in production) */}
      <TouchableOpacity 
        style={styles.devToggle}
        onPress={() => setTestState((prev) => ((prev + 1) % 3) as 0 | 1 | 2)}
      >
        <Text style={styles.devToggleText}>State: {testState}</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Current version: v1</Text>
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>Draft</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
          
          {testState === 0 ? (
            <View style={styles.emptySubmission}>
               <View style={styles.emptyIconPlaceholder}>
                 <FileText size={48} color="#E5E7EB" />
               </View>
               <Text style={styles.emptyTitle}>No research documents yet</Text>
               <Text style={styles.emptySub}>Submit your first research document to get started.</Text>
               <TouchableOpacity style={styles.submitBtn}>
                 <Plus size={16} color="white" style={{ marginRight: 6 }} />
                 <Text style={styles.submitBtnText}>Submit document</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.submissionContent}>
               <DocumentItem />

               <Text style={styles.feedbackLabel}>Adviser feedback:</Text>
               <View style={styles.feedbackBox}>
                 {testState === 1 ? (
                   <Text style={styles.noFeedback}>No feedback yet.</Text>
                 ) : (
                   <Text style={styles.feedbackText}>
                     lorem ipsum dolor sit amet consectetur adipiscing elit officia nobis anim incididunt voluptatem sint dolor in minim magna et vel deserunt qui eiusmod commodo rerum anim deserunt officia in...
                   </Text>
                 )}
               </View>
            </View>
          )}
        </View>

        {/* Section: Recent versions */}
        <View>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent versions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {testState === 0 ? (
            <View style={styles.emptyRecentCard}>
              <Text style={styles.emptyRecentText}>Submit your first research document to start tracking versions.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              
              {/* Timeline Item 2 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineLine} />
                  <View style={styles.versionCircle}>
                    <Text style={styles.versionText}>v2</Text>
                  </View>
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.timelineDate}>Submitted on Oct 3, 2026</Text>
                  <DocumentItem isWhiteBg={true} />
                </View>
              </View>

              {/* Timeline Item 1 */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.versionCircle}>
                    <Text style={styles.versionText}>v1</Text>
                  </View>
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.timelineDate}>Submitted on Oct 5, 2026</Text>
                  <DocumentItem isWhiteBg={true} />
                </View>
              </View>

            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
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
  
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, gap: 16 },
  
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
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 16 },
  docItemGray: { backgroundColor: '#F8FAFC', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  docItemWhite: { backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline },
  pdfIconContainer: { width: 36, height: 40, backgroundColor: '#FEE2E2', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pdfBadge: { position: 'absolute', bottom: 4, backgroundColor: '#DC2626', paddingHorizontal: 4, borderRadius: 2 },
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
  
  // Recent Versions
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 4, marginBottom: 8 },
  recentTitle: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#6B7280' },
  viewAll: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#2D60E8' },
  
  emptyRecentCard: { backgroundColor: '#fff', padding: 24, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderHairline, alignItems: 'center' },
  emptyRecentText: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  
  // Timeline
  timeline: { marginTop: 4 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { width: 30, alignItems: 'center', marginRight: 12 },
  timelineLine: { width: 1, flex: 1, backgroundColor: '#E5E7EB', position: 'absolute', top: 24, bottom: -24 },
  versionCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginTop: 2, zIndex: 2 },
  versionText: { fontSize: 10, fontFamily: 'Manrope_600SemiBold', color: '#9CA3AF' },
  timelineRight: { flex: 1 },
  timelineDate: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 8, marginTop: 4 }
});
