import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useUserStore } from "@/store/userStore";

const Profile = () => {
  const router = useRouter();
  const loginUser = useUserStore((s) => s.user);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <Image
          source={{
            uri: `https://api.dicebear.com/10.x/adventurer-neutral/png?seed=${loginUser.name}`,
          }}
          style={styles.avatar}
        />

        <Text style={styles.fullName}>{loginUser.name}</Text>
        <Text style={styles.username}>@{loginUser.id}</Text>
      </View>

      {/* ===== Menu ===== */}
      <View style={styles.menu}>
        <MenuItem
          icon={<MaterialIcons name="vpn-key" size={22} color="#4F46E5" />}
          label="Get Encryption Key"
          onPress={() => router.push("/viewKey")}
        />

        <MenuItem
          icon={<Ionicons name="lock-closed" size={22} color="#059669" />}
          label="Create Private Chat"
          onPress={() => router.push("/createRoom")}
        />

        <MenuItem
          icon={<Ionicons name="enter" size={22} color="#0EA5E9" />}
          label="Join Private Chat"
          onPress={() => router.push("/joinRoom")}
        />

        <MenuItem
          icon={<FontAwesome name="sign-out" size={22} color="#DC2626" />}
          label="Logout"
          danger
          onPress={() => router.push("/logout")}
        />
      </View>
    </View>
  );
};

export default Profile;

/* ===== Menu Item ===== */
const MenuItem = ({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.dangerItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        {icon}
        <Text style={[styles.menuText, danger && styles.dangerText]}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

/* ===== Styles (Light Theme) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    alignItems: "center",
    paddingVertical: 36,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  username: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  menu: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  dangerItem: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF1F2",
  },
  dangerText: {
    color: "#DC2626",
  },
});
