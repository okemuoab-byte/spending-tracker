import { useState, useMemo, useRef, useEffect } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, ReferenceLine
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, Zap, Calendar, DollarSign,
  BarChart3, Clock, Lightbulb, Target, ChevronRight, ArrowUpRight,
  ArrowDownRight, AlertTriangle, Flame, CreditCard, Star, Download,
  ShoppingCart, Music, Dumbbell, Tv, Smartphone, Package, Home, Bus,
  UtensilsCrossed, Stethoscope, Shield, Plane, Laptop, GraduationCap,
  Users, Landmark, Gamepad2, Briefcase, ShoppingBag, Lock, Radio,
  Timer, Folder, Search, Train, Film, Cloud, X, Check
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA – 8 MONTHS: JUNE 2025 → JANUARY 2026
// ══════════════════════════════════════════════════════════════════════════════
const DEFAULT_MONTHLY_SUMMARY = [
  { month:"Jun", label:"Jun '25",  income:3646.70, spending:2385.25, net: 1261.45, balanceEnd:2163.00 },
  { month:"Jul", label:"Jul '25",  income:2052.92, spending:2439.86, net: -386.94, balanceEnd:1776.06 },
  { month:"Aug", label:"Aug '25",  income: 962.65, spending:2270.29, net:-1307.64, balanceEnd: 468.42 },
  { month:"Sep", label:"Sep '25",  income:4776.40, spending:2247.79, net: 2528.61, balanceEnd:2997.03 },
  { month:"Oct", label:"Oct '25",  income:3771.81, spending:3270.22, net:  501.59, balanceEnd:3442.66 },
  { month:"Nov", label:"Nov '25",  income: 811.00, spending:2524.21, net:-1713.21, balanceEnd:1729.45 },
  { month:"Dec", label:"Dec '25",  income:2479.74, spending:2397.29, net:   82.45, balanceEnd:1811.90 },
  { month:"Jan", label:"Jan '26",  income:2375.45, spending:1963.73, net:  411.72, balanceEnd:2223.62 },
];

const DEFAULT_INCOME_BREAKDOWN = {
  "Jun '25": { "UCL Stipend":2500.00, "Family Support":340.55, "Student Loan":645.60, "Other":160.55 },
  "Jul '25": { "UCL Stipend":1250.00, "Family Support":200.00, "Student Loan":250.00, "Other":352.92 },
  "Aug '25": { "UCL Stipend":300.00,  "Family Support":250.00, "Other":412.65 },
  "Sep '25": { "UCL Stipend":3776.40, "Family Support":300.00, "Student Loan":700.00 },
  "Oct '25": { "UCL Stipend":1575.45, "NHS Bursary":1537.00, "Family Support":525.00, "Other":134.36 },
  "Nov '25": { "Family Support":493.81, "UCL Stipend":300.00, "Other":17.19 },
  "Dec '25": { "NHS Bursary":1537.00, "Family Support":325.00, "UCL Stipend":300.00, "Other":317.74 },
  "Jan '26": { "UCL Stipend":1575.45, "Family Support":300.00, "Other":500.00 },
};

const DEFAULT_MONTHLY_CATEGORIES = {
  "Jun '25": { Rent:975.00, Shopping:326.65, Transport:248.26, Groceries:197.56, "Eating Out & Cafes":167.77, Other:164.75, Healthcare:91.30, "Personal Transfers":77.35, "Gym & Fitness":69.00, Subscriptions:35.97, "Phone Bill":31.64 },
  "Jul '25": { Rent:987.00, Transport:331.85, Groceries:269.37, "Eating Out & Cafes":239.87, "Entertainment & Nights Out":207.60, Other:116.41, "Personal Transfers":95.00, "Gym & Fitness":86.79, Subscriptions:35.97, "Phone Bill":34.96, Shopping:27.68, Healthcare:7.36 },
  "Aug '25": { Rent:975.00, Groceries:382.95, Transport:206.90, Shopping:186.15, "Eating Out & Cafes":170.77, "Personal Transfers":75.00, "Gym & Fitness":69.00, Other:58.47, Healthcare:58.45, Subscriptions:55.96, "Phone Bill":31.64 },
  "Sep '25": { Rent:989.50, Transport:462.83, "Eating Out & Cafes":174.96, Subscriptions:110.46, Healthcare:95.26, "Entertainment & Nights Out":88.30, Groceries:77.58, "Personal Transfers":75.00, Other:72.43, "Gym & Fitness":69.00, "Phone Bill":32.47 },
  "Oct '25": { Rent:975.00, Other:1134.63, Groceries:355.93, Transport:164.61, "Entertainment & Nights Out":122.20, "Eating Out & Cafes":114.04, Subscriptions:105.95, Shopping:82.99, "Gym & Fitness":76.50, Healthcare:34.43, "Phone Bill":37.64, "Personal Transfers":25.00 },
  "Nov '25": { Rent:975.00, Other:561.74, Groceries:217.98, Transport:184.71, "Eating Out & Cafes":115.79, Subscriptions:107.95, "Entertainment & Nights Out":78.50, "Gym & Fitness":70.00, Healthcare:69.82, Shopping:62.48, "Phone Bill":40.96, "Personal Transfers":0 },
  "Dec '25": { Rent:975.00, Other:444.17, "Eating Out & Cafes":232.47, Groceries:209.81, Transport:205.90, "Gym & Fitness":88.99, Subscriptions:82.96, "Entertainment & Nights Out":40.80, "Phone Bill":37.64, Healthcare:29.57 },
  "Jan '26": { Rent:975.00, Transport:276.71, Other:189.50, Groceries:139.20, Subscriptions:88.37, "Entertainment & Nights Out":80.00, "Gym & Fitness":69.00, "Eating Out & Cafes":61.02, "Phone Bill":37.64, "Personal Transfers":25.00, Healthcare:8.54 },
};

