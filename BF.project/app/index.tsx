/**
 * BIAZ Finance - Main News Feed Screen
 * 
 * This is the main screen of the application displaying financial news with:
 * - Vertical scrolling news feed (mobile)
 * - Desktop optimized layout (news left, stocks + predictions right)
 * - Three information panels per news item:
 *   1. News article preview (40% height on mobile)
 *   2. Related stocks carousel (15% height on mobile)  
 *   3. Impact forecast analysis (30% height on mobile)
 * 
 * Key Features:
 * - Full-screen news expansion on tap
 * - Paginated stock carousel with indicators
 * - AI-powered impact predictions
 * - Responsive layout for desktop/mobile
 * - Gradient blur effects for readability
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ViewToken,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Settings, User, TrendingUp, TrendingDown, Minus, X, Bookmark, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mockNewsData, NewsItem } from '@/mocks/news';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { useFavorites } from '@/contexts/FavoritesContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Article } from '@/types/api';
import { useTheme } from '@/contexts/ThemeContext';


// ==========================================
// SCREEN DIMENSIONS & LAYOUT DETECTION
// ==========================================

const getScreenDimensions = () => Dimensions.get('window');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

const isDesktop = () => Platform.OS === 'web' && getScreenDimensions().width >= 1024;

// ==========================================
// COLOR PALETTE
// ==========================================

const fixedColors = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
} as const;

// ==========================================
// NEWSCARD COMPONENT (MOBILE)
// ==========================================

function NewsCard({ item }: { item: NewsItem }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(item.id);
  
  const { addStock, isInPortfolio } = usePortfolio();
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPredictionExpanded, setIsPredictionExpanded] = useState<boolean>(false);
  const [currentStockIndex, setCurrentStockIndex] = useState<number>(0);

  const handleNewsPress = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handlePredictionPress = useCallback(() => {
    setIsPredictionExpanded(true);
  }, []);

  const handlePredictionClose = useCallback(() => {
    setIsPredictionExpanded(false);
  }, []);

  const handleStockScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SCREEN_WIDTH - 32));
    setCurrentStockIndex(index);
  }, []);

  const handleFavoritePress = useCallback(() => {
    const article: Article = {
      id: item.id,
      title: item.title,
      summary: item.snippet,
      url: '',
      imageUrl: item.imageUrl,
      publishedAt: item.timestamp,
      source: item.source,
      symbols: item.relatedStocks.map(stock => stock.symbol),
      truthScore: item.truthScore || 0,
      impactSentiment: item.prediction.sentiment as 'positive' | 'negative' | 'neutral',
    };
    toggleFavorite(article);
  }, [item, toggleFavorite]);

  return (
    <View style={styles.newsCard}>
      <TouchableOpacity 
        style={styles.newsWindow} 
        activeOpacity={0.95}
        onPress={handleNewsPress}
      >
        <View style={styles.newsCardContent}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={[
              'transparent',
              `${colors.background}80`,
              `${colors.background}d9`,
              `${colors.background}f2`
            ]}
            locations={[0.35, 0.5, 0.7, 1]}
            style={styles.newsGradientOverlay}
          >
            <View style={styles.newsTextContent}>
            <View style={styles.newsMeta}>
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsTimestamp}>{item.timestamp}</Text>
            </View>
            
            <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={3}>{item.title}</Text>
            
            <Text style={styles.newsSnippet} numberOfLines={2}>{item.snippet}</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>

      <View style={styles.stocksWindow}>
        <View style={styles.stocksContent}>
          <Text style={[styles.stocksTitle, { color: colors.text }]}>Related Stocks</Text>
          
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH - 32}
            snapToAlignment="center"
            onScroll={handleStockScroll}
            scrollEventThrottle={16}
          >
            {item.relatedStocks.map((stock, index) => (
              <View key={index} style={styles.stockCard}>
                <View style={styles.stockMainInfo}>
                  <Text style={[styles.stockSymbolLarge, { color: colors.text }]}>{stock.symbol}</Text>
                  
                  <Text style={[styles.stockPriceLarge, { color: colors.text }]}>
                    ${stock.currentPrice.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.priceChangeIconTopRight}>
                  {stock.priceChange > 0 ? (
                    <TrendingUp size={20} color={fixedColors.positive} />
                  ) : stock.priceChange < 0 ? (
                    <TrendingDown size={20} color={fixedColors.negative} />
                  ) : (
                    <Minus size={20} color={fixedColors.neutral} />
                  )}
                </View>
                
                <Text
                  style={[
                    styles.stockChangeBottomRight,
                    {
                      color:
                        stock.priceChange > 0
                          ? fixedColors.positive
                          : stock.priceChange < 0
                          ? fixedColors.negative
                          : fixedColors.neutral,
                    },
                  ]}
                >
                  {stock.priceChange > 0 ? '+' : ''}
                  {stock.priceChange.toFixed(2)}%
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.paginationDots}>
            {item.relatedStocks.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === currentStockIndex
                        ? colors.text
                        : fixedColors.neutral,
                    opacity: index === currentStockIndex ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.predictionWindow}
        activeOpacity={0.95}
        onPress={handlePredictionPress}
      >
        <View style={styles.predictionContent}>
          <Text style={[styles.predictionTitle, { color: colors.text }]}>Impact Forecast</Text>
          
          <View style={styles.shortAnalysisContainer}>
            <View
              style={[
                styles.sentimentBadgeSmall,
                {
                  backgroundColor:
                    item.prediction.sentiment === 'positive'
                      ? fixedColors.positive
                      : item.prediction.sentiment === 'negative'
                      ? fixedColors.negative
                      : fixedColors.neutral,
                },
              ]}
            >
              <Text style={[styles.sentimentTextSmall, { color: colors.text }]}>
                {item.prediction.sentiment === 'positive'
                  ? 'POSITIVE'
                  : item.prediction.sentiment === 'negative'
                  ? 'NEGATIVE'
                  : 'NEUTRAL'}
              </Text>
            </View>
            
            <Text style={[styles.shortAnalysisText, { color: colors.text }]} numberOfLines={4}>
              {item.prediction.shortAnalysis}
            </Text>
            
            <Text style={styles.tapForDetailsHint}>Tap for detailed forecast</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isExpanded}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.expandedContainer}>
          <View style={[styles.expandedTopSpacer, { height: insets.top + 20, backgroundColor: colors.background }]} />
          
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.expandedNewsImage}
            resizeMode="cover"
          />
          
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 30 }]} onPress={handleClose}>
            <X size={28} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.favoriteButton, { top: insets.top + 30 }]} 
            onPress={handleFavoritePress}
          >
            <Bookmark 
              size={28} 
              color={colors.text} 
              fill={favorited ? colors.text : 'transparent'}
            />
          </TouchableOpacity>
          
          <ScrollView style={styles.expandedScrollView} contentContainerStyle={styles.expandedContent}>
            <View style={styles.expandedNewsMeta}>
              <Text style={styles.expandedNewsSource}>{item.source}</Text>
              <Text style={styles.expandedNewsTimestamp}>{item.timestamp}</Text>
            </View>
            
            <Text style={[styles.expandedNewsTitle, { color: colors.text }]}>{item.title}</Text>
            
            <Text style={styles.expandedNewsText}>{item.snippet}</Text>
            
            <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Related Stocks</Text>
            <View style={styles.expandedStocksList}>
              {item.relatedStocks.map((stock, index) => {
                const inPortfolio = isInPortfolio(stock.symbol);
                return (
                  <View key={index} style={[styles.expandedStockCard, { backgroundColor: colors.window }]}>
                    <View style={styles.expandedStockHeader}>
                      <Text style={[styles.expandedStockSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                      <View style={styles.expandedStockHeaderRight}>
                        {stock.priceChange > 0 ? (
                          <TrendingUp size={20} color={fixedColors.positive} />
                        ) : stock.priceChange < 0 ? (
                          <TrendingDown size={20} color={fixedColors.negative} />
                        ) : (
                          <Minus size={20} color={fixedColors.neutral} />
                        )}
                        <TouchableOpacity
                          style={[
                            styles.addToPortfolioButton,
                            inPortfolio && [styles.addToPortfolioButtonDisabled, { backgroundColor: colors.window }],
                          ]}
                          onPress={() => {
                            if (!inPortfolio) {
                              addStock({
                                symbol: stock.symbol,
                                shares: 1,
                                avgPrice: stock.currentPrice,
                              });
                            }
                          }}
                          disabled={inPortfolio}
                        >
                          <Plus
                            size={16}
                            color={inPortfolio ? fixedColors.neutral : colors.text}
                          />
                          <Text
                            style={[
                              styles.addToPortfolioButtonText,
                              inPortfolio && styles.addToPortfolioButtonTextDisabled,
                              { color: inPortfolio ? fixedColors.neutral : colors.text }
                            ]}
                          >
                            {inPortfolio ? 'In Portfolio' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.expandedStockCompanyName}>{stock.companyName}</Text>
                    <View style={styles.expandedStockPriceContainer}>
                      <Text style={[styles.expandedStockCurrentPrice, { color: colors.text }]}>
                        ${stock.currentPrice.toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.expandedStockPriceChange,
                          {
                            color:
                              stock.priceChange > 0
                                ? fixedColors.positive
                                : stock.priceChange < 0
                                ? fixedColors.negative
                                : fixedColors.neutral,
                          },
                        ]}
                      >
                        {stock.priceChange > 0 ? '+' : ''}
                        {stock.priceChange.toFixed(2)}% (${stock.priceChangeValue > 0 ? '+' : ''}
                        {stock.priceChangeValue.toFixed(2)})
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            
            <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Impact Forecast</Text>
            <View
              style={[
                styles.expandedSentimentContainer,
                {
                  backgroundColor:
                    item.prediction.sentiment === 'positive'
                      ? `${fixedColors.positive}20`
                      : item.prediction.sentiment === 'negative'
                      ? `${fixedColors.negative}20`
                      : `${fixedColors.neutral}20`,
                },
              ]}
            >
              <View
                style={[
                  styles.expandedSentimentBadge,
                  {
                    backgroundColor:
                      item.prediction.sentiment === 'positive'
                        ? fixedColors.positive
                        : item.prediction.sentiment === 'negative'
                        ? fixedColors.negative
                        : fixedColors.neutral,
                  },
                ]}
              >
                <Text style={[styles.expandedSentimentText, { color: colors.text }]}>
                  {item.prediction.sentiment === 'positive'
                    ? 'POSITIVE'
                    : item.prediction.sentiment === 'negative'
                    ? 'NEGATIVE'
                    : 'NEUTRAL'}
                </Text>
              </View>
              <Text style={styles.expandedImpactLevel}>
                Impact Level:{' '}
                <Text style={[styles.expandedImpactLevelValue, { color: colors.text }]}>
                  {item.prediction.impactLevel === 'high'
                    ? 'HIGH'
                    : item.prediction.impactLevel === 'medium'
                    ? 'MEDIUM'
                    : 'LOW'}
                </Text>
              </Text>
            </View>
            <Text style={styles.expandedTimeframe}>{item.prediction.timeframe}</Text>
            <Text style={[styles.expandedPredictionDescription, { color: colors.text }]}>
              {item.prediction.description}
            </Text>
            <Text style={[styles.expandedKeyPointsTitle, { color: colors.text }]}>Key Points:</Text>
            <View style={styles.expandedKeyPointsList}>
              {item.prediction.keyPoints.map((point, index) => (
                <View key={index} style={styles.expandedKeyPointItem}>
                  <View style={styles.expandedKeyPointBullet} />
                  <Text style={styles.expandedKeyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={isPredictionExpanded}
        animationType="slide"
        onRequestClose={handlePredictionClose}
      >
        <View style={styles.expandedContainer}>
          <View style={[styles.expandedTopSpacer, { height: insets.top + 20, backgroundColor: colors.background }]} />
          
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 30 }]} onPress={handlePredictionClose}>
            <X size={28} color={colors.text} />
          </TouchableOpacity>
          
          <ScrollView style={styles.expandedScrollView} contentContainerStyle={styles.expandedContent}>
            <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Impact Forecast</Text>
            <View
              style={[
                styles.expandedSentimentContainer,
                {
                  backgroundColor:
                    item.prediction.sentiment === 'positive'
                      ? `${fixedColors.positive}20`
                      : item.prediction.sentiment === 'negative'
                      ? `${fixedColors.negative}20`
                      : `${fixedColors.neutral}20`,
                },
              ]}
            >
              <View
                style={[
                  styles.expandedSentimentBadge,
                  {
                    backgroundColor:
                      item.prediction.sentiment === 'positive'
                        ? fixedColors.positive
                        : item.prediction.sentiment === 'negative'
                        ? fixedColors.negative
                        : fixedColors.neutral,
                  },
                ]}
              >
                <Text style={[styles.expandedSentimentText, { color: colors.text }]}>
                  {item.prediction.sentiment === 'positive'
                    ? 'POSITIVE'
                    : item.prediction.sentiment === 'negative'
                    ? 'NEGATIVE'
                    : 'NEUTRAL'}
                </Text>
              </View>
              <Text style={styles.expandedImpactLevel}>
                Impact Level:{' '}
                <Text style={[styles.expandedImpactLevelValue, { color: colors.text }]}>
                  {item.prediction.impactLevel === 'high'
                    ? 'HIGH'
                    : item.prediction.impactLevel === 'medium'
                    ? 'MEDIUM'
                    : 'LOW'}
                </Text>
              </Text>
            </View>
            <Text style={styles.expandedTimeframe}>{item.prediction.timeframe}</Text>
            <Text style={[styles.expandedPredictionDescription, { color: colors.text }]}>
              {item.prediction.description}
            </Text>
            <Text style={[styles.expandedKeyPointsTitle, { color: colors.text }]}>Key Points:</Text>
            <View style={styles.expandedKeyPointsList}>
              {item.prediction.keyPoints.map((point, index) => (
                <View key={index} style={styles.expandedKeyPointItem}>
                  <View style={styles.expandedKeyPointBullet} />
                  <Text style={styles.expandedKeyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function DesktopNewsCard({ item }: { item: NewsItem }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPredictionExpanded, setIsPredictionExpanded] = useState<boolean>(false);
  const [currentStockIndex, setCurrentStockIndex] = useState<number>(0);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handleNewsPress = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handlePredictionPress = useCallback(() => {
    setIsPredictionExpanded(true);
  }, []);

  const handlePredictionClose = useCallback(() => {
    setIsPredictionExpanded(false);
  }, []);

  const handleStockScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollViewWidth = SCREEN_WIDTH * 0.5 - 40;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / scrollViewWidth);
    setCurrentStockIndex(index);
  }, []);

  return (
    <View style={styles.desktopNewsCardRow}>
      <View style={styles.desktopNewsCardLeft}>
        <TouchableOpacity 
          style={styles.desktopNewsWindow} 
          activeOpacity={0.95}
          onPress={handleNewsPress}
        >
          <View style={styles.newsCardContent}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.newsImage}
              resizeMode="cover"
            />
            
            <LinearGradient
              colors={['transparent', `${colors.background}80`, `${colors.background}d9`, `${colors.background}f2`]}
              locations={[0.35, 0.5, 0.7, 1]}
              style={styles.newsGradientOverlay}
            >
              <View style={styles.newsTextContent}>
                <View style={styles.newsMeta}>
                  <Text style={styles.newsSource}>{item.source}</Text>
                  <Text style={styles.newsTimestamp}>{item.timestamp}</Text>
                </View>
                
                <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={3}>{item.title}</Text>
                <Text style={styles.newsSnippet} numberOfLines={2}>{item.snippet}</Text>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.desktopNewsCardRight}>
        <View style={styles.desktopStocksWindow}>
          <View style={styles.stocksContent}>
            <Text style={[styles.stocksTitle, { color: colors.text }]}>Related Stocks</Text>
            
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH * 0.5 - 40}
              snapToAlignment="center"
              onScroll={handleStockScroll}
              scrollEventThrottle={16}
            >
              {item.relatedStocks.map((stock, index) => (
                <View key={index} style={styles.desktopStockCard}>
                  <View style={styles.stockMainInfo}>
                    <Text style={[styles.stockSymbolLarge, { color: colors.text }]}>{stock.symbol}</Text>
                    <Text style={[styles.stockPriceLarge, { color: colors.text }]}>
                      ${stock.currentPrice.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.priceChangeIconTopRight}>
                    {stock.priceChange > 0 ? (
                      <TrendingUp size={20} color={fixedColors.positive} />
                    ) : stock.priceChange < 0 ? (
                      <TrendingDown size={20} color={fixedColors.negative} />
                    ) : (
                      <Minus size={20} color={fixedColors.neutral} />
                    )}
                  </View>
                  
                  <Text
                    style={[
                      styles.stockChangeBottomRight,
                      {
                        color:
                          stock.priceChange > 0
                            ? fixedColors.positive
                            : stock.priceChange < 0
                            ? fixedColors.negative
                            : fixedColors.neutral,
                      },
                    ]}
                  >
                    {stock.priceChange > 0 ? '+' : ''}
                    {stock.priceChange.toFixed(2)}%
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.paginationDots}>
              {item.relatedStocks.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor:
                        index === currentStockIndex
                          ? colors.text
                          : fixedColors.neutral,
                      opacity: index === currentStockIndex ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.desktopPredictionWindow}
          activeOpacity={0.95}
          onPress={handlePredictionPress}
        >
          <View style={styles.predictionContent}>
            <Text style={[styles.predictionTitle, { color: colors.text }]}>Impact Forecast</Text>
            
            <View style={styles.shortAnalysisContainer}>
              <View
                style={[
                  styles.sentimentBadgeSmall,
                  {
                    backgroundColor:
                      item.prediction.sentiment === 'positive'
                        ? fixedColors.positive
                        : item.prediction.sentiment === 'negative'
                        ? fixedColors.negative
                        : fixedColors.neutral,
                  },
                ]}
              >
                <Text style={[styles.sentimentTextSmall, { color: colors.text }]}>
                  {item.prediction.sentiment === 'positive'
                    ? 'POSITIVE'
                    : item.prediction.sentiment === 'negative'
                    ? 'NEGATIVE'
                    : 'NEUTRAL'}
                </Text>
              </View>
              
              <Text style={[styles.shortAnalysisText, { color: colors.text }]} numberOfLines={4}>
                {item.prediction.shortAnalysis}
              </Text>
              
              <Text style={styles.tapForDetailsHint}>Tap for detailed forecast</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isExpanded}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.expandedContainer}>
          <View style={[styles.expandedTopSpacer, { height: insets.top + 20, backgroundColor: colors.background }]} />
          
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.expandedNewsImage}
            resizeMode="cover"
          />
          
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 30 }]} onPress={handleClose}>
            <X size={28} color={colors.text} />
          </TouchableOpacity>
          
          <ScrollView style={styles.expandedScrollView} contentContainerStyle={styles.expandedContent}>
            <View style={styles.expandedNewsMeta}>
              <Text style={styles.expandedNewsSource}>{item.source}</Text>
              <Text style={styles.expandedNewsTimestamp}>{item.timestamp}</Text>
            </View>
            
            <Text style={[styles.expandedNewsTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={styles.expandedNewsText}>{item.snippet}</Text>
            
            <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Related Stocks</Text>
            <View style={styles.expandedStocksList}>
              {item.relatedStocks.map((stock, index) => (
                <View key={index} style={[styles.expandedStockCard, { backgroundColor: colors.window }]}>
                  <View style={styles.expandedStockHeader}>
                    <Text style={[styles.expandedStockSymbol, { color: colors.text }]}>{stock.symbol}</Text>
                    {stock.priceChange > 0 ? (
                      <TrendingUp size={20} color={fixedColors.positive} />
                    ) : stock.priceChange < 0 ? (
                      <TrendingDown size={20} color={fixedColors.negative} />
                    ) : (
                      <Minus size={20} color={fixedColors.neutral} />
                    )}
                  </View>
                  <Text style={styles.expandedStockCompanyName}>{stock.companyName}</Text>
                  <View style={styles.expandedStockPriceContainer}>
                    <Text style={[styles.expandedStockCurrentPrice, { color: colors.text }]}>
                      ${stock.currentPrice.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.expandedStockPriceChange,
                        {
                          color:
                            stock.priceChange > 0
                              ? fixedColors.positive
                              : stock.priceChange < 0
                              ? fixedColors.negative
                              : fixedColors.neutral,
                        },
                      ]}
                    >
                      {stock.priceChange > 0 ? '+' : ''}
                      {stock.priceChange.toFixed(2)}% (${stock.priceChangeValue > 0 ? '+' : ''}
                      {stock.priceChangeValue.toFixed(2)})
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Impact Forecast</Text>
            <View
              style={[
                styles.expandedSentimentContainer,
                {
                  backgroundColor:
                    item.prediction.sentiment === 'positive'
                      ? `${fixedColors.positive}20`
                      : item.prediction.sentiment === 'negative'
                      ? `${fixedColors.negative}20`
                      : `${fixedColors.neutral}20`,
                },
              ]}
            >
              <View
                style={[
                  styles.expandedSentimentBadge,
                  {
                    backgroundColor:
                      item.prediction.sentiment === 'positive'
                        ? fixedColors.positive
                        : item.prediction.sentiment === 'negative'
                        ? fixedColors.negative
                        : fixedColors.neutral,
                  },
                ]}
              >
                <Text style={[styles.expandedSentimentText, { color: colors.text }]}>
                  {item.prediction.sentiment === 'positive'
                    ? 'POSITIVE'
                    : item.prediction.sentiment === 'negative'
                    ? 'NEGATIVE'
                    : 'NEUTRAL'}
                </Text>
              </View>
              <Text style={styles.expandedImpactLevel}>
                Impact Level:{' '}
                <Text style={[styles.expandedImpactLevelValue, { color: colors.text }]}>
                  {item.prediction.impactLevel === 'high'
                    ? 'HIGH'
                    : item.prediction.impactLevel === 'medium'
                    ? 'MEDIUM'
                    : 'LOW'}
                </Text>
              </Text>
            </View>
            <Text style={styles.expandedTimeframe}>{item.prediction.timeframe}</Text>
            <Text style={[styles.expandedPredictionDescription, { color: colors.text }]}>
              {item.prediction.description}
            </Text>
            <Text style={[styles.expandedKeyPointsTitle, { color: colors.text }]}>Key Points:</Text>
            <View style={styles.expandedKeyPointsList}>
              {item.prediction.keyPoints.map((point, index) => (
                <View key={index} style={styles.expandedKeyPointItem}>
                  <View style={styles.expandedKeyPointBullet} />
                  <Text style={styles.expandedKeyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={isPredictionExpanded}
        animationType="slide"
        onRequestClose={handlePredictionClose}
      >
        <View style={styles.expandedContainer}>
          <View style={[styles.expandedTopSpacer, { height: insets.top + 20, backgroundColor: colors.background }]} />
          
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 30 }]} onPress={handlePredictionClose}>
            <X size={28} color={colors.text} />
          </TouchableOpacity>
          
          <ScrollView style={styles.expandedScrollView} contentContainerStyle={styles.expandedContent}>
            <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Impact Forecast</Text>
            <View
              style={[
                styles.expandedSentimentContainer,
                {
                  backgroundColor:
                    item.prediction.sentiment === 'positive'
                      ? `${fixedColors.positive}20`
                      : item.prediction.sentiment === 'negative'
                      ? `${fixedColors.negative}20`
                      : `${fixedColors.neutral}20`,
                },
              ]}
            >
              <View
                style={[
                  styles.expandedSentimentBadge,
                  {
                    backgroundColor:
                      item.prediction.sentiment === 'positive'
                        ? fixedColors.positive
                        : item.prediction.sentiment === 'negative'
                        ? fixedColors.negative
                        : fixedColors.neutral,
                  },
                ]}
              >
                <Text style={[styles.expandedSentimentText, { color: colors.text }]}>
                  {item.prediction.sentiment === 'positive'
                    ? 'POSITIVE'
                    : item.prediction.sentiment === 'negative'
                    ? 'NEGATIVE'
                    : 'NEUTRAL'}
                </Text>
              </View>
              <Text style={styles.expandedImpactLevel}>
                Impact Level:{' '}
                <Text style={[styles.expandedImpactLevelValue, { color: colors.text }]}>
                  {item.prediction.impactLevel === 'high'
                    ? 'HIGH'
                    : item.prediction.impactLevel === 'medium'
                    ? 'MEDIUM'
                    : 'LOW'}
                </Text>
              </Text>
            </View>
            <Text style={styles.expandedTimeframe}>{item.prediction.timeframe}</Text>
            <Text style={[styles.expandedPredictionDescription, { color: colors.text }]}>
              {item.prediction.description}
            </Text>
            <Text style={[styles.expandedKeyPointsTitle, { color: colors.text }]}>Key Points:</Text>
            <View style={styles.expandedKeyPointsList}>
              {item.prediction.keyPoints.map((point, index) => (
                <View key={index} style={styles.expandedKeyPointItem}>
                  <View style={styles.expandedKeyPointBullet} />
                  <Text style={styles.expandedKeyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

export default function NewsFeedScreen() {
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0]?.index !== null) {
        console.log('Current visible news:', viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const { data: newsData, isLoading, error } = useNewsArticles({ limit: 30 });

  const displayData = React.useMemo(() => {
    if (newsData && Array.isArray(newsData) && newsData.length > 0) {
      console.log('[NewsFeedScreen] Using API data:', newsData.length, 'items');
      return newsData;
    }
    console.log('[NewsFeedScreen] Using mock data:', mockNewsData.length, 'items');
    return mockNewsData;
  }, [newsData]);
  
  console.log('[NewsFeedScreen] Displaying', displayData.length, 'news items');
  console.log('[NewsFeedScreen] isLoading:', isLoading, 'error:', error?.message || 'none');
  console.log('[NewsFeedScreen] First item:', displayData[0]?.id, displayData[0]?.title);

  if (!displayData || displayData.length === 0) {
    console.error('[NewsFeedScreen] CRITICAL: No data available to display!');
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.loadingContainer, { marginTop: 200 }]}>
          <Text style={styles.errorText}>No data available</Text>
          <Text style={styles.errorSubText}>Please check your connection</Text>
        </View>
      </View>
    );
  }

  if (isDesktop()) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={[styles.headerContainer, { top: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('./settings')}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.appTitle, { color: colors.text }]}>BIAZ Finance</Text>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('./profile')}
          >
            <User size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading news...</Text>
          </View>
        )}

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.window }]}>
            <Text style={styles.errorText}>Failed to load news</Text>
            <Text style={styles.errorSubText}>{error.message}</Text>
            <Text style={styles.errorSubText}>Showing cached data</Text>
          </View>
        )}

        <View style={styles.desktopContainer}>
          <FlatList
            ref={flatListRef}
            data={displayData}
            renderItem={({ item }) => <DesktopNewsCard item={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.desktopNewsList}
            contentContainerStyle={styles.desktopNewsListContent}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.headerContainer, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('./settings')}
        >
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.appTitle, { color: colors.text }]}>BIAZ Finance</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('./profile')}
        >
          <User size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading news...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.window }]}>
          <Text style={styles.errorText}>Failed to load news</Text>
          <Text style={styles.errorSubText}>{error.message}</Text>
          <Text style={styles.errorSubText}>Showing cached data</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={displayData}
        renderItem={({ item }) => <NewsCard item={item} />}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </View>
  );
}

const createStyles = (colors: { background: string; window: string; text: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  appTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 12, 12, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsCard: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.background,
    paddingTop: 110,
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  newsWindow: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.window,
    marginBottom: 12,
  },
  newsCardContent: {
    flex: 1,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  newsGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  newsTextContent: {
    padding: 20,
    height: '100%',
    justifyContent: 'flex-end',
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  newsSource: {
    color: fixedColors.positive,
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  newsTimestamp: {
    color: 'rgba(251, 251, 251, 0.6)',
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    lineHeight: 28,
  },
  newsSnippet: {
    color: 'rgba(251, 251, 251, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  stocksWindow: {
    height: 110,
    borderRadius: 24,
    backgroundColor: colors.window,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stocksContent: {
    flex: 1,
    paddingTop: 12,
  },
  stocksTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  stockCard: {
    width: SCREEN_WIDTH - 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  stockMainInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  stockSymbolLarge: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  stockPriceLarge: {
    fontSize: 22,
    fontWeight: '600' as const,
  },
  priceChangeIconTopRight: {
    position: 'absolute',
    top: 0,
    right: 16,
  },
  stockChangeBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: -2,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  predictionWindow: {
    height: 220,
    borderRadius: 24,
    backgroundColor: colors.window,
    overflow: 'hidden',
  },
  predictionContent: {
    flex: 1,
    padding: 20,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  shortAnalysisContainer: {
    flex: 1,
    gap: 12,
  },
  sentimentBadgeSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sentimentTextSmall: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  shortAnalysisText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  tapForDetailsHint: {
    color: fixedColors.neutral,
    fontSize: 12,
    fontStyle: 'italic' as const,
    textAlign: 'center',
  },
  expandedContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  expandedTopSpacer: {
  },
  expandedNewsImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.35,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    right: 74,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  expandedScrollView: {
    flex: 1,
  },
  expandedContent: {
    padding: 20,
    paddingBottom: 60,
  },
  expandedNewsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expandedNewsSource: {
    color: fixedColors.positive,
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  expandedNewsTimestamp: {
    color: fixedColors.neutral,
    fontSize: 14,
  },
  expandedNewsTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 16,
    lineHeight: 36,
  },
  expandedNewsText: {
    color: fixedColors.neutral,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 32,
  },
  expandedSectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 16,
    marginTop: 8,
  },
  expandedStocksList: {
    gap: 12,
    marginBottom: 32,
  },
  expandedStockCard: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  expandedStockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedStockHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addToPortfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: fixedColors.positive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addToPortfolioButtonDisabled: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  addToPortfolioButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  addToPortfolioButtonTextDisabled: {
    color: fixedColors.neutral,
  },
  expandedStockSymbol: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  expandedStockCompanyName: {
    color: fixedColors.neutral,
    fontSize: 14,
  },
  expandedStockPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  expandedStockCurrentPrice: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  expandedStockPriceChange: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  expandedSentimentContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  expandedSentimentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  expandedSentimentText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  expandedImpactLevel: {
    color: fixedColors.neutral,
    fontSize: 14,
  },
  expandedImpactLevelValue: {
    fontWeight: '700' as const,
  },
  expandedTimeframe: {
    color: fixedColors.positive,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  expandedPredictionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  expandedKeyPointsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  expandedKeyPointsList: {
    gap: 12,
    marginBottom: 40,
  },
  expandedKeyPointItem: {
    flexDirection: 'row',
    gap: 12,
  },
  expandedKeyPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: fixedColors.positive,
    marginTop: 8,
  },
  expandedKeyPointText: {
    flex: 1,
    color: fixedColors.neutral,
    fontSize: 14,
    lineHeight: 22,
  },
  loadingContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 50,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    zIndex: 50,
    borderWidth: 1,
    borderColor: fixedColors.negative,
  },
  errorText: {
    color: fixedColors.negative,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  errorSubText: {
    color: fixedColors.neutral,
    fontSize: 14,
    marginBottom: 4,
  },
  desktopContainer: {
    flex: 1,
    paddingTop: 100,
  },
  desktopNewsList: {
    flex: 1,
  },
  desktopNewsListContent: {
    padding: 20,
  },
  desktopNewsCardRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    height: SCREEN_HEIGHT - 140,
  },
  desktopNewsCardLeft: {
    width: '50%',
  },
  desktopNewsCardRight: {
    flex: 1,
    gap: 20,
  },
  desktopNewsWindow: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.window,
  },
  desktopStocksWindow: {
    flex: 0.4,
    borderRadius: 24,
    backgroundColor: colors.window,
    overflow: 'hidden',
  },
  desktopStockCard: {
    width: SCREEN_WIDTH * 0.5 - 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  desktopPredictionWindow: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: colors.window,
    overflow: 'hidden',
  },
});
