import { useState, useCallback } from "react";
import type { MimoCodeModel, MimoCodeProviderConfig } from "@/types";
import {
  MIMOCODE_DEFAULT_NPM,
  MIMOCODE_DEFAULT_CONFIG,
  isKnownMimocodeOptionKey,
  parseMimocodeConfig,
  toMimocodeExtraOptions,
} from "../helpers/opencodeFormUtils";

interface UseMimocodeFormStateParams {
  initialData?: {
    settingsConfig?: Record<string, unknown>;
  };
  appId: string;
  providerId?: string;
  onSettingsConfigChange: (config: string) => void;
  getSettingsConfig: () => string;
}

export interface MimocodeFormState {
  mimocodeProviderKey: string;
  setMimocodeProviderKey: (key: string) => void;
  mimocodeNpm: string;
  mimocodeApiKey: string;
  mimocodeBaseUrl: string;
  mimocodeModels: Record<string, MimoCodeModel>;
  mimocodeExtraOptions: Record<string, string>;
  handleMimocodeNpmChange: (npm: string) => void;
  handleMimocodeApiKeyChange: (apiKey: string) => void;
  handleMimocodeBaseUrlChange: (baseUrl: string) => void;
  handleMimocodeModelsChange: (models: Record<string, MimoCodeModel>) => void;
  handleMimocodeExtraOptionsChange: (options: Record<string, string>) => void;
  resetMimocodeState: (config?: MimoCodeProviderConfig) => void;
}

export function useMimocodeFormState({
  initialData,
  appId,
  providerId,
  onSettingsConfigChange,
  getSettingsConfig,
}: UseMimocodeFormStateParams): MimocodeFormState {
  const initialMimocodeConfig =
    appId === "mimocode"
      ? parseMimocodeConfig(initialData?.settingsConfig)
      : null;
  const initialMimocodeOptions = initialMimocodeConfig?.options || {};

  const [mimocodeProviderKey, setMimocodeProviderKey] = useState<string>(() => {
    if (appId !== "mimocode") return "";
    return providerId || "";
  });

  const [mimocodeNpm, setMimocodeNpm] = useState<string>(() => {
    if (appId !== "mimocode") return MIMOCODE_DEFAULT_NPM;
    return initialMimocodeConfig?.npm || MIMOCODE_DEFAULT_NPM;
  });

  const [mimocodeApiKey, setMimocodeApiKey] = useState<string>(() => {
    if (appId !== "mimocode") return "";
    const value = initialMimocodeOptions.apiKey;
    return typeof value === "string" ? value : "";
  });

  const [mimocodeBaseUrl, setMimocodeBaseUrl] = useState<string>(() => {
    if (appId !== "mimocode") return "";
    const value = initialMimocodeOptions.baseURL;
    return typeof value === "string" ? value : "";
  });

  const [mimocodeModels, setMimocodeModels] = useState<
    Record<string, MimoCodeModel>
  >(() => {
    if (appId !== "mimocode") return {};
    return initialMimocodeConfig?.models || {};
  });

  const [mimocodeExtraOptions, setMimocodeExtraOptions] = useState<
    Record<string, string>
  >(() => {
    if (appId !== "mimocode") return {};
    return toMimocodeExtraOptions(initialMimocodeOptions);
  });

  const updateMimocodeSettings = useCallback(
    (updater: (config: Record<string, any>) => void) => {
      try {
        const config = JSON.parse(
          getSettingsConfig() || MIMOCODE_DEFAULT_CONFIG,
        ) as Record<string, any>;
        updater(config);
        onSettingsConfigChange(JSON.stringify(config, null, 2));
      } catch {}
    },
    [getSettingsConfig, onSettingsConfigChange],
  );

  const handleMimocodeNpmChange = useCallback(
    (npm: string) => {
      setMimocodeNpm(npm);
      updateMimocodeSettings((config) => {
        config.npm = npm;
      });
    },
    [updateMimocodeSettings],
  );

  const handleMimocodeApiKeyChange = useCallback(
    (apiKey: string) => {
      setMimocodeApiKey(apiKey);
      updateMimocodeSettings((config) => {
        if (!config.options) config.options = {};
        config.options.apiKey = apiKey;
      });
    },
    [updateMimocodeSettings],
  );

  const handleMimocodeBaseUrlChange = useCallback(
    (baseUrl: string) => {
      setMimocodeBaseUrl(baseUrl);
      updateMimocodeSettings((config) => {
        if (!config.options) config.options = {};
        config.options.baseURL = baseUrl.trim().replace(/\/+$/, "");
      });
    },
    [updateMimocodeSettings],
  );

  const handleMimocodeModelsChange = useCallback(
    (models: Record<string, MimoCodeModel>) => {
      setMimocodeModels(models);
      updateMimocodeSettings((config) => {
        config.models = models;
      });
    },
    [updateMimocodeSettings],
  );

  const handleMimocodeExtraOptionsChange = useCallback(
    (options: Record<string, string>) => {
      setMimocodeExtraOptions(options);
      updateMimocodeSettings((config) => {
        if (!config.options) config.options = {};

        for (const k of Object.keys(config.options)) {
          if (!isKnownMimocodeOptionKey(k)) {
            delete config.options[k];
          }
        }

        for (const [k, v] of Object.entries(options)) {
          const trimmedKey = k.trim();
          if (trimmedKey && !trimmedKey.startsWith("option-")) {
            try {
              config.options[trimmedKey] = JSON.parse(v);
            } catch {
              config.options[trimmedKey] = v;
            }
          }
        }
      });
    },
    [updateMimocodeSettings],
  );

  const resetMimocodeState = useCallback((config?: MimoCodeProviderConfig) => {
    setMimocodeProviderKey("");
    setMimocodeNpm(config?.npm || MIMOCODE_DEFAULT_NPM);
    setMimocodeBaseUrl(config?.options?.baseURL || "");
    setMimocodeApiKey(config?.options?.apiKey || "");
    setMimocodeModels(config?.models || {});
    setMimocodeExtraOptions(toMimocodeExtraOptions(config?.options || {}));
  }, []);

  return {
    mimocodeProviderKey,
    setMimocodeProviderKey,
    mimocodeNpm,
    mimocodeApiKey,
    mimocodeBaseUrl,
    mimocodeModels,
    mimocodeExtraOptions,
    handleMimocodeNpmChange,
    handleMimocodeApiKeyChange,
    handleMimocodeBaseUrlChange,
    handleMimocodeModelsChange,
    handleMimocodeExtraOptionsChange,
    resetMimocodeState,
  };
}
