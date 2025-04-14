// Dummy data for the Workstation Dashboard
export type WorkstationStatus = 'online' | 'offline' | 'maintenance' | 'warning';
export type WorkstationType = 'desktop' | 'laptop' | 'server' | 'virtual';

export interface Workstation {
  id: string;
  name: string;
  type: WorkstationType;
  status: WorkstationStatus;
  ip: string;
  lastSeen: string;
  os: string;
  user?: string;
  department?: string;
  version?: string;
}

export const workstations: Workstation[] = [
  {
    id: 'ws-001',
    name: 'Studio-WS-01',
    type: 'desktop',
    status: 'online',
    ip: '192.168.1.101',
    lastSeen: '2025-04-14T08:12:30Z',
    os: 'Windows 11 Pro',
    user: 'jsmith',
    department: 'Production',
    version: '1.3.5'
  },
  {
    id: 'ws-002',
    name: 'Studio-WS-02',
    type: 'desktop',
    status: 'warning',
    ip: '192.168.1.102',
    lastSeen: '2025-04-14T07:45:12Z',
    os: 'Windows 11 Pro',
    user: 'alee',
    department: 'Modeling',
    version: '1.3.5'
  },
  {
    id: 'ws-003',
    name: 'Studio-WS-03',
    type: 'laptop',
    status: 'offline',
    ip: '192.168.1.103',
    lastSeen: '2025-04-13T16:30:00Z',
    os: 'macOS 14.4',
    user: 'mwilliams',
    department: 'Animation',
    version: '1.3.4'
  },
  {
    id: 'ws-004',
    name: 'Render-01',
    type: 'server',
    status: 'online',
    ip: '192.168.1.50',
    lastSeen: '2025-04-14T08:15:22Z',
    os: 'Ubuntu 24.04 LTS',
    department: 'Rendering',
    version: '1.3.5'
  },
  {
    id: 'ws-005',
    name: 'Cloud-WS-01',
    type: 'virtual',
    status: 'maintenance',
    ip: '10.0.5.12',
    lastSeen: '2025-04-14T06:10:45Z',
    os: 'Windows 11 Pro',
    department: 'Remote',
    version: '1.3.5'
  }
];