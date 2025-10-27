// app/(main)/discover/index.tsx
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HeartSync</Text>
      <View style={styles.card}>
        <Image
          source={{ uri: "https://i.imgur.com/FoYhYxU.jpg" }}
          style={styles.image}
        />
        <View style={styles.overlay}>
          <Text style={styles.text}>Swipe right if you like 💕</Text>
          <Text style={styles.text}>Swipe left to pass 👋</Text>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#E0F2FE",
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 60,
    color: "#1E3A8A",
  },
  card: {
    marginTop: 40,
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
