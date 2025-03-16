/**
 * 客户端工具函数
 * 注意：此文件只能在客户端使用
 */

/**
 * 客户端尝试获取网站图标
 * @param url 网站URL
 * @returns 返回base64格式的图标或null
 */
export async function fetchIconOnClient(url: string): Promise<string | null> {
  // 如果不是浏览器环境，直接返回null
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // 解析URL
    const parsedUrl = new URL(url);
    const origin = parsedUrl.origin;
    const isLocalNetwork = isUrlInLocalNetwork(url);

    // 尝试常见的favicon路径
    const iconPaths = [
      "/favicon.ico",
      "/favicon.png",
      "/apple-touch-icon.png",
      "/apple-touch-icon-precomposed.png",
    ];

    // 创建一个新的空白图像，作为我们的默认回退图标
    const createDefaultIcon = () => {
      // 创建一个16x16的canvas
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // 设置背景色 - 使用URL的第一个字符作为基础
      const firstChar = (parsedUrl.hostname[0] || "A").toUpperCase();
      const hue = ((firstChar.charCodeAt(0) - 65) * 15) % 360; // 将ASCII码转换为0-360的色相值

      // 设置背景
      ctx.fillStyle = `hsl(${hue}, 70%, 70%)`;
      ctx.fillRect(0, 0, 32, 32);

      // 绘制文本
      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(firstChar, 16, 16);

      return canvas.toDataURL("image/png");
    };

    // 尝试逐个路径获取favicon
    for (const path of iconPaths) {
      try {
        const iconUrl = `${origin}${path}`;

        // 创建一个Image对象来加载图标
        const result = await new Promise<string | null>((resolve, reject) => {
          const img = new Image();

          img.crossOrigin = "Anonymous";
          img.onload = () => {
            try {
              // 创建canvas来转换为base64
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("无法获取canvas上下文"));
                return;
              }

              // 将图像绘制到canvas
              ctx.drawImage(img, 0, 0);

              // 转换为base64
              const dataURL = canvas.toDataURL("image/png");
              resolve(dataURL);
            } catch (e) {
              reject(e);
            }
          };

          img.onerror = () => {
            // 当发生错误时，尝试下一个路径
            resolve(null);
          };

          // 设置超时
          const timeout = setTimeout(() => {
            resolve(null);
          }, 1000);

          // 为了防止CORS问题，添加随机参数避免缓存
          img.src = `${iconUrl}?t=${Date.now()}`;
        });

        if (result) {
          return result; // 成功获取到图标
        }
      } catch (err) {
        console.log(`尝试路径 ${path} 失败:`, err);
        // 继续尝试下一个路径
      }
    }

    // 对于内网链接，可能需要特殊处理
    if (isLocalNetwork) {
      try {
        // 尝试获取内容的HTML并解析图标链接
        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "text/html" },
          credentials: "include", // 对内网链接可能需要包含凭证
          cache: "no-store",
          // 设定短超时
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          const text = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");

          // 搜索所有可能的链接标签
          const iconLinks = [
            ...Array.from(doc.querySelectorAll('link[rel="icon"]')),
            ...Array.from(doc.querySelectorAll('link[rel="shortcut icon"]')),
            ...Array.from(doc.querySelectorAll('link[rel="apple-touch-icon"]')),
            ...Array.from(
              doc.querySelectorAll('link[rel="apple-touch-icon-precomposed"]')
            ),
          ];

          for (const link of iconLinks) {
            const href = link.getAttribute("href");
            if (href) {
              try {
                // 解析相对URL
                const iconUrl = new URL(href, origin).href;

                // 加载图标
                const result = await new Promise<string | null>(
                  (resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";

                    img.onload = () => {
                      try {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;

                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                          reject(new Error("无法获取canvas上下文"));
                          return;
                        }

                        ctx.drawImage(img, 0, 0);
                        const dataURL = canvas.toDataURL("image/png");
                        resolve(dataURL);
                      } catch (e) {
                        reject(e);
                      }
                    };

                    img.onerror = () => resolve(null);
                    const timeout = setTimeout(() => resolve(null), 1500);
                    img.src = `${iconUrl}?t=${Date.now()}`;
                  }
                );

                if (result) {
                  return result;
                }
              } catch (err) {
                console.log(`尝试加载内网链接标签图标失败:`, err);
              }
            }
          }

          // 尝试查找网页中的图像元素
          const images = Array.from(doc.querySelectorAll("img"));
          const logoImages = images.filter((img) => {
            const src = img.getAttribute("src");
            const alt = img.getAttribute("alt") || "";
            const className = img.getAttribute("class") || "";
            return (
              src &&
              (src.toLowerCase().includes("logo") ||
                alt.toLowerCase().includes("logo") ||
                className.toLowerCase().includes("logo") ||
                src.toLowerCase().includes("icon"))
            );
          });

          if (logoImages.length > 0) {
            // 取第一个看起来像logo的图像
            const logoSrc = logoImages[0].getAttribute("src");
            if (logoSrc) {
              try {
                const logoUrl = new URL(logoSrc, origin).href;
                const result = await new Promise<string | null>(
                  (resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";

                    img.onload = () => {
                      try {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;

                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                          reject(new Error("无法获取canvas上下文"));
                          return;
                        }

                        // 裁剪为正方形
                        const size = Math.min(img.width, img.height);
                        const x = (img.width - size) / 2;
                        const y = (img.height - size) / 2;

                        ctx.drawImage(img, x, y, size, size, 0, 0, 64, 64);
                        const dataURL = canvas.toDataURL("image/png");
                        resolve(dataURL);
                      } catch (e) {
                        reject(e);
                      }
                    };

                    img.onerror = () => resolve(null);
                    const timeout = setTimeout(() => resolve(null), 1500);
                    img.src = `${logoUrl}?t=${Date.now()}`;
                  }
                );

                if (result) {
                  return result;
                }
              } catch (err) {
                console.log(`尝试加载logo图像失败:`, err);
              }
            }
          }
        }
      } catch (err) {
        console.log("获取内网HTML内容失败:", err);
      }
    }

    // 通过查找<link rel="icon">标签来获取图标
    try {
      // 使用fetch获取HTML内容
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "text/html" },
        credentials: "omit",
        cache: "no-store",
        // 设定非常短的超时，因为我们只需要页面的头部信息
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // 搜索所有可能的链接标签
        const iconLinks = [
          ...Array.from(doc.querySelectorAll('link[rel="icon"]')),
          ...Array.from(doc.querySelectorAll('link[rel="shortcut icon"]')),
          ...Array.from(doc.querySelectorAll('link[rel="apple-touch-icon"]')),
          ...Array.from(
            doc.querySelectorAll('link[rel="apple-touch-icon-precomposed"]')
          ),
        ];

        for (const link of iconLinks) {
          const href = link.getAttribute("href");
          if (href) {
            try {
              // 解析相对URL
              const iconUrl = new URL(href, origin).href;

              // 加载图标
              const result = await new Promise<string | null>(
                (resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = "Anonymous";

                  img.onload = () => {
                    try {
                      const canvas = document.createElement("canvas");
                      canvas.width = img.width;
                      canvas.height = img.height;

                      const ctx = canvas.getContext("2d");
                      if (!ctx) {
                        reject(new Error("无法获取canvas上下文"));
                        return;
                      }

                      ctx.drawImage(img, 0, 0);
                      const dataURL = canvas.toDataURL("image/png");
                      resolve(dataURL);
                    } catch (e) {
                      reject(e);
                    }
                  };

                  img.onerror = () => resolve(null);

                  const timeout = setTimeout(() => resolve(null), 1000);
                  img.src = `${iconUrl}?t=${Date.now()}`;
                }
              );

              if (result) {
                return result;
              }
            } catch (err) {
              console.log(`尝试加载链接标签图标失败:`, err);
              // 继续尝试下一个图标
            }
          }
        }
      }
    } catch (err) {
      console.log("获取HTML内容失败:", err);
    }

    // 所有方法都失败，生成默认图标
    return createDefaultIcon();
  } catch (error) {
    console.error(`客户端获取图标失败: ${error}`);
    return null;
  }
}

