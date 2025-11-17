import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🧩 Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from("analytics")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;

        setAnalytics(data || []);
        const total = data.reduce((sum, r) => sum + (r.visits || 0), 0);
        const today = new Date().toISOString().split("T")[0];
        const todayCount = data.find((r) => r.date === today)?.visits || 0;

        setTotalVisits(total);
        setTodayVisits(todayCount);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Error fetching analytics:", err.message);
      }
    };

    fetchAnalytics();

    // Realtime updates
    const channel = supabase
      .channel("analytics-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "analytics" },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 🧾 Record unique daily visit (once per user/day)
  useEffect(() => {
    let hasTracked = false;

    const recordVisit = async () => {
      if (hasTracked) return;
      hasTracked = true;

      const today = new Date().toISOString().split("T")[0];
      const userId = user?.id || "guest";

      const { data: existing, error: fetchError } = await supabase
        .from("analytics")
        .select("id, visits, visitors")
        .eq("date", today)
        .maybeSingle();

      if (fetchError) {
        console.error("Fetch error:", fetchError.message);
        return;
      }

      if (existing) {
        const visitors = existing.visitors || [];
        if (!visitors.includes(userId)) {
          visitors.push(userId);
          await supabase
            .from("analytics")
            .update({
              visits: existing.visits + 1,
              visitors,
            })
            .eq("id", existing.id);
        }
      } else {
        await supabase.from("analytics").insert([
          { date: today, visits: 1, visitors: [userId] },
        ]);
      }
    };

    recordVisit();
  }, [user]);

  // 🧠 Fetch total users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!error && data?.users) setActiveUsers(data.users.length);
    };
    fetchUsers();
  }, []);

  return (
    <div className="dashboard-wrapper container py-5">
      {/* Header */}
      <motion.header
        className="dashboard-header text-center mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">
          Welcome back,{" "}
          <span className="fw-semibold text-accent">
            {user?.user_metadata?.display_name ||
              user?.email?.split("@")[0] ||
              "User"}
          </span>{" "}
          👋
        </p>
      </motion.header>

      {/* Stats */}
      <section className="dashboard-stats-grid mb-5">
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <i className="bi bi-graph-up-arrow stat-icon pink"></i>
          <div>
            <h4>{totalVisits}</h4>
            <p>Total Visits</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <i className="bi bi-calendar-day stat-icon green"></i>
          <div>
            <h4>{todayVisits}</h4>
            <p>Today’s Visits</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <i className="bi bi-people stat-icon blue"></i>
          <div>
            <h4>{activeUsers}</h4>
            <p>Active Users</p>
          </div>
        </motion.div>
      </section>

      {/* Template Viewer Card */}
      <section className="dashboard-cards-grid mb-5">
        <motion.div
          className="dashboard-card"
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate("/templates")}
        >
          <div className="dashboard-card-icon purple">
            <i className="bi bi-grid"></i>
          </div>
          <div className="dashboard-card-content">
            <h3 className="dashboard-card-title">View Templates</h3>
            <p className="dashboard-card-description">
              Explore free HTML5UP templates directly from your dashboard.
            </p>
          </div>
          <div className="dashboard-card-arrow">
            <i className="bi bi-arrow-right"></i>
          </div>
        </motion.div>
      </section>

      {/* Chart */}
      <section className="chart-section mt-4">
        <div className="chart-header d-flex justify-content-between align-items-center flex-wrap mb-3">
          <div>
            <h2 className="chart-title">Traffic Trends</h2>
            <p className="chart-subtitle text-muted">
              Total visits over time: {totalVisits}
            </p>
          </div>
          {lastUpdated && (
            <p className="text-muted small">Last updated at {lastUpdated}</p>
          )}
        </div>

        {analytics.length === 0 ? (
          <div className="empty-state text-center py-5">
            <i className="bi bi-activity fs-1 mb-2"></i>
            <p>No analytics data available yet.</p>
            <p className="text-muted">Data will appear here once collected.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={analytics}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Visits"
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
