type Env = {
  KV: KVNamespace;
};

const config = {
  repos: {
    core: ["x86_64", "aarch64"] as const,
    extra: ["x86_64", "aarch64"] as const,
    multilib: ["x86_64"] as const,
  },
  branches: ["unstable", "testing", "stable"] as const,
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const urls = Object.keys(config.repos).flatMap((repo) => {
    return config.repos[repo as keyof typeof config.repos].flatMap((arch) => {
      return config.branches.map((branch) => {
        return {
          name: `${branch}_${repo}_${arch}`,
          url: `https://raw.githubusercontent.com/manjaro-contrib/trace-mirror-dbs/main/db/${branch}_${repo}_${arch}.json`,
        };
      });
    });
  });
  return Response.json(urls, {
    headers: {
      "content-type": "application/json",
    },
  });
};
