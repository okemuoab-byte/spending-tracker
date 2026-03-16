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
  Timer, Folder, Search, Train, Film, Cloud, X, Check, Pencil
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA – 8 MONTHS (fictional demo — Alex, junior software developer)
// ══════════════════════════════════════════════════════════════════════════════
const DEFAULT_MONTHLY_SUMMARY = [
  { month:"Jun", label:"Jun '25",  income:3200.00, spending:2350.00, net:  850.00, balanceEnd:2100.00 },
  { month:"Jul", label:"Jul '25",  income:2200.00, spending:2480.00, net: -280.00, balanceEnd:1820.00 },
  { month:"Aug", label:"Aug '25",  income:1000.00, spending:2250.00, net:-1250.00, balanceEnd: 570.00 },
  { month:"Sep", label:"Sep '25",  income:4500.00, spending:2200.00, net: 2300.00, balanceEnd:2870.00 },
  { month:"Oct", label:"Oct '25",  income:3600.00, spending:3200.00, net:  400.00, balanceEnd:3270.00 },
  { month:"Nov", label:"Nov '25",  income: 800.00, spending:2500.00, net:-1700.00, balanceEnd:1570.00 },
  { month:"Dec", label:"Dec '25",  income:2400.00, spending:2400.00, net:    0.00, balanceEnd:1570.00 },
  { month:"Jan", label:"Jan '26",  income:2400.00, spending:2000.00, net:  400.00, balanceEnd:1970.00 },
];

const DEFAULT_INCOME_BREAKDOWN = {
  "Jun '25": { "Salary":2200.00, "Freelance":600.00, "Side Income":400.00 },
  "Jul '25": { "Salary":2200.00 },
  "Aug '25": { "Salary":600.00,  "Side Income":400.00 },
  "Sep '25": { "Salary":2200.00, "Freelance":1500.00, "Bonus":800.00 },
  "Oct '25": { "Salary":2200.00, "Freelance":1000.00, "Side Income":400.00 },
  "Nov '25": { "Salary":800.00 },
  "Dec '25": { "Salary":2200.00, "Side Income":200.00 },
  "Jan '26": { "Salary":2200.00, "Freelance":200.00 },
};

const DEFAULT_MONTHLY_CATEGORIES = {
  "Jun '25": { Rent:1000.00, Shopping:300.00, Transport:240.00, Groceries:200.00, "Eating Out & Cafes":160.00, Other:160.00, Healthcare:90.00, "Personal Transfers":75.00, "Gym & Fitness":70.00, Subscriptions:36.00, "Phone Bill":35.00 },
  "Jul '25": { Rent:1000.00, Transport:330.00, Groceries:270.00, "Eating Out & Cafes":240.00, "Entertainment & Nights Out":210.00, Other:115.00, "Personal Transfers":95.00, "Gym & Fitness":70.00, Subscriptions:36.00, "Phone Bill":35.00, Shopping:44.00, Healthcare:31.00 },
  "Aug '25": { Rent:1000.00, Groceries:380.00, Transport:200.00, Shopping:185.00, "Eating Out & Cafes":170.00, "Personal Transfers":75.00, "Gym & Fitness":70.00, Other:60.00, Healthcare:55.00, Subscriptions:55.00, "Phone Bill":35.00 },
  "Sep '25": { Rent:1000.00, Transport:460.00, "Eating Out & Cafes":175.00, Subscriptions:110.00, Healthcare:95.00, "Entertainment & Nights Out":90.00, Groceries:80.00, "Personal Transfers":75.00, Other:70.00, "Gym & Fitness":70.00, "Phone Bill":35.00 },
  "Oct '25": { Rent:1000.00, Other:1100.00, Groceries:355.00, Transport:165.00, "Entertainment & Nights Out":120.00, "Eating Out & Cafes":115.00, Subscriptions:106.00, Shopping:83.00, "Gym & Fitness":70.00, Healthcare:35.00, "Phone Bill":35.00, "Personal Transfers":25.00 },
  "Nov '25": { Rent:1000.00, Other:560.00, Groceries:220.00, Transport:185.00, "Eating Out & Cafes":115.00, Subscriptions:108.00, "Entertainment & Nights Out":80.00, "Gym & Fitness":70.00, Healthcare:70.00, Shopping:62.00, "Phone Bill":35.00 },
  "Dec '25": { Rent:1000.00, Other:445.00, "Eating Out & Cafes":230.00, Groceries:210.00, Transport:205.00, "Gym & Fitness":70.00, Subscriptions:83.00, "Entertainment & Nights Out":40.00, "Phone Bill":35.00, Healthcare:30.00, Shopping:52.00 },
  "Jan '26": { Rent:1000.00, Transport:275.00, Other:190.00, Groceries:140.00, Subscriptions:88.00, "Entertainment & Nights Out":80.00, "Gym & Fitness":70.00, "Eating Out & Cafes":62.00, "Phone Bill":35.00, "Personal Transfers":25.00, Healthcare:35.00 },
};

