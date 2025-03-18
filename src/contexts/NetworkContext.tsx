"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 网络环境上下文类型
interface NetworkContextType {
  // 是否优先使用内网链接
  useInternalNetwork: boolean;
  // 切换内外网环境
  toggleNetworkMode: () => void;
}

// 创建上下文
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// 网络环境提供者Props
interface NetworkProviderProps {
  children: ReactNode;
}

// 网络环境提供者组件
export function NetworkProvider({ children }: NetworkProviderProps) {
  // 默认优先使用外网链接（false）
  const [useInternalNetwork, setUseInternalNetwork] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // 从本地存储加载偏好设置 - 确保在客户端执行
  useEffect(() => {
    setMounted(true);
    const savedPreference = localStorage.getItem("useInternalNetwork");
    if (savedPreference !== null) {
      setUseInternalNetwork(savedPreference === "true");
    }
  }, []);

  // 切换网络模式
  const toggleNetworkMode = () => {
    const newValue = !useInternalNetwork;
    setUseInternalNetwork(newValue);
    // 保存到本地存储
    if (typeof window !== "undefined") {
      localStorage.setItem("useInternalNetwork", String(newValue));
    }
  };

  // 服务端渲染或未加载前，提供默认值
  if (!mounted) {
    return (
      <NetworkContext.Provider
        value={{
          useInternalNetwork: false,
          toggleNetworkMode,
        }}
      >
        {children}
      </NetworkContext.Provider>
    );
  }

  return (
    <NetworkContext.Provider
      value={{
        useInternalNetwork,
        toggleNetworkMode,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

// 使用网络环境上下文的Hook
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork必须在NetworkProvider内部使用");
  }
  return context;
}
