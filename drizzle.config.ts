const config = {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: "postgresql://postgres:password@localhost/solaceassignment",
  },
  verbose: true,
  strict: true,
};

export default config;