const DEFAULT_ALL_TRANSACTIONS = [
  // JUNE
  { date:"2025-06-02", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:975.00, dir:"out", month:"Jun '25" },
  { date:"2025-06-05", desc:"Barclays – UCL Stipend",      cat:"Stipend / Grants",    amount:2500.00,dir:"in",  month:"Jun '25" },
  { date:"2025-06-25", desc:"Student Loan – June",         cat:"Student Loan",        amount:645.60, dir:"in",  month:"Jun '25" },
  { date:"2025-06-09", desc:"Apple.com/bill",              cat:"Subscriptions",       amount:8.99,   dir:"out", month:"Jun '25" },
  { date:"2025-06-02", desc:"Costa Coffee",                cat:"Eating Out & Cafes",  amount:6.49,   dir:"out", month:"Jun '25" },
  { date:"2025-06-02", desc:"Royal Free London",           cat:"Healthcare",          amount:21.22,  dir:"out", month:"Jun '25" },
  { date:"2025-06-09", desc:"Moss Bros Oxford St",         cat:"Shopping",            amount:49.95,  dir:"out", month:"Jun '25" },
  { date:"2025-06-09", desc:"Friend Transfer",              cat:"Personal Transfers",  amount:20.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-09", desc:"Friend Transfer",             cat:"Personal Transfers",  amount:45.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-03", desc:"Family Transfer (Jun)",       cat:"Family Support",      amount:340.55, dir:"in",  month:"Jun '25" },
  { date:"2025-06-15", desc:"TfL / LIME (transport)",      cat:"Transport",           amount:248.26, dir:"out", month:"Jun '25" },
  { date:"2025-06-21", desc:"Groceries (Jun total)",       cat:"Groceries",           amount:197.56, dir:"out", month:"Jun '25" },
  { date:"2025-06-28", desc:"Eating Out (Jun total)",      cat:"Eating Out & Cafes",  amount:167.77, dir:"out", month:"Jun '25" },
  // JULY
  { date:"2025-07-02", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:987.00, dir:"out", month:"Jul '25" },
  { date:"2025-07-08", desc:"Barclays – UCL Stipend",      cat:"Stipend / Grants",    amount:1250.00,dir:"in",  month:"Jul '25" },
  { date:"2025-07-11", desc:"Student Loan – July",         cat:"Student Loan",        amount:250.00, dir:"in",  month:"Jul '25" },
  { date:"2025-07-22", desc:"The Roxy / Simmons Bar",      cat:"Entertainment & Nights Out", amount:83.90, dir:"out", month:"Jul '25" },
  { date:"2025-07-22", desc:"King's Arms Wandsworth",      cat:"Entertainment & Nights Out", amount:26.90, dir:"out", month:"Jul '25" },
  { date:"2025-07-22", desc:"Northcote Records",           cat:"Entertainment & Nights Out", amount:22.50, dir:"out", month:"Jul '25" },
  { date:"2025-07-27", desc:"Flat Iron Kensington",        cat:"Entertainment & Nights Out", amount:33.39, dir:"out", month:"Jul '25" },
  { date:"2025-07-25", desc:"Ted Loco Productions",        cat:"Entertainment & Nights Out", amount:74.30, dir:"out", month:"Jul '25" },
  { date:"2025-07-20", desc:"Bancone Golden Square",       cat:"Eating Out & Cafes",  amount:57.94,  dir:"out", month:"Jul '25" },
  { date:"2025-07-01", desc:"Family Support (Jul)",        cat:"Family Support",      amount:200.00, dir:"in",  month:"Jul '25" },
  { date:"2025-07-15", desc:"Transport (Jul total)",       cat:"Transport",           amount:331.85, dir:"out", month:"Jul '25" },
  { date:"2025-07-15", desc:"Groceries (Jul total)",       cat:"Groceries",           amount:269.37, dir:"out", month:"Jul '25" },
  // AUGUST
  { date:"2025-08-04", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:975.00, dir:"out", month:"Aug '25" },
  { date:"2025-08-04", desc:"Frontier Operations (in)",    cat:"Stipend / Grants",    amount:300.00, dir:"in",  month:"Aug '25" },
  { date:"2025-08-01", desc:"Family Support (Aug)",        cat:"Family Support",      amount:250.00, dir:"in",  month:"Aug '25" },
  { date:"2025-08-07", desc:"UNIQLO",                      cat:"Shopping",            amount:119.70, dir:"out", month:"Aug '25" },
  { date:"2025-08-08", desc:"Boots Opticians",             cat:"Healthcare",          amount:58.45,  dir:"out", month:"Aug '25" },
  { date:"2025-08-01", desc:"Apple.com/bill",              cat:"Subscriptions",       amount:19.99,  dir:"out", month:"Aug '25" },
  { date:"2025-08-01", desc:"Moss Bros Oxford St",         cat:"Shopping",            amount:34.95,  dir:"out", month:"Aug '25" },
  { date:"2025-08-15", desc:"Transport (Aug total)",       cat:"Transport",           amount:206.90, dir:"out", month:"Aug '25" },
  { date:"2025-08-15", desc:"Groceries (Aug total)",       cat:"Groceries",           amount:382.95, dir:"out", month:"Aug '25" },
  // SEPTEMBER
  { date:"2025-09-28", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:989.50, dir:"out", month:"Sep '25" },
  { date:"2025-09-11", desc:"Barclays UCL Stipend",        cat:"Stipend / Grants",    amount:3776.40,dir:"in",  month:"Sep '25" },
  { date:"2025-09-13", desc:"Student Loan",                cat:"Student Loan",        amount:700.00, dir:"in",  month:"Sep '25" },
  { date:"2025-09-01", desc:"Family Support (Sep)",        cat:"Family Support",      amount:300.00, dir:"in",  month:"Sep '25" },
  { date:"2025-09-12", desc:"Spotify Family Plan",         cat:"Subscriptions",       amount:21.99,  dir:"out", month:"Sep '25" },
  { date:"2025-09-12", desc:"LinkedIn Premium",            cat:"Subscriptions",       amount:49.99,  dir:"out", month:"Sep '25" },
  { date:"2025-09-19", desc:"The Standard Hotel",          cat:"Entertainment & Nights Out", amount:33.36, dir:"out", month:"Sep '25" },
  { date:"2025-09-18", desc:"Simmons Bars / Odeon",        cat:"Entertainment & Nights Out", amount:38.90, dir:"out", month:"Sep '25" },
  { date:"2025-09-21", desc:"Healthcare (Sep total)",      cat:"Healthcare",          amount:95.26,  dir:"out", month:"Sep '25" },
  { date:"2025-09-15", desc:"Transport (Sep total)",       cat:"Transport",           amount:462.83, dir:"out", month:"Sep '25" },
  // OCTOBER
  { date:"2025-10-01", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:975.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-03", desc:"NHSBSA – NHS Bursary",        cat:"NHS Bursary",         amount:1537.00,dir:"in",  month:"Oct '25" },
  { date:"2025-10-03", desc:"UCL Stipend / SLC",           cat:"Stipend / Grants",    amount:1575.45,dir:"in",  month:"Oct '25" },
  { date:"2025-10-01", desc:"Family Support (Oct)",        cat:"Family Support",      amount:525.00, dir:"in",  month:"Oct '25" },
  { date:"2025-10-02", desc:"Other Income (Oct)",          cat:"Other Income",        amount:134.36, dir:"in",  month:"Oct '25" },
  { date:"2025-10-01", desc:"Apple.com/bill",              cat:"Subscriptions",       amount:19.99,  dir:"out", month:"Oct '25" },
  { date:"2025-10-09", desc:"Apple.com/bill (2nd)",        cat:"Subscriptions",       amount:8.99,   dir:"out", month:"Oct '25" },
  { date:"2025-10-06", desc:"Rowans Ten Pin Bowling",      cat:"Entertainment & Nights Out", amount:33.40, dir:"out", month:"Oct '25" },
  { date:"2025-10-06", desc:"Zipcar Application",          cat:"Transport",           amount:15.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-07", desc:"Calvin Klein",                cat:"Shopping",            amount:35.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-08", desc:"Royal Free London",           cat:"Healthcare",          amount:34.43,  dir:"out", month:"Oct '25" },
  { date:"2025-10-06", desc:"Caffe Nero",                  cat:"Eating Out & Cafes",  amount:6.40,   dir:"out", month:"Oct '25" },
  { date:"2025-10-06", desc:"Blackstock Pub",              cat:"Entertainment & Nights Out", amount:14.40, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"O2 Phone Bill",               cat:"Phone Bill",          amount:37.64,  dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Fitness First / PureGym",     cat:"Gym & Fitness",       amount:76.50,  dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Transport (Oct total)",       cat:"Transport",           amount:164.61, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Groceries (Oct total)",       cat:"Groceries",           amount:355.93, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Eating Out (Oct total)",      cat:"Eating Out & Cafes",  amount:107.64, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Other spending (Oct)",        cat:"Other",               amount:1134.63,dir:"out", month:"Oct '25" },
  // NOVEMBER
  { date:"2025-11-03", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:975.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"Family Support (Nov)",        cat:"Family Support",      amount:493.81, dir:"in",  month:"Nov '25" },
  { date:"2025-11-06", desc:"UCL Stipend (Nov)",           cat:"Stipend / Grants",    amount:300.00, dir:"in",  month:"Nov '25" },
  { date:"2025-11-03", desc:"Family Transfer (Nov)",       cat:"Family Support",      amount:150.00, dir:"in",  month:"Nov '25" },
  { date:"2025-11-03", desc:"Simmons Bars (3 charges)",    cat:"Entertainment & Nights Out", amount:78.50, dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"Uber Trip",                   cat:"Transport",           amount:23.99,  dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"HD Cutz (haircut)",           cat:"Entertainment & Nights Out", amount:36.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"Trainline",                   cat:"Transport",           amount:25.20,  dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"Apple.com/bill",              cat:"Subscriptions",       amount:19.99,  dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"The Whittington Hospital",    cat:"Healthcare",          amount:69.82,  dir:"out", month:"Nov '25" },
  { date:"2025-11-04", desc:"Boohoo.com (clothing)",       cat:"Shopping",            amount:62.48,  dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"O2 Phone Bill",               cat:"Phone Bill",          amount:40.96,  dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Fitness First / PureGym",     cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Transport (Nov total)",       cat:"Transport",           amount:184.71, dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Groceries (Nov total)",       cat:"Groceries",           amount:217.98, dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Eating Out (Nov total)",      cat:"Eating Out & Cafes",  amount:115.79, dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Other spending (Nov)",        cat:"Other",               amount:561.74, dir:"out", month:"Nov '25" },
  // DECEMBER
  { date:"2025-12-02", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:975.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-01", desc:"NHS Bursary",                 cat:"NHS Bursary",         amount:1537.00,dir:"in",  month:"Dec '25" },
  { date:"2025-12-01", desc:"Family Support (Dec)",        cat:"Family Support",      amount:325.00, dir:"in",  month:"Dec '25" },
  { date:"2025-12-01", desc:"UCL Stipend (Dec)",           cat:"Stipend / Grants",    amount:300.00, dir:"in",  month:"Dec '25" },
  { date:"2025-12-01", desc:"Nottingham trip (bars/food)", cat:"Entertainment & Nights Out", amount:40.80, dir:"out", month:"Dec '25" },
  { date:"2025-12-01", desc:"Bierkeller Nottingham",       cat:"Entertainment & Nights Out", amount:23.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-01", desc:"Apple.com/bill",              cat:"Subscriptions",       amount:19.99,  dir:"out", month:"Dec '25" },
  { date:"2025-12-02", desc:"Cynthia's",                   cat:"Eating Out & Cafes",  amount:11.99,  dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"O2 Phone Bill",               cat:"Phone Bill",          amount:37.64,  dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Fitness First / PureGym",     cat:"Gym & Fitness",       amount:88.99,  dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Transport (Dec total)",       cat:"Transport",           amount:205.90, dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Groceries (Dec total)",       cat:"Groceries",           amount:209.81, dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Eating Out (Dec total)",      cat:"Eating Out & Cafes",  amount:220.48, dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Other spending (Dec)",        cat:"Other",               amount:444.17, dir:"out", month:"Dec '25" },
  // JANUARY 2026
  { date:"2026-01-05", desc:"Thomas Knight (Rent)",        cat:"Rent",                amount:975.00, dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"UCL / SLC Disbursement",      cat:"Stipend / Grants",    amount:1575.45,dir:"in",  month:"Jan '26" },
  { date:"2026-01-02", desc:"Family Support (Jan)",        cat:"Family Support",      amount:300.00, dir:"in",  month:"Jan '26" },
  { date:"2026-01-02", desc:"Other Income (Jan)",          cat:"Other Income",        amount:500.00, dir:"in",  month:"Jan '26" },
  { date:"2026-01-05", desc:"LUL Travelcard (monthly)",    cat:"Transport",           amount:172.50, dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"Uber Trip",                   cat:"Transport",           amount:11.93,  dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"Friend Transfer",             cat:"Personal Transfers",  amount:25.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-02", desc:"Amazon Prime",                cat:"Subscriptions",       amount:4.49,   dir:"out", month:"Jan '26" },
  { date:"2026-01-02", desc:"Apple.com/bill",              cat:"Subscriptions",       amount:19.99,  dir:"out", month:"Jan '26" },
  { date:"2026-01-08", desc:"Apple.com/bill (2nd)",        cat:"Subscriptions",       amount:8.99,   dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"Flat Iron TCR",               cat:"Eating Out & Cafes",  amount:29.07,  dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"250 ER Restaurant (daily)",   cat:"Eating Out & Cafes",  amount:32.45,  dir:"out", month:"Jan '26" },
  { date:"2026-01-12", desc:"Royal Free London",           cat:"Healthcare",          amount:8.54,   dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"O2 Phone Bill",               cat:"Phone Bill",          amount:37.64,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Fitness First / PureGym",     cat:"Gym & Fitness",       amount:69.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Transport (rest of Jan)",     cat:"Transport",           amount:92.28,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Groceries (Jan total)",       cat:"Groceries",           amount:139.20, dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Other spending (Jan)",        cat:"Other",               amount:189.50, dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Entertainment (Jan total)",   cat:"Entertainment & Nights Out", amount:80.00, dir:"out", month:"Jan '26" },
];

// ── PALETTE ───────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  Rent:"#6366f1", Groceries:"#22c55e", Transport:"#3b82f6", "Eating Out & Cafes":"#f59e0b",
  "Entertainment & Nights Out":"#ec4899", Shopping:"#8b5cf6", Healthcare:"#14b8a6",
  Subscriptions:"#f97316", "Gym & Fitness":"#10b981", "Phone Bill":"#64748b",
  "Personal Transfers":"#a78bfa", Other:"#94a3b8",
  "UCL Stipend":"#4ade80", "NHS Bursary":"#38bdf8", "Family Support":"#60a5fa",
  "Student Loan":"#c084fc", "Other Income":"#94a3b8", "Stipend / Grants":"#4ade80",
};
const INC_COLORS = ["#4ade80","#38bdf8","#60a5fa","#c084fc","#94a3b8","#f9a8d4"];

import { fmt, fmtK, CAT_RULES, INC_RULES, autocat, autocatInc } from "./utils/finance.js";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-sm min-w-36">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color}} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="font-bold">{typeof p.value==="number"?fmt(p.value):p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── FORECAST DEFAULTS ────────────────────────────────────────────────────────
const DEFAULT_FIXED = [
  { id:"rent",    label:"Rent",                        amount:975,   icon:Home },
  { id:"phone",   label:"Phone Bill (O2)",              amount:37.64, icon:Smartphone },
  { id:"spotify", label:"Spotify Family Plan",          amount:21.99, icon:Music,    note:"↑ £21.99 since Nov 2025" },
  { id:"netflix", label:"Netflix Standard (2 screens)", amount:12.99, icon:Tv },
  { id:"apple",   label:"Apple Services",               amount:19.99, icon:Cloud,    note:"iCloud/TV+" },
  { id:"gym",     label:"Gym & Fitness",                amount:69.00, icon:Dumbbell },
  { id:"amazon",  label:"Amazon Prime",                 amount:4.49,  icon:Package },
];
const DEFAULT_VAR = [
  { id:"groceries", label:"Groceries (£40/wk)",     amount:173.33, icon:ShoppingCart },
  { id:"transport", label:"Transport",               amount:172.50, icon:Bus },
  { id:"eatingout", label:"Eating Out & Cafes",      amount:120.00, icon:UtensilsCrossed },
  { id:"entertain", label:"Entertainment",           amount:60.00,  icon:Film },
  { id:"shopping",  label:"Shopping",                amount:60.00,  icon:ShoppingBag },
  { id:"other",     label:"Other / Misc",            amount:80.00,  icon:Package },
];
const FORECAST_MONTHS = ["Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FORECAST_MONTH_NUMS = [2,3,4,5,6,7,8,9,10,11,12];
const MO_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const THEMES = [
  { id:"indigo",   label:"Indigo",   color:"#6366f1" },
  { id:"midnight", label:"Midnight", color:"#22d3ee" },
  { id:"emerald",  label:"Emerald",  color:"#22c55e" },
  { id:"amber",    label:"Amber",    color:"#f59e0b" },
];

// ── SUBSCRIPTIONS DATA ────────────────────────────────────────────────────────
const SUBSCRIPTIONS = [
  { name:"Spotify Family Plan",    monthly:21.99, annual:263.88, icon:Music,      optional:true },
  { name:"Netflix Standard",       monthly:12.99, annual:155.88, icon:Tv,         optional:true },
  { name:"Apple Services",         monthly:19.99, annual:239.88, icon:Cloud,      optional:true,  note:"iCloud/TV+" },
  { name:"PlayStation Network",    monthly:13.99, annual:167.88, icon:Gamepad2,   optional:true },
  { name:"Amazon Prime",           monthly:4.49,  annual:53.88,  icon:Package,    optional:true },
  { name:"LinkedIn Premium",       monthly:0,     annual:49.99,  icon:Briefcase,  optional:true,  note:"seen once Sep" },
  { name:"O2 Phone",               monthly:37.64, annual:451.68, icon:Smartphone, optional:false, note:"contract" },
  { name:"Fitness First + PureGym",monthly:69.00, annual:828.00, icon:Dumbbell,   optional:true,  note:"TWO gyms!" },
];


const parseCSV = (text) => {
  const { data } = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const txs = [];
  const map = {};

  data.forEach(row => {
    const dateStr = row["Transaction Date"] || row["Date"] || "";
    const desc    = (row["Transaction Description"] || row["Description"] || "").trim();
    const debit   = parseFloat(row["Debit Amount"]  || row["Debit"]  || 0) || 0;
    const credit  = parseFloat(row["Credit Amount"] || row["Credit"] || 0) || 0;
    const bal     = parseFloat(row["Balance"] || 0) || 0;
    if (!dateStr || (!debit && !credit)) return;

    const parts = dateStr.includes("/") ? dateStr.split("/") : dateStr.split("-");
    // Handle DD/MM/YYYY and YYYY-MM-DD
    const [dd, mm, yyyy] = parts.length === 3 && parts[0].length === 4
      ? [parts[2], parts[1], parts[0]]   // YYYY-MM-DD
      : [parts[0], parts[1], parts[2]];  // DD/MM/YYYY
    if (!dd || !mm || !yyyy) return;

    const label = `${MO[parseInt(mm) - 1]} '${yyyy.slice(2)}`;
    const iso   = `${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;

    if (!map[label]) {
      // Lloyds exports newest-first: first seen balance = month-end balance ✓
      map[label] = { income:0, spending:0, cats:{}, incSrc:{}, balanceEnd: bal,
                     monthNum: parseInt(mm), yearNum: parseInt(yyyy) };
    }

    if (credit > 0) {
      const src = autocatInc(desc);
      map[label].income += credit;
      map[label].incSrc[src] = (map[label].incSrc[src] || 0) + credit;
      txs.push({ date: iso, desc, cat: src, amount: Math.round(credit*100)/100, dir:"in",  month: label });
    }
    if (debit > 0) {
      const cat = autocat(desc);
      map[label].spending += debit;
      map[label].cats[cat] = (map[label].cats[cat] || 0) + debit;
      txs.push({ date: iso, desc, cat, amount: Math.round(debit*100)/100,       dir:"out", month: label });
    }
  });

  const months = Object.entries(map)
    .sort((a,b) => a[1].yearNum !== b[1].yearNum
      ? a[1].yearNum - b[1].yearNum : a[1].monthNum - b[1].monthNum);

  const summary    = months.map(([label, d]) => ({
    month: label.split(" ")[0], label,
    income:     Math.round(d.income   * 100) / 100,
    spending:   Math.round(d.spending * 100) / 100,
    net:        Math.round((d.income - d.spending) * 100) / 100,
    balanceEnd: Math.round(d.balanceEnd * 100) / 100,
  }));
  const categories = Object.fromEntries(months.map(([l, d]) => [l, d.cats]));
  const income     = Object.fromEntries(months.map(([l, d]) => [l, d.incSrc]));
  const lastBal    = months[months.length - 1]?.[1]?.balanceEnd ?? 0;

  return {
    summary, categories, income,
    transactions: txs.sort((a,b) => a.date.localeCompare(b.date)),
    currentBalance: lastBal,
    monthCount: months.length,
  };
};

// ── MERGE IMPORTED DATA WITH EXISTING STORED DATA ────────────────────────────
const mergeData = (existing, incoming) => {
  if (!existing) return incoming;

  // Summaries: incoming overwrites same month label, otherwise keep both
  const summaryMap = {};
  [...existing.summary, ...incoming.summary].forEach(m => { summaryMap[m.label] = m; });
  const summary = Object.values(summaryMap).sort((a, b) => {
    const idx = l => { const [mo, yr] = l.split(" '"); return parseInt(yr) * 12 + MO_ABBR.indexOf(mo); };
    return idx(a.label) - idx(b.label);
  });

  // Categories + income: incoming overwrites same month key
  const categories = { ...existing.categories, ...incoming.categories };
  const income     = { ...existing.income,     ...incoming.income };

  // Transactions: deduplicate by date+desc+amount, sort chronologically
  const seen = new Set();
  const transactions = [];
  [...existing.transactions, ...incoming.transactions].forEach(tx => {
    const key = `${tx.date}:${tx.desc}:${tx.amount}`;
    if (!seen.has(key)) { seen.add(key); transactions.push(tx); }
  });
  transactions.sort((a, b) => a.date.localeCompare(b.date));

  return { summary, categories, income, transactions,
           currentBalance: incoming.currentBalance, monthCount: summary.length };
};

// ── ANIMATED NUMBER ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, format = fmt }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    prevRef.current = end;
    if (Math.abs(end - start) < 0.01) return;
    const duration = 700;
    const startTime = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * ease);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{format(display)}</span>;
}

// ── OTHER DRILL-DOWN MODAL ────────────────────────────────────────────────────
const ALL_CAT_NAMES = [
  "Rent","Groceries","Transport","Eating Out & Cafes","Entertainment & Nights Out",
  "Shopping","Healthcare","Subscriptions","Gym & Fitness","Phone Bill","Personal Transfers","Other",
];

function OtherDrillModal({ month, transactions, onClose, onReassign }) {
  const otherTxs = transactions.filter(t => t.cat === "Other" && t.month === month && t.dir === "out");
  const [edits, setEdits] = useState({});
  const changed = Object.keys(edits).filter(k => edits[k] !== "Other").length;

  if (otherTxs.length === 0) return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-2">Other — {month}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">No individual "Other" transactions for this month. The demo data uses aggregated monthly totals. Import your own CSV to see individual transactions here.</p>
        <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-all">Close</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Other — {month}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{otherTxs.length} unclassified · reassign categories using the dropdowns</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white ml-4"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 mb-4">
          {otherTxs.map((tx, idx) => (
            <div key={`${tx.date}:${tx.desc}:${tx.amount}`} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${edits[idx] && edits[idx] !== "Other" ? "bg-indigo-900/30 border border-indigo-800/50" : "bg-gray-800"}`}>
              <span className="text-gray-500 text-xs w-12 flex-shrink-0">{tx.date.slice(5)}</span>
              <span className="flex-1 text-sm text-gray-200 truncate">{tx.desc}</span>
              <span className="text-white font-semibold text-sm flex-shrink-0 mr-1">-£{tx.amount.toFixed(2)}</span>
              <select value={edits[idx] ?? "Other"}
                onChange={e => setEdits(p => ({...p, [idx]: e.target.value}))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 flex-shrink-0">
                {ALL_CAT_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-3 border-t border-gray-800">
          <button onClick={() => { onReassign(otherTxs, edits); onClose(); }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2">
            <Check size={14}/> Apply {changed} change{changed !== 1 ? "s" : ""}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:border-gray-500 transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── GOAL INPUT WITH SUCCESS FEEDBACK ─────────────────────────────────────────
function GoalInput({ goal, setGoals }) {
  const [flash, setFlash] = useState(null); // e.g. "+£50"
  return (
    <div className="mt-3 flex gap-2 items-center">
      <input type="number" placeholder="Add saved amount £" step="10" min="0"
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
        onKeyDown={e => {
          if (e.key === "Enter") {
            const v = parseFloat(e.target.value) || 0;
            if (v <= 0) return;
            setGoals(prev => prev.map(g => g.id === goal.id ? {...g, saved: Math.min(g.target, g.saved + v)} : g));
            setFlash(`+${v % 1 === 0 ? `£${v}` : `£${v.toFixed(2)}`}`);
            setTimeout(() => setFlash(null), 2000);
            e.target.value = "";
          }
        }}/>
      {flash
        ? <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all"><Check size={12}/> {flash} saved</span>
        : <span className="text-gray-500 text-xs">Press Enter to log</span>}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function SpendingTracker() {
  const [tab, setTab]             = useState("dashboard");
  const [themeId, setThemeId]     = useState(() => localStorage.getItem("theme") ?? "indigo");
  const [selMonth, setSelMonth]   = useState("Jan '26");
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterDir, setFilterDir] = useState("All");
  const [fixedCosts, setFixedCosts]         = useState(DEFAULT_FIXED);
  const [varCosts, setVarCosts]             = useState(DEFAULT_VAR);
  const [monthlyIncome, setMonthlyIncome]   = useState(2200);
  const [horizonMonths, setHorizonMonths]   = useState(6);
  const [planView, setPlanView]             = useState("forecast");
  const [goals, setGoals] = useState(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem("goalSaved") ?? "{}"); } catch { return {}; } })();
    return [
      { id:1, name:"Emergency Fund", icon:Shield, target:3000, date:"Jun 2026", saved: saved[1] ?? 0 },
      { id:2, name:"Summer Holiday", icon:Plane,  target:800,  date:"Jul 2026", saved: saved[2] ?? 0 },
      { id:3, name:"New Laptop",     icon:Laptop, target:1200, date:"Sep 2026", saved: saved[3] ?? 0 },
    ];
  });
  // subToggles: true = marked for cancellation, false = keep
  const [subToggles, setSubToggles]         = useState({});
  const [affordabilityItem, setAffordabilityItem]   = useState("");
  const [affordabilityAmount, setAffordabilityAmount] = useState("");
  const [affordabilityDate, setAffordabilityDate]     = useState("");
  const [spreadMonths, setSpreadMonths]     = useState(6);
  const [importedData, setImportedData]     = useState(null);
  const [showImport, setShowImport]         = useState(false);
  const [dragOver, setDragOver]             = useState(false);
  const [importPreview, setImportPreview]   = useState(null);
  const [otherDrillMonth, setOtherDrillMonth] = useState(null);
  const [weeklyView, setWeeklyView]         = useState(false);
  const [txCatOverrides, setTxCatOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem("catOverrides") ?? "{}"); } catch { return {}; }
  });
  const [bannerDismissed, setBannerDismissed] = useState(() => !!localStorage.getItem("bannerDismissed"));
  const [importSuccess, setImportSuccess]     = useState(false);
  const csvInputRef                         = useRef(null);
  const overviewRef                         = useRef(null);

  // ── ACTIVE DATA — shadows module-level defaults when CSV is loaded ─────────
  const MONTHLY_SUMMARY  = importedData?.summary ?? DEFAULT_MONTHLY_SUMMARY;
  const INCOME_BREAKDOWN = importedData?.income  ?? DEFAULT_INCOME_BREAKDOWN;
  const ALL_TRANSACTIONS = useMemo(() => {
    const raw = importedData?.transactions ?? DEFAULT_ALL_TRANSACTIONS;
    if (Object.keys(txCatOverrides).length === 0) return raw;
    return raw.map(tx => {
      const key = `${tx.date}:${tx.desc}`;
      return txCatOverrides[key] ? { ...tx, cat: txCatOverrides[key] } : tx;
    });
  }, [importedData, txCatOverrides]);
  const MONTHLY_CATEGORIES = useMemo(() => {
    if (Object.keys(txCatOverrides).length === 0) {
      return importedData?.categories ?? DEFAULT_MONTHLY_CATEGORIES;
    }
    const result = {};
    ALL_TRANSACTIONS.forEach(tx => {
      if (tx.dir !== "out") return;
      if (!result[tx.month]) result[tx.month] = {};
      result[tx.month][tx.cat] = (result[tx.month][tx.cat] || 0) + Math.round(tx.amount * 100) / 100;
    });
    return result;
  }, [ALL_TRANSACTIONS, importedData, txCatOverrides]);
  const MONTHS             = MONTHLY_SUMMARY.map(m => m.label);

  // ── RESTORE FROM localStorage ON MOUNT ──────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("spendingData");
    if (saved) {
      try { setImportedData(JSON.parse(saved)); }
      catch { localStorage.removeItem("spendingData"); }
    }
  }, []);

  // ── PERSIST GOAL SAVED AMOUNTS ──────────────────────────────────────────────
  useEffect(() => {
    const amounts = Object.fromEntries(goals.map(g => [g.id, g.saved]));
    localStorage.setItem("goalSaved", JSON.stringify(amounts));
  }, [goals]);

  // ── SYNC selMonth WHEN DATA CHANGES ────────────────────────────────────────
  useEffect(() => {
    const labels = MONTHLY_SUMMARY.map(m => m.label);
    if (!labels.includes(selMonth)) {
      setSelMonth(labels[labels.length - 1] ?? selMonth);
    }
  }, [importedData]);

  // ── CSV HANDLER ───────────────────────────────────────────────────────────
  const handleCSVFile = (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".csv")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try { setImportPreview(parseCSV(e.target.result)); }
      catch (err) { console.error("CSV parse error:", err); }
    };
    reader.readAsText(file);
  };

  // ── CATEGORY TOTALS (hoisted — needed by spendingDNA below) ─────────────
  const catTotals = useMemo(() => {
    const t = {};
    Object.values(MONTHLY_CATEGORIES).forEach(mo =>
      Object.entries(mo).forEach(([c, v]) => { t[c] = (t[c] || 0) + v; })
    );
    return Object.entries(t).sort((a, b) => b[1] - a[1]);
  }, [MONTHLY_CATEGORIES]);

  // ── DERIVED ──────────────────────────────────────────────────────────────
  const totalFixed      = fixedCosts.reduce((s,c) => s+c.amount, 0);
  const totalVar        = varCosts.reduce((s,c) => s+c.amount, 0);
  const totalProjected  = totalFixed + totalVar;
  const projectedNet    = monthlyIncome - totalProjected;

  const historicIncome  = MONTHLY_SUMMARY.reduce((s,m) => s+m.income, 0);
  const historicSpend   = MONTHLY_SUMMARY.reduce((s,m) => s+m.spending, 0);
  const avgSpend        = historicSpend / MONTHLY_SUMMARY.length;
  const avgIncome       = historicIncome / MONTHLY_SUMMARY.length;
  const currentBalance  = importedData?.currentBalance ?? 2223.62;

  const runway = currentBalance / avgSpend;
  const leftToSpend = currentBalance - totalFixed;
  const ageOfMoney = Math.round(currentBalance / (avgSpend / 30));
  const worstMonth = [...MONTHLY_SUMMARY].sort((a,b) => a.net - b.net)[0];
  const bestMonth  = [...MONTHLY_SUMMARY].sort((a,b) => b.net - a.net)[0];

  const monthOverMonthDeltas = useMemo(() => {
    const months = MONTHLY_SUMMARY.map(m => m.label);
    const latest = months[months.length - 1];   // Jan '26
    const prev   = months[months.length - 2];   // Dec '25
    const latestCats = MONTHLY_CATEGORIES[latest] || {};
    const prevCats   = MONTHLY_CATEGORIES[prev]   || {};
    const deltas = {};
    const allKeys = new Set([...Object.keys(latestCats), ...Object.keys(prevCats)]);
    allKeys.forEach(k => {
      deltas[k] = (latestCats[k] || 0) - (prevCats[k] || 0);
    });
    return deltas;
  }, [MONTHLY_CATEGORIES]);

  const spendingDNA = useMemo(() => {
    const eatOut   = catTotals.find(([c]) => c === "Eating Out & Cafes")?.[1] || 0;
    const entert   = catTotals.find(([c]) => c === "Entertainment & Nights Out")?.[1] || 0;
    const social   = eatOut + entert;
    const socialPct = (social / historicSpend) * 100;

    let archetype, trait, roast;
    if (socialPct > 20) {
      archetype = "The Social Economist";
      trait = `${socialPct.toFixed(0)}% of your spending goes on social life and experiences`;
      roast = `Your worst month had ${fmt(worstMonth.income)} coming in and ${fmt(worstMonth.spending)} going out. The bars didn't notice. Your balance did.`;
    } else {
      archetype = "The Steady Planner";
      trait = "You balance experiences with discipline better than most";
      roast = "You're actually doing okay — which is suspicious.";
    }
    return { archetype, trait, roast,
      socialPct: socialPct.toFixed(1),
      bestMonth: bestMonth ? `${bestMonth.label} — best net +${fmt(bestMonth.net)}` : "",
      worstMonth: worstMonth ? `${worstMonth.label} — only ${fmt(worstMonth.income)} in, ${fmt(worstMonth.spending)} out` : "",
    };
  }, [catTotals, historicSpend]);

  // Income reliability
  const incomeVariance = useMemo(() => {
    const incomes = MONTHLY_SUMMARY.map(m => m.income);
    if (incomes.length === 0) return { mean: 0, stdDev: 0, cv: 0 };
    const mean = incomes.reduce((a,b) => a+b, 0) / incomes.length;
    const variance = incomes.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / incomes.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev, cv: mean > 0 ? stdDev / mean : 0 };
  }, [importedData]);

  const reliabilityScore = useMemo(() => {
    const bufferScore = Math.max(0, Math.min(10, (currentBalance / 2500) * 10));
    const cvScore     = Math.max(0, Math.min(10, 10 - (incomeVariance.cv * 20)));
    return Math.round((bufferScore + cvScore) / 2);
  }, [incomeVariance, currentBalance]);

  const financialHealthScore = useMemo(() => {
    const positiveMonths = MONTHLY_SUMMARY.filter(m => m.net > 0).length;
    const positiveScore  = (positiveMonths / MONTHLY_SUMMARY.length) * 100;
    const runwayScore    = Math.min(runway * 50, 100);
    const totalSubAnnual = SUBSCRIPTIONS.reduce((s, sub) => s + sub.annual, 0);
    const subPercentage  = (totalSubAnnual / historicIncome) * 100;
    const subScore       = Math.max(0, 100 - (subPercentage * 2));
    return Math.round((positiveScore + runwayScore + subScore) / 3);
  }, [runway, historicIncome, importedData]);

  // ── FORECAST ─────────────────────────────────────────────────────────────
  const lastEntry    = MONTHLY_SUMMARY[MONTHLY_SUMMARY.length - 1];
  const lastMoIdx    = lastEntry ? MO_ABBR.indexOf(lastEntry.label.split(" ")[0]) : 0;
  const lastYear     = lastEntry ? 2000 + parseInt(lastEntry.label.split("'")[1].trim()) : 2026;
  const fcStartIdx   = (lastMoIdx + 1) % 12;
  const fcStartYear  = lastMoIdx === 11 ? lastYear + 1 : lastYear;

  const forecastData = useMemo(() => {
    let balance = currentBalance;
    return Array.from({ length: horizonMonths }, (_, idx) => {
      const mIdx = (fcStartIdx + idx) % 12;
      const yr   = fcStartYear + Math.floor((fcStartIdx + idx) / 12);
      const transportTarget = varCosts.find(c => c.id==="transport")?.amount || 172.50;
      const adjusted = totalProjected;
      balance = balance + monthlyIncome - adjusted;
      return {
        month: `${MO_ABBR[mIdx]} '${String(yr).slice(2)}`,
        Income: monthlyIncome,
        Spending: Math.round(adjusted),
        Net: Math.round(monthlyIncome - adjusted),
        Balance: Math.round(balance),
      };
    });
  }, [totalProjected, monthlyIncome, varCosts, horizonMonths, currentBalance, fcStartIdx, fcStartYear]);

  const balanceBridge = [
    ...MONTHLY_SUMMARY.map(m => ({ label:m.label, Balance:Math.round(m.balanceEnd), actual:true })),
    ...forecastData.map(d => ({ label:d.month, Balance:d.Balance, actual:false })),
  ];

  // ── PURCHASE IMPACT SIMULATOR ─────────────────────────────────────────────
  // This is the full month-by-month simulation of what happens if you make a purchase.
  // It generates two parallel balance lines: baseline (no purchase) vs with-purchase.
  const purchaseSimulation = useMemo(() => {
    const amt = parseFloat(affordabilityAmount);
    if (!amt || isNaN(amt) || amt <= 0 || !affordabilityDate) return null;

    const parts = affordabilityDate.split("-");
    if (parts.length < 2) return null;
    const purchaseYear  = parseInt(parts[0]);
    const purchaseMonthNum = parseInt(parts[1]); // 1-based

    if (purchaseMonthNum < 1 || purchaseMonthNum > 12) return null;

    const monthlySpend    = totalProjected;
    const monthlyNet      = monthlyIncome - monthlySpend;

    let balBase = currentBalance;
    let balWith = currentBalance;

    const allMonths = FORECAST_MONTHS.map((m, idx) => {
      const mNum = FORECAST_MONTH_NUMS[idx];
      balBase += monthlyNet;

      const isPurchaseMonth = (purchaseYear === 2026 && purchaseMonthNum === mNum);
      if (isPurchaseMonth) {
        balWith += monthlyNet - amt;
      } else {
        balWith += monthlyNet;
      }

      return {
        month: `${m} '26`,
        "Without Purchase": Math.round(balBase),
        "With Purchase":    Math.round(balWith),
        isPurchase: isPurchaseMonth,
      };
    });

    // Show 1 month before purchase and up to 5 months after
    const purchaseIdx = FORECAST_MONTH_NUMS.indexOf(purchaseMonthNum);
    const showFrom    = Math.max(0, purchaseIdx - 1);
    const showTo      = Math.min(FORECAST_MONTHS.length, purchaseIdx + 6);
    const simMonths   = allMonths.slice(showFrom, showTo);

    const lowestWithPurchase = Math.min(...allMonths.map(m => m["With Purchase"]));
    const purchaseMonthLabel = `${FORECAST_MONTHS[purchaseIdx]} '26`;

    // 3-tier verdict
    const verdict =
      lowestWithPurchase >= 500 ? "COMFORTABLE" :
      lowestWithPurchase >= 0   ? "TIGHT"        : "SHORTFALL";

    // When does balance rise back above £500 after the purchase dip?
    const recoversAt = allMonths.slice(purchaseIdx + 1).find(m => m["With Purchase"] >= 500);

    // If we spread cost over spreadMonths, what's the extra per month?
    const spreadMonthlyExtra = (amt / spreadMonths).toFixed(2);

    return {
      simMonths,
      amt,
      monthlyNet: Math.round(monthlyNet),
      lowestWithPurchase,
      verdict,
      purchaseMonthLabel,
      recoversAt: recoversAt?.month || null,
      spreadMonthlyExtra,
      balanceAfterPurchase: Math.round(currentBalance + monthlyNet - amt),
    };
  }, [affordabilityAmount, affordabilityDate, totalProjected, monthlyIncome, varCosts, spreadMonths, currentBalance]);

  // ── SUBSCRIPTION SAVINGS ──────────────────────────────────────────────────
  const cancelledAnnualSavings = useMemo(() => {
    return SUBSCRIPTIONS.reduce((total, sub, idx) => {
      return subToggles[idx] ? total + sub.annual : total;
    }, 0);
  }, [subToggles]);

  const totalSubAnnual = SUBSCRIPTIONS.reduce((s, sub) => s + sub.annual, 0);

  const selCats = useMemo(() =>
    Object.entries(MONTHLY_CATEGORIES[selMonth] || {}).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
  , [selMonth, MONTHLY_CATEGORIES]);

  const allCats = useMemo(() => {
    const s = new Set(["All"]);
    ALL_TRANSACTIONS.forEach(t => s.add(t.cat));
    return [...s];
  }, [ALL_TRANSACTIONS]);

  const filteredTxs = useMemo(() => ALL_TRANSACTIONS.filter(t => {
    const ms = t.desc.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase());
    return ms && (filterCat === "All" || t.cat === filterCat) && (filterDir === "All" || t.dir === filterDir);
  }), [search, filterCat, filterDir, ALL_TRANSACTIONS]);

  // ── WEEKLY BREAKDOWN ─────────────────────────────────────────────────────
  const weeklyBreakdown = useMemo(() => {
    const txs = ALL_TRANSACTIONS.filter(t => t.month === selMonth && t.dir === "out");
    const getWeek = (iso) => {
      const d = new Date(iso);
      const jan4 = new Date(d.getFullYear(), 0, 4);
      const startW1 = new Date(jan4);
      startW1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
      return `W${Math.floor((d - startW1) / 604800000) + 1}`;
    };
    const weeks = {};
    txs.forEach(tx => {
      const w = getWeek(tx.date);
      weeks[w] = (weeks[w] || 0) + tx.amount;
    });
    return Object.entries(weeks)
      .sort((a, b) => parseInt(a[0].slice(1)) - parseInt(b[0].slice(1)))
      .map(([week, Spending]) => ({ week, Spending: Math.round(Spending * 100) / 100 }));
  }, [selMonth, ALL_TRANSACTIONS]);

  // ── LAST MONTH REVIEW ────────────────────────────────────────────────────
  const lastMonthReview = useMemo(() => {
    const lastMo = MONTHLY_SUMMARY[MONTHLY_SUMMARY.length - 1];
    if (!lastMo) return null;
    const cats = MONTHLY_CATEGORIES[lastMo.label] || {};
    const budgetMap = {};
    [...fixedCosts, ...varCosts].forEach(c => {
      // Match budget items to category names heuristically
      if (c.id === "rent")       budgetMap["Rent"] = c.amount;
      if (c.id === "groceries")  budgetMap["Groceries"] = c.amount;
      if (c.id === "transport")  budgetMap["Transport"] = c.amount;
      if (c.id === "eatingout")  budgetMap["Eating Out & Cafes"] = c.amount;
      if (c.id === "entertain")  budgetMap["Entertainment & Nights Out"] = c.amount;
      if (c.id === "shopping")   budgetMap["Shopping"] = c.amount;
      if (c.id === "gym")        budgetMap["Gym & Fitness"] = c.amount;
      if (c.id === "phone")      budgetMap["Phone Bill"] = c.amount;
    });
    const comparisons = Object.entries(budgetMap).map(([cat, budget]) => {
      const actual = cats[cat] || 0;
      return { cat, budget, actual, diff: actual - budget, over: actual > budget };
    }).sort((a, b) => b.diff - a.diff);
    const onBudget = comparisons.filter(c => !c.over).length;
    return { label: lastMo.label, income: lastMo.income, spending: lastMo.spending, net: lastMo.net, comparisons, onBudget, total: comparisons.length };
  }, [MONTHLY_SUMMARY, MONTHLY_CATEGORIES, fixedCosts, varCosts]);

  // ── BUDGET PATTERNS (consistency tracking) ───────────────────────────────
  const budgetPatterns = useMemo(() => {
    const budgetMap = {};
    [...fixedCosts, ...varCosts].forEach(c => {
      if (c.id === "groceries")  budgetMap["Groceries"] = c.amount;
      if (c.id === "transport")  budgetMap["Transport"] = c.amount;
      if (c.id === "eatingout")  budgetMap["Eating Out & Cafes"] = c.amount;
      if (c.id === "entertain")  budgetMap["Entertainment & Nights Out"] = c.amount;
      if (c.id === "shopping")   budgetMap["Shopping"] = c.amount;
    });
    return Object.entries(budgetMap).map(([cat, budget]) => {
      let monthsOver = 0, total = 0, totalActual = 0;
      MONTHLY_SUMMARY.forEach(mo => {
        const actual = (MONTHLY_CATEGORIES[mo.label] || {})[cat] || 0;
        if (actual > 0) { total++; totalActual += actual; if (actual > budget) monthsOver++; }
      });
      const avgActual = total > 0 ? totalActual / total : 0;
      const pct = total > 0 ? monthsOver / total : 0;
      return { cat, budget, avgActual, monthsOver, total, pct };
    }).filter(p => p.total > 0).sort((a, b) => b.pct - a.pct);
  }, [MONTHLY_SUMMARY, MONTHLY_CATEGORIES, fixedCosts, varCosts]);

  const monthBreach  = forecastData.find(d => d.Balance < 0);
  const updateFixed  = (id, v) => setFixedCosts(p => p.map(c => c.id===id ? {...c, amount:Number(v)} : c));
  const updateVar    = (id, v) => setVarCosts(p => p.map(c => c.id===id ? {...c, amount:Number(v)} : c));
  const bCol = b => b > 1000 ? "#22c55e" : b > 300 ? "#f59e0b" : "#ef4444";

  // ── EXPORT PNG ───────────────────────────────────────────────────────────
  const handleExportPNG = async () => {
    if (!overviewRef.current) return;
    const canvas = await html2canvas(overviewRef.current, {
      backgroundColor: "#030712",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = `spending-overview-${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ── REASSIGN OTHER TRANSACTIONS ──────────────────────────────────────────
  const handleReassign = (otherTxs, edits) => {
    const newOverrides = { ...txCatOverrides };
    Object.entries(edits).forEach(([idx, newCat]) => {
      if (newCat !== "Other") {
        const tx = otherTxs[parseInt(idx)];
        newOverrides[`${tx.date}:${tx.desc}`] = newCat;
      }
    });
    setTxCatOverrides(newOverrides);
    try { localStorage.setItem("catOverrides", JSON.stringify(newOverrides)); } catch {}
  };

  const TABS = [
    { id:"dashboard",  label:"Dashboard",      Icon: BarChart3  },
    { id:"plan",       label:"Plan",           Icon: TrendingUp },
    { id:"breakdown",  label:"Breakdown",      Icon: Calendar   },
    { id:"health",     label:"Goals & Health", Icon: Target     },
  ];

  // Verdict colours helper
  const verdictStyle = (v) => ({
    COMFORTABLE: { border:"border-emerald-700", bg:"bg-emerald-900/30", text:"text-emerald-400", label:"COMFORTABLE" },
    TIGHT:       { border:"border-amber-700",   bg:"bg-amber-900/30",   text:"text-amber-400",   label:"PROCEED CAREFULLY" },
    SHORTFALL:   { border:"border-red-700",     bg:"bg-red-900/30",     text:"text-red-400",     label:"NOT YET" },
  }[v] || {});

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4" data-theme={themeId}>
      {/* STICKY BALANCE TICKER */}
      <div className="hidden sm:block fixed top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-3 shadow-xl border border-indigo-500/50 z-50">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Wallet size={11} className="text-white/60"/>
          <span className="text-xs text-white/70 font-medium uppercase tracking-wide">Balance</span>
        </div>
        <div className="text-2xl font-bold text-white"><AnimatedNumber value={currentBalance}/></div>
        <div className="flex items-center gap-1 mt-0.5">
          <Zap size={10} className="text-emerald-300"/>
          <span className="text-xs text-emerald-300"><AnimatedNumber value={leftToSpend} format={n => `£${Math.round(n)}`}/> free</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-5 flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold"><span className="text-indigo-400">£</span> Spending Tracker</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {importedData
                ? `Imported · ${importedData.monthCount} months · ${importedData.transactions.length} transactions`
                : `Sample data · ${MONTHS[0]} – ${MONTHS[MONTHS.length-1]} · ${MONTHS.length} months (demo)`}
            </p>
          </div>
          <div className="flex gap-3 items-end flex-wrap">
            <button onClick={() => setShowImport(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                importedData
                  ? "bg-emerald-900/30 border-emerald-700 text-emerald-300 hover:border-emerald-500"
                  : "bg-indigo-900/30 border-indigo-700 text-indigo-300 hover:border-indigo-500 hover:bg-indigo-900/50"
              }`}>
              {importedData ? <><Check size={13}/> Your Data</> : <><Folder size={13}/> Import CSV</>}
            </button>
            {tab === "dashboard" && (
              <button onClick={handleExportPNG}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all">
                <Download size={13}/> Export PNG
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2">
              {THEMES.map(t => (
                <button key={t.id} title={t.label}
                  onClick={() => { setThemeId(t.id); localStorage.setItem("theme", t.id); }}
                  className={`w-4 h-4 rounded-full transition-all ${themeId === t.id ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-110" : "opacity-50 hover:opacity-90"}`}
                  style={{backgroundColor: t.color}}/>
              ))}
            </div>
            {[
              { label:"Current Balance",  value:fmt(currentBalance),   sub: importedData ? "latest balance" : "31 Jan 2026", color:"text-emerald-400" },
              { label:`${MONTHLY_SUMMARY.length}-Month Total In`, value:fmt(historicIncome), sub:"all income sources", color:"text-blue-400" },
            ].map(c => (
              <div key={c.label} className="bg-gray-900 rounded-xl px-4 py-2.5 text-right">
                <div className="text-xs text-gray-500">{c.label}</div>
                <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
                <div className="text-xs text-gray-600">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1.5 mb-6 bg-gray-900 p-1.5 rounded-xl w-fit flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}>
              <t.Icon size={14}/>{t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ TABS ═══════════════ */}
        <AnimatePresence mode="wait">

        {/* ═══════════════ DASHBOARD ═══════════════ */}
        {tab === "dashboard" && (
          <motion.div key="dashboard" ref={overviewRef}
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{duration:0.18}} className="space-y-5">

            {!importedData && !bannerDismissed && (
              <div className="bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-700/50 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-1">Welcome to Spending Tracker</h2>
                <p className="text-gray-400 text-sm mb-5">Visualise your real bank spending — import a CSV and instantly see where your money goes, forecast your balance, and track goals.</p>
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {[
                    { step:"1", label:"Import", sub:"Drop your bank CSV" },
                    { step:"2", label:"Explore", sub:"Charts auto-populate" },
                    { step:"3", label:"Plan", sub:"Forecast & set goals" },
                  ].map((s, i) => (
                    <div key={s.step} className="flex items-center gap-3">
                      {i > 0 && <ChevronRight size={16} className="text-gray-600 flex-shrink-0"/>}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{s.step}</div>
                        <div>
                          <div className="text-white font-semibold text-sm">{s.label}</div>
                          <div className="text-gray-500 text-xs">{s.sub}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowImport(true)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg">
                    Import Your CSV
                  </button>
                  <button onClick={() => { setBannerDismissed(true); localStorage.setItem("bannerDismissed","1"); }}
                    className="text-gray-500 hover:text-gray-300 text-sm transition-all">
                    Continue with sample data →
                  </button>
                </div>
              </div>
            )}

            {/* ── LEFT TO SPEND + COMMITTED ── */}
            <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
              {/* Hero: Left to Spend */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-5 border border-emerald-700/40 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-emerald-400"/>
                  <span className="text-emerald-300/80 text-xs font-semibold uppercase tracking-wide">Left to Spend</span>
                </div>
                <div className="text-4xl font-black text-white mt-2">{fmt(leftToSpend)}</div>
                <p className="text-emerald-300/60 text-xs mt-2">Balance after all committed bills are covered</p>
              </div>

              {/* Committed this month */}
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <Home size={14} className="text-indigo-400"/>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Committed This Month</span>
                </div>
                <div className="text-4xl font-black text-indigo-400 mt-2">{fmt(totalFixed)}</div>
                <p className="text-gray-500 text-xs mt-2">Rent + phone + subs + gym — goes out regardless</p>
              </div>

              {/* Age of Money */}
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-amber-400"/>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Age of Money</span>
                </div>
                <div className="text-4xl font-black text-amber-400 mt-2">{ageOfMoney} <span className="text-xl font-normal text-amber-400/60">days</span></div>
                <p className="text-gray-500 text-xs mt-2">How old is the money you're spending? Healthy = 30+ days.</p>
              </div>
            </div>

            {/* ── SIMULATOR CTA (signpost to hidden feature) ── */}
            <button onClick={() => setTab("plan")}
              className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-700/50 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600/30 rounded-xl p-2.5"><CreditCard size={18} className="text-indigo-400"/></div>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm flex items-center gap-1.5"><CreditCard size={13}/> Can I afford to buy something?</div>
                  <div className="text-gray-400 text-xs mt-0.5">Run a full month-by-month impact simulation — in the Plan tab</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform"/>
            </button>

            {/* ── LAST MONTH REVIEW CARD ── */}
            {lastMonthReview && (
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2"><Calendar size={15} className="text-indigo-400"/> {lastMonthReview.label} Review</h2>
                    <p className="text-gray-500 text-xs mt-0.5">{lastMonthReview.onBudget} of {lastMonthReview.total} tracked categories on budget</p>
                  </div>
                  <div className={`text-right px-4 py-2 rounded-xl ${lastMonthReview.net >= 0 ? "bg-emerald-900/30 border border-emerald-800" : "bg-red-900/30 border border-red-800"}`}>
                    <div className="text-xs text-gray-500">Net</div>
                    <div className={`text-xl font-bold ${lastMonthReview.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>{lastMonthReview.net >= 0 ? "+" : ""}{fmt(lastMonthReview.net)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {lastMonthReview.comparisons.map(({ cat, budget, actual, diff, over }) => (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: CAT_COLORS[cat] || "#6366f1"}}/>
                      <span className="text-sm text-gray-300 flex-1">{cat}</span>
                      <span className="text-xs text-gray-500">budget {fmt(budget)}</span>
                      <span className={`text-sm font-semibold w-20 text-right ${over ? "text-red-400" : "text-emerald-400"}`}>{fmt(actual)}</span>
                      <span className={`text-xs w-16 text-right ${over ? "text-red-500" : "text-emerald-500"}`}>{over ? "+" : "-"}{fmt(Math.abs(diff))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-4 shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-white/70 text-xs font-medium uppercase tracking-wide">Financial Health</span>
                    <div className="text-3xl font-bold text-white mt-2">{financialHealthScore}</div>
                    <span className="text-white/60 text-xs">out of 100</span>
                  </div>
                  <TrendingUp size={32} className="text-white opacity-40 mt-1"/>
                </div>
                <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500" style={{width:`${financialHealthScore}%`}}/>
                </div>
              </div>

              {[
                { label:`${MONTHLY_SUMMARY.length}-Mo Total Income`,  value:historicIncome, sub:`${MONTHS[0]} – ${MONTHS[MONTHS.length-1]}`, grad:"from-green-700 to-emerald-800", icon:"↑" },
                { label:`${MONTHLY_SUMMARY.length}-Mo Total Spending`, value:historicSpend, sub:`${MONTHS[0]} – ${MONTHS[MONTHS.length-1]}`, grad:"from-red-700 to-rose-800",     icon:"↓" },
                { label:"Avg Monthly Spend",   value:avgSpend,       sub:`${MONTHLY_SUMMARY.length}-month average`,    grad:"from-amber-700 to-orange-800", icon:"≈" },
              ].map(c => (
                <div key={c.label} className={`bg-gradient-to-br ${c.grad} rounded-2xl p-4 shadow-xl`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white/70 text-xs font-medium uppercase tracking-wide">{c.label}</span>
                    <span className="text-lg opacity-60">{c.icon}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{fmt(c.value)}</div>
                  <div className="text-white/50 text-xs mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            <motion.div className="bg-gray-900 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0,duration:0.3}}>
              <h2 className="text-base font-semibold mb-4">Monthly Income vs Spending – Full Picture</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={MONTHLY_SUMMARY.map(m => ({ month:m.label, Income:m.income, Spending:m.spending, Net:m.net }))} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                  <XAxis dataKey="month" tick={{fill:"#9ca3af",fontSize:11}}/>
                  <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                  <Tooltip content={<Tip/>}/>
                  <Legend wrapperStyle={{color:"#9ca3af"}}/>
                  <Bar dataKey="Income"   fill="#22c55e" radius={[5,5,0,0]}/>
                  <Bar dataKey="Spending" fill="#f97316" radius={[5,5,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <div className="grid gap-4" style={{gridTemplateColumns:"1.3fr 1fr"}}>
              <motion.div className="bg-gray-900 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.07,duration:0.3}}>
                <h2 className="text-base font-semibold mb-3">Account Balance (month-end)</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={MONTHLY_SUMMARY.map(m => ({ month:m.label, Balance:m.balanceEnd }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                    <XAxis dataKey="month" tick={{fill:"#9ca3af",fontSize:11}}/>
                    <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                    <Tooltip content={<Tip/>}/>
                    <ReferenceLine y={500} stroke="#f59e0b" strokeDasharray="3 3"/>
                    <Area type="monotone" dataKey="Balance" stroke="#6366f1" fill="#6366f122" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div className="bg-gray-900 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.14,duration:0.3}}>
                <h2 className="text-base font-semibold mb-3">Monthly Net (surplus / deficit)</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY_SUMMARY.map(m => ({ month:m.label, Net:m.net }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                    <XAxis dataKey="month" tick={{fill:"#9ca3af",fontSize:10}}/>
                    <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                    <Tooltip content={<Tip/>}/>
                    <ReferenceLine y={0} stroke="#6b7280"/>
                    <Bar dataKey="Net" radius={[5,5,0,0]}>
                      {MONTHLY_SUMMARY.map((e, i) => <Cell key={i} fill={e.net >= 0 ? "#22c55e" : "#ef4444"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold">Spending Categories – {MONTHLY_SUMMARY.length}-Month Totals</h2>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <ArrowUpRight size={11} className="text-red-400"/> vs Dec '25 &nbsp;
                  <ArrowDownRight size={11} className="text-emerald-400"/> vs Dec '25
                </span>
              </div>
              <div className="space-y-2.5">
                {catTotals.slice(0, 10).map(([cat, total]) => {
                  const pct   = (total / historicSpend) * 100;
                  const delta = monthOverMonthDeltas[cat] || 0;
                  const absDelta = Math.abs(delta);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor: CAT_COLORS[cat] || "#6366f1"}}/>
                          {cat}
                        </span>
                        <span className="flex items-center gap-2">
                          {absDelta > 5 && (
                            <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${delta > 0 ? "bg-red-900/40 text-red-400" : "bg-emerald-900/40 text-emerald-400"}`}>
                              {delta > 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                              {fmt(absDelta)}
                            </span>
                          )}
                          <span className="font-semibold text-white">{fmt(total)} <span className="text-gray-500 font-normal">({pct.toFixed(1)}%)</span></span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full">
                        <div className="h-1.5 rounded-full" style={{width:`${pct}%`, backgroundColor: CAT_COLORS[cat] || "#6366f1"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Search size={15} className="text-gray-400"/> Sample Data Highlights</h2>
              <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr"}}>
                {[
                  { icon:Stethoscope, title:"Irregular income pattern",      body:"Some months include a healthcare bursary on top of the regular stipend — income swings significantly between months. Always plan around the minimum.",  color:"text-sky-400" },
                  { icon:Train,       title:"Fixed transport cost",           body:"A monthly travelcard appears as a precise recurring charge. Transport spikes in months with higher Uber usage — worth tracking separately.", color:"text-blue-400" },
                  { icon:AlertTriangle,title:"One critical deficit month",    body:`${worstMonth?.label}: only ${fmt(worstMonth?.income||0)} in vs ${fmt(worstMonth?.spending||0)} out — a ${fmt(Math.abs(worstMonth?.net||0))} deficit. A strong prior month absorbed the gap.`, color:"text-amber-400" },
                  { icon:TrendingDown, title:"Best month shows what's possible", body:`${bestMonth?.label}: lowest spending in the dataset and a positive net of ${fmt(bestMonth?.net||0)}. Shows what discipline delivers.`,              color:"text-emerald-400" },
                  { icon:Dumbbell,    title:"Duplicate subscription category", body:"Two gym memberships appear simultaneously across multiple months. Consolidating to one would save £400+/year.",              color:"text-orange-400" },
                  { icon:Package,     title:"'Other' category needs review",  body:"One month shows £1,134 in untracked 'Other' spending. Use the drill-down to reassign transactions and get accurate category totals.",   color:"text-purple-400" },
                ].map(i => {
                  const IIcon = i.icon;
                  return (
                  <div key={i.title} className="bg-gray-800 rounded-xl p-4 flex gap-3">
                    <IIcon size={22} className={`flex-shrink-0 mt-0.5 ${i.color}`}/>
                    <div>
                      <div className={`font-semibold text-sm ${i.color} mb-1`}>{i.title}</div>
                      <div className="text-gray-400 text-xs leading-relaxed">{i.body}</div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
            {/* Income by Month — dynamic source names work with any CSV */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><DollarSign size={15} className="text-gray-400"/> Income Sources by Month</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MONTHLY_SUMMARY.map(m => ({ month:m.label, ...INCOME_BREAKDOWN[m.label] }))} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                  <XAxis dataKey="month" tick={{fill:"#9ca3af",fontSize:11}}/>
                  <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                  <Tooltip content={<Tip/>}/>
                  <Legend wrapperStyle={{color:"#9ca3af",fontSize:"11px"}}/>
                  {(() => {
                    const srcs = [...new Set(Object.values(INCOME_BREAKDOWN).flatMap(mo => Object.keys(mo)))];
                    return srcs.map((src, i) => (
                      <Bar key={src} dataKey={src} stackId="a" fill={INC_COLORS[i % INC_COLORS.length]}
                        radius={i === srcs.length - 1 ? [4,4,0,0] : [0,0,0,0]}/>
                    ));
                  })()}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ BREAKDOWN ═══════════════ */}
        {tab === "breakdown" && (
          <motion.div key="breakdown"
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{duration:0.18}} className="space-y-5">
            <div className="flex gap-2 flex-wrap items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {MONTHS.map(m => {
                  const data = MONTHLY_SUMMARY.find(x => x.label === m);
                  const isPositive = data.net >= 0;
                  return (
                    <button key={m} onClick={() => setSelMonth(m)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        selMonth === m
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                          : isPositive
                            ? "bg-green-900/30 border-green-700 text-green-300 hover:text-white"
                            : "bg-red-900/30 border-red-700 text-red-300 hover:text-white"
                      }`}
                    >{m}</button>
                  );
                })}
              </div>
              <div className="flex gap-1 bg-gray-900 p-1 rounded-xl">
                {[["Monthly","M"],["Weekly","W"]].map(([label, key]) => (
                  <button key={key} onClick={() => setWeeklyView(key === "W")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      weeklyView === (key === "W") ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            {(() => {
              const ms = MONTHLY_SUMMARY.find(m => m.label === selMonth);
              if (!ms) return null;
              const incomeData = Object.entries(INCOME_BREAKDOWN[selMonth] || {}).map(([name, value]) => ({ name, value }));
              return (
                <>
                  <div className="grid gap-3" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
                    {[
                      { label:"Income",           value:ms.income,    color:"text-green-400" },
                      { label:"Spending",          value:ms.spending,  color:"text-red-400" },
                      { label:"Net",               value:ms.net,       color:ms.net>=0?"text-emerald-400":"text-rose-400", prefix:ms.net>=0?"+":"-" },
                      { label:"Month-End Balance", value:ms.balanceEnd,color:"text-indigo-400" },
                    ].map(c => (
                      <div key={c.label} className="bg-gray-900 rounded-2xl p-4">
                        <div className="text-gray-400 text-xs mb-1">{c.label}</div>
                        <div className={`text-2xl font-bold ${c.color}`}>{c.prefix || ""}{fmt(c.value)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4" style={{gridTemplateColumns:"1fr 1fr"}}>
                    <motion.div className="bg-gray-900 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0,duration:0.3}}>
                      {!weeklyView ? (
                        <>
                          <h2 className="text-sm font-semibold mb-1">{selMonth} – Spending Breakdown</h2>
                          <p className="text-gray-600 text-xs mb-2">Click <span className="text-gray-400">Other</span> slice to drill down</p>
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie data={selCats.filter(c => c.value > 3)} cx="50%" cy="50%"
                                innerRadius={55} outerRadius={95} dataKey="value" paddingAngle={3}
                                onClick={data => { if (data?.name === "Other") setOtherDrillMonth(selMonth); }}
                                style={{cursor:"pointer"}}>
                                {selCats.map(e => <Cell key={e.name} fill={CAT_COLORS[e.name] || "#6366f1"} stroke="transparent"/>)}
                              </Pie>
                              <Tooltip formatter={v => fmt(v)} contentStyle={{background:"#111827",border:"1px solid #374151",borderRadius:"12px"}}/>
                              <Legend formatter={v => <span style={{color:"#9ca3af",fontSize:"11px"}}>{v}</span>}/>
                            </PieChart>
                          </ResponsiveContainer>
                        </>
                      ) : (
                        <>
                          <h2 className="text-sm font-semibold mb-1">{selMonth} – Weekly Spending</h2>
                          <p className="text-gray-600 text-xs mb-2">Weekly budget = monthly target ÷ 4.33</p>
                          {weeklyBreakdown.length <= 1 && (
                            <p className="text-xs text-amber-400/80 mb-2">Demo data uses monthly aggregates — import your CSV for per-day breakdowns.</p>
                          )}
                          <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={weeklyBreakdown}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                              <XAxis dataKey="week" tick={{fill:"#9ca3af",fontSize:11}}/>
                              <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                              <Tooltip content={<Tip/>}/>
                              <ReferenceLine y={Math.round(totalProjected / 4.33)} stroke="#f59e0b" strokeDasharray="4 4"
                                label={{value:"budget",fill:"#f59e0b",fontSize:9}}/>
                              <Bar dataKey="Spending" fill="#6366f1" radius={[5,5,0,0]}/>
                            </BarChart>
                          </ResponsiveContainer>
                        </>
                      )}
                    </motion.div>
                    <motion.div className="bg-gray-900 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.07,duration:0.3}}>
                      <h2 className="text-sm font-semibold mb-3">{selMonth} – Income Sources</h2>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={incomeData} cx="50%" cy="50%"
                            innerRadius={55} outerRadius={95} dataKey="value" paddingAngle={3}>
                            {incomeData.map((e, i) => <Cell key={e.name} fill={INC_COLORS[i % INC_COLORS.length]} stroke="transparent"/>)}
                          </Pie>
                          <Tooltip formatter={v => fmt(v)} contentStyle={{background:"#111827",border:"1px solid #374151",borderRadius:"12px"}}/>
                          <Legend formatter={v => <span style={{color:"#9ca3af",fontSize:"11px"}}>{v}</span>}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  <div className="bg-gray-900 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-sm font-semibold">Actual vs Budget</h2>
                      <span className="text-xs text-gray-500">based on your Forecast targets</span>
                    </div>
                      {(() => {
                      const budgetMap = {
                        Groceries: varCosts.find(c=>c.id==="groceries")?.amount || 173,
                        Transport: varCosts.find(c=>c.id==="transport")?.amount || 172.50,
                        "Eating Out & Cafes": varCosts.find(c=>c.id==="eatingout")?.amount || 120,
                        "Entertainment & Nights Out": varCosts.find(c=>c.id==="entertain")?.amount || 60,
                        Shopping: varCosts.find(c=>c.id==="shopping")?.amount || 60,
                        Rent: fixedCosts.find(c=>c.id==="rent")?.amount || 975,
                        "Gym & Fitness": fixedCosts.find(c=>c.id==="gym")?.amount || 69,
                        "Phone Bill": fixedCosts.find(c=>c.id==="phone")?.amount || 37.64,
                      };
                      return (
                        <div className="space-y-2 mb-4">
                          {selCats.filter(({name}) => budgetMap[name]).map(({ name, value }) => {
                            const budget = budgetMap[name];
                            const over   = value > budget;
                            const pctOfBudget = Math.min((value / budget) * 100, 160);
                            return (
                              <div key={name} className="bg-gray-800/60 rounded-xl p-3">
                                <div className="flex justify-between text-xs mb-1.5">
                                  <span className="text-gray-300">{name}</span>
                                  <span className="flex items-center gap-2">
                                    <span className={`font-semibold ${over ? "text-red-400" : "text-emerald-400"}`}>{fmt(value)}</span>
                                    <span className="text-gray-600">/</span>
                                    <span className="text-gray-500">budget {fmt(budget)}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${over ? "bg-red-900/50 text-red-400" : "bg-emerald-900/50 text-emerald-400"}`}>
                                      {over ? `+${fmt(value-budget)}` : `-${fmt(budget-value)}`}
                                    </span>
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full relative overflow-hidden">
                                  <div className={`h-2 rounded-full transition-all ${over ? "bg-red-500" : "bg-emerald-500"}`}
                                    style={{width:`${Math.min(pctOfBudget,100)}%`}}/>
                                  <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{left:"62.5%"}}/>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <div className="border-t border-gray-800 pt-3">
                      <h2 className="text-sm font-semibold mb-2 text-gray-400">All Categories</h2>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selCats.map(({ name, value }) => {
                        const tot = selCats.reduce((s, c) => s + c.value, 0);
                        const isOther = name === "Other";
                        return (
                          <div key={name}
                            onClick={isOther ? () => setOtherDrillMonth(selMonth) : undefined}
                            className={isOther ? "cursor-pointer group" : ""}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className={`flex items-center gap-1.5 ${isOther ? "text-purple-300 group-hover:text-white" : "text-gray-300"}`}>
                                <span className="w-2 h-2 rounded-full" style={{backgroundColor: CAT_COLORS[name] || "#6366f1"}}/>
                                {name}
                                {isOther && <span className="text-purple-500 group-hover:text-purple-300 text-xs">↗ review</span>}
                              </span>
                              <span className="text-white font-semibold">{fmt(value)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full">
                              <div className="h-1.5 rounded-full" style={{width:`${(value/tot)*100}%`, backgroundColor: CAT_COLORS[name] || "#6366f1"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── BUDGET REALITY CHECK ── */}
            {budgetPatterns.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2"><AlertTriangle size={15} className="text-amber-400"/> Budget Reality Check</h2>
                    <p className="text-gray-500 text-xs mt-0.5">How consistently you hit each budget target across all {MONTHLY_SUMMARY.length} months</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {budgetPatterns.map(({ cat, budget, avgActual, monthsOver, total, pct }) => {
                    const color = pct >= 0.67 ? "#ef4444" : pct >= 0.34 ? "#f59e0b" : "#22c55e";
                    const label = pct >= 0.67 ? "Consistently over" : pct >= 0.34 ? "Sometimes over" : "Usually on track";
                    const textColor = pct >= 0.67 ? "text-red-400" : pct >= 0.34 ? "text-amber-400" : "text-emerald-400";
                    return (
                      <div key={cat} className="bg-gray-800/60 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: CAT_COLORS[cat] || "#6366f1"}}/>
                            <span className="text-sm font-medium text-gray-200">{cat}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pct >= 0.67 ? "bg-red-900/40 text-red-400" : pct >= 0.34 ? "bg-amber-900/40 text-amber-400" : "bg-emerald-900/40 text-emerald-400"}`}>{label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">avg {fmt(avgActual)}</span>
                            <span className="text-xs text-gray-600 mx-1.5">/</span>
                            <span className="text-xs text-gray-400">budget {fmt(budget)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-2 rounded-full transition-all" style={{width:`${pct * 100}%`, backgroundColor: color}}/>
                          </div>
                          <span className={`text-xs font-semibold ${textColor} w-24 text-right`}>{monthsOver}/{total} months over</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-600 mt-3">Red = over budget more than 2/3 of months. Fix these first — they're habitual, not one-offs.</p>
              </div>
            )}

            {/* ── TRANSACTIONS ── */}
            <div className="border-t border-gray-800 pt-5">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><CreditCard size={15} className="text-gray-400"/> Transactions</h2>
              <div className="bg-gray-900 rounded-2xl p-4 flex flex-wrap gap-3 items-center mb-3">
                <input type="text" placeholder="Search transactions…" value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 min-w-48 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"/>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                  {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterDir} onChange={e => setFilterDir(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                  <option value="All">All</option>
                  <option value="in">Income</option>
                  <option value="out">Spending</option>
                </select>
                <span className="text-gray-500 text-sm">{filteredTxs.length} entries</span>
              </div>
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="grid text-xs font-semibold text-gray-500 uppercase px-5 py-3 border-b border-gray-800"
                  style={{gridTemplateColumns:"90px 70px 1fr 160px 80px 100px"}}>
                  <span>Date</span><span>Month</span><span>Description</span><span>Category</span><span>Type</span><span className="text-right">Amount</span>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/40">
                  {filteredTxs.map((tx, i) => (
                    <div key={`${tx.date}:${tx.desc}:${tx.amount}:${i}`} className="grid items-center px-5 py-2.5 hover:bg-gray-800/50 text-sm"
                      style={{gridTemplateColumns:"90px 70px 1fr 160px 80px 100px"}}>
                      <span className="text-gray-500 text-xs">{tx.date.slice(5)}</span>
                      <span className="text-gray-600 text-xs">{tx.month}</span>
                      <span className="text-gray-200 truncate pr-2">{tx.desc}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: CAT_COLORS[tx.cat] || "#6366f1"}}/>
                        <span className="text-gray-400 text-xs truncate">{tx.cat}</span>
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${tx.dir==="in" ? "bg-green-900/40 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                        {tx.dir === "in" ? "↑ In" : "↓ Out"}
                      </span>
                      <span className={`text-right font-semibold ${tx.dir==="in" ? "text-green-400" : "text-white"}`}>
                        {tx.dir === "in" ? "+" : "-"}{fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ PLAN ═══════════════ */}
        {tab === "plan" && (
          <motion.div key="plan"
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{duration:0.18}} className="space-y-5">

            {/* Plan sub-tab switcher */}
            <div className="flex gap-1.5 bg-gray-900 p-1.5 rounded-xl w-fit">
              {[
                { id:"forecast", label:"Forecast & Budgets", icon:TrendingUp },
                { id:"simulate", label:"Purchase Simulator",  icon:CreditCard },
              ].map(v => (
                <button key={v.id} onClick={() => setPlanView(v.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    planView === v.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}>
                  <v.icon size={14}/>{v.label}
                </button>
              ))}
            </div>

            {importSuccess && (
              <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Check size={18} className="text-emerald-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <div className="font-semibold text-emerald-300 text-sm">Data loaded — {MONTHLY_SUMMARY.length} months imported</div>
                    <div className="text-emerald-400/70 text-xs mt-0.5">Set your expected monthly income below, then scroll down to run the Purchase Impact Simulator.</div>
                  </div>
                </div>
                <button onClick={() => setImportSuccess(false)} className="text-emerald-600 hover:text-emerald-300 flex-shrink-0"><X size={16}/></button>
              </div>
            )}
            {monthBreach && (
              <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5"/>
                <div>
                  <div className="font-semibold text-red-300">Balance goes negative in {monthBreach.month}</div>
                  <div className="text-red-400/80 text-sm">Increase income estimate or reduce spending targets.</div>
                </div>
              </div>
            )}

            {planView === "forecast" && (<>
            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Film size={15} className="text-gray-400"/> Scenario Planning</h2>
              <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
                {[
                  { label:"Best Case",    income:3500, desc:"Multiple income sources" },
                  { label:"Normal Month", income:2200, desc:"Single main income" },
                  { label:"Hard Month",   income:811,  desc:"Minimal income month" },
                ].map(s => (
                  <button key={s.label} onClick={() => setMonthlyIncome(s.income)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      monthlyIncome === s.income
                        ? "bg-indigo-900/40 border-indigo-600"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    }`}>
                    <div className="font-semibold text-white mb-1">{s.label}</div>
                    <div className={`text-2xl font-bold mb-2 ${monthlyIncome === s.income ? "text-indigo-400" : "text-gray-300"}`}>{fmt(s.income)}</div>
                    <div className="text-xs text-gray-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5 grid gap-4" style={{gridTemplateColumns:"1fr 1fr"}}>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Expected Monthly Income (£)</label>
                <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
                <p className="text-gray-500 text-xs mt-1">Avg actual: {fmt(avgIncome)}/mo over {MONTHLY_SUMMARY.length} months</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Forecast Horizon</label>
                <input type="range" min={3} max={11} value={horizonMonths}
                  onChange={e => setHorizonMonths(Number(e.target.value))} className="w-full accent-indigo-500 mt-2"/>
                <p className="text-gray-400 text-xs mt-1">{horizonMonths} months (to {forecastData[horizonMonths - 1]?.month ?? "—"})</p>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border grid gap-4 ${projectedNet >= 0 ? "bg-emerald-900/20 border-emerald-800" : "bg-red-900/20 border-red-800"}`}
              style={{gridTemplateColumns:"repeat(4,1fr)"}}>
              {[
                { label:"Monthly Income",  value:monthlyIncome,  color:"text-green-400" },
                { label:"Fixed Costs",      value:totalFixed,     color:"text-indigo-400" },
                { label:"Variable Budget",  value:totalVar,       color:"text-amber-400" },
                { label:"Monthly Surplus",  value:projectedNet,   color:projectedNet>=0?"text-emerald-400":"text-rose-400", prefix:projectedNet>=0?"+":"-" },
              ].map(c => (
                <div key={c.label} className="text-center">
                  <div className="text-gray-400 text-xs mb-1">{c.label}</div>
                  <div className={`text-xl font-bold ${c.color}`}>{c.prefix || ""}{fmt(Math.abs(c.value))}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2"><Lock size={15} className="text-gray-400"/> Fixed Monthly Costs</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Bills that go out every month</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total fixed</div>
                  <div className="text-lg font-bold text-indigo-400">{fmt(totalFixed)}/mo</div>
                </div>
              </div>
              <div className="space-y-2">
                {fixedCosts.map(c => {
                  const Icon = c.icon;
                  return (
                  <div key={c.id} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-2.5">
                    <Icon size={17} className="text-indigo-400 flex-shrink-0"/>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{c.label}</span>
                      {c.note && <span className="ml-2 text-xs text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">{c.note}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 text-sm">£</span>
                      <input type="number" value={c.amount} step="0.01"
                        onChange={e => updateFixed(c.id, e.target.value)}
                        className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white text-right focus:outline-none focus:border-indigo-500"/>
                      <span className="text-gray-500 text-xs">/mo</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2"><BarChart3 size={15} className="text-gray-400"/> Variable Budget</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Your spending targets for each category</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total variable</div>
                  <div className="text-lg font-bold text-amber-400">{fmt(totalVar)}/mo</div>
                </div>
              </div>
              <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr"}}>
                {varCosts.map(c => {
                  const Icon = c.icon;
                  const hist = catTotals.find(([cat]) => cat === c.label.split(" (")[0] || cat === c.label);
                  const avg8 = hist ? hist[1] / MONTHLY_SUMMARY.length : 0;
                  return (
                    <div key={c.id} className="bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={15} className="text-amber-400"/>
                        <span className="text-sm font-medium text-white">{c.label}</span>
                      </div>
                      {avg8 > 0 && <div className="text-xs text-gray-500 mb-2">8-mo avg actual: <span className="text-gray-300">{fmt(avg8)}/mo</span></div>}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">£</span>
                        <input type="number" value={c.amount} step="5"
                          onChange={e => updateVar(c.id, e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                        <span className="text-gray-500 text-xs">/mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.div className="bg-gray-900 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0,duration:0.3}}>
              <h2 className="text-base font-semibold mb-1 flex items-center gap-2"><TrendingUp size={15} className="text-gray-400"/> Balance Projection</h2>
              <p className="text-gray-500 text-xs mb-4">Historical actuals + forecast from {forecastData[0]?.month ?? "—"}. Starting balance: {fmt(currentBalance)}</p>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={balanceBridge}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                  <XAxis dataKey="label" tick={{fill:"#9ca3af",fontSize:10}}/>
                  <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                  <Tooltip content={<Tip/>}/>
                  <ReferenceLine y={0}   stroke="#ef4444" strokeDasharray="4 4" label={{value:"£0",fill:"#ef4444",fontSize:10}}/>
                  <ReferenceLine y={500} stroke="#f59e0b" strokeDasharray="3 3" label={{value:"£500 buffer",fill:"#f59e0b",fontSize:9}}/>
                  <Area type="monotone" dataKey="Balance" stroke="#6366f1" fill="#6366f122" strokeWidth={2} name="Balance"/>
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold">Month-by-Month Forecast (from {forecastData[0]?.month ?? "—"})</h2>
              </div>
              <div className="divide-y divide-gray-800/50">
                <div className="grid text-xs font-semibold text-gray-500 uppercase px-5 py-2"
                  style={{gridTemplateColumns:"80px 1fr 1fr 1fr 100px"}}>
                  <span>Month</span><span>Income</span><span>Spending</span><span>Net</span><span className="text-right">Balance</span>
                </div>
                {forecastData.map((row, i) => (
                  <div key={i} className="grid items-center px-5 py-2.5 hover:bg-gray-800/40 text-sm"
                    style={{gridTemplateColumns:"80px 1fr 1fr 1fr 100px"}}>
                    <span className="font-medium text-white">{row.month}</span>
                    <span className="text-green-400">{fmt(row.Income)}</span>
                    <span className="text-red-400">{fmt(row.Spending)}</span>
                    <span className={row.Net >= 0 ? "text-emerald-400" : "text-rose-400"}>{row.Net >= 0 ? "+" : "-"}{fmt(row.Net)}</span>
                    <span className="text-right font-bold" style={{color:bCol(row.Balance)}}>{fmt(row.Balance)}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-2.5 border-t border-gray-800 text-xs text-gray-500">
                Income: £{monthlyIncome}/mo · Fixed: {fmt(totalFixed)}/mo · Variable: {fmt(totalVar)}/mo · Start: {fmt(currentBalance)}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Calendar size={15} className="text-gray-400"/> Annual Planning Summary</h2>
              <div className="grid gap-3" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                {[
                  { label:"Projected Annual Income",  value:monthlyIncome * 12,             color:"text-green-400" },
                  { label:"Projected Annual Spend",   value:totalProjected * 12,            color:"text-red-400" },
                  { label:"Annual Net",               value:(monthlyIncome-totalProjected)*12, color:(monthlyIncome-totalProjected)>=0?"text-emerald-400":"text-rose-400" },
                  { label:"Fixed Costs (annual)",     value:totalFixed * 12,                color:"text-indigo-400" },
                  { label:"Variable Budget (annual)", value:totalVar * 12,                  color:"text-amber-400" },
                  { label:"All Subscriptions (annual)", value:totalSubAnnual,               color:"text-orange-400" },
                ].map(c => (
                  <div key={c.label} className="bg-gray-800 rounded-xl p-4">
                    <div className="text-gray-400 text-xs mb-1">{c.label}</div>
                    <div className={`text-xl font-bold ${c.color}`}>{fmt(Math.abs(c.value))}</div>
                  </div>
                ))}
              </div>
            </div>

            </>)}

            {planView === "simulate" && (
            <div className="bg-gray-900 rounded-2xl p-5 border border-indigo-800/40">
              <div className="mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2"><CreditCard size={15} className="text-gray-400"/> Can I Afford It? — Purchase Impact Simulator</h2>
                <p className="text-gray-500 text-xs mt-1">See exactly what happens to your balance month-by-month if you make this purchase. Not just a yes/no — a full trajectory.</p>
              </div>
              <div className="grid gap-4" style={{gridTemplateColumns:"1fr 1fr 1fr 140px"}}>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">What do you want to buy?</label>
                  <input type="text" placeholder="New phone, holiday, trainers..." value={affordabilityItem}
                    onChange={e => setAffordabilityItem(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Cost (£)</label>
                  <input type="number" placeholder="e.g. 500" value={affordabilityAmount}
                    onChange={e => setAffordabilityAmount(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">When? (month to simulate)</label>
                  <input type="month" min={`${fcStartYear}-${String(fcStartIdx + 1).padStart(2,"0")}`} max={`${fcStartYear + 1}-12`} value={affordabilityDate}
                    onChange={e => setAffordabilityDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Spread over</label>
                  <select value={spreadMonths} onChange={e => setSpreadMonths(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                    {[1,2,3,4,6,12].map(n => <option key={n} value={n}>{n} month{n>1?"s":""}</option>)}
                  </select>
                </div>
              </div>

              {!purchaseSimulation && affordabilityAmount && affordabilityDate && (
                <div className="mt-4 bg-amber-900/20 border border-amber-700 rounded-xl p-3 text-amber-300 text-sm">
                  Please select a month within the forecast window ({forecastData[0]?.month ?? "—"} – {forecastData[forecastData.length - 1]?.month ?? "—"}).
                </div>
              )}

              {purchaseSimulation && (() => {
                const vs = verdictStyle(purchaseSimulation.verdict);
                return (
                  <div className="mt-5 space-y-4">
                    <div className={`rounded-2xl p-5 border ${vs.border} ${vs.bg}`}>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className={`text-4xl font-black mb-1 ${vs.text}`}>{vs.label}</div>
                          <p className="text-gray-300 text-sm">
                            {affordabilityItem && <span className="font-semibold text-white">{affordabilityItem} — </span>}
                            {fmt(purchaseSimulation.amt)} in {purchaseSimulation.purchaseMonthLabel}
                          </p>
                          {purchaseSimulation.verdict === "SHORTFALL" && <p className="text-red-400 text-xs mt-2">Your balance would go negative. Cut costs or wait for a higher-income month.</p>}
                          {purchaseSimulation.verdict === "TIGHT" && <p className="text-amber-400 text-xs mt-2">You can cover it, but your safety buffer drops below £500. Consider spreading the cost.</p>}
                          {purchaseSimulation.verdict === "COMFORTABLE" && <p className="text-emerald-400 text-xs mt-2">Your balance stays above £500 throughout. You're in a good position for this.</p>}
                        </div>
                        <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
                          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">Lowest balance</div>
                            <div className={`text-xl font-bold ${purchaseSimulation.lowestWithPurchase >= 500 ? "text-emerald-400" : purchaseSimulation.lowestWithPurchase >= 0 ? "text-amber-400" : "text-red-400"}`}>{fmt(purchaseSimulation.lowestWithPurchase)}</div>
                          </div>
                          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">If spread {spreadMonths}mo</div>
                            <div className="text-xl font-bold text-indigo-400">{fmt(parseFloat(purchaseSimulation.spreadMonthlyExtra))}/mo</div>
                          </div>
                          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">Your surplus/mo</div>
                            <div className={`text-xl font-bold ${purchaseSimulation.monthlyNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>{purchaseSimulation.monthlyNet >= 0 ? "+" : ""}{fmt(purchaseSimulation.monthlyNet)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div className="bg-gray-800/40 rounded-2xl p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0,duration:0.3}}>
                      <h3 className="text-sm font-semibold mb-1 text-white">Balance Trajectory: With vs. Without Purchase</h3>
                      <p className="text-xs text-gray-500 mb-4">Dashed grey = without purchase · Coloured = with purchase · Circle = purchase moment.</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={purchaseSimulation.simMonths}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                          <XAxis dataKey="month" tick={{fill:"#9ca3af",fontSize:10}}/>
                          <YAxis tickFormatter={fmtK} tick={{fill:"#9ca3af"}}/>
                          <Tooltip content={<Tip/>}/>
                          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{value:"£0",fill:"#ef4444",fontSize:9}}/>
                          <ReferenceLine y={500} stroke="#f59e0b" strokeDasharray="3 3" label={{value:"£500 buffer",fill:"#f59e0b",fontSize:9}}/>
                          <Line type="monotone" dataKey="Without Purchase" stroke="#6b7280" strokeDasharray="6 3" strokeWidth={2} dot={false}/>
                          <Line type="monotone" dataKey="With Purchase"
                            stroke={purchaseSimulation.verdict === "COMFORTABLE" ? "#22c55e" : purchaseSimulation.verdict === "TIGHT" ? "#f59e0b" : "#ef4444"}
                            strokeWidth={2.5}
                            dot={(props) => {
                              const point = purchaseSimulation.simMonths[props.index];
                              if (!point?.isPurchase) return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill="#6b7280"/>;
                              return <circle key={props.index} cx={props.cx} cy={props.cy} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2}/>;
                            }}/>
                        </ComposedChart>
                      </ResponsiveContainer>
                      {purchaseSimulation.recoversAt && <p className="text-xs text-gray-400 mt-3"><Lightbulb size={12} className="inline mr-1"/> Balance returns above £500 buffer by <span className="text-emerald-400 font-semibold">{purchaseSimulation.recoversAt}</span>.</p>}
                      {!purchaseSimulation.recoversAt && purchaseSimulation.verdict !== "COMFORTABLE" && <p className="text-xs text-amber-400 mt-3"><AlertTriangle size={12} className="inline mr-1"/> Balance stays below £500 within this window. Consider a higher-income month or spreading the cost.</p>}
                    </motion.div>
                  </div>
                );
              })()}
            </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ GOALS & HEALTH ═══════════════ */}
        {tab === "health" && (
          <motion.div key="health"
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{duration:0.18}} className="space-y-5">
            <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-4 text-sm text-indigo-300">
              <Lightbulb size={14} className="inline mr-1.5 text-indigo-400"/> Goals track your savings targets separately from your account balance. Your current balance ({fmt(currentBalance)}) is your full pot — allocate portions to goals as you actively set money aside.
            </div>

            <div className="grid gap-3" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-4">
                <div className="text-white/70 text-xs font-medium uppercase mb-1">Total Savings Target</div>
                <div className="text-3xl font-bold text-white">{fmt(goals.reduce((s, g) => s + g.target, 0))}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-4">
                <div className="text-white/70 text-xs font-medium uppercase mb-1">Total Saved So Far</div>
                <div className="text-3xl font-bold text-white">{fmt(goals.reduce((s, g) => s + g.saved, 0))}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-2xl p-4">
                <div className="text-white/70 text-xs font-medium uppercase mb-1">Still Needed</div>
                <div className="text-3xl font-bold text-white">{fmt(goals.reduce((s, g) => s + Math.max(0, g.target - g.saved), 0))}</div>
              </div>
            </div>

            <div className="space-y-3">
              {goals.map(goal => {
                const progress = Math.min(100, (goal.saved / goal.target) * 100);
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const [monthStr, yearStr] = goal.date?.split(" ") ?? ["", ""];
                const monthIdx = monthNames.indexOf(monthStr);
                const now = new Date();
                const rawMonthsAway = monthIdx === -1 ? 0 : (parseInt(yearStr) - now.getFullYear()) * 12 + (monthIdx - now.getMonth());
                const isOverdue = rawMonthsAway < 0;
                const monthsAway = Math.max(0, rawMonthsAway);
                const stillNeeded = Math.max(0, goal.target - goal.saved);
                const monthlyNeeded = monthsAway > 0 ? stillNeeded / monthsAway : stillNeeded;
                const isAchievable = !isOverdue && monthlyNeeded <= Math.max(projectedNet, 0);

                return (
                  <div key={goal.id} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {(() => { const GoalIcon = goal.icon; return <GoalIcon size={32} className="text-indigo-400"/>; })()}
                        <div>
                          <h3 className="font-semibold text-white text-lg">{goal.name}</h3>
                          <p className="text-gray-500 text-xs">Target: {fmt(goal.target)} by {goal.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-400">{fmt(goal.saved)}</div>
                        <div className="text-xs text-gray-500">saved · {Math.round(progress)}% done</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width:`${progress}%`}}/>
                      </div>
                    </div>

                    <div className="grid gap-3" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Months to Go</div>
                        <div className={`text-lg font-bold ${isOverdue ? "text-red-400" : "text-white"}`}>
                          {isOverdue ? "Overdue" : monthsAway}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Still Needed</div>
                        <div className="text-lg font-bold text-amber-400">{fmt(stillNeeded)}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Save /month</div>
                        <div className="text-lg font-bold text-indigo-400">{monthsAway > 0 ? fmt(monthlyNeeded) : "—"}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Achievable?</div>
                        <div className={`text-lg font-bold flex items-center gap-1 ${isOverdue ? "text-red-400" : isAchievable ? "text-emerald-400" : "text-amber-400"}`}>
                          {isOverdue ? <><AlertTriangle size={13}/> Overdue</> : isAchievable ? <><Check size={14}/> Yes</> : <><AlertTriangle size={13}/> Tight</>}
                        </div>
                      </div>
                    </div>

                    {/* Goal-linked spending lever */}
                    {(() => {
                      const topLever = budgetPatterns.find(p => p.pct >= 0.34 && p.avgActual > p.budget);
                      if (!topLever || monthsAway <= 0 || stillNeeded <= 0) return null;
                      const extraPerMonth = topLever.avgActual - topLever.budget;
                      const monthsSaved = extraPerMonth > 0 ? Math.round(stillNeeded / (monthlyNeeded + extraPerMonth) * 10) / 10 : 0;
                      const monthsEarlier = Math.max(0, monthsAway - monthsSaved);
                      if (monthsEarlier >= monthsAway) return null;
                      return (
                        <div className="mt-3 bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3 flex items-start gap-2">
                          <Lightbulb size={14} className="text-indigo-400 flex-shrink-0 mt-0.5"/>
                          <p className="text-xs text-indigo-300">
                            Hit your <span className="font-semibold text-white">{topLever.cat}</span> budget ({fmt(topLever.budget)}/mo vs avg {fmt(topLever.avgActual)}/mo) and reach this goal <span className="font-semibold text-emerald-400">{Math.round(monthsAway - monthsSaved)} months sooner</span>.
                          </p>
                        </div>
                      );
                    })()}

                    <GoalInput goal={goal} setGoals={setGoals}/>
                  </div>
                );
              })}
            </div>

            {/* ─── FINANCIAL HEALTH ─── */}
            <div className="border-t border-gray-800 pt-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Lightbulb size={15} className="text-indigo-400"/> Financial Health</h2>
            </div>

            {/* Spending DNA */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl p-5 border border-purple-700/40">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-orange-400"/>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Your Spending DNA</span>
              </div>
              <div className="mt-3 flex items-start gap-4">
                <div className="flex-1">
                  <div className="text-2xl font-black text-white mb-1">{spendingDNA.archetype}</div>
                  <p className="text-purple-300/80 text-sm mb-4">{spendingDNA.trait}</p>
                  <div className="grid gap-2" style={{gridTemplateColumns:"1fr 1fr"}}>
                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Star size={11} className="text-emerald-400"/><span className="text-xs text-gray-400">Best month</span></div>
                      <div className="text-sm font-semibold text-emerald-400">{spendingDNA.bestMonth}</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1"><AlertTriangle size={11} className="text-red-400"/><span className="text-xs text-gray-400">Toughest month</span></div>
                      <div className="text-sm font-semibold text-red-400">{spendingDNA.worstMonth}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 max-w-xs border border-orange-700/30">
                  <div className="flex items-center gap-1.5 mb-2"><Flame size={13} className="text-orange-400"/><span className="text-xs font-bold text-orange-400 uppercase">Honest Take</span></div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{spendingDNA.roast}"</p>
                </div>
              </div>
            </div>

            {/* Months of Runway */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Timer size={15} className="text-gray-400"/> Months of Runway</h2>
              <p className="text-gray-500 text-xs mb-4">How long could you survive on current savings if each income scenario played out?</p>
              <div className="grid gap-4" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="text-5xl font-black text-indigo-400 mb-2">{runway.toFixed(1)}</div>
                  <div className="text-xs font-semibold text-white mb-1">No Income</div>
                  <div className="text-xs text-gray-500">{fmt(currentBalance)} ÷ {fmt(avgSpend)}/mo</div>
                </div>
                {[
                  { scenario:"Half Income",    income: avgIncome / 2 },
                  { scenario:"Avg Income",     income: avgIncome },
                  { scenario:"Forecast Income",income: monthlyIncome },
                ].map(s => {
                  const monthlyDeficit = avgSpend - s.income;
                  const months = monthlyDeficit <= 0 ? "∞" : (currentBalance / monthlyDeficit).toFixed(1);
                  return (
                    <div key={s.scenario} className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className={`text-3xl font-bold mb-2 ${months === "∞" ? "text-emerald-400" : "text-amber-400"}`}>{months}</div>
                      <div className="text-xs font-semibold text-white mb-1">{s.scenario}</div>
                      <div className="text-xs text-gray-500">{fmt(s.income)}/mo in</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mt-4">{monthlyIncome >= avgSpend ? "Your forecast income covers average spending — runway is theoretically infinite, but income isn't guaranteed." : `Forecast income falls short of the £${Math.round(avgSpend)}/mo average spend, giving ${(currentBalance / (avgSpend - monthlyIncome)).toFixed(1)} months of buffer.`}</p>
            </div>

            {/* Subscription Audit */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2"><Radio size={15} className="text-gray-400"/> Subscription Audit</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Toggle to mark subscriptions for cancellation and see your savings.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total annual commitment</div>
                  <div className="text-xl font-bold text-orange-400">{fmt(totalSubAnnual)}/year</div>
                </div>
              </div>
              {(() => {
                const gymTxDescs = ALL_TRANSACTIONS
                  .filter(tx => tx.cat === "Gym & Fitness" && tx.dir === "out")
                  .map(tx => tx.desc.toLowerCase());
                const uniqueGyms = new Set(gymTxDescs.map(d => d.split(" ").slice(0,2).join(" ")));
                const hasMultipleGyms = uniqueGyms.size >= 2;
                return hasMultipleGyms ? (
                  <div className="mb-4 bg-amber-900/30 border border-amber-700 rounded-lg p-3 flex gap-3">
                    <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5"/>
                    <div>
                      <div className="font-semibold text-amber-300 text-sm">Multiple gym memberships detected</div>
                      <div className="text-amber-200/80 text-xs mt-1">More than one gym subscription appears in your data. Consolidating to one could save £400+/year.</div>
                    </div>
                  </div>
                ) : null;
              })()}
              <div className="space-y-2">
                {SUBSCRIPTIONS.map((sub, idx) => {
                  const Icon = sub.icon;
                  const isCancelled = !!subToggles[idx];
                  return (
                    <div key={idx} className={`flex items-center gap-3 rounded-lg p-3 transition-all ${isCancelled ? "bg-red-900/20 border border-red-800/50" : "bg-gray-800"}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon size={15} className={isCancelled ? "text-gray-500" : "text-orange-400"}/>
                          <span className={`font-medium text-sm ${isCancelled ? "line-through text-gray-500" : "text-white"}`}>{sub.name}</span>
                          {sub.note && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{sub.note}</span>}
                          {!sub.optional && <span className="text-xs bg-indigo-700 text-indigo-300 px-2 py-0.5 rounded">contract</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.monthly > 0 ? `£${sub.monthly.toFixed(2)}/mo` : "One-time"}
                          <span className="mx-1.5 text-gray-700">·</span>
                          <span className="font-semibold text-gray-300">{fmt(sub.annual)}/year</span>
                        </div>
                      </div>
                      {sub.optional && (
                        <button onClick={() => setSubToggles(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${isCancelled ? "bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-900/80" : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white"}`}>
                          {isCancelled ? <span className="flex items-center gap-1"><X size={11}/> Cancel</span> : <span className="flex items-center gap-1"><Check size={11}/> Keep</span>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Subscriptions = <span className="font-semibold text-orange-400">{((totalSubAnnual / historicIncome) * 100).toFixed(1)}%</span> of your annual income. Ideal: under 5%.</p>
                    {cancelledAnnualSavings > 0 && <p className="text-xs text-emerald-400 mt-1 font-semibold"><Check size={12} className="inline mr-1"/> Cancelling marked subs saves {fmt(cancelledAnnualSavings)}/year ({fmt(cancelledAnnualSavings/12)}/mo)</p>}
                  </div>
                  {cancelledAnnualSavings > 0 && (
                    <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl px-4 py-2 text-right">
                      <div className="text-xs text-gray-400">Annual saving</div>
                      <div className="text-xl font-bold text-emerald-400">{fmt(cancelledAnnualSavings)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Income Reliability Score */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><BarChart3 size={15} className="text-gray-400"/> Income Reliability Score</h2>
              <div className="grid gap-4" style={{gridTemplateColumns:"1fr 1.5fr"}}>
                <div className="flex flex-col justify-center">
                  <div className="text-5xl font-bold text-indigo-400 mb-2">{reliabilityScore}/10</div>
                  <p className="text-xs text-gray-400">Based on income variability and emergency buffer strength</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Income Variability (CV)</span>
                      <span className="text-gray-300 font-semibold">{(incomeVariance.cv * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full"><div className="h-2 rounded-full bg-amber-500" style={{width:`${Math.min(100, incomeVariance.cv * 100)}%`}}/></div>
                    <p className="text-xs text-gray-600 mt-0.5">Higher = more volatile. Ideal under 30%.</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Emergency Buffer (vs £2,500 target)</span>
                      <span className="text-gray-300 font-semibold">{((currentBalance / 2500) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full"><div className="h-2 rounded-full bg-emerald-500" style={{width:`${Math.min(100, (currentBalance / 2500) * 100)}%`}}/></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <div className="font-semibold text-amber-300">{MONTHLY_SUMMARY.reduce((w,m) => m.net < w.net ? m : w).label} was the most vulnerable month</div>
                    <div className="text-gray-400 text-xs mt-0.5">Only {fmt(MONTHLY_SUMMARY.reduce((w,m) => m.net < w.net ? m : w).income)} income vs {fmt(MONTHLY_SUMMARY.reduce((w,m) => m.net < w.net ? m : w).spending)} out — a {fmt(Math.abs(MONTHLY_SUMMARY.reduce((w,m) => m.net < w.net ? m : w).net))} deficit. You need a buffer to absorb months like this.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb size={18} className="text-emerald-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <div className="font-semibold text-emerald-300">Recommendation</div>
                    <div className="text-gray-400 text-xs mt-0.5">Keep at least £2,500 untouchable as emergency reserve. This covers a full worst-case month before touching credit or borrowing.</div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}



        </AnimatePresence>
      </div>

      {/* ═══════════════ CSV IMPORT MODAL ═══════════════ */}
      {showImport && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && (setShowImport(false), setImportPreview(null))}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-lg shadow-2xl">

            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Import Bank CSV</h2>
                <p className="text-gray-400 text-xs mt-0.5">Your data stays in the browser — nothing is uploaded</p>
              </div>
              <button onClick={() => { setShowImport(false); setImportPreview(null); }}
                className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>

            {!importPreview ? (
              <>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleCSVFile(e.dataTransfer.files[0]); }}
                  onClick={() => csvInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    dragOver ? "border-indigo-500 bg-indigo-900/20" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/40"
                  }`}>
                  <Folder size={36} className="text-gray-400 mb-3"/>
                  <p className="text-white font-semibold mb-1">Drop your bank CSV here</p>
                  <p className="text-gray-500 text-sm">or click to browse</p>
                  <p className="text-gray-600 text-xs mt-3">Internet Banking → Statements → Export as CSV</p>
                  <input ref={csvInputRef} type="file" accept=".csv" className="hidden"
                    onChange={e => handleCSVFile(e.target.files[0])}/>
                </div>

                <div className="mt-4 bg-gray-800/50 rounded-xl p-3 space-y-1 text-xs text-gray-400">
                  <p>Expected columns: <span className="text-gray-300">Transaction Date · Transaction Description · Debit Amount · Credit Amount · Balance</span></p>
                  <p>Transactions are auto-categorised by keyword. Works best with UK bank CSV exports.</p>
                </div>

                {importedData && (
                  <button
                    onClick={() => {
                      if (!window.confirm("Revert to demo data? This will remove all imported data and overrides.")) return;
                      setImportedData(null); setImportPreview(null); setShowImport(false); setSelMonth("Jan '26");
                      localStorage.removeItem("spendingData"); localStorage.removeItem("catOverrides"); setTxCatOverrides({});
                    }}
                    className="mt-3 w-full py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-red-700 hover:bg-red-900/20 transition-all">
                    ↩ Revert to demo data
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const existingLabels = new Set((importedData?.summary ?? []).map(m => m.label));
                  const newMonths = importPreview.summary.filter(m => !existingLabels.has(m.label));
                  const dupMonths = importPreview.summary.filter(m => existingLabels.has(m.label));
                  const merged = mergeData(importedData, importPreview);
                  return (
                    <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-4">
                      <p className="text-emerald-400 font-semibold mb-3 flex items-center gap-2"><Check size={14}/>
                        {importedData
                          ? `${newMonths.length} new month${newMonths.length !== 1 ? "s" : ""} detected — ${dupMonths.length} already stored`
                          : "CSV parsed successfully"}
                      </p>
                      <div className="grid gap-2 mb-3" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
                        {[
                          { label:"Total Months",   value: merged.monthCount },
                          { label:"Transactions",   value: merged.transactions.length },
                          { label:"Latest Balance", value: fmt(importPreview.currentBalance) },
                        ].map(s => (
                          <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center">
                            <div className="text-xl font-bold text-white">{s.value}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-1 text-xs">
                        {importPreview.summary.map(m => {
                          const isNew = !existingLabels.has(m.label);
                          return (
                            <div key={m.label} className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isNew ? "bg-emerald-400" : "bg-gray-600"}`}/>
                                <span className={isNew ? "text-gray-300" : "text-gray-600"}>{m.label}</span>
                                {isNew && <span className="text-emerald-600 text-xs">new</span>}
                              </span>
                              <span className={isNew ? (m.net >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-700"}>
                                {m.net >= 0 ? "+" : ""}{fmt(m.net)}
                              </span>
                            </div>
                          );
                        })}
                        {importedData && existingLabels.size > importPreview.summary.length && (
                          <p className="text-gray-600 text-xs mt-1">{existingLabels.size - dupMonths.length} previously stored month(s) kept unchanged</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <button onClick={() => setImportPreview(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:border-gray-500 transition-all">
                    ← Try another file
                  </button>
                  <button
                    onClick={() => {
                      const merged = mergeData(importedData, importPreview);
                      setImportedData(merged);
                      try { localStorage.setItem("spendingData", JSON.stringify(merged)); } catch {}
                      setTxCatOverrides({});
                      localStorage.removeItem("catOverrides");
                      setImportPreview(null);
                      setShowImport(false);
                      const lastMonth = merged.summary[merged.summary.length - 1]?.label;
                      if (lastMonth) setSelMonth(lastMonth);
                      setTab("plan");
                      setImportSuccess(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all">
                    {importedData ? `Merge ${importPreview.summary.filter(m => !new Set(importedData.summary.map(x => x.label)).has(m.label)).length} new month(s) →` : "Load My Data →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ OTHER DRILL-DOWN MODAL ═══════════════ */}
      {otherDrillMonth && (
        <OtherDrillModal
          month={otherDrillMonth}
          transactions={ALL_TRANSACTIONS}
          onClose={() => setOtherDrillMonth(null)}
          onReassign={handleReassign}
        />
      )}

    </div>
  );
}
