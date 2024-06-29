import { App } from "@/app";

(() => {
  const app = new App();
  try {
    app.listen();
  } catch (error: any) {
    console.log(error.message);
  }
})();