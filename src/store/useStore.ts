import { create } from "zustand";
import { database } from "../database/UniversalDatabase";
import {
  User,
  Machine,
  Bean,
  Shot,
  ShotFormData,
  shotFormDataToShot,
} from "@types";
import { classifyExtraction } from "../coaching/extraction";
import { CoachingManager } from "../coaching/service/CoachingManager";
import {
  EXTRACTION_CONFIG,
  generateInputHash,
  shouldRegenerateSnapshot,
  getLatestVersion,
} from "../coaching/versions";

interface AppState {
  // User
  currentUser: User | null;

  // Data
  machines: Machine[];
  beans: Bean[];
  shots: Shot[];
  allMachines: Machine[]; // Includes deleted machines for shot display
  allBeans: Bean[]; // Includes deleted beans for shot display

  // Coaching
  coachingManager: CoachingManager;

  // Loading states
  isLoading: boolean;

  // Actions
  initializeApp: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  configureCoaching: (
    mode: "rule" | "ai" | "hybrid",
    aiApiKey?: string
  ) => void;

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
  toggleFavoriteBean: (id: string) => Promise<void>;

  // Shot actions
  loadShots: () => Promise<void>;
  createShot: (shot: ShotFormData) => Promise<void>;
  updateShot: (shot: Shot) => Promise<void>;
  deleteShot: (id: string) => Promise<void>;
  toggleFavoriteShot: (id: string) => Promise<void>;
  refreshCoaching: (shotId: string, forceRefresh?: boolean) => Promise<void>;
  checkAndUpdateOutdatedSnapshots: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  machines: [],
  beans: [],
  shots: [],
  allMachines: [],
  allBeans: [],
  coachingManager: new CoachingManager({
    mode: "rule",
    enableCaching: false, // Not needed for current workflow (coaching stored in shot snapshots)
    maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours (for future use)
  }),
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