/**
 * 将客户端获取的内网图标保存到服务器
 * @param linkId 链接ID
 * @param iconBase64 base64格式的图标
 */
export async function saveLocalIconToServer(
  linkId: string,
  iconBase64: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/local-icon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        linkId,
        iconBase64,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error(`保存内网图标到服务器失败: ${error}`);
    return false;
  }
}

/**
 * 检查URL是否为内网地址
 */
function isUrlInLocalNetwork(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    return (
      hostname === "localhost" ||
      hostname.startsWith("127.0.0.1") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".lan")
    );
  } catch (e) {
    return false;
  }
}

/**
 * 将客户端获取的图标保存到服务器
 * @param linkId 链接ID
 * @param iconBase64 base64格式的图标
 * @param url 链接URL (可选，当iconBase64为null时使用)
 */
export async function saveIconToServer(
  linkId: string,
  iconBase64: string | null,
  url?: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/icon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        linkId,
        iconBase64,
        url,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.icon || null;
    }

    return null;
  } catch (error) {
    console.error(`保存图标到服务器失败: ${error}`);
    return null;
  }
}

/**
 * 从服务器获取图标
 */
export async function getIconFromServer(params: {
  linkId?: string;
  url?: string;
}): Promise<string | null> {
  try {
    const queryParams = new URLSearchParams();
    if (params.linkId) queryParams.append("linkId", params.linkId);
    if (params.url) queryParams.append("url", params.url);

    const response = await fetch(`/api/icon?${queryParams.toString()}`);

    if (response.ok) {
      const data = await response.json();
      return data.data?.icon || null;
    }

    return null;
  } catch (error) {
    console.error(`从服务器获取图标失败: ${error}`);
    return null;
  }
}
