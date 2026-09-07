import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn, signUp } from "@/data/auth";
import { env } from "@/lib/env";
import { useTheme } from "@/theme/useTheme";
import { Btn, Input, Txt, Window } from "@/ui";

export function LoginScreen() {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: typeof signIn, successMsg?: string) {
    setBusy(true);
    setError(null);
    const err = await action(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
    else if (successMsg) setError(successMsg);
    // On success the root layout's Stack.Protected guard swaps to the (tabs) group automatically.
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.color.desk }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center", padding: 16 }}
      >
        <Window title="Log On to Personal OS" icon="🔐">
          <Txt style={{ marginBottom: 10 }}>Type your email and password to log on.</Txt>
          <View style={{ gap: 8 }}>
            <Input
              label="Email:"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <Input
              label="Password:"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={() => run(signIn)}
            />
          </View>
          {error ? (
            <Txt variant="danger" style={{ marginTop: 8 }}>
              {error}
            </Txt>
          ) : null}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            {env.allowSignup ? (
              <Btn
                disabled={busy}
                onPress={() => run(signUp, "Account created. If email confirmation is on, confirm then sign in.")}
              >
                Create Account
              </Btn>
            ) : null}
            <Btn primary disabled={busy} onPress={() => run(signIn)}>
              OK
            </Btn>
          </View>
        </Window>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
