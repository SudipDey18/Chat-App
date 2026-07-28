import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type assetType = {
  lastModified: number;
  mimeType: string;
  name: string;
  size: number;
  uri: string;
};

export default function ImagesComp() {
  const [image, setImage] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [assets, setAssets] = useState<assetType[]>([]);
  const [isBigHeight, setIsBigHeight] = useState(false);
  let firstRender = false;

  const { bottom: safeBottom } = useSafeAreaInsets();

  useEffect(() => {
    fileUpload();
  }, []);

  const flatListItem = ({ item }: { item: assetType }) => {
    Image.getSize(
      item.uri,
      (width, height) => {
        setIsBigHeight(width > height ? false : true);
      },
      (error) => {
        error.log("Image height and width fetch failed. file: ImageComp.tsx");
      },
    );
    return (
      <>
        {!firstRender && renderListHeader()}
        <Pressable
          onPress={() => setImage(item.uri)}
          style={styles.thumbnailWrapper}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
          {/* Highlight & Checkmark Overlay */}
          {item.uri === image && (
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={16} color="#f8f8f8" />
            </View>
          )}
        </Pressable>
      </>
    );
  };

  // Button to open Document Picker at the start of the FlatList
  const renderListHeader = () => {
    firstRender = true;
    return (
      <TouchableOpacity onPress={fileUpload} style={styles.addMoreButton}>
        <Ionicons name="add" size={32} color="#4A5BA1" />
      </TouchableOpacity>
    );
  };

  async function fileUpload() {
    // console.log("clicked");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "image/*",
        multiple: true,
      });

      if (!result.canceled) {
        const pickedAssets = result.assets as assetType[];
        // Append new images to existing ones instead of replacing them
        setAssets((prev) => [...pickedAssets, ...prev]);
        if (pickedAssets.length > 0) setImage(pickedAssets[0].uri);

        // const file = new File(asset.uri);
        // console.log(file);

        // const fileName = `${Date.toString()}.pdf`;
        // const destination = new File(Paths.document, fileName);

        // file.copy(destination);
        // console.log(destination.uri);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    console.log(image);
  }, [image]);

  async function deleteImage() {
    const new_assets: assetType[] = assets.filter((item, index) => {
      if (item.uri !== image) return item;
      if (assets.length === 1) {
        setImage("");
      } else {
        setImage(assets[index + 1]?.uri || assets[0]?.uri);
      }
    });
    setAssets(new_assets);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Preview Area */}
      <View style={styles.previewContainer}>
        {image ? (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: image }}
              style={[
                styles.previewImage,
                isBigHeight ? { height: "100%" } : { width: "100%" },
              ]}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderIconCircle}>
              <Ionicons name="images-outline" size={40} color="#4A5BA1" />
            </View>
            <Text style={styles.placeholderTitle}>No Image Selected</Text>
            <Text style={styles.placeholderSubtitle}>
              Tap an image below or add new ones
            </Text>
          </View>
        )}
      </View>

      {assets && (
        <View style={styles.galleryStrip}>
          <FlatList
            data={assets}
            renderItem={flatListItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatlistContent}
          />
        </View>
      )}

      {/* Bottom Controls & Caption Input */}
      <View style={[styles.bottomBar, { paddingBottom: safeBottom || 15 }]}>
        {/* Clear / Trash Button */}
        <TouchableOpacity
          onPress={deleteImage}
          style={[
            styles.iconButtonLightRed,
            { backgroundColor: image ? "#FDECEA" : "#E8E8E8" },
          ]}
        >
          <MaterialCommunityIcons
            name="delete-forever"
            size={25}
            color={image ? "#D9534F" : "gray"}
          />
        </TouchableOpacity>

        {/* Add More Files Button */}
        <TouchableOpacity
          onPress={() => {
            setAssets([]);
            fileUpload();
            setImage("");
          }}
          style={styles.iconButtonLightGreen}
        >
          <MaterialCommunityIcons
            name="image-refresh"
            size={22}
            color="#4AA153"
          />
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="paper-plane" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  previewContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  imageCard: {
    width: "100%",
    height: "100%",
  },
  previewImage: {
    borderRadius: 20,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  placeholderIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8EBF6", // Very soft accent blue
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  galleryStrip: {
    height: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  flatlistContent: {
    paddingHorizontal: 15,
    alignItems: "center",
    gap: 12,
  },
  addMoreButton: {
    width: 70,
    height: 70,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#D0D5DD",
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ECECEC",
  },
  checkmarkCircle: {
    position: "absolute",
    margin: 5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    paddingTop: 10,
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  iconButtonLightRed: {
    width: 48,
    height: 48,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonLightGreen: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: "#E8F5E9", // Very soft green background
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A5BA1", // Primary accent
    justifyContent: "center",
    alignItems: "center",
    // Premium Glow
    shadowColor: "#4A5BA1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
