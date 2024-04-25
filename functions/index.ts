type Env = {
  PACKAGES: D1Database;
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
  const configs = Object.keys(config.repos).flatMap((repo) => {
    return config.repos[repo as keyof typeof config.repos].flatMap((arch) => {
      return config.branches.map((branch) => {
        return {
          branch,
          repo,
          arch,
          url: `https://raw.githubusercontent.com/manjaro-contrib/trace-mirror-dbs/main/db/${branch}_${repo}_${arch}.json`,
        };
      });
    });
  });
  const contents = await Promise.all(
    configs.map(async (config) => {
      const result = await fetch(config.url, {
        cf: {
          // don't refetch all dbs at the same time (between 10 and 20 minutes)
          cacheTtl: 60 * 10 + 60 * 10 * Math.random(),
        },
      });
      const meta = await result.cf;
      const content = await result.json<
        {
          name: string;
          version: string;
          desc: string;
          builddate: string;
        }[]
      >();
      return {
        ...config,
        content,
        meta,
      };
    })
  );
  return Response.json(
    contents
      .map(({ content, meta, branch, repo, arch }) => ({
        branch,
        repo,
        arch,
        length: content.length,
        meta,
      }))
      .sort((a, b) => a.branch.localeCompare(b.branch))
      .sort((a, b) => a.repo.localeCompare(b.repo))
      .sort((a, b) => a.arch.localeCompare(b.arch)),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
};
