export interface Company {
  id: string;
  name: string;
  companyType: 'LIMITED' | 'JOINT_STOCK' | 'GROUP';
  taxCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStatsDto {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface DashboardChartDto {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}
