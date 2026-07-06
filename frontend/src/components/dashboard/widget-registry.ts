import {
  TrendingUp, Users, Thermometer, Target, Clock, DollarSign,
  UserPlus, BarChart3, Timer, Activity, Phone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface WidgetDefinition {
  widgetType: string;
  defaultTitle: string;
  icon: LucideIcon;
  defaultVisible: boolean;
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  { widgetType: 'stats_row', defaultTitle: 'Statistics', icon: BarChart3, defaultVisible: true },
  { widgetType: 'quick_actions', defaultTitle: 'Quick Actions', icon: UserPlus, defaultVisible: true },
  { widgetType: 'sales_workflow', defaultTitle: 'Sales Workflow', icon: Activity, defaultVisible: true },
  { widgetType: 'crm_activity', defaultTitle: 'CRM Activity', icon: Phone, defaultVisible: true },
  { widgetType: 'revenue_stats', defaultTitle: 'Revenue & Opportunities', icon: DollarSign, defaultVisible: true },
  { widgetType: 'revenue_chart', defaultTitle: 'Revenue Trend', icon: TrendingUp, defaultVisible: true },
  { widgetType: 'pipeline_chart', defaultTitle: 'Pipeline Distribution', icon: Users, defaultVisible: true },
  { widgetType: 'lead_temperature', defaultTitle: 'Lead Temperature', icon: Thermometer, defaultVisible: true },
  { widgetType: 'qualification_stats', defaultTitle: 'Qualification Stats', icon: Target, defaultVisible: true },
  { widgetType: 'time_summary', defaultTitle: 'Time Summary', icon: Clock, defaultVisible: true },
  { widgetType: 'quick_stats', defaultTitle: 'Quick Stats', icon: DollarSign, defaultVisible: true },
  { widgetType: 'recent_leads', defaultTitle: 'Recent Leads', icon: Users, defaultVisible: true },
  { widgetType: 'my_tasks', defaultTitle: 'My Tasks', icon: Timer, defaultVisible: true },
];

export function getWidgetDef(widgetType: string): WidgetDefinition | undefined {
  return AVAILABLE_WIDGETS.find((w) => w.widgetType === widgetType);
}

export function getDefaultWidgets() {
  return AVAILABLE_WIDGETS.map((w, i) => ({
    widgetType: w.widgetType,
    title: w.defaultTitle,
    isVisible: w.defaultVisible,
    sortOrder: i,
  }));
}
