import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  Image,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";
import { NavigationBar } from "expo-navigation-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function CameraComp() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const cameraRef = useRef<CameraView>(null);
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission]);

  useEffect(() => {
    NavigationBar.setHidden(true);
    return () => NavigationBar.setHidden(false);
  }, []);

  const handelRotateCamera = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  const handelFlash = () => {
    setFlash(flash === "on" ? "off" : "on");
  };

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({
      shutterSound: true,
      quality: 1,
    });
    setImage(photo?.uri || "");
  };

  if (!cameraPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A5BA1" />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required.
        </Text>
        <TouchableOpacity
          onPress={requestCameraPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {!image ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
          />

          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={handelFlash} style={styles.iconButton}>
              <Ionicons
                name={flash === "on" ? "flash" : "flash-off"}
                size={28}
                color={flash === "on" ? "#FFD700" : "#333"}
              />
            </TouchableOpacity>

            <View style={styles.shutterOuter}>
              <TouchableOpacity
                style={styles.shutterInner}
                onPress={takePhoto}
              />
            </View>

            <TouchableOpacity
              onPress={handelRotateCamera}
              style={styles.iconButton}
            >
              <Ionicons name="camera-reverse" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // --- IMAGE PREVIEW VIEW ---
        <>
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.previewControls}>
            {/* Retake Button */}
            <TouchableOpacity
              onPress={() => setImage("")}
              style={styles.retakeButton}
            >
              <MaterialCommunityIcons
                name="camera-retake"
                size={28}
                color="#4AA153"
              />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            {/* Input Field */}
            <TextInput
              placeholder="Add a title..."
              style={styles.input}
              placeholderTextColor="#999"
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={() => setImage("")}
              style={styles.sendButton}
            >
              <Ionicons name="paper-plane" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Clean light background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  permissionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#4A5BA1",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    height: 120,
    backgroundColor: "#F8F9FA", // Very soft off-white
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC", // Subtle separator
  },
  iconButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5, // Perfect circle
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Shadow
    elevation: 4,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40, // Perfect circle (Fixed from "50%")
    borderWidth: 4,
    borderColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5, // Perfect circle
    backgroundColor: "#333333",
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Android Shadow
    elevation: 8,
  },
  previewContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 20, // Soft rounded corners for the image
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  previewControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    gap: 15,
  },
  retakeButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  retakeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4AA153",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#F4F4F6",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    borderWidth: 0,
  },
  sendButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#4A5BA1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A5BA1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
