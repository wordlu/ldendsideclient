var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package.json
var package_exports = {};
__export(package_exports, {
  default: () => package_default,
  dependencies: () => dependencies,
  devDependencies: () => devDependencies,
  name: () => name,
  private: () => private2,
  scripts: () => scripts,
  type: () => type,
  version: () => version
});
var name, private2, version, type, scripts, dependencies, devDependencies, package_default;
var init_package = __esm({
  "package.json"() {
    name = "loggerfe";
    private2 = true;
    version = "1.3.4";
    type = "module";
    scripts = {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      format: "prettier --write .",
      "lint:jsts": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
      "lint:style": "stylelint src/**/*.{css,scss,vue}",
      tscheck: "vue-tsc --noEmit"
    };
    dependencies = {
      "@juggle/resize-observer": "^3.4.0",
      axios: "^1.1.3",
      buffer: "^6.0.3",
      "element-plus": "^2.2.13",
      pinia: "^2.0.18",
      three: "^0.144.0",
      "three-spritetext": "^1.6.5",
      "tiny-emitter": "^2.1.0",
      "vite-plugin-qiankun": "^1.0.15",
      vue: "^3.2.37",
      "vue-i18n": "^9.2.2",
      "vue-router": "^4.1.3",
      vuedraggable: "^4.1.0"
    };
    devDependencies = {
      "@iconify-icons/ant-design": "^1.2.4",
      "@iconify/vue": "^3.2.1",
      "@protobuf-ts/plugin": "^2.8.3",
      "@types/node": "^18.7.5",
      "@types/three": "^0.146.0",
      "@typescript-eslint/eslint-plugin": "^5.33.1",
      "@typescript-eslint/parser": "^5.33.1",
      "@vitejs/plugin-vue": "^3.0.3",
      autoprefixer: "^10.4.8",
      eslint: "^8.22.0",
      "eslint-config-prettier": "^8.5.0",
      "eslint-plugin-vue": "^9.3.0",
      mockjs: "^1.1.0",
      postcss: "^8.4.16",
      "postcss-html": "^1.5.0",
      prettier: "^2.7.1",
      sass: "^1.54.5",
      stylelint: "^14.10.0",
      "stylelint-config-prettier": "^9.0.3",
      "stylelint-config-recommended-vue": "^1.4.0",
      "stylelint-config-standard": "^27.0.0",
      tailwindcss: "^3.1.8",
      typescript: "^4.7.4",
      "unplugin-auto-import": "^0.11.1",
      "unplugin-vue-components": "^0.22.4",
      vite: "^3.0.7",
      "vue-eslint-parser": "^9.0.3",
      "vue-tsc": "^0.39.5"
    };
    package_default = {
      name,
      private: private2,
      version,
      type,
      scripts,
      dependencies,
      devDependencies
    };
  }
});

