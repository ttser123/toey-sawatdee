import { describe, it, expect } from 'vitest';
import {
    isValidIPv4,
    ipToLong,
    longToIp,
    getRange,
    isOverlap,
    mergeOccupiedRanges,
    generateSafeSubnets,
} from '@/lib/network-utils';
import type { IPRange, SolverOptions } from '@/lib/network-utils';

// ---------------------------------------------------------------------------
// isValidIPv4
// ---------------------------------------------------------------------------
describe('isValidIPv4', () => {
    it('accepts standard private-range IPs', () => {
        expect(isValidIPv4('192.168.1.1')).toBe(true);
        expect(isValidIPv4('10.0.0.0')).toBe(true);
        expect(isValidIPv4('172.16.0.1')).toBe(true);
    });

    it('accepts boundary octets 0 and 255', () => {
        expect(isValidIPv4('0.0.0.0')).toBe(true);
        expect(isValidIPv4('255.255.255.255')).toBe(true);
    });

    it('rejects alphabetic characters in octets', () => {
        expect(isValidIPv4('10.0.0.abc')).toBe(false);
        expect(isValidIPv4('hello.world.foo.bar')).toBe(false);
    });

    it('rejects octets outside 0-255', () => {
        expect(isValidIPv4('999.999.999.999')).toBe(false);
        expect(isValidIPv4('256.0.0.1')).toBe(false);
        expect(isValidIPv4('0.0.0.-1')).toBe(false);
    });

    it('rejects wrong number of octets', () => {
        expect(isValidIPv4('10.0.0')).toBe(false);
        expect(isValidIPv4('10.0.0.0.0')).toBe(false);
        expect(isValidIPv4('')).toBe(false);
    });

    it('rejects leading zeros (octal ambiguity)', () => {
        expect(isValidIPv4('010.0.0.1')).toBe(false);
        expect(isValidIPv4('192.168.01.1')).toBe(false);
    });

    it('rejects whitespace-padded octets', () => {
        expect(isValidIPv4(' 10.0.0.1')).toBe(false);
        expect(isValidIPv4('10.0.0.1 ')).toBe(false);
        expect(isValidIPv4('10. 0.0.1')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// ipToLong / longToIp  (round-trip)
// ---------------------------------------------------------------------------
describe('ipToLong & longToIp', () => {
    const cases: [string, number][] = [
        ['0.0.0.0', 0],
        ['10.0.0.1', 167772161],
        ['192.168.1.1', 3232235777],
        ['255.255.255.255', 4294967295],
    ];

    it.each(cases)('ipToLong("%s") === %d', (ip, expected) => {
        expect(ipToLong(ip)).toBe(expected);
    });

    it.each(cases)('longToIp(%d) === "%s"', (ip, long) => {
        expect(longToIp(long)).toBe(ip);
    });

    it('round-trips arbitrary IPs', () => {
        const ip = '172.31.255.254';
        expect(longToIp(ipToLong(ip))).toBe(ip);
    });

    it('returns 0 for malformed input', () => {
        expect(ipToLong('garbage')).toBe(0);
        expect(ipToLong('1.2.3')).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// getRange
// ---------------------------------------------------------------------------
describe('getRange', () => {
    it('computes /24 range correctly', () => {
        const [start, end] = getRange('10.0.0.0', 24);
        expect(longToIp(start)).toBe('10.0.0.0');
        expect(longToIp(end)).toBe('10.0.0.255');
    });

    it('computes /16 range correctly', () => {
        const [start, end] = getRange('172.16.0.0', 16);
        expect(longToIp(start)).toBe('172.16.0.0');
        expect(longToIp(end)).toBe('172.16.255.255');
    });

    it('computes /32 (host route) range', () => {
        const [start, end] = getRange('1.2.3.4', 32);
        expect(start).toBe(end);
        expect(longToIp(start)).toBe('1.2.3.4');
    });

    it('aligns non-boundary IPs to network address', () => {
        const [start] = getRange('10.0.0.50', 24);
        expect(longToIp(start)).toBe('10.0.0.0');
    });
});

// ---------------------------------------------------------------------------
// isOverlap
// ---------------------------------------------------------------------------
describe('isOverlap', () => {
    it('detects full overlap', () => {
        expect(isOverlap(100, 200, 100, 200)).toBe(true);
    });

    it('detects partial overlap', () => {
        expect(isOverlap(100, 200, 150, 250)).toBe(true);
    });

    it('detects edge-touching overlap', () => {
        expect(isOverlap(100, 200, 200, 300)).toBe(true);
    });

    it('returns false for non-overlapping ranges', () => {
        expect(isOverlap(100, 200, 201, 300)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// mergeOccupiedRanges
// ---------------------------------------------------------------------------
describe('mergeOccupiedRanges', () => {
    it('returns empty for empty input', () => {
        expect(mergeOccupiedRanges([])).toEqual([]);
    });

    it('passes through a single range unchanged', () => {
        const ranges: IPRange[] = [[100, 200]];
        expect(mergeOccupiedRanges(ranges)).toEqual([[100, 200]]);
    });

    it('merges overlapping ranges', () => {
        const ranges: IPRange[] = [[100, 200], [150, 300]];
        expect(mergeOccupiedRanges(ranges)).toEqual([[100, 300]]);
    });

    it('merges adjacent ranges (gap of 1)', () => {
        const ranges: IPRange[] = [[100, 200], [201, 300]];
        expect(mergeOccupiedRanges(ranges)).toEqual([[100, 300]]);
    });

    it('keeps non-adjacent ranges separate', () => {
        const ranges: IPRange[] = [[100, 200], [300, 400]];
        expect(mergeOccupiedRanges(ranges)).toEqual([[100, 200], [300, 400]]);
    });

    it('handles unsorted input gracefully', () => {
        const ranges: IPRange[] = [[300, 400], [100, 200], [150, 350]];
        expect(mergeOccupiedRanges(ranges)).toEqual([[100, 400]]);
    });
});

// ---------------------------------------------------------------------------
// generateSafeSubnets (Generator)
// ---------------------------------------------------------------------------
describe('generateSafeSubnets', () => {
    it('yields all slots in an empty search space', () => {
        const opts: SolverOptions = {
            targetCidr: 24,
            searchSpaces: [getRange('10.0.0.0', 16)],
            occupied: [],
        };

        const results = [...generateSafeSubnets(opts)];
        // /16 contains 256 contiguous /24s
        expect(results).toHaveLength(256);
        expect(longToIp(results[0])).toBe('10.0.0.0');
        expect(longToIp(results[255])).toBe('10.0.255.0');
    });

    it('skips over an occupied block', () => {
        const opts: SolverOptions = {
            targetCidr: 24,
            searchSpaces: [getRange('10.0.0.0', 22)], // 4 slots: .0, .1, .2, .3
            occupied: [getRange('10.0.1.0', 24)],      // occupy slot 1
        };

        const results = [...generateSafeSubnets(opts)].map(longToIp);
        expect(results).not.toContain('10.0.1.0');
        expect(results).toContain('10.0.0.0');
        expect(results).toContain('10.0.2.0');
        expect(results).toContain('10.0.3.0');
    });

    it('returns nothing when search space is fully occupied', () => {
        const space = getRange('10.0.0.0', 24);
        const opts: SolverOptions = {
            targetCidr: 24,
            searchSpaces: [space],
            occupied: [space],
        };

        const results = [...generateSafeSubnets(opts)];
        expect(results).toHaveLength(0);
    });

    it('handles multiple search spaces', () => {
        const opts: SolverOptions = {
            targetCidr: 24,
            searchSpaces: [
                getRange('10.0.0.0', 24),
                getRange('10.1.0.0', 24),
            ],
            occupied: [],
        };

        const results = [...generateSafeSubnets(opts)].map(longToIp);
        expect(results).toEqual(['10.0.0.0', '10.1.0.0']);
    });
});
