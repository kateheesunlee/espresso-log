import { create } from "zustand";
import {
  database,
  User,
  Machine,
  Bean,
  Shot,
} from "../database/UniversalDatabase";

interface AppState {
  // User
  currentUser: User | null;

  // Data
  machines: Machine[];
  beans: Bean[];
  shots: Shot[];
  allMachines: Machine[]; // Includes deleted machines for shot display
  allBeans: Bean[]; // Includes deleted beans for shot display

  // Loading states
  isLoading: boolean;

  // Actions
  initializeApp: () => Promise<void>;
  setCurrentUser: (user: User) => void;

  // Machine actions
  loadMachines: () => Promise<void>;
  loadAllMachines: () => Promise<void>;
  createMachine: (
    machine: Omit<Machine, "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateMachine: (machine: Machine) => Promise<void>;
  deleteMachine: (id: string) => Promise<void>;

  // Bean actions
  loadBeans: () => Promise<void>;
  loadAllBeans: () => Promise<void>;
  createBean: (bean: Omit<Bean, "createdAt" | "updatedAt">) => Promise<void>;
  updateBean: (bean: Bean) => Promise<void>;
  deleteBean: (id: string) => Promise<void>;

  // Shot actions
  loadShots: () => Promise<void>;
  createShot: (shot: Omit<Shot, "createdAt" | "updatedAt">) => Promise<void>;
  updateShot: (shot: Shot) => Promise<void>;
  deleteShot: (id: string) => Promise<void>;
  toggleBestShot: (id: string) => Promise<void>;

  // One More flow
  duplicateShot: (shotId: string) => Promise<string | null>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  machines: [],
  beans: [],
  shots: [],
  allMachines: [],
  allBeans: [],
  isLoading: false,

  // Initialize app
  initializeApp: async () => {
    set({ isLoading: true });
    try {
      await database.init();

      // Create default user if none exists
      const userId = "default-user";
      let user = await database.getUser(userId);

      if (!user) {
        await database.createUser({
          id: userId,
          displayName: "Espresso Enthusiast",
        });
        user = await database.getUser(userId);
      }

      if (user) {
        set({ currentUser: user });
        await get().loadMachines();
        await get().loadBeans();
        await get().loadAllMachines();
        await get().loadAllBeans();
        await get().loadShots();
      }
    } catch (error) {
      console.error("Failed to initialize app:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentUser: (user: User) => {
    set({ currentUser: user });
  },

  // Machine actions
  loadMachines: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const machines = await database.getMachines(currentUser.id);
      set({ machines });
    } catch (error) {
      console.error("Failed to load machines:", error);
    }
  },

  loadAllMachines: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const allMachines = await database.getAllMachines(currentUser.id);
      set({ allMachines });
    } catch (error) {
      console.error("Failed to load all machines:", error);
    }
  },

  createMachine: async (machineData) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await database.createMachine({
        ...machineData,
        userId: currentUser.id,
      });
      await get().loadMachines();
      await get().loadAllMachines();
    } catch (error) {
      console.error("Failed to create machine:", error);
    }
  },

  updateMachine: async (machine) => {
    try {
      await database.updateMachine(machine);
      await get().loadMachines();
      await get().loadAllMachines();
    } catch (error) {
      console.error("Failed to update machine:", error);
    }
  },

  deleteMachine: async (id) => {
    try {
      await database.deleteMachine(id);
      await get().loadMachines();
      await get().loadAllMachines();
    } catch (error) {
      console.error("Failed to delete machine:", error);
    }
  },

  // Bean actions
  loadBeans: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const beans = await database.getBeans(currentUser.id);
      set({ beans });
    } catch (error) {
      console.error("Failed to load beans:", error);
    }
  },

  loadAllBeans: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const allBeans = await database.getAllBeans(currentUser.id);
      set({ allBeans });
    } catch (error) {
      console.error("Failed to load all beans:", error);
    }
  },

  createBean: async (beanData) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await database.createBean({
        ...beanData,
        userId: currentUser.id,
      });
      await get().loadBeans();
      await get().loadAllBeans();
    } catch (error) {
      console.error("Failed to create bean:", error);
    }
  },

  updateBean: async (bean) => {
    try {
      await database.updateBean(bean);
      await get().loadBeans();
      await get().loadAllBeans();
    } catch (error) {
      console.error("Failed to update bean:", error);
    }
  },

  deleteBean: async (id) => {
    try {
      await database.deleteBean(id);
      await get().loadBeans();
      await get().loadAllBeans();
    } catch (error) {
      console.error("Failed to delete bean:", error);
    }
  },

  // Shot actions
  loadShots: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const shots = await database.getShots(currentUser.id);
      set({ shots });
    } catch (error) {
      console.error("Failed to load shots:", error);
    }
  },

  createShot: async (shotData) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await database.createShot({
        ...shotData,
        userId: currentUser.id,
      });
      await get().loadShots();
    } catch (error) {
      console.error("Failed to create shot:", error);
    }
  },

  updateShot: async (shot) => {
    try {
      await database.updateShot(shot);
      await get().loadShots();
    } catch (error) {
      console.error("Failed to update shot:", error);
    }
  },

  deleteShot: async (id) => {
    try {
      await database.deleteShot(id);
      await get().loadShots();
    } catch (error) {
      console.error("Failed to delete shot:", error);
    }
  },

  toggleBestShot: async (id) => {
    try {
      await database.toggleBestShot(id);
      await get().loadShots();
    } catch (error) {
      console.error("Failed to toggle best shot:", error);
    }
  },

  // One More flow - duplicate a shot with new timestamp
  duplicateShot: async (shotId) => {
    const { currentUser } = get();
    if (!currentUser) return null;

    try {
      const originalShot = await database.getShot(shotId);
      if (!originalShot) return null;

      const newShotId = `shot-${Date.now()}`;
      const duplicatedShot = {
        ...originalShot,
        id: newShotId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isBest: false, // New shot is not marked as best
      };

      await database.createShot(duplicatedShot);
      await get().loadShots();
      return newShotId;
    } catch (error) {
      console.error("Failed to duplicate shot:", error);
      return null;
    }
  },
}));
