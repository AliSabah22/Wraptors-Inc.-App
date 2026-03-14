import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, GradientColors } from '@/constants/theme';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Button } from '@/components/ui/Button';
import { MembershipBadge } from '@/components/ui/MembershipBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { MOCK_MEMBERSHIP_PLANS } from '@/data/mockData';
import { Vehicle } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isGuest, isAuthenticated, updateUser, logout } = useAuthStore();
  const { tier } = useMembershipAccess();
  const nextPlan = MOCK_MEMBERSHIP_PLANS.find((p) =>
    p.tier === (tier === 'standard' ? 'gold' : tier === 'gold' ? 'platinum' : null)
  );

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const toggleNotif = (key: keyof NonNullable<typeof user>['notificationPreferences']) => {
    if (!user) return;
    updateUser({
      notificationPreferences: {
        ...user.notificationPreferences,
        [key]: !user.notificationPreferences[key],
      },
    });
  };

  if (isGuest || !isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <EmptyState
          icon="person-circle-outline"
          title="Not Signed In"
          message="Sign in to view your profile, manage vehicles, and access all member features."
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)/phone-login')}
        />
      </View>
    );
  }

  const notifPrefs = user!.notificationPreferences;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn} hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
      <GoldDivider />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <LinearGradient colors={GradientColors.card} style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {user!.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberBadgeWrap}>
              <MembershipBadge tier={user!.membershipTier} showLabel={false} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user!.name}</Text>
            <Text style={styles.profilePhone}>{user!.phone}</Text>
            <Text style={styles.profileEmail}>{user!.email}</Text>
            <View style={styles.profileBadgeRow}>
              <MembershipBadge tier={user!.membershipTier} />
              {user!.membershipExpiry && (
                <Text style={styles.expiryText}>
                  Valid: {new Date(user!.membershipExpiry).getFullYear()}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/contact/' as any)}>
            <Ionicons name="create-outline" size={16} color={Colors.gold} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/tracking')}>
            <Text style={styles.statValue}>{user!.vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/history/')}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Services Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/members/' as any)}>
            <Text style={styles.statValueSmall} numberOfLines={1} adjustsFontSizeToFit>{user!.referralCode}</Text>
            <Text style={styles.statLabel}>Referral Code</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity style={styles.addVehicleBtn}>
              <Ionicons name="add" size={16} color={Colors.gold} />
              <Text style={styles.addVehicleText}>Add</Text>
            </TouchableOpacity>
          </View>
          {user!.vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
          {user!.vehicles.length === 0 && (
            <Text style={styles.emptyText}>No vehicles added yet. Tap "Add" to add your first vehicle.</Text>
          )}
        </View>

        {/* Notification preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.notifCard}>
            <NotifToggle
              label="Service Updates"
              desc="Progress updates on active jobs"
              value={notifPrefs.serviceUpdates}
              onToggle={() => toggleNotif('serviceUpdates')}
            />
            <NotifToggle
              label="Promotions"
              desc="Member offers and deals"
              value={notifPrefs.promotions}
              onToggle={() => toggleNotif('promotions')}
            />
            <NotifToggle
              label="News & Updates"
              desc="Shop news and articles"
              value={notifPrefs.news}
              onToggle={() => toggleNotif('news')}
            />
            <NotifToggle
              label="Emergency Alerts"
              desc="Urgent service notifications"
              value={notifPrefs.emergencyAlerts}
              onToggle={() => toggleNotif('emergencyAlerts')}
              last
            />
          </View>
        </View>

        {/* Account actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.actionList}>
            <ActionRow icon="time-outline" label="Service History" onPress={() => router.push('/history/')} />
            <ActionRow icon="star-outline" label="Members Perks" onPress={() => router.push('/members/' as any)} />
            <ActionRow icon="help-circle-outline" label="Contact Support" onPress={() => router.push('/contact/' as any)} />
            <ActionRow icon="document-text-outline" label="Terms & Privacy" onPress={() => {}} />
          </View>
        </View>

        {/* Membership upgrade CTA */}
        {nextPlan && (
          <TouchableOpacity
            onPress={() => router.push('/upgrade' as any)}
            activeOpacity={0.85}
            style={styles.upgradeCard}
          >
            <LinearGradient colors={['#1C1400', '#181200']} style={styles.upgradeCardInner}>
              <View style={styles.upgradeLeft}>
                <Ionicons name="arrow-up-circle-outline" size={20} color={Colors.gold} />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>Upgrade to {nextPlan.name}</Text>
                  <Text style={styles.upgradeSub}>${nextPlan.price}/yr · {nextPlan.benefits.length} perks included</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Sign out */}
        <Button
          label="Sign Out"
          variant="danger"
          onPress={handleLogout}
          style={{ marginTop: Spacing.sm }}
        />

        <Text style={styles.versionText}>Wraptors Inc. v1.0.0 — MVP Build</Text>
      </ScrollView>
    </View>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleIcon}>
        <Ionicons name="car-sport" size={22} color={Colors.gold} />
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <Text style={styles.vehicleDetail}>
          {vehicle.color} · {vehicle.licensePlate}
        </Text>
      </View>
      <TouchableOpacity hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function NotifToggle({ label, desc, value, onToggle, last = false }: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <View style={[notifStyles.row, !last && notifStyles.rowBorder]}>
      <View style={notifStyles.textCol}>
        <Text style={notifStyles.label}>{label}</Text>
        <Text style={notifStyles.desc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.goldDark }}
        thumbColor={value ? Colors.gold : Colors.textMuted}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

function ActionRow({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={actionStyles.row} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.textMuted} />
      <Text style={actionStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const notifStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  textCol: { flex: 1 },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    marginBottom: 2,
  },
  desc: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
});

const actionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    letterSpacing: Typography.tight,
  },
  settingsBtn: { padding: 4 },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.base,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.goldMuted,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.gold,
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
  },
  memberBadgeWrap: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  profilePhone: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  profileEmail: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  expiryText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  editBtnText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  statValue: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  statValueSmall: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: Typography.bold,
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  section: { gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  addVehicleText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    flexShrink: 0,
  },
  vehicleInfo: { flex: 1, gap: 3 },
  vehicleName: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  vehicleDetail: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  notifCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  actionList: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  versionText: {
    color: Colors.textDisabled,
    fontSize: Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  upgradeCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  upgradeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  upgradeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  upgradeText: { flex: 1 },
  upgradeTitle: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  upgradeSub: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 2,
  },
});