  configureCoaching: (mode: "rule" | "ai" | "hybrid", aiApiKey?: string) => {
    const { coachingManager } = get();
    const newManager = new CoachingManager({
      mode,
      aiApiKey,
      enableCaching: false, // Disabled for current workflow, can be enabled for future features
      maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    set({ coachingManager: newManager });
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

  toggleFavoriteBean: async (id) => {
    try {
      await database.toggleFavoriteBean(id);
      await get().loadBeans();
      await get().loadAllBeans();
    } catch (error) {
      console.error("Failed to toggle favorite bean:", error);
      throw error;
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

  createShot: async (shotFormData) => {
    const { currentUser, coachingManager } = get();
    if (!currentUser) return;

    // Convert form data to shot data
    const shotData = shotFormDataToShot(
      shotFormData,
      undefined,
      currentUser.id
    );

    try {
      // Get bean information
      const bean = shotFormData.beanId
        ? await database.getBean(shotFormData.beanId)
        : undefined;

      if (!bean?.roastLevel) {
        // Create shot without coaching if no bean/roast level
        await database.createShot({
          ...shotData,
          extractionSnapshot: undefined,
          coachingSnapshot: undefined,
        });
        await get().loadShots();
        return;
      }

      // Generate extraction snapshot
      const extractionSnapshot = classifyExtraction(
        shotFormData,
        bean.roastLevel
      );

      // Generate coaching snapshot using CoachingManager
      const coachingSnapshot = await coachingManager.getSuggestions(
        shotFormData,
        bean.roastLevel,
        {
          useCache: false, // Not needed since results are stored in shot snapshot
          forceRefresh: false,
        }
      );

      // Generate input hash for extraction snapshot
      const extractionInputHash = generateInputHash({
        // extraction parameters
        grindSetting: parseFloat(shotFormData.grindSetting),
        dose_g: parseFloat(shotFormData.dose_g),
        yield_g: parseFloat(shotFormData.yield_g),
        ratio: parseFloat(shotFormData.ratio),
        // advanced parameters
        shotTime_s:
          shotFormData.shotTime_s && shotFormData.shotTime_s.trim() !== ""
            ? parseFloat(shotFormData.shotTime_s)
            : undefined,
        waterTemp_C: shotFormData.waterTemp_C
          ? parseFloat(shotFormData.waterTemp_C)
          : undefined,
        // roast and taste profile
        roast: bean.roastLevel,
        balance: {
          acidity: shotFormData.acidity,
          bitterness: shotFormData.bitterness,
          body: shotFormData.body,
          aftertaste: shotFormData.aftertaste,
        },
        version: EXTRACTION_CONFIG.version,
      });

      // Create shot with both snapshots
      await database.createShot({
        ...shotData,
        extractionSnapshot: {
          version: EXTRACTION_CONFIG.version,
          score: extractionSnapshot.score,
          label: extractionSnapshot.label,
          confidence: extractionSnapshot.confidence,
          reason: extractionSnapshot.reason,
          basedOn: {
            // extraction parameters
            grindSetting: parseFloat(shotFormData.grindSetting),
            dose_g: parseFloat(shotFormData.dose_g),
            yield_g: parseFloat(shotFormData.yield_g),
            ratio: parseFloat(shotFormData.ratio),
            // advanced parameters
            shotTime_s:
              shotFormData.shotTime_s && shotFormData.shotTime_s.trim() !== ""
                ? parseFloat(shotFormData.shotTime_s)
                : undefined,
            waterTemp_C: shotFormData.waterTemp_C
              ? parseFloat(shotFormData.waterTemp_C)
              : undefined,
            // roast and taste profile
            roast: bean.roastLevel,
            balance: {
              acidity: shotFormData.acidity,
              bitterness: shotFormData.bitterness,
              body: shotFormData.body,
              aftertaste: shotFormData.aftertaste,
            },
          },
          inputHash: extractionInputHash,
          computedAt: new Date().toISOString(),
        },
        coachingSnapshot,
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

  toggleFavoriteShot: async (id) => {
    try {
      await database.toggleFavoriteShot(id);
      await get().loadShots();
    } catch (error) {
      console.error("Failed to toggle favorite shot:", error);
      throw error;
    }
  },

  refreshCoaching: async (shotId, forceRefresh = false) => {
    const { coachingManager, allBeans } = get();
    try {
      const shot = await database.getShot(shotId);
      if (!shot) {
        console.warn(`Shot with id ${shotId} not found`);
        return;
      }

      const bean = allBeans.find((b) => b.id === shot.beanId);
      if (!bean?.roastLevel) {
        console.warn(`Bean with roast level not found for shot ${shotId}`);
        return;
      }

      // Convert shot back to form data for coaching
      const shotFormData = {
        beanId: shot.beanId,
        machineId: shot.machineId,
        dose_g: shot.dose_g.toString(),
        yield_g: shot.yield_g.toString(),
        shotTime_s: shot.shotTime_s?.toString() || "",
        ratio: shot.ratio.toString(),
        grindSetting: shot.grindSetting.toString(),
        waterTemp_C: shot.waterTemp_C?.toString() || "",
        preinfusion_s: shot.preinfusion_s?.toString() || "",
        rating: shot.rating,
        acidity: shot.acidity,
        bitterness: shot.bitterness,
        body: shot.body,
        aftertaste: shot.aftertaste,
        tastingTags: shot.tastingTags,
        notes: shot.notes,
        isFavorite: shot.isFavorite,
      };

      // Generate new coaching snapshot
      const coachingSnapshot = await coachingManager.getSuggestions(
        shotFormData,
        bean.roastLevel,
        {
          useCache: false, // Not needed since results are stored in shot snapshot
          forceRefresh,
        }
      );

      // Update shot with new coaching snapshot
      const updatedShot = {
        ...shot,
        coachingSnapshot,
        updatedAt: new Date().toISOString(),
      };

      await database.updateShot(updatedShot);
      await get().loadShots();
    } catch (error) {
      console.error("Failed to refresh coaching:", error);
      throw error;
    }
  },

  checkAndUpdateOutdatedSnapshots: async () => {
    const { shots, coachingManager, allBeans } = get();
    const currentExtractionVersion = getLatestVersion("extraction");
    const currentCoachingVersion = coachingManager.getVersion();

    console.log(`Checking snapshots for version updates...`);
    console.log(`Current extraction version: ${currentExtractionVersion}`);
    console.log(`Current coaching version: ${currentCoachingVersion}`);

    let updatedCount = 0;

    for (const shot of shots) {
      let needsUpdate = false;

      // Check extraction snapshot
      if (shot.extractionSnapshot) {
        const shouldRegenerateExtraction = shouldRegenerateSnapshot(
          currentExtractionVersion,
          shot.extractionSnapshot.version,
          "extraction"
        );

        if (shouldRegenerateExtraction) {
          console.log(
            `Shot ${shot.id} needs extraction update: ${shot.extractionSnapshot.version} -> ${currentExtractionVersion}`
          );
          needsUpdate = true;
        }
      }

      // Check coaching snapshot
      if (shot.coachingSnapshot) {
        const shouldRegenerateCoaching = shouldRegenerateSnapshot(
          currentCoachingVersion,
          shot.coachingSnapshot.version,
          "coaching"
        );

        if (shouldRegenerateCoaching) {
          console.log(
            `Shot ${shot.id} needs coaching update: ${shot.coachingSnapshot.version} -> ${currentCoachingVersion}`
          );
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        try {
          await get().refreshCoaching(shot.id, true); // Force refresh
          updatedCount++;
        } catch (error) {
          console.error(
            `Failed to update snapshots for shot ${shot.id}:`,
            error
          );
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} shots with new snapshot versions`);
    } else {
      console.log("All snapshots are up to date");
    }
  },
}));
