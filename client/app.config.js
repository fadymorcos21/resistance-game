import "dotenv/config";

export default {
  expo: {
    name: "Resistance",
    slug: "resistance",
    version: "1.0.0",
    extra: {
      SOCKET_SERVER: process.env.SOCKET_SERVER,
    },
  },
};
