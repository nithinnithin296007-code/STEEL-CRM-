// Simple ML-based forecasting (100% FREE)

export function linearRegression(data) {
  const n = data.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  data.forEach((point, index) => {
    sumX += index;
    sumY += point;
    sumXY += index * point;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function predictRevenue(historicalData) {
  if (historicalData.length < 2) {
    return {
      forecast: [],
      trend: 'insufficient_data',
      confidence: 0
    };
  }

  const regression = linearRegression(historicalData);
  if (!regression) return { forecast: [], trend: 'error', confidence: 0 };

  const { slope, intercept } = regression;
  const forecast = [];

  // Predict next 3 months
  for (let i = historicalData.length; i < historicalData.length + 3; i++) {
    const predicted = slope * i + intercept;
    forecast.push(Math.max(0, Math.round(predicted)));
  }

  // Determine trend
  let trend = 'stable';
  if (slope > historicalData[historicalData.length - 1] * 0.1) {
    trend = 'growing';
  } else if (slope < -historicalData[historicalData.length - 1] * 0.1) {
    trend = 'declining';
  }

  // Calculate confidence (R-squared)
  const meanY = historicalData.reduce((a, b) => a + b) / historicalData.length;
  const ssRes = historicalData.reduce((sum, y, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const ssTot = historicalData.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  const confidence = Math.round(Math.max(0, Math.min(100, rSquared * 100)));

  return {
    forecast,
    trend,
    confidence,
    slope: Math.round(slope),
    monthlyGrowth: Math.round((slope / meanY) * 100)
  };
}

export function detectSeasonality(monthlyData) {
  if (monthlyData.length < 12) {
    return { pattern: 'insufficient_data', seasonality: 0 };
  }

  // Simple seasonality detection
  const firstHalf = monthlyData.slice(0, 6);
  const secondHalf = monthlyData.slice(6, 12);

  const avgFirst = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b) / secondHalf.length;

  const variation = Math.abs(avgFirst - avgSecond) / avgFirst;

  if (variation > 0.3) {
    return {
      pattern: 'seasonal',
      seasonality: Math.round(variation * 100),
      peakSeason: avgFirst > avgSecond ? 'first_half' : 'second_half'
    };
  }

  return {
    pattern: 'stable',
    seasonality: 0
  };
}

export function generateInsights(stats, forecastData, seasonality) {
  const insights = [];

  if (forecastData.trend === 'growing') {
    insights.push({
      type: 'positive',
      title: '📈 Growth Trend',
      message: `Revenue growing by ${forecastData.monthlyGrowth}% per month. Keep scaling!`
    });
  } else if (forecastData.trend === 'declining') {
    insights.push({
      type: 'warning',
      title: '⚠️ Revenue Declining',
      message: `Monthly revenue dropping by ${Math.abs(forecastData.monthlyGrowth)}%. Check customer retention.`
    });
  }

  if (seasonality.pattern === 'seasonal') {
    insights.push({
      type: 'info',
      title: '📊 Seasonal Pattern Detected',
      message: `${seasonality.peakSeason === 'first_half' ? 'First half' : 'Second half'} of year sees ${seasonality.seasonality}% higher sales.`
    });
  }

  if (forecastData.confidence < 60) {
    insights.push({
      type: 'info',
      title: '📈 More Data Needed',
      message: `Build more historical data for better predictions. Current accuracy: ${forecastData.confidence}%`
    });
  }

  if (stats.active_orders > stats.total_customers * 2) {
    insights.push({
      type: 'positive',
      title: '🎯 High Order Frequency',
      message: 'Customers are placing multiple orders. Repeat business is strong!'
    });
  }

  return insights;
}