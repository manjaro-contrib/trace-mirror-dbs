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
  const params = new URL(context.request.url).searchParams;
  const arch = params.get("arch");
  const branch = params.get("branch");
  const repo = params.get("repo");

  if (!arch || !branch || !repo) {
    return Response.json("Missing parameters", { status: 400 });
  }

  const url = `https://raw.githubusercontent.com/manjaro-contrib/trace-mirror-dbs/main/db/${branch}_${repo}_${arch}.json`;
  const result = await fetch(url, {
    cf: {
      // don't refetch all dbs at the same time (between 10 and 20 minutes)
      cacheTtl: 60 * 10 + 60 * 10 * Math.random(),
    },
  });
  if (!result.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const content = await result.json<
    {
      name: string;
      version: string;
      desc: string;
      builddate: string;
    }[]
  >();

  // drop all packages for this db
  await context.env.PACKAGES.prepare(
    "DELETE FROM packages WHERE arch = ? AND branch = ? AND repo = ?;"
  )
    .bind(arch, branch, repo)
    .run();

  const pkgNames = content.map((pkg) => pkg.name);
  // list duplicates
  const duplicates = pkgNames.filter(
    (name, index) => pkgNames.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    throw new Error(`Duplicates found: ${duplicates.join(", ")}`);
  }

  await context.env.PACKAGES.batch([
    // add all packages
    ...content.map((pkg) =>
      context.env.PACKAGES.prepare(
        "INSERT INTO packages (name, arch, branch, repo, version, description, builddate) VALUES (?, ?, ?, ?, ?, ?, ?);"
      ).bind(
        pkg.name,
        arch,
        branch,
        repo,
        pkg.version ?? "",
        pkg.desc ?? "",
        pkg.builddate ?? ""
      )
    ),
  ]);

  return Response.json(
    {
      success: true,
    },
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
};
