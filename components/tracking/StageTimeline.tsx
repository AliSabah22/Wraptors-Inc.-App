import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceStage } from '@/types';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { formatDate } from '@/utils/helpers';

interface StageTimelineProps {
  stages: ServiceStage[];
}

export function StageTimeline({ stages }: StageTimelineProps) {
  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const isCompleted = stage.status === 'completed';
        const isInProgress = stage.status === 'in_progress';
        const isPending = stage.status === 'pending';
        const isLast = index === stages.length - 1;

        return (
          <View key={stage.id} style={styles.stageRow}>
            {/* Timeline column */}
            <View style={styles.timelineCol}>
              {/* Circle indicator */}
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isInProgress && styles.circleInProgress,
                  isPending && styles.circlePending,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={12} color={Colors.background} />
                )}
                {isInProgress && (
                  <View style={styles.pulsingDot} />
                )}
              </View>
              {/* Connecting line */}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Content column */}
            <View style={[styles.content, !isLast && styles.contentWithMargin]}>
              <View style={styles.stageHeader}>
                <Text
                  style={[
                    styles.stageName,
                    isCompleted && styles.stageNameCompleted,
                    isInProgress && styles.stageNameActive,
                    isPending && styles.stageNamePending,
                  ]}
                >
                  {stage.name}
                </Text>
                <Text style={styles.percent}>{stage.progressPercent}%</Text>
              </View>

              {isInProgress && (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeLabel}>In Progress</Text>
                </View>
              )}

              {stage.completedAt && isCompleted && (
                <Text style={styles.timestamp}>
                  Completed {formatDate(stage.completedAt)}
                </Text>
              )}

              {(isCompleted || isInProgress) && stage.technicianNote && (
                <View style={styles.noteBox}>
                  <Ionicons name="chatbubble-outline" size={11} color={Colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.noteText} numberOfLines={isInProgress ? undefined : 2}>
                    {stage.technicianNote}
                  </Text>
                </View>
              )}

              {/* Media placeholders for completed/active stages */}
              {(isCompleted || isInProgress) && stage.mediaPlaceholders.length > 0 && (
                <View style={styles.mediaRow}>
                  {stage.mediaPlaceholders.slice(0, 3).map((m) => (
                    <View key={m.id} style={styles.mediaThumb}>
                      <Ionicons
                        name={m.type === 'video' ? 'videocam' : 'image-outline'}
                        size={14}
                        color={Colors.textMuted}
                      />
                    </View>
                  ))}
                  {stage.mediaPlaceholders.length > 3 && (
                    <View style={styles.mediaThumb}>
                      <Text style={styles.mediaMore}>+{stage.mediaPlaceholders.length - 3}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: Spacing.xs,
  },
  stageRow: {
    flexDirection: 'row',
  },
  timelineCol: {
    width: 32,
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  circleCompleted: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  circleInProgress: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  circlePending: {
    backgroundColor: Colors.backgroundElevated,
    borderColor: Colors.border,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: Colors.border,
    marginTop: 2,
  },
  lineCompleted: {
    backgroundColor: Colors.goldDark,
  },
  content: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingTop: 1,
  },
  contentWithMargin: {
    paddingBottom: Spacing.xl,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    flex: 1,
    lineHeight: 22,
  },
  stageNameCompleted: {
    color: Colors.textSecondary,
  },
  stageNameActive: {
    color: Colors.gold,
  },
  stageNamePending: {
    color: Colors.textDisabled,
  },
  percent: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
    marginLeft: Spacing.sm,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  activeLabel: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 3,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.goldDark,
  },
  noteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    lineHeight: 17,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  mediaThumb: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaMore: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.semibold,
  },
});
