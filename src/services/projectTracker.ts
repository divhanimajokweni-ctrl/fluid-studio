/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrackedProject {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  key: string;
  stage: 'Capture & Edit' | 'Tuning & Mix' | 'Mastering Suite' | 'Delivery & QC';
  progress: number;
  tracksCount: number;
  duration: string;
  sampleRate: number;
  bitDepth: number;
  lastModified: number; // epoch ms
  createdAt: number;
  notes: string;
  tags: string[];
}

export interface ModificationLog {
  id: string;
  projectId: string;
  action: string;
  timestamp: number;
  user: string;
}

const STORAGE_PROJECTS_KEY = 'fluid_studio_projects_v2';
const STORAGE_LOGS_KEY = 'fluid_studio_mod_logs_v2';
const STORAGE_ACTIVE_PROJECT_KEY = 'fluid_studio_active_id_v2';

const DEFAULT_PROJECTS: TrackedProject[] = [
  {
    id: 'proj-horizonte',
    title: 'Horizonte',
    artist: 'Mino Enchilotto',
    genre: 'Afro-Trap / Soul R&B',
    bpm: 124,
    key: 'F# min',
    stage: 'Tuning & Mix',
    progress: 64,
    tracksCount: 8,
    duration: '03:42',
    sampleRate: 48000,
    bitDepth: 24,
    lastModified: Date.now() - 12 * 60 * 1000, // 12 min ago
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    notes: 'Master Stem v4 · ITU-R BS.1770-4 compliant · Dynamic punch tuned for club translation',
    tags: ['Album', 'Active', 'Stems Ready', 'ProofBridge Verified'],
  },
  {
    id: 'proj-semsinal',
    title: 'Sem Sinal (No Signal)',
    artist: 'Mino Enchilotto',
    genre: 'Midnight Trap',
    bpm: 118,
    key: 'C# min',
    stage: 'Capture & Edit',
    progress: 100,
    tracksCount: 6,
    duration: '04:08',
    sampleRate: 48000,
    bitDepth: 24,
    lastModified: Date.now() - 2 * 3600 * 1000, // 2h ago
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    notes: 'Lead comp finalized. Ready for vocal harmonic alignment.',
    tags: ['Completed Edit', 'Single'],
  },
  {
    id: 'proj-chuva',
    title: 'Depois da Chuva (After Rain)',
    artist: 'Mino Enchilotto',
    genre: 'Chill R&B / Neo-Soul',
    bpm: 130,
    key: 'A maj',
    stage: 'Capture & Edit',
    progress: 35,
    tracksCount: 4,
    duration: '03:16',
    sampleRate: 48000,
    bitDepth: 24,
    lastModified: Date.now() - 26 * 3600 * 1000, // 1 day ago
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    notes: 'Demo acoustic stems with rhodes and swung snare.',
    tags: ['Demo', 'Draft'],
  },
  {
    id: 'proj-vent',
    title: 'Mino Enchilotto - Vent',
    artist: 'Mino Enchilotto',
    genre: 'Conscious Hip-Hop',
    bpm: 96,
    key: 'D min',
    stage: 'Mastering Suite',
    progress: 88,
    tracksCount: 12,
    duration: '03:55',
    sampleRate: 48000,
    bitDepth: 24,
    lastModified: Date.now() - 4 * 60 * 1000, // 4 min ago
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    notes: 'Hard-hitting kicks, 808 sidechain, raw vocal confession takes.',
    tags: ['Mastering', 'Single', 'ProofBridge Gate 04'],
  },
];

class ProjectTrackerService {
  private projects: TrackedProject[] = [];
  private logs: ModificationLog[] = [];
  private activeProjectId: string = 'proj-horizonte';
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProj = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (storedProj) {
        this.projects = JSON.parse(storedProj);
      } else {
        this.projects = DEFAULT_PROJECTS;
        this.saveToStorage();
      }

      const storedLogs = localStorage.getItem(STORAGE_LOGS_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }

      const storedActive = localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY);
      if (storedActive && this.projects.some((p) => p.id === storedActive)) {
        this.activeProjectId = storedActive;
      } else {
        this.activeProjectId = this.projects[0]?.id || 'proj-horizonte';
      }
    } catch {
      this.projects = DEFAULT_PROJECTS;
      this.activeProjectId = 'proj-horizonte';
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(this.logs.slice(-50)));
      localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, this.activeProjectId);
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getAllProjects(): TrackedProject[] {
    return [...this.projects];
  }

  public getActiveProject(): TrackedProject {
    const found = this.projects.find((p) => p.id === this.activeProjectId);
    return found || this.projects[0];
  }

  public setActiveProject(id: string) {
    if (this.projects.some((p) => p.id === id)) {
      this.activeProjectId = id;
      this.touchProject(id, 'Switched active workspace session');
      this.saveToStorage();
    }
  }

  public addProject(project: Omit<TrackedProject, 'id' | 'lastModified' | 'createdAt'>): TrackedProject {
    const newProj: TrackedProject = {
      ...project,
      id: `proj-${Date.now()}`,
      lastModified: Date.now(),
      createdAt: Date.now(),
    };

    this.projects = [newProj, ...this.projects];
    this.activeProjectId = newProj.id;
    this.logModification(newProj.id, `Created project "${newProj.title}"`);
    this.saveToStorage();
    return newProj;
  }

  public touchProject(id: string, actionDescription: string) {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = {
        ...this.projects[idx],
        lastModified: Date.now(),
      };
      this.logModification(id, actionDescription);
      this.saveToStorage();
    }
  }

  public updateProjectProgress(id: string, progress: number, stage?: TrackedProject['stage']) {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = {
        ...this.projects[idx],
        progress,
        stage: stage || this.projects[idx].stage,
        lastModified: Date.now(),
      };
      this.logModification(id, `Updated progress to ${progress}% (${stage || this.projects[idx].stage})`);
      this.saveToStorage();
    }
  }

  private logModification(projectId: string, action: string) {
    const entry: ModificationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      action,
      timestamp: Date.now(),
      user: 'Mino Enchilotto',
    };
    this.logs.unshift(entry);
  }

  public getModificationLogs(): ModificationLog[] {
    return [...this.logs];
  }

  /**
   * Formats an epoch timestamp into a human-readable relative time string
   * e.g. "Just now", "2m ago", "45m ago", "3h ago", "2 days ago"
   */
  public formatRelativeTime(timestamp: number): string {
    const deltaMs = Date.now() - timestamp;
    const deltaSecs = Math.floor(deltaMs / 1000);
    const deltaMins = Math.floor(deltaSecs / 60);
    const deltaHours = Math.floor(deltaMins / 60);
    const deltaDays = Math.floor(deltaHours / 24);

    if (deltaSecs < 45) return 'Just now';
    if (deltaMins < 60) return `${deltaMins}m ago`;
    if (deltaHours < 24) return `${deltaHours}h ago`;
    if (deltaDays === 1) return 'Yesterday';
    if (deltaDays < 7) return `${deltaDays}d ago`;

    const d = new Date(timestamp);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /**
   * Returns exact date-time stamp in English studio standard
   */
  public formatExactDateTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export const projectTracker = new ProjectTrackerService();
