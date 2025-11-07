'use client'
import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#E50914', '#1DB954', '#F5C518', '#3366FF']

export default function StrategicRecommendations({ data, onInsightChange }) {
  const [familyPct, setFamilyPct] = useState(13.6)
  const [tvBudget, setTvBudget] = useState(60)
  const [movieBudget, setMovieBudget] = useState(40)
  const [movieAge, setMovieAge] = useState(3.0)

  const freshness = Math.max(0, 100 - (movieAge - 0.5) * 25)

  const insight = `Raising Family content to ${familyPct.toFixed(1)}% and keeping TV share at ${tvBudget}% maintains 
a strong retention core (Freshness ≈ ${freshness.toFixed(0)}%). 
${familyPct >= 35 ? '✅ Family gap fully closed vs Disney+.' : '⚠️ Family content below target 35%.'}`

  useEffect(() => {
    if (onInsightChange) onInsightChange(insight)
  }, [familyPct, tvBudget, movieBudget, movieAge])

  const budgetData = [
    { name: 'TV Shows (Defense)', value: tvBudget },
    { name: 'Movies (Acquisition)', value: movieBudget }
  ]
  const contentMix = [
    { name: 'Family/Kids', value: familyPct },
    { name: 'Mature/Teen', value: 100 - familyPct }
  ]

  return (
    <div className="dashboard">
      <h3>🎯 Strategic Recommendations Simulator</h3>
      <p className="subtitle">Adjust the sliders to simulate Netflix’s next 3-year strategy.</p>

      {/* Sliders */}
      <div className="sliders">
        <div className="control">
          <label>Family Content Share (%)</label>
          <input type="range" min="10" max="50" step="0.1"
            value={familyPct} onChange={(e) => setFamilyPct(parseFloat(e.target.value))} />
          <span>{familyPct.toFixed(1)}%</span>
        </div>

        <div className="control">
          <label>TV Budget Share (%)</label>
          <input type="range" min="20" max="80"
            value={tvBudget} onChange={(e) => {
              const v = parseInt(e.target.value)
              setTvBudget(v); setMovieBudget(100 - v)
            }} />
          <span>{tvBudget}% TV / {movieBudget}% Movies</span>
        </div>

        <div className="control">
          <label>Movie Median Age (yrs)</label>
          <input type="range" min="0" max="5" step="0.1"
            value={movieAge} onChange={(e) => setMovieAge(parseFloat(e.target.value))} />
          <span>{movieAge.toFixed(1)} years</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart">
          <h4>Budget Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={budgetData}>
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip />
              <Bar dataKey="value" fill="#E50914" radius={6} label={{ position: 'top', fill: '#fff' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h4>Audience Composition</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={contentMix} dataKey="value" outerRadius={80} label>
                {contentMix.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="insight-box"
      >
        <strong>Dynamic Strategic Insight:</strong>
        <br />{insight}
      </motion.div>

      {/* Recommendation Cards */}
      <div className="cards">
        {[
          {
            title: 'Maintain 0.0-Year Median Age for TV Shows (Defense Core)',
            desc: 'Retention depends on fresh originals; any deviation >0.5 yrs triggers budget review.'
          },
          {
            title: 'Cap Movie Median Age ≤ 2 Years',
            desc: 'Improves perceived freshness and competitive quality without overspending on day-one releases.'
          },
          {
            title: 'Raise Family/Kids Content to ≥ 35%',
            desc: 'Closes the household gap and reduces Disney+ risk by expanding multi-viewer appeal.'
          },
          {
            title: 'Reinforce Global Hubs (India, SK, Germany)',
            desc: 'Ensures steady supply of original content and regional diversification beyond the US market.'
          }
        ].map((rec, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }} className="card">
            <strong>✅ Recommendation {i + 1}:</strong> {rec.title}
            <br /><span className="small">{rec.desc}</span>
          </motion.div>
        ))}
      </div>

      {/* Inline Styling */}
      <style jsx>{`
        .dashboard { color: white; padding: 16px; background: #0b0b0b; border-radius: 12px; }
        .subtitle { color: #aaa; margin-top: 4px; }
        .sliders { display: grid; gap: 16px; margin-top: 12px; }
        .control label { display: block; font-weight: 600; margin-bottom: 4px; }
        input[type=range] { width: 100%; accent-color: #E50914; cursor: pointer; }
        .charts { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 24px; }
        .chart { flex: 1; min-width: 240px; background: #141414; border-radius: 10px; padding: 12px; }
        .insight-box { background: #141414; margin-top: 28px; border-radius: 10px; padding: 16px; line-height: 1.5; }
        .cards { display: grid; gap: 12px; margin-top: 24px; }
        .card { background: #141414; border-radius: 10px; padding: 12px; }
        .small { color: #bbb; font-size: 13px; }
      `}</style>
    </div>
  )
}