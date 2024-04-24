import fs from 'fs/promises';

const update = async (repo: "core" | "extra" | "multilib", branch: "stable" | "testing" | "unstable", arch: "x86_64" | "aarch64") => {
  const files = await fs.readdir(`./repo/${branch}/${repo}/${arch}`)

  console.log({ files })
}

await update("core", "stable", "x86_64");