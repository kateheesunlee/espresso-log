import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bean,
  Brand,
  Grinder,
  Machine,
  MachineModel,
  Producer,
  Roaster,
  Shot,
  STORAGE_KEY,
  User,
} from '@types';
import { Platform } from 'react-native';

class UniversalDatabase {
  private isWeb = Platform.OS === 'web';
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
            brands: [],
            grinders: [],
            machineModels: [],
            producers: [],
            roasters: [],
          })
        );
      }
    } else {
      // For mobile, use AsyncStorage for persistence
      try {
        const storedData = await AsyncStorage.getItem(this.storageKey);
        if (storedData) {
          this.db = JSON.parse(storedData);
          // Ensure new tables exist for existing users
          if (!this.db.brands) this.db.brands = [];
          if (!this.db.grinders) this.db.grinders = [];
          if (!this.db.machineModels) this.db.machineModels = [];
          if (!this.db.producers) this.db.producers = [];
          if (!this.db.roasters) this.db.roasters = [];
        } else {
          this.db = {
            users: [],
            machines: [],
            beans: [],
            shots: [],
            brands: [],
            grinders: [],
            machineModels: [],
            producers: [],
            roasters: [],
          };
          // Save initial empty structure
          await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.db));
        }
      } catch (error) {
        console.error('Failed to initialize AsyncStorage:', error);
        // Fallback to in-memory storage
        this.db = {
          users: [],
          machines: [],
          beans: [],
          shots: [],
          brands: [],
          grinders: [],
          machineModels: [],
          producers: [],
          roasters: [],
        };
      }
    }
  }

  private getData() {
    if (this.isWeb) {
      const data = localStorage.getItem(this.storageKey);
      return data
        ? JSON.parse(data)
        : {
            users: [],
            machines: [],
            beans: [],
            shots: [],
            brands: [],
            grinders: [],
            machineModels: [],
            producers: [],
            roasters: [],
          };
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
        console.error('Failed to save data to AsyncStorage:', error);
      }
    }
  }

  // User operations
  async createUser(user: Omit<User, 'createdAt'>): Promise<void> {
    const data = this.getData();
    const newUser = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    await this.setData(data);
  }

  async getUser(id: string): Promise<User | null> {
    const data = this.getData();
    return data.users.find((u: User) => u.id === id) || null;
  }

  // Machine operations
  async createMachine(
    machine: Omit<Machine, 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newMachine = {
      ...machine,
      createdAt: now,
      updatedAt: now,
    };
    data.machines.push(newMachine);
    await this.setData(data);
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
  async createBean(bean: Omit<Bean, 'createdAt' | 'updatedAt'>): Promise<void> {
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
  async createShot(shot: Omit<Shot, 'createdAt' | 'updatedAt'>): Promise<void> {
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

  async addBeanDateEntry(beanId: string, dateEntry: any): Promise<void> {
    const data = this.getData();
    const beanIndex = data.beans.findIndex((b: Bean) => b.id === beanId);

    if (beanIndex !== -1) {
      if (!data.beans[beanIndex].dates) {
        data.beans[beanIndex].dates = [];
      }
      data.beans[beanIndex].dates.push(dateEntry);
      data.beans[beanIndex].updatedAt = new Date().toISOString();
      await this.setData(data);
    }
  }

  // Brand operations
  async createBrand(
    brand: Omit<Brand, 'createdAt' | 'updatedAt'>
  ): Promise<Brand> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newBrand: Brand = {
      ...brand,
      createdAt: now,
      updatedAt: now,
    };
    data.brands.push(newBrand);
    await this.setData(data);
    return newBrand;
  }

  async getBrands(): Promise<Brand[]> {
    const data = this.getData();
    return data.brands || [];
  }

  async getBrandById(id: string): Promise<Brand | null> {
    const data = this.getData();
    return data.brands?.find((b: Brand) => b.id === id) || null;
  }

  async findBrandByName(name: string): Promise<Brand | null> {
    const data = this.getData();
    const normalizedName = name.toLowerCase().trim();
    return (
      data.brands?.find(
        (b: Brand) =>
          b.name.toLowerCase() === normalizedName ||
          b.aliases.some(alias => alias.toLowerCase() === normalizedName)
      ) || null
    );
  }

  async updateBrand(brand: Brand): Promise<void> {
    const data = this.getData();
    const index = data.brands?.findIndex((b: Brand) => b.id === brand.id);
    if (index !== -1 && index !== undefined) {
      data.brands[index] = {
        ...brand,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  // Grinder operations
  async createGrinder(
    grinder: Omit<Grinder, 'createdAt' | 'updatedAt'>
  ): Promise<Grinder> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newGrinder: Grinder = {
      ...grinder,
      createdAt: now,
      updatedAt: now,
    };
    data.grinders.push(newGrinder);
    await this.setData(data);
    return newGrinder;
  }

  async getGrinders(): Promise<Grinder[]> {
    const data = this.getData();
    return data.grinders || [];
  }

  async getGrinderById(id: string): Promise<Grinder | null> {
    const data = this.getData();
    return data.grinders?.find((g: Grinder) => g.id === id) || null;
  }

  async findGrinderByName(name: string): Promise<Grinder | null> {
    const data = this.getData();
    const normalizedName = name.toLowerCase().trim();
    return (
      data.grinders?.find(
        (g: Grinder) =>
          g.name.toLowerCase() === normalizedName ||
          g.aliases.some(alias => alias.toLowerCase() === normalizedName)
      ) || null
    );
  }

  async updateGrinder(grinder: Grinder): Promise<void> {
    const data = this.getData();
    const index = data.grinders?.findIndex((g: Grinder) => g.id === grinder.id);
    if (index !== -1 && index !== undefined) {
      data.grinders[index] = {
        ...grinder,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  // MachineModel operations
  async createMachineModel(
    model: Omit<MachineModel, 'createdAt' | 'updatedAt'>
  ): Promise<MachineModel> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newModel: MachineModel = {
      ...model,
      createdAt: now,
      updatedAt: now,
    };
    data.machineModels.push(newModel);
    await this.setData(data);
    return newModel;
  }

  async getMachineModels(): Promise<MachineModel[]> {
    const data = this.getData();
    return data.machineModels || [];
  }

  async getMachineModelsByBrand(brandId: string): Promise<MachineModel[]> {
    const data = this.getData();
    return (
      data.machineModels?.filter((m: MachineModel) => m.brandId === brandId) ||
      []
    );
  }

  async getMachineModelById(id: string): Promise<MachineModel | null> {
    const data = this.getData();
    return data.machineModels?.find((m: MachineModel) => m.id === id) || null;
  }

  async findMachineModelByName(
    brandId: string,
    name: string
  ): Promise<MachineModel | null> {
    const data = this.getData();
    const normalizedName = name.toLowerCase().trim();
    return (
      data.machineModels?.find(
        (m: MachineModel) =>
          m.brandId === brandId &&
          (m.name.toLowerCase() === normalizedName ||
            m.aliases.some(alias => alias.toLowerCase() === normalizedName))
      ) || null
    );
  }

  async updateMachineModel(model: MachineModel): Promise<void> {
    const data = this.getData();
    const index = data.machineModels?.findIndex(
      (m: MachineModel) => m.id === model.id
    );
    if (index !== -1 && index !== undefined) {
      data.machineModels[index] = {
        ...model,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  // Producer operations
  async getProducers(): Promise<Producer[]> {
    const data = this.getData();
    return data.producers || [];
  }

  async getProducerById(id: string): Promise<Producer | null> {
    const data = this.getData();
    return data.producers?.find((p: Producer) => p.id === id) || null;
  }

  async findProducerByName(name: string): Promise<Producer | null> {
    const data = this.getData();
    const normalizedName = name.toLowerCase().trim();
    return (
      data.producers?.find(
        (p: Producer) =>
          p.name.toLowerCase() === normalizedName ||
          p.aliases.some(alias => alias.toLowerCase() === normalizedName)
      ) || null
    );
  }

  async createProducer(
    producer: Omit<Producer, 'createdAt' | 'updatedAt'>
  ): Promise<Producer> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newProducer: Producer = {
      ...producer,
      createdAt: now,
      updatedAt: now,
    };
    data.producers.push(newProducer);
    await this.setData(data);
    return newProducer;
  }

  async updateProducer(producer: Producer): Promise<void> {
    const data = this.getData();
    const index = data.producers?.findIndex(
      (p: Producer) => p.id === producer.id
    );
    if (index !== -1 && index !== undefined) {
      data.producers[index] = {
        ...producer,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }

  // Roaster operations
  async getRoasters(): Promise<Roaster[]> {
    const data = this.getData();
    return data.roasters || [];
  }

  async getRoasterById(id: string): Promise<Roaster | null> {
    const data = this.getData();
    return data.roasters?.find((r: Roaster) => r.id === id) || null;
  }

  async findRoasterByName(name: string): Promise<Roaster | null> {
    const data = this.getData();
    const normalizedName = name.toLowerCase().trim();
    return (
      data.roasters?.find(
        (r: Roaster) =>
          r.name.toLowerCase() === normalizedName ||
          r.aliases.some(alias => alias.toLowerCase() === normalizedName)
      ) || null
    );
  }

  async createRoaster(
    roaster: Omit<Roaster, 'createdAt' | 'updatedAt'>
  ): Promise<Roaster> {
    const data = this.getData();
    const now = new Date().toISOString();
    const newRoaster: Roaster = {
      ...roaster,
      createdAt: now,
      updatedAt: now,
    };
    data.roasters.push(newRoaster);
    await this.setData(data);
    return newRoaster;
  }

  async updateRoaster(roaster: Roaster): Promise<void> {
    const data = this.getData();
    const index = data.roasters?.findIndex((r: Roaster) => r.id === roaster.id);
    if (index !== -1 && index !== undefined) {
      data.roasters[index] = {
        ...roaster,
        updatedAt: new Date().toISOString(),
      };
      await this.setData(data);
    }
  }
}

export const database = new UniversalDatabase();
