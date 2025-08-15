import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Check if running in simulator
const isSimulator = Platform.OS === "ios" && Device.isDevice === false;
console.log("Device.isDevice", Device.isDevice);

async function storeAuthenticatedData(key: string, value: string) {
  try {
    if (isSimulator) {
      Alert.alert(
        "Simulator Detected",
        "Biometric authentication doesn't work in iOS Simulator. Please test on a physical device for full functionality."
      );
      return;
    }

    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: true,
      authenticationPrompt: "Authenticate with passcode to save sensitive data",
      keychainAccessible: SecureStore.WHEN_UNLOCKED, // Requires passcode
    });
    Alert.alert("Success", `Stored ${key} with passcode authentication`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Alert.alert("Error", `Failed to store authenticated data: ${errorMessage}`);
  }
}

async function storeNonAuthenticatedData(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: false,
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    Alert.alert("Success", `Stored ${key} without authentication`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Alert.alert(
      "Error",
      `Failed to store non-authenticated data: ${errorMessage}`
    );
  }
}

async function getData(key: string, requiresAuth: boolean) {
  try {
    if (isSimulator && requiresAuth) {
      Alert.alert(
        "Simulator Detected",
        "Biometric authentication doesn't work in iOS Simulator. Please test on a physical device for full functionality."
      );
      return;
    }

    const value = await SecureStore.getItemAsync(key, {
      requireAuthentication: requiresAuth,
      authenticationPrompt:
        "Authenticate with passcode to access sensitive data",
    });
    Alert.alert(
      "Result",
      value ? `Value: ${value}` : `No value found for ${key}`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Alert.alert("Error", `Failed to retrieve data: ${errorMessage}`);
  }
}

const expoSecureStore = () => {
  const [authKey, setAuthKey] = useState("sensitiveKey");
  const [authValue, setAuthValue] = useState("sensitiveData");
  const [nonAuthKey, setNonAuthKey] = useState("regularKey");
  const [nonAuthValue, setNonAuthValue] = useState("regularData");

  return (
    <View style={styles.container}>
      {isSimulator && (
        <View style={styles.simulatorWarning}>
          <Text style={styles.warningText}>⚠️ iOS Simulator Detected</Text>
          <Text style={styles.warningSubtext}>
            Biometric authentication won't work. Test on a physical device for
            full functionality.
          </Text>
        </View>
      )}

      <Text style={styles.paragraph}>Store Sensitive Data (Passcode)</Text>
      <TextInput
        style={styles.textInput}
        value={authKey}
        onChangeText={setAuthKey}
        placeholder="Enter key (sensitive)"
      />
      <TextInput
        style={styles.textInput}
        value={authValue}
        onChangeText={setAuthValue}
        placeholder="Enter value (sensitive)"
      />
      <Button
        title="Save with Passcode"
        onPress={() => storeAuthenticatedData(authKey, authValue)}
      />

      <Text style={styles.paragraph}>Store Regular Data</Text>
      <TextInput
        style={styles.textInput}
        value={nonAuthKey}
        onChangeText={setNonAuthKey}
        placeholder="Enter key (regular)"
      />
      <TextInput
        style={styles.textInput}
        value={nonAuthValue}
        onChangeText={setNonAuthValue}
        placeholder="Enter value (regular)"
      />
      <Button
        title="Save without Authentication"
        onPress={() => storeNonAuthenticatedData(nonAuthKey, nonAuthValue)}
      />

      <Text style={styles.paragraph}>Retrieve Data</Text>
      <Button
        title="Get Sensitive Data"
        onPress={() => getData(authKey, true)}
      />
      <Button
        title="Get Regular Data"
        onPress={() => getData(nonAuthKey, false)}
      />
    </View>
  );
};

export default expoSecureStore;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 8 },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    height: 35,
    borderColor: "gray",
    borderWidth: 0.5,
    padding: 4,
    marginBottom: 10,
  },
  simulatorWarning: {
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEAA7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  warningText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    textAlign: "center",
    marginBottom: 8,
  },
  warningSubtext: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    lineHeight: 20,
  },
});
