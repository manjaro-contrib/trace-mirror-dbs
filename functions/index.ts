type Env = {
  KV: KVNamespace;
};

const config = {
  repos: {
    core: ["x86_64", "aarch64"] as const,
    extra: ["x86_64", "aarch64"] as const,
    multilib: ["x86_64"] as const,
  },
  branches: ["unstable", "stable"] as const,
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const configs = Object.keys(config.repos).flatMap((repo) => {
    return config.repos[repo as keyof typeof config.repos].flatMap((arch) => {
      return config.branches.map((branch) => {
        return {
          name: `${branch}_${repo}_${arch}`,
          url: `https://raw.githubusercontent.com/manjaro-contrib/trace-mirror-dbs/main/db/${branch}_${repo}_${arch}.json`,
        };
      });
    });
  });
  const contents = await Promise.all(
    configs.map(async (config) => {
      const content = await (
        await fetch(config.url, {
          cf: {
            // don't refetch all dbs at the same time (between 0 and 10 minutes)
            cacheTtl: 60 * 10 * Math.random(),
          },
        })
      ).json<[]>();
      return {
        ...config,
        content,
      };
    })
  );
  return Response.json(contents.map(({ name, content }) => ({ name, length: content.length })), {
    headers: {
      "content-type": "application/json",
    },
  });
};
