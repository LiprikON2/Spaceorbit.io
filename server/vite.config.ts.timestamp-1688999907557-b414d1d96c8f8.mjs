// vite.config.ts
import { defineConfig } from "file:///C:/Users/user/Workspace/Source%20Code/Dev%202022/JS/spaceorbit.io/server/node_modules/vite/dist/node/index.js";
import { VitePluginNode } from "file:///C:/Users/user/Workspace/Source%20Code/Dev%202022/JS/spaceorbit.io/server/node_modules/vite-plugin-node/dist/index.js";
import { resolve } from "path";
import webpackConfig from "file:///C:/Users/user/Workspace/Source%20Code/Dev%202022/JS/spaceorbit.io/client/webpack/webpack.common.js";
var __vite_injected_original_dirname = "C:\\Users\\user\\Workspace\\Source Code\\Dev 2022\\JS\\spaceorbit.io\\server";
var webpackAliases = webpackConfig.resolve.alias;
var host = process.env.HOST ?? "0.0.0.0";
var port = parseInt(process.env.PORT ?? "") || 3010;
var vite_config_default = defineConfig({
  // ...vite configures
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    host,
    port,
    strictPort: true
  },
  resolve: {
    alias: {
      ...webpackAliases,
      ...{ "~/server": resolve(__vite_injected_original_dirname, "./src") }
    }
  },
  plugins: [
    ...VitePluginNode({
      // Nodejs native Request adapter
      // currently this plugin support 'express', 'nest', 'koa' and 'fastify' out of box,
      // you can also pass a function if you are using other frameworks, see Custom Adapter section
      adapter: "express",
      // tell the plugin where is your project entry
      appPath: resolve(__vite_injected_original_dirname, "./src/core/app.ts"),
      // Optional, default: 'viteNodeApp'
      // the name of named export of you app from the appPath file
      exportName: "serverListener",
      // Optional, default: 'esbuild'
      // The TypeScript compiler you want to use
      // by default this plugin is using vite default ts compiler which is esbuild
      // 'swc' compiler is supported to use as well for frameworks
      // like Nestjs (esbuild dont support 'emitDecoratorMetadata' yet)
      // you need to INSTALL `@swc/core` as dev dependency if you want to use swc
      tsCompiler: "esbuild",
      // Optional, default: {
      // jsc: {
      //   target: 'es2019',
      //   parser: {
      //     syntax: 'typescript',
      //     decorators: true
      //   },
      //  transform: {
      //     legacyDecorator: true,
      //     decoratorMetadata: true
      //   }
      // }
      // }
      // swc configs, see [swc doc](https://swc.rs/docs/configuration/swcrc)
      swcOptions: {}
    })
  ],
  optimizeDeps: {
    disabled: true,
    include: [],
    // Vite does not work well with optionnal dependencies,
    // you can mark them as ignored for now
    // eg: for nestjs, exlude these optional dependencies:
    // exclude: [
    //   '@nestjs/microservices',
    //   '@nestjs/websockets',
    //   'cache-manager',
    //   'class-transformer',
    //   'class-validator',
    //   'fastify-swagger',
    // ],
    exclude: ["mock-aws-s3", "aws-sdk", "nock", "node-datachannel"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXFdvcmtzcGFjZVxcXFxTb3VyY2UgQ29kZVxcXFxEZXYgMjAyMlxcXFxKU1xcXFxzcGFjZW9yYml0LmlvXFxcXHNlcnZlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxXb3Jrc3BhY2VcXFxcU291cmNlIENvZGVcXFxcRGV2IDIwMjJcXFxcSlNcXFxcc3BhY2VvcmJpdC5pb1xcXFxzZXJ2ZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvV29ya3NwYWNlL1NvdXJjZSUyMENvZGUvRGV2JTIwMjAyMi9KUy9zcGFjZW9yYml0LmlvL3NlcnZlci92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB7IFZpdGVQbHVnaW5Ob2RlIH0gZnJvbSBcInZpdGUtcGx1Z2luLW5vZGVcIjtcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XHJcblxyXG5pbXBvcnQgd2VicGFja0NvbmZpZyBmcm9tIFwiQHNwYWNlb3JiaXQvY2xpZW50L3dlYnBhY2svd2VicGFjay5jb21tb25cIjtcclxuXHJcbmNvbnN0IHdlYnBhY2tBbGlhc2VzID0gd2VicGFja0NvbmZpZy5yZXNvbHZlLmFsaWFzO1xyXG5cclxuY29uc3QgaG9zdCA9IHByb2Nlc3MuZW52LkhPU1QgPz8gXCIwLjAuMC4wXCI7XHJcbmNvbnN0IHBvcnQgPSBwYXJzZUludChwcm9jZXNzLmVudi5QT1JUID8/IFwiXCIpIHx8IDMwMTA7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgLy8gLi4udml0ZSBjb25maWd1cmVzXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICAvLyB2aXRlIHNlcnZlciBjb25maWdzLCBmb3IgZGV0YWlscyBzZWUgW3ZpdGUgZG9jXShodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnLyNzZXJ2ZXItaG9zdClcclxuICAgICAgICBob3N0LFxyXG4gICAgICAgIHBvcnQsXHJcbiAgICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgIC4uLndlYnBhY2tBbGlhc2VzLFxyXG4gICAgICAgICAgICAuLi57IFwifi9zZXJ2ZXJcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIikgfSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgLi4uVml0ZVBsdWdpbk5vZGUoe1xyXG4gICAgICAgICAgICAvLyBOb2RlanMgbmF0aXZlIFJlcXVlc3QgYWRhcHRlclxyXG4gICAgICAgICAgICAvLyBjdXJyZW50bHkgdGhpcyBwbHVnaW4gc3VwcG9ydCAnZXhwcmVzcycsICduZXN0JywgJ2tvYScgYW5kICdmYXN0aWZ5JyBvdXQgb2YgYm94LFxyXG4gICAgICAgICAgICAvLyB5b3UgY2FuIGFsc28gcGFzcyBhIGZ1bmN0aW9uIGlmIHlvdSBhcmUgdXNpbmcgb3RoZXIgZnJhbWV3b3Jrcywgc2VlIEN1c3RvbSBBZGFwdGVyIHNlY3Rpb25cclxuICAgICAgICAgICAgYWRhcHRlcjogXCJleHByZXNzXCIsXHJcblxyXG4gICAgICAgICAgICAvLyB0ZWxsIHRoZSBwbHVnaW4gd2hlcmUgaXMgeW91ciBwcm9qZWN0IGVudHJ5XHJcbiAgICAgICAgICAgIGFwcFBhdGg6IHJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2NvcmUvYXBwLnRzXCIpLFxyXG5cclxuICAgICAgICAgICAgLy8gT3B0aW9uYWwsIGRlZmF1bHQ6ICd2aXRlTm9kZUFwcCdcclxuICAgICAgICAgICAgLy8gdGhlIG5hbWUgb2YgbmFtZWQgZXhwb3J0IG9mIHlvdSBhcHAgZnJvbSB0aGUgYXBwUGF0aCBmaWxlXHJcbiAgICAgICAgICAgIGV4cG9ydE5hbWU6IFwic2VydmVyTGlzdGVuZXJcIixcclxuXHJcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsLCBkZWZhdWx0OiAnZXNidWlsZCdcclxuICAgICAgICAgICAgLy8gVGhlIFR5cGVTY3JpcHQgY29tcGlsZXIgeW91IHdhbnQgdG8gdXNlXHJcbiAgICAgICAgICAgIC8vIGJ5IGRlZmF1bHQgdGhpcyBwbHVnaW4gaXMgdXNpbmcgdml0ZSBkZWZhdWx0IHRzIGNvbXBpbGVyIHdoaWNoIGlzIGVzYnVpbGRcclxuICAgICAgICAgICAgLy8gJ3N3YycgY29tcGlsZXIgaXMgc3VwcG9ydGVkIHRvIHVzZSBhcyB3ZWxsIGZvciBmcmFtZXdvcmtzXHJcbiAgICAgICAgICAgIC8vIGxpa2UgTmVzdGpzIChlc2J1aWxkIGRvbnQgc3VwcG9ydCAnZW1pdERlY29yYXRvck1ldGFkYXRhJyB5ZXQpXHJcbiAgICAgICAgICAgIC8vIHlvdSBuZWVkIHRvIElOU1RBTEwgYEBzd2MvY29yZWAgYXMgZGV2IGRlcGVuZGVuY3kgaWYgeW91IHdhbnQgdG8gdXNlIHN3Y1xyXG4gICAgICAgICAgICB0c0NvbXBpbGVyOiBcImVzYnVpbGRcIixcclxuXHJcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsLCBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgIC8vIGpzYzoge1xyXG4gICAgICAgICAgICAvLyAgIHRhcmdldDogJ2VzMjAxOScsXHJcbiAgICAgICAgICAgIC8vICAgcGFyc2VyOiB7XHJcbiAgICAgICAgICAgIC8vICAgICBzeW50YXg6ICd0eXBlc2NyaXB0JyxcclxuICAgICAgICAgICAgLy8gICAgIGRlY29yYXRvcnM6IHRydWVcclxuICAgICAgICAgICAgLy8gICB9LFxyXG4gICAgICAgICAgICAvLyAgdHJhbnNmb3JtOiB7XHJcbiAgICAgICAgICAgIC8vICAgICBsZWdhY3lEZWNvcmF0b3I6IHRydWUsXHJcbiAgICAgICAgICAgIC8vICAgICBkZWNvcmF0b3JNZXRhZGF0YTogdHJ1ZVxyXG4gICAgICAgICAgICAvLyAgIH1cclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIC8vIHN3YyBjb25maWdzLCBzZWUgW3N3YyBkb2NdKGh0dHBzOi8vc3djLnJzL2RvY3MvY29uZmlndXJhdGlvbi9zd2NyYylcclxuICAgICAgICAgICAgc3djT3B0aW9uczoge30sXHJcbiAgICAgICAgfSksXHJcbiAgICBdLFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgZGlzYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgaW5jbHVkZTogW10sXHJcbiAgICAgICAgLy8gVml0ZSBkb2VzIG5vdCB3b3JrIHdlbGwgd2l0aCBvcHRpb25uYWwgZGVwZW5kZW5jaWVzLFxyXG4gICAgICAgIC8vIHlvdSBjYW4gbWFyayB0aGVtIGFzIGlnbm9yZWQgZm9yIG5vd1xyXG4gICAgICAgIC8vIGVnOiBmb3IgbmVzdGpzLCBleGx1ZGUgdGhlc2Ugb3B0aW9uYWwgZGVwZW5kZW5jaWVzOlxyXG4gICAgICAgIC8vIGV4Y2x1ZGU6IFtcclxuICAgICAgICAvLyAgICdAbmVzdGpzL21pY3Jvc2VydmljZXMnLFxyXG4gICAgICAgIC8vICAgJ0BuZXN0anMvd2Vic29ja2V0cycsXHJcbiAgICAgICAgLy8gICAnY2FjaGUtbWFuYWdlcicsXHJcbiAgICAgICAgLy8gICAnY2xhc3MtdHJhbnNmb3JtZXInLFxyXG4gICAgICAgIC8vICAgJ2NsYXNzLXZhbGlkYXRvcicsXHJcbiAgICAgICAgLy8gICAnZmFzdGlmeS1zd2FnZ2VyJyxcclxuICAgICAgICAvLyBdLFxyXG4gICAgICAgIGV4Y2x1ZGU6IFtcIm1vY2stYXdzLXMzXCIsIFwiYXdzLXNka1wiLCBcIm5vY2tcIiwgXCJub2RlLWRhdGFjaGFubmVsXCJdLFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1osU0FBUyxvQkFBb0I7QUFDamIsU0FBUyxzQkFBc0I7QUFDL0IsU0FBUyxlQUFlO0FBRXhCLE9BQU8sbUJBQW1CO0FBSjFCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0saUJBQWlCLGNBQWMsUUFBUTtBQUU3QyxJQUFNLE9BQU8sUUFBUSxJQUFJLFFBQVE7QUFDakMsSUFBTSxPQUFPLFNBQVMsUUFBUSxJQUFJLFFBQVEsRUFBRSxLQUFLO0FBRWpELElBQU8sc0JBQVEsYUFBYTtBQUFBO0FBQUEsRUFFeEIsUUFBUTtBQUFBO0FBQUEsSUFFSjtBQUFBLElBQ0E7QUFBQSxJQUNBLFlBQVk7QUFBQSxFQUNoQjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsR0FBRztBQUFBLE1BQ0gsR0FBRyxFQUFFLFlBQVksUUFBUSxrQ0FBVyxPQUFPLEVBQUU7QUFBQSxJQUNqRDtBQUFBLEVBQ0o7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNMLEdBQUcsZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSWQsU0FBUztBQUFBO0FBQUEsTUFHVCxTQUFTLFFBQVEsa0NBQVcsbUJBQW1CO0FBQUE7QUFBQTtBQUFBLE1BSS9DLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQVFaLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFnQlosWUFBWSxDQUFDO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLFNBQVMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVlWLFNBQVMsQ0FBQyxlQUFlLFdBQVcsUUFBUSxrQkFBa0I7QUFBQSxFQUNsRTtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
