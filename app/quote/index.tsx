import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { useAuthStore } from '@/store/authStore';
import { useQuoteStore } from '@/store/quoteStore';
import { ServiceCategory } from '@/types';

const SERVICE_CATEGORIES: { label: string; value: ServiceCategory }[] = [
  { label: 'Full Color Change Wrap', value: 'full_wrap' },
  { label: 'Paint Protection Film (PPF)', value: 'ppf' },
  { label: 'Ceramic Coating', value: 'ceramic_coating' },
  { label: 'Chrome Delete', value: 'chrome_delete' },
  { label: 'Window Tint', value: 'tint' },
  { label: 'Premium Detailing', value: 'detailing' },
  { label: 'Custom Design', value: 'custom' },
];

export default function QuoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const { user } = useAuthStore();
  const { submitQuote, isSubmitting } = useQuoteStore();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    vehicleInfo: '',
    serviceDetails: '',
    additionalInfo: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(
    params.service ? [params.service as ServiceCategory] : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState('');

  const toggleCategory = (cat: ServiceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setErrors((e) => ({ ...e, category: '' }));
  };

  const updateField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.vehicleInfo.trim()) newErrors.vehicleInfo = 'Vehicle info is required';
    if (selectedCategories.length === 0) newErrors.category = 'Please select at least one service';
    if (!form.serviceDetails.trim()) newErrors.serviceDetails = 'Service details are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const id = await submitQuote({
      name: form.name,
      email: form.email,
      phone: form.phone,
      vehicleInfo: form.vehicleInfo,
      serviceCategories: selectedCategories,
      serviceDetails: form.serviceDetails,
      additionalInfo: form.additionalInfo,
      imageUris: [],
      userId: user?.id,
    });

    setQuoteId(id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Quote Submitted" showBack={false} />
        <View style={styles.successState}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Quote Submitted!</Text>
          <Text style={styles.successMessage}>
            Thank you, {form.name.split(' ')[0]}. We've received your quote request and will get back to you within 24 hours.
          </Text>
          <View style={styles.refCard}>
            <Text style={styles.refLabel}>Reference Number</Text>
            <Text style={styles.refValue}>{quoteId.replace('quote-', 'WRP-Q-').toUpperCase()}</Text>
          </View>
          <Button
            label="Back to Home"
            onPress={() => router.replace('/(tabs)/' as any)}
            style={{ marginTop: Spacing.lg }}
          />
          <Button
            label="Submit Another Quote"
            variant="ghost"
            onPress={() => {
              setSubmitted(false);
              setForm({ name: '', email: '', phone: '', vehicleInfo: '', serviceDetails: '', additionalInfo: '' });
              setSelectedCategories([]);
            }}
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
        <ScreenHeader title="Free Quote" subtitle="Get a personalized estimate" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Ionicons name="document-text-outline" size={22} color={Colors.gold} />
            <Text style={styles.introText}>
              Fill out this form and we'll provide a detailed, no-obligation quote tailored to your vehicle and service needs.
            </Text>
          </View>

          {/* Contact info */}
          <Text style={styles.sectionTitle}>Your Information</Text>
          <Input
            label="Full Name"
            placeholder="Alex Harrington"
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            error={errors.name}
            leftIcon="person-outline"
          />
          <Input
            label="Email Address"
            placeholder="alex@example.com"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            error={errors.phone}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          {/* Vehicle */}
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <Input
            label="Vehicle Information"
            placeholder="e.g. 2023 Porsche 911 Turbo S, Guards Red"
            value={form.vehicleInfo}
            onChangeText={(v) => updateField('vehicleInfo', v)}
            error={errors.vehicleInfo}
            leftIcon="car-outline"
          />

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          {/* Service category */}
          <View style={styles.serviceTitleRow}>
            <Text style={styles.sectionTitle}>Service Type</Text>
            {selectedCategories.length > 0 && (
              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>{selectedCategories.length} selected</Text>
              </View>
            )}
          </View>
          <Text style={styles.serviceHint}>Select all services you're interested in</Text>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.value);
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  onPress={() => toggleCategory(cat.value)}
                >
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={14} color={Colors.gold} />
                  )}
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <GoldDivider style={{ marginVertical: Spacing.base }} />

          {/* Service details */}
          <Text style={styles.sectionTitle}>Service Details</Text>
          <Input
            label="What would you like done?"
            placeholder="Describe the service, any specific requests, current condition of the vehicle, etc."
            value={form.serviceDetails}
            onChangeText={(v) => updateField('serviceDetails', v)}
            error={errors.serviceDetails}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
          <Input
            label="Additional Notes (Optional)"
            placeholder="Any other information we should know"
            value={form.additionalInfo}
            onChangeText={(v) => updateField('additionalInfo', v)}
          />

          {/* Mock image attach */}
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="camera-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.attachText}>Attach Photos (Optional)</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textDisabled} />
          </TouchableOpacity>

          <Button
            label="Submit Quote Request"
            onPress={handleSubmit}
            loading={isSubmitting}
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />

          <Text style={styles.disclaimer}>
            By submitting this form you agree to be contacted by Wraptors Inc. regarding your quote request.
          </Text>
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
  intro: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  introText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
    borderWidth: 1.5,
  },
  categoryChipText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  categoryChipTextActive: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCount: {
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  selectedCountText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  serviceHint: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginBottom: Spacing.sm,
    marginTop: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.xs,
    marginBottom: Spacing.sm,
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
    marginBottom: Spacing.lg,
  },
  attachText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  disclaimer: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 16,
  },
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  successIcon: {
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
    textAlign: 'center',
  },
  successMessage: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  refCard: {
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    width: '100%',
    gap: Spacing.xs,
  },
  refLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
  },
  refValue: {
    color: Colors.gold,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    letterSpacing: Typography.wider,
  },
});
