/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "reticket",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },

  async run() {
    const vpc = new sst.aws.Vpc("web-vpc");
    const cluster = new sst.aws.Cluster("web-cluster", { vpc });

    new sst.aws.Service("web-service", {
      cluster,
      memory: "0.5 GB",
      cpu: "0.25 vCPU",
      loadBalancer: {
        ports: [{ listen: "80/http", forward: "3000/http" }],
      },
      dev: {
        command: "npm run dev",
      },
    });
  }
});
