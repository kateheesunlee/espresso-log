import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  displayName?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  userId: string;
  brand: string;
  model: string;
  nickname?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bean {
  id: string;
  userId: string;
  name: string;
  origin?: string;
  process?: string;
  roastLevel?: string;
  roastDate?: string;
  aromaTags?: string; // JSON string
  notes?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shot {
  id: string;
  userId: string;
  beanId?: string;
  machineId?: string;
  dose_g: number;
  yield_g: number;
  shotTime_s: number;
  ratio?: number;
  grindSetting?: string;
  waterTemp_C?: number;
  preinfusion_s?: number;
  rating?: number;
  acidity?: number;
  sweetness?: number;
  bitterness?: number;
  body?: number;
  aftertaste?: number;
  aromaTags?: string; // JSON string
  notes?: string;
  isBest?: boolean;
  createdAt: string;
  updatedAt: string;
}

class UniversalDatabase {
  private isWeb = Platform.OS === "web";
  private storageKey = "espresso_log_data";
  private db: any = null;

  async init(): Promise<void> {
    if (this.isWeb) {
      // Initialize localStorage with empty data if it doesn't exist
      if (!localStorage.getItem(this.storageKey)) {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            users: [],
            machines: [],
            beans: [],
            shots: [],
          })
        );
      }
    } else {
      // For mobile, use AsyncStorage for persistence
      try {
        const storedData = await AsyncStorage.getItem(this.storageKey);
        if (storedData) {
          this.db = JSON.parse(storedData);
        } else {
          this.db = {
            users: [],
            machines: [],
            beans: [],
            shots: [],
          };
          // Save initial empty structure
          await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.db));
        }
      } catch (error) {
        console.error("Failed to initialize AsyncStorage:", error);
        // Fallback to in-memory storage
        this.db = {
          users: [],
          machines: [],
          beans: [],
          shots: [],
        };
      }
    }
  }

  private getData() {
    if (this.isWeb) {
      const data = localStorage.getItem(this.storageKey);
      return data
        ? JSON.parse(data)
        : { users: [], machines: [], beans: [], shots: [] };
    } else {
      return this.db;
    }
  }

  private async setData(data: any) {
    if (this.isWeb) {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } else {
      this.db = data;
      try {
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save data to AsyncStorage:", error);
      }
    }
  }

  // User operations
  async createUser(user: Omit<User, "createdAt">): Promise<void> {
    const data = this.getData();
    const newUser = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    await await this.setData(data);
  }

  async getUser(id: string): Promise<User | null> {
    const data = this.getData();
    return data.users.find((u: User) => u.id === id) || null;
  }

  // Machine operations
  async createMachine(
    machine: Omit<Machine, "createdAt" | "updatedAt">
  ): Promise<void> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newMachine = {
      ...machine,
      createdAt: now,
      updatedAt: now,
    };
    data.machines.push(newMachine);
    await await this.setData(data);
  }

  async getMachines(userId: string): Promise<Machine[]> {
    const data = this.getData();
    return data.machines
      .filter((m: Machine) => m.userId === userId)
      .sort(
        (a: Machine, b: Machine) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async updateMachine(machine: Machine): Promise<void> {
    const data = this.getData();
    const index = data.machines.findIndex((m: Machine) => m.id === machine.id);
    if (index !== -1) {
      data.machines[index] = {
        ...machine,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  async deleteMachine(id: string): Promise<void> {
    const data = this.getData();
    data.machines = data.machines.filter((m: Machine) => m.id !== id);
    await this.setData(data);
  }

  // Bean operations
  async createBean(bean: Omit<Bean, "createdAt" | "updatedAt">): Promise<void> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newBean = {
      ...bean,
      createdAt: now,
      updatedAt: now,
    };
    data.beans.push(newBean);
    await this.setData(data);
  }

  async getBeans(userId: string): Promise<Bean[]> {
    const data = this.getData();
    return data.beans
      .filter((b: Bean) => b.userId === userId)
      .sort(
        (a: Bean, b: Bean) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async updateBean(bean: Bean): Promise<void> {
    const data = this.getData();
    const index = data.beans.findIndex((b: Bean) => b.id === bean.id);
    if (index !== -1) {
      data.beans[index] = {
        ...bean,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  async deleteBean(id: string): Promise<void> {
    const data = this.getData();
    data.beans = data.beans.filter((b: Bean) => b.id !== id);
    await this.setData(data);
  }

  // Shot operations
  async createShot(shot: Omit<Shot, "createdAt" | "updatedAt">): Promise<void> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newShot = {
      ...shot,
      createdAt: now,
      updatedAt: now,
    };
    data.shots.push(newShot);
    await this.setData(data);
  }

  async getShots(userId: string): Promise<Shot[]> {
    const data = this.getData();
    return data.shots
      .filter((s: Shot) => s.userId === userId)
      .sort(
        (a: Shot, b: Shot) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getShot(id: string): Promise<Shot | null> {
    const data = this.getData();
    return data.shots.find((s: Shot) => s.id === id) || null;
  }

  async updateShot(shot: Shot): Promise<void> {
    const data = this.getData();
    const index = data.shots.findIndex((s: Shot) => s.id === shot.id);
    if (index !== -1) {
      data.shots[index] = {
        ...shot,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  async deleteShot(id: string): Promise<void> {
    const data = this.getData();
    data.shots = data.shots.filter((s: Shot) => s.id !== id);
    await this.setData(data);
  }

  async toggleBestShot(id: string): Promise<void> {
    const shot = await this.getShot(id);
    if (shot) {
      const data = this.getData();
      const index = data.shots.findIndex((s: Shot) => s.id === id);

      if (index !== -1) {
        const currentShot = data.shots[index];
        const newBestValue = !currentShot.isBest;

        // If setting as best, first unset all other best shots for this user
        if (newBestValue) {
          data.shots.forEach((s: Shot) => {
            if (s.userId === shot.userId && s.isBest && s.id !== id) {
              s.isBest = false;
              s.updatedAt = new Date().toISOString();
            }
          });
        }

        // Then set the current shot's best status
        data.shots[index].isBest = newBestValue;
        data.shots[index].updatedAt = new Date().toISOString();
      }

      await this.setData(data);
    }
  }

  async getBestShot(userId: string): Promise<Shot | null> {
    const data = this.getData();
    return (
      data.shots.find((s: Shot) => s.userId === userId && s.isBest) || null
    );
  }
}

export const database = new UniversalDatabase();