const DEFAULT_ALL_TRANSACTIONS = [
  // JUNE 2025
  { date:"2025-06-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Jun '25" },
  { date:"2025-06-03", desc:"Employer Salary",            cat:"Salary",              amount:2200.00,dir:"in",  month:"Jun '25" },
  { date:"2025-06-05", desc:"Freelance Project",          cat:"Freelance",           amount:600.00, dir:"in",  month:"Jun '25" },
  { date:"2025-06-05", desc:"Side Income",                cat:"Side Income",         amount:400.00, dir:"in",  month:"Jun '25" },
  { date:"2025-06-05", desc:"Streaming Service",          cat:"Subscriptions",       amount:13.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-06", desc:"Coffee Shop",                cat:"Eating Out & Cafes",  amount:6.50,   dir:"out", month:"Jun '25" },
  { date:"2025-06-07", desc:"GP Appointment",             cat:"Healthcare",          amount:20.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-09", desc:"Clothing Store",             cat:"Shopping",            amount:80.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-09", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:30.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-09", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:45.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Jun '25" },
  { date:"2025-06-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-20", desc:"Supermarket",                cat:"Groceries",           amount:200.00, dir:"out", month:"Jun '25" },
  { date:"2025-06-25", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:55.00,  dir:"out", month:"Jun '25" },
  { date:"2025-06-28", desc:"Uber",                       cat:"Transport",           amount:65.00,  dir:"out", month:"Jun '25" },
  // JULY 2025
  { date:"2025-07-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Jul '25" },
  { date:"2025-07-03", desc:"Employer Salary",            cat:"Salary",              amount:2200.00,dir:"in",  month:"Jul '25" },
  { date:"2025-07-05", desc:"Streaming Service",          cat:"Subscriptions",       amount:13.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-10", desc:"Night Out (bar tab)",        cat:"Entertainment & Nights Out", amount:85.00, dir:"out", month:"Jul '25" },
  { date:"2025-07-12", desc:"Live Music",                 cat:"Entertainment & Nights Out", amount:55.00, dir:"out", month:"Jul '25" },
  { date:"2025-07-15", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:58.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Jul '25" },
  { date:"2025-07-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-18", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:95.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-20", desc:"Supermarket",                cat:"Groceries",           amount:270.00, dir:"out", month:"Jul '25" },
  { date:"2025-07-22", desc:"Cinema & Dinner",            cat:"Entertainment & Nights Out", amount:45.00, dir:"out", month:"Jul '25" },
  { date:"2025-07-25", desc:"Clothing Store",             cat:"Shopping",            amount:44.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-28", desc:"GP Appointment",             cat:"Healthcare",          amount:31.00,  dir:"out", month:"Jul '25" },
  { date:"2025-07-28", desc:"Uber",                       cat:"Transport",           amount:155.00, dir:"out", month:"Jul '25" },
  // AUGUST 2025
  { date:"2025-08-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Aug '25" },
  { date:"2025-08-04", desc:"Employer Salary (part)",     cat:"Salary",              amount:600.00, dir:"in",  month:"Aug '25" },
  { date:"2025-08-05", desc:"Side Income",                cat:"Side Income",         amount:400.00, dir:"in",  month:"Aug '25" },
  { date:"2025-08-07", desc:"Clothing Store",             cat:"Shopping",            amount:120.00, dir:"out", month:"Aug '25" },
  { date:"2025-08-08", desc:"Optician",                   cat:"Healthcare",          amount:55.00,  dir:"out", month:"Aug '25" },
  { date:"2025-08-10", desc:"Streaming Services",         cat:"Subscriptions",       amount:55.00,  dir:"out", month:"Aug '25" },
  { date:"2025-08-10", desc:"Online Clothing",            cat:"Shopping",            amount:65.00,  dir:"out", month:"Aug '25" },
  { date:"2025-08-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Aug '25" },
  { date:"2025-08-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Aug '25" },
  { date:"2025-08-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Aug '25" },
  { date:"2025-08-15", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:75.00,  dir:"out", month:"Aug '25" },
  { date:"2025-08-20", desc:"Supermarket",                cat:"Groceries",           amount:380.00, dir:"out", month:"Aug '25" },
  { date:"2025-08-25", desc:"Restaurants & Cafes",        cat:"Eating Out & Cafes",  amount:170.00, dir:"out", month:"Aug '25" },
  { date:"2025-08-28", desc:"Uber",                       cat:"Transport",           amount:25.00,  dir:"out", month:"Aug '25" },
  // SEPTEMBER 2025
  { date:"2025-09-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Sep '25" },
  { date:"2025-09-03", desc:"Employer Salary",            cat:"Salary",              amount:2200.00,dir:"in",  month:"Sep '25" },
  { date:"2025-09-05", desc:"Freelance Project",          cat:"Freelance",           amount:1500.00,dir:"in",  month:"Sep '25" },
  { date:"2025-09-08", desc:"Annual Bonus",               cat:"Bonus",               amount:800.00, dir:"in",  month:"Sep '25" },
  { date:"2025-09-10", desc:"Streaming Service",          cat:"Subscriptions",       amount:22.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-10", desc:"Professional Subscription",  cat:"Subscriptions",       amount:50.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-12", desc:"Hotel (city break)",         cat:"Entertainment & Nights Out", amount:55.00, dir:"out", month:"Sep '25" },
  { date:"2025-09-13", desc:"Bars & Restaurants",         cat:"Entertainment & Nights Out", amount:35.00, dir:"out", month:"Sep '25" },
  { date:"2025-09-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Sep '25" },
  { date:"2025-09-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-15", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:75.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-18", desc:"Pharmacy",                   cat:"Healthcare",          amount:95.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-20", desc:"Supermarket",                cat:"Groceries",           amount:80.00,  dir:"out", month:"Sep '25" },
  { date:"2025-09-25", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:175.00, dir:"out", month:"Sep '25" },
  { date:"2025-09-28", desc:"Train Tickets",              cat:"Transport",           amount:285.00, dir:"out", month:"Sep '25" },
  // OCTOBER 2025
  { date:"2025-10-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Oct '25" },
  { date:"2025-10-03", desc:"Employer Salary",            cat:"Salary",              amount:2200.00,dir:"in",  month:"Oct '25" },
  { date:"2025-10-05", desc:"Freelance Project",          cat:"Freelance",           amount:1000.00,dir:"in",  month:"Oct '25" },
  { date:"2025-10-06", desc:"Side Income",                cat:"Side Income",         amount:400.00, dir:"in",  month:"Oct '25" },
  { date:"2025-10-05", desc:"Streaming Service",          cat:"Subscriptions",       amount:20.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-06", desc:"Streaming Service (2nd)",    cat:"Subscriptions",       amount:9.00,   dir:"out", month:"Oct '25" },
  { date:"2025-10-07", desc:"Night Out (bowling)",        cat:"Entertainment & Nights Out", amount:34.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-08", desc:"Clothing Store",             cat:"Shopping",            amount:83.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-09", desc:"GP Appointment",             cat:"Healthcare",          amount:35.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-10", desc:"Coffee Shop",                cat:"Eating Out & Cafes",  amount:6.00,   dir:"out", month:"Oct '25" },
  { date:"2025-10-11", desc:"Night Out (pub)",            cat:"Entertainment & Nights Out", amount:14.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-12", desc:"Night Out (bar)",            cat:"Entertainment & Nights Out", amount:72.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Supermarket",                cat:"Groceries",           amount:355.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:109.00, dir:"out", month:"Oct '25" },
  { date:"2025-10-15", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:25.00,  dir:"out", month:"Oct '25" },
  { date:"2025-10-20", desc:"Other spending",             cat:"Other",               amount:1100.00,dir:"out", month:"Oct '25" },
  // NOVEMBER 2025
  { date:"2025-11-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Nov '25" },
  { date:"2025-11-03", desc:"Employer Salary (part)",     cat:"Salary",              amount:800.00, dir:"in",  month:"Nov '25" },
  { date:"2025-11-05", desc:"Streaming Services",         cat:"Subscriptions",       amount:108.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-06", desc:"Night Out (bar)",            cat:"Entertainment & Nights Out", amount:80.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-07", desc:"Uber",                       cat:"Transport",           amount:24.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-08", desc:"Haircut",                    cat:"Entertainment & Nights Out", amount:35.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-09", desc:"Train Tickets",              cat:"Transport",           amount:25.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-10", desc:"Pharmacy",                   cat:"Healthcare",          amount:70.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-11", desc:"Online Clothing",            cat:"Shopping",            amount:62.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-15", desc:"Supermarket",                cat:"Groceries",           amount:220.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-18", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:115.00, dir:"out", month:"Nov '25" },
  { date:"2025-11-20", desc:"Other spending",             cat:"Other",               amount:560.00, dir:"out", month:"Nov '25" },
  // DECEMBER 2025
  { date:"2025-12-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Dec '25" },
  { date:"2025-12-03", desc:"Employer Salary",            cat:"Salary",              amount:2200.00,dir:"in",  month:"Dec '25" },
  { date:"2025-12-05", desc:"Side Income",                cat:"Side Income",         amount:200.00, dir:"in",  month:"Dec '25" },
  { date:"2025-12-05", desc:"Streaming Service",          cat:"Subscriptions",       amount:13.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-07", desc:"Christmas Drinks (work)",    cat:"Entertainment & Nights Out", amount:40.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-10", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:55.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-12", desc:"Clothing Store",             cat:"Shopping",            amount:52.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-14", desc:"GP Appointment",             cat:"Healthcare",          amount:30.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-15", desc:"Supermarket",                cat:"Groceries",           amount:210.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-18", desc:"Restaurants & Cafes",        cat:"Eating Out & Cafes",  amount:175.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-20", desc:"Train Tickets",              cat:"Transport",           amount:30.00,  dir:"out", month:"Dec '25" },
  { date:"2025-12-22", desc:"Other spending",             cat:"Other",               amount:445.00, dir:"out", month:"Dec '25" },
  { date:"2025-12-24", desc:"Streaming Services (extra)", cat:"Subscriptions",       amount:70.00,  dir:"out", month:"Dec '25" },
  // JANUARY 2026
  { date:"2026-01-01", desc:"Monthly Rent",               cat:"Rent",                amount:1000.00,dir:"out", month:"Jan '26" },
  { date:"2026-01-03", desc:"Employer Salary",            cat:"Salary",              amount:2200.00,dir:"in",  month:"Jan '26" },
  { date:"2026-01-05", desc:"Freelance Project",          cat:"Freelance",           amount:200.00, dir:"in",  month:"Jan '26" },
  { date:"2026-01-05", desc:"Monthly Travelcard",         cat:"Transport",           amount:175.00, dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"Uber",                       cat:"Transport",           amount:12.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-05", desc:"Friend Transfer",            cat:"Personal Transfers",  amount:25.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-06", desc:"Streaming Service",          cat:"Subscriptions",       amount:5.00,   dir:"out", month:"Jan '26" },
  { date:"2026-01-07", desc:"Streaming Service (2nd)",    cat:"Subscriptions",       amount:20.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-08", desc:"Streaming Service (3rd)",    cat:"Subscriptions",       amount:9.00,   dir:"out", month:"Jan '26" },
  { date:"2026-01-09", desc:"Restaurant",                 cat:"Eating Out & Cafes",  amount:29.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-10", desc:"Coffee Shop",                cat:"Eating Out & Cafes",  amount:33.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-12", desc:"GP Appointment",             cat:"Healthcare",          amount:35.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Phone Contract",             cat:"Phone Bill",          amount:35.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Gym Membership",             cat:"Gym & Fitness",       amount:70.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Train Tickets",              cat:"Transport",           amount:88.00,  dir:"out", month:"Jan '26" },
  { date:"2026-01-15", desc:"Supermarket",                cat:"Groceries",           amount:140.00, dir:"out", month:"Jan '26" },
  { date:"2026-01-18", desc:"Other spending",             cat:"Other",               amount:190.00, dir:"out", month:"Jan '26" },
  { date:"2026-01-20", desc:"Night Out",                  cat:"Entertainment & Nights Out", amount:80.00, dir:"out", month:"Jan '26" },
];

// ── PALETTE ───────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  Rent:"#6366f1", Groceries:"#22c55e", Transport:"#3b82f6", "Eating Out & Cafes":"#f59e0b",
  "Entertainment & Nights Out":"#ec4899", Shopping:"#8b5cf6", Healthcare:"#14b8a6",
  Subscriptions:"#f97316", "Gym & Fitness":"#10b981", "Phone Bill":"#64748b",
  "Personal Care":"#f472b6", "Personal Transfers":"#a78bfa", Other:"#94a3b8",
  Salary:"#4ade80", Freelance:"#38bdf8", "Side Income":"#60a5fa",
  Bonus:"#c084fc", "Other Income":"#94a3b8",
};
const INC_COLORS = ["#4ade80","#38bdf8","#60a5fa","#c084fc","#94a3b8","#f9a8d4"];

import { fmt, fmtK, CAT_RULES, INC_RULES, autocat, autocatInc } from "./utils/finance.js";

const Tip = ({ active, payload, label, fmt: fmtFn = fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-sm min-w-36">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color}} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="font-bold">{typeof p.value==="number"?fmtFn(p.value):p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── FORECAST DEFAULTS ────────────────────────────────────────────────────────
const DEFAULT_FIXED = [
  { id:"rent",    label:"Rent",                amount:1000, icon:Home },
  { id:"phone",   label:"Phone Contract",      amount:35,   icon:Smartphone },
  { id:"stream1", label:"Streaming Service A", amount:13,   icon:Tv },
  { id:"stream2", label:"Streaming Service B", amount:20,   icon:Music },
  { id:"cloud",   label:"Cloud Storage",       amount:5,    icon:Cloud },
  { id:"gym",     label:"Gym Membership",      amount:70,   icon:Dumbbell },
];
const DEFAULT_VAR = [
  { id:"groceries", label:"Groceries (£40/wk)",     amount:173.33, icon:ShoppingCart },
  { id:"transport", label:"Transport",               amount:172.50, icon:Bus },
  { id:"eatingout", label:"Eating Out & Cafes",      amount:120.00, icon:UtensilsCrossed },
  { id:"entertain", label:"Entertainment",           amount:60.00,  icon:Film },
  { id:"shopping",  label:"Shopping",                amount:60.00,  icon:ShoppingBag },
  { id:"other",     label:"Other / Misc",            amount:80.00,  icon:Package },
];


const MO_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const THEMES = [
  { id:"indigo",   label:"Indigo",   color:"#6366f1" },
  { id:"midnight", label:"Midnight", color:"#22d3ee" },
  { id:"emerald",  label:"Emerald",  color:"#22c55e" },
  { id:"amber",    label:"Amber",    color:"#f59e0b" },
];

const CURRENCIES = [
  { code:"GBP", symbol:"£" },
  { code:"USD", symbol:"$" },
  { code:"EUR", symbol:"€" },
];

// ── SUBSCRIPTIONS DATA ────────────────────────────────────────────────────────
const SUBSCRIPTIONS = [
  { name:"Streaming Service A",    monthly:13.00, annual:156.00, icon:Tv,         optional:true },
  { name:"Streaming Service B",    monthly:20.00, annual:240.00, icon:Music,      optional:true },
  { name:"Cloud Storage",          monthly:5.00,  annual:60.00,  icon:Cloud,      optional:true },
  { name:"Gaming Subscription",    monthly:14.00, annual:168.00, icon:Gamepad2,   optional:true },
  { name:"Professional Plan",      monthly:9.00,  annual:108.00, icon:Briefcase,  optional:true },
  { name:"Phone Contract",         monthly:35.00, annual:420.00, icon:Smartphone, optional:false, note:"contract" },
  { name:"Gym Membership",         monthly:70.00, annual:840.00, icon:Dumbbell,   optional:true },
];


// ── BANK FORMAT DETECTION ─────────────────────────────────────────────────────
const BANK_FORMATS = [
  {
    name: "Lloyds",
    detect: h => h.includes("Transaction Date") && h.includes("Transaction Description"),
    normalise: row => ({
      dateStr: row["Transaction Date"] || "",
      desc: (row["Transaction Description"] || "").trim(),
      debit:  parseFloat(row["Debit Amount"]  || 0) || 0,
      credit: parseFloat(row["Credit Amount"] || 0) || 0,
      bal:    parseFloat(row["Balance"]       || 0) || 0,
    }),
    newestFirst: true,
  },
  {
    name: "Monzo",
    detect: h => h.includes("Date") && h.includes("Name") && h.includes("Amount") && !h.includes("Transaction Date"),
    normalise: row => {
      const amt = parseFloat(row["Amount"] || 0);
      return {
        dateStr: row["Date"] || "",
        desc: (row["Name"] || row["Description"] || "").trim(),
        debit:  amt < 0 ? Math.abs(amt) : 0,
        credit: amt > 0 ? amt : 0,
        bal:    parseFloat(row["Balance"] || 0) || 0,
      };
    },
    newestFirst: false,
  },
  {
    name: "Starling",
    detect: h => h.includes("Counter Party") && h.includes("Amount (GBP)"),
    normalise: row => {
      const amt = parseFloat(row["Amount (GBP)"] || 0);
      return {
        dateStr: row["Date"] || "",
        desc: (row["Counter Party"] || row["Reference"] || "").trim(),
        debit:  amt < 0 ? Math.abs(amt) : 0,
        credit: amt > 0 ? amt : 0,
        bal:    parseFloat(row["Balance (GBP)"] || 0) || 0,
      };
    },
    newestFirst: false,
  },
  {
    name: "HSBC",
    detect: h => h.includes("Paid Out") && h.includes("Paid In"),
    normalise: row => ({
      dateStr: row["Date"] || "",
      desc: (row["Description"] || "").trim(),
      debit:  parseFloat((row["Paid Out"] || "0").replace(/[^0-9.-]/g, "")) || 0,
      credit: parseFloat((row["Paid In"]  || "0").replace(/[^0-9.-]/g, "")) || 0,
      bal:    parseFloat((row["Balance"]  || "0").replace(/[^0-9.-]/g, "")) || 0,
    }),
    newestFirst: false,
  },
  {
    name: "NatWest",
    detect: h => h.includes("Value") && h.includes("Description") && !h.includes("Transaction Description"),
    normalise: row => {
      const val = parseFloat(row["Value"] || 0);
      return {
        dateStr: row["Date"] || "",
        desc: (row["Description"] || "").trim(),
        debit:  val < 0 ? Math.abs(val) : 0,
        credit: val > 0 ? val : 0,
        bal:    parseFloat(row["Balance"] || 0) || 0,
      };
    },
    newestFirst: false,
  },
];

const parseDateStr = (dateStr) => {
  // Handles DD/MM/YYYY, YYYY-MM-DD, DD MMM YYYY (e.g. "15 Jan 2026")
  const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (!dateStr) return null;
  if (/^\d{2} \w{3} \d{4}$/.test(dateStr.trim())) {
    const [dd, mon, yyyy] = dateStr.trim().split(" ");
    const mm = String(MO.indexOf(mon) + 1).padStart(2, "0");
    return { dd: dd.padStart(2,"0"), mm, yyyy };
  }
  const sep = dateStr.includes("/") ? "/" : "-";
  const parts = dateStr.split(sep);
  if (parts.length !== 3) return null;
  if (parts[0].length === 4) return { dd: parts[2].padStart(2,"0"), mm: parts[1].padStart(2,"0"), yyyy: parts[0] };
  return { dd: parts[0].padStart(2,"0"), mm: parts[1].padStart(2,"0"), yyyy: parts[2] };
};

const parseCSV = (text) => {
  const { data } = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  if (!data.length) throw new Error("File appears empty — no rows found.");

  const headers = Object.keys(data[0] || {});
  const format = BANK_FORMATS.find(f => f.detect(headers));
  if (!format) {
    throw new Error(`Unrecognised CSV format. Supported banks: Lloyds, Monzo, Starling, HSBC, NatWest.\nDetected columns: ${headers.join(", ")}`);
  }

  const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const txs = [];
  const map = {};

  data.forEach(row => {
    const { dateStr, desc, debit, credit, bal } = format.normalise(row);
    if (!dateStr || (!debit && !credit)) return;

    const parsed = parseDateStr(dateStr);
    if (!parsed) return;
    const { dd, mm, yyyy } = parsed;

    const moIdx = parseInt(mm) - 1;
    const label = `${MO[moIdx]} '${yyyy.slice(2)}`;
    const iso   = `${yyyy}-${mm}-${dd}`;

    if (!map[label]) {
      map[label] = { income:0, spending:0, cats:{}, incSrc:{}, balanceEnd: 0,
                     monthNum: parseInt(mm), yearNum: parseInt(yyyy) };
    }
    // For newest-first exports (Lloyds), first seen = month-end. For others, last seen = month-end.
    if (format.newestFirst) {
      if (map[label].balanceEnd === 0) map[label].balanceEnd = bal;
    } else {
      map[label].balanceEnd = bal;
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

  if (!txs.length) {
    const cols = Object.keys(data[0] || {}).join(", ");
    throw new Error(`No valid transactions found. Check the file is a bank export CSV.\nDetected columns: ${cols || "(none)"}`);
  }

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
  "Shopping","Healthcare","Subscriptions","Gym & Fitness","Phone Bill","Personal Care","Personal Transfers","Other",
];

function OtherDrillModal({ month, transactions, onClose, onReassign, fmt }) {
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
              <span className="text-white font-semibold text-sm flex-shrink-0 mr-1">-{fmt(tx.amount)}</span>
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
function GoalInput({ goal, setGoals, sym }) {
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
            setFlash(`+${v % 1 === 0 ? `${sym}${v}` : `${sym}${v.toFixed(2)}`}`);
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

// ── GOAL ICONS MAP ───────────────────────────────────────────────────────────
const GOAL_ICONS = { Shield, Plane, Laptop, Star, Target, Home, Zap, Package, GraduationCap, Wallet, Dumbbell, ShoppingBag };

// ── QUICK-ADD TRANSACTION MODAL ───────────────────────────────────────────────
const MO_ABBR_QA = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function QuickAddModal({ onSave, onClose, sym }) {
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [desc,   setDesc]   = useState("");
  const [amount, setAmount] = useState("");
  const [dir,    setDir]    = useState("out");
  const [cat,    setCat]    = useState("Other");

  const spendCats = ALL_CAT_NAMES;
  const incCats   = ["Salary","Freelance","Bonus","Side Income","Other Income"];
  const cats      = dir === "in" ? incCats : spendCats;

  const handleSave = () => {
    if (!desc.trim() || !amount || !date) return;
    const d = new Date(date);
    const month = `${MO_ABBR_QA[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
    onSave({ date, desc: desc.trim(), cat, amount: Math.abs(parseFloat(amount)), dir, month, manual: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-white">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18}/></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[["out","Spending ↓"],["in","Income ↑"]].map(([val, label]) => (
              <button key={val} onClick={() => { setDir(val); setCat(val === "in" ? "Salary" : "Other"); }}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${dir === val
                  ? val === "in" ? "bg-emerald-700 text-white" : "bg-red-900/60 text-red-300 border border-red-700"
                  : "bg-gray-800 text-gray-500 border border-gray-700"}`}>{label}</button>
            ))}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Tesco, Costa, Salary..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Amount ({sym})</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!desc.trim() || !amount || !date}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm transition-all">Add</button>
        </div>
      </div>
    </div>
  );
}

// ── GOAL EDITOR MODAL ─────────────────────────────────────────────────────────
function GoalEditorModal({ goal, onSave, onDelete, onClose }) {
  const isNew = !goal.id;
  const [name,    setName]    = useState(goal.name    ?? "");
  const [target,  setTarget]  = useState(goal.target  ?? 500);
  const [saved,   setSaved]   = useState(goal.saved   ?? 0);
  const [date,    setDate]    = useState(() => {
    const d = goal.date ?? "";
    if (d.includes(" ")) {
      const MO_LIST = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const [ms, ys] = d.split(" ");
      const mo = MO_LIST.indexOf(ms) + 1;
      if (mo > 0 && ys) return `${ys}-${String(mo).padStart(2, "0")}`;
    }
    return d;
  });
  const [iconKey, setIconKey] = useState(goal.iconKey ?? "Target");

  const handleSave = () => {
    if (!name.trim() || target <= 0) return;
    const clampedSaved = Math.min(Math.max(0, Number(saved)), Number(target));
    onSave({ id: goal.id ?? Date.now(), name: name.trim(), target: Number(target), date, iconKey, saved: clampedSaved });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-white">{isNew ? "Add Goal" : "Edit Goal"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Goal name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emergency Fund"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Target amount</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Target date</label>
              <input type="month" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
          </div>
          {!isNew && (
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Amount saved so far (correct if needed)</label>
              <input type="number" value={saved} onChange={e => setSaved(e.target.value)} min="0" max={target}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GOAL_ICONS).map(([key, Icon]) => (
                <button key={key} onClick={() => setIconKey(key)}
                  className={`p-2 rounded-lg border transition-all ${iconKey === key ? "border-indigo-500 bg-indigo-900/40" : "border-gray-700 bg-gray-800 hover:border-gray-500"}`}>
                  <Icon size={16} className={iconKey === key ? "text-indigo-400" : "text-gray-400"}/>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
            {isNew ? "Add Goal" : "Save Changes"}
          </button>
          {!isNew && (
            <button onClick={() => { onDelete(goal.id); onClose(); }}
              className="px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-800 hover:bg-red-900/30 transition-all">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function SpendingTracker() {
  const [tab, setTab]             = useState("dashboard");
  const [themeId, setThemeId]     = useState(() => localStorage.getItem("theme") ?? "indigo");
  const [currencyCode, setCurrencyCode] = useState(() => localStorage.getItem("currency") ?? "GBP");
  const sym = CURRENCIES.find(c => c.code === currencyCode)?.symbol ?? "£";
  const fmt  = n => `${sym}${Math.abs(n).toFixed(2)}`;
  const fmtK = n => n >= 1000 ? `${sym}${(n/1000).toFixed(1)}k` : `${sym}${Math.round(n)}`;
  const [selMonth, setSelMonth]   = useState(DEFAULT_MONTHLY_SUMMARY[DEFAULT_MONTHLY_SUMMARY.length - 1].label);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterDir, setFilterDir] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [fixedCosts, setFixedCosts]         = useState(DEFAULT_FIXED);
  const [varCosts, setVarCosts]             = useState(DEFAULT_VAR);
  const [monthlyIncome, setMonthlyIncome]   = useState(2200);
  const [horizonMonths, setHorizonMonths]   = useState(6);
  const [planView, setPlanView]             = useState("forecast");
  const [goals, setGoals] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("goals") ?? "null");
      if (saved?.length) return saved;
    } catch {}
    return [
      { id:1, name:"Emergency Fund", iconKey:"Shield", target:3000, date:"2026-06", saved:0 },
      { id:2, name:"Summer Holiday", iconKey:"Plane",  target:800,  date:"2026-07", saved:0 },
      { id:3, name:"New Laptop",     iconKey:"Laptop", target:1200, date:"2026-09", saved:0 },
    ];
  });
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingGoal,    setEditingGoal]    = useState(null);
  // subToggles: true = marked for cancellation, false = keep
  const [subToggles, setSubToggles]         = useState({});
  const [affordabilityItem, setAffordabilityItem]   = useState("");
  const [affordabilityAmount, setAffordabilityAmount] = useState("");
  const [affordabilityDate, setAffordabilityDate]     = useState("");
  const [spreadMonths, setSpreadMonths]     = useState(6);
  const [importedData, setImportedData]     = useState(() => {
    try {
      const raw = localStorage.getItem("spendingData");
      return raw ? JSON.parse(raw) : null;
    } catch { localStorage.removeItem("spendingData"); return null; }
  });
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
  const [csvError, setCsvError]               = useState(null);
  const [manualTxs, setManualTxs]             = useState(() => {
    try { return JSON.parse(localStorage.getItem("manualTxs") ?? "[]"); } catch { return []; }
  });
  const [editingTxKey, setEditingTxKey]       = useState(null);
  const [showQuickAdd, setShowQuickAdd]       = useState(false);
  const [healthExpanded, setHealthExpanded]   = useState(false);
  const csvInputRef                         = useRef(null);
  const overviewRef                         = useRef(null);

  // ── ACTIVE DATA — shadows module-level defaults when CSV is loaded ─────────
  const MONTHLY_SUMMARY  = useMemo(() => {
    const base = importedData?.summary ?? DEFAULT_MONTHLY_SUMMARY;
    if (manualTxs.length === 0) return base;
    return base.map(mo => {
      const mTxs = manualTxs.filter(t => t.month === mo.label);
      if (!mTxs.length) return mo;
      const incDelta = mTxs.filter(t => t.dir === "in").reduce((s, t) => s + t.amount, 0);
      const outDelta = mTxs.filter(t => t.dir === "out").reduce((s, t) => s + t.amount, 0);
      return { ...mo, income: mo.income + incDelta, spending: mo.spending + outDelta, net: mo.net + incDelta - outDelta };
    });
  }, [importedData, manualTxs]);
  const INCOME_BREAKDOWN = importedData?.income  ?? DEFAULT_INCOME_BREAKDOWN;
  const ALL_TRANSACTIONS = useMemo(() => {
    const raw = [...(importedData?.transactions ?? DEFAULT_ALL_TRANSACTIONS), ...manualTxs];
    if (Object.keys(txCatOverrides).length === 0) return raw;
    return raw.map(tx => {
      const key = `${tx.date}:${tx.desc}`;
      return txCatOverrides[key] ? { ...tx, cat: txCatOverrides[key] } : tx;
    });
  }, [importedData, txCatOverrides, manualTxs]);
  const MONTHLY_CATEGORIES = useMemo(() => {
    if (Object.keys(txCatOverrides).length === 0 && manualTxs.length === 0) {
      return importedData?.categories ?? DEFAULT_MONTHLY_CATEGORIES;
    }
    const result = {};
    ALL_TRANSACTIONS.forEach(tx => {
      if (tx.dir !== "out") return;
      if (!result[tx.month]) result[tx.month] = {};
      result[tx.month][tx.cat] = (result[tx.month][tx.cat] || 0) + Math.round(tx.amount * 100) / 100;
    });
    return result;
  }, [ALL_TRANSACTIONS, importedData, txCatOverrides, manualTxs]);
  const MONTHS             = MONTHLY_SUMMARY.map(m => m.label);

  // ── PERSIST GOALS & MANUAL TXS ───────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("goals", JSON.stringify(goals)); }, [goals]);
  useEffect(() => { try { localStorage.setItem("manualTxs", JSON.stringify(manualTxs)); } catch {} }, [manualTxs]);

  // ── AUTO-DISMISS IMPORT SUCCESS BANNER ───────────────────────────────────────
  useEffect(() => {
    if (!importSuccess) return;
    const t = setTimeout(() => setImportSuccess(false), 6000);
    return () => clearTimeout(t);
  }, [importSuccess]);

  // ── SYNC filterMonth WITH selMonth IN BREAKDOWN TAB ─────────────────────────
  useEffect(() => {
    if (tab === "breakdown") setFilterMonth(selMonth);
    else setFilterMonth("All");
  }, [tab, selMonth]);

  // ── SYNC selMonth WHEN DATA CHANGES ────────────────────────────────────────
  useEffect(() => {
    const labels = MONTHLY_SUMMARY.map(m => m.label);
    if (!labels.includes(selMonth)) {
      setSelMonth(labels[labels.length - 1] ?? selMonth);
    }
  }, [importedData]);

  // ── CSV HANDLER ───────────────────────────────────────────────────────────
  const handleCSVFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please select a .csv file. Other formats are not supported.");
      return;
    }
    setCsvError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try { setImportPreview(parseCSV(e.target.result)); }
      catch (err) { setCsvError(err.message); }
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
  const currentBalance  = importedData?.currentBalance ?? DEFAULT_MONTHLY_SUMMARY[DEFAULT_MONTHLY_SUMMARY.length - 1].balanceEnd;

  const runway = currentBalance / avgSpend;
  const leftToSpend = currentBalance - totalFixed;
  const ageOfMoney = Math.round(currentBalance / (avgSpend / 30));
  const savingsRate = historicIncome > 0 ? Math.round(((historicIncome - historicSpend) / historicIncome) * 100) : 0;
  const worstMonth = [...MONTHLY_SUMMARY].sort((a,b) => a.net - b.net)[0];
  const bestMonth  = [...MONTHLY_SUMMARY].sort((a,b) => b.net - a.net)[0];

  const monthOverMonthDeltas = useMemo(() => {
    const months = MONTHLY_SUMMARY.map(m => m.label);
    if (months.length < 2) return {};
    const latest = months[months.length - 1];
    const prev   = months[months.length - 2];
    const latestCats = MONTHLY_CATEGORIES[latest] || {};
    const prevCats   = MONTHLY_CATEGORIES[prev]   || {};
    const deltas = {};
    const allKeys = new Set([...Object.keys(latestCats), ...Object.keys(prevCats)]);
    allKeys.forEach(k => {
      deltas[k] = (latestCats[k] || 0) - (prevCats[k] || 0);
    });
    return deltas;
  }, [MONTHLY_CATEGORIES]);

  // ── 3-MONTH CATEGORY TREND (up / flat / down) ────────────────────────────
  const categoryTrends = useMemo(() => {
    const months = MONTHLY_SUMMARY.map(m => m.label);
    if (months.length < 3) return {};
    const [m1, m2, m3] = months.slice(-3);
    const trends = {};
    const allCatKeys = new Set([
      ...Object.keys(MONTHLY_CATEGORIES[m1] || {}),
      ...Object.keys(MONTHLY_CATEGORIES[m2] || {}),
      ...Object.keys(MONTHLY_CATEGORIES[m3] || {}),
    ]);
    allCatKeys.forEach(cat => {
      const v1 = MONTHLY_CATEGORIES[m1]?.[cat] || 0;
      const v2 = MONTHLY_CATEGORIES[m2]?.[cat] || 0;
      const v3 = MONTHLY_CATEGORIES[m3]?.[cat] || 0;
      // Linear slope over 3 points (simple: end - start)
      const slope = v3 - v1;
      const avg = (v1 + v2 + v3) / 3;
      const threshold = avg * 0.12; // >12% swing = directional
      trends[cat] = slope > threshold ? "up" : slope < -threshold ? "down" : "flat";
    });
    return trends;
  }, [MONTHLY_SUMMARY, MONTHLY_CATEGORIES]);

  // ── BUDGET PACE WARNINGS (80%+ spent by mid-month) ───────────────────────
  const budgetPaceWarnings = useMemo(() => {
    if (!selMonth) return [];
    // Build budgetMap from cost items
    const budgetMap = {};
    [...fixedCosts, ...varCosts].forEach(c => {
      if (!c.amount) return;
      const matched = ALL_CAT_NAMES.find(cat =>
        cat.toLowerCase().includes(c.label.toLowerCase().split(" (")[0]) ||
        c.label.toLowerCase().includes(cat.toLowerCase())
      );
      if (matched) budgetMap[matched] = (budgetMap[matched] || 0) + c.amount;
    });
    if (Object.keys(budgetMap).length === 0) return [];

    // Transactions in selected month, sorted by date
    const monthTxs = ALL_TRANSACTIONS
      .filter(t => t.dir === "out" && t.month === selMonth)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (monthTxs.length === 0) return [];

    // What day is mid-month? Use day 15
    const midDay = 15;
    const warnings = [];

    Object.entries(budgetMap).forEach(([cat, budget]) => {
      const catTxs = monthTxs.filter(t => t.cat === cat);
      if (catTxs.length === 0) return;
      // Spending up to and including day 15
      const spentByMid = catTxs
        .filter(t => parseInt(t.date.split("-")[2]) <= midDay)
        .reduce((s, t) => s + t.amount, 0);
      const pctByMid = spentByMid / budget;
      if (pctByMid >= 0.8) {
        const totalSpent = catTxs.reduce((s, t) => s + t.amount, 0);
        warnings.push({ cat, budget, spentByMid, totalSpent, pctByMid });
      }
    });
    return warnings.sort((a, b) => b.pctByMid - a.pctByMid);
  }, [selMonth, fixedCosts, varCosts, ALL_TRANSACTIONS, ALL_CAT_NAMES]);

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
  // Uses forecastData months so it works for any dataset end date, not just Jan 2026.
  const purchaseSimulation = useMemo(() => {
    const amt = parseFloat(affordabilityAmount);
    if (!amt || isNaN(amt) || amt <= 0 || !affordabilityDate || forecastData.length === 0) return null;

    const parts = affordabilityDate.split("-");
    if (parts.length < 2) return null;
    const purchaseYear     = parseInt(parts[0]);
    const purchaseMonthNum = parseInt(parts[1]);
    if (purchaseMonthNum < 1 || purchaseMonthNum > 12) return null;

    const purchaseLabel = `${MO_ABBR[purchaseMonthNum - 1]} '${String(purchaseYear).slice(2)}`;
    const purchaseIdx   = forecastData.findIndex(d => d.month === purchaseLabel);
    if (purchaseIdx === -1) return null;

    let balBase = currentBalance;
    let balWith = currentBalance;
    // Spread the cost evenly across `spreadMonths` months starting at purchaseIdx
    const monthlyCharge = amt / spreadMonths;

    const allMonths = forecastData.map((d, idx) => {
      balBase += d.Net;
      const isSpreadMonth = idx >= purchaseIdx && idx < purchaseIdx + spreadMonths;
      balWith += isSpreadMonth ? d.Net - monthlyCharge : d.Net;
      return {
        month: d.month,
        "Without Purchase": Math.round(balBase),
        "With Purchase":    Math.round(balWith),
        isPurchase: idx === purchaseIdx,
      };
    });

    // Extend window to cover the full spread + 2 months after
    const showFrom = Math.max(0, purchaseIdx - 1);
    const showTo   = Math.min(forecastData.length, purchaseIdx + spreadMonths + 2);
    const simMonths = allMonths.slice(showFrom, showTo);

    const lowestWithPurchase = Math.min(...allMonths.map(m => m["With Purchase"]));
    const verdict =
      lowestWithPurchase >= 500 ? "COMFORTABLE" :
      lowestWithPurchase >= 0   ? "TIGHT"        : "SHORTFALL";

    const recoversAt = allMonths.slice(purchaseIdx + spreadMonths).find(m => m["With Purchase"] >= 500);
    const spreadMonthlyExtra = monthlyCharge.toFixed(2);
    const monthlyNetVal = forecastData[0].Net;

    return {
      simMonths,
      amt,
      monthlyNet: Math.round(monthlyNetVal),
      lowestWithPurchase,
      verdict,
      purchaseMonthLabel: purchaseLabel,
      recoversAt: recoversAt?.month || null,
      spreadMonthlyExtra,
      balanceAfterPurchase: Math.round(currentBalance + monthlyNetVal - amt),
    };
  }, [affordabilityAmount, affordabilityDate, forecastData, spreadMonths, currentBalance]);

  // ── AUTO-DETECT RECURRING SUBSCRIPTIONS FROM REAL DATA ──────────────────
  const detectedSubs = useMemo(() => {
    if (!importedData) return null;
    const subTxs = ALL_TRANSACTIONS.filter(t => t.dir === "out" && t.cat === "Subscriptions");
    // Normalise description: lowercase, strip trailing numbers/punctuation/parentheticals
    const normaliseDesc = d => d.toLowerCase().replace(/\s*\(.*?\)/g, "").replace(/\s+\d+$/, "").trim();
    const groups = {};
    subTxs.forEach(tx => {
      const key = normaliseDesc(tx.desc);
      if (!groups[key]) groups[key] = { desc: tx.desc, months: new Set(), amounts: [] };
      groups[key].months.add(tx.month);
      groups[key].amounts.push(tx.amount);
    });
    return Object.values(groups)
      .filter(g => g.months.size >= 2) // must appear in 2+ months to be "recurring"
      .map(g => {
        const sorted = [...g.amounts].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        return { name: g.desc, monthly: Math.round(median * 100) / 100, annual: Math.round(median * 12 * 100) / 100, icon: Radio, optional: true };
      })
      .sort((a, b) => b.monthly - a.monthly);
  }, [importedData, ALL_TRANSACTIONS]);

  // Active subscription list: real data when available, hardcoded for demo
  const activeSubs = detectedSubs ?? SUBSCRIPTIONS;

  // ── SUBSCRIPTION SAVINGS ──────────────────────────────────────────────────
  const cancelledAnnualSavings = useMemo(() => {
    return activeSubs.reduce((total, sub, idx) => {
      return subToggles[idx] ? total + sub.annual : total;
    }, 0);
  }, [subToggles, activeSubs]);

  const totalSubAnnual = activeSubs.reduce((s, sub) => s + sub.annual, 0);

  const financialHealthScore = useMemo(() => {
    const positiveMonths = MONTHLY_SUMMARY.filter(m => m.net > 0).length;
    const positiveScore  = (positiveMonths / MONTHLY_SUMMARY.length) * 100;
    const runwayScore    = Math.min(runway * 50, 100);
    const subAnnual      = activeSubs.reduce((s, sub) => s + sub.annual, 0);
    const subPercentage  = (subAnnual / historicIncome) * 100;
    const subScore       = Math.max(0, 100 - (subPercentage * 2));
    return Math.round((positiveScore + runwayScore + subScore) / 3);
  }, [runway, historicIncome, activeSubs, MONTHLY_SUMMARY]);

  // ── INCOME NEEDED TO HIT ALL GOALS ON TIME ───────────────────────────────
  const incomeNeededForGoals = useMemo(() => {
    const MO_LIST = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const totalMonthlyGoalContrib = goals.reduce((sum, goal) => {
      const stillNeeded = Math.max(0, goal.target - goal.saved);
      if (stillNeeded <= 0) return sum;
      let monthIdx = -1, yearNum = 0;
      if (goal.date?.includes("-")) {
        const [y, m] = goal.date.split("-");
        monthIdx = parseInt(m) - 1; yearNum = parseInt(y);
      } else if (goal.date?.includes(" ")) {
        const [ms, ys] = goal.date.split(" ");
        monthIdx = MO_LIST.indexOf(ms); yearNum = parseInt(ys);
      }
      const monthsAway = monthIdx === -1 ? 0 : Math.max(1, (yearNum - now.getFullYear()) * 12 + (monthIdx - now.getMonth()));
      return sum + (stillNeeded / monthsAway);
    }, 0);
    return Math.ceil(totalProjected + totalMonthlyGoalContrib);
  }, [goals, totalProjected]);

  // ── PAYDAY PROTOCOL ──────────────────────────────────────────────────────
  const paydayProtocol = useMemo(() => {
    const MO_LIST = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const transfers = goals.map(goal => {
      const stillNeeded = Math.max(0, goal.target - goal.saved);
      if (stillNeeded <= 0) return null;
      let monthIdx = -1, yearNum = 0;
      if (goal.date?.includes("-")) {
        const [y, m] = goal.date.split("-");
        monthIdx = parseInt(m) - 1; yearNum = parseInt(y);
      } else if (goal.date?.includes(" ")) {
        const [ms, ys] = goal.date.split(" ");
        monthIdx = MO_LIST.indexOf(ms); yearNum = parseInt(ys);
      }
      const monthsAway = monthIdx === -1 ? 12 : Math.max(1, (yearNum - now.getFullYear()) * 12 + (monthIdx - now.getMonth()));
      return { name: goal.name, iconKey: goal.iconKey, monthly: Math.ceil(stillNeeded / monthsAway) };
    }).filter(Boolean);
    const totalGoalContrib = transfers.reduce((s, t) => s + t.monthly, 0);
    const remaining = Math.max(0, monthlyIncome - totalProjected - totalGoalContrib);
    const weekly = Math.round(remaining / 4.33);
    return { transfers, totalGoalContrib, remaining, weekly };
  }, [goals, monthlyIncome, totalProjected]);

  // ── THIS MONTH'S ACTION PLAN ──────────────────────────────────────────────
  const monthlyPriorities = useMemo(() => {
    const MO_LIST = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const items = [];

    // 1. Budget pace alerts → urgent overspending
    budgetPaceWarnings.slice(0, 2).forEach(w => {
      items.push({
        urgency: w.pctByMid >= 1.0 ? "red" : "amber",
        title: `Rein in ${w.cat}`,
        body: `${Math.round(w.pctByMid * 100)}% of your ${fmt(w.budget)} budget was spent in the first half of the month.`,
      });
    });

    // 2. Goals behind pace
    goals.forEach(goal => {
      const stillNeeded = Math.max(0, goal.target - goal.saved);
      if (stillNeeded <= 0) return;
      let monthIdx = -1, yearNum = 0;
      if (goal.date?.includes("-")) {
        const [y, m] = goal.date.split("-");
        monthIdx = parseInt(m) - 1; yearNum = parseInt(y);
      } else if (goal.date?.includes(" ")) {
        const [ms, ys] = goal.date.split(" ");
        monthIdx = MO_LIST.indexOf(ms); yearNum = parseInt(ys);
      }
      const monthsAway = monthIdx === -1 ? 0 : Math.max(1, (yearNum - now.getFullYear()) * 12 + (monthIdx - now.getMonth()));
      const monthlyNeeded = stillNeeded / monthsAway;
      if (monthlyNeeded > 0 && monthlyNeeded > projectedNet * 0.4) {
        items.push({
          urgency: monthlyNeeded > projectedNet ? "red" : "amber",
          title: `Save ${fmt(Math.ceil(monthlyNeeded))}/mo → ${goal.name}`,
          body: `${monthsAway} month${monthsAway !== 1 ? "s" : ""} to deadline · ${fmt(stillNeeded)} still needed.`,
        });
      }
    });

    // 3. Marked subscriptions to cancel
    const pendingCancels = activeSubs.filter((s, i) => s.optional && subToggles[i]);
    if (pendingCancels.length > 0) {
      items.push({
        urgency: "green",
        title: `Act on ${pendingCancels.length} subscription${pendingCancels.length > 1 ? "s" : ""} marked for cancellation`,
        body: `Saves ${fmt(pendingCancels.reduce((s, sub) => s + sub.annual, 0) / 12)}/mo (${fmt(pendingCancels.reduce((s, sub) => s + sub.annual, 0))}/yr).`,
      });
    }

    // 4. Healthy fallback
    if (items.length === 0) {
      if (projectedNet > 0) {
        items.push({ urgency: "green", title: "You're on track", body: `Projected surplus of ${fmt(projectedNet)}/mo. Consider boosting a goal or topping up your emergency fund.` });
      } else {
        items.push({ urgency: "amber", title: "Review your spending plan", body: "Set income and budget targets in the Plan tab to unlock personalised recommendations." });
      }
    }

    return items.slice(0, 3);
  }, [budgetPaceWarnings, goals, projectedNet, activeSubs, subToggles, fmt]);

  // ── DYNAMIC INSIGHTS FROM REAL DATA ──────────────────────────────────────
  const dynamicInsights = useMemo(() => {
    if (!importedData || MONTHLY_SUMMARY.length === 0) return null;
    const nets = MONTHLY_SUMMARY.map(m => m.net);
    const incomes = MONTHLY_SUMMARY.map(m => m.income);
    const maxInc = Math.max(...incomes);
    const minInc = Math.min(...incomes);
    const incomeVolatility = maxInc > 0 ? Math.round(((maxInc - minInc) / maxInc) * 100) : 0;

    // Biggest spending category overall
    const catTotals = {};
    ALL_TRANSACTIONS.filter(t => t.dir === "out").forEach(t => {
      catTotals[t.cat] = (catTotals[t.cat] || 0) + t.amount;
    });
    const biggestCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    const otherRatio = catTotals["Other"]
      ? Math.round((catTotals["Other"] / Object.values(catTotals).reduce((s, v) => s + v, 0)) * 100)
      : 0;

    const totalSpend = Object.values(catTotals).reduce((s, v) => s + v, 0);
    const positiveCount = nets.filter(n => n > 0).length;

    const cards = [];

    if (bestMonth) cards.push({ icon:TrendingUp, color:"text-emerald-400", title:"Best month", body:`${bestMonth.label} was your strongest month — net +${fmt(bestMonth.net)}. That's the benchmark to aim for.` });
    if (worstMonth) cards.push({ icon:AlertTriangle, color:"text-amber-400", title:"Hardest month", body:`${worstMonth.label} had a ${fmt(Math.abs(worstMonth.net))} deficit (${fmt(worstMonth.income)} in vs ${fmt(worstMonth.spending)} out). Watch similar patterns.` });

    if (biggestCat) cards.push({ icon:Package, color:"text-purple-400", title:`${biggestCat[0]} dominates`, body:`${biggestCat[0]} is your largest expense category at ${fmt(biggestCat[1])} total — ${Math.round((biggestCat[1]/totalSpend)*100)}% of all spending.` });

    if (incomeVolatility > 20) cards.push({ icon:Stethoscope, color:"text-sky-400", title:"Income swings", body:`Your income varied by ${incomeVolatility}% between your lowest and highest months. Building a buffer covers the lean periods.` });
    else cards.push({ icon:Stethoscope, color:"text-sky-400", title:"Consistent income", body:`Income variance is only ${incomeVolatility}% — relatively stable across ${MONTHLY_SUMMARY.length} months of data.` });

    cards.push({ icon:Dumbbell, color:"text-orange-400", title:"Subscriptions cost", body:`${fmt(totalSubAnnual)} per year in subscriptions. Toggle any in Goals & Health to see potential savings.` });

    if (otherRatio > 10) cards.push({ icon:Search, color:"text-gray-400", title:`${otherRatio}% uncategorised`, body:`${fmt(catTotals["Other"])} sits in "Other". Editing transaction descriptions helps auto-categorisation and gives you a more accurate picture.` });

    cards.push({ icon:TrendingDown, color:"text-indigo-400", title:"Positive months", body:`${positiveCount} of ${MONTHLY_SUMMARY.length} months were cash-flow positive. ${positiveCount === MONTHLY_SUMMARY.length ? "Excellent discipline!" : `${MONTHLY_SUMMARY.length - positiveCount} deficit month${MONTHLY_SUMMARY.length - positiveCount > 1 ? "s" : ""} to investigate.`}` });

    return cards;
  }, [importedData, MONTHLY_SUMMARY, ALL_TRANSACTIONS, bestMonth, worstMonth, totalSubAnnual, fmt]);

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
    return ms
      && (filterCat   === "All" || t.cat   === filterCat)
      && (filterDir   === "All" || t.dir   === filterDir)
      && (filterMonth === "All" || t.month === filterMonth);
  }), [search, filterCat, filterDir, filterMonth, ALL_TRANSACTIONS]);

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
      if (!c.amount) return;
      const matched = ALL_CAT_NAMES.find(cat =>
        cat.toLowerCase().includes(c.label.toLowerCase().split(" (")[0]) ||
        c.label.toLowerCase().includes(cat.toLowerCase())
      );
      if (matched) budgetMap[matched] = (budgetMap[matched] || 0) + c.amount;
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
      if (!c.amount) return;
      const matched = ALL_CAT_NAMES.find(cat =>
        cat.toLowerCase().includes(c.label.toLowerCase().split(" (")[0]) ||
        c.label.toLowerCase().includes(cat.toLowerCase())
      );
      if (matched) budgetMap[matched] = (budgetMap[matched] || 0) + c.amount;
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

  // ── OTHER CATEGORY PROMPT ────────────────────────────────────────────────
  const otherPromptMonth = useMemo(() => {
    for (const mo of MONTHLY_SUMMARY) {
      const cats = MONTHLY_CATEGORIES[mo.label] || {};
      const totalSpend = Object.values(cats).reduce((s, v) => s + v, 0);
      const otherSpend = cats["Other"] || 0;
      if (totalSpend > 0 && otherSpend / totalSpend > 0.20) return mo.label;
    }
    return null;
  }, [MONTHLY_CATEGORIES, MONTHLY_SUMMARY]);
  const updateFixed  = (id, v) => setFixedCosts(p => p.map(c => c.id===id ? {...c, amount:Number(v)} : c));
  const updateVar    = (id, v) => setVarCosts(p => p.map(c => c.id===id ? {...c, amount:Number(v)} : c));
  const renameFixed  = (id, v) => setFixedCosts(p => p.map(c => c.id===id ? {...c, label:v} : c));
  const renameVar    = (id, v) => setVarCosts(p => p.map(c => c.id===id ? {...c, label:v} : c));
  const removeFixed  = (id)    => setFixedCosts(p => p.filter(c => c.id !== id));
  const removeVar    = (id)    => setVarCosts(p => p.filter(c => c.id !== id));
  const addFixed     = ()      => setFixedCosts(p => [...p, { id:`f${Date.now()}`, label:"New item", amount:0, icon:Package }]);
  const addVar       = ()      => setVarCosts(p => [...p, { id:`v${Date.now()}`, label:"New item", amount:0, icon:Package }]);
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

  // ── JSON EXPORT / IMPORT ─────────────────────────────────────────────────
  const jsonInputRef = useRef(null);

  const handleExportJSON = () => {
    const state = { version:1, exportedAt: new Date().toISOString(), importedData, txCatOverrides, goals, currencyCode, themeId };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `spending-tracker-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        if (state.version !== 1) throw new Error("Unsupported backup version.");
        if (state.importedData) { setImportedData(state.importedData); localStorage.setItem("spendingData", JSON.stringify(state.importedData)); }
        if (state.txCatOverrides) { setTxCatOverrides(state.txCatOverrides); localStorage.setItem("catOverrides", JSON.stringify(state.txCatOverrides)); }
        if (state.goals?.length) setGoals(state.goals);
        if (state.currencyCode) { setCurrencyCode(state.currencyCode); localStorage.setItem("currency", state.currencyCode); }
        if (state.themeId) { setThemeId(state.themeId); localStorage.setItem("theme", state.themeId); }
        setShowImport(false);
      } catch (err) {
        setCsvError(`Backup restore failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
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

  const updateTxCatInline = (tx, newCat) => {
    const key = `${tx.date}:${tx.desc}`;
    const newOverrides = { ...txCatOverrides, [key]: newCat };
    setTxCatOverrides(newOverrides);
    try { localStorage.setItem("catOverrides", JSON.stringify(newOverrides)); } catch {}
    setEditingTxKey(null);
  };

  const TABS = [
    { id:"dashboard",  label:"Home",     Icon: BarChart3  },
    { id:"breakdown",  label:"Months",   Icon: Calendar   },
    { id:"plan",       label:"Forecast", Icon: TrendingUp },
    { id:"health",     label:"Goals",    Icon: Target     },
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
        <div className="text-2xl font-bold text-white"><AnimatedNumber value={currentBalance} format={fmt}/></div>
        <div className="flex items-center gap-1 mt-0.5">
          <Zap size={10} className="text-emerald-300"/>
          <span className="text-xs text-emerald-300"><AnimatedNumber value={leftToSpend} format={n => `${sym}${Math.round(n)}`}/> free</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-5 flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold"><span className="text-indigo-400">{sym}</span> Spending Tracker</h1>
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
            <button onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all">
              <Download size={13}/> Backup
            </button>
            <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2">
              {THEMES.map(t => (
                <button key={t.id} title={t.label}
                  onClick={() => { setThemeId(t.id); localStorage.setItem("theme", t.id); }}
                  className={`w-4 h-4 rounded-full transition-all ${themeId === t.id ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-110" : "opacity-50 hover:opacity-90"}`}
                  style={{backgroundColor: t.color}}/>
              ))}
            </div>
            <select value={currencyCode} onChange={e => { setCurrencyCode(e.target.value); localStorage.setItem("currency", e.target.value); }}
              className="bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
            </select>
            {[
              { label:"Current Balance",  value:fmt(currentBalance),   sub: importedData ? "latest balance" : `end of ${MONTHS[MONTHS.length-1]}`, color:"text-emerald-400" },
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

            {/* ── WELCOME BANNER ── */}
            {!importedData && !bannerDismissed && (
              <div className="bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-700/50 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-1">Welcome to Spending Tracker</h2>
                <p className="text-gray-400 text-sm mb-5">Import your bank CSV and instantly see where your money goes, forecast your balance, and track goals.</p>
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

            {/* ── HERO: BALANCE + SAVINGS RATE ── */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 border border-indigo-700/40 shadow-xl">
                <div className="text-indigo-300/70 text-xs font-semibold uppercase tracking-wide mb-2">Your Balance</div>
                <div className="text-5xl font-black text-white mt-1"><AnimatedNumber value={currentBalance} format={fmt}/></div>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>{fmt(leftToSpend)} <span className="text-gray-600">discretionary</span></span>
                  <span className="text-gray-700">·</span>
                  <span>{fmt(totalFixed)} <span className="text-gray-600">committed</span></span>
                </div>
              </div>
              {(() => {
                const col = savingsRate >= 20
                  ? { bg:"from-emerald-900 to-teal-900", border:"border-emerald-700/40", val:"text-emerald-300", note:"text-emerald-400/70", label:"On track — 20% is the benchmark" }
                  : savingsRate >= 10
                  ? { bg:"from-amber-900/60 to-yellow-900/60", border:"border-amber-700/40", val:"text-amber-300", note:"text-amber-400/70", label:"Growing — keep pushing toward 20%" }
                  : { bg:"from-red-900/50 to-rose-900/50", border:"border-red-700/40", val:"text-red-300", note:"text-red-400/70", label:"Below target — review your spending" };
                return (
                  <div className={`bg-gradient-to-br ${col.bg} rounded-2xl p-6 border ${col.border}`}>
                    <div className={`${col.note} text-xs font-semibold uppercase tracking-wide mb-2`}>Savings Rate</div>
                    <div className={`text-5xl font-black ${col.val} mt-1`}>{savingsRate}<span className="text-2xl font-normal opacity-60">%</span></div>
                    <p className={`${col.note} text-xs mt-3`}>{col.label}</p>
                  </div>
                );
              })()}
            </div>

            {/* ── THIS MONTH'S PRIORITIES ── */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/40 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-indigo-400"/>
                  <span className="font-semibold text-sm">This Month's Priorities</span>
                </div>
                <span className="text-xs text-gray-500">{monthlyPriorities.length} action{monthlyPriorities.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2.5">
                {monthlyPriorities.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${
                    item.urgency === "red"   ? "bg-red-900/30 border border-red-800/40" :
                    item.urgency === "amber" ? "bg-amber-900/30 border border-amber-800/40" :
                                              "bg-emerald-900/30 border border-emerald-800/40"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                      item.urgency === "red" ? "bg-red-500 text-white" : item.urgency === "amber" ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${item.urgency === "red" ? "text-red-300" : item.urgency === "amber" ? "text-amber-300" : "text-emerald-300"}`}>{item.title}</div>
                      <div className="text-gray-400 text-xs mt-0.5 leading-relaxed">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              {incomeNeededForGoals > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span>Min. income to hit all goals on time:</span>
                  <span className={`font-bold text-sm ${monthlyIncome >= incomeNeededForGoals ? "text-emerald-400" : "text-amber-400"}`}>{fmt(incomeNeededForGoals)}/mo</span>
                </div>
              )}
            </div>

            {/* ── OTHER CATEGORY ALERT ── */}
            {otherPromptMonth && (
              <div className="bg-purple-900/30 border border-purple-700 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <AlertTriangle size={16} className="text-purple-400 flex-shrink-0"/>
                  <p className="text-purple-300 text-sm">"Other" is over 20% of <span className="font-semibold">{otherPromptMonth}</span> spending — reassign to get accurate insights.</p>
                </div>
                <button onClick={() => { setTab("breakdown"); setSelMonth(otherPromptMonth); setOtherDrillMonth(otherPromptMonth); }}
                  className="text-purple-300 border border-purple-700 hover:border-purple-500 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0">
                  Review →
                </button>
              </div>
            )}

            {/* ── LAST MONTH SNAPSHOT ── */}
            {lastMonthReview && (
              <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between gap-4 border border-gray-800">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar size={13} className="text-indigo-400"/>
                    {lastMonthReview.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{lastMonthReview.onBudget} of {lastMonthReview.total} categories on budget</div>
                </div>
                <div className={`text-2xl font-bold ${lastMonthReview.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {lastMonthReview.net >= 0 ? "+" : ""}{fmt(lastMonthReview.net)}
                </div>
                <button onClick={() => { setTab("breakdown"); setSelMonth(lastMonthReview.label); }}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors whitespace-nowrap">
                  See detail →
                </button>
              </div>
            )}

            {/* ── BALANCE TREND ── */}
            {MONTHLY_SUMMARY.some(m => m.balanceEnd > 0) && (
              <motion.div className="bg-gray-900 rounded-2xl p-5 border border-gray-800" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.05,duration:0.3}}>
                <h2 className="text-base font-semibold mb-1 flex items-center gap-2"><TrendingUp size={15} className="text-indigo-400"/> Balance Over Time</h2>
                <p className="text-gray-500 text-xs mb-4">Your month-end balance — the clearest measure of progress.</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={MONTHLY_SUMMARY.map(m => ({ month: m.label, balance: m.balanceEnd }))} margin={{top:4,right:4,bottom:0,left:0}}>
                    <defs>
                      <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                    <XAxis dataKey="month" tick={{fill:"#6b7280",fontSize:10}} tickLine={false}/>
                    <YAxis tickFormatter={fmtK} tick={{fill:"#6b7280",fontSize:10}} width={45}/>
                    <Tooltip content={props => <Tip {...props} fmt={fmt}/>}/>
                    <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2.5} fill="url(#balGrad)" dot={{fill:"#6366f1",r:3}} activeDot={{r:5}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* ── QUICK NAV ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id:"breakdown", icon:Calendar,   label:"Months",   sub:"Spending by month"   },
                { id:"plan",      icon:TrendingUp,  label:"Forecast", sub:"Budget & simulate"   },
                { id:"health",    icon:Target,      label:"Goals",    sub:"Savings & health"    },
              ].map(({ id, icon: Icon, label, sub }) => (
                <button key={id} onClick={() => setTab(id)}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-700 rounded-2xl p-4 text-left transition-all group">
                  <Icon size={18} className="text-indigo-400 mb-2"/>
                  <div className="font-semibold text-sm text-white">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
                </button>
              ))}
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
                  const isPositive = (data?.net ?? 0) >= 0;
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

            {budgetPaceWarnings.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={15} className="text-amber-400"/>
                  <span className="text-amber-300 text-sm font-semibold">Budget pace alert</span>
                  <span className="text-amber-500 text-xs">— these categories were 80%+ spent by mid-month</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {budgetPaceWarnings.map(w => (
                    <div key={w.cat} className="bg-amber-900/30 border border-amber-700/40 rounded-lg px-3 py-2 text-xs">
                      <span className="text-amber-300 font-semibold">{w.cat}</span>
                      <span className="text-amber-500 ml-1.5">{Math.round(w.pctByMid * 100)}% by day 15</span>
                      <span className="text-gray-500 ml-1.5">({fmt(w.spentByMid)} of {fmt(w.budget)} budget)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const ms = MONTHLY_SUMMARY.find(m => m.label === selMonth);
              if (!ms) return null;
              const incomeData = Object.entries(INCOME_BREAKDOWN[selMonth] || {}).map(([name, value]) => ({ name, value }));
              return (
                <>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
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

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
                                {selCats.filter(c => c.value > 3).map(e => <Cell key={e.name} fill={CAT_COLORS[e.name] || "#6366f1"} stroke="transparent"/>)}
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
                              <Tooltip content={props => <Tip {...props} fmt={fmt}/>}/>
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
                      const budgetMap = {};
                      [...fixedCosts, ...varCosts].forEach(c => {
                        if (!c.amount) return;
                        const matched = ALL_CAT_NAMES.find(cat =>
                          cat.toLowerCase().includes(c.label.toLowerCase().split(" (")[0]) ||
                          c.label.toLowerCase().includes(cat.toLowerCase())
                        );
                        if (matched) budgetMap[matched] = (budgetMap[matched] || 0) + c.amount;
                      });
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold flex items-center gap-2"><CreditCard size={15} className="text-gray-400"/> Transactions
                  {manualTxs.length > 0 && <span className="text-xs bg-indigo-900/50 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">{manualTxs.length} manual</span>}
                </h2>
                <button onClick={() => setShowQuickAdd(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all">
                  + Add Transaction
                </button>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4 flex flex-wrap gap-3 items-center mb-3">
                <div className="flex-1 min-w-48 relative">
                  <input type="text" placeholder="Search transactions…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"/>
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      <X size={14}/>
                    </button>
                  )}
                </div>
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
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                  <option value="All">All months</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{filteredTxs.length} entries</span>
                  {(search || filterCat !== "All" || filterDir !== "All") && (
                    <button onClick={() => { setSearch(""); setFilterCat("All"); setFilterDir("All"); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-800 rounded-lg px-2 py-1 transition-colors">
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl overflow-hidden overflow-x-auto">
                <div className="grid text-xs font-semibold text-gray-500 uppercase px-5 py-3 border-b border-gray-800 min-w-[600px]"
                  style={{gridTemplateColumns:"90px 70px 1fr 160px 80px 100px"}}>
                  <span>Date</span><span>Month</span><span>Description</span><span>Category</span><span>Type</span><span className="text-right">Amount</span>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/40 min-w-[600px]">
                  {filteredTxs.map((tx, i) => {
                    const txKey = `${tx.date}:${tx.desc}:${i}`;
                    const isEditing = editingTxKey === txKey;
                    return (
                      <div key={txKey} className="grid items-center px-5 py-2.5 hover:bg-gray-800/50 text-sm"
                        style={{gridTemplateColumns:"90px 70px 1fr 160px 80px 100px"}}>
                        <span className="text-gray-500 text-xs">{tx.date?.slice(5) ?? "—"}</span>
                        <span className="text-gray-600 text-xs">{tx.month}</span>
                        <div className="flex items-center gap-1.5 pr-2 min-w-0">
                          <span className="text-gray-200 truncate">{tx.desc}</span>
                          {tx.manual && <span className="text-indigo-500 text-xs flex-shrink-0">✦</span>}
                        </div>
                        <span className="flex items-center gap-1">
                          {isEditing ? (
                            <select autoFocus defaultValue={tx.cat}
                              onChange={e => updateTxCatInline(tx, e.target.value)}
                              onBlur={() => setEditingTxKey(null)}
                              className="bg-gray-700 border border-indigo-500 rounded-lg px-1.5 py-0.5 text-xs text-white focus:outline-none w-full">
                              {ALL_CAT_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          ) : (
                            <button onClick={() => setEditingTxKey(txKey)}
                              className="flex items-center gap-1.5 group hover:bg-gray-700 rounded-lg px-1.5 py-0.5 transition-colors w-full text-left">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: CAT_COLORS[tx.cat] || "#6366f1"}}/>
                              <span className="text-gray-400 text-xs truncate">{tx.cat}</span>
                              <Pencil size={9} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 ml-auto"/>
                            </button>
                          )}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${tx.dir==="in" ? "bg-green-900/40 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                          {tx.dir === "in" ? "↑ In" : "↓ Out"}
                        </span>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`font-semibold ${tx.dir==="in" ? "text-green-400" : "text-white"}`}>
                            {tx.dir === "in" ? "+" : "-"}{fmt(tx.amount)}
                          </span>
                          {tx.manual && (
                            <button onClick={() => setManualTxs(p => p.filter(m => !(m.date === tx.date && m.desc === tx.desc && m.amount === tx.amount)))}
                              className="text-gray-700 hover:text-red-400 transition-colors" title="Remove manual transaction">
                              <X size={11}/>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
              {(() => {
                const bestIncome  = Math.round(Math.max(...MONTHLY_SUMMARY.map(m => m.income)));
                const normIncome  = Math.round(avgIncome);
                const hardIncome  = Math.round(Math.min(...MONTHLY_SUMMARY.map(m => m.income)));
                const bestMonth   = MONTHLY_SUMMARY.reduce((a,b) => b.income > a.income ? b : a);
                const hardMonth   = MONTHLY_SUMMARY.reduce((a,b) => b.income < a.income ? b : a);
                return (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                    {[
                      { label:"Best Case",    income:bestIncome, desc:`Your best month (${bestMonth.label})` },
                      { label:"Normal Month", income:normIncome, desc:`${MONTHLY_SUMMARY.length}-month average` },
                      { label:"Hard Month",   income:hardIncome, desc:`Your toughest month (${hardMonth.label})` },
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
                );
              })()}
            </div>

            <div className="bg-gray-900 rounded-2xl p-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Expected Monthly Income ({sym})</label>
                <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"/>
                <p className="text-gray-500 text-xs mt-1">Avg actual: {fmt(avgIncome)}/mo over {MONTHLY_SUMMARY.length} months</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Forecast Horizon</label>
                <input type="range" min={3} max={12} value={horizonMonths}
                  onChange={e => setHorizonMonths(Number(e.target.value))} className="w-full accent-indigo-500 mt-2"/>
                <p className="text-gray-400 text-xs mt-1">{horizonMonths} months (to {forecastData[horizonMonths - 1]?.month ?? "—"})</p>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border grid gap-4 grid-cols-2 sm:grid-cols-4 ${projectedNet >= 0 ? "bg-emerald-900/20 border-emerald-800" : "bg-red-900/20 border-red-800"}`}>
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
                    <div className="flex-1 min-w-0">
                      <input type="text" value={c.label}
                        onChange={e => renameFixed(c.id, e.target.value)}
                        className="bg-transparent text-sm font-medium text-white w-full focus:outline-none focus:border-b focus:border-indigo-500 truncate"/>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-gray-500 text-sm">{sym}</span>
                      <input type="number" value={c.amount} step="0.01"
                        onChange={e => updateFixed(c.id, e.target.value)}
                        className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white text-right focus:outline-none focus:border-indigo-500"/>
                      <span className="text-gray-500 text-xs">/mo</span>
                      <button onClick={() => removeFixed(c.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-1"><X size={14}/></button>
                    </div>
                  </div>
                  );
                })}
                <button onClick={addFixed}
                  className="w-full py-2 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-indigo-600 hover:text-indigo-400 text-sm transition-all">
                  + Add fixed cost
                </button>
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
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {varCosts.map(c => {
                  const Icon = c.icon;
                  const hist = catTotals.find(([cat]) => cat === c.label.split(" (")[0] || cat === c.label);
                  const avg8 = hist ? hist[1] / MONTHLY_SUMMARY.length : 0;
                  return (
                    <div key={c.id} className="bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={15} className="text-amber-400 flex-shrink-0"/>
                        <input type="text" value={c.label}
                          onChange={e => renameVar(c.id, e.target.value)}
                          className="flex-1 bg-transparent text-sm font-medium text-white focus:outline-none focus:border-b focus:border-amber-500 min-w-0 truncate"/>
                        <button onClick={() => removeVar(c.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"><X size={13}/></button>
                      </div>
                      {avg8 > 0 && <div className="text-xs text-gray-500 mb-2">{MONTHLY_SUMMARY.length}-mo avg actual: <span className="text-gray-300">{fmt(avg8)}/mo</span></div>}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">{sym}</span>
                        <input type="number" value={c.amount} step="5"
                          onChange={e => updateVar(c.id, e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                        <span className="text-gray-500 text-xs">/mo</span>
                      </div>
                    </div>
                  );
                })}
                <button onClick={addVar}
                  className="bg-gray-800/50 border border-dashed border-gray-700 hover:border-amber-600 hover:text-amber-400 rounded-xl p-3 text-gray-500 text-sm transition-all">
                  + Add variable budget
                </button>
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
                  <Tooltip content={props => <Tip {...props} fmt={fmt}/>}/>
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
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
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
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
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
                          <Tooltip content={props => <Tip {...props} fmt={fmt}/>}/>
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

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
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

            {/* ─── ACTION PLAN ─── */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/40 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-indigo-400"/>
                  <span className="font-semibold text-sm">This Month's Priorities</span>
                </div>
                <span className="text-xs text-gray-500">Top {monthlyPriorities.length} action{monthlyPriorities.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2.5">
                {monthlyPriorities.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${
                    item.urgency === "red"   ? "bg-red-900/30 border border-red-800/40" :
                    item.urgency === "amber" ? "bg-amber-900/30 border border-amber-800/40" :
                                              "bg-emerald-900/30 border border-emerald-800/40"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                      item.urgency === "red" ? "bg-red-500 text-white" : item.urgency === "amber" ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${item.urgency === "red" ? "text-red-300" : item.urgency === "amber" ? "text-amber-300" : "text-emerald-300"}`}>{item.title}</div>
                      <div className="text-gray-400 text-xs mt-0.5 leading-relaxed">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <span>Min. income to stay on track with all goals:</span>
                <span className={`font-bold text-sm ${monthlyIncome >= incomeNeededForGoals ? "text-emerald-400" : "text-amber-400"}`}>{fmt(incomeNeededForGoals)}/mo</span>
              </div>
            </div>

            {/* ─── PAYDAY PROTOCOL ─── */}
            {paydayProtocol.transfers.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={15} className="text-emerald-400"/>
                  <span className="font-semibold text-sm">Payday Protocol</span>
                  <span className="text-xs text-gray-500 ml-1">— transfer these on payday before spending anything</span>
                </div>
                <div className="space-y-2 mb-4">
                  {paydayProtocol.transfers.map((t, i) => {
                    const Icon = GOAL_ICONS[t.iconKey] ?? Target;
                    return (
                      <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-300">{i + 1}</div>
                          <Icon size={14} className="text-indigo-400"/>
                          <span className="text-sm text-gray-200">{t.name}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">{fmt(t.monthly)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-800 pt-3 grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Left for spending</div>
                    <div className={`text-xl font-bold ${paydayProtocol.remaining > 0 ? "text-white" : "text-red-400"}`}>{fmt(paydayProtocol.remaining)}</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Weekly budget</div>
                    <div className={`text-xl font-bold ${paydayProtocol.weekly > 0 ? "text-indigo-400" : "text-red-400"}`}>{fmt(paydayProtocol.weekly)}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-xs mt-3">Based on your forecast income ({fmt(monthlyIncome)}/mo) and goal timelines. Update in Plan tab.</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-semibold">Your Goals</h2>
              <button onClick={() => { setEditingGoal({}); setShowGoalEditor(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-900/40 border border-indigo-700 text-indigo-300 text-xs font-semibold hover:border-indigo-500 transition-all">
                + Add Goal
              </button>
            </div>

            <div className="space-y-3">
              {goals.map(goal => {
                const GoalIcon = GOAL_ICONS[goal.iconKey] ?? Target;
                const progress = Math.min(100, (goal.saved / goal.target) * 100);
                // date stored as "YYYY-MM" or legacy "Mon YYYY"
                const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                let monthIdx = -1, yearNum = 0;
                if (goal.date?.includes("-")) {
                  const [y, m] = goal.date.split("-");
                  monthIdx = parseInt(m) - 1; yearNum = parseInt(y);
                } else if (goal.date?.includes(" ")) {
                  const [ms, ys] = goal.date.split(" ");
                  monthIdx = MO.indexOf(ms); yearNum = parseInt(ys);
                }
                const now = new Date();
                const rawMonthsAway = monthIdx === -1 ? 0 : (yearNum - now.getFullYear()) * 12 + (monthIdx - now.getMonth());
                const isOverdue = rawMonthsAway < 0;
                const monthsAway = Math.max(0, rawMonthsAway);
                const stillNeeded = Math.max(0, goal.target - goal.saved);
                const monthlyNeeded = monthsAway > 0 ? stillNeeded / monthsAway : stillNeeded;
                const isAchievable = !isOverdue && monthlyNeeded <= Math.max(projectedNet, 0);
                const dateLabel = goal.date ? (goal.date.includes("-") ? `${MO[monthIdx]} ${yearNum}` : goal.date) : "No date";

                return (
                  <div key={goal.id} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <GoalIcon size={32} className="text-indigo-400"/>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{goal.name}</h3>
                          <p className="text-gray-500 text-xs">Target: {fmt(goal.target)} by {dateLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                      <button onClick={() => { setEditingGoal(goal); setShowGoalEditor(true); }}
                        className="text-gray-600 hover:text-gray-300 p-1 transition-colors" title="Edit goal">
                        <Pencil size={14}/>
                      </button>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-400">{fmt(goal.saved)}</div>
                        <div className="text-xs text-gray-500">saved · {Math.round(progress)}% done</div>
                      </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width:`${progress}%`}}/>
                      </div>
                    </div>

                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
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

                    <GoalInput goal={goal} setGoals={setGoals} sym={sym}/>
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
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
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
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
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
                {activeSubs.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No recurring subscriptions detected in your transactions.
                </div>
              )}
              {activeSubs.map((sub, idx) => {
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
                          {sub.monthly > 0 ? `${sym}${sub.monthly.toFixed(2)}/mo` : "One-time"}
                          <span className="mx-1.5 text-gray-700">·</span>
                          <span className="font-semibold text-gray-300">{fmt(sub.annual)}/year</span>
                        </div>
                      </div>
                      {sub.optional && (
                        <button onClick={() => setSubToggles(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${isCancelled ? "bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-900/80" : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white"}`}>
                          {isCancelled ? <span className="flex items-center gap-1"><Check size={11}/> Keep</span> : <span className="flex items-center gap-1"><X size={11}/> Cancel</span>}
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
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
          onClick={e => e.target === e.currentTarget && (setShowImport(false), setImportPreview(null), setCsvError(null))}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Import Bank CSV</h2>
                <p className="text-gray-400 text-xs mt-0.5">Your data stays in the browser — nothing is uploaded</p>
              </div>
              <button onClick={() => { setShowImport(false); setImportPreview(null); setCsvError(null); }}
                className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>

            {!importPreview ? (
              <>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleCSVFile(e.dataTransfer.files[0]); }}
                  onClick={() => csvInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragOver ? "border-indigo-500 bg-indigo-900/20" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/40"
                  }`}>
                  <Folder size={36} className="text-gray-400 mb-3 mx-auto"/>
                  <p className="text-white font-semibold mb-1">Drop your bank CSV here</p>
                  <p className="text-gray-500 text-sm">or click to browse</p>
                  <input ref={csvInputRef} type="file" accept=".csv" className="hidden"
                    onChange={e => handleCSVFile(e.target.files[0])}/>
                </div>

                {csvError && (
                  <div className="mt-3 bg-red-900/30 border border-red-700 rounded-xl p-3 flex gap-2 items-start">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-red-300 text-sm whitespace-pre-line">{csvError}</p>
                  </div>
                )}

                <div className="mt-4 bg-gray-800/50 rounded-xl p-4 space-y-3 text-xs text-gray-400">
                  <div>
                    <p className="text-gray-300 font-semibold mb-1.5">Supported banks</p>
                    <div className="grid gap-1" style={{gridTemplateColumns:"1fr 1fr"}}>
                      {["Lloyds Bank","Monzo","Starling Bank","HSBC","NatWest"].map(b => (
                        <span key={b} className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400"/>{b}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 font-semibold mb-1">How to export (Lloyds)</p>
                    <ol className="space-y-0.5 list-decimal list-inside text-gray-500">
                      <li>Log in → select your account</li>
                      <li>Statements &amp; transactions → Export</li>
                      <li>Choose date range → Download CSV</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => {
                      const sample = `Transaction Date,Transaction Description,Debit Amount,Credit Amount,Balance\n01/01/2026,Monthly Rent,1000.00,,2500.00\n02/01/2026,Employer Salary,,2200.00,3700.00\n05/01/2026,Supermarket,85.00,,3615.00\n10/01/2026,Coffee Shop,4.50,,3610.50\n15/01/2026,Phone Contract,35.00,,3575.50\n20/01/2026,Streaming Service,12.99,,3562.51`;
                      const blob = new Blob([sample], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "sample-bank-export.csv"; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Download size={12}/> Download sample CSV
                  </button>
                </div>

                {importedData && (
                  <button
                    onClick={() => {
                      if (!window.confirm("Revert to demo data? This will remove all imported data and overrides.")) return;
                      setImportedData(null); setImportPreview(null); setShowImport(false); setSelMonth(DEFAULT_MONTHLY_SUMMARY[DEFAULT_MONTHLY_SUMMARY.length - 1].label);
                      localStorage.removeItem("spendingData"); localStorage.removeItem("catOverrides"); setTxCatOverrides({});
                    }}
                    className="mt-3 w-full py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-red-700 hover:bg-red-900/20 transition-all">
                    ↩ Revert to demo data
                  </button>
                )}

                <div className="mt-3 border-t border-gray-800 pt-3">
                  <p className="text-xs text-gray-500 mb-2">Restore a previous backup</p>
                  <button onClick={() => jsonInputRef.current?.click()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors">
                    <Folder size={12}/> Restore from .json backup
                  </button>
                  <input ref={jsonInputRef} type="file" accept=".json" className="hidden"
                    onChange={e => handleImportJSON(e.target.files[0])}/>
                </div>
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
          fmt={fmt}
        />
      )}

      {/* ═══════════════ QUICK-ADD TRANSACTION MODAL ═══════════════ */}
      {showQuickAdd && (
        <QuickAddModal
          sym={sym}
          onSave={tx => setManualTxs(p => [...p, tx])}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* ═══════════════ GOAL EDITOR MODAL ═══════════════ */}
      {showGoalEditor && (
        <GoalEditorModal
          goal={editingGoal}
          onSave={g => setGoals(prev => g.id && prev.find(x => x.id === g.id)
            ? prev.map(x => x.id === g.id ? g : x)
            : [...prev, g]
          )}
          onDelete={id => setGoals(prev => prev.filter(g => g.id !== id))}
          onClose={() => { setShowGoalEditor(false); setEditingGoal(null); }}
        />
      )}

    </div>
  );
}
