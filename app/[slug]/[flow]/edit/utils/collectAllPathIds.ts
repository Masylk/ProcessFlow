import { Block } from "../../types";

export default function collectAllPathIds(
    path: { id: number; blocks: any[] },
    allPaths: { id: number; blocks: any[] }[]
  ): Set<number> {
    const visitedPathIds = new Set<number>();
    const queue: number[] = [path.id];

    while (queue.length > 0) {
      const currentPathId = queue.pop()!;
      if (visitedPathIds.has(currentPathId)) continue;
      visitedPathIds.add(currentPathId);

      // Find the path object by id
      const currentPath: { id: number; blocks: Block[] } | undefined =
        allPaths.find((p) => p.id === currentPathId);
      if (!currentPath) continue;

      for (const block of currentPath.blocks) {
        if (Array.isArray(block.child_paths)) {
          for (const child of block.child_paths) {
            if (child.path_id && !visitedPathIds.has(child.path_id)) {
              queue.push(child.path_id);
            }
          }
        }
      }
    }

    visitedPathIds.delete(path.id);
    return visitedPathIds;
  }