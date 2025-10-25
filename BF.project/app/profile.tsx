/**
 * Profile Screen
 * 
 * Displays user profile information with:
 * - User statistics (news read, saved items, forecast accuracy, achievements)
 * - Interest tags/categories
 * - Portfolio management with add/remove stocks
 * - AI-powered portfolio analysis with real-time insights
 * - Recommendations based on news and market trends
 * 
 * Key Features:
 * - Modal-based portfolio management interface
 * - Stock position tracking (symbol, shares, average price)
 * - AI-generated insights for each portfolio position
 * - Risk alerts and recommendations
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { User, TrendingUp, Bookmark, Clock, Plus, Briefcase, X, BarChart3, AlertCircle, TrendingDown, ChevronRight, LogOut, Bell, BellOff } from 'lucide-react-native';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { useFavorites } from '@/contexts/FavoritesContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';
import { useAuth } from '@/contexts/AuthContext';

const fixedColors = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
} as const;

type PortfolioStock = {
  symbol: string;
  shares: number;
  avgPrice: number;
  alertThreshold?: number;
  priceHistory?: { price: number; timestamp: number }[];
  lastNotificationTime?: number;
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { authState, signOut, signIn } = useAuth();
  
  const { favorites } = useFavorites();
  const { portfolioStocks, addStock, removeStock, setAlertThreshold } = usePortfolio();
  const portfolioAnalysis = usePortfolioAnalysis();
  
  const [isPortfolioModalVisible, setIsPortfolioModalVisible] = useState<boolean>(false);
  const [isAddStockModalVisible, setIsAddStockModalVisible] = useState<boolean>(false);
  
  const { data: articles = [], isLoading } = useNewsArticles({ limit: 100 });
  
  const statistics = useMemo(() => {
    const totalArticles = articles.length;
    
    const avgTruthScore = articles.length > 0
      ? articles.reduce((sum, article) => sum + (article.truthScore || 0), 0) / articles.length
      : 0;
    const forecastAccuracy = Math.round(avgTruthScore * 100);
    
    return {
      newsRead: totalArticles,
      saved: favorites.length,
      forecastAccuracy: forecastAccuracy,
    };
  }, [articles, favorites]);
  
  const [newStock, setNewStock] = useState<PortfolioStock>({
    symbol: '',
    shares: 0,
    avgPrice: 0,
    alertThreshold: 0,
  });
  const [editingAlertStock, setEditingAlertStock] = useState<string | null>(null);
  const [alertThresholdInput, setAlertThresholdInput] = useState<string>('');
  
  const userProfile = authState.isSignedIn ? {
    name: 'John Doe',
    email: 'john@example.com',
  } : {
    name: 'Guest',
    email: '',
  };

  const handleAddStock = () => {
    if (!newStock.symbol || newStock.shares <= 0 || newStock.avgPrice <= 0) {
      Alert.alert('Error', 'Please fill in all fields with valid values');
      return;
    }
    addStock(newStock);
    setNewStock({ symbol: '', shares: 0, avgPrice: 0, alertThreshold: 0 });
    setIsAddStockModalVisible(false);
  };

  const handleRemoveStock = (symbol: string) => {
    removeStock(symbol);
  };

  const handleSetAlert = (symbol: string, threshold: number) => {
    setAlertThreshold(symbol, threshold);
    setEditingAlertStock(null);
    setAlertThresholdInput('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.userHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.window }]}>
            <User size={32} color={colors.text} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{userProfile.name}</Text>
            <Text style={[styles.userEmail, { color: fixedColors.neutral }]}>{userProfile.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={authState.isSignedIn ? signOut : signIn}
          >
            {authState.isSignedIn ? (
              <LogOut size={22} color={fixedColors.negative} />
            ) : (
              <User size={22} color={fixedColors.positive} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          
          <View style={[styles.statsList, { backgroundColor: colors.window }]}>
            <View style={styles.statsListItem}>
              <View style={styles.statsListItemLeft}>
                <Clock size={18} color={colors.text} />
                <Text style={[styles.statsListItemLabel, { color: colors.text }]}>News Available</Text>
              </View>
              <Text style={[styles.statsListItemValue, { color: colors.text }]}>{isLoading ? '-' : statistics.newsRead}</Text>
            </View>

            <View style={[styles.statsListItem, styles.statsListItemBorder]}>
              <View style={styles.statsListItemLeft}>
                <Bookmark size={18} color={colors.text} />
                <Text style={[styles.statsListItemLabel, { color: colors.text }]}>Saved</Text>
              </View>
              <Text style={[styles.statsListItemValue, { color: colors.text }]}>{statistics.saved}</Text>
            </View>

            <View style={[styles.statsListItem, styles.statsListItemBorder]}>
              <View style={styles.statsListItemLeft}>
                <TrendingUp size={18} color={colors.text} />
                <Text style={[styles.statsListItemLabel, { color: colors.text }]}>Avg Truth Score</Text>
              </View>
              <Text style={[styles.statsListItemValue, { color: colors.text }]}>{isLoading ? '-' : `${statistics.forecastAccuracy}%`}</Text>
            </View>
          </View>
        </View>

        <View style={styles.interestsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
          
          <View style={styles.interestsList}>
            <View style={[styles.interestChip, { backgroundColor: colors.window }]}>
              <Text style={[styles.interestText, { color: colors.text }]}>Technology</Text>
            </View>
            <View style={[styles.interestChip, { backgroundColor: colors.window }]}>
              <Text style={[styles.interestText, { color: colors.text }]}>Finance</Text>
            </View>
            <View style={[styles.interestChip, { backgroundColor: colors.window }]}>
              <Text style={[styles.interestText, { color: colors.text }]}>Automotive</Text>
            </View>
            <View style={[styles.interestChip, { backgroundColor: colors.window }]}>
              <Text style={[styles.interestText, { color: colors.text }]}>Health</Text>
            </View>
          </View>
        </View>

        <View style={styles.favoritesSection}>
          <View style={styles.favoritesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Articles</Text>
            <View style={styles.favoritesBadge}>
              <Text style={[styles.favoritesBadgeText, { color: colors.background }]}>{favorites.length}</Text>
            </View>
          </View>
          
          {favorites.length === 0 ? (
            <View style={[styles.emptyFavoritesContainer, { backgroundColor: colors.window }]}>
              <Bookmark size={48} color={fixedColors.neutral} />
              <Text style={[styles.emptyFavoritesText, { color: colors.text }]}>
                No saved articles yet
              </Text>
              <Text style={styles.emptyFavoritesSubText}>
                Tap the bookmark icon on any article to save it here
              </Text>
            </View>
          ) : (
            <View style={styles.favoritesListContainer}>
              {favorites.map((article) => (
                <TouchableOpacity key={article.id} style={[styles.favoriteListItem, { backgroundColor: colors.window }]}>
                  <View style={styles.favoriteListContent}>
                    <View style={styles.favoriteListHeader}>
                      <Text style={styles.favoriteListSource}>
                        {article.source}
                      </Text>
                      <View
                        style={[
                          styles.favoriteListSentimentBadge,
                          {
                            backgroundColor:
                              article.impactSentiment === 'positive'
                                ? fixedColors.positive
                                : article.impactSentiment === 'negative'
                                ? fixedColors.negative
                                : fixedColors.neutral,
                          },
                        ]}
                      >
                        <Text style={[styles.favoriteListSentimentText, { color: colors.text }]}>
                          {article.impactSentiment.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.favoriteListTitle, { color: colors.text }]} numberOfLines={2}>
                      {article.title}
                    </Text>
                    {article.symbols.length > 0 && (
                      <Text style={styles.favoriteListSymbols}>
                        {article.symbols.join(', ')}
                      </Text>
                    )}
                    {article.truthScore !== undefined && (
                      <Text style={styles.favoriteListTruthScore}>
                        {Math.round(article.truthScore * 100)}% verified
                      </Text>
                    )}
                  </View>
                  <ChevronRight size={20} color={fixedColors.neutral} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.portfolioSection}>
          <View style={styles.portfolioHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio</Text>
            <TouchableOpacity 
              style={[styles.portfolioButton, { backgroundColor: colors.window }]}
              onPress={() => setIsPortfolioModalVisible(true)}
            >
              <Briefcase size={18} color={colors.text} />
              <Text style={[styles.portfolioButtonText, { color: colors.text }]}>Manage Portfolio</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.portfolioPreview, { backgroundColor: colors.window }]}>
            <Text style={styles.portfolioPreviewText}>
              {portfolioStocks.length} stock{portfolioStocks.length !== 1 ? 's' : ''} tracked
            </Text>
          </View>
        </View>

        <View style={styles.portfolioAnalysisSection}>
          <View style={styles.analysisHeader}>
            <BarChart3 size={24} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio Analysis</Text>
          </View>
          
          {portfolioAnalysis.hasData ? (
            <>
              <View style={styles.insightsContainer}>
                {portfolioAnalysis.insights.map((insight, index) => {
                  const iconColor = insight.type === 'positive' 
                    ? fixedColors.positive 
                    : insight.type === 'negative' 
                    ? fixedColors.negative 
                    : '#f59e0b';
                  
                  const Icon = insight.type === 'positive' 
                    ? TrendingUp 
                    : insight.type === 'negative' 
                    ? TrendingDown 
                    : AlertCircle;
                  
                  const title = insight.type === 'positive'
                    ? 'Positive Outlook'
                    : insight.type === 'negative'
                    ? 'Risk Alert'
                    : 'Watch Closely';

                  return (
                    <View key={index} style={[styles.insightCard, { backgroundColor: colors.window }]}>
                      <View style={styles.insightHeader}>
                        <Icon size={20} color={iconColor} />
                        <Text style={[styles.insightTitle, { color: colors.text }]}>{title}</Text>
                      </View>
                      <Text style={styles.insightAffectedStocks}>
                        Affects: {insight.affectedSymbols.join(', ')}
                      </Text>
                      <Text style={styles.insightDescription} numberOfLines={3}>
                        {insight.description}
                      </Text>
                      <Text style={styles.insightTimestamp}>{insight.timestamp}</Text>
                    </View>
                  );
                })}
              </View>

              {portfolioAnalysis.recommendations.length > 0 && (
                <View style={[styles.recommendationsContainer, { backgroundColor: colors.window }]}>
                  <Text style={[styles.recommendationTitle, { color: colors.text }]}>AI Recommendations</Text>
                  {portfolioAnalysis.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View style={[styles.recommendationBullet, { backgroundColor: colors.text }]} />
                      <Text style={styles.recommendationText}>
                        {rec.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.emptyAnalysisContainer, { backgroundColor: colors.window }]}>
              <BarChart3 size={48} color={fixedColors.neutral} />
              <Text style={[styles.emptyAnalysisText, { color: colors.text }]}>
                {portfolioStocks.length === 0 
                  ? 'Add stocks to your portfolio to see AI-powered analysis'
                  : 'Loading analysis based on recent news...'}
              </Text>
            </View>
          )}
        </View>


      </ScrollView>

      <Modal
        visible={isPortfolioModalVisible}
        animationType="slide"
        onRequestClose={() => setIsPortfolioModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>My Portfolio</Text>
            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: colors.window }]}
              onPress={() => setIsPortfolioModalVisible(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {portfolioStocks.map((stock, index) => (
              <View key={index} style={[styles.portfolioStockCard, { backgroundColor: colors.window }]}>
                <View style={styles.portfolioStockInfo}>
                  <View style={styles.stockHeader}>
                    <Text style={[styles.portfolioStockSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                    <TouchableOpacity
                      style={styles.alertButton}
                      onPress={() => {
                        setEditingAlertStock(stock.symbol);
                        setAlertThresholdInput(stock.alertThreshold ? String(stock.alertThreshold) : '');
                      }}
                    >
                      {stock.alertThreshold ? (
                        <Bell size={18} color={fixedColors.positive} />
                      ) : (
                        <BellOff size={18} color={fixedColors.neutral} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.portfolioStockDetails}>
                    {stock.shares} shares @ ${stock.avgPrice.toFixed(2)}
                  </Text>
                  {stock.alertThreshold && (
                    <Text style={styles.alertThresholdText}>
                      Alert: Drop below ${stock.alertThreshold.toFixed(2)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeStockButton}
                  onPress={() => handleRemoveStock(stock.symbol)}
                >
                  <X size={20} color={fixedColors.negative} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.addStockButton, { backgroundColor: colors.text }]}
            onPress={() => setIsAddStockModalVisible(true)}
          >
            <Plus size={20} color={colors.background} />
            <Text style={[styles.addStockButtonText, { color: colors.background }]}>Add Stock</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={isAddStockModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddStockModalVisible(false)}
      >
        <View style={styles.addStockModalOverlay}>
          <View style={[styles.addStockModalContent, { backgroundColor: colors.window }]}>
            <Text style={[styles.addStockModalTitle, { color: colors.text }]}>Add Stock</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Stock Symbol (e.g., AAPL)"
              placeholderTextColor={fixedColors.neutral}
              value={newStock.symbol}
              onChangeText={(text) => setNewStock({ ...newStock, symbol: text.toUpperCase() })}
              autoCapitalize="characters"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Number of Shares"
              placeholderTextColor={fixedColors.neutral}
              value={newStock.shares > 0 ? String(newStock.shares) : ''}
              onChangeText={(text) => setNewStock({ ...newStock, shares: parseFloat(text) || 0 })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Average Price"
              placeholderTextColor={fixedColors.neutral}
              value={newStock.avgPrice > 0 ? String(newStock.avgPrice) : ''}
              onChangeText={(text) => setNewStock({ ...newStock, avgPrice: parseFloat(text) || 0 })}
              keyboardType="decimal-pad"
            />

            <View style={styles.addStockModalButtons}>
              <TouchableOpacity
                style={styles.addStockModalCancelButton}
                onPress={() => {
                  setIsAddStockModalVisible(false);
                  setNewStock({ symbol: '', shares: 0, avgPrice: 0, alertThreshold: 0 });
                }}
              >
                <Text style={[styles.addStockModalCancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.addStockModalAddButton, { backgroundColor: colors.text }]}
                onPress={handleAddStock}
              >
                <Text style={[styles.addStockModalAddButtonText, { color: colors.background }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editingAlertStock !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setEditingAlertStock(null)}
      >
        <View style={styles.addStockModalOverlay}>
          <View style={[styles.addStockModalContent, { backgroundColor: colors.window }]}>
            <Text style={[styles.addStockModalTitle, { color: colors.text }]}>Set Price Alert</Text>
            <Text style={[styles.alertModalDescription, { color: fixedColors.neutral }]}>
              Receive notification when {editingAlertStock} drops below this price
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Alert Threshold Price"
              placeholderTextColor={fixedColors.neutral}
              value={alertThresholdInput}
              onChangeText={setAlertThresholdInput}
              keyboardType="decimal-pad"
            />

            <View style={styles.addStockModalButtons}>
              <TouchableOpacity
                style={styles.addStockModalCancelButton}
                onPress={() => {
                  setEditingAlertStock(null);
                  setAlertThresholdInput('');
                }}
              >
                <Text style={[styles.addStockModalCancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.addStockModalAddButton, { backgroundColor: colors.text }]}
                onPress={() => {
                  if (editingAlertStock && alertThresholdInput) {
                    handleSetAlert(editingAlertStock, parseFloat(alertThresholdInput));
                  }
                }}
              >
                <Text style={[styles.addStockModalAddButtonText, { color: colors.background }]}>Set Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: { background: string; window: string; text: string }) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },

  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  statsList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  statsListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  statsListItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  statsListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsListItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  statsListItemValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  interestsSection: {
    padding: 20,
    paddingTop: 0,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  portfolioSection: {
    padding: 20,
    paddingTop: 0,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  portfolioButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  portfolioPreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  portfolioPreviewText: {
    color: fixedColors.neutral,
    fontSize: 14,
  },

  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  portfolioStockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  portfolioStockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertButton: {
    padding: 4,
  },
  alertThresholdText: {
    color: fixedColors.positive,
    fontSize: 12,
    marginTop: 4,
  },
  alertModalDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  portfolioStockSymbol: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  portfolioStockDetails: {
    color: fixedColors.neutral,
    fontSize: 14,
  },
  removeStockButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${fixedColors.negative}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addStockButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  addStockModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addStockModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  addStockModalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  addStockModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addStockModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  addStockModalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  addStockModalAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addStockModalAddButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  portfolioAnalysisSection: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  insightsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  insightDescription: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  insightTimestamp: {
    color: fixedColors.neutral,
    fontSize: 12,
  },
  recommendationsContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  recommendationText: {
    flex: 1,
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
  },
  favoritesSection: {
    padding: 20,
    paddingTop: 0,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  favoritesBadge: {
    backgroundColor: fixedColors.positive,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  favoritesBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  emptyFavoritesContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  emptyFavoritesText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyFavoritesSubText: {
    color: fixedColors.neutral,
    fontSize: 14,
    textAlign: 'center',
  },
  favoritesListContainer: {
    gap: 12,
  },
  favoriteListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  favoriteListContent: {
    flex: 1,
    gap: 8,
  },
  favoriteListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  favoriteListSource: {
    color: fixedColors.positive,
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  favoriteListSentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  favoriteListSentimentText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  favoriteListTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  favoriteListSymbols: {
    color: fixedColors.neutral,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  favoriteListTruthScore: {
    color: fixedColors.neutral,
    fontSize: 12,
  },
  insightAffectedStocks: {
    color: fixedColors.positive,
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptyAnalysisContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  emptyAnalysisText: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    lineHeight: 24,
  },
});
