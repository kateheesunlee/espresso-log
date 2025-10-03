import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Machine, Bean, Shot, STORAGE_KEY } from "@types";

class UniversalDatabase {
  private isWeb = Platform.OS === "web";
  private storageKey = STORAGE_KEY;
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
      .filter((m: Machine) => m.userId === userId && !m.deleted)
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
    const index = data.machines.findIndex((m: Machine) => m.id === id);
    if (index !== -1) {
      data.machines[index].deleted = true;
      data.machines[index].updatedAt = new Date().toISOString();
      await this.setData(data);
    }
  }

  async getAllMachines(userId: string): Promise<Machine[]> {
    const data = this.getData();
    return data.machines
      .filter((m: Machine) => m.userId === userId)
      .sort(
        (a: Machine, b: Machine) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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
      .filter((b: Bean) => b.userId === userId && !b.deleted)
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
    const index = data.beans.findIndex((b: Bean) => b.id === id);
    if (index !== -1) {
      data.beans[index].deleted = true;
      data.beans[index].updatedAt = new Date().toISOString();
      await this.setData(data);
    }
  }

  async getAllBeans(userId: string): Promise<Bean[]> {
    const data = this.getData();
    return data.beans
      .filter((b: Bean) => b.userId === userId)
      .sort(
        (a: Bean, b: Bean) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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

  async toggleFavoriteShot(id: string): Promise<void> {
    const shot = await this.getShot(id);
    if (shot) {
      const data = this.getData();
      const index = data.shots.findIndex((s: Shot) => s.id === id);

      if (index !== -1) {
        const currentShot = data.shots[index];
        const newFavoriteValue = !currentShot.isFavorite;

        // Toggle the current shot's favorite status
        data.shots[index].isFavorite = newFavoriteValue;
        data.shots[index].updatedAt = new Date().toISOString();
      }

      await this.setData(data);
    }
  }

  async getFavoriteShot(userId: string): Promise<Shot | null> {
    const data = this.getData();
    return (
      data.shots.find((s: Shot) => s.userId === userId && s.isFavorite) || null
    );
  }

  async getFavoriteShots(userId: string): Promise<Shot[]> {
    const data = this.getData();
    return data.shots
      .filter((s: Shot) => s.userId === userId && s.isFavorite)
      .sort(
        (a: Shot, b: Shot) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async toggleFavoriteBean(id: string): Promise<void> {
    const bean = await this.getBean(id);
    if (bean) {
      const data = this.getData();
      const index = data.beans.findIndex((b: Bean) => b.id === id);

      if (index !== -1) {
        const currentBean = data.beans[index];
        const newFavoriteValue = !currentBean.isFavorite;

        // Toggle the current bean's favorite status
        data.beans[index].isFavorite = newFavoriteValue;
        data.beans[index].updatedAt = new Date().toISOString();
      }

      await this.setData(data);
    }
  }

  async getFavoriteBean(userId: string): Promise<Bean | null> {
    const data = this.getData();
    return (
      data.beans.find((b: Bean) => b.userId === userId && b.isFavorite) || null
    );
  }

  async getFavoriteBeans(userId: string): Promise<Bean[]> {
    const data = this.getData();
    return data.beans
      .filter((b: Bean) => b.userId === userId && b.isFavorite)
      .sort(
        (a: Bean, b: Bean) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getBean(id: string): Promise<Bean | null> {
    const data = this.getData();
    return data.beans.find((b: Bean) => b.id === id) || null;
  }
}

export const database = new UniversalDatabase();
