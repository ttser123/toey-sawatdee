import { useState, useMemo } from 'react';
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
    const [error, setError] = useState<string | null>(null);

    // Derived Result Configuration
    const result = useMemo<SolverResult | null>(() => {
        if (!selectedSubnet) return null;

        const primarySubnet = selectedSubnet;
        const alternatives = foundSubnets.filter(s => s !== selectedSubnet);
        
        let config = '';
        let path = '';
        let instructions = '';

        if (service === 'wsl') {
            config = `[wsl2]\nnetworkingMode=mirrored\n# Suggested: ${primarySubnet}`;
            path = '%USERPROFILE%\\.wslconfig';
            instructions = 'Run "wsl --shutdown" in PowerShell, then restart your terminal.';
        } else if (service === 'docker') {
            const dockerConfig = {
                "default-address-pools": [
                    { 
                        "base": primarySubnet, 
                        "size": targetCidr 
                    }
                ]
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

        return { 
            safeSubnet: primarySubnet, 
            candidates: alternatives,
            config, 
            path, 
            instructions 
        };
    }, [service, os, targetCidr, selectedSubnet, foundSubnets]);

    const handleSetService = (s: Service) => {
        setService(s);
        if (s === 'wsl' && os !== 'windows') {
            setOs('windows');
        }
    };

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
            // Auto-select the first one
            setSelectedSubnet(candidates[0]);
        } else {
            setError("CRITICAL: Network exhaustion detected. Consult Admin.");
        }
    };

    const handleSelectSubnet = (subnet: string) => {
        setSelectedSubnet(subnet);
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
        setService: handleSetService,
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
