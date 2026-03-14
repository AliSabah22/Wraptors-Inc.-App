import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  nameActive: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  badge?: number;
}

function TabIcon({ name, nameActive, label, focused, badge }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Ionicons
          name={focused ? nameActive : name}
          size={21}
          color={focused ? Colors.gold : Colors.tabInactive}
        />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom + 4, height: 60 + insets.bottom },
        ],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" nameActive="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="pulse-outline" nameActive="pulse" label="Track" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="car-outline" nameActive="car" label="Services" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="bag-outline"
              nameActive="bag"
              label="Store"
              focused={focused}
              badge={totalItems}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="play-circle-outline"
              nameActive="play-circle"
              label="Media"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-outline" nameActive="person" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 52,
  },
  iconContainer: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: Colors.goldMuted,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.gold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: Typography.bold,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Typography.medium,
    color: Colors.tabInactive,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
});
