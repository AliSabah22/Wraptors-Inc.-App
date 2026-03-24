// app/verify.tsx — TEMPORARY, delete after verification
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/lib/auth/context';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function VerifyScreen() {
  const { supabaseUser } = useSupabaseAuth();
  const { user: zustandUser } = useAuthStore();
  const [results, setResults] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const r: Record<string, string> = {};

    // Config check
    r['supabase_configured'] = isSupabaseConfigured ? '✅ configured' : '❌ missing env vars';

    // Auth checks
    r['supabase_session'] = supabaseUser
      ? `✅ ${supabaseUser.email}`
      : '⚠️ no session — sign in via Email login screen';
    r['zustand_user'] = zustandUser
      ? `✅ ${zustandUser.name} (${zustandUser.membershipTier})`
      : '❌ not logged in — open app and sign in';

    if (!isSupabaseConfigured) {
      setResults(r);
      setRunning(false);
      return;
    }

    // Table access checks (our actual table names)
    const tables = [
      'profiles',
      'vehicles',
      'service_jobs',
      'quote_requests',
      'campaigns',
      'app_notifications',
      'services',
    ];

    for (const table of tables) {
      try {
        const { error, count } = await (supabase as any)
          .from(table)
          .select('*', { count: 'exact', head: true });
        r[`table_${table}`] = error
          ? `❌ ${error.message}`
          : `✅ (${count ?? 0} rows)`;
      } catch (e: any) {
        r[`table_${table}`] = `❌ exception: ${e?.message}`;
      }
    }

    const userId = supabaseUser?.id ?? zustandUser?.id;

    // Profile check
    if (userId) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();
        r['profile_row'] = error
          ? `❌ ${error.message}`
          : `✅ ${(profile as any)?.full_name ?? '(no name)'}`;
      } catch (e: any) {
        r['profile_row'] = `❌ ${e?.message}`;
      }
    }

    // Jobs for this user
    if (userId) {
      try {
        const { data: jobs, error } = await (supabase as any)
          .from('service_jobs')
          .select('id, status')
          .eq('customer_id', userId);
        r['user_jobs'] = error
          ? `❌ ${error.message}`
          : `✅ ${jobs?.length ?? 0} jobs found`;
      } catch (e: any) {
        r['user_jobs'] = `❌ ${e?.message}`;
      }
    }

    // Active campaigns
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: campaigns, error } = await (supabase as any)
        .from('campaigns')
        .select('id, title')
        .eq('status', 'active')
        .gte('end_date', today);
      r['active_campaigns'] = error
        ? `❌ ${error.message}`
        : `✅ ${campaigns?.length ?? 0} active offers`;
    } catch (e: any) {
      r['active_campaigns'] = `❌ ${e?.message}`;
    }

    // Notifications
    if (userId) {
      try {
        const { data: notifs, error } = await (supabase as any)
          .from('app_notifications')
          .select('id, read')
          .eq('customer_id', userId);
        r['notifications'] = error
          ? `❌ ${error.message}`
          : `✅ ${notifs?.length ?? 0} notifications (${notifs?.filter((n: any) => !n.read).length ?? 0} unread)`;
      } catch (e: any) {
        r['notifications'] = `❌ ${e?.message}`;
      }
    }

    // Write test — quote_requests
    if (userId) {
      try {
        const { data: quote, error } = await (supabase as any)
          .from('quote_requests')
          .insert({
            customer_id: userId,
            customer_name: zustandUser?.name ?? 'Verify Test',
            customer_email: zustandUser?.email ?? 'verify@test.com',
            customer_phone: zustandUser?.phone ?? '',
            vehicle_info: 'Verify Test Vehicle',
            service_categories: ['_verify_test'],
            service_details: 'App connection verification — safe to delete',
            source: 'app',
          })
          .select('id')
          .single();

        if (error) {
          r['write_quote'] = `❌ ${error.message}`;
        } else {
          await (supabase as any).from('quote_requests').delete().eq('id', (quote as any).id);
          r['write_quote'] = '✅ write + delete works';
        }
      } catch (e: any) {
        r['write_quote'] = `❌ ${e?.message}`;
      }
    }

    setResults(r);
    setRunning(false);
  };

  const allPassed = Object.keys(results).length > 0 &&
    Object.values(results).every((v) => v.startsWith('✅') || v.startsWith('⚠️'));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.base }}>
        <Text style={{
          fontSize: Typography.xxl,
          fontWeight: Typography.bold,
          color: Colors.gold,
          marginBottom: Spacing.lg,
        }}>
          App Connection Verify
        </Text>

        <TouchableOpacity
          onPress={runTests}
          disabled={running}
          style={{
            backgroundColor: running ? Colors.goldDark : Colors.gold,
            padding: Spacing.md,
            borderRadius: Radius.md,
            alignItems: 'center',
            marginBottom: Spacing.lg,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: Spacing.sm,
          }}
        >
          {running && <ActivityIndicator size="small" color="#000" />}
          <Text style={{ color: '#000', fontWeight: Typography.bold }}>
            {running ? 'Running tests...' : 'Run Connection Tests'}
          </Text>
        </TouchableOpacity>

        {Object.keys(results).length > 0 && (
          <>
            <View style={{
              padding: Spacing.md,
              borderRadius: Radius.md,
              backgroundColor: allPassed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: allPassed ? '#22C55E' : '#EF4444',
              marginBottom: Spacing.lg,
            }}>
              <Text style={{
                color: allPassed ? '#22C55E' : '#EF4444',
                fontWeight: Typography.bold,
                fontSize: Typography.base,
              }}>
                {allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
              </Text>
            </View>

            {Object.entries(results).map(([key, value]) => (
              <View key={key} style={{
                flexDirection: 'row',
                paddingVertical: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: Colors.border,
                gap: 8,
              }}>
                <Text style={{
                  color: Colors.textMuted,
                  fontSize: Typography.sm,
                  flex: 1,
                }}>
                  {key.replace(/_/g, ' ')}
                </Text>
                <Text style={{
                  color: value.startsWith('✅') ? '#22C55E' : value.startsWith('⚠️') ? Colors.gold : '#EF4444',
                  fontSize: Typography.sm,
                  flex: 1.5,
                }}>
                  {value}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
