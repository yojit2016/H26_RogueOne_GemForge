import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"
import { useTheme } from "@/lib/theme"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, BarChart3, PieChart as PieChartIcon, GitCompare } from "lucide-react"
import type { ExitCapsule } from "@/types/gemforge"

interface RiskDistributionChartProps {
  capsule: ExitCapsule
}

export function RiskDistributionChart({ capsule }: RiskDistributionChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Derive counts from actual data
  let conflicts = 0
  let directRefs = 0
  let uncertainties = 0

  for (const risk of capsule.risks) {
    if (risk.kind === "constraint_conflict") conflicts++
    else if (risk.kind === "direct_reference") directRefs++
    else if (risk.kind === "constraint_uncertainty") uncertainties++
  }

  const riskyPackages = new Set(capsule.risks.map((r) => r.package.toLowerCase()))
  const cleanPackages = capsule.dependencies.filter(
    (d) => !riskyPackages.has(d.package.toLowerCase()),
  ).length

  const data = [
    { name: "Conflicts", count: conflicts, fill: isDark ? "#FDA4AF" : "#9F1239" },
    { name: "Direct Refs", count: directRefs, fill: isDark ? "#FCD34D" : "#92400E" },
    { name: "Uncertainties", count: uncertainties, fill: isDark ? "#BAE6FD" : "#1E3A8A" },
    { name: "Clean", count: cleanPackages, fill: isDark ? "#6EE7B7" : "#065F46" },
  ].filter((d) => d.count > 0)

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          <PieChartIcon className="h-4 w-4 text-[var(--accent-teal)]" />
          Dependency Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke={isDark ? "#8FA6DF" : "#567C8D"}
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke={isDark ? "#8FA6DF" : "#567C8D"}
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#051650" : "#FFFFFF",
                  borderColor: isDark ? "#0A2472" : "#D2DFEB",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: isDark ? "#F0F4FF" : "#2F4156",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface PackageUsageChartProps {
  capsule: ExitCapsule
}

export function PackageUsageChart({ capsule }: PackageUsageChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Count actual AST import locations per package
  const usageCounts = new Map<string, number>()
  for (const u of capsule.usages) {
    const pkg = u.package
    usageCounts.set(pkg, (usageCounts.get(pkg) || 0) + 1)
  }

  const data = Array.from(usageCounts.entries())
    .map(([pkg, count]) => ({ package: pkg, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  if (data.length === 0) {
    return null
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          <BarChart3 className="h-4 w-4 text-[var(--accent-teal)]" />
          Top AST Package Usages (Real References)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <XAxis
                type="number"
                stroke={isDark ? "#8FA6DF" : "#567C8D"}
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="package"
                type="category"
                stroke={isDark ? "#8FA6DF" : "#567C8D"}
                fontSize={11}
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#051650" : "#FFFFFF",
                  borderColor: isDark ? "#0A2472" : "#D2DFEB",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: isDark ? "#F0F4FF" : "#2F4156",
                }}
              />
              <Bar
                dataKey="count"
                fill={isDark ? "#38BDF8" : "#567C8D"}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface VerificationOutcomesChartProps {
  capsule: ExitCapsule
}

export function VerificationOutcomesChart({ capsule }: VerificationOutcomesChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const ver = capsule.verification
  if (!ver.baseline || !ver.candidate) return null

  const baselinePassedTests = Object.values(ver.baseline.test_outcomes).filter(
    (s) => s === "passed",
  ).length
  const baselineFailedTests = Object.values(ver.baseline.test_outcomes).filter(
    (s) => s === "failed",
  ).length
  const baselinePassedProbes = Object.values(ver.baseline.probe_outcomes).filter(
    (s) => s === "passed",
  ).length

  const candidatePassedTests = Object.values(ver.candidate.test_outcomes).filter(
    (s) => s === "passed",
  ).length
  const candidateFailedTests = Object.values(ver.candidate.test_outcomes).filter(
    (s) => s === "failed",
  ).length
  const candidatePassedProbes = Object.values(ver.candidate.probe_outcomes).filter(
    (s) => s === "passed",
  ).length
  const candidateFailedProbes = Object.values(ver.candidate.probe_outcomes).filter(
    (s) => s === "failed",
  ).length

  const data = [
    {
      category: "Pytest Passed",
      Baseline: baselinePassedTests,
      Candidate: candidatePassedTests,
    },
    {
      category: "Pytest Failed",
      Baseline: baselineFailedTests,
      Candidate: candidateFailedTests,
    },
    {
      category: "Probes Passed",
      Baseline: baselinePassedProbes,
      Candidate: candidatePassedProbes,
    },
    {
      category: "Probes Failed",
      Baseline: 0,
      Candidate: candidateFailedProbes,
    },
  ]

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          <GitCompare className="h-4 w-4 text-[var(--accent-teal)]" />
          Baseline vs Candidate Test & Probe Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="category"
                stroke={isDark ? "#8FA6DF" : "#567C8D"}
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke={isDark ? "#8FA6DF" : "#567C8D"}
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#051650" : "#FFFFFF",
                  borderColor: isDark ? "#0A2472" : "#D2DFEB",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: isDark ? "#F0F4FF" : "#2F4156",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
              />
              <Bar
                dataKey="Baseline"
                fill={isDark ? "#8FA6DF" : "#567C8D"}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Candidate"
                fill={isDark ? "#FDA4AF" : "#9F1239"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
