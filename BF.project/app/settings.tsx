import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Palette, Info, ChevronRight, X, Plus, Trash2 } from 'lucide-react-native';
import { useTheme, themePresets, type ThemePreset } from '@/contexts/ThemeContext';
import { useNotificationSettings } from '@/contexts/NotificationSettingsContext';

const appColors = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
} as const;

export default function SettingsScreen() {
  const { colors, setTheme, addCustomTheme, deleteCustomTheme, customThemes } = useTheme();
  const { settings, setNotificationsEnabled, setPriceAlertsEnabled } = useNotificationSettings();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customBackground, setCustomBackground] = useState('#0c0c0c');
  const [customWindow, setCustomWindow] = useState('#1a1a1a');
  const [customText, setCustomText] = useState('#fbfbfb');
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleThemeSelect = (theme: ThemePreset) => {
    setTheme(theme.colors);
    setShowThemePicker(false);
  };

  const handleCreateCustomTheme = async () => {
    if (!customThemeName.trim()) {
      return;
    }

    await addCustomTheme(customThemeName, {
      background: customBackground,
      window: customWindow,
      text: customText,
    });

    setCustomThemeName('');
    setCustomBackground('#0c0c0c');
    setCustomWindow('#1a1a1a');
    setCustomText('#fbfbfb');
    setShowCustomThemeModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.window }]}>
            <View style={styles.settingLeft}>
              <Bell size={22} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications about new news
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#2a2a2a', true: '#3a3a3a' }}
              thumbColor={colors.text}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.window }]}>
            <View style={styles.settingLeft}>
              <Bell size={22} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Price Alerts</Text>
                <Text style={styles.settingDescription}>
                  Alerts about significant price changes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.priceAlertsEnabled}
              onValueChange={setPriceAlertsEnabled}
              trackColor={{ false: '#2a2a2a', true: '#3a3a3a' }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.window }]}
            onPress={() => setShowThemePicker(true)}
          >
            <View style={styles.settingLeft}>
              <Palette size={22} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Theme Colors</Text>
                <Text style={styles.settingDescription}>
                  Customize app appearance
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color={appColors.neutral} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.window }]}
            onPress={() => setShowAboutModal(true)}
          >
            <View style={styles.settingLeft}>
              <Info size={22} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>About</Text>
                <Text style={styles.settingDescription}>Version 1.0.0</Text>
              </View>
            </View>
            <ChevronRight size={24} color={appColors.neutral} />
          </TouchableOpacity>
        </View>


      </ScrollView>

      <Modal
        visible={showThemePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setShowThemePicker(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.themeList}>
              <Text style={[styles.themeCategory, { color: colors.text }]}>Presets</Text>
              {themePresets.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.themeItem, { backgroundColor: colors.window }]}
                  onPress={() => handleThemeSelect(theme)}
                >
                  <View style={styles.themePreview}>
                    <View style={[styles.colorSwatch, { backgroundColor: theme.colors.background }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: theme.colors.window }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: theme.colors.text }]} />
                  </View>
                  <Text style={[styles.themeName, { color: colors.text }]}>{theme.name}</Text>
                </TouchableOpacity>
              ))}

              {customThemes.length > 0 && (
                <>
                  <Text style={[styles.themeCategory, { color: colors.text }]}>Custom Themes</Text>
                  {customThemes.map((theme) => (
                    <View key={theme.id} style={styles.customThemeRow}>
                      <TouchableOpacity
                        style={[styles.themeItem, styles.customThemeItem, { backgroundColor: colors.window }]}
                        onPress={() => handleThemeSelect(theme)}
                      >
                        <View style={styles.themePreview}>
                          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.background }]} />
                          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.window }]} />
                          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.text }]} />
                        </View>
                        <Text style={[styles.themeName, { color: colors.text }]}>{theme.name}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteCustomTheme(theme.id)}
                      >
                        <Trash2 size={20} color={appColors.negative} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              <TouchableOpacity
                style={[styles.addThemeButton, { backgroundColor: colors.window }]}
                onPress={() => {
                  setShowThemePicker(false);
                  setShowCustomThemeModal(true);
                }}
              >
                <Plus size={24} color={colors.text} />
                <Text style={[styles.addThemeText, { color: colors.text }]}>Create Custom Theme</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCustomThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Theme</Text>
              <TouchableOpacity onPress={() => setShowCustomThemeModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.customThemeForm}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Theme Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.window, color: colors.text }]}
                value={customThemeName}
                onChangeText={setCustomThemeName}
                placeholder="My Custom Theme"
                placeholderTextColor={appColors.neutral}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Background Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.window, color: colors.text }]}
                value={customBackground}
                onChangeText={setCustomBackground}
                placeholder="#0c0c0c"
                placeholderTextColor={appColors.neutral}
              />
              <View style={[styles.colorPreview, { backgroundColor: customBackground }]} />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Window Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.window, color: colors.text }]}
                value={customWindow}
                onChangeText={setCustomWindow}
                placeholder="#1a1a1a"
                placeholderTextColor={appColors.neutral}
              />
              <View style={[styles.colorPreview, { backgroundColor: customWindow }]} />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Text Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.window, color: colors.text }]}
                value={customText}
                onChangeText={setCustomText}
                placeholder="#fbfbfb"
                placeholderTextColor={appColors.neutral}
              />
              <View style={[styles.colorPreview, { backgroundColor: customText }]} />

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: appColors.positive }]}
                onPress={handleCreateCustomTheme}
              >
                <Text style={styles.createButtonText}>Create Theme</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>About</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.aboutContent}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>News Intelligence Platform</Text>
              <Text style={[styles.aboutVersion, { color: appColors.neutral }]}>Version 1.0.0</Text>
              
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: colors.text }]}>What is this app?</Text>
                <Text style={[styles.aboutText, { color: appColors.neutral }]}>
                  This is an advanced news intelligence platform designed to help you stay informed about market trends, company news, and investment opportunities.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: colors.text }]}>Key Features</Text>
                <Text style={[styles.aboutText, { color: appColors.neutral }]}>
                  • Real-time financial news aggregation{"\n"}
                  • AI-powered sentiment analysis{"\n"}
                  • Truth score verification system{"\n"}
                  • Portfolio tracking with price alerts{"\n"}
                  • Personalized news feed based on your interests{"\n"}
                  • Market impact predictions{"\n"}
                  • Stock performance insights
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: colors.text }]}>How it works</Text>
                <Text style={[styles.aboutText, { color: appColors.neutral }]}>
                  Our platform aggregates news from trusted financial sources and uses advanced AI algorithms to analyze market sentiment, verify information accuracy, and predict potential impacts on stocks and markets.
                  {"\n\n"}
                  Add stocks to your portfolio and set price alerts to receive notifications when significant changes occur. Stay ahead of market movements with AI-powered insights and recommendations.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: colors.text }]}>Privacy & Data</Text>
                <Text style={[styles.aboutText, { color: appColors.neutral }]}>
                  Your portfolio data and preferences are stored locally on your device. We prioritize your privacy and do not share your personal information with third parties.
                </Text>
              </View>

              <View style={[styles.aboutFooter, { borderTopColor: colors.window }]}>
                <Text style={[styles.aboutFooterText, { color: appColors.neutral }]}>
                  Made with focus on accuracy and user experience
                </Text>
                <Text style={[styles.aboutFooterText, { color: appColors.neutral }]}>
                  © 2025 News Intelligence Platform
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: { background: string; window: string; text: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.window,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400' as const,
    marginBottom: 2,
    color: colors.text,
  },
  settingDescription: {
    color: '#666',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  themeList: {
    padding: 20,
  },
  themeCategory: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 12,
    marginBottom: 12,
    color: colors.text,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    backgroundColor: colors.window,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 6,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  themeName: {
    fontSize: 17,
    fontWeight: '500' as const,
    flex: 1,
    color: colors.text,
  },
  customThemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customThemeItem: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  addThemeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    backgroundColor: colors.window,
  },
  addThemeText: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: colors.text,
  },
  customThemeForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
    marginTop: 16,
    color: colors.text,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: colors.window,
    color: colors.text,
  },
  colorPreview: {
    height: 60,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  aboutContent: {
    padding: 20,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 16,
    marginBottom: 24,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aboutFooter: {
    borderTopWidth: 1,
    paddingTop: 20,
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  aboutFooterText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