// vite.config.ts
import { loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import qiankun from "vite-plugin-qiankun";
var __vite_injected_original_dirname = "E:\\work\\ld-dms\\applications\\logger_fe";
var packageName = (init_package(), __toCommonJS(package_exports)).name;
var useDevMode = true;
var vite_config_default = ({ command, mode }) => {
  if (!command)
    return;
  const root = process.cwd();
  const env = loadEnv(mode, root);
  return {
    base: `/apps/loggerfe`,
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`
        }
      }
    },
    plugins: [
      vue(),
      qiankun("loggerfe", { useDevMode }),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: "sass" })]
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: "sass" })]
      })
    ],
    output: {
      library: `${packageName}`,
      libraryTarget: "umd",
      chunkLoadingGlobal: `webpackJsonp_${packageName}`
    },
    build: {
      target: ["edge90", "chrome90", "firefox90", "safari15"],
      outDir: "loggerfe",
      sourcemap: true
    },
    server: {
      host: "0.0.0.0",
      port: 8686,
      proxy: {
        "/api": {
          target: "http://10.86.24.56:8100",
          ws: true,
          changeOrigin: true
        },
        "/ws": {
          target: "ws://10.86.24.56:8100",
          ws: true,
          changeOrigin: true
        }
      }
    }
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx3b3JrXFxcXGxkLWRtc1xcXFxhcHBsaWNhdGlvbnNcXFxcbG9nZ2VyX2ZlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFx3b3JrXFxcXGxkLWRtc1xcXFxhcHBsaWNhdGlvbnNcXFxcbG9nZ2VyX2ZlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi93b3JrL2xkLWRtcy9hcHBsaWNhdGlvbnMvbG9nZ2VyX2ZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bidcclxuY29uc3QgcGFja2FnZU5hbWUgPSByZXF1aXJlKCcuL3BhY2thZ2UuanNvbicpLm5hbWU7XHJcbmNvbnN0IHVzZURldk1vZGUgPSB0cnVlXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0ICh7IGNvbW1hbmQsIG1vZGUgfTogYW55KTogYW55ID0+IHtcclxuICBpZiAoIWNvbW1hbmQpIHJldHVyblxyXG4gIGNvbnN0IHJvb3QgPSBwcm9jZXNzLmN3ZCgpXHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCByb290KVxyXG4gIHJldHVybiB7XHJcbiAgICAvLyBiYXNlOiBlbnYuVklURV9QVUJMSUNfUEFUSCxcclxuICAgIGJhc2U6IGAvYXBwcy9sb2dnZXJmZWAsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNzczoge1xyXG4gICAgICAvLyBjc3MgXHU5ODg0XHU1OTA0XHU3NDA2XHU1NjY4XHJcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgICAvLyBcdTVGMTVcdTUxNjUgXHU1MTY4XHU1QzQwLnNjc3MsIFx1NjcwMFx1NTQwRVx1NTIyQlx1NUZEOFx1NEU4Nlx1NTJBMFx1NEUwQSA7XHJcbiAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAdXNlIFwiQC9zdHlsZXMvZWxlbWVudC9pbmRleC5zY3NzXCIgYXMgKjtgLFxyXG4gICAgICAgICAgLy8gYWRkaXRpb25hbERhdGE6ICdAaW1wb3J0IFwiQC9zdHlsZXMvZWxlbWVudC9pbmRleC5zY3NzXCI7JyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgdnVlKCksXHJcbiAgICAgIHFpYW5rdW4oJ2xvZ2dlcmZlJywge3VzZURldk1vZGV9KSxcclxuICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcih7IGltcG9ydFN0eWxlOiAnc2FzcycgfSldLFxyXG4gICAgICB9KSxcclxuICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcih7IGltcG9ydFN0eWxlOiAnc2FzcycgfSldLFxyXG4gICAgICB9KSxcclxuICAgICAgLy8gRWxlbWVudFBsdXMoe1xyXG4gICAgICAvLyB1c2VTb3VyY2U6IHRydWUsXHJcbiAgICAgIC8vIH0pLFxyXG4gICAgXSxcclxuICAgIG91dHB1dDoge1xyXG4gICAgICBsaWJyYXJ5OiBgJHtwYWNrYWdlTmFtZX1gLFxyXG4gICAgICBsaWJyYXJ5VGFyZ2V0OiAndW1kJywgLy8gXHU2MjhBXHU1RkFFXHU1RTk0XHU3NTI4XHU2MjUzXHU1MzA1XHU2MjEwIHVtZCBcdTVFOTNcdTY4M0NcdTVGMEZcclxuICAgICAgLy8ganNvbnBGdW5jdGlvbjogYHdlYnBhY2tKc29ucF8ke3BhY2thZ2VOYW1lfWAsXHJcbiAgICAgIGNodW5rTG9hZGluZ0dsb2JhbDogYHdlYnBhY2tKc29ucF8ke3BhY2thZ2VOYW1lfWBcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAvLyB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICB0YXJnZXQ6IFsnZWRnZTkwJywgJ2Nocm9tZTkwJywgJ2ZpcmVmb3g5MCcsICdzYWZhcmkxNSddLFxyXG4gICAgICBvdXREaXI6ICdsZF9sb2dnZXJfZmUnLCAvLyBcdTY4MzlcdTYzNkVcdTk4NzlcdTc2RUVcdTVCOUVcdTk2NDVcdTYwQzVcdTUxQjVcdThGREJcdTg4NENcdTkxNERcdTdGNkVcclxuICAgICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICAgIHBvcnQ6IDg2ODYsXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTAuODYuMjQuNTY6ODEwMCcsXHJcbiAgICAgICAgICB3czogdHJ1ZSxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcvd3MnOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6ICd3czovLzEwLjg2LjI0LjU2OjgxMDAnLFxyXG4gICAgICAgICAgd3M6IHRydWUsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTJTLFNBQVMsZUFBZTtBQUNuVSxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBQ3BDLE9BQU8sYUFBYTtBQU5wQixJQUFNLG1DQUFtQztBQU96QyxJQUFNLGNBQWMsZ0RBQTBCO0FBQzlDLElBQU0sYUFBYTtBQUVuQixJQUFPLHNCQUFRLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBZ0I7QUFDOUMsTUFBSSxDQUFDO0FBQVM7QUFDZCxRQUFNLE9BQU8sUUFBUSxJQUFJO0FBQ3pCLFFBQU0sTUFBTSxRQUFRLE1BQU0sSUFBSTtBQUM5QixTQUFPO0FBQUEsSUFFTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQy9CO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BRUgscUJBQXFCO0FBQUEsUUFFbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUEsUUFFbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLE1BQ0osUUFBUSxZQUFZLEVBQUMsV0FBVSxDQUFDO0FBQUEsTUFDaEMsV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixFQUFFLGFBQWEsT0FBTyxDQUFDLENBQUM7QUFBQSxNQUMxRCxDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxPQUFPLENBQUMsQ0FBQztBQUFBLE1BQzFELENBQUM7QUFBQSxJQUlIO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixTQUFTLEdBQUc7QUFBQSxNQUNaLGVBQWU7QUFBQSxNQUVmLG9CQUFvQixnQkFBZ0I7QUFBQSxJQUN0QztBQUFBLElBQ0EsT0FBTztBQUFBLE1BRUwsUUFBUSxDQUFDLFVBQVUsWUFBWSxhQUFhLFVBQVU7QUFBQSxNQUN0RCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsSUFBSTtBQUFBLFVBQ0osY0FBYztBQUFBLFFBQ2hCO0FBQUEsUUFDQSxPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsVUFDUixJQUFJO0FBQUEsVUFDSixjQUFjO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
