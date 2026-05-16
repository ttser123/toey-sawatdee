/**
 * UTILS: IP CALCULATION (PURE LOGIC)
 */

export const ipToLong = (ip: string): number => {
    const octets = ip.split('.');
    if (octets.length !== 4) return 0;
    return (
        (parseInt(octets[0], 10) << 24) |
        (parseInt(octets[1], 10) << 16) |
        (parseInt(octets[2], 10) << 8) |
        parseInt(octets[3], 10)
    ) >>> 0;
};

export const longToIp = (long: number): string => {
    return [
        (long >>> 24) & 0xff,
        (long >>> 16) & 0xff,
        (long >>> 8) & 0xff,
        long & 0xff
    ].join('.');
};

export const getRange = (ip: string, cidr: number): [number, number] => {
    const ipLong = ipToLong(ip);
    const mask = ((-1 << (32 - cidr)) >>> 0);
    const start = (ipLong & mask) >>> 0;
    const end = (start + (Math.pow(2, 32 - cidr) - 1)) >>> 0;
    return [start, end];
};

export const isOverlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
    return start1 <= end2 && end1 >= start2;
};

export const isValidIPv4 = (ip: string): boolean => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        const num = Number(part);
        if (isNaN(num) || part.trim() === '') return false;
        if (num < 0 || num > 255) return false;
        if (num.toString() !== part) return false;
        return true;
    });
};

/**
 * ADVANCED IPAM LOGIC: GENERATOR-BASED SUBNET SOLVER
 */

export type IPRange = [number, number];

export interface SolverOptions {
    targetCidr: number;
    searchSpaces: IPRange[];
    occupied: IPRange[];
}

/**
 * Merges overlapping or adjacent IP ranges into sorted "islands".
 * Complexity: O(N log N) due to sorting.
 */
export const mergeOccupiedRanges = (ranges: IPRange[]): IPRange[] => {
    if (ranges.length === 0) return [];
    
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    const merged: IPRange[] = [];
    
    let current = [...sorted[0]] as IPRange;
    
    for (let i = 1; i < sorted.length; i++) {
        const [nextStart, nextEnd] = sorted[i];
        // If overlapping or adjacent (gap of 0)
        // We use unsigned comparison logic here
        if (nextStart <= (current[1] + 1) >>> 0) {
            current[1] = Math.max(current[1], nextEnd) >>> 0;
        } else {
            merged.push(current);
            current = [nextStart, nextEnd];
        }
    }
    merged.push(current);
    
    return merged;
};

/**
 * GENERATOR: Yields safe subnets one by one.
 * Uses bitwise boundary jumping for O(Islands) complexity.
 * Zero memory overhead for large search spaces.
 */
export function* generateSafeSubnets(options: SolverOptions): Generator<number, void, unknown> {
    const { targetCidr, searchSpaces, occupied } = options;
    
    // Calculate target size and boundary mask
    const targetSize = Math.pow(2, 32 - targetCidr);
    const boundaryMask = ((-1 << (32 - targetCidr)) >>> 0);

    // Filter out invalid occupied ranges and merge them
    const mergedIslands = mergeOccupiedRanges(occupied);

    for (const [spaceStart, spaceEnd] of searchSpaces) {
        // Align candidateStart to the first valid boundary in this space
        let candidateStart = (spaceStart + targetSize - 1) & boundaryMask >>> 0;
        if (candidateStart < spaceStart) {
            candidateStart = (candidateStart + targetSize) >>> 0;
        }

        for (const [occStart, occEnd] of mergedIslands) {
            // Pruning: Island is after current search space
            if (occStart > spaceEnd) break;
            // Pruning: Island is before current search space
            if (occEnd < spaceStart) continue;

            // Yield candidates before this island
            while (occStart > candidateStart && (occStart - candidateStart) >= targetSize) {
                if ((candidateStart + targetSize - 1) >>> 0 <= spaceEnd) {
                    yield candidateStart;
                }
                candidateStart = (candidateStart + targetSize) >>> 0;
            }

            // Jump to the next valid boundary after this island
            candidateStart = ((occEnd + 1) + targetSize - 1) & boundaryMask >>> 0;
            if (candidateStart <= occEnd) {
                candidateStart = (candidateStart + targetSize) >>> 0;
            }
        }

        // Final candidates after all islands in this space
        while (candidateStart <= spaceEnd && (spaceEnd - candidateStart + 1) >= targetSize) {
            yield candidateStart;
            candidateStart = (candidateStart + targetSize) >>> 0;
        }
    }
}
