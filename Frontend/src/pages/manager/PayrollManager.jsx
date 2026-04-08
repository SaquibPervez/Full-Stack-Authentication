import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../../apis/axios";
import {
  BadgeDollarSign,
  Activity,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Search,
  Users,
  TrendingUp,
  Wallet,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Download,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PayrollManager = () => {
  const queryClient = useQueryClient();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [showProcessAll, setShowProcessAll] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teamPayroll", selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await api.get(
        `/payroll/team?month=${selectedMonth}&year=${selectedYear}`,
      );
      return res.data;
    },
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const processMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/payroll/process", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Salary processed for employee`);
      queryClient.invalidateQueries(["teamPayroll"]);
    },
    onError: () => toast.error("Processing failed"),
  });

  const employees = data?.employees || [];

  // Search filter
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        e.username?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q),
    );
  }, [employees, searchQuery]);

  const getEmployeeValues = (emp) => {
    const o = overrides[emp.user_id];
    const basic =
      o?.basic !== undefined
        ? parseFloat(o.basic)
        : parseFloat(emp.basic_salary) || 0;
    const allowances =
      o?.allowances !== undefined
        ? parseFloat(o.allowances)
        : parseFloat(emp.allowances) || 0;
    const deductions =
      o?.deductions !== undefined
        ? parseFloat(o.deductions)
        : parseFloat(emp.deductions) || 0;
    const net = basic + allowances - deductions;
    return { basic, allowances, deductions, net };
  };

  // Editable mode for already paid employees: { [user_id]: boolean }
  const [editModes, setEditModes] = useState({});

  const toggleEditMode = (userId, e) => {
    if (e) e.stopPropagation();
    setEditModes((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const updateOverride = (userId, field, value) => {
    setOverrides((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handleProcess = (emp) => {
    const vals = getEmployeeValues(emp);
    if (vals.basic <= 0) {
      toast.error("Basic salary must be greater than 0");
      return;
    }
    processMutation.mutate({
      user_id: emp.user_id,
      month: selectedMonth,
      year: selectedYear,
      basic_salary: vals.basic,
      allowances: vals.allowances,
      deductions: vals.deductions,
    });

    // Turn off edit mode if it was on
    if (editModes[emp.user_id]) {
      setEditModes((prev) => ({ ...prev, [emp.user_id]: false }));
    }
  };

  const handleProcessAll = () => {
    const pendingEmps = employees.filter((e) => e.payroll_status !== "paid");
    const validEmps = pendingEmps.filter((e) => {
      const vals = getEmployeeValues(e);
      return vals.basic > 0;
    });

    if (validEmps.length === 0) {
      toast.error("No valid pending salaries to process");
      return;
    }

    validEmps.forEach((emp) => {
      const vals = getEmployeeValues(emp);
      processMutation.mutate({
        user_id: emp.user_id,
        month: selectedMonth,
        year: selectedYear,
        basic_salary: vals.basic,
        allowances: vals.allowances,
        deductions: vals.deductions,
      });
    });

    setShowProcessAll(false);
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear((y) => y - 1);
      } else {
        setSelectedMonth((m) => m - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear((y) => y + 1);
      } else {
        setSelectedMonth((m) => m + 1);
      }
    }
    setOverrides({});
    setExpandedEmpId(null);
  };

  // ─── Summary Stats ───
  const summary = useMemo(() => {
    const totalProcessed = employees.filter(
      (e) => e.payroll_status === "paid",
    ).length;
    const totalPending = employees.length - totalProcessed;
    const totalPayout = employees.reduce((sum, emp) => {
      return (
        sum +
        (emp.payroll_status === "paid" ? parseFloat(emp.net_payable || 0) : 0)
      );
    }, 0);
    const totalProjected = employees.reduce((sum, emp) => {
      const vals = getEmployeeValues(emp);
      return sum + vals.net;
    }, 0);
    const avgSalary =
      employees.length > 0 ? Math.round(totalProjected / employees.length) : 0;

    return {
      totalProcessed,
      totalPending,
      totalPayout,
      totalProjected,
      avgSalary,
    };
  }, [employees, overrides]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "—";
    return `Rs ${Number(amount).toLocaleString("en-IN")}`;
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white p-8 rounded-xl border border-rose-100 text-center shadow-sm">
          <p className="text-rose-500 text-sm font-semibold mb-4">
            Failed to load payroll data
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-semibold active:scale-95 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* ─── Header ─── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BadgeDollarSign size={14} className="text-indigo-600" />
            <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
              Finance Module
            </p>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Payroll & Salaries
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2.5 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 tabular-nums min-w-[120px] text-center">
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2.5 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm active:scale-95"
          >
            <Activity size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* ─── Summary KPIs ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
              <Users size={18} className="text-slate-600" />
            </div>
          </div>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">
            Total Employees
          </p>
          <h3 className="text-xl font-semibold text-slate-900 tabular-nums">
            {employees.length}
          </h3>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">
            Processed
          </p>
          <h3 className="text-xl font-semibold text-emerald-600 tabular-nums">
            {summary.totalProcessed}
          </h3>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
              <Clock size={18} className="text-amber-600" />
            </div>
          </div>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">
            Pending
          </p>
          <h3 className="text-xl font-semibold text-amber-600 tabular-nums">
            {summary.totalPending}
          </h3>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Wallet size={18} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">
            Total Disbursed
          </p>
          <h3 className="text-lg font-semibold text-slate-900 tabular-nums">
            {formatCurrency(summary.totalPayout)}
          </h3>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">
            Projected Cost
          </p>
          <h3 className="text-lg font-semibold text-slate-900 tabular-nums">
            {formatCurrency(summary.totalProjected)}
          </h3>
        </div>
      </motion.div>

      {/* ─── Processing Progress Bar ─── */}
      {employees.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700">
              Processing Progress
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
              {summary.totalProcessed}/{employees.length} Complete
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${employees.length > 0 ? (summary.totalProcessed / employees.length) * 100 : 0}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-2.5 rounded-full ${
                summary.totalProcessed === employees.length
                  ? "bg-emerald-500"
                  : "bg-indigo-500"
              }`}
            />
          </div>
        </motion.div>
      )}

      {/* ─── Toolbar: Search + Process All ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, or email..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Avg. Salary:{" "}
            <span className="text-slate-700">
              {formatCurrency(summary.avgSalary)}
            </span>
          </span>

          {summary.totalPending > 0 && (
            <button
              onClick={() => setShowProcessAll(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-[11px] uppercase tracking-wide shadow-indigo-200 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Send size={12} /> Process All ({summary.totalPending})
            </button>
          )}
        </div>
      </div>

      {/* ─── Payroll Table ─── */}
      <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
          <div className="col-span-3">Employee</div>
          <div className="col-span-1 text-center">Attendance</div>
          <div className="col-span-2 text-center">Basic (Rs)</div>
          <div className="col-span-2 text-center">Allowances (Rs)</div>
          <div className="col-span-1 text-center">Deductions</div>
          <div className="col-span-1 text-center">Net Payable</div>
          <div className="col-span-2 text-center">Action</div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Activity size={20} className="text-slate-300 animate-spin mb-3" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Loading payroll data
            </p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-16 text-center">
            <BadgeDollarSign
              size={28}
              className="text-slate-200 mx-auto mb-3"
            />
            <p className="text-sm font-semibold text-slate-900 mb-1">
              No Employees Found
            </p>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? "Try adjusting your search query"
                : "No employees in system"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/60">
            {filteredEmployees.map((emp, idx) => {
              const vals = getEmployeeValues(emp);
              const isPaid = emp.payroll_status === "paid";
              const isExpanded = expandedEmpId === emp.user_id;
              const daysPresent = parseInt(emp.days_present || 0);
              const daysAbsent = parseInt(emp.days_absent || 0);
              const totalDays = daysPresent + daysAbsent;

              return (
                <div key={emp.user_id}>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/40 transition-colors cursor-pointer ${
                      isPaid ? "bg-emerald-50/20" : ""
                    }`}
                    onClick={() =>
                      setExpandedEmpId(isExpanded ? null : emp.user_id)
                    }
                  >
                    {/* Employee Info */}
                    <div className="col-span-12 lg:col-span-3 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold uppercase shadow-sm flex-shrink-0 border ${
                          isPaid
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-100 border-slate-200/60 text-slate-600"
                        }`}
                      >
                        {emp.username?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {emp.username}
                          </p>
                          {isPaid && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[8px] font-bold text-emerald-600 uppercase tracking-wider">
                              <CheckCircle2 size={8} /> Paid
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {emp.designation || emp.email}
                        </p>
                      </div>
                      <div className="lg:hidden">
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Attendance */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                      <div className="text-center">
                        <span className="text-xs font-bold text-emerald-600 tabular-nums">
                          {daysPresent}
                        </span>
                        <span className="text-[9px] text-slate-300 mx-0.5">
                          /
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {totalDays || "—"}
                        </span>
                        {daysAbsent > 3 && (
                          <div className="mt-0.5">
                            <AlertTriangle
                              size={10}
                              className="text-amber-500 mx-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Salary */}
                    <div
                      className="hidden lg:block col-span-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        value={
                          overrides[emp.user_id]?.basic ??
                          emp.basic_salary ??
                          ""
                        }
                        onChange={(e) =>
                          updateOverride(emp.user_id, "basic", e.target.value)
                        }
                        disabled={isPaid && !editModes[emp.user_id]}
                        placeholder="0"
                        className="w-full text-center bg-slate-50/50 border border-slate-200 rounded-lg py-2 text-xs font-semibold text-slate-800 tabular-nums outline-none focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                    </div>

                    {/* Allowances */}
                    <div
                      className="hidden lg:block col-span-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        value={
                          overrides[emp.user_id]?.allowances ??
                          emp.allowances ??
                          ""
                        }
                        onChange={(e) =>
                          updateOverride(
                            emp.user_id,
                            "allowances",
                            e.target.value,
                          )
                        }
                        disabled={isPaid && !editModes[emp.user_id]}
                        placeholder="0"
                        className="w-full text-center bg-slate-50/50 border border-slate-200 rounded-lg py-2 text-xs font-semibold text-emerald-700 tabular-nums outline-none focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                    </div>

                    {/* Deductions */}
                    <div
                      className="hidden lg:block col-span-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        value={
                          overrides[emp.user_id]?.deductions ??
                          emp.deductions ??
                          ""
                        }
                        onChange={(e) =>
                          updateOverride(
                            emp.user_id,
                            "deductions",
                            e.target.value,
                          )
                        }
                        disabled={isPaid && !editModes[emp.user_id]}
                        placeholder="0"
                        className="w-full text-center bg-slate-50/50 border border-slate-200 rounded-lg py-2 text-xs font-semibold text-rose-600 tabular-nums outline-none focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                    </div>

                    {/* Net Payable */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                      <span
                        className={`text-sm font-bold tabular-nums ${vals.net > 0 ? "text-slate-900" : "text-slate-300"}`}
                      >
                        {vals.net > 0 ? formatCurrency(vals.net) : "—"}
                      </span>
                    </div>

                    {/* Action */}
                    <div
                      className="hidden lg:flex col-span-2 justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isPaid && !editModes[emp.user_id] ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                            <CheckCircle2 size={10} /> Processed
                          </span>
                          <button
                            onClick={(e) => toggleEditMode(emp.user_id, e)}
                            className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg active:scale-95 transition-all shadow-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleProcess(emp)}
                          disabled={
                            processMutation.isPending || vals.basic <= 0
                          }
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed ${editModes[emp.user_id] ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                          {processMutation.isPending ? (
                            <Activity size={10} className="animate-spin" />
                          ) : (
                            <Send size={10} />
                          )}
                          {editModes[emp.user_id] ? "Update Pay" : "Process"}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>

                  {/* ─── Expanded Detail Card ─── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2 bg-slate-50/30 border-t border-slate-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Basic Salary
                              </p>
                              <p className="text-sm font-bold text-slate-900 tabular-nums">
                                {formatCurrency(vals.basic)}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                                + Allowances
                              </p>
                              <p className="text-sm font-bold text-emerald-700 tabular-nums">
                                {formatCurrency(vals.allowances)}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-rose-100">
                              <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1">
                                − Deductions
                              </p>
                              <p className="text-sm font-bold text-rose-600 tabular-nums">
                                {formatCurrency(vals.deductions)}
                              </p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
                                Net Payable
                              </p>
                              <p className="text-lg font-bold text-indigo-700 tabular-nums">
                                {formatCurrency(vals.net)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Days Present
                              </p>
                              <p className="text-sm font-bold text-emerald-600 tabular-nums">
                                {daysPresent}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Days Absent
                              </p>
                              <p className="text-sm font-bold text-rose-500 tabular-nums">
                                {daysAbsent}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Email
                              </p>
                              <p className="text-xs font-medium text-slate-600 truncate">
                                {emp.email}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Status
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                }`}
                              >
                                {isPaid ? (
                                  <>
                                    <CheckCircle2 size={9} /> Paid
                                  </>
                                ) : (
                                  <>
                                    <Clock size={9} /> Pending
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Mobile inputs */}
                          <div className="lg:hidden space-y-3 mb-4">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                                Basic Salary (Rs)
                              </label>
                              <input
                                type="number"
                                value={
                                  overrides[emp.user_id]?.basic ??
                                  emp.basic_salary ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateOverride(
                                    emp.user_id,
                                    "basic",
                                    e.target.value,
                                  )
                                }
                                disabled={isPaid && !editModes[emp.user_id]}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-semibold text-slate-800 tabular-nums outline-none focus:border-indigo-500/30 disabled:opacity-50"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1 block">
                                Allowances (Rs)
                              </label>
                              <input
                                type="number"
                                value={
                                  overrides[emp.user_id]?.allowances ??
                                  emp.allowances ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateOverride(
                                    emp.user_id,
                                    "allowances",
                                    e.target.value,
                                  )
                                }
                                disabled={isPaid && !editModes[emp.user_id]}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-semibold text-emerald-700 tabular-nums outline-none focus:border-indigo-500/30 disabled:opacity-50"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1 block">
                                Deductions (Rs)
                              </label>
                              <input
                                type="number"
                                value={
                                  overrides[emp.user_id]?.deductions ??
                                  emp.deductions ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateOverride(
                                    emp.user_id,
                                    "deductions",
                                    e.target.value,
                                  )
                                }
                                disabled={isPaid && !editModes[emp.user_id]}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-semibold text-rose-600 tabular-nums outline-none focus:border-indigo-500/30 disabled:opacity-50"
                              />
                            </div>
                            {isPaid && !editModes[emp.user_id] ? (
                              <button
                                onClick={(e) => toggleEditMode(emp.user_id, e)}
                                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"></path>
                                </svg>{" "}
                                Edit Processed Salary
                              </button>
                            ) : (
                              <button
                                onClick={() => handleProcess(emp)}
                                disabled={
                                  processMutation.isPending || vals.basic <= 0
                                }
                                className={`w-full py-3 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${editModes[emp.user_id] ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
                              >
                                {processMutation.isPending ? (
                                  <Activity
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Send size={12} />
                                )}
                                {editModes[emp.user_id]
                                  ? "Update Pay"
                                  : "Process Salary"}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Process All Confirmation Modal ─── */}
      <AnimatePresence>
        {showProcessAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowProcessAll(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
                <Send size={22} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Process All Pending Salaries?
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                This will process salaries for{" "}
                <strong className="text-slate-800">
                  {summary.totalPending} employees
                </strong>{" "}
                for {MONTHS[selectedMonth - 1]} {selectedYear}. Total projected
                payout:{" "}
                <strong className="text-indigo-600">
                  {formatCurrency(summary.totalProjected)}
                </strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProcessAll(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessAll}
                  disabled={processMutation.isPending}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processMutation.isPending ? (
                    <Activity size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Confirm & Process
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollManager;
