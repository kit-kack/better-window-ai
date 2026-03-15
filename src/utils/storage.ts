export interface ModelConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  activeConfigId: string;
  configs: ModelConfig[];
  permissions: Record<string, PermissionStatus>; // 域名 -> 权限状态
}

export type PermissionStatus = "granted" | "denied" | "prompt";

export interface PermissionRequest {
  origin: string;
  timestamp: number;
}

export function createDefaultConfig(): Omit<ModelConfig, "id"> {
  const now = Date.now();

  return {
    name: "新配置",
    apiKey: "",
    baseUrl: "",
    model: "",
    temperature: 0.7,
    maxTokens: 2000,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  activeConfigId: "",
  configs: [],
  permissions: {},
};

export const storageKeys = {
  appSettings: "local:ai-conf",
} as const;

export async function getAppSettings(): Promise<AppSettings> {
  const settings = await storage.getItem<AppSettings>(storageKeys.appSettings);
  return settings || DEFAULT_SETTINGS;
}

export async function setAppSettings(settings: AppSettings): Promise<void> {
  await storage.setItem(storageKeys.appSettings, settings);
}

export async function getActiveConfig(): Promise<ModelConfig | null> {
  const settings = await getAppSettings();
  if (!settings.activeConfigId) return null;
  return settings.configs.find((c) => c.id === settings.activeConfigId) || null;
}

export async function addConfig(
  config: Omit<ModelConfig, "id">,
): Promise<string> {
  const settings = await getAppSettings();
  const id = `config_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 11)}`;
  const newConfig: ModelConfig = { ...config, id };

  settings.configs.push(newConfig);

  // 如果是第一个配置，自动设为活跃
  if (settings.configs.length === 1) {
    settings.activeConfigId = id;
  }

  await setAppSettings(settings);
  return id;
}

export async function updateConfig(
  id: string,
  updates: Partial<ModelConfig>,
): Promise<void> {
  const settings = await getAppSettings();
  const index = settings.configs.findIndex((c) => c.id === id);

  if (index === -1) {
    throw new Error("配置不存在");
  }

  settings.configs[index] = {
    ...settings.configs[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await setAppSettings(settings);
}

export async function deleteConfig(id: string): Promise<void> {
  const settings = await getAppSettings();
  settings.configs = settings.configs.filter((c) => c.id !== id);

  // 如果删除的是活跃配置，切换到第一个可用配置
  if (settings.activeConfigId === id) {
    settings.activeConfigId = settings.configs[0]?.id || "";
  }

  await setAppSettings(settings);
}

export async function setActiveConfig(id: string): Promise<void> {
  const settings = await getAppSettings();
  const config = settings.configs.find((c) => c.id === id);

  if (!config) {
    throw new Error("配置不存在");
  }

  settings.activeConfigId = id;
  await setAppSettings(settings);
}

/**
 * 获取指定域名的权限状态
 */
export async function getPermission(origin: string): Promise<PermissionStatus> {
  const settings = await getAppSettings();
  return settings.permissions?.[origin] || "prompt";
}

/**
 * 设置指定域名的权限状态
 */
export async function setPermission(
  origin: string,
  status: PermissionStatus,
): Promise<void> {
  const settings = await getAppSettings();
  settings.permissions[origin] = status;
  await setAppSettings(settings);
}

/**
 * 检查是否有权限调用 AI
 */
export async function checkPermission(origin: string): Promise<boolean> {
  const status = await getPermission(origin);
  return status === "granted";
}

/**
 * 清除指定域名的权限
 */
export async function clearPermission(origin: string): Promise<void> {
  const settings = await getAppSettings();
  delete settings.permissions[origin];
  await setAppSettings(settings);
}

/**
 * 获取所有权限记录
 */
export async function getAllPermissions(): Promise<
  Record<string, PermissionStatus>
> {
  const settings = await getAppSettings();
  return settings.permissions;
}
