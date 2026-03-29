import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import api from '../services/api.js';

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const insightsRes = await api.get('/ai-insights/insights');
      const forecastRes = await api.get('/ai-insights/forecast');
      
      setInsights(insightsRes.data);
      setForecast(forecastRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><p>🤖 AI is analyzing your data...</p></div>;

  return (
    <div>
      <h1 style={{ marginBottom: '30px', fontSize: '28px', fontWeight: '700' }}>🤖 AI Insights & Forecasting</h1>

      {/* Confidence Score */}
      {insights && (
        <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '10px' }}>{insights.confidence}%</h2>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>AI Forecast Confidence</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>Based on {insights.stats.total_orders} historical orders</p>
          </div>
        </div>
      )}

      {/* Key Insights */}
      {insights && insights.insights.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '20px', fontWeight: '600' }}>💡 Key Insights</h2>
          {insights.insights.map((insight, idx) => (
            <div key={idx} className="card" style={{ marginBottom: '10px', borderLeft: `4px solid ${insight.type === 'positive' ? '#16a34a' : insight.type === 'warning' ? '#ea580c' : '#2563eb'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '24px' }}>
                  {insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '5px' }}>{insight.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forecast Chart */}
      {forecast && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📈 Next 3 Months Revenue Forecast</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={forecast.forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <Area type="monotone" dataKey="predicted_revenue" fill="#667eea" stroke="#667eea" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Predicted revenue based on ML analysis (Accuracy: {forecast.accuracy}%)
          </p>
        </div>
      )}

      {/* Trend Indicator */}
      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Trend</h3>
                <p style={{ fontSize: '24px', fontWeight: '700' }}>
                  {insights.forecast.trend === 'growing' ? '📈 Growing' : insights.forecast.trend === 'declining' ? '📉 Declining' : '→ Stable'}
                </p>
              </div>
              <TrendingUp size={40} color="#2563eb" opacity={0.3} />
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Monthly Growth</h3>
                <p style={{ fontSize: '24px', fontWeight: '700' }}>
                  {insights.forecast.monthlyGrowth > 0 ? '+' : ''}{insights.forecast.monthlyGrowth}%
                </p>
              </div>
              <Zap size={40} color={insights.forecast.monthlyGrowth > 0 ? '#16a34a' : '#ea580c'} opacity={0.3} />
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Seasonality</h3>
                <p style={{ fontSize: '24px', fontWeight: '700' }}>
                  {insights.seasonality.pattern === 'seasonal' ? '📊 Yes' : '→ No'}
                </p>
              </div>
              <AlertCircle size={40} color="#2563eb" opacity={0.3} />
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">🎯 AI Recommendations</h2>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {insights && insights.forecast.trend === 'growing' && (
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              ✅ Scale up marketing - Revenue is growing. More customers will increase profits.
            </li>
          )}
          {insights && insights.forecast.trend === 'declining' && (
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              ⚠️ Focus on retention - Reach out to inactive customers and understand why orders are declining.
            </li>
          )}
          {insights && insights.seasonality.pattern === 'seasonal' && (
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              📊 Plan inventory - Prepare for peak season to avoid stockouts.
            </li>
          )}
          <li style={{ padding: '12px 0' }}>
            💰 Monitor top customers - They drive 80% of your revenue. Keep them happy!
          </li>
        </ul>
      </div>
    </div>
  );
}