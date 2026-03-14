import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { useAuthStore } from '@/store/authStore';
import { IssueType } from '@/types';
import { generateId } from '@/utils/helpers';

const ISSUE_TYPES: { label: string; value: IssueType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Wrap Damage', value: 'wrap_damage', icon: 'alert-outline' },
  { label: 'PPF Issue', value: 'ppf_issue', icon: 'shield-outline' },
  { label: 'Paint Chip', value: 'paint_chip', icon: 'color-fill-outline' },
  { label: 'Ceramic Failure', value: 'ceramic_failure', icon: 'diamond-outline' },
  { label: 'Other Issue', value: 'other', icon: 'help-circle-outline' },
];

const EMERGENCY_PHONE = '+15559010011';

export default function EmergencyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [vehicleDesc, setVehicleDesc] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCall = () => {
    Linking.openURL(`tel:${EMERGENCY_PHONE}`);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedIssue) newErrors.issue = 'Please select an issue type';
    if (!vehicleDesc.trim()) newErrors.vehicle = 'Vehicle description is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!contactPhone.trim()) newErrors.phone = 'Contact phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    // FUTURE: POST to emergency endpoint / Supabase
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Request Submitted" showBack={false} />
        <View style={styles.successState}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>We're On It</Text>
          <Text style={styles.successMessage}>
            Your emergency request has been submitted. Our team will contact you within 30 minutes during business hours.
          </Text>

          <TouchableOpacity style={styles.callCard} onPress={handleCall}>
            <LinearGradient colors={['#1C0000', '#111']} style={styles.callCardInner}>
              <Ionicons name="call" size={24} color={Colors.error} />
              <View>
                <Text style={styles.callCardTitle}>Need immediate help?</Text>
                <Text style={styles.callCardSubtitle}>Call our emergency line directly</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.error} />
            </LinearGradient>
          </TouchableOpacity>

          <Button
            label="Back to Home"
            onPress={() => router.replace('/(tabs)/' as any)}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScreenHeader title="Emergency Service" subtitle="Urgent assistance" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Emergency call CTA */}
          <TouchableOpacity onPress={handleCall}>
            <LinearGradient colors={['#1C0000', '#110000']} style={styles.callBanner}>
              <View style={styles.callBannerLeft}>
                <Ionicons name="call" size={22} color={Colors.error} />
                <View>
                  <Text style={styles.callBannerTitle}>Call Emergency Line</Text>
                  <Text style={styles.callBannerNumber}>{EMERGENCY_PHONE}</Text>
                </View>
              </View>
              <View style={styles.callBannerBadge}>
                <Text style={styles.callBannerBadgeText}>CALL NOW</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.orDivider}>
            <GoldDivider width="40%" />
            <Text style={styles.orText}>or submit a request</Text>
            <GoldDivider width="40%" />
          </View>

          {/* Issue type selector */}
          <Text style={styles.sectionTitle}>Issue Type</Text>
          {errors.issue ? <Text style={styles.errorText}>{errors.issue}</Text> : null}
          <View style={styles.issueGrid}>
            {ISSUE_TYPES.map((issue) => (
              <TouchableOpacity
                key={issue.value}
                style={[
                  styles.issueCard,
                  selectedIssue === issue.value && styles.issueCardActive,
                ]}
                onPress={() => {
                  setSelectedIssue(issue.value);
                  setErrors((e) => ({ ...e, issue: '' }));
                }}
              >
                <Ionicons
                  name={issue.icon}
                  size={20}
                  color={selectedIssue === issue.value ? Colors.error : Colors.textMuted}
                />
                <Text style={[
                  styles.issueLabel,
                  selectedIssue === issue.value && styles.issueLabelActive,
                ]}>
                  {issue.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          {/* Vehicle & description */}
          <Input
            label="Vehicle Description"
            placeholder="2023 Porsche 911, Guards Red, license plate XXX-000"
            value={vehicleDesc}
            onChangeText={setVehicleDesc}
            error={errors.vehicle}
            leftIcon="car-outline"
          />
          <Input
            label="Describe the Issue"
            placeholder="Explain what happened and the current condition..."
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
          <Input
            label="Your Contact Number"
            placeholder="+1 (555) 000-0000"
            value={contactPhone}
            onChangeText={setContactPhone}
            error={errors.phone}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />

          {/* Mock image attach */}
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="camera-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.attachText}>Attach Photos of the Issue (Optional)</Text>
          </TouchableOpacity>

          <Button
            label="Submit Emergency Request"
            onPress={handleSubmit}
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  callBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.4)',
    marginBottom: Spacing.sm,
  },
  callBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  callBannerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  callBannerNumber: {
    color: Colors.error,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  callBannerBadge: {
    backgroundColor: Colors.errorMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.4)',
  },
  callBannerBadgeText: {
    color: Colors.error,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  orText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.xs,
  },
  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  issueCard: {
    flexBasis: '48%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  issueCardActive: {
    borderColor: 'rgba(231,76,60,0.6)',
    borderLeftWidth: 3,
    backgroundColor: Colors.errorMuted,
  },
  issueLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    flex: 1,
  },
  issueLabelActive: {
    color: Colors.error,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.base,
    backgroundColor: Colors.backgroundElevated,
    marginTop: Spacing.xs,
  },
  attachText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
  },
  successMessage: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  callCard: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  callCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  callCardTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  callCardSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
});
