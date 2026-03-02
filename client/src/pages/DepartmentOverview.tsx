/**
 * Department Overview Page
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Left sidebar navigation with department list
 * - Main content area showing department cards
 * - Each card displays total tokens, input/output breakdown
 * - Click to navigate to department detail view
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { getMockData, formatTokens, calculatePercentage } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart3, Users } from 'lucide-react';

export default function DepartmentOverview() {
  const [location, setLocation] = useLocation();
  const data = getMockData();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Token 使用量儀表板</h1>
          </div>
          <p className="text-muted-foreground">公司內部 AI Token 消耗統計與分析</p>
        </div>
      </header>

      <main className="container py-8">
        {/* Company-wide Statistics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">公司整體統計</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Tokens Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">總 Token 使用量</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(data.totalTokens)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Input Tokens Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">輸入 Token</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(data.totalInputTokens)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {calculatePercentage(data.totalInputTokens, data.totalTokens)}% 佔比
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">↓</span>
                </div>
              </div>
            </Card>

            {/* Output Tokens Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">輸出 Token</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(data.totalOutputTokens)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {calculatePercentage(data.totalOutputTokens, data.totalTokens)}% 佔比
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">↑</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Department Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">部門數量</h3>
              </div>
              <p className="text-4xl font-bold text-primary">{data.departmentCount}</p>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">員工總數</h3>
              </div>
              <p className="text-4xl font-bold text-primary">{data.employeeCount}</p>
            </Card>
          </div>
        </div>

        {/* Departments Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">各部門詳情</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.departments.map((department) => (
              <Card 
                key={department.id}
                className="p-6 border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setLocation(`/department/${department.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{department.name}</h3>
                    <p className="text-sm text-muted-foreground">{department.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="space-y-3 mb-4 pt-4 border-t border-border">
                  {/* Total Tokens */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">總 Token</span>
                    <span className="font-semibold text-foreground">{formatTokens(department.totalTokens)}</span>
                  </div>

                  {/* Input/Output Breakdown */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">輸入 / 輸出</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatTokens(department.totalInputTokens)} / {formatTokens(department.totalOutputTokens)}
                    </span>
                  </div>

                  {/* Employee Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">員工數</span>
                    <span className="font-semibold text-foreground">{department.employeeCount}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Token 佔比</span>
                      <span className="text-xs font-semibold text-primary">
                        {calculatePercentage(department.totalTokens, data.totalTokens)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(department.totalTokens, data.totalTokens)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 group-hover:border-primary group-hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/department/${department.id}`);
                  }}
                >
                  查看詳情
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
