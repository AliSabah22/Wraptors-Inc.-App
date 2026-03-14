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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoldDivider } from '@/components/ui/GoldDivider';

const BUSINESS_HOURS = [
  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM – 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleCall = () => Linking.openURL('tel:+15559010011');
  const handleEmail = () => Linking.openURL('mailto:hello@wraptorsinc.com');
  const handleAddress = () => Linking.openURL('https://maps.apple.com/?q=Wraptors+Inc');

  const handleSend = async () => {
    if (!name.trim() || !message.trim()) return;
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScreenHeader title="Contact Us" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Quick contact buttons */}
          <View style={styles.quickContact}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <View style={styles.contactBtnIcon}>
                <Ionicons name="call" size={20} color={Colors.gold} />
              </View>
              <Text style={styles.contactBtnLabel}>Call</Text>
              <Text style={styles.contactBtnValue}>+1 (555) 901-0011</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
              <View style={styles.contactBtnIcon}>
                <Ionicons name="mail" size={20} color={Colors.gold} />
              </View>
              <Text style={styles.contactBtnLabel}>Email</Text>
              <Text style={styles.contactBtnValue}>hello@wraptorsinc.com</Text>
            </TouchableOpacity>
          </View>

          {/* Address */}
          <TouchableOpacity style={styles.addressCard} onPress={handleAddress}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={20} color={Colors.gold} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressTitle}>Visit Our Shop</Text>
                <Text style={styles.addressLine}>4850 West Performance Blvd</Text>
                <Text style={styles.addressLine}>Suite 110, Los Angeles, CA 90007</Text>
              </View>
              <Ionicons name="map-outline" size={18} color={Colors.gold} />
            </View>
          </TouchableOpacity>

          {/* Map placeholder */}
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.mapText}>Interactive map coming in v2</Text>
            <TouchableOpacity style={styles.mapBtn} onPress={handleAddress}>
              <Text style={styles.mapBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>

          <GoldDivider />

          {/* Business hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Hours</Text>
            {BUSINESS_HOURS.map((item) => (
              <View key={item.day} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{item.day}</Text>
                <Text style={[
                  styles.hoursTime,
                  item.hours === 'Closed' && styles.hoursClosed,
                ]}>
                  {item.hours}
                </Text>
              </View>
            ))}
          </View>

          <GoldDivider />

          {/* Contact form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send a Message</Text>

            {sent && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.successText}>Message sent! We'll get back to you soon.</Text>
              </View>
            )}

            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              leftIcon="person-outline"
            />
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Message"
              placeholder="How can we help you?"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            <Button
              label="Send Message"
              onPress={handleSend}
              disabled={!name.trim() || !message.trim()}
            />
          </View>

          {/* Social */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialRow}>
              {[
                { icon: 'logo-instagram' as const, label: '@wraptorsinc' },
                { icon: 'logo-facebook' as const, label: 'Wraptors Inc.' },
                { icon: 'logo-youtube' as const, label: 'Wraptors Inc.' },
              ].map((s) => (
                <TouchableOpacity key={s.icon} style={styles.socialBtn}>
                  <Ionicons name={s.icon} size={18} color={Colors.gold} />
                  <Text style={styles.socialLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  quickContact: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: 4,
  },
  contactBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  contactBtnLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textTransform: 'uppercase',
    letterSpacing: Typography.wide,
  },
  contactBtnValue: {
    color: Colors.textPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addressInfo: { flex: 1 },
  addressTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    marginBottom: 3,
  },
  addressLine: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    lineHeight: 17,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  mapText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  mapBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  mapBtnText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hoursDay: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  hoursTime: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  hoursClosed: {
    color: Colors.textMuted,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successMuted,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.sm,
    flex: 1,
  },
  socialSection: { gap: Spacing.sm },
  socialTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialLabel: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
});
