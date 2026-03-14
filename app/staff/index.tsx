/**
 * Staff Update Simulation Screen
 *
 * This is the internal/dev simulation screen to prove the end-to-end workflow.
 * In production, this would be a separate staff app or admin dashboard.
 *
 * FUTURE: Replace with a proper admin portal (Next.js + Supabase admin panel
 * or a separate React Native app using the same backend).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useServiceStore } from '@/store/serviceStore';
import { useAuthStore } from '@/store/authStore';
import { ServiceJob, ServiceStage, StageStatus } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GoldDivider } from '@/components/ui/GoldDivider';

export default function StaffDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeJobs, loadJobs, updateStageStatus, advanceToNextStage, addTechnicianNote } = useServiceStore();

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.id) loadJobs(user.id);
    else loadJobs('u1'); // load mock user jobs in staff mode
  }, []);

  const selectedJob = activeJobs.find((j) => j.id === selectedJobId);
  const selectedStage = selectedJob?.stages.find((s) => s.id === selectedStageId);

  const handleAdvanceStage = async () => {
    if (!selectedJobId) return;
    setIsUpdating(true);
    await advanceToNextStage(selectedJobId);
    setIsUpdating(false);
    Alert.alert('Stage Advanced', 'The next service stage is now active.', [{ text: 'OK' }]);
  };

  const handleUpdateStageStatus = async (status: StageStatus) => {
    if (!selectedJobId || !selectedStageId) return;
    setIsUpdating(true);
    await updateStageStatus(selectedJobId, selectedStageId, status, note || undefined);
    setNote('');
    setIsUpdating(false);
    Alert.alert('Updated', `Stage marked as ${status}.`, [{ text: 'OK' }]);
  };

  const handleSaveNote = async () => {
    if (!selectedJobId || !selectedStageId || !note.trim()) return;
    setIsUpdating(true);
    await addTechnicianNote(selectedJobId, selectedStageId, note.trim());
    setNote('');
    setIsUpdating(false);
    Alert.alert('Note Saved', 'Technician note has been saved.', [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Staff Dashboard"
        subtitle="Internal Service Management"
        rightAction={
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>DEV</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Warning banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="construct" size={16} color={Colors.warning} />
          <Text style={styles.warningText}>
            Staff Simulation — This proves the end-to-end service update workflow.
            Updates here reflect immediately in the customer tracking dashboard.
          </Text>
        </View>

        {/* Job selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Active Job</Text>
          {activeJobs.length === 0 ? (
            <Text style={styles.emptyText}>No active jobs. Load mock data by signing in first.</Text>
          ) : (
            activeJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[styles.jobSelectCard, selectedJobId === job.id && styles.jobSelectCardActive]}
                onPress={() => {
                  setSelectedJobId(job.id);
                  setSelectedStageId(null);
                  setNote('');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.jobSelectHeader}>
                  <Text style={styles.jobSelectVehicle}>
                    {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                  </Text>
                  <Badge
                    label={`${job.progressPercent}%`}
                    variant={selectedJobId === job.id ? 'gold' : 'muted'}
                  />
                </View>
                <Text style={styles.jobSelectService}>{job.serviceType}</Text>
                <Text style={styles.jobSelectStage}>Current: {job.currentStageName}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Selected job controls */}
        {selectedJob && (
          <>
            <GoldDivider />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress Overview</Text>
              <View style={styles.progressCard}>
                <ProgressBar percent={selectedJob.progressPercent} height={8} />
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    Stage {selectedJob.stages.filter(s => s.status === 'completed').length} of {selectedJob.stages.length} complete
                  </Text>
                  <TouchableOpacity
                    style={styles.advanceBtn}
                    onPress={handleAdvanceStage}
                    disabled={isUpdating || selectedJob.progressPercent >= 100}
                  >
                    <Ionicons name="play-forward" size={14} color={Colors.background} />
                    <Text style={styles.advanceBtnText}>Advance Stage</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Stage selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Stage to Update</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageScroll}>
                {selectedJob.stages.map((stage) => (
                  <TouchableOpacity
                    key={stage.id}
                    style={[
                      styles.stageChip,
                      stage.status === 'completed' && styles.stageChipCompleted,
                      stage.status === 'in_progress' && styles.stageChipActive,
                      selectedStageId === stage.id && styles.stageChipSelected,
                    ]}
                    onPress={() => setSelectedStageId(stage.id)}
                  >
                    <Text style={[
                      styles.stageChipText,
                      stage.status === 'completed' && styles.stageChipTextCompleted,
                      stage.status === 'in_progress' && styles.stageChipTextActive,
                    ]} numberOfLines={1}>
                      {stage.name}
                    </Text>
                    <Text style={styles.stageChipPercent}>{stage.progressPercent}%</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Stage controls */}
            {selectedStage && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Update: {selectedStage.name}</Text>

                {/* Status buttons */}
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[styles.statusBtn, styles.statusBtnPending]}
                    onPress={() => handleUpdateStageStatus('pending')}
                    disabled={isUpdating}
                  >
                    <Ionicons name="ellipse-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.statusBtnText}>Pending</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusBtn, styles.statusBtnActive]}
                    onPress={() => handleUpdateStageStatus('in_progress')}
                    disabled={isUpdating}
                  >
                    <Ionicons name="play-circle" size={14} color={Colors.gold} />
                    <Text style={[styles.statusBtnText, { color: Colors.gold }]}>In Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusBtn, styles.statusBtnDone]}
                    onPress={() => handleUpdateStageStatus('completed')}
                    disabled={isUpdating}
                  >
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={[styles.statusBtnText, { color: Colors.success }]}>Complete</Text>
                  </TouchableOpacity>
                </View>

                {/* Technician note */}
                <Text style={styles.noteLabel}>TECHNICIAN NOTE</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a technician note for this stage..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={[styles.saveNoteBtn, !note.trim() && styles.saveBtnDisabled]}
                  onPress={handleSaveNote}
                  disabled={!note.trim() || isUpdating}
                >
                  <Ionicons name="save-outline" size={14} color={note.trim() ? Colors.gold : Colors.textMuted} />
                  <Text style={[styles.saveNoteBtnText, !note.trim() && { color: Colors.textMuted }]}>
                    Save Note
                  </Text>
                </TouchableOpacity>

                {/* Media placeholders */}
                <View style={styles.mediaSection}>
                  <Text style={styles.mediaLabel}>MOCK MEDIA UPLOAD</Text>
                  <View style={styles.mediaGrid}>
                    {selectedStage.mediaPlaceholders.map((m) => (
                      <View key={m.id} style={styles.mediaTile}>
                        <Ionicons
                          name={m.type === 'video' ? 'videocam-outline' : 'camera-outline'}
                          size={20}
                          color={Colors.textMuted}
                        />
                        <Text style={styles.mediaTileText}>{m.label}</Text>
                        <Text style={styles.mediaUploadText}>Tap to upload</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* View customer dashboard */}
            <Button
              label="View Customer Tracking Dashboard"
              variant="secondary"
              onPress={() => router.push(`/tracking/${selectedJob.id}` as any)}
              style={{ marginTop: Spacing.base }}
            />
          </>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How This Works</Text>
          <Text style={styles.instructionsText}>
            1. Select a job above{'\n'}
            2. Use "Advance Stage" to move to the next phase{'\n'}
            3. Or select individual stages to update status/notes{'\n'}
            4. Changes instantly reflect in the customer tracking view{'\n'}
            5. In production, this becomes a proper staff admin panel
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  devBadge: {
    backgroundColor: Colors.warningMuted,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  devBadgeText: {
    color: Colors.warning,
    fontSize: 10,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.warningMuted,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(243,156,18,0.3)',
  },
  warningText: {
    flex: 1,
    color: Colors.warning,
    fontSize: Typography.xs,
    lineHeight: 17,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  jobSelectCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  jobSelectCardActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldMuted,
  },
  jobSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobSelectVehicle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  jobSelectService: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  jobSelectStage: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  progressCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  advanceBtnText: {
    color: Colors.background,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  stageScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  stageChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElevated,
    minWidth: 100,
  },
  stageChipCompleted: {
    borderColor: Colors.goldDark,
    backgroundColor: 'rgba(154,122,53,0.1)',
  },
  stageChipActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldMuted,
  },
  stageChipSelected: {
    borderWidth: 2,
  },
  stageChipText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  stageChipTextCompleted: {
    color: Colors.goldDark,
  },
  stageChipTextActive: {
    color: Colors.gold,
  },
  stageChipPercent: {
    color: Colors.textDisabled,
    fontSize: 10,
    marginTop: 1,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statusBtnPending: {
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElevated,
  },
  statusBtnActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
  },
  statusBtnDone: {
    borderColor: 'rgba(46,204,113,0.3)',
    backgroundColor: Colors.successMuted,
  },
  statusBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  noteLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wider,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  noteInput: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  saveBtnDisabled: {
    borderColor: Colors.border,
  },
  saveNoteBtnText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  mediaSection: {
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  mediaLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wider,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  mediaTile: {
    width: 90,
    height: 80,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 3,
  },
  mediaTileText: {
    color: Colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  mediaUploadText: {
    color: Colors.textDisabled,
    fontSize: 8,
  },
  instructionsCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    lineHeight: 18,
  },
});
