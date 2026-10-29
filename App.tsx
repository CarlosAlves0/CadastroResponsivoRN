import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Importando a lógica e os hooks do seu arquivo validation.ts
import { useCadastroForm, useLayoutResponsivo } from './validation';

function Campo({
  label,
  required,
  error,
  hint,
  password,
  ...inputProps
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.asterisk}> *</Text>}
      </Text>

      <View
        style={[
          styles.inputContainer,
          focused && styles.focused,
          error && styles.invalid,
        ]}
      >
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor="#9195A8"
          selectionColor="#5147C7"
          accessibilityLabel={`${label}${required ? ', obrigatório' : ''}`}
          accessibilityHint={error || hint}
          secureTextEntry={password && !showPassword}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {password && (
          <Pressable
            onPress={() => setShowPassword((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Ocultar senha' : 'Mostrar senha'
            }
            style={styles.passwordButton}
          >
            <Text style={styles.passwordText}>
              {showPassword ? 'Ocultar' : 'Ver'}
            </Text>
          </Pressable>
        )}
      </View>

      {!!(error || hint) && (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.hint, error && styles.error]}
        >
          {error ? `⚠ ${error}` : hint}
        </Text>
      )}
    </View>
  );
}

function Cadastro() {
  // Utilizando os hooks responsivos e de formulário vindos do validation.ts
  const { telaLarga } = useLayoutResponsivo();
  const insets = useSafeAreaInsets();
  
  // Altura compacta para telas pequenas
  const [windowHeight, setWindowHeight] = useState(0); // Tratado de forma limpa
  
  const { valores, erros, alterarCampo, salvar, limpar } = useCadastroForm({
    onSalvar: (dados) => {
      Keyboard.dismiss();
      Alert.alert(
        'Dados validados!',
        `Bem-vindo(a), ${dados.nome}! O formulário está correto.`
      );
    },
  });

  const [resetKey, setResetKey] = useState(0);

  // Atalho para mapear os campos para o componente Campo
  const field = (name) => ({
    value: valores[name],
    error: erros[name],
    onChangeText: (text) => alterarCampo(name, text),
  });

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={30}
      >      
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>R</Text>
              </View>
              <Text style={styles.brandName}>Responsivo</Text>
            </View>

            <Text style={styles.badge}>Cadastro</Text>
          </View>

          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>
              Crie seu cadastro
            </Text>
            <Text style={styles.subtitle}>
              Seu próximo capítulo começa por aqui.
            </Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Seus dados</Text>
            <Text style={styles.requiredNote}>* Campos obrigatórios</Text>
          </View>

          <View key={resetKey} style={styles.form}>
            {/* Linha 1: Nome e E-mail (Ficam lado a lado se telaLarga for true) */}
            <View style={[styles.row, telaLarga && styles.rowWide]}>
              <View style={telaLarga && styles.column}>
                <Campo
                  {...field('nome')}
                  label="Nome"
                  required
                  placeholder="Como você se chama?"
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

              <View style={telaLarga && styles.column}>
                <Campo
                  {...field('email')}
                  label="E-mail"
                  placeholder="voce@exemplo.com"
                  hint="Opcional. Informe um e-mail válido."
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Linha 2: Curso e Senha */}
            <View style={[styles.row, telaLarga && styles.rowWide]}>
              <View style={telaLarga && styles.column}>
                <Campo
                  {...field('curso')}
                  label="Curso"
                  required
                  placeholder="Ex.: Design de interfaces"
                  autoCapitalize="sentences"
                />
              </View>

              <View style={telaLarga && styles.column}>
                <Campo
                  {...field('senha')}
                  label="Senha"
                  password
                  placeholder="Crie uma senha"
                  hint="Mínimo de 8 caracteres."
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={salvar}
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={salvar}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.saveText}>Salvar →</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                Keyboard.dismiss();
                limpar();
                setResetKey((current) => current + 1);
              }}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Cadastro />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  container: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#5147C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: { color: '#FFFFFF', fontWeight: '700', fontSize: 17 },
  brandName: { color: '#222537', fontSize: 22 },
  badge: {
    color: '#5147C7',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 11,
    fontWeight: '600',
  },
  intro: { marginBottom: 28 },
  title: { color: '#222537', fontSize: 30, letterSpacing: -0.8 },
  subtitle: {
    color: '#73778B',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  sectionHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: { color: '#222537', fontSize: 14, fontWeight: '600' },
  requiredNote: { color: '#73778B', fontSize: 11 },
  form: { gap: 18 },
  row: { gap: 18 },
  rowWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  column: { flex: 1, minWidth: 0 },
  label: {
    color: '#222537',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  asterisk: { color: '#5147C7' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDEB',
    borderRadius: 8,
    backgroundColor: '#FCFCFF',
    minHeight: 48,
  },
  focused: { borderColor: '#5147C7' },
  invalid: { borderColor: '#B42332', backgroundColor: '#FFF7F7' },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#222537',
    fontSize: 14,
  },
  passwordButton: {
    minWidth: 48,
    minHeight: 46,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordText: { color: '#5147C7', fontSize: 12 },
  hint: { color: '#73778B', fontSize: 11, lineHeight: 16, marginTop: 7 },
  error: { color: '#B42332' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 26 },
  saveButton: {
    flex: 1,
    backgroundColor: '#5147C7',
    borderRadius: 9,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  saveText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  clearButton: {
    minWidth: 104,
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDEB',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { color: '#73778B', fontWeight: '600', fontSize: 14 },
  pressed: { opacity: 0.75 },
});