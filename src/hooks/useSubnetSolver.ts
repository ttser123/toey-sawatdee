import { useState, useEffect } from 'react';
import { 
    ipToLong, 
    longToIp, 
    getRange, 
    isValidIPv4, 
    generateSafeSubnets,
    IPRange 
} from '@/lib/network-utils';

type NetworkInterface = {
    id: string;
    ip: string;
    cidr: number;
};

type Service = 'docker' | 'wsl';
type OS = 'windows' | 'mac' | 'linux';

type SolverResult = {
    safeSubnet: string;
    candidates: string[];
    config: string;
    path: string;
    instructions: string;
};

export function useSubnetSolver() {
    const [networks, setNetworks] = useState<NetworkInterface[]>([
        { id: crypto.randomUUID(), ip: '', cidr: 24 }
    ]);
    const [service, setService] = useState<Service>('docker');
    const [os, setOs] = useState<OS>('windows');
    const [targetCidr, setTargetCidr] = useState<number>(20);
    const [candidateLimit, setCandidateLimit] = useState<number>(5);
    const [foundSubnets, setFoundSubnets] = useState<string[]>([]);
    const [selectedSubnet, setSelectedSubnet] = useState<string | null>(null);
    const [result, setResult] = useState<SolverResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Reactive constraint: WSL only runs on Windows
    useEffect(() => {
        if (service === 'wsl' && os !== 'windows') {
            setOs('windows');
        }
    }, [service, os]);

    const addInterface = () => {
        setNetworks([...networks, { id: crypto.randomUUID(), ip: '', cidr: 24 }]);
        setError(null);
    };

    const removeInterface = (id: string) => {
        if (networks.length > 1) {
            setNetworks(networks.filter(n => n.id !== id));
            setError(null);
        }
    };

    const updateInterface = (id: string, field: keyof NetworkInterface, value: string | number) => {
        setNetworks(networks.map(n => n.id === id ? { ...n, [field]: value } : n));
        if (field === 'ip') setError(null);
    };

    const solve = () => {
        setError(null);
        setResult(null);
        setFoundSubnets([]);
        setSelectedSubnet(null);

        const invalidNetworks = networks.filter(n => n.ip.trim() !== '' && !isValidIPv4(n.ip));
        if (invalidNetworks.length > 0) {
            setError("SYSTEM HALT: Invalid IPv4 format detected.");
            return;
        }

        const validNetworks = networks.filter(n => n.ip.trim() !== '');
        if (validNetworks.length === 0) {
            setError("SYSTEM WARNING: Awaiting valid network input.");
            return;
        }

        const userRanges = validNetworks.map(n => getRange(n.ip, n.cidr));

        const searchSpaces: IPRange[] = [
            [ipToLong('172.16.0.0'), ipToLong('172.31.255.255')],
            [ipToLong('10.0.0.0'), ipToLong('10.255.255.255')],
            [ipToLong('192.168.0.0'), ipToLong('192.168.255.255')]
        ];

        const solver = generateSafeSubnets({
            targetCidr,
            searchSpaces,
            occupied: userRanges
        });

        const candidates: string[] = [];
        for (let i = 0; i < candidateLimit; i++) {
            const { value, done } = solver.next();
            if (done) break;
            candidates.push(`${longToIp(value)}/${targetCidr}`);
        }

        if (candidates.length > 0) {
            setFoundSubnets(candidates);
            // Auto-select the first one by default but allow user to change
            handleSelectSubnet(candidates[0], candidates);
        } else {
            setError("CRITICAL: Network exhaustion detected. Consult Admin.");
        }
    };

    const handleSelectSubnet = (subnet: string, allCandidates: string[] = foundSubnets) => {
        setSelectedSubnet(subnet);
        generateOutput(subnet, allCandidates.filter(s => s !== subnet));
    };

    const generateOutput = (primarySubnet: string, alternatives: string[]) => {
        const [baseIp] = primarySubnet.split('/');
        const octets = baseIp.split('.');
        const bip = `${octets[0]}.${octets[1]}.${octets[2]}.1/${targetCidr}`;
        const poolBase = `${octets[0]}.${octets[1]}.0.0/16`;

        let config = '';
        let path = '';
        let instructions = '';

        if (service === 'wsl') {
            config = `[wsl2]\nnetworkingMode=mirrored\n# Suggested: ${primarySubnet}`;
            path = '%USERPROFILE%\\.wslconfig';
            instructions = 'Run "wsl --shutdown" in PowerShell, then restart your terminal.';
        } else if (service === 'docker') {
            const dockerConfig = {
                "bip": bip,
                "default-address-pools": [{ "base": poolBase, "size": 24 }]
            };
            config = JSON.stringify(dockerConfig, null, 4);
            
            switch (os) {
                case 'windows':
                    path = '%USERPROFILE%\\.docker\\daemon.json';
                    instructions = 'Restart Docker Desktop app after saving the file.';
                    break;
                case 'mac':
                    path = '~/.docker/daemon.json (Or UI: Settings -> Docker Engine)';
                    instructions = 'Click "Apply & Restart" in Docker Desktop, or restart the app completely.';
                    break;
                case 'linux':
                    path = '/etc/docker/daemon.json';
                    instructions = 'Run "sudo systemctl restart docker" in terminal.';
                    break;
            }
        }

        setResult({ 
            safeSubnet: primarySubnet, 
            candidates: alternatives,
            config, 
            path, 
            instructions 
        });
    };

    return {
        networks,
        service,
        os,
        targetCidr,
        candidateLimit,
        foundSubnets,
        selectedSubnet,
        result,
        error,
        setService,
        setOs,
        setTargetCidr,
        setCandidateLimit,
        addInterface,
        removeInterface,
        updateInterface,
        solve,
        handleSelectSubnet
    };
}
